/**
 * lamps-progress-sync.js
 * Lamps 平台存档同步（本地 localStorage 为主库，平台为异地备份）
 *
 * 依赖：先加载 game-progress-bridge.js、game-progress-platform.js
 * 行为：
 *   1) 启动时若本地没有任何本游戏存档 → 从平台拉一次，写回本地，再放行游戏脚本
 *   2) 本地已有存档 → 直接放行，不联网
 *   3) 放行后开始单向同步：本地变化 → 节流推送到平台
 *   4) 平台不可用（本地调试/非 Lamps 环境）→ 全程静默降级为纯本地
 */
(function (global) {
  "use strict";

  var CFG = /*__LAMPS_CFG__*/ {
    name: "dayun",
    prefixes: ["didayun"],
    saveKeys: ["didayun_truck_v1"],
    deferSrc: "./game-main.js",
    deferType: "",
    deferCrossorigin: false,
    timeoutMs: 5000,
    intervalMs: 8000,
    maxBytes: 900000
  };

  var TAG = "[LampsProgress:" + CFG.name + "]";
  var BOOT_FLAG = "__lamps_progress_boot";
  var DENY = /^(__lamps|__HOORAH|AEGIS_ID|hoorah)/;
  var booted = false;
  var syncEnabled = false;
  var dirty = false;
  var pushing = false;
  var everHadData = false;
  var lastPushedJson = "";
  var lastSeenJson = "";
  var restoredCount = 0;

  function warn() {
    try { console.warn.apply(console, [TAG].concat([].slice.call(arguments))); } catch (e) {}
  }
  function info() {
    try { console.info.apply(console, [TAG].concat([].slice.call(arguments))); } catch (e) {}
  }

  function storage() {
    try { return global.localStorage; } catch (e) { return null; }
  }

  /* ---------- 基线：适配器启动时就存在的 key ---------- */
  var baseline = {};
  (function () {
    var ls = storage();
    if (!ls) return;
    try {
      for (var i = 0; i < ls.length; i++) {
        var k = ls.key(i);
        if (k) baseline[k] = 1;
      }
    } catch (e) {}
  })();

  function matchesPrefix(k) {
    for (var i = 0; i < CFG.prefixes.length; i++) {
      if (k.indexOf(CFG.prefixes[i]) === 0) return true;
    }
    return false;
  }

  /* 参与同步的 key：命中前缀，或启动后新出现且不在黑名单 */
  function included(k) {
    if (!k || typeof k !== "string") return false;
    if (DENY.test(k)) return false;
    if (matchesPrefix(k)) return true;
    return !baseline[k];
  }

  function hasLocalSave() {
    var ls = storage();
    if (!ls) return false;
    for (var i = 0; i < CFG.saveKeys.length; i++) {
      try {
        if (ls.getItem(CFG.saveKeys[i]) !== null) return true;
      } catch (e) {}
    }
    return false;
  }

  function snapshot() {
    var out = {};
    var ls = storage();
    if (!ls) return out;
    try {
      for (var i = 0; i < ls.length; i++) {
        var k = ls.key(i);
        if (!included(k)) continue;
        out[k] = ls.getItem(k);
      }
    } catch (e) {}
    return out;
  }

  function countKeys(o) {
    var n = 0;
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) n++;
    return n;
  }

  function writeLocal(map) {
    var ls = storage();
    if (!ls || !map) return 0;
    var n = 0;
    for (var k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      try {
        ls.setItem(k, map[k]);
        n++;
      } catch (e) {}
    }
    return n;
  }

  /* ---------- 平台调用 ---------- */
  function platform() {
    return global.LampsPlatform;
  }

  function normalize(msg) {
    if (!msg || msg.ok === false) {
      return { ok: false, message: (msg && msg.message) || "调用失败", data: null };
    }
    return { ok: true, data: msg.data == null ? null : msg.data };
  }

  function callPlatform(method, payload) {
    var L = platform();
    var args = method === "saveGameProgress"
      ? (payload && (payload.game_payload || payload.payload) ? payload : { game_payload: payload })
      : {};

    try {
      if (L) {
        if (method === "saveGameProgress" && typeof L.saveGameProgress === "function") {
          return Promise.resolve(L.saveGameProgress(payload)).then(normalize);
        }
        if (method === "getGameProgress" && typeof L.getGameProgress === "function") {
          return Promise.resolve(L.getGameProgress()).then(normalize);
        }
      }
      /* 兜底：直接走 bridge */
      var b = global.__HOORAH_LAMPS_BRIDGE__;
      if (b && typeof b.callHost === "function") {
        return Promise.resolve(b.callHost(method, args)).then(normalize)["catch"](function (e) {
          return { ok: false, message: (e && e.message) || String(e), data: null };
        });
      }
    } catch (e) {
      return Promise.resolve({ ok: false, message: (e && e.message) || String(e), data: null });
    }
    return Promise.resolve({ ok: false, message: "进度能力暂不可用", data: null });
  }

  /* ---------- 放行游戏脚本 ---------- */
  function runGame() {
    if (booted) return;
    booted = true;
    if (!CFG.deferSrc) return;
    try {
      var s = document.createElement("script");
      s.src = CFG.deferSrc;
      if (CFG.deferType) s.type = CFG.deferType;
      if (CFG.deferCrossorigin) s.crossOrigin = "";
      s.setAttribute("data-lamps-progress-boot", "1");
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {
      warn("放行游戏脚本失败", e);
    }
  }

  /* ---------- 同步启动 ---------- */
  function startSync() {
    if (syncEnabled) return;
    syncEnabled = true;
    lastSeenJson = safeJson(snapshot());
    lastPushedJson = "";

    var proto = null;
    try { proto = global.Storage && global.Storage.prototype; } catch (e) { proto = null; }
    if (proto && typeof proto.setItem === "function") {
      var _set = proto.setItem;
      var _rm = proto.removeItem;
      var _cl = proto.clear;
      proto.setItem = function (k, v) {
        var r = _set.call(this, k, v);
        try { if (included(k)) dirty = true; } catch (e) {}
        return r;
      };
      proto.removeItem = function (k) {
        var r = _rm.call(this, k);
        try { if (included(k)) dirty = true; } catch (e) {}
        return r;
      };
      proto.clear = function () {
        var r = _cl.call(this);
        try { dirty = true; } catch (e) {}
        return r;
      };
    }

    try {
      global.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") push("hidden");
      });
      global.addEventListener("pagehide", function () { push("pagehide"); });
    } catch (e) {}

    setInterval(function () {
      var json = safeJson(snapshot());
      if (json !== lastSeenJson) {
        lastSeenJson = json;
        dirty = true;
      }
      if (dirty) push("tick");
    }, CFG.intervalMs);
  }

  function safeJson(o) {
    try { return JSON.stringify(o); } catch (e) { return ""; }
  }

  function push(reason) {
    if (!syncEnabled) return;
    var snap = snapshot();
    var n = countKeys(snap);
    if (n === 0) {
      /* 本地空且从未有过数据：不要用空档覆盖平台备份 */
      if (!everHadData) return;
    } else {
      everHadData = true;
    }
    var payload = { v: 1, t: Date.now(), data: snap, cleared: n === 0 };
    var json = safeJson(payload);
    if (json.length > CFG.maxBytes) {
      warn("存档过大，跳过平台备份", json.length);
      dirty = false;
      return;
    }
    if (json === lastPushedJson) { dirty = false; return; }
    if (pushing) return;
    pushing = true;
    callPlatform("saveGameProgress", payload).then(function (res) {
      pushing = false;
      if (res && res.ok) {
        lastPushedJson = json;
        dirty = false;
        info("已备份到平台", reason || "", n, "个键");
      } else {
        info("平台备份失败（降级本地）", res && res.message);
      }
    })["catch"](function (e) {
      pushing = false;
      info("平台备份异常（降级本地）", e && e.message);
    });
  }

  /* ---------- 启动流程 ---------- */
  function begin() {
    if (hasLocalSave()) {
      everHadData = true;
      runGame();
      startSync();
      return;
    }

    var decided = false;
    var cap = setTimeout(function () {
      if (decided) return;
      decided = true;
      info("拉取平台存档超时，按新开局继续");
      runGame();
      startSync();
    }, CFG.timeoutMs);

    callPlatform("getGameProgress", {}).then(function (res) {
      if (decided) return;
      decided = true;
      clearTimeout(cap);
      try {
        var rec = res && res.ok && res.data && res.data.record;
        var pl = rec ? rec.gamePayload : null;
        if (pl && pl.data && !pl.cleared && typeof pl.data === "object") {
          restoredCount = writeLocal(pl.data);
          if (restoredCount > 0) {
            everHadData = true;
            try { global.localStorage.setItem(BOOT_FLAG, String(Date.now())); } catch (e) {}
            info("已从平台恢复进度", restoredCount, "个键");
          }
        } else {
          info("平台暂无可恢复进度");
        }
      } catch (e) {
        warn("恢复进度解析失败", e && e.message);
      }
      runGame();
      startSync();
    })["catch"](function (e) {
      if (decided) return;
      decided = true;
      clearTimeout(cap);
      info("拉取平台存档失败，按新开局继续", e && e.message);
      runGame();
      startSync();
    });
  }

  global.LampsProgress = {
    tag: TAG,
    snapshot: snapshot,
    push: push,
    restoreNow: function () {
      return callPlatform("getGameProgress", {});
    },
    info: function () {
      return {
        name: CFG.name,
        prefixes: CFG.prefixes,
        keys: countKeys(snapshot()),
        everHadData: everHadData,
        syncEnabled: syncEnabled,
        restoredCount: restoredCount,
        lastPushedAt: lastPushedJson.length
      };
    }
  };

  begin();
})(typeof window !== "undefined" ? window : globalThis);
