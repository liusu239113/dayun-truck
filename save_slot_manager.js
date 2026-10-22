/* =====================================================================
 * save/slot_manager.js —— 5 槽位本地读写 + 云端双写 + 重试队列
 * 严格复用《存档系统技术文档》§3/§5 SlotManager 设计：
 *   - 5 槽位（MAX_SLOTS=5），每槽 主文件 + .bak 备份 + .tmp 中间态
 *   - 安全写入（§5.3）：写 .tmp → 读回验证 JSON → 备份 .bak → 覆盖 → 删 .tmp
 *   - 内存缓存 memoryCache（§5.4 加载优先级：主文件 → .bak → 内存缓存）
 *   - 索引 index（§5.2）：槽位元信息
 *   - 云端双写（§3.3）：本地保存成功后标记云端脏数据，由云同步调度上传
 *     ※ 云存档 API 限制：上传每分钟 1 次（400001）、不允许并发（400007），
 *       故"立即双写"实现为"节流串行上传，同槽位只保留最新数据"（与文档
 *       重试队列的去重策略一致）。
 *   - 重试队列（§3.4）：最多 3 次，间隔 10 秒；400001 频率超限时推迟 61 秒
 *   - 云端恢复（§3.5）：启动时拉取云端存档，按 _version 比较，云新则覆盖本地
 *   - 本地后端：TapTap 环境走 tapfile:// 文件系统；普通浏览器走 localStorage
 * ===================================================================== */
(function (global) {
'use strict';
const SaveGameState = global.SaveGameState, CloudSave = global.CloudSave;

const MAX_SLOTS = 5;
const CLOUD_UPLOAD_INTERVAL = 60 * 1000;   /* 云存档 API：每分钟仅允许上传 1 次（400001） */
const RETRY_INTERVAL = 10 * 1000;          /* 文档 §3.4：重试间隔 10 秒 */
const RETRY_MAX = 3;                       /* 文档 §3.4：最大重试次数 3 */

/* —— 本地存储后端 —— */
const LS_PREFIX = 'didayun_slot_';         /* 浏览器 localStorage 后端 key 前缀 */
let useFs = false, dir = '';
function fpath(name) { return dir + '/' + name; }

function backendWrite(name, data, cb) {
  if (useFs) { CloudSave.fsWrite(fpath(name), data).then((r) => cb(r.ok)); return; }
  try { localStorage.setItem(LS_PREFIX + name, data); cb(true); } catch (e) { cb(false); }
}
function backendRead(name, cb) {
  if (useFs) { CloudSave.fsRead(fpath(name)).then((r) => cb(r.ok ? r.data : null)); return; }
  try { cb(localStorage.getItem(LS_PREFIX + name)); } catch (e) { cb(null); }
}
function backendUnlink(name, cb) {
  if (useFs) { CloudSave.fsUnlink(fpath(name)).then(() => cb && cb()); return; }
  try { localStorage.removeItem(LS_PREFIX + name); } catch (e) {} if (cb) cb();
}

/* 安全写入（§5.3）：tmp → 验证 → bak → 覆盖 → 删 tmp；验证失败降级直写 */
function safeWrite(slotId, json, cb) {
  const main = 'slot_' + slotId + '.json', tmp = main + '.tmp', bak = main + '.bak';
  backendWrite(tmp, json, () => {
    backendRead(tmp, (check) => {
      if (check === json) {
        backendRead(main, (old) => {
          const writeMain = () => backendWrite(main, json, (ok) => { backendUnlink(tmp, null); cb(ok); });
          if (old !== null && old !== undefined) backendWrite(bak, old, writeMain);
          else writeMain();
        });
      } else {
        backendWrite(main, json, (ok) => { backendUnlink(tmp, null); cb(ok); });
      }
    });
  });
}

const SlotManager = {
  MAX_SLOTS,
  memoryCache: {},        /* slotId → 主文件 json 字符串 */
  memoryBak: {},          /* slotId → 上一版 json（.bak 的内存镜像）*/
  index: { slots: {} },   /* 索引（§5.2）*/
  cloudUuid: {},          /* slotId → {uuid,fileId} 已有云存档句柄 */
  cloudSync: {},          /* slotId → {localVersion,cloudVersion,pending}（§3.6）*/
  cloudDirty: {},         /* slotId → {json,version} 待上传（同槽去重，只留最新）*/
  retryQueue: [],         /* {slotId,json,version,attempts,nextAt}（§3.4）*/
  lastUploadAt: 0,
  currentSlot: 1,
  restoring: false,       /* 云端恢复进行中（暂停上传调度）*/
  lastError: '',
};

/* —— 初始化：检测环境 → 建目录 → 读索引 → 预载全部槽位 → 旧存档迁移 —— */
SlotManager.init = function (cb) {
  CloudSave.detect();
  useFs = CloudSave.available;
  dir = useFs ? (CloudSave.env.USER_DATA_PATH + '/saves') : '';
  const step2 = () => {
    backendRead('index.json', (idx) => {
      if (idx) { try { SlotManager.index = JSON.parse(idx) || { slots: {} }; } catch (e) { SlotManager.index = { slots: {} }; } }
      if (!SlotManager.index.slots) SlotManager.index.slots = {};
      /* 恢复云端句柄：已有云存档的槽位继续 update，避免重复创建（400003） */
      for (let i = 1; i <= MAX_SLOTS; i++) {
        const m = SlotManager.index.slots[i];
        if (m && m.uuid) SlotManager.cloudUuid[i] = { uuid: m.uuid, fileId: m.fileId };
      }
      SlotManager.preloadAll(() => { SlotManager.migrateLegacy(cb); });
    });
  };
  if (useFs) CloudSave.fsMkdir(dir).then(step2); else step2();
};

/* 预载：主文件 → .bak（§5.4），填入内存缓存 */
SlotManager.preloadAll = function (cb) {
  let pending = MAX_SLOTS;
  const done = () => { if (--pending === 0 && cb) cb(); };
  for (let i = 1; i <= MAX_SLOTS; i++) {
    ((slotId) => {
      backendRead('slot_' + slotId + '.json', (json) => {
        if (json) { SlotManager.memoryCache[slotId] = json; done(); return; }
        backendRead('slot_' + slotId + '.json.bak', (bak) => {
          if (bak) {
            SlotManager.memoryBak[slotId] = bak;
            /* 主文件缺失但备份有效：用备份恢复主文件（文档 §2.2）*/
            backendWrite('slot_' + slotId + '.json', bak, () => { SlotManager.memoryCache[slotId] = bak; done(); });
          } else done();
        });
      });
    })(i);
  }
};

/* 旧存档迁移（§9）：检测单 key 旧档 → 迁入槽位 1 → 旧 key 重命名 .migrated */
SlotManager.migrateLegacy = function (cb) {
  let legacy = null;
  try { legacy = localStorage.getItem('didayun_truck_v1'); } catch (e) {}
  const hasSlot1 = !!SlotManager.memoryCache[1];
  if (!legacy || hasSlot1) {
    if (legacy && hasSlot1) { try { localStorage.removeItem('didayun_truck_v1'); localStorage.setItem('didayun_truck_v1.migrated', legacy); } catch (e) {} }
    if (cb) cb();
    return;
  }
  const data = (() => { try { return SaveGameState.MigrateOldSave(legacy); } catch (e) { return null; } })();
  if (!data) { if (cb) cb(); return; }
  SlotManager.saveToSlot(1, data, () => {
    try { localStorage.removeItem('didayun_truck_v1'); localStorage.setItem('didayun_truck_v1.migrated', legacy); } catch (e) {}
    if (cb) cb();
  });
};

/* —— 保存（§2.1 ④）：序列化 → 安全写 → 内存缓存 → 索引 → 云端双写 —— */
SlotManager.saveToSlot = function (slotId, saveData, cb) {
  slotId = slotId || SlotManager.currentSlot;
  const json = SaveGameState.Serialize(saveData);
  SlotManager.memoryBak[slotId] = SlotManager.memoryCache[slotId] || SlotManager.memoryBak[slotId];
  safeWrite(slotId, json, () => {
    SlotManager.memoryCache[slotId] = json;
    SlotManager.updateSlotMeta(slotId, saveData);
    /* index 落盘后才回调：存档码导入依赖这一时机——cb 触发即代表「新档 +
     * importedAt 保护标记」都已持久化，此后 reload 才安全。手机端 tapfile://
     * 是异步写，若回调早于 index 写完，reload 会掐断写入，标记丢失后下次
     * 启动云恢复就按版本被云端旧档覆盖（导入"无效"）。 */
    SlotManager.writeIndex(() => {
      SlotManager.markCloudDirty(slotId, json, saveData._version || 0);
      if (cb) cb(true);
    });
  });
};

SlotManager.updateSlotMeta = function (slotId, saveData) {
  const prev = SlotManager.index.slots[slotId] || {};
  const m = {
    isEmpty: false,
    name: 'slot_' + slotId,
    day: Math.floor((saveData.T || 0) / 24) + 1,
    level: saveData.level || 1,
    cash: saveData.cash || 0,
    rating: saveData.rating || 5,
    fleetN: (saveData.fleet && saveData.fleet.length) || 1,
    acceptedN: (saveData.accepted && saveData.accepted.length) || 0,
    timestamp: saveData._timestamp || Date.now(),
    version: saveData._version || 0,
  };
  /* 云端句柄与导入保护标记必须跨保存保留：丢 uuid 会让重启后误走
   * createArchive 触发 400003 重复创建；丢 importedAt 会让刚导入的档
   * 在下次启动时被云端旧档按版本覆盖 */
  if (prev.uuid) m.uuid = prev.uuid;
  if (prev.fileId) m.fileId = prev.fileId;
  if (prev.importedAt) m.importedAt = prev.importedAt;
  SlotManager.index.slots[slotId] = m;
};

SlotManager.writeIndex = function (cb) {
  try { backendWrite('index.json', JSON.stringify(SlotManager.index), () => { if (cb) cb(); }); } catch (e) { if (cb) cb(); }
};

/* —— 加载（§2.2/§5.4）：内存缓存（预载自 主文件→.bak）—— */
SlotManager.loadFromSlot = function (slotId) {
  return SlotManager.memoryCache[slotId || SlotManager.currentSlot] || null;
};

/* 崩溃恢复（§2.2 ②）：扫描全部槽位，选取 _version 最高的 */
SlotManager.findBestSlot = function () {
  let best = 0, bestV = -1;
  for (let i = 1; i <= MAX_SLOTS; i++) {
    const json = SlotManager.memoryCache[i];
    if (!json) continue;
    let v = 0;
    try { v = (JSON.parse(json)._version) || 0; } catch (e) {}
    if (v > bestV) { bestV = v; best = i; }
  }
  return best;
};

/* —— 删除：本地文件 + 备份 + 缓存 + 索引 + 云端存档 —— */
SlotManager.deleteSlot = function (slotId, cb) {
  backendUnlink('slot_' + slotId + '.json', () => {
    backendUnlink('slot_' + slotId + '.json.bak', () => {
      delete SlotManager.memoryCache[slotId];
      delete SlotManager.memoryBak[slotId];
      delete SlotManager.cloudDirty[slotId];
      SlotManager.index.slots[slotId] = { isEmpty: true };
      SlotManager.writeIndex();
      const h = SlotManager.cloudUuid[slotId];
      if (h && CloudSave.available) {
        CloudSave.remove(h.uuid).then(() => { delete SlotManager.cloudUuid[slotId]; if (cb) cb(); });
      } else { delete SlotManager.cloudUuid[slotId]; if (cb) cb(); }
    });
  });
};

SlotManager.getSlotList = function () {
  const out = [];
  for (let i = 1; i <= MAX_SLOTS; i++) out.push(Object.assign({ slotId: i }, SlotManager.index.slots[i] || { isEmpty: true }));
  return out;
};

/* —— 云端双写调度（§3.3 + §3.4）—— */
SlotManager.markCloudDirty = function (slotId, json, version) {
  SlotManager.cloudDirty[slotId] = { json, version };
  const st = SlotManager.cloudSync[slotId] || { cloudVersion: 0 };
  SlotManager.cloudSync[slotId] = { localVersion: version, cloudVersion: st.cloudVersion, pending: true };
};

/* 同步状态（§3.6）：全部槽位均已确认上传 → 视为已同步 */
SlotManager.isCloudSynced = function () {
  if (!CloudSave.available) return true; /* 无云端环境时不存在未同步概念 */
  for (const k in SlotManager.cloudDirty) return false;
  return SlotManager.retryQueue.length === 0;
};

SlotManager.cloudStatus = function () {
  if (!CloudSave.available) return { available: false, synced: true, pendingCount: 0, retrying: 0, lastError: SlotManager.lastError };
  const dirty = Object.keys(SlotManager.cloudDirty).length;
  return {
    available: true,
    synced: dirty === 0 && SlotManager.retryQueue.length === 0,
    pendingCount: dirty,
    retrying: SlotManager.retryQueue.length,
    lastUploadAt: SlotManager.lastUploadAt,
    lastError: SlotManager.lastError,
  };
};

/* 每帧/每 tick 驱动（由 ReliableSave.update 调用，now=Date.now()）*/
SlotManager.processCloudSync = function (now) {
  if (!CloudSave.available || SlotManager.restoring) return;
  now = now || Date.now();
  /* 优先处理重试队列（§3.4）*/
  const r = SlotManager.retryQueue[0];
  if (r) {
    if (now < r.nextAt) return;
    SlotManager.retryQueue.shift();
    SlotManager.uploadSlot(r.slotId, r.json, r.version, r.attempts + 1);
    return;
  }
  const keys = Object.keys(SlotManager.cloudDirty);
  if (!keys.length) return;
  if (now - SlotManager.lastUploadAt < CLOUD_UPLOAD_INTERVAL) return; /* 400001：每分钟 1 次 */
  keys.sort((a, b) => a - b);
  const slotId = +keys[0], d = SlotManager.cloudDirty[slotId];
  delete SlotManager.cloudDirty[slotId];
  SlotManager.uploadSlot(slotId, d.json, d.version, 0);
};

/* 上传单个槽位：有云端句柄 → updateArchive，否则 createArchive */
SlotManager.uploadSlot = function (slotId, json, version, attempts) {
  if (!CloudSave.available) return;
  let meta = { name: 'slot_' + slotId, summary: '', playtime: 0 };
  try {
    const o = JSON.parse(json);
    meta.playtime = Math.round(o.playSec || 0);
    meta.summary = '第' + (Math.floor((o.T || 0) / 24) + 1) + '天 · 现金' + (o.cash | 0) + ' · Lv' + (o.level || 1)
      + ' · ' + ((o.fleet && o.fleet.length) || 1) + '台车'
      + (o.accepted && o.accepted.length ? ' · ' + o.accepted.length + '单在途' : '');
  } catch (e) {}
  const h = SlotManager.cloudUuid[slotId];
  const op = h ? CloudSave.update(h.uuid, meta, fpath('slot_' + slotId + '.json'))
               : CloudSave.create(meta, fpath('slot_' + slotId + '.json'));
  op.then((r) => {
    if (r.ok) {
      SlotManager.cloudUuid[slotId] = { uuid: r.uuid, fileId: r.fileId };
      const m = SlotManager.index.slots[slotId] || {};
      m.uuid = r.uuid; if (r.fileId) m.fileId = r.fileId;
      if (m.importedAt) delete m.importedAt; /* 导入档已安全上云：解除本地优先保护 */
      SlotManager.index.slots[slotId] = m;
      SlotManager.writeIndex();
      const st = SlotManager.cloudSync[slotId] || { localVersion: version, cloudVersion: 0 };
      st.cloudVersion = version; st.pending = st.localVersion > version;
      SlotManager.cloudSync[slotId] = st;
      SlotManager.lastUploadAt = Date.now();
      SlotManager.lastError = '';
      SlotManager.processCloudSync(Date.now()); /* 节流窗口内通常直接返回；跨窗口时接续下一槽 */
    } else {
      const errno = CloudSave.errno(r.error);
      SlotManager.lastError = (errno !== null ? 'errno ' + errno : '上传失败');
      if (errno === 400002 && h) { /* 云端存档不存在：清句柄，降级为新建 */
        delete SlotManager.cloudUuid[slotId];
      }
      if (attempts + 1 < RETRY_MAX) {
        SlotManager.retryQueue = SlotManager.retryQueue.filter((x) => x.slotId !== slotId); /* 同槽去重，只留最新 */
        SlotManager.retryQueue.push({ slotId, json, version, attempts: attempts + 1, nextAt: Date.now() + (errno === 400001 ? 61 * 1000 : RETRY_INTERVAL) });
      } else {
        const st = SlotManager.cloudSync[slotId] || {};
        st.pending = false; SlotManager.cloudSync[slotId] = st; /* 放弃，等下次保存重新入队 */
      }
    }
  });
};

/* 手动立即上传（设置页「立即上传」按钮）：绕过节流窗口 */
SlotManager.forceCloudSync = function () {
  SlotManager.lastUploadAt = 0;
  SlotManager.processCloudSync(Date.now());
};

/* 手动上传指定槽位（设置页槽位列表）：不走自动队列，直接调度单槽上传。
 * 服务器仍限每分钟 1 次，超限（400001）由重试队列 61 秒后自动补传。 */
SlotManager.uploadSlotNow = function (slotId, cb) {
  if (!CloudSave.available) { if (cb) cb(false, '当前环境无云端'); return; }
  const json = SlotManager.memoryCache[slotId];
  if (!json) { if (cb) cb(false, '槽位为空'); return; }
  let v = 0;
  try { v = JSON.parse(json)._version || 0; } catch (e) {}
  SlotManager.markCloudDirty(slotId, json, v);
  delete SlotManager.cloudDirty[slotId]; /* 手动通道直传，不占自动队列 */
  SlotManager.uploadSlot(slotId, json, v, 0);
  if (cb) cb(true);
};

/* —— 云端恢复（§3.5）：启动时拉取云端，_version 高者胜 ——
 * 看门狗：云端列表/下载无响应时 20 秒后强制结束，游戏用本地存档照常进入 */
SlotManager.restoreFromCloud = function (cb) {
  if (!CloudSave.available) { if (cb) cb(false); return; }
  if (SlotManager.restoring) { if (cb) cb(false); return; }
  SlotManager.restoring = true;
  let finished = false;
  const finish = (ok) => {
    if (finished) return; /* 完成守卫：正常结束与看门狗只允许触发一次 */
    finished = true;
    SlotManager.restoring = false;
    SlotManager.writeIndex();
    if (cb) cb(ok);
  };
  const watchdog = setTimeout(() => {
    SlotManager.lastError = '云端恢复超时，已改用本地存档';
    finish(true);
  }, 20 * 1000);
  CloudSave.list().then((r) => {
    if (finished) return;
    if (!r.ok) {
      clearTimeout(watchdog);
      SlotManager.lastError = '获取存档列表失败';
      finish(false);
      return;
    }
    const mine = [];
    (r.saves || []).forEach((s) => {
      const m = /^slot_([1-5])$/.exec(s && s.name);
      if (m && s.uuid) mine.push({ slotId: +m[1], uuid: s.uuid, fileId: s.fileId });
    });
    if (!mine.length) { clearTimeout(watchdog); finish(true); return; }
    let pending = mine.length;
    const done = () => { clearTimeout(watchdog); finish(true); };
    mine.forEach((a) => {
      const target = fpath('slot_' + a.slotId + '.cloud.tmp');
      CloudSave.download(a.uuid, a.fileId, target).then((d) => {
        if (finished) return;
        if (!d.ok) { if (--pending === 0) done(); return; }
        CloudSave.fsRead(target).then((f) => {
          if (finished) return;
          CloudSave.fsUnlink(target);
          if (!f.ok || !f.data) { if (--pending === 0) done(); return; }
          /* 始终收养云端句柄：后续保存走 update，避免重复创建（400003）*/
          SlotManager.cloudUuid[a.slotId] = { uuid: a.uuid, fileId: a.fileId };
          /* 手动导入保护（importedAt）：玩家刚导入的档以本地为准，云端较新也不覆盖；
           * 同时把本地档排入待上传队列，进游戏后自动推上云端，成功后解除保护
           * （见 uploadSlot）；上传前若再次启动，标记仍在本地，导入档不会被覆盖 */
          const lm = SlotManager.index.slots[a.slotId];
          if (lm && lm.importedAt) {
            const ljson = SlotManager.memoryCache[a.slotId];
            if (ljson) {
              let lv = 0;
              try { lv = (JSON.parse(ljson)._version) || 0; } catch (e) {}
              SlotManager.markCloudDirty(a.slotId, ljson, lv);
            }
            if (--pending === 0) done(); return;
          }
          let cloudObj = null, cloudV = 0;
          try { cloudObj = JSON.parse(f.data); cloudV = (cloudObj && cloudObj._version) || 0; } catch (e) {}
          let localV = 0;
          const lj = SlotManager.memoryCache[a.slotId];
          if (lj) { try { localV = (JSON.parse(lj)._version) || 0; } catch (e) {} }
          if (cloudObj && cloudV > localV) {
            /* 云端较新 → 覆盖本地（版本比较策略，§3.5）*/
            safeWrite(a.slotId, f.data, () => {
              SlotManager.memoryCache[a.slotId] = f.data;
              const meta = SlotManager.index.slots[a.slotId] || {};
              meta.isEmpty = false; meta.version = cloudV;
              meta.day = Math.floor((cloudObj.T || 0) / 24) + 1;
              meta.level = cloudObj.level || 1; meta.cash = cloudObj.cash || 0;
              meta.fleetN = (cloudObj.fleet && cloudObj.fleet.length) || 1;
              meta.acceptedN = (cloudObj.accepted && cloudObj.accepted.length) || 0;
              SlotManager.index.slots[a.slotId] = meta;
              if (--pending === 0) done();
            });
          } else {
            /* 本地较新 → 保留本地（下次保存时云端被更新覆盖）*/
            if (--pending === 0) done();
          }
        });
      });
    });
  });
};

/* —— 手动从云端恢复单个槽位（设置页槽位列表）——
 * 与启动自动恢复（§3.5 云新才覆盖）不同：用户明确点了恢复，以云端为准，
 * 即便本地较新也覆盖（相当于回滚到云端版本）；恢复后收养云端 uuid 走 update。 */
SlotManager.restoreSlotFromCloud = function (slotId, cb) {
  if (!CloudSave.available) { if (cb) cb(false, '当前环境无云端'); return; }
  SlotManager.restoring = true; /* 暂停上传调度，避免恢复期间旧脏数据回传 */
  let finished = false;
  const finish = (ok, msg) => {
    if (finished) return;
    finished = true;
    SlotManager.restoring = false;
    SlotManager.writeIndex();
    if (cb) cb(ok, msg);
  };
  /* 看门狗：list→download→read 各在串行队列内有 10 秒超时，这里兜底 35 秒 */
  const watchdog = setTimeout(() => finish(false, '云端恢复超时'), 35 * 1000);
  const done = (ok, msg) => { clearTimeout(watchdog); finish(ok, msg); };
  CloudSave.list().then((r) => {
    if (finished) return;
    if (!r.ok) return done(false, '获取存档列表失败');
    let hit = null;
    (r.saves || []).forEach((s) => {
      const m = /^slot_([1-5])$/.exec(s && s.name);
      if (m && +m[1] === slotId && s.uuid) hit = { uuid: s.uuid, fileId: s.fileId };
    });
    if (!hit) return done(false, '云端没有该槽位的存档');
    const target = fpath('slot_' + slotId + '.cloud.tmp');
    CloudSave.download(hit.uuid, hit.fileId, target).then((d) => {
      if (finished) return;
      if (!d.ok) return done(false, '下载云端存档失败');
      CloudSave.fsRead(target).then((f) => {
        if (finished) return;
        CloudSave.fsUnlink(target);
        if (!f.ok || !f.data) return done(false, '读取云端存档失败');
        SlotManager.cloudUuid[slotId] = hit;
        delete SlotManager.cloudDirty[slotId]; /* 丢弃恢复前的待上传数据 */
        let cloudObj = null, cloudV = 0;
        try { cloudObj = JSON.parse(f.data); cloudV = (cloudObj && cloudObj._version) || 0; } catch (e) {}
        safeWrite(slotId, f.data, () => {
          SlotManager.memoryCache[slotId] = f.data;
          const meta = SlotManager.index.slots[slotId] || {};
          if (cloudObj) {
            meta.isEmpty = false; meta.version = cloudV;
            meta.day = Math.floor((cloudObj.T || 0) / 24) + 1;
            meta.level = cloudObj.level || 1; meta.cash = cloudObj.cash || 0;
            meta.fleetN = (cloudObj.fleet && cloudObj.fleet.length) || 1;
            meta.acceptedN = (cloudObj.accepted && cloudObj.accepted.length) || 0;
            meta.timestamp = cloudObj._timestamp || Date.now();
          }
          SlotManager.index.slots[slotId] = meta;
          SlotManager.cloudSync[slotId] = { localVersion: cloudV, cloudVersion: cloudV, pending: false };
          done(true);
        });
      });
    });
  });
};

global.SlotManager = SlotManager;
})(typeof window !== 'undefined' ? window : globalThis);
