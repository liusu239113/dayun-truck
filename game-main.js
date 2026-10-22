
'use strict';
/* ================= 工具 ================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const _EL={};const ge=id=>_EL[id]||(_EL[id]=document.getElementById(id));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const irnd=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const chance=p=>Math.random()<p;
const fmt=n=>Math.round(n).toLocaleString('zh-CN');
const money=n=>'¥'+fmt(n);
function tday(t){return Math.floor(t/24)+1}
function thhmm(t){let h=t%24;const hh=Math.floor(h),mm=Math.floor((h-hh)*60);return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')}
function tspan(h){h=Math.max(0,Math.round(h*10)/10);const m=Math.round(h*60);if(m<60)return m+'分钟';const hh=Math.floor(m/60),mm=m%60;return hh+'小时'+(mm?mm+'分':'')}

/* ================= 数据：城市与路网 ================= */
const CITIES=[
 {id:'canglan', n:'沧澜', x:50, y:118, big:3, bias:0.97, z:'临港物流区', d:'区域枢纽大城，货源最多'},
 {id:'luming',  n:'鹿鸣', x:22, y:106, big:1, bias:1.04, z:'鹿鸣山麓', d:'山边小城'},
 {id:'baixi',   n:'白汐', x:78, y:110, big:2, bias:1.00, z:'港口码头区', d:'港口城市，水产与钢材'},
 {id:'yanhui',  n:'雁回', x:40, y:88,  big:2, bias:1.01, z:'老城工业区', d:'老工业城市'},
 {id:'qifeng',  n:'栖凤', x:70, y:84,  big:2, bias:0.98, z:'商贸新城', d:'新兴商贸城'},
 {id:'qingya',  n:'青崖', x:26, y:66,  big:1, bias:1.06, z:'青崖县城', d:'山区县城，油价偏贵'},
 {id:'wangchuan',n:'望川', x:52, y:62,  big:3, bias:0.95, z:'智慧物流港', d:'全省物流中心，油价便宜'},
 {id:'yunling', n:'云岭', x:84, y:60,  big:1, bias:1.05, z:'边境口岸区', d:'边境口岸小城'},
 {id:'lanyan',  n:'岚烟', x:18, y:44,  big:1, bias:1.07, z:'岚烟山林区', d:'深山小城，路难走'},
 {id:'xuanhu',  n:'玄湖', x:46, y:36,  big:2, bias:0.99, z:'环湖粮仓区', d:'湖畔粮仓'},
 {id:'jinting', n:'金汀', x:74, y:30,  big:2, bias:1.02, z:'金汀矿区', d:'矿业城市'},
 {id:'tieyuan', n:'铁原', x:44, y:14,  big:2, bias:1.03, z:'重工业基地', d:'最北重工业基地'},
 // ---- 扩充地点 ----
 {id:'nanpu',   n:'南浦', x:32, y:120, big:1, bias:1.03, z:'南浦渔港', d:'南部渔港小镇'},
 {id:'zhulin',  n:'竹林', x:29, y:97,  big:1, bias:1.03, z:'竹林乡', d:'竹林深处的乡镇'},
 {id:'shazhou', n:'沙洲', x:60, y:102, big:1, bias:0.99, z:'沙洲湿地', d:'湿地水乡，河鲜出名'},
 {id:'guanhai', n:'观海', x:70, y:124, big:1, bias:1.01, z:'观海度假区', d:'东南海滨度假小城'},
 {id:'liuying', n:'柳营', x:10, y:84,  big:1, bias:1.05, z:'柳营河谷', d:'西部河谷县城'},
 {id:'yankou',  n:'岩口', x:13, y:58,  big:1, bias:1.08, z:'岩口山区', d:'西部山区隘口小镇'},
 {id:'linjiang',n:'临江', x:42, y:76,  big:1, bias:1.01, z:'临江渡口', d:'沧江渡口小镇'},
 {id:'muyun',   n:'牧云', x:36, y:50,  big:1, bias:1.02, z:'牧云草场', d:'高山牧场小镇'},
 {id:'longxi',  n:'龙溪', x:66, y:46,  big:1, bias:1.00, z:'龙溪峡谷', d:'峡谷旅游小镇'},
 {id:'haiyu',   n:'海隅', x:90, y:74,  big:1, bias:1.02, z:'海隅渔村', d:'东南海边渔村'},
 {id:'beiguan', n:'北关', x:94, y:40,  big:1, bias:1.06, z:'北关口岸', d:'东部边境关口'},
 {id:'shuanghe',n:'双河', x:28, y:22,  big:1, bias:1.04, z:'双河灌区', d:'北部灌区农业镇'},
 {id:'tonglin', n:'桐林', x:62, y:10,  big:1, bias:1.01, z:'桐林林场', d:'北方林场小镇'},
 {id:'panshi',  n:'磐石', x:88, y:16,  big:1, bias:1.02, z:'磐石石材矿区', d:'东部石材矿区'},
 // ---- 第二批扩充地点 ----
 {id:'quanshan',n:'泉山', x:55, y:86,  big:2, bias:0.98, z:'泉山开发区', d:'新兴产业城市'},
 {id:'longtan', n:'龙潭', x:38, y:62,  big:1, bias:1.02, z:'龙潭水库', d:'水库移民新镇'},
 {id:'taoyuan', n:'桃源', x:52, y:48,  big:1, bias:1.02, z:'桃源度假区', d:'世外桃源旅游镇'},
 {id:'hudong',  n:'湖东', x:56, y:38,  big:1, bias:1.00, z:'湖东圩乡', d:'玄湖东岸圩乡'},
 {id:'gucheng', n:'古城', x:78, y:70,  big:1, bias:1.03, z:'古城遗迹区', d:'千年古城遗址小镇'},
 {id:'chashan', n:'茶山', x:72, y:96,  big:1, bias:1.01, z:'茶山梯田', d:'茶山梯田小镇'},
 {id:'shimen',  n:'石门', x:22, y:80,  big:1, bias:1.06, z:'石门峡', d:'石门峡口小镇'},
 {id:'yueshan', n:'月山', x:6,  y:70,  big:1, bias:1.07, z:'月山乡', d:'西部月山小镇'},
 {id:'qingxi',  n:'清溪', x:8,  y:112, big:1, bias:1.07, z:'清溪河谷', d:'西南山谷小城'},
 {id:'haimen',  n:'海门', x:42, y:128, big:1, bias:1.02, z:'海门渔村', d:'南部渔村码头'},
 {id:'yunchi',  n:'云池', x:10, y:28,  big:1, bias:1.06, z:'云池林场', d:'西北林区小镇'},
 {id:'hongshi', n:'红石', x:32, y:10,  big:1, bias:1.05, z:'红石滩', d:'红石滩河谷小镇'},
 {id:'tangshan',n:'汤山', x:76, y:12,  big:1, bias:1.03, z:'汤山温泉', d:'温泉疗养小镇'},
 {id:'zhenhai', n:'镇海', x:90, y:52,  big:1, bias:1.05, z:'镇海关隘', d:'东部关隘小镇'},
 // ---- 第三批扩充地点 ----
 {id:'xinglin', n:'杏林', x:16, y:96,  big:1, bias:1.06, z:'杏花坞', d:'杏花深处的村镇'},
 {id:'yantan',  n:'盐滩', x:26, y:132, big:1, bias:1.03, z:'盐滩晒场', d:'南部盐场小镇'},
 {id:'qingao',  n:'青澳', x:62, y:130, big:1, bias:1.01, z:'青澳湾', d:'东南青澳海滨镇'},
 {id:'nanhu',   n:'南湖', x:44, y:102, big:2, bias:0.99, z:'南湖农场', d:'南湖农场新镇'},
 {id:'ganquan', n:'甘泉', x:68, y:62,  big:1, bias:1.00, z:'甘泉镇', d:'甘泉古镇'},
 {id:'dongjiao',n:'东礁', x:96, y:64,  big:1, bias:1.04, z:'东礁岬', d:'东部海角渔村'},
 {id:'langgang',n:'浪岗', x:88, y:98,  big:1, bias:1.02, z:'浪岗列岛', d:'海湾列岛渔港，跨海大桥直达'},
 {id:'huaiyin', n:'槐荫', x:30, y:38,  big:1, bias:1.05, z:'槐荫古集', d:'古集山货小镇'},
 {id:'shiwu',   n:'石屋', x:4,  y:38,  big:1, bias:1.08, z:'石屋寨', d:'西部石寨山乡'},
 {id:'pingling',n:'平陵', x:60, y:26,  big:1, bias:1.02, z:'平陵台地', d:'北部台地小镇'},
 {id:'yongning',n:'永宁', x:54, y:22,  big:1, bias:1.03, z:'永宁堡', d:'北部屯堡小镇'},
 {id:'hanshan', n:'寒山', x:18, y:14,  big:1, bias:1.07, z:'寒山哨口', d:'北疆哨口小镇'},
 {id:'guangling',n:'广陵', x:86, y:32, big:1, bias:1.02, z:'广陵驿', d:'东北古驿小镇'},
 {id:'dongling',n:'东岭', x:94, y:28,  big:1, bias:1.05, z:'东岭哨所', d:'东北边防哨所'},
 // ---- 邻国「南屿」：界河以南（cty:2），仅经三处口岸与沧澜连通 ----
 {id:'shigu',    n:'石鼓', x:9,  y:158, big:1, bias:1.06, cty:2, z:'石鼓哨站', d:'南屿西部边陲小镇'},
 {id:'qingwa',   n:'青瓦', x:20, y:162, big:1, bias:1.05, cty:2, z:'青瓦古镇', d:'界河南岸的南屿北大门'},
 {id:'lanxi',    n:'蓝溪', x:48, y:159, big:3, bias:0.93, cty:2, z:'蓝溪中央特区', d:'南屿首都，跨国道口而兴'},
 {id:'muzhou',   n:'沐洲', x:66, y:160, big:2, bias:0.99, cty:2, z:'沐洲港', d:'南屿东部河港城市'},
 {id:'qushui',   n:'曲水', x:33, y:171, big:2, bias:1.00, cty:2, z:'曲水河湾', d:'三面环水的河湾之城'},
 {id:'danxia',   n:'丹霞', x:53, y:169, big:1, bias:1.02, cty:2, z:'丹霞地貌区', d:'赤壁丹霞旅游小镇'},
 {id:'baifan',   n:'白帆', x:82, y:163, big:2, bias:1.01, cty:2, z:'白帆湾区', d:'南屿东南滨海城市'},
 {id:'tinglan',  n:'汀兰', x:14, y:174, big:1, bias:1.05, cty:2, z:'汀兰水乡', d:'南屿西部水乡小镇'},
 {id:'lixiang',  n:'荔香', x:27, y:184, big:1, bias:1.03, cty:2, z:'荔香果乡', d:'瓜果飘香的果乡小镇'},
 {id:'huitang',  n:'洄塘', x:44, y:181, big:2, bias:0.98, cty:2, z:'洄塘湖区', d:'南屿最大淡水湖畔'},
 {id:'liandao',  n:'连岛', x:57, y:184, big:1, bias:1.02, cty:2, z:'连岛湖区', d:'湖桥相连的湖中列岛镇'},
 {id:'rongcheng',n:'榕城', x:76, y:176, big:2, bias:0.97, cty:2, z:'榕城工业园', d:'南屿南部工业重镇'},
 {id:'yintan',   n:'银滩', x:87, y:186, big:1, bias:1.02, cty:2, z:'银滩海滨', d:'十里银滩度假胜地'},
 {id:'zhuqiao',  n:'竹桥', x:66, y:192, big:1, bias:1.03, cty:2, z:'竹桥水村', d:'河网密布的竹桥水村'},
 {id:'tongwan',  n:'铜湾', x:50, y:191, big:2, bias:0.99, cty:2, z:'铜湾渔港', d:'南屿最南端的渔港城市'},
 {id:'wangjiao', n:'望角', x:15, y:193, big:1, bias:1.07, cty:2, z:'望角渔村', d:'南屿西南天涯海角'},
 {id:'xiangtan', n:'香檀', x:37, y:195, big:1, bias:1.04, cty:2, z:'香檀山庄', d:'檀木飘香的南方秘境'},
];
const cityById=id=>CITIES.find(c=>c.id===id);
function mkEdge(a,b,name,type,sa){
  const A=cityById(a),B=cityById(b);
  const km=Math.max(15,Math.round(Math.hypot(A.x-B.x,A.y-B.y)*3.1/5)*5);
  return {a,b,name,type,km,toll:type==='hw'?Math.max(15,Math.round(km*0.42/5)*5):0,sa:sa||null};
}
const EDGES=[
 mkEdge('canglan','yanhui','沧雁高速','hw',['青枫服务区',.5]),
 mkEdge('canglan','baixi','沧白高速','hw',['白鹭湖服务区',.55]),
 mkEdge('yanhui','qifeng','雁栖高速','hw',['竹坞服务区',.5]),
 mkEdge('qifeng','wangchuan','栖望高速','hw'),
 mkEdge('wangchuan','xuanhu','望玄高速','hw',['湖心服务区',.5]),
 mkEdge('xuanhu','tieyuan','玄铁高速','hw'),
 mkEdge('xuanhu','jinting','玄金高速','hw',['松岭服务区',.5]),
 mkEdge('jinting','tieyuan','金铁高速','hw'),
 mkEdge('qifeng','yunling','栖云高速','hw'),
 mkEdge('yunling','jinting','云金高速','hw'),
 mkEdge('yanhui','qingya','雁青高速','hw'),
 mkEdge('lanyan','xuanhu','岚玄高速','hw',['云顶服务区',.5]),
 mkEdge('canglan','luming','沧鹿公路','nat'),
 mkEdge('luming','yanhui','鹿雁公路','nat'),
 mkEdge('luming','qingya','鹿青公路','nat'),
 mkEdge('baixi','yanhui','白雁公路','nat'),
 mkEdge('baixi','qifeng','白栖公路','nat'),
 mkEdge('wangchuan','yunling','望云公路','nat'),
 mkEdge('qingya','lanyan','青岚公路','nat'),
 mkEdge('wangchuan','qingya','望青公路','nat'),
 // ---- 扩充路网：南部 / 沿海 ----
 mkEdge('canglan','nanpu','南沧公路','nat'),
 mkEdge('nanpu','luming','南鹿公路','nat'),
 mkEdge('luming','zhulin','鹿竹公路','nat'),
 mkEdge('zhulin','yanhui','竹雁公路','nat'),
 mkEdge('shazhou','canglan','沙沧公路','nat'),
 mkEdge('shazhou','qifeng','沙栖公路','nat'),
 mkEdge('shazhou','guanhai','观沙公路','nat'),
 mkEdge('canglan','guanhai','沧观高速','hw'),
 mkEdge('yanhui','shazhou','雁沙高速','hw',['苇塘服务区',.5]),
 // ---- 扩充路网：西部 / 中部 ----
 mkEdge('liuying','luming','柳鹿公路','nat'),
 mkEdge('liuying','qingya','柳青公路','nat'),
 mkEdge('qingya','yankou','青岩公路','nat'),
 mkEdge('yankou','lanyan','岩岚公路','nat'),
 mkEdge('muyun','qingya','牧青公路','nat'),
 mkEdge('muyun','xuanhu','牧玄公路','nat'),
 mkEdge('muyun','linjiang','牧临公路','nat'),
 mkEdge('linjiang','yanhui','临雁公路','nat'),
 mkEdge('linjiang','wangchuan','临望公路','nat'),
 // ---- 扩充路网：东部 ----
 mkEdge('wangchuan','longxi','望龙高速','hw'),
 mkEdge('longxi','jinting','龙金高速','hw'),
 mkEdge('longxi','yunling','龙云公路','nat'),
 mkEdge('yunling','haiyu','云海公路','nat'),
 mkEdge('haiyu','qifeng','海栖公路','nat'),
 mkEdge('haiyu','baixi','海白公路','nat'),
 mkEdge('beiguan','haiyu','北湾高速','hw',['听涛服务区',.45]),
 mkEdge('beiguan','yunling','北云公路','nat'),
 mkEdge('beiguan','jinting','北金公路','nat'),
 // ---- 扩充路网：北部 ----
 mkEdge('xuanhu','shuanghe','玄双高速','hw'),
 mkEdge('shuanghe','lanyan','双岚公路','nat'),
 mkEdge('shuanghe','tieyuan','双铁公路','nat'),
 mkEdge('tieyuan','tonglin','桐铁公路','nat'),
 mkEdge('tonglin','jinting','桐金公路','nat'),
 mkEdge('jinting','panshi','磐金高速','hw'),
 mkEdge('panshi','beiguan','北磐公路','nat'),
 // ---- 第二批扩充路网：中部腹地 ----
 mkEdge('yanhui','quanshan','雁泉公路','nat'),
 mkEdge('quanshan','qifeng','泉栖高速','hw'),
 mkEdge('quanshan','shazhou','泉沙公路','nat'),
 mkEdge('quanshan','linjiang','泉临公路','nat'),
 mkEdge('longtan','muyun','龙牧公路','nat'),
 mkEdge('longtan','linjiang','龙临公路','nat'),
 mkEdge('longtan','wangchuan','潭望公路','nat'),
 mkEdge('muyun','taoyuan','牧桃公路','nat'),
 mkEdge('taoyuan','wangchuan','桃望公路','nat'),
 mkEdge('taoyuan','longxi','桃龙公路','nat'),
 mkEdge('hudong','xuanhu','湖玄公路','nat'),
 mkEdge('hudong','longxi','湖龙公路','nat'),
 mkEdge('hudong','wangchuan','湖望公路','nat'),
 // ---- 第二批扩充路网：东部 ----
 mkEdge('qifeng','gucheng','栖古公路','nat'),
 mkEdge('gucheng','yunling','古云公路','nat'),
 mkEdge('gucheng','haiyu','古海公路','nat'),
 mkEdge('chashan','qifeng','茶栖公路','nat'),
 mkEdge('chashan','shazhou','茶沙公路','nat'),
 mkEdge('chashan','baixi','茶白公路','nat'),
 mkEdge('zhenhai','yunling','镇云公路','nat'),
 mkEdge('zhenhai','beiguan','镇北公路','nat'),
 // ---- 第二批扩充路网：西部 / 西南 ----
 mkEdge('shimen','qingya','石青公路','nat'),
 mkEdge('shimen','liuying','石柳公路','nat'),
 mkEdge('yueshan','yankou','月岩公路','nat'),
 mkEdge('yueshan','liuying','月柳公路','nat'),
 mkEdge('qingxi','luming','清鹿公路','nat'),
 mkEdge('qingxi','liuying','清柳公路','nat'),
 mkEdge('haimen','nanpu','浦海公路','nat'),
 mkEdge('haimen','canglan','海沧公路','nat'),
 // ---- 第二批扩充路网：北部 ----
 mkEdge('yunchi','lanyan','池岚公路','nat'),
 mkEdge('yunchi','shuanghe','池双公路','nat'),
 mkEdge('hongshi','shuanghe','红双公路','nat'),
 mkEdge('hongshi','tieyuan','红铁公路','nat'),
 mkEdge('tangshan','tonglin','汤桐公路','nat'),
 mkEdge('tangshan','jinting','汤金公路','nat'),
 // ---- 第三批扩充路网：中部 / 南部 ----
 mkEdge('yanhui','nanhu','南雁公路','nat'),
 mkEdge('nanhu','zhulin','湖竹公路','nat'),
 mkEdge('nanhu','shazhou','湖沙公路','nat'),
 mkEdge('nanhu','canglan','湖沧公路','nat'),
 mkEdge('xinglin','luming','杏鹿公路','nat'),
 mkEdge('xinglin','shimen','杏石公路','nat'),
 mkEdge('xinglin','qingxi','杏清公路','nat'),
 mkEdge('yantan','nanpu','盐南公路','nat'),
 mkEdge('yantan','haimen','盐海公路','nat'),
 mkEdge('qingao','guanhai','澳观公路','nat'),
 mkEdge('qingao','canglan','澳沧公路','nat'),
 mkEdge('ganquan','wangchuan','甘望公路','nat'),
 mkEdge('ganquan','gucheng','甘古公路','nat'),
 mkEdge('ganquan','yunling','甘云公路','nat'),
 // ---- 第三批扩充路网：东部 / 海岛 ----
 mkEdge('dongjiao','yunling','礁云公路','nat'),
 mkEdge('dongjiao','haiyu','礁海公路','nat'),
 mkEdge('baixi','langgang','白浪高速','hw'),
 mkEdge('langgang','haiyu','环浪公路','nat'),
 // ---- 第三批扩充路网：北部 ----
 mkEdge('huaiyin','lanyan','槐岚公路','nat'),
 mkEdge('huaiyin','xuanhu','槐玄公路','nat'),
 mkEdge('huaiyin','muyun','槐牧公路','nat'),
 mkEdge('pingling','hudong','平湖公路','nat'),
 mkEdge('pingling','jinting','平金公路','nat'),
 mkEdge('pingling','tonglin','平桐公路','nat'),
 mkEdge('yongning','tieyuan','永铁公路','nat'),
 mkEdge('yongning','tonglin','永桐公路','nat'),
 mkEdge('yongning','hudong','永湖公路','nat'),
 mkEdge('guangling','jinting','广金公路','nat'),
 mkEdge('guangling','panshi','广磐公路','nat'),
 mkEdge('guangling','beiguan','广北公路','nat'),
 mkEdge('dongling','beiguan','岭北公路','nat'),
 mkEdge('dongling','panshi','岭磐公路','nat'),
 mkEdge('shiwu','yankou','石岩公路','nat'),
 mkEdge('shiwu','yunchi','石云公路','nat'),
 mkEdge('hanshan','yunchi','寒云公路','nat'),
 mkEdge('hanshan','hongshi','寒红公路','nat'),
 // ---- 过境口岸：沧澜 ⇆ 南屿（仅此三处过界） ----
 mkEdge('yantan','qingwa','盐青公路','nat'),
 mkEdge('haimen','lanxi','海蓝高速','hw',['界河服务区',0.52]),
 mkEdge('qingao','muzhou','青沐高速','hw',['椰岛服务区',0.5]),
 // ---- 南屿路网：高速干线 ----
 mkEdge('lanxi','muzhou','蓝沐高速','hw'),
 mkEdge('lanxi','qushui','蓝曲高速','hw',['丹嶂服务区',0.5]),
 mkEdge('muzhou','baifan','沐白高速','hw'),
 mkEdge('qushui','huitang','曲洄高速','hw'),
 mkEdge('huitang','tongwan','洄铜高速','hw',['蕉林服务区',0.55]),
 mkEdge('tongwan','rongcheng','铜榕高速','hw'),
 mkEdge('rongcheng','baifan','榕白高速','hw'),
 mkEdge('baifan','yintan','白银高速','hw',['半月湾服务区',0.5]),
 // ---- 南屿路网：国道支线 ----
 mkEdge('qingwa','shigu','青石公路','nat'),
 mkEdge('qingwa','qushui','青曲公路','nat'),
 mkEdge('shigu','tinglan','石汀公路','nat'),
 mkEdge('tinglan','qushui','汀曲公路','nat'),
 mkEdge('tinglan','lixiang','汀荔公路','nat'),
 mkEdge('qushui','danxia','曲丹公路','nat'),
 mkEdge('danxia','huitang','丹洄公路','nat'),
 mkEdge('danxia','lanxi','丹蓝公路','nat'),
 mkEdge('lixiang','huitang','荔洄公路','nat'),
 mkEdge('lixiang','wangjiao','荔望公路','nat'),
 mkEdge('wangjiao','xiangtan','望香公路','nat'),
 mkEdge('xiangtan','tongwan','香铜公路','nat'),
 mkEdge('huitang','liandao','洄连湖桥','nat'),
 mkEdge('liandao','zhuqiao','连竹公路','nat'),
 mkEdge('zhuqiao','tongwan','竹铜公路','nat'),
 mkEdge('zhuqiao','rongcheng','竹榕公路','nat'),
 mkEdge('yintan','rongcheng','银榕公路','nat'),
];

/* ================= 数据：国界与口岸 ================= */
/* 口岸过关：过境费（底价+每吨申报）、排队时长、绿色通道、开箱查验概率与罚款区间 */
const BORDER={feeBase:180,feeTon:12,vipFee:600,vipH:0.5,inspect:0.22,fineMin:200,fineMax:500,legH:1.1,splitAt:0.66};
const cityCtry=id=>{const c=cityById(id);return c&&c.cty===2?2:1};
const edgeIsBorder=e=>cityCtry(e.a)!==cityCtry(e.b);
const borderPortName=e=>(cityCtry(e.a)===2?cityById(e.a):cityById(e.b)).n+'口岸';
function pathBorderCount(path){if(!path||path.length<2)return 0;let n=0;pathEdges(path).forEach(e=>{if(edgeIsBorder(e))n++});return n}
const borderFeeFor=tons=>BORDER.feeBase+Math.round((tons||0)*BORDER.feeTon);

/* ================= 数据：货物 / 卡车 / 配件 ================= */
const CARGO=[
 {id:'jc',   n:'瓷砖建材', i:'🧱', mult:1.05, tons:[9,16], lv:1},
 {id:'ry',   n:'日用百货', i:'🧴', mult:1.00, tons:[8,14], lv:1},
 {id:'kd',   n:'快递包裹', i:'📦', mult:1.08, tons:[6,12], lv:1},
 {id:'ls',   n:'袋装粮食', i:'🌾', mult:0.90, tons:[12,20], lv:1},
 {id:'yl',   n:'瓶装饮料', i:'🥤', mult:0.95, tons:[13,20], lv:1},
 {id:'jd',   n:'家用电器', i:'🧊', mult:1.15, frag:1, tons:[6,12], lv:1},
 {id:'jj',   n:'板式家具', i:'🪑', mult:1.10, frag:1, tons:[8,15], lv:1},
 {id:'gc',   n:'螺纹钢材', i:'🔩', mult:0.88, tons:[18,28], lv:2},
 {id:'jx',   n:'机械设备', i:'🛠️', mult:1.20, frag:1, tons:[14,24], lv:2},
 {id:'sx',   n:'生鲜果蔬', i:'🥬', mult:1.30, perish:1, tons:[8,15], lv:2},
 {id:'bl',   n:'平板玻璃', i:'🪟', mult:1.25, frag:2, tons:[10,16], lv:2},
 {id:'hh',   n:'盆栽花卉', i:'🪴', mult:1.18, frag:1, perish:1, tons:[6,10], lv:2},
 {id:'ll',   n:'冷链食品', i:'🥩', mult:1.38, perish:1, tons:[10,18], lv:3},
 {id:'dz',   n:'精密电子', i:'💻', mult:1.45, frag:2, tons:[5,9], lv:3},
 {id:'wh',   n:'危化油料', i:'🛢️', mult:1.62, haz:1, tons:[16,26], lv:3, permit:1},
 // ---- 扩充货物 ----
 {id:'mt',   n:'原煤',     i:'⚫', mult:0.72, tons:[24,30], lv:2},
 {id:'sjl',  n:'砂石料',   i:'🪨', mult:0.75, tons:[24,30], lv:2},
 {id:'sl',   n:'石材板材', i:'🏔️', mult:0.92, frag:1, tons:[18,26], lv:2},
 {id:'mc',   n:'原木木材', i:'🪵', mult:0.90, tons:[16,26], lv:2},
 {id:'hf',   n:'化肥农资', i:'🌱', mult:0.95, tons:[14,22], lv:1},
 {id:'fz',   n:'纺织服装', i:'👔', mult:1.12, tons:[6,12], lv:1},
 {id:'dq2',  n:'低压电器', i:'🔌', mult:1.18, frag:1, tons:[6,12], lv:2},
 {id:'qp',   n:'汽车零部件', i:'🛞', mult:1.28, frag:1, tons:[8,14], lv:2},
 {id:'yp',   n:'医药保健品', i:'💊', mult:1.30, frag:1, tons:[4,8], lv:2},
 {id:'js2',  n:'酒水礼盒', i:'🍾', mult:1.22, frag:1, tons:[6,10], lv:2},
 {id:'xh',   n:'鲜花绿植', i:'🌹', mult:1.38, perish:1, tons:[4,8], lv:2},
 {id:'hx2',  n:'海鲜冰鲜', i:'🦐', mult:1.45, perish:1, tons:[6,12], lv:3},
 {id:'yl2',  n:'医疗器械', i:'🩺', mult:1.52, frag:2, tons:[4,7], lv:3},
 {id:'gc2',  n:'大型机械', i:'🏗️', mult:1.35, tons:[26,30], lv:3},
 {id:'yq',   n:'压缩气瓶', i:'🎈', mult:1.40, haz:1, tons:[10,16], lv:3, permit:1},
 // ---- 特产货物：org=1 沧澜独产 / org=2 南屿独产（跨国运销有溢价） ----
 {id:'pc2',  n:'北方皮草', i:'🧥', mult:1.38, tons:[4,9],  lv:2, org:1},
 {id:'mj2',  n:'精密模具', i:'⚙️', mult:1.48, frag:1, tons:[5,10], lv:3, org:1},
 {id:'rc2',  n:'人参药材', i:'🌿', mult:1.44, tons:[3,8],  lv:3, org:1},
 {id:'lh2',  n:'老陈醋货', i:'🍶', mult:1.18, frag:1, tons:[8,14], lv:1, org:1},
 {id:'xj2',  n:'橡胶原料', i:'🟫', mult:1.05, tons:[16,26],lv:2, org:2},
 {id:'xl2',  n:'热带鲜果', i:'🥭', mult:1.35, perish:1, tons:[6,12], lv:2, org:2},
 {id:'sl2',  n:'香料作料', i:'🌶️', mult:1.28, tons:[4,9],  lv:2, org:2},
 {id:'xt2',  n:'檀木雕件', i:'🖼️', mult:1.42, frag:1, tons:[4,8],  lv:3, org:2},
 {id:'zz2',  n:'海珍珠贝', i:'🦪', mult:1.58, frag:2, tons:[2,5],  lv:3, org:2},
];
const TRUCKS=[
 {n:'大运·驰途 T3（二手）', price:0,    tank:150, boxMax:16, cons:20, wearMul:1.25, engMax:2, d:'父亲留下的老车，毛病不少但还能跑'},
 {n:'大运·驰途 M6',        price:82000, tank:280, boxMax:24, cons:25, wearMul:1.0,  engMax:3, d:'主流中卡，省心耐用'},
 {n:'大运·重山 H8',        price:268000,tank:400, boxMax:34, cons:29, wearMul:0.85, engMax:4, d:'重卡线主力，能拉快跑'},
 {n:'大运·麒麟 X9 旗舰',   price:880000,tank:620, boxMax:42, cons:32, wearMul:0.68, engMax:4, d:'旗舰牵引车，干线之王'},
 // ---- 扩充车型 ----
 {n:'大运·小卡 K1',        price:26000, tank:110, boxMax:11, cons:13, wearMul:1.1,  engMax:1, d:'城区穿梭小轻卡，百公里才 13 个油，短途倒货首选'},
 {n:'大运·驭风 M8',        price:158000,tank:330, boxMax:28, cons:26, wearMul:0.92, engMax:3, d:'中卡加强版，加了副油箱，多拉一段不吃力'},
 {n:'大运·重山 H9 重载',   price:458000,tank:520, boxMax:40, cons:30, wearMul:0.75, engMax:4, d:'重载强化车架，烂路矿区也扛造'},
 {n:'大运·鲲鹏 X10 限定',  price:1680000,tank:900, boxMax:48, cons:34, wearMul:0.55, engMax:4, d:'全球限量 300 台的移动堡垒，耐磨省心到离谱'},
 {n:'大运·悍将 V5',        price:52000, tank:200, boxMax:18, cons:17, wearMul:1.08, engMax:2, d:'轻卡里的回本利器，皮实好修，县乡短线首选'},
 {n:'大运·风驰 G7',        price:118000,tank:300, boxMax:26, cons:24, wearMul:0.96, engMax:3, d:'公路巡航手，风阻更低，长途更省油'},
 {n:'大运·征途 N9',        price:208000,tank:380, boxMax:31, cons:28, wearMul:0.9,  engMax:3, d:'加宽卧铺长途中卡，跑干线睡觉都安稳'},
 {n:'大运·重山 H8S 山地版', price:358000,tank:460, boxMax:37, cons:31, wearMul:0.8,  engMax:4, d:'山区专线定制，低速大扭矩，爬坡不吃亏'},
 {n:'大运·绿动 Q6（LNG）', price:528000,tank:700, boxMax:38, cons:18, wearMul:0.72, engMax:3, d:'LNG 牵引车，燃料开销近乎砍半，精打细算之选'},
 {n:'大运·天驰 T7 高效版', price:648000,tank:560, boxMax:43, cons:30, wearMul:0.7,  engMax:4, d:'车队标配的高出勤车型，少趴窝就是多赚钱'},
 {n:'大运·九州 X12 至尊',  price:2880000,tank:1000,boxMax:52, cons:33, wearMul:0.5,  engMax:4, d:'公路火车头，跨省干线的终极答案，拉得动一座山'},
 // ---- 高价值旗舰线（顶级富豪座驾） ----
 {n:'大运·星耀 H7 旗舰',   price:4500000,  tank:1100, boxMax:56,  cons:31, wearMul:0.46, engMax:4, d:'星耀漆面加智能悬架，旗舰之上的体面之选'},
 {n:'大运·天穹 X13',       price:8800000,  tank:1300, boxMax:60,  cons:31, wearMul:0.4,  engMax:4, d:'全铝车身轻量化，一箱油跨两省'},
 {n:'大运·揽月 V12',       price:15800000, tank:1500, boxMax:66,  cons:32, wearMul:0.35, engMax:4, d:'V12 动力旗舰，满载爬坡如履平地'},
 {n:'大运·绿动 Q9 氢能',   price:26800000, tank:1800, boxMax:70,  cons:14, wearMul:0.4,  engMax:4, d:'氢燃料电池动力，每公里燃料费低到让油站老板落泪'},
 {n:'大运·擎天 G20',       price:38800000, tank:2000, boxMax:76,  cons:33, wearMul:0.3,  engMax:4, d:'矿场与干线的双料王者，怎么造都扛得住'},
 {n:'大运·鲲鹏 X20 概念',  price:68800000, tank:2400, boxMax:88,  cons:34, wearMul:0.24, engMax:4, d:'概念车量产限量款，全车碳纤维，磨损近乎停滞'},
 {n:'大运·移动堡垒 · 国家车队', price:128000000, tank:3200, boxMax:108, cons:30, wearMul:0.18, engMax:4, d:'传说级公路堡垒，全球仅此一支车队，车轮几乎不坏'},
];
const PARTS={
 engine:{n:'发动机', i:'⚙️', tiers:[
  {n:'160马力 原装',cost:0,spd:82,consMul:1},
  {n:'220马力',cost:3600,spd:92,consMul:0.96},
  {n:'280马力',cost:13800,spd:102,consMul:0.93},
  {n:'350马力',cost:46000,spd:112,consMul:0.9},
  {n:'420马力',cost:118000,spd:120,consMul:0.86}]},
 tank:{n:'油箱', i:'⛽', tiers:[
  {n:'150L 铁油箱',cost:0,cap:150},
  {n:'300L 加大油箱',cost:1400,cap:300},
  {n:'450L 双油箱',cost:5800,cap:450},
  {n:'650L 长途油箱',cost:18500,cap:650},
  {n:'900L 超大油箱',cost:48000,cap:900}]},
 tire:{n:'轮胎', i:'🛞', tiers:[
  {n:'普通翻新胎',cost:0,wearMul:1,blowMul:1},
  {n:'钢丝子午胎',cost:1100,wearMul:0.8,blowMul:0.6},
  {n:'低滚阻轮胎',cost:4800,wearMul:0.62,blowMul:0.5,consMul:0.95},
  {n:'全路况装甲胎',cost:17500,wearMul:0.45,blowMul:0.3,consMul:0.93}]},
 box:{n:'货箱', i:'📦', tiers:[
  {n:'8吨小箱',cost:0,load:8},
  {n:'15吨标准箱',cost:4200,load:15},
  {n:'22吨高栏',cost:16500,load:22},
  {n:'32吨飞翼厢',cost:52000,load:32},
  {n:'42吨骨架挂车',cost:135000,load:42}]},
 cabin:{n:'卧铺驾驶室', i:'🛏️', tiers:[
  {n:'布帘硬座',cost:0,fatMul:1},
  {n:'床垫+遮光帘',cost:800,fatMul:0.88},
  {n:'恒温空调卧铺',cost:6200,fatMul:0.74},
  {n:'豪华平地板驾舱',cost:24000,fatMul:0.6}]},
 nav:{n:'电子设备', i:'📡', tiers:[
  {n:'无',cost:0},
  {n:'ETC 盒子',cost:600,etc:1},
  {n:'货车导航 Pro',cost:3200,etc:1,evMul:0.9},
  {n:'智能辅助驾驶',cost:12800,etc:1,evMul:0.78,fatHwMul:0.85,consMul:0.96}]},
};
/* 无限改装：档位超出预定义表后程序化续档，费用每级 ×2.35，属性小幅增强，永不封顶 */
function partTier(k,lv){
 const ts=PARTS[k].tiers;
 if(lv<ts.length)return ts[lv];
 const base=ts[ts.length-1], over=lv-ts.length+1;
 const t={n:base.n+'+'+over, cost:Math.round(base.cost*Math.pow(2.35,over)/10)*10};
 if(k==='engine'){t.spd=base.spd+4*over;t.consMul=+(base.consMul*Math.pow(0.985,over)).toFixed(3);}
 else if(k==='tank'){t.cap=base.cap+120*over;}
 else if(k==='tire'){t.wearMul=+(base.wearMul*Math.pow(0.93,over)).toFixed(3);t.blowMul=+(base.blowMul*Math.pow(0.9,over)).toFixed(3);if(base.consMul)t.consMul=+(base.consMul*Math.pow(0.99,over)).toFixed(3);}
 else if(k==='box'){t.load=base.load+3*over;}
 else if(k==='cabin'){t.fatMul=+(base.fatMul*Math.pow(0.94,over)).toFixed(3);}
 else if(k==='nav'){t.etc=1;t.evMul=+((base.evMul||1)*Math.pow(0.94,over)).toFixed(3);t.fatHwMul=+((base.fatHwMul||1)*Math.pow(0.97,over)).toFixed(3);t.consMul=+((base.consMul||1)*Math.pow(0.99,over)).toFixed(3);}
 return t;
}
const LEVELS=[0,120,320,720,1400,2400,4000,6400,9800,14000];
const SURNAMES='许张李王赵刘陈周吴孙马朱胡郭何高林罗郑梁谢宋唐许韩冯邓曹彭曾肖田董潘袁蔡蒋余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦付方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝龚邵万钱严覃武戴莫孔向汤'.split('');
const SHIP_SUFFIX=['物流','供应链','商贸','建材','钢铁','农业开发','冷链','电子商务','仓储服务','实业','进出口','日用品厂'];
const SHIP_PREFIX=['宏图','恒通','联运','金穗','拓远','海纳','云仓','万象','中晟','悦达','星桥','力诺','泰和','广源','安捷','顺驰','丰泽','北辰'];
const GIVEN='一鸣建国志强伟明海波勇军磊洪涛建华国庆旭东立新长顺红卫振宇'.split('');
const STATION_TYPES=['物流园','工业园','建材城','货运站','仓储中心','农产品批发市场','港口码头','开发区货场'];
const NOTES=['“路上慢点开，货怕颠。”','“明天中午前必须到，赶着开业。”','“老规矩，到了找王师傅卸货。”','“雨天不急，安全第一。”','“这批货金贵，磕了碰了赔不起。”','“第一次合作，希望愉快。”','“工地等着用，晚一天就停工。”','“到了提前一小时打电话。”','“都是熟客了，辛苦师傅。”','“走高速吧，国道不好走。”'];
const WX=[{n:'晴',i:'☀️',spd:1,cons:1},{n:'多云',i:'⛅',spd:1,cons:1},{n:'小雨',i:'🌦️',spd:0.92,cons:1.04,fat:1.1},{n:'大雨',i:'🌧️',spd:0.82,cons:1.08,fat:1.2},{n:'大雾',i:'🌫️',spd:0.78,cons:1,fat:1.15}];
/* ================= 状态与存档 ================= */
const SAVE_KEY='didayun_truck_v1'; /* 旧版单 key 存档（仅作迁移源与无存档系统时的兜底） */
let S=null, uiTab='orders', selCity=null;
function newState(){
 if(window.SaveGameState){const s=SaveGameState.New();linkFleet(s);return s;} /* 模板已移交存档系统（save/game_state.js） */
 const t0={id:1, model:0, fuel:135, wear:18, odo:236000, parts:{engine:0,tank:0,tire:0,box:0,cabin:0,nav:0}, city:'canglan'};
 return {
  T:8, cash:12000, debt:100000000, lifeCost:100, fatigue:10,
  city:'canglan',
  fleet:[t0], nextTruckId:2, curTruck:1, garageSel:1,
  truck:t0, /* 运行时别名：指向车队中当前驾驶/管理的车，加载后由 linkFleet 重链 */
  hazPermit:false,
  rating:5.0, goodReviews:0, xp:0, level:1, deliv:0,
  orders:[], oseq:1, active:null, journey:null, accepted:[], settleQ:[],
  stats:{trips:0, km:0, earned:0, repaid:0, fines:0, breaks:0, lateCnt:0},
  ach:{}, flags:{tut:0, subLeft:3}, lastDayCharged:1,
  weather:0, market:1, fuelBase:3.8, news:'',
  timeScale:2, speedMode:'std', dark:0,
  audio:{bgm:1,sfx:1,vol:2},
  ledger:[], ledgerSeq:0,
  drivers:[], nextDriverId:1, hireMkt:null, energyTickT:8, /* 雇佣司机系统 */
  biz:{wh:{},fuel:{},stall:{}}, /* 实体投资 */
  ipo:null, /* 公司上市（惰性初始化） */
 };
}
/* ================= 车队辅助 ================= */
const FLEET_CAP=6; /* 车队基础车辆数量上限（可通过激励广告提升） */
function fleetCap(){ return FLEET_CAP+((S&&S.fleetCapBonus)||0); }
function truckById(id){ return (S.fleet||[]).find(t=>t.id===id)||null }
function curTruck(){ return truckById(S.curTruck)||S.fleet[0]||S.truck }
/* 加载/新开局后把 S.truck 别名重链到车队成员（存档 JSON 会把别名复制成独立对象） */
function linkFleet(s){
 if(!s.fleet||!s.fleet.length){
  if(s.truck){ s.fleet=[{id:1, model:s.truck.model, fuel:s.truck.fuel, wear:s.truck.wear, odo:s.truck.odo, parts:s.truck.parts||{engine:0,tank:0,tire:0,box:0,cabin:0,nav:0}, city:s.city||'canglan'}]; }
  else return;
 }
 if(!s.nextTruckId)s.nextTruckId=Math.max.apply(null,s.fleet.map(t=>t.id).concat([0]))+1;
 const cur=truckByIdS(s,s.curTruck)||s.fleet[0];
 s.curTruck=cur.id;
 if(!s.garageSel)s.garageSel=cur.id;
 s.truck=cur;
 if(!s.accepted)s.accepted=[];
 if(!s.settleQ)s.settleQ=[];
 if(s.hazPermit===undefined)s.hazPermit=!!(s.truck&&s.truck.hazPermit);
}
function truckByIdS(s,id){ return (s.fleet||[]).find(t=>t.id===id)||null }
/* 旧存档迁移：单车 → 车队；单运单 S.active → 已接订单列表 */
function migrateState(){
 if(!S)return;
 linkFleet(S);
 S.truck.city=S.city; /* 司机与当前车同城 */
 /* 旧版：正在开的行程挂到当前车 */
 if(S.journey&&!S.journey.truckId)S.journey.truckId=S.curTruck;
 /* 旧版未完成运单转入 accepted */
 if(S.active){
  const o=S.active;
  o.truckId=S.curTruck;
  o.state=S.journey?'running':'assigned';
  if(S.journey)o.manual=1;
  if(!(S.accepted||[]).some(x=>x.id===o.id))S.accepted.push(o);
  S.active=null;
 }
 /* 安全兜底：accepted 里的订单必须带 truckId */
 S.accepted.forEach(o=>{ if(!o.truckId)o.truckId=S.curTruck; if(!o.state)o.state='assigned'; });
 /* 旧版自动派送单按基础车速计的行程统一提速为快速档（2.3×），剩余时间随之缩短 */
 S.accepted.forEach(o=>{
  if(o.state==='running'&&o.auto&&o.job&&!o.job.mode){
   const j=o.job; j.mode='fast';
   const fixedH=(j.loadH||0)+(j.midH||0)+(j.unloadH||0);
   j.legs.forEach(l=>l.h=l.h/2.3);
   j.totalH=+(j.legs.reduce((s,l)=>s+l.h,0)+fixedH).toFixed(2);
   j.eta=+(j.startT+j.totalH).toFixed(2);
  }
 });
 /* 雇佣司机系统：旧存档补字段，卖掉的车解绑司机 */
 if(!S.drivers)S.drivers=[];
 if(!S.nextDriverId)S.nextDriverId=S.drivers.length+1;
 if(S.energyTickT===undefined||S.energyTickT>S.T)S.energyTickT=S.T;
 S.drivers.forEach(d=>{
  if(d.truckId&&!truckByIdS(S,d.truckId))d.truckId=null;
  if(!DTRAIT[d.trait])d.trait='eco';
  d.lv=clamp(d.lv||1,1,DRIVER_MAX_LV);
  if(!(d.wage>0))d.wage=180;
  if(d.energy===undefined)d.energy=100;
  if(d.loyalty===undefined)d.loyalty=70;
  if(d.owed===undefined)d.owed=0;
  if(d.trips===undefined)d.trips=0;
  if(d.xp===undefined)d.xp=0;
 });
 /* 实体投资：旧存档补结构，非法价格剔除 */
 if(!S.biz||typeof S.biz!=='object')S.biz={wh:{},fuel:{},stall:{}};
 for(const k of ['wh','fuel','stall']){
  if(!S.biz[k]||typeof S.biz[k]!=='object')S.biz[k]={};
  for(const cid in S.biz[k]){if(!(S.biz[k][cid]>0))delete S.biz[k][cid];}
 }
 /* 公司上市：旧存档补结构 */
 ensureIpo();
 if(S.ipo.listed&&!(S.ipo.price>0))S.ipo.price=S.ipo.price0||0.1;
}
/* 存档读写统一走 SaveManager 兼容层（core/SaveManager.js）；
 * 存档系统文件缺失（误打包）时降级为旧版单 key localStorage，保证游戏可跑 */
let _autoJson=null,_autoT=0; /* 本地自动保存：快照指纹 + 节流时间戳 */
function autoSaveLocal(){ if(window.SaveManager||!S)return; try{ const j=JSON.stringify(S); if(j===_autoJson)return; _autoJson=j; localStorage.setItem(SAVE_KEY,j); }catch(e){} }
function save(){ if(window.SaveManager){SaveManager.forceSave('action');return;} try{ const j=JSON.stringify(S); _autoJson=j; localStorage.setItem(SAVE_KEY, j); }catch(e){} }
function load(){ if(window.SaveManager){return SaveManager.load();} try{ const s=localStorage.getItem(SAVE_KEY); if(!s)return null; _autoJson=s; const o=JSON.parse(s); if(o&&o.v!==false&&o.truck)return o; }catch(e){} return null; }
/* 深色模式：设置里切换，class 挂 body 上（CSS 见样式表末尾 body.dark 段） */
function applyDark(){ document.body.classList.toggle('dark',!!(S&&S.dark)); }
/* 删除存档：先挂起保存（防止下方全局 save() 把内存数据写回）再清本地存档 */
function deleteSaveAndReload(){
 if(window.SaveManager){ SaveManager.suspend(); SaveManager.deleteSave(); try{localStorage.removeItem(SAVE_KEY);}catch(e){} }
 else{ try{localStorage.removeItem(SAVE_KEY);}catch(e){} }
 location.reload();
}




function fmtSlotTime(ts){
 if(!ts)return '';
 const d=new Date(ts),p=n=>(n<10?'0':'')+n;
 return (d.getMonth()+1)+'/'+d.getDate()+' '+p(d.getHours())+':'+p(d.getMinutes());
}
function slotLocalLine(m){
 if(m.isEmpty)return '空槽位';
 const fn=(m.fleetN===undefined)?null:(m.fleetN||1);
 return '第'+(m.day||1)+'天 · '+money(m.cash||0)+' · Lv'+(m.level||1)+(fn?(' · '+fn+'台车'+((m.acceptedN||0)?' · '+m.acceptedN+'单在途':'')):'');
}

const SLOT_ROW_CSS='display:block;width:100%;text-align:left;padding:9px 12px;margin-bottom:8px;border-radius:10px';
function slotRow(slotId,title,sub,dim){
 return `<button class="btn ghost" data-slot="${slotId}" style="${SLOT_ROW_CSS}${dim?';opacity:.55':''}">
  <b style="font-size:13px">${title}</b>
  <span style="display:block;font-size:11px;color:#8a93a3;margin-top:2px">${sub}</span></button>`;
}
/* 「立即上传」：列出 5 个本地槽位，点选哪个就上传哪个 */


/* 车辆有效属性：油箱/载重以车型定义（tank/boxMax）为原厂基础，改装件只叠加超出 0 档的部分 */
const TANK_BASE=PARTS.tank.tiers[0].cap, BOX_BASE=PARTS.box.tiers[0].load;
function truckDef(t){return TRUCKS[(t||S.truck).model]||TRUCKS[0]}
function tStatFor(truck){
 const p=truck.parts, td=truckDef(truck);
 const eng=partTier('engine',p.engine), tir=partTier('tire',p.tire), nav=partTier('nav',p.nav), cab=partTier('cabin',p.cabin), box=partTier('box',p.box), tnk=partTier('tank',p.tank);
 let consMul=eng.consMul*(tir.consMul||1)*(nav.consMul||1);
 return {
  spd:eng.spd, cap:td.tank+tnk.cap-TANK_BASE, load:td.boxMax+box.load-BOX_BASE,
  consBase:td.cons*consMul, wearMul:td.wearMul*tir.wearMul, blowMul:tir.blowMul,
  fatMul:cab.fatMul*(nav.fatHwMul||1), evMul:nav.evMul||1, etc:!!nav.etc, navLvl:p.nav
 };
}
function tStat(){return tStatFor(S.truck)}
/* 车队最大载重：接单页货源吨位上限按车队里最大的车算 */
function fleetMaxLoad(){ return Math.max.apply(null,(S.fleet||[{parts:{box:0}}]).map(t=>tStatFor(t).load)) }
/* 车辆当前是否被占用：正在运送（含亲自驾驶途中/空驶取货途中） */
function truckBusy(id){
 if(S.journey&&S.journey.truckId===id)return true;
 return (S.accepted||[]).some(o=>o.truckId===id&&o.state==='running');
}
function truckJob(id){ return (S.accepted||[]).find(o=>o.truckId===id&&o.state==='running')||null }
function truckIcon(model){ return '🛻🚚🚛🚛'[model]||'🚛' }
function truckFullName(t){ return truckDef(t).n+' · '+((t.id===1?'起步旧车':'第'+t.id+'号车')) }
function fuelPrice(city){ /* 城市油价 = 基准×当地指数；入股了加油站的城市 8 折 */
 const cid=city||S.city;
 let p=S.fuelBase*cityById(cid).bias;
 if(S.biz&&S.biz.fuel&&S.biz.fuel[cid])p*=0.8;
 return +p.toFixed(2);
}
function platFee(){ return Math.max(7, 12-(S.level-1)) }

/* ================= 导航日志（语音播报已移除，仅保留文字） ================= */
function dvLog(txt, cls){
 const el=$('#dvLog'); const p=document.createElement('p'); if(cls)p.className=cls; p.textContent=txt;
 el.appendChild(p); while(el.children.length>5)el.removeChild(el.firstChild);
 el.scrollTop=el.scrollHeight;
}
function nav(txt){
 if(S&&S.journey){
  dvLog('🔊 '+txt);
  if($('#drive').classList.contains('hide'))toast(txt);
 }
}

/* ================= 提示与弹窗 ================= */
function toast(txt, cls){
 const t=document.createElement('div'); t.className='toast'+(cls?' '+cls:''); t.innerHTML=txt;
 $('#toasts').appendChild(t);
 setTimeout(()=>{t.style.transition='opacity .4s';t.style.opacity='0';setTimeout(()=>t.remove(),420)}, 2400);
}
let modalOpen=false;
function askModal(o){
 // o:{title, tag, body(html), center, noClose, buttons:[{t,cls,fn(close),keep}]}
 modalOpen=true;
 AUDIO.duck(true);
 const w=document.createElement('div'); w.className='mwrap'+(o.center?' center':'');
 const btns=(o.buttons||[]).map((b,i)=>`<button class="btn ${b.cls||'pri'}" data-mb="${i}">${b.t}</button>`).join('');
 w.innerHTML=`<div class="sheet">${o.tag?`<span class="mtag">${o.tag}</span>`:''}<h3>${o.title}</h3><div class="mbody">${o.body||''}</div>${btns?`<div class="mbtns">${btns}</div>`:''}</div>`;
 $('#modals').appendChild(w);
 requestAnimationFrame(()=>w.classList.add('on'));
 const close=()=>{ w.classList.remove('on'); w.classList.add('closing'); setTimeout(()=>w.remove(),220); if(!document.querySelector('#modals .mwrap:not(.closing)')){modalOpen=false;AUDIO.duck(false);} if(S&&S.journey)S.journey.paused=false; save(); };
 w.querySelectorAll('[data-mb]').forEach(b=>b.addEventListener('click',()=>{
   AUDIO.sfx('click');
   const bd=o.buttons[+b.dataset.mb];
   if(!bd.keep)close();
   if(bd.fn)bd.fn(close);
 }));
 return {close, el:w};
}

/* ================= 顶部栏渲染 ================= */
function renderTop(){
 if(!S)return;
 const td=truckDef(), st=tStat();
 const pname=(S.name||'陈师傅');
 $('#tName').textContent=pname;
 $('#tAva').textContent=pname.charAt(0);
 $('#tLv').textContent='Lv.'+S.level;
 $('#tSub').innerHTML=`好评评分 ${S.rating.toFixed(2)} · 第 ${tday(S.T)} 天`;
 const wx=WX[S.weather];
 $('#tWx').textContent=`${wx.i} ${wx.n} ${18+Math.round(Math.sin(S.T/24*Math.PI)*8)+6}°C`;
 $('#tClock').textContent=thhmm(S.T);
 $('#tCash').textContent=money(S.cash);
 const fuelPct=Math.round(S.truck.fuel/st.cap*100), wearPct=Math.round(100-S.truck.wear), fatPct=Math.round(S.fatigue||0);
 const setBar=(id,v,inv)=>{ const el=$(id); el.classList.toggle('warn',v<45&&v>=25); el.classList.toggle('bad',v<25); el.querySelector('b').textContent=v+'%'; el.querySelector('.fill').style.width=clamp(v,0,100)+'%'; };
 setBar('#sbFuel',fuelPct); setBar('#sbWear',wearPct); setBar('#sbFat',100-fatPct,true);
 const db=ge('depotBadge');
 if(db){ const n=(S.depot?S.depot.pearls.length+S.depot.stones.length:0); db.classList.toggle('hide',!(n>0)); }
}

/* ================= 接单页 ================= */
function shipperName(){ return pick(SURNAMES)+pick(GIVEN); }
/* 特殊要求定义：[卡片标签, 说明, 运价补偿系数] */
const REQ_INFO={
 hw:   ['限高速','要求全程走高速，绕行国道将被扣款',1.12],
 night:['限夜送','要求 22 点~次日 5 点之间送达',1.15],
 wear: ['验车况','接单时要求车况 ≥70%',1.10],
 call: ['需回电','送达前需电话回执，多耗约20分钟',1.05],
};
function orderOrigin(o){ return o.chain&&o.chain.leg1Done?o.chain.mid:o.from }
/* 装卸排队时长（小时）：货场类型影响 busy 程度 */
const QUEUE_LOAD={'物流园':[0.3,0.8],'工业园':[0.4,1.0],'建材城':[0.5,1.2],'货运站':[0.5,1.1],'仓储中心':[0.3,0.9],'农产品批发市场':[0.8,1.8],'港口码头':[1.0,2.0],'开发区货场':[0.4,1.0]};
const QUEUE_UNLOAD={'物流园':[0.2,0.7],'工业园':[0.3,0.9],'建材城':[0.4,1.1],'货运站':[0.3,1.0],'仓储中心':[0.2,0.8],'农产品批发市场':[0.5,1.3],'港口码头':[0.6,1.8],'开发区货场':[0.3,0.9]};
function stationQueue(stName,table){
 const r=table[stName]||[0.4,1.1];
 return +(rnd(r[0],r[1])*0.5).toFixed(2);
}
/* 装货全流程：固定装货时间 + 货场排队 → 过磅（可能超载三选一）→ 回调出发 */
function beginLoading(o,next){
 if(!o.loaded){
  const qh=stationQueue(o.pstation,QUEUE_LOAD);
  addTime(0.5+qh);
  o.loaded=1; S.fatigue=clamp((S.fatigue||0)+2,0,100);
  toast(qh>0.05?('货场排队 '+tspan(qh)+'，装货完毕，可以出发了'):'装货完毕，可以出发了');
 }else toast('装货完毕，可以出发了');
 maybeWeighbridge(o,next);
}
/* 过磅：三成概率抽检，货场加装后真超核定载重才算超载，三选一处理 */
function maybeWeighbridge(o,next){
 if(!chance(0.3)){next();return}
 const over=irnd(5,15);
 const overTons=+(o.tons*over/100).toFixed(1);
 if(o.tons+overTons<=tStat().load){next();return}
 const ticket=Math.max(100,Math.round(overTons*300/10)*10);
 askModal({center:true,title:'⚖️ 过磅：超载 '+over+'%',tag:'装货完毕',
  body:`过磅检测超载 <b style="color:#ff5000">${over}%</b>（约 ${overTons} 吨）。怎么处理？<br><span class="muted">硬开上路每段路都可能被查：罚款 ¥400~900、耗时 30 分钟并伤车。</span>`,
  buttons:[
   {t:'要求重新装载（+48分钟）',cls:'ghost',fn:()=>{addTime(0.8);S.fatigue=clamp((S.fatigue||0)+3,0,100);toast('重新装载完毕，合规了');next();}},
   {t:'补票放行 '+money(ticket),cls:'pri',fn:()=>{payCost(ticket,'超载补票');toast('补了票，合规上路');next();}},
   {t:'硬开（风险自担）',cls:'rd',fn:()=>{o.overload=over;AUDIO.sfx('warn');toast('超载上路，途中小心查车');next();}}]});
}
function nearCities(cid){
 const ids=new Set();
 EDGES.forEach(e=>{if(e.a===cid)ids.add(e.b);if(e.b===cid)ids.add(e.a);});
 return CITIES.filter(c=>ids.has(c.id)).map(c=>c.id);
}
/* 熟客货主档案：按公司名登记，合作次数越多信赖越高 */
function pickShipper(){
 S.shippers=S.shippers||{};
 const list=Object.keys(S.shippers).map(k=>S.shippers[k]);
 if(list.length&&chance(0.38)){
  return weightedPick(list.map(s=>({w:1+s.trips*2,s}))).s;
 }
 const sh={n:shipperName(), r:rnd(4.6,5).toFixed(1), co:pick(SHIP_PREFIX)+pick(SHIP_SUFFIX), trips:0};
 S.shippers[sh.co]=sh;
 const keys=Object.keys(S.shippers);
 if(keys.length>30){keys.sort((a,b)=>S.shippers[a].trips-S.shippers[b].trips);delete S.shippers[keys[0]];}
 return sh;
}
function trustLevel(sh){ return !sh?0:(sh.trips>=6?3:sh.trips>=4?2:sh.trips>=2?1:0) }
const TRUST_NAMES=['','熟客','老主顾','金牌货主'];
// 行驶中订单板的锚点城市：沿路线前方将到达的下一个节点
function journeyNodeKm(j){
 const arr=[0]; let acc=0;
 pathEdges(j.path).forEach(e=>{acc+=e.km;arr.push(acc)});
 return arr;
}
function boardAnchor(){
 if(!S.journey)return S.city;
 const j=S.journey,kms=journeyNodeKm(j);
 for(let i=1;i<kms.length;i++){ if(kms[i]>j.doneKm)return j.path[i]; }
 return j.path[j.path.length-1];
}
// 车辆当前位置到装货点的实时路线距离（行驶中按沿路剩余节点就近估算）
function liveAwayKm(o){
 const from=cityById(o.from); if(!from)return 0;
 if(!S.journey)return o.from===S.city?0:routeDist(S.city,o.from);
 const j=S.journey,kms=journeyNodeKm(j);
 let best=Infinity;
 for(let i=0;i<kms.length;i++){
  const remain=Math.abs(kms[i]-j.doneKm); // 已驶过的节点按回头距离算
  const d=o.from===j.path[i]?0:routeDist(j.path[i],o.from);
  best=Math.min(best,remain+d);
 }
 return best===Infinity?routeDist(S.city,o.from):Math.round(best);
}
// 预估净利润：运费(含补贴/服务费) − 主程油费过路费(−空驶成本)
function estProfit(o){
 const ofrom=orderOrigin(o);
 const best=(routeOptions(ofrom,o.to,o.tons).opts[0]);
 if(!best)return null;
 let net=o.price*(1-platFee()/100)-best.fuel-best.toll;
 if(o.from!==S.city&&!S.journey){
  const d0=routeOptions(S.city,o.from,0).opts[0];
  if(d0)net-=d0.fuel+d0.toll;
 }
 return Math.round(net);
}
function genOrder(nearIds,anchor){
 const maxLoad=fleetMaxLoad();
 // 稀有豪华单（低概率，×2 运价、时限紧）
 const lux=chance(0.025);
 // 货主：复用熟客档案，信赖高的优先出好货
 const sh=pickShipper();
 const trust=trustLevel(sh);
 // 三成概率刷出邻城货源（板上邻城单最多2条），需先空驶去装货
 const awayCnt=S.orders.filter(o=>o.from!==anchor).length;
 const from=(!lux&&nearIds&&nearIds.length&&awayCnt<2&&chance(0.3))?cityById(pick(nearIds)):cityById(anchor);
 const away=from.id===anchor?0:routeDist(anchor,from.id);
 const dest=pick(CITIES.filter(c=>c.id!==from.id));
 const crossB=cityCtry(from.id)!==cityCtry(dest.id); /* 跨国运单：先过口岸再送达 */
 const org=cityCtry(from.id);
 const elig=CARGO.filter(c=>{
  if(c.lv>S.level)return false;
  if(c.permit&&!S.hazPermit)return false;
  if(c.tons[0]>maxLoad)return false;
  if(c.org&&c.org!==org)return false; /* 特产货物只在产地国刷出 */
  return true;
 });
 if(!elig.length)return null;
 let cgPool=elig;
 if(trust>=2){const hi=elig.filter(c=>c.mult>=1.15);if(hi.length&&chance(0.5))cgPool=hi;}
 let cg=pick(cgPool);
 // 节日货物出现率提升：大促期间满街都是快递
 if(S.festival&&chance(0.4)){const fest=cgPool.find(c=>c.id===S.festival.cargo);if(fest)cg=fest;}
 // 连锁两程单：中途捎卸，绕路不超 38%
 let chain=null,cdist=0;
 const dist0=routeDist(from.id,dest.id);
 if(!lux&&!away&&chance(0.12)){
  const cands=CITIES.filter(c=>c.id!==from.id&&c.id!==dest.id)
   .map(c=>({id:c.id,d1:routeDist(from.id,c.id),d2:routeDist(c.id,dest.id)}))
   .filter(c=>c.d1>=25&&c.d2>=25&&c.d1+c.d2<=dist0*1.45)
   .sort((a,b)=>(a.d1+a.d2)-(b.d1+b.d2));
  if(cands.length){chain={mid:cands[0].id,leg1Done:false};cdist=cands[0].d1+cands[0].d2;}
 }
 const tons=Math.min(maxLoad, irnd(cg.tons[0], Math.max(cg.tons[0],cg.tons[1])));
 const dist=chain?cdist:dist0;
 const urgent=cg.perish?0.6:(chance(0.28)?0.55:-1);
 let price=(320+dist*tons*(4.5+0.45*cg.mult))*S.market*Math.pow(180/Math.max(120,dist),0.08); /* 运价整体上调约五成 */
 // 天气联动：雨雾天生鲜冷链紧俏、快递爆仓
 let wTag='';
 if(cg.perish&&S.weather>=2){price*=1.15;wTag='紧俏';}
 else if(cg.id==='kd'&&S.weather>=2){price*=1.1;wTag='爆仓';}
 // 节日运价事件
 if(S.festival&&S.festival.cargo===cg.id){price*=(S.festival.mul||1.4);wTag='热销';}
 // 跨国运单：两地产销互补，货主加价收货（运费溢价，口岸费另计）
 if(crossB){price*=1.38;wTag='跨境';}
 if(urgent>0)price*=1.3;
 if(away)price+=away*2.6; // 空驶里程补贴，别让邻城单亏本
 // 特殊要求（限高速/限夜送/验车况/需回电），运价含补偿
 let req='';
 if(!lux&&chance(0.15)){
  req=pick(['hw','night','wear','call']);
  price*=REQ_INFO[req][2];
 }
 price*=[1,1.03,1.06,1.10][trust]; // 熟客价上浮
 if(S.biz&&S.biz.stall&&S.biz.stall[from.id])price*=1.10; // 物流园档口城市：本城发货运价上浮
 const riskFlag=(parseFloat(sh.r)<4.72&&chance(0.25));
 if(riskFlag)price*=1.2; // 低星货主风险单：价高但有克扣/拖延风险
 const bargain=(!lux&&!riskFlag&&chance(0.18));
 if(bargain)price*=0.82; // 可议价单：货主先压低开价
 if(lux){price*=2;req='';}
 price=Math.round(price/10)*10;
 const estH=estHours(from.id,dest.id,tons);
 let hours=estH*(cg.perish?1.9:2.2)+(cg.perish?2:5);
 if(urgent>0)hours*=0.88;
 if(away)hours+=estHours(anchor,from.id,0)+0.3; // 限时里留出空驶时间
 if(chain)hours+=0.6; // 中途捎卸时间
 if(lux)hours*=0.9;
 hours=Math.max(2,Math.round(hours));
 return {
  id:S.oseq++, cg:cg.id, tons, to:dest.id, from:from.id, away,
  price, urgent:urgent>0, perish:!!cg.perish,
  spec:cg.org||0, cross:crossB?1:0,
  chain, cdist:chain?cdist:undefined, bargain:bargain?1:0, req, lux:lux?1:0,
  riskFlag:riskFlag?1:0, wTag, retur:0,
  ship:{n:sh.n, r:sh.r, co:sh.co},
  pstation:pick(STATION_TYPES), dstation:pick(STATION_TYPES),
   deadline:S.T+hours, hours, note:pick(NOTES), expire:S.T+rnd(2.5,5),
  };
}
function routeDist(a,b){
 const p=dijkstra(a,b,e=>e.km);
 if(!p)return 60;
 return Math.round(pathEdges(p).reduce((s,e)=>s+e.km,0));
}
function estHours(a,b,tons){
 const p=dijkstra(a,b,e=>e.km+(e.type==='hw'?0.12:0));
 if(!p)return 3;
 const st=tStat();
 let h=0; pathEdges(p).forEach(e=>{h+=e.km/(st.spd*adsSpeedMul()); if(e.type==='hw')h+=0.15; if(edgeIsBorder(e))h+=BORDER.legH;});
 return h*(1+0.12*(tons/st.load))*1.12;
}
function orderById(id){return S.orders.find(o=>o.id===id)||(S.accepted||[]).find(o=>o.id===id)}
function journeyBannerTitle(j){
 const t=truckById(j.truckId);
 return j.order?('行程进行中 · 前往 '+cityById(j.dest).n+(t?'（'+truckDef(t).n+'）':'')):(j.pickup?('空驶接货 · 前往 '+cityById(j.dest).n+' 装货'):('空驶行程 · 前往 '+cityById(j.dest).n));
}
function journeyBannerSub(j){
 return j.order?('已行 '+Math.round(j.doneKm||0)+'/'+Math.round(j.totalKm)+' km · 车队其他车辆可继续接单派送'):('已行 '+Math.round(j.doneKm||0)+'/'+Math.round(j.totalKm)+' km · 空驶可随时取消');
}
function boardRefreshLeft(){
 const today=tday(S.T);
 if(S.boardDay!==today){S.boardDay=today;S.boardLeft=3;}
 return S.boardLeft;
}
/* 订单排序：综合/利润/距离/时限 */
const SORT_DEFS=[['default','综合'],['profit','利润'],['dist','距离'],['time','时限']];
function sortedOrders(){
 if(S.sortMode==='profit'){const m={};S.orders.forEach(o=>m[o.id]=estProfit(o)||0);return [...S.orders].sort((a,b)=>m[b.id]-m[a.id]);}
 if(S.sortMode==='dist')return [...S.orders].sort((a,b)=>routeDist(orderOrigin(a),a.to)-routeDist(orderOrigin(b),b.to));
 if(S.sortMode==='time')return [...S.orders].sort((a,b)=>a.hours-b.hours);
 return S.orders;
}
function renderOrders(){
 const el=$('#view-orders');
 const hint=S.deliv===0;
 let h=`<div class="newstick"><span class="ns">快讯</span><span>${S.news}</span></div>`;
 h+=`<div class="obtns" style="margin-bottom:10px"><button class="btn pri" data-act="bidHall" style="flex:1;font-size:11px">🗣️ 报价大厅 · 货主求购，司机出价</button><button class="btn or" data-act="refreshBoard" style="flex:none;font-size:11px">🎬 看广告换一板 · 价格×1.5</button></div>`;
 if(S.orders.length)h+=`<div style="display:flex;gap:6px;margin:0 0 10px">${SORT_DEFS.map(s=>`<button class="btn ${((S.sortMode||'default')===s[0])?'pri':'ghost'}" data-act="sortBoard" data-m="${s[0]}" style="flex:1;padding:7px 0;font-size:12px">${s[1]}</button>`).join('')}</div>`;
 if(S.journey)h+=`<div class="ocard" style="border:1.5px solid var(--gr)"><div class="ohead"><div class="oava" style="background:var(--gr)">🚚</div><div class="owho"><div class="oname">${journeyBannerTitle(S.journey)}</div><div class="osub">${journeyBannerSub(S.journey)}</div></div></div><div class="obtns"><button class="btn rd" data-act="cancelJourney">${S.journey.order?'✖ 取消运单（赔¥200）':'✖ 取消空驶行程'}</button></div></div>`;
 /* 我的运单：已接订单（可多单并行，分车派送） */
 const acc=S.accepted||[];
 if(acc.length){
  h+=`<div class="sect" style="margin:2px 0 10px;padding:0"><h4 style="padding:2px 2px 8px">📋 我的运单（${acc.length}）<span class="muted" style="font-weight:400;font-size:10px">多单并行 · 分车派送</span></h4>${acc.map(accCard).join('')}</div>`;
 }
 if(!S.orders.length)h+=`<div style="text-align:center;padding:60px 20px;color:#98a1a8;font-size:13px">附近暂无合适货源<br><span style="font-size:11px">稍等片刻，或到地图页空驶去别的城市</span></div>`;
 for(const o of sortedOrders()){
  const cg=CARGO.find(c=>c.id===o.cg);
  const dest=cityById(o.to), home=cityById(orderOrigin(o));
  const ofrom=orderOrigin(o);
  const dist=(o.chain&&!o.chain.leg1Done)?o.cdist:routeDist(ofrom,o.to);
  const isAway=o.from!==S.city, awayKm=liveAwayKm(o);
  const trust=trustLevel(S.shippers&&S.shippers[o.ship.co]);
  const profit=estProfit(o);
  const cls='ocard'+(o.lux?' lux':'')+(o.retur?' retur':'');
  h+=`<div class="${cls}">
   <div class="ohead">
    <div class="oava" style="background:hsl(${(o.id*47)%360},42%,50%)">${o.ship.n[0]}</div>
    <div class="owho">
     <div class="oname">${o.ship.n} <span class="ostar">★${o.ship.r}</span><span class="otag">${o.ship.co}</span>${o.lux?'<span class="otag gold">豪华</span>':''}${o.bid?'<span class="otag good">竞标</span>':''}${o.urgent?'<span class="otag hot">加急</span>':''}${o.perish?'<span class="otag hot">时效</span>':''}${o.chain?'<span class="otag sub">连送</span>':''}${o.cross?'<span class="otag" style="background:#efe9f9;color:#7a5fd0">跨境</span>':''}${o.spec?`<span class="otag" style="background:#efe9f9;color:#7a5fd0">${o.spec===2?'南屿特产':'沧澜特产'}</span>`:''}${isAway?'<span class="otag">邻城货</span>':''}${o.retur?'<span class="otag good">回头货</span>':''}${o.bargain?'<span class="otag good">可议价</span>':''}${o.req?`<span class="otag sub">${REQ_INFO[o.req][0]}</span>`:''}${o.riskFlag?'<span class="otag hot">风险</span>':''}${trust>0?`<span class="otag good">${TRUST_NAMES[trust]}</span>`:''}${o.wTag?`<span class="otag hot">${o.wTag}</span>`:''}</div>
     <div class="osub">${o.tons}吨 · ${cg.n} ${cg.i} · 全程约${dist}公里${profit!==null?` · 利润约 <b style="color:${profit>=0?'#0a8f60':'#e05346'}">${money(profit)}</b>`:''}</div>
    </div>
    <div class="oprice"><b>${money(o.price)}</b><span>${o.bargain?'底价':'一口价'}</span>${o.adBoard?'<em>🎬×1.5</em>':''}${S.flags.subLeft>0?'<em>平台补贴+15%</em>':''}${adsBoostLeftH()>0?'<em>⚡收入×2</em>':''}</div>
   </div>
   <div class="oroute">
    <div class="oline"><i class="nd o"></i><div>${home.n} · ${o.pstation}<small>${(!S.journey&&ofrom===S.city)?'装货点 · 就在你附近':`装货点 · 距你约${awayKm}公里`}</small></div></div>
    ${o.chain&&!o.chain.leg1Done?`<div class="oline"><i class="nd" style="background:#f0a03c"></i><div>${cityById(o.chain.mid).n} · 中途捎卸<small>第一程送达后自动继续第二程</small></div></div>`:''}
    <div class="oline"><i class="nd g"></i><div>${dest.n} · ${o.dstation}<small>限时 ${tspan(o.hours)} 送达${o.chain?'（两程合计）':''}</small></div></div>
   </div>
   <div class="onote">${o.note}</div>
   <div class="obtns">
    <button class="btn ghost" data-act="orderDetail" data-id="${o.id}">查看详情</button>
    <button class="btn pri${hint?' hintpulse':''}" data-act="acceptOrder" data-id="${o.id}">接下这单</button>
   </div>
  </div>`;
 }
 el.innerHTML=h;
}
/* 已接订单卡片：待指派 / 已指派 / 运送中（自动） / 亲自驾驶中 */
function jobProgress(o){
 const j=o.job; if(!j)return {frac:0,etaLeft:0};
 const elapsed=Math.max(0,S.T-j.startT);
 const frac=clamp(elapsed/j.totalH,0,1);
 return {frac, etaLeft:j.eta-S.T};
}
function accLegH(j,idx){ let h=0; for(let i=0;i<idx;i++)h+=j.legs[i].h; return h }
function accCard(o){
 const cg=CARGO.find(c=>c.id===o.cg);
 const t=truckById(o.truckId);
 const leftH=o.deadline-S.T;
 const dlTxt=leftH>=0?`限时余 ${tspan(leftH)}`:'⚠️ 已超时限';
 let status='', prog='', btns='';
 if(o.state==='running'&&o.manual){
  status='<span class="otag good">亲自驾驶中</span>';
  btns='';
 }else if(o.state==='running'&&o.auto&&o.job){
  const p=jobProgress(o);
  status='<span class="otag sub">'+(o.job.driver?('👨‍✈️ '+o.job.driver.name+' 驾驶中'):'自动派送中')+'</span>';
  const legN=o.job.legs[Math.min(o.job.legIdx,o.job.legs.length-1)];
  const legName=legN.kind==='deadhead'?'空驶去装货':(o.job.legIdx>=o.job.legs.length-1?'送货途中':'连送第二程');
  prog=`<div class="track" style="margin-top:8px"><div class="fill" style="width:${(p.frac*100).toFixed(1)}%"></div></div>
   <div style="display:flex;justify-content:space-between;font-size:10px;color:#8a93a3;margin-top:3px"><span>${legName} · ${legN?cityById(legN.to).n:''}</span><span>预计 ${thhmm(o.job.eta)} 送达${p.etaLeft>=0?'（余'+tspan(p.etaLeft)+'）':'（超时）'}</span></div>`;
  btns=`<button class="btn rd" data-act="cancelAccepted" data-id="${o.id}">✖ 中途取消（赔¥200）</button>`;
 }else{
  const busy=t?truckBusy(t.id):false;
  status=t?`<span class="otag ${busy?'sub':'good'}">已指派 · ${truckDef(t).n}</span>`:'<span class="otag hot">待指派车辆</span>';
  const b=[];
  if(!t)b.push('<button class="btn pri" data-act="assignOrder" data-id="'+o.id+'">🚚 指派车辆</button>');
  else{
   b.push('<button class="btn ghost" data-act="assignOrder" data-id="'+o.id+'">换车</button>');
   if(!busy&&!S.journey&&t.city===S.city){
    const d0=driverOfTruck(t.id);
    b.push('<button class="btn pri" data-act="driveOrder" data-id="'+o.id+'">🚚 亲自驾驶</button>');
    b.push('<button class="btn" data-act="autoOrder" data-id="'+o.id+'" style="background:#0a8f60;color:#fff">'+(d0?('🧑‍✈️ '+d0.name+'出车（免费）'):'🤖 自动派送 ¥150')+'</button>');
   }else if(!busy){
    const d1=driverOfTruck(t.id);
    b.push('<button class="btn pri" data-act="autoOrder" data-id="'+o.id+'">'+(d1?('🧑‍✈️ '+d1.name+'出车（免费）'):'🤖 自动派送 ¥150')+'</button>');
    if(t.city!==S.city)b.push('<span style="font-size:10px;color:#8a93a3;align-self:center">车在'+cityById(t.city).n+'，仅可自动派送</span>');
   }else b.push('<span style="font-size:10px;color:#8a93a3;align-self:center">该车辆任务中…</span>');
  }
  btns=b.join('')+'<button class="btn rd" data-act="cancelAccepted" data-id="'+o.id+'">取消（赔¥200）</button>';
 }
 return `<div class="ocard" style="border:1.5px solid var(--gr)">
  <div class="ohead">
   <div class="oava" style="background:hsl(${(o.id*47)%360},42%,50%)">${o.ship.n[0]}</div>
   <div class="owho">
    <div class="oname">${o.ship.n} ${status}</div>
    <div class="osub">${cg.n} ${cg.i} ${o.tons}吨 · ${cityById(orderOrigin(o)).n} → ${cityById(o.to).n} · ${money(o.price)} · ${dlTxt}</div>
   </div>
  </div>
  ${prog}
  <div class="obtns">${btns}</div>
 </div>`;
}
/* ================= 地图页（拟真地图风格） ================= */
let MAPV={x:0,y:0,w:100},mapAspect=1.4,mapLastCity=null;
const POI_KINDS=[
 {n:'火车站',c:'#4a80d8'},{n:'客运中心',c:'#4a80d8'},{n:'港口码头',c:'#4a80d8'},
 {n:'物流园',c:'#f09b3c'},{n:'工业园',c:'#f09b3c'},{n:'仓储中心',c:'#f09b3c'},
 {n:'建材市场',c:'#f09b3c'},{n:'批发市场',c:'#f09b3c'},{n:'人民医院',c:'#e05346'},{n:'博物馆',c:'#9a6fd0'}
];
function mapH(){return MAPV.w*mapAspect}
function clampMapV(){
 MAPV.w=clamp(MAPV.w,32,118);
 MAPV.x=clamp(MAPV.x,-26,126-MAPV.w);
 MAPV.y=clamp(MAPV.y,-26,212-mapH());
}
function applyMapV(){const svg=$('#mapSvg');if(!svg)return;clampMapV();svg.setAttribute('viewBox',MAPV.x.toFixed(2)+' '+MAPV.y.toFixed(2)+' '+MAPV.w.toFixed(2)+' '+mapH().toFixed(2))}
/* 视野复位：沧澜看全北部地图，身处南屿则居中到所在位置（地图已向南扩至 y≈200） */
function focusHome(){
 const me=cityById(S.city);
 MAPV.w=118;MAPV.x=-9;
 MAPV.y=(me.cty===2)?clamp(me.y-mapH()/2,-26,212-mapH()):-6;
}
function mapAspectRefresh(){const svg=$('#mapSvg');if(!svg)return;const r=svg.getBoundingClientRect();if(r.width>10&&r.height>10)mapAspect=r.height/r.width}
function zoomMapAt(f,px,py){
 if(px===undefined)px=MAPV.x+MAPV.w/2;
 if(py===undefined)py=MAPV.y+mapH()/2;
 MAPV.x=px-(px-MAPV.x)*f;MAPV.y=py-(py-MAPV.y)*f;MAPV.w*=f;
 clampMapV();applyMapV();
}
function bindMapPan(){
 const svg=$('#mapSvg'),wrap=$('#mapWrap');if(!svg||!wrap)return;
 mapAspectRefresh();applyMapV();
 const ptrs=new Map();let lastDist=0,moved=0;
 svg.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});try{svg.setPointerCapture(e.pointerId)}catch(err){}moved=0;lastDist=0});
 svg.addEventListener('pointermove',e=>{
  if(!ptrs.has(e.pointerId))return;
  const prev=ptrs.get(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2){
   const ps=[...ptrs.values()],d=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);
   if(lastDist>0){const r=svg.getBoundingClientRect();
    zoomMapAt(clamp(lastDist/d,0.6,1.6),MAPV.x+((ps[0].x+ps[1].x)/2-r.left)/r.width*MAPV.w,MAPV.y+((ps[0].y+ps[1].y)/2-r.top)/r.height*mapH());}
   lastDist=d;moved+=8;
  }else{
   const r=svg.getBoundingClientRect(),sc=MAPV.w/r.width;
   const dx=e.clientX-prev.x,dy=e.clientY-prev.y;
   moved+=Math.abs(dx)+Math.abs(dy);
   if(moved>3){MAPV.x-=dx*sc;MAPV.y-=dy*sc;clampMapV();applyMapV();}
  }
 });
 const end=e=>{
  ptrs.delete(e.pointerId);lastDist=0;
  if(moved>6){wrap._dragged=true;return}
  // pointer capture 会把 click 重定向到 svg，这里手动做命中检测
  const t=document.elementFromPoint(e.clientX,e.clientY);
  const act=t&&t.closest?t.closest('[data-act]'):null;
  if(act&&wrap.contains(act)&&act.dataset.act==='city'){selCity=act.dataset.id;renderMap();}
 };
 svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
 svg.addEventListener('wheel',e=>{e.preventDefault();const r=svg.getBoundingClientRect();
  zoomMapAt(e.deltaY>0?1.15:0.87,MAPV.x+(e.clientX-r.left)/r.width*MAPV.w,MAPV.y+(e.clientY-r.top)/r.height*mapH())},{passive:false});
 wrap.addEventListener('click',e=>{if(wrap._dragged){e.stopPropagation();wrap._dragged=false}});
}
function blobPts(cx,cy,r,seed,squish){
 const pts=[];const n=9;
 for(let k=0;k<n;k++){const a=k/n*Math.PI*2,rr=r*(0.7+seeded(seed+k*7.3)*0.45);
  pts.push((cx+Math.cos(a)*rr).toFixed(1)+','+(cy+Math.sin(a)*rr*(squish||0.85)).toFixed(1))}
 return pts.join(' ');
}
function renderMap(){
 const el=$('#view-map');
 const me=cityById(S.city);
 const sel=selCity?cityById(selCity):null;
 let grid='',decor='',water='',roadsC='',roadsF='',route='',pois='',marks='',labels='',hits='';
 // 底纹街巷网格
 for(let gx=-28;gx<=126;gx+=7)grid+=`<line x1="${gx}" y1="-28" x2="${gx}" y2="232" stroke="#e6e7da" stroke-width="0.14"/>`;
 for(let gy=-28;gy<=232;gy+=7)grid+=`<line x1="-28" y1="${gy}" x2="126" y2="${gy}" stroke="#e6e7da" stroke-width="0.14"/>`;
 // 山林 / 田野
 decor+=`<polygon points="${blobPts(13,40,7,11)}" fill="#cfe6bc" opacity="0.8"/>`;
 decor+=`<polygon points="${blobPts(24,58,4.6,23)}" fill="#cfe6bc" opacity="0.8"/>`;
 decor+=`<polygon points="${blobPts(88,42,5,37)}" fill="#cfe6bc" opacity="0.7"/>`;
 decor+=`<polygon points="${blobPts(37,45,4.2,53)}" fill="#ece5c0" opacity="0.9"/>`;
 decor+=`<polygon points="${blobPts(64,126,4,67)}" fill="#ece5c0" opacity="0.9"/>`;
 // 南屿山林 / 田野
 decor+=`<polygon points="${blobPts(9,167,4.2,71)}" fill="#cfe6bc" opacity="0.8"/>`;
 decor+=`<polygon points="${blobPts(70,169,4,73)}" fill="#ece5c0" opacity="0.9"/>`;
 decor+=`<polygon points="${blobPts(23,190,4.4,79)}" fill="#cfe6bc" opacity="0.8"/>`;
 decor+=`<polygon points="${blobPts(45,171,3.8,83)}" fill="#ece5c0" opacity="0.9"/>`;
 // 国家水印标注
 decor+=`<text x="46" y="7" font-size="7.5" letter-spacing="2.5" fill="#aeb8a0" opacity="0.85" stroke="#fff" stroke-width="0.35" paint-order="stroke" text-anchor="middle" style="pointer-events:none">沧 澜</text>`;
 decor+=`<text x="90" y="177" font-size="7.5" letter-spacing="2.5" fill="#a9a3c8" opacity="0.85" stroke="#fff" stroke-width="0.35" paint-order="stroke" text-anchor="middle" style="pointer-events:none">南 屿</text>`;
 // 城区边界 / 街区块 / 公园 / 兴趣点
 CITIES.forEach((c,ci)=>{
  const R=c.big===3?7:c.big===2?5.4:4.4;
  const ct2=c.cty===2;
  decor+=`<polygon points="${blobPts(c.x,c.y,R,ci*3+5)}" fill="${ct2?'#eae5f4':'#e7eedb'}" stroke="${ct2?'#b3a6dd':'#a5d29a'}" stroke-width="0.3" stroke-dasharray="1.5 1.2"/>`;
  const bn=c.big===3?8:c.big===2?6:4;
  for(let k=0;k<bn;k++){
   const a=seeded(ci*17+k*3.1)*6.28,d=seeded(ci*23+k*5.7)*R*0.6;
   const bw=1.1+seeded(ci*11+k*1.3)*1.9,bh=0.8+seeded(ci*13+k*2.9)*1.3;
   const bx=c.x+Math.cos(a)*d,by=c.y+Math.sin(a)*d*0.8;
   decor+=`<rect x="${(bx-bw/2).toFixed(1)}" y="${(by-bh/2).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="0.25" fill="#dde7c9" opacity="0.9"/>`;
  }
  if(c.big>=2){
   const a=seeded(ci*31+7)*6.28,d=R*0.45;
   decor+=`<polygon points="${blobPts(c.x+Math.cos(a)*d,c.y+Math.sin(a)*d*0.8,1.8+seeded(ci*5)*1.2,ci*9+2)}" fill="${ct2?'#d6cdee':'#c9e5b4'}"/>`;
  }
  const pc=c.big===3?3:c.big===2?2:1;
  for(let k=0;k<pc;k++){
   const P=POI_KINDS[(ci*3+k*5+2)%POI_KINDS.length];
   const a=seeded(ci*13+k*29+1)*6.28,d=2.4+seeded(ci*7+k*3+4)*3.4;
   const px=c.x+Math.cos(a)*d,py=c.y+Math.sin(a)*d*0.8;
   const left=px>66;
   pois+=`<g><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.05" fill="${P.c}" stroke="#fff" stroke-width="0.4"/><text x="${(left?px-1.7:px+1.7).toFixed(1)}" y="${(py+0.72).toFixed(1)}" font-size="2.05" fill="#5a6472" stroke="#fff" stroke-width="0.55" paint-order="stroke" text-anchor="${left?'end':'start'}" style="pointer-events:none">${P.n}</text></g>`;
  }
 });
 // 水系：东部海湾 / 玄湖 / 沧江
 const river='M27,-8 C31,4 33,14 35,24 C36.5,31 34,33.5 37.5,36.5 C41,39.5 43,44 44.5,50 C46,56 43.5,60 45.5,66 C47.5,72 46.5,78 48.5,84 C50.5,90 54,94 58,99 C63,105 70,107 76,109';
 water=`<path d="M100,82 C90,87 83,94 81,102 C79.5,109 81.5,115 86.5,121 C91.5,127 94.5,133 95.5,142 L100,142 Z" fill="#a9d2f2"/>
  <path d="M100,82 C90,87 83,94 81,102 C79.5,109 81.5,115 86.5,121 C91.5,127 94.5,133 95.5,142" fill="none" stroke="#8cbce4" stroke-width="0.35"/>
  <ellipse cx="37.5" cy="33.5" rx="4.1" ry="2.9" fill="#a9d2f2" transform="rotate(-12 37.5 33.5)"/>
  <path d="${river}" fill="none" stroke="#a9d2f2" stroke-width="2.1" stroke-linecap="round"/>
  <path d="${river}" fill="none" stroke="#8cbce4" stroke-width="0.25" opacity="0.6"/>`;
 // 南屿水系：东南海角 / 南海 / 洄塘湖 / 界河（河中心虚线即国界）
 const borderR='M-26,151 C-8,148 6,153 22,150 C38,147 50,152 64,149 C78,146 88,152 102,149 C112,147 120,150 126,148';
 water+=`<path d="M100,156 C93,159 90,165 92,172 C94,179 91,185 95,191 C97,196 99,198 100,200 Z" fill="#a9d2f2"/>
  <path d="M100,156 C93,159 90,165 92,172 C94,179 91,185 95,191 C97,196 99,198 100,200" fill="none" stroke="#8cbce4" stroke-width="0.35"/>
  <path d="M-26,201 C0,198 30,202 60,199 C90,196 110,200 126,198 L126,216 L-26,216 Z" fill="#a9d2f2"/>
  <path d="M-26,201 C0,198 30,202 60,199 C90,196 110,200 126,198" fill="none" stroke="#8cbce4" stroke-width="0.35"/>
  <ellipse cx="52" cy="183.5" rx="5.5" ry="3" fill="#a9d2f2" transform="rotate(-8 52 183.5)"/>
  <path d="${borderR}" fill="none" stroke="#a9d2f2" stroke-width="2.4" stroke-linecap="round"/>
  <path d="${borderR}" fill="none" stroke="#8a9080" stroke-width="0.55" stroke-dasharray="3 2" opacity="0.9"/>`;
 // 道路（高速=橙黄双向描边，国道=白底灰边）
 for(const e of EDGES){
  const A=cityById(e.a),B=cityById(e.b),hw=e.type==='hw';
  roadsC+=`<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="${hw?'#e09a2f':'#d9d6c6'}" stroke-width="${hw?1.7:1.15}" stroke-linecap="round"/>`;
  roadsF+=`<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="${hw?'#ffce55':'#fff'}" stroke-width="${hw?1.15:0.7}" stroke-linecap="round"/>`;
 }
 // 选中城市：导航路线预览 + 红色图钉
 if(sel&&sel.id!==S.city){
  const p=dijkstra(S.city,sel.id,e=>e.km);
  if(p)route=`<polyline points="${p.map(id=>cityById(id).x+','+cityById(id).y).join(' ')}" fill="none" stroke="#1a73e8" stroke-width="0.85" stroke-dasharray="2.2 1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`;
  marks+=`<g transform="translate(${sel.x},${sel.y-0.6})" style="pointer-events:none"><path d="M0,0 C-2.4,-3 -2.4,-6.6 0,-6.6 C2.4,-6.6 2.4,-3 0,0 Z" fill="#e5433d"/><circle cy="-4.4" r="1.05" fill="#fff"/></g>`;
 }
 // 服务区 POI
 for(const e of EDGES){
  if(!e.sa)continue;
  const A=cityById(e.a),B=cityById(e.b),t=e.sa[1];
  const sx=A.x+(B.x-A.x)*t,sy=A.y+(B.y-A.y)*t;
  pois+=`<g><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1" fill="#0a8f60" stroke="#fff" stroke-width="0.4"/><text x="${(sx+1.6).toFixed(1)}" y="${(sy-1.2).toFixed(1)}" font-size="2" fill="#2e7d54" stroke="#fff" stroke-width="0.5" paint-order="stroke" style="pointer-events:none">${e.sa[0]}</text></g>`;
 }
 // 城市标记与名称
 CITIES.forEach(c=>{
  if(c.id===S.city)return;
  const r=c.big===3?2.6:c.big===2?2.2:1.9;
  marks+=`<circle cx="${c.x}" cy="${c.y}" r="${r}" fill="#fff" stroke="${c.cty===2?'#7a5fd0':'#3f9c6e'}" stroke-width="0.85"/>`;
  const ly=(sel&&sel.id===c.id)?c.y-r-8.2:c.y-r-1.5;
  labels+=`<text x="${c.x}" y="${ly}" font-size="${c.big===3?3.4:3}" font-weight="600" fill="#4a5560" stroke="#fff" stroke-width="0.8" paint-order="stroke" text-anchor="middle" style="pointer-events:none">${c.n}</text>`;
 });
 // 当前位置：行程中高亮路线并显示行驶中的卡车，否则显示蓝色导航箭头
 const J=S.journey;
 let jcard='';
 if(J){
  const jp=journeyPathOf(J), jpts=jp.map(id=>cityById(id));
  route=`<polyline points="${jpts.map(c=>c.x+','+c.y).join(' ')}" fill="none" stroke="#1a73e8" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>`;
  const dpt=jpts[jpts.length-1];
  marks+=`<g transform="translate(${dpt.x},${dpt.y-0.6})" style="pointer-events:none"><path d="M0,0 C-2.4,-3 -2.4,-6.6 0,-6.6 C2.4,-6.6 2.4,-3 0,0 Z" fill="#e5433d"/><circle cy="-4.4" r="1.05" fill="#fff"/></g>`;
  const pt=journeyPointAt(J,(J.doneKm||0)/(J.totalKm||1));
  marks+=`<g id="jTruckG" transform="translate(${pt.x.toFixed(2)},${pt.y.toFixed(2)})" style="pointer-events:none"><circle r="3.2" fill="rgba(26,115,232,.15)"><animate attributeName="r" values="2.6;4.4;2.6" dur="1.6s" repeatCount="indefinite"/></circle><circle r="2.3" fill="#fff" stroke="#1a73e8" stroke-width="0.6"/><text y="1.05" font-size="2.9" text-anchor="middle" dominant-baseline="middle">🚚</text></g>`;
 }else{
  marks+=`<g style="pointer-events:none"><circle cx="${me.x}" cy="${me.y}" r="3.2" fill="rgba(66,133,244,.16)"/><circle cx="${me.x}" cy="${me.y}" r="2.1" fill="#fff" stroke="#1a73e8" stroke-width="0.6"/><path d="M${me.x},${me.y-1.45} L${me.x+1.05},${me.y+1.25} L${me.x},${me.y+0.6} L${me.x-1.05},${me.y+1.25} Z" fill="#1a73e8"/></g>`;
  labels+=`<text x="${me.x}" y="${me.y-4.4}" font-size="3.4" font-weight="800" fill="#0a8f60" stroke="#fff" stroke-width="0.8" paint-order="stroke" text-anchor="middle" style="pointer-events:none">${me.n}</text>`;
 }
 // 点击热区
 CITIES.forEach(c=>{hits+=`<circle data-act="city" data-id="${c.id}" cx="${c.x}" cy="${c.y}" r="4.2" fill="rgba(0,0,0,0)" style="cursor:pointer"/>`});
 let info='';
 if(sel){
  const d=routeDist(S.city, sel.id), hh=estHours(S.city, sel.id, tStat().load*0.3);
  info=`<div class="cinfo">
   <h3>📍 ${sel.n} <span class="muted">${sel.d}</span></h3>
   <div class="crow"><span>距你约 ${d} 公里 · 空驶约 ${tspan(hh)}</span><span>油价 ¥${(S.fuelBase*sel.bias).toFixed(2)}/L</span></div>
   <div class="crow"><span>${sel.big>=2?'🏙️ 有维修厂 · 旅馆':'🏕️ 小旅馆 · 路边修理铺'}</span><span>${sel.big>=2?'货源充足':'货源一般'}</span></div>
   <div class="mbtns">${sel.id!==S.city?`<button class="btn pri" data-act="deadhead" data-id="${sel.id}">空驶前往</button>`:'<button class="btn ghost" disabled>你在这里</button>'}<button class="btn ghost" data-act="cityClose">收起</button></div>
  </div>`;
 }
 if(mapLastCity!==S.city){mapLastCity=S.city;focusHome()}
 // 行程进度卡
 if(J){
  const cg=J.order?CARGO.find(c=>c.id===J.order.cg):null;
  const jt=J.order?`${cg.i} ${cg.n} ${J.order.tons}吨 → ${cityById(J.dest).n}`:`空驶 · 前往${cityById(J.dest).n}`;
  const mks=journeyProgMarks(J).map(m=>`<i class="${m.kind}" style="left:${clamp(m.at/(J.totalKm||1)*100,0,100).toFixed(2)}%" title="${m.name}"></i>`).join('');
  jcard=`<div class="jcard">
   <div class="jhead"><b>🚚 ${jt}</b><span class="jstate" id="jState">行驶中</span></div>
   <div class="jprog"><i id="jProgFill"></i><span class="jmarks">${mks}</span></div>
   <div class="jrow" id="jRow1"></div>
   <div class="jrow" id="jRow2"></div>
   <div class="jctlrow">
    <div class="jseg" id="jModeSeg">
     <button data-act="dmode" data-m="eco">🐢 经济</button>
     <button data-act="dmode" data-m="std">🚚 标准</button>
     <button data-act="dmode" data-m="fast">🏎️ 快速</button>
    </div>
    <button class="jctl" data-act="dspeed" id="jTsBtn">⏩ ×${S.timeScale}</button>
    <button class="jctl" data-act="cancelJourney" style="color:#e05346">${J.order?'✖ 取消运单':'✖ 取消行程'}</button>
   </div>
  </div>`;
 }
 el.innerHTML=`<div class="mapwrap" id="mapWrap">
  <svg id="mapSvg" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
   <rect x="-30" y="-30" width="158" height="264" fill="#f2f3ea"/>
   ${grid}${decor}${water}${roadsC}${roadsF}${route}${pois}${marks}${hits}${labels}
  </svg>
  <div class="mloc"><span class="mpin">${J?'🚚':'📍'}</span><span class="mloc-t">${J?`行驶中 → <b>${cityById(J.dest).n}</b>`:`当前: <b>${me.n}市 · ${me.z}</b>`}</span><span class="mloc-r">油价 ¥${fuelPrice().toFixed(2)}/L</span></div>
  <div class="mzoom"><button data-act="mapzoom" data-d="in">＋</button><button data-act="mapzoom" data-d="out">－</button></div>
  <button class="mlocate" data-act="maplocate" title="回到当前位置">⌖</button>
  <div class="mlegend"><span><i style="background:#ffce55;border:1px solid #e0a83c"></i>高速</span><span><i style="background:#fff;border:1px solid #cfcabb"></i>国道</span><span><i style="background:#0a8f60;border-radius:50%;width:7px;height:7px"></i>服务区</span><span><i style="background:#fff;border:1px solid #7a5fd0;border-radius:50%;width:7px;height:7px"></i>南屿城市</span><span><i style="height:0;width:12px;border-top:2px dashed #8a9080"></i>国界</span><span><i style="background:#1a73e8;border-radius:50%;width:7px;height:7px"></i>当前位置</span></div>
 </div>${jcard}${info}
 <div class="sect" style="margin:10px 12px 0"><h4>行驶须知</h4><div class="mbody" style="font-size:11px;color:#777;line-height:1.8">地图可拖动，按钮或双指缩放（桌面可用滚轮）。点城市看详情、空驶前往。高速快但有收费站，国道免费但费时伤车；途中只有服务区能加油、休息。向南跨过界河的三处口岸，就是邻国南屿的地界——油价更便宜，路程也更远。</div></div>`;
 bindMapPan();
 if(J)updateJourneyMap();
}

/* ================= 行程：地图展示辅助 ================= */
function journeyPathOf(j){
 if(j.path&&j.path.length>1)return j.path;
 const p=[];
 (j.steps||[]).forEach(s=>{
  if(!s.e)return;
  if(!p.length){p.push(s.e.a,s.e.b);return}
  if(p[p.length-1]===s.e.a)p.push(s.e.b);
  else if(p[p.length-1]===s.e.b)p.push(s.e.a);
 });
 return p.length?p:[S.city,j.dest];
}
function journeyPointAt(j,frac){
 const p=journeyPathOf(j), pts=p.map(id=>cityById(id)), es=pathEdges(p);
 const total=es.reduce((s,e)=>s+e.km,0)||1;
 let d=clamp(frac,0,1)*total;
 for(let i=0;i<es.length;i++){
  if(d<=es[i].km||i===es.length-1){
   const t=es[i].km?d/es[i].km:1;
   return {x:pts[i].x+(pts[i+1].x-pts[i].x)*t, y:pts[i].y+(pts[i+1].y-pts[i].y)*t};
  }
  d-=es[i].km;
 }
 return {x:pts[pts.length-1].x,y:pts[pts.length-1].y};
}
function updateJourneyMap(){
 const j=S&&S.journey; if(!j)return;
 // 地图会被 renderMap 重建，不能用 ge() 的元素缓存，须实时查 DOM
 const g=document.getElementById('jTruckG');
 if(g){const pt=journeyPointAt(j,(j.doneKm||0)/(j.totalKm||1));g.setAttribute('transform',`translate(${pt.x.toFixed(2)},${pt.y.toFixed(2)})`)}
 const fill=document.getElementById('jProgFill'); if(fill)fill.style.width=clamp((j.doneKm||0)/(j.totalKm||1)*100,0,100)+'%';
 const st=document.getElementById('jState');
 if(st){const txt=j.paused?('已暂停'+(j.pauseReason?' · '+j.pauseReason:'')):(j.tollWait?'收费站缴费':(j.brWait?'口岸过关':(j.saWait?'服务区':'行驶中')));st.textContent=txt;st.classList.toggle('paused',!!j.paused)}
 const r1=document.getElementById('jRow1');
 if(r1){
  const from=cityById(journeyPathOf(j)[0]);
  r1.innerHTML=`<b>${from.n} → ${cityById(j.dest).n}</b><span>已行 ${Math.round(j.doneKm||0)}/${Math.round(j.totalKm)} km</span>`;
 }
 const r2=document.getElementById('jRow2');
 if(r2){
  const remH=Math.max(0,(j.totalKm-(j.doneKm||0))/Math.max(20,j.spd||40));
  let eta=`预计 ${thhmm(S.T+remH)} 到达`;
  const over=j.order&&j.order.deadline-S.T-remH<0;
  if(j.order){const left=j.order.deadline-S.T-remH; eta+=left>=0?` · 限时余${tspan(left)}`:' · ⚠️已超时'}
  r2.innerHTML=`<span>${j.cur?`当前 ${j.cur.e.name} · 现速 <b style="color:#0a8f60">${Math.round(j.spd||0)} km/h</b>`:'正在出发…'}</span><span>${eta}</span>`;
  r2.classList.toggle('warn',!!over);
 }
 const seg=document.getElementById('jModeSeg');
 if(seg)seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.m===S.speedMode));
 const ts=document.getElementById('jTsBtn'); if(ts)ts.textContent='⏩ ×'+S.timeScale;
}

/* ================= 财务页 ================= */
function netWorth(){return S.cash-S.debt}
function renderFinance(){
 const el=$('#view-finance');
 const nw=netWorth();
 const pct=clamp((100000000-S.debt)/1000000,0,100); // 还债进度：债务每减 1% 加一格
 const rows=S.ledger.slice(-14).reverse().map(l=>
  `<div class="ledrow"><div class="lt"><b>${l.t}</b><span>第${tday(l.T)}天 ${thhmm(l.T)}</span></div><div class="lv ${l.v>=0?'plus':'minus'}">${l.v>=0?'+':''}${money(l.v)}</div></div>`).join('');
 el.innerHTML=`
 <div class="bigcard">
  <div class="muted" style="color:#9fb8ac">可用余额</div>
  <div class="bn">${money(S.cash)}</div>
  <div class="bnrow">
   <div><div class="muted" style="color:#9fb8ac">待还债务</div><div class="bn2" style="color:#ffb4a8">${money(S.debt)}</div></div>
   <div><div class="muted" style="color:#9fb8ac">净资产</div><div class="bn2">${nw>=0?'+':''}${money(nw)}</div></div>
  </div>
  ${S.pending&&S.pending.length?`<p style="margin:8px 0 0;font-size:11px;color:#ffd98e">💌 在途运费（回单）${money(S.pending.reduce((s,p)=>s+p.amt,0))} · 最早 ${tspan(Math.max(0,Math.min.apply(null,S.pending.map(p=>p.dueT))-S.T))} 后到账</p>`:''}
  <div class="dprog"><div class="track"><div class="fill" style="width:${pct}%"></div></div>
  <p>${S.flags.win?`🕊️ 债务已还清 · 无上限自由经营中 · 净资产 ${money(nw)}`:`还债进度 · 每日利息 ¥${fmt(S.debt*0.0003)} + 生活费 ¥${S.lifeCost} · 基本目标：还清 1 亿债务`}</p></div>
  <div class="qgrid">
   <button class="qbtn" data-act="repay" data-v="1000000">还 100 万</button>
   <button class="qbtn" data-act="repay" data-v="5000000">还 500 万</button>
   <button class="qbtn" data-act="repay" data-v="20000000">还 2000 万</button>
   <button class="qbtn" data-act="repayCustom">自定义还</button>
  </div>
 </div>
 <div class="sect"><h4>近期流水</h4><div class="ledger" style="box-shadow:none;padding:0">${rows||'<div class="muted" style="padding:12px 0">暂无记录</div>'}</div></div>`;
}
function addLedger(t,v){ S.ledger.push({t, v:Math.round(v), T:S.T}); if(S.ledger.length>60)S.ledger=S.ledger.slice(-60); }

function addLedger(t,v){ S.ledger.push({t, v:Math.round(v), T:S.T}); if(S.ledger.length>60)S.ledger=S.ledger.slice(-60); }

/* ================= 理财页：存款 / 股票 / 基金 ================= */
function amtInputHtml(id,max,placeholder){
 return `<input id="${id}" type="number" inputmode="decimal" min="0" max="${max}" placeholder="${placeholder||'手动输入金额'}" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #dfe3e8;border-radius:10px;font-size:15px;font-weight:700;margin-top:8px">`;
}
function amtChipsHtml(id,max,presets){
 let list=(presets||[[5000,'5千'],[20000,'2万'],[100000,'10万'],[max,'全部']]).map(c=>[Math.min(c[0],max),c[1]]);
 list=list.filter(c=>c[0]>0); // 超过上限的筹码直接不显示，避免标签误导
 const uniq=[];const seen=new Set();
 for(const c of list){const v=Math.round(c[0]);if(v<=0||seen.has(v))continue;seen.add(v);uniq.push(c);}
 return `<div style="display:flex;gap:6px;margin-top:6px">${uniq.map(c=>`<button class="btn ghost" data-act="amtFill" data-target="${id}" data-v="${c[0]}" style="flex:1;padding:7px 0;font-size:12px">${c[1]}</button>`).join('')}</div>`;
}
/* 通用金额弹窗：手动输入 + 快捷填充 + 确认回调 */
function amountModal(o){
 const chips=amtChipsHtml(o.inputId,o.max,o.chips);
 askModal({center:true,title:o.title,tag:o.tag||'',
  body:(o.body||'')+(o.noInput?'':amtInputHtml(o.inputId,o.max,o.placeholder))+chips,
  buttons:[{t:o.okLabel||'确认',cls:o.okCls||'pri',fn:()=>{
   const inp=document.getElementById(o.inputId);
   let v=parseFloat(inp&&inp.value)||0;
   if(!o.float)v=Math.floor(v);
   if(v<=0){toast(o.unitName?('请输入'+o.unitName):'请输入金额');return}
   if(v>o.max){toast('超出可'+(o.unitName||'用金额')+'（最多 '+money(o.max)+'）');return}
   o.onOk(v);
  }},{t:'返回',cls:'ghost',fn:()=>{}}]});
}
function openDepositIn(){
 ensureFinance();
 if(S.cash<100){toast('现金不足');return}
 amountModal({title:'💰 存入活期',tag:'每日利率 0.05%',inputId:'depInAmt',max:S.cash,
  body:`现金 ${money(S.cash)} → 活期随存随取，每日结算利息。`,
  okLabel:'确认存入',onOk:v=>depIn(v)});
}
const STOCKS=[
 {id:'syl', n:'顺远物流', base:12.5,  drift:0.00045, vol:0.009, rev:0.003},
 {id:'jtk', n:'金汀矿业', base:8.8,   drift:0.00030, vol:0.016, rev:0.002},
 {id:'hxy', n:'海隅水产', base:5.6,   drift:-0.00015,vol:0.012, rev:0.003},
 {id:'wlj', n:'望川科技', base:23.0,  drift:0.00070, vol:0.020, rev:0.0015},
 {id:'tyz', n:'铁原重工', base:15.2,  drift:0.00035, vol:0.014, rev:0.002},
 {id:'ynl', n:'云岭能源', base:9.4,   drift:0.00040, vol:0.019, rev:0.0018},
 {id:'xhz', n:'玄湖种业', base:6.8,   drift:0.00022, vol:0.008, rev:0.0025},
 {id:'qfb', n:'栖凤百货', base:4.2,   drift:0.00020, vol:0.007, rev:0.003},
 {id:'qywl',n:'青崖文旅', base:7.5,   drift:0.00030, vol:0.026, rev:0.0012},
 {id:'bxgw',n:'白汐港务', base:11.8,  drift:0.00028, vol:0.006, rev:0.0025},
 {id:'lmsq',n:'鹿鸣山泉', base:18.6,  drift:0.00055, vol:0.010, rev:0.002},
 {id:'lyly',n:'岚烟林业', base:3.6,   drift:-0.00012,vol:0.013, rev:0.003},
];
const FUNDS=[
 {id:'idx', n:'雁回指数基金', base:1.5000, drift:0.00030, vol:0.004, rev:0.001, fee:0.005},
 {id:'bnd', n:'稳健债券基金', base:1.2000, drift:0.00018, vol:0.0015,rev:0.001, fee:0.005},
 {id:'res', n:'铁原资源指数', base:1.3200, drift:0.00026, vol:0.009, rev:0.001, fee:0.005},
 {id:'tec', n:'望川科技基金', base:2.0500, drift:0.00045, vol:0.013, rev:0.0008,fee:0.005},
 {id:'agr', n:'玄湖农业基金', base:0.9800, drift:0.00020, vol:0.006, rev:0.001, fee:0.005},
 {id:'mm',  n:'沧澜货币现金宝', base:1.0100, drift:0.00006, vol:0.0008,rev:0.002, fee:0.002},
];
const FIXED_DAYS=3, FIXED_RATE=0.002, DEMAND_RATE=0.0005; // 定期3天+0.6%，活期每日0.05%
function ensureFinance(){
 S.finance=S.finance||{deposit:0,fixed:[]};
 S.finance.fixed=S.finance.fixed||[];
 S.finance.stocks=S.finance.stocks||{};
 S.finance.funds=S.finance.funds||{};
 S.market2=S.market2||{};
 STOCKS.forEach(s=>{ if(!S.market2[s.id])S.market2[s.id]={price:s.base,open:s.base}; });
 FUNDS.forEach(f=>{ if(!S.market2[f.id])S.market2[f.id]={price:f.base,open:f.base}; });
}
/* 行情推进：每游戏小时走一步（而不是每 1.6 秒心跳走一步），跨天重置今日开盘价 */
function updateMarket(){
 ensureFinance();
 const hour=Math.floor(S.T);
 if(S.mktHour===undefined)S.mktHour=hour-1;
 if(S.mktDay===undefined)S.mktDay=tday(S.T);
 if(tday(S.T)!==S.mktDay){ // 新的一天：今日涨跌以昨收为基准
  S.mktDay=tday(S.T);
  STOCKS.forEach(s=>{S.market2[s.id].open=S.market2[s.id].price;});
  FUNDS.forEach(f=>{S.market2[f.id].open=S.market2[f.id].price;});
 }
 if(hour<=S.mktHour)return;
 let steps=Math.min(24,hour-S.mktHour); // 睡觉/快进后最多补 24 小时行情
 S.mktHour=hour;
 while(steps-->0){
  STOCKS.forEach(s=>{
   const m=S.market2[s.id];
   let ch=(Math.random()-0.5)*2*s.vol+s.drift+(s.base-m.price)/s.base*s.rev;
   if(S.stockNews&&S.stockNews.id===s.id)ch+=S.stockNews.dailyChg/24; // 新闻：当日缓涨缓跌分摊到每小时
   m.price=Math.max(0.5,+((m.price)*(1+ch)).toFixed(2));
  });
  FUNDS.forEach(f=>{
   const m=S.market2[f.id];
   const ch=(Math.random()-0.5)*2*f.vol+f.drift+(f.base-m.price)/f.base*f.rev;
   m.price=Math.max(0.2,+((m.price)*(1+ch)).toFixed(4));
  });
  ipoHourTick(); /* 自家上市公司股票：每小时微波动（新闻当日分摊） */
 }
}
function investTotal(){
 ensureFinance();
 let tot=S.finance.deposit;
 S.finance.fixed.forEach(f=>tot+=f.amt);
 (S.loans||[]).forEach(l=>tot+=l.amt);
 STOCKS.forEach(s=>{const p=S.finance.stocks[s.id];if(p&&p.shares>0)tot+=p.shares*S.market2[s.id].price;});
 FUNDS.forEach(f=>{const p=S.finance.funds[f.id];if(p&&p.units>0)tot+=p.units*S.market2[f.id].price;});
 tot+=bizAssetValue(); /* 实体产业按 60% 残值计入 */
 tot+=ipoMarketValue(); /* 自家上市公司持股按市值计入 */
 return tot;
}
function depIn(v){
 ensureFinance();
 v=Math.min(v,S.cash); if(v<=0){toast('现金不足');return}
 S.cash-=v;S.finance.deposit+=v;
 toast('已存入 '+money(v));renderAll();
}
function openDepositOut(){
 ensureFinance();
 if(S.finance.deposit<=0){toast('活期余额为零');return}
 amountModal({title:'💰 从活期取出',tag:'余额 '+money(S.finance.deposit),inputId:'depOutAmt',max:S.finance.deposit,
  okLabel:'确认取出',onOk:v=>depOut(v)});
}
function depOut(v){
 ensureFinance();
 v=Math.min(v,S.finance.deposit); if(v<=0)return;
 S.finance.deposit-=v;S.cash+=v;
 toast('已取出 '+money(v));renderAll();
}
function openFixedIn(){
 ensureFinance();
 if(S.cash<1000){toast('现金不足（定期起存 ¥1,000）');return}
 amountModal({title:'🏦 存 '+FIXED_DAYS+' 天定期',tag:'到期总收益 +'+Math.round(FIXED_RATE*FIXED_DAYS*1000)/10+'%',
  body:'定期期间资金锁定，到期自动转入活期。',inputId:'fixInAmt',max:S.cash,
  chips:[[20000,'2万'],[100000,'10万'],[S.cash,'全部']],
  okLabel:'确认存入',onOk:v=>{
   if(v<1000){toast('低于起存金额 ¥1,000');return}
   fixIn(v);
  }});
}
function fixIn(v){
 ensureFinance();
 v=Math.min(v,S.cash); if(v<1000){toast('低于起存金额');return}
 S.cash-=v;
 S.finance.fixed.push({amt:v,dueT:S.T+FIXED_DAYS*24,rate:FIXED_RATE});
 toast('已存定期 '+money(v)+'，'+FIXED_DAYS+' 天后到期');renderAll();
}
function openStockBuy(id){
 ensureFinance();
 const s=STOCKS.find(x=>x.id===id),m=S.market2[id];
 if(S.cash<1000){toast('现金不足（起买 ¥1,000）');return}
 amountModal({title:`📈 买入 ${s.n}`,tag:'现价 '+m.price,inputId:'stkBuyAmt',max:S.cash,
  chips:[[1000,'1千'],[10000,'1万'],[50000,'5万'],[S.cash,'全仓']],
  body:`现金 ${money(S.cash)}，按现价可买约 ${Math.floor(S.cash/m.price)} 股。`,
  okLabel:'确认买入',onOk:v=>{
   const shares=Math.floor(v/m.price); if(shares<=0){toast('金额不足买 1 股');return}
   const cost=Math.round(shares*m.price);
   const p=S.finance.stocks[id]||{shares:0,cost:0};
   p.cost+=cost; p.shares+=shares;
   S.finance.stocks[id]=p; S.cash-=cost;
   toast(`买入 ${s.n} ${shares} 股 @${m.price}`);renderAll();renderView();
  }});
}
function openStockSell(id){
 ensureFinance();
 const s=STOCKS.find(x=>x.id===id),m=S.market2[id];
 const p=S.finance.stocks[id];
 if(!p||p.shares<=0){toast('没有持仓');return}
 const shares0=p.shares;
 amountModal({title:`📉 卖出 ${s.n}`,tag:'现价 '+m.price,inputId:'stkSellAmt',max:shares0,
  chips:[[Math.floor(shares0*0.25),'1/4'],[Math.floor(shares0*0.5),'一半'],[shares0,'全部']],
  body:`持股 ${p.shares} 股，市值 ${money(Math.round(p.shares*m.price))}。输入要卖出的股数。`,
  unitName:'卖出股数',okLabel:'确认卖出',onOk:n=>{
   const shares=Math.floor(n); if(shares<=0){toast('持股不足');return}
   const v=Math.round(shares*m.price);
   p.shares-=shares; if(p.shares<=0)p.cost=0; else p.cost=Math.round(p.cost*(p.shares/(p.shares+shares)));
   S.cash+=v; toast(`卖出 ${s.n} ${shares} 股，到账 ${money(v)}`);renderAll();renderView();
  }});
}
function openFundBuy(id){
 ensureFinance();
 const f=FUNDS.find(x=>x.id===id),m=S.market2[id];
 if(S.cash<1000){toast('现金不足（起购 ¥1,000）');return}
 amountModal({title:`📈 买入 ${f.n}`,tag:'净值 '+m.price.toFixed(4)+' · 手续费 0.5%',inputId:'fundBuyAmt',max:S.cash,
  chips:[[5000,'5千'],[20000,'2万'],[S.cash,'全仓']],
  body:`现金 ${money(S.cash)}。基金波动小、长期稳赚，适合跑长途时放着。`,
  okLabel:'确认买入',onOk:v=>fundBuy(id,v)});
}
function fundBuy(id,v){
 ensureFinance();
 const f=FUNDS.find(x=>x.id===id),m=S.market2[id];
 v=Math.min(v,S.cash); if(v<1000){toast('低于起购金额');return}
 const units=+(v*(1-f.fee)/m.price).toFixed(2);
 if(units<=0){toast('金额不足');return}
 S.cash-=v;
 const p=S.finance.funds[id]||{units:0,cost:0};
 p.cost+=v; p.units=+(p.units+units).toFixed(2);
 S.finance.funds[id]=p;
 toast(`买入 ${f.n} ${units} 份`);renderAll();renderView();
}
function openFundSell(id){
 ensureFinance();
 const f=FUNDS.find(x=>x.id===id),m=S.market2[id];
 const p=S.finance.funds[id];
 if(!p||p.units<=0){toast('没有持仓');return}
 amountModal({title:`📉 卖出 ${f.n}`,tag:'净值 '+m.price.toFixed(4)+' · 手续费 0.5%',inputId:'fundSellAmt',max:p.units,float:true,
  chips:[[+(p.units/2).toFixed(2),'一半'],[p.units,'全部']],
  body:`持有 ${p.units} 份，市值 ${money(Math.round(p.units*m.price))}。输入要赎回的份数。`,
  unitName:'赎回份数',okLabel:'确认赎回',onOk:u=>fundSell(id,u)});
}
function fundSell(id,units){
 ensureFinance();
 const f=FUNDS.find(x=>x.id===id),m=S.market2[id];
 const p=S.finance.funds[id]; if(!p||p.units<=0)return;
 units=Math.min(units,p.units); if(units<=0)return;
 const v=Math.round(units*m.price*(1-f.fee));
 p.units=+(p.units-units).toFixed(2); if(p.units<=0.01){p.units=0;p.cost=0;} else p.cost=Math.round(p.cost*(1-units/(p.units+units)));
 S.cash+=v;
 toast(`赎回 ${f.n}，到账 ${money(v)}`);renderAll();renderView();
}
/* ================= 刮刮乐 ================= */
const SCRATCH_CARDS=[
 {n:'惠民卡', price:10,   desc:'小奖多 · 回本快',        table:[[0,60],[1,25],[2,10],[5,4],[20,0.9],[50,0.1]]},
 {n:'标准卡', price:50,   desc:'经典款 · 大奖可期',      table:[[0,70],[1,18],[2,7],[5,3],[20,0.8],[100,0.3]]},
 {n:'尊享卡', price:200,  desc:'大额奖金 · 刺激翻倍',    table:[[0,78],[1,12],[2,6],[5,2.5],[10,1],[50,0.4],[200,0.1]]},
 {n:'王牌卡', price:2000, desc:'胜率最高 · 头奖 ¥20 万', table:[[0,70],[1,15],[2,8],[5,4],[10,2],[20,0.6],[100,0.15]]},
];
function openScratch(ci){
 ensureFinance();
 const card=SCRATCH_CARDS[ci]; if(!card)return;
 if(S.cash<card.price){toast('现金不足');return}
 S.cash-=card.price;addLedger('刮刮乐 · '+card.n,-card.price);renderCash();
 const entry=weightedPick(card.table.map(t=>({mul:t[0],w:t[1]})));
 const amount=Math.round(card.price*entry.mul);
 if(amount>0)gain(amount,'刮刮乐中奖');
 const jackpot=entry.mul>=100;
 const w=askModal({center:true,title:'🎫 '+card.n+' · '+money(card.price),tag:jackpot?'刮刮乐':'',
  body:`<div class="scratch-wrap"><div class="prize" style="${jackpot?'color:#ffd700;font-size:24px':''}">${jackpot?'🎉 头奖 🎉<br>':''}${amount>0?'中奖 '+money(amount):'谢谢惠顾'}</div><canvas id="scratchCv" width="300" height="130"></canvas></div>`,
  buttons:[{t:'收下',cls:'pri',fn:()=>{}}]});
 initScratch(w.el,()=>AUDIO.sfx(jackpot?'jackpot':(amount>0?'win':'lose')));
 if(jackpot)nav('🎊 重大喜讯：本市中心刮出'+card.n+'头奖 '+money(amount)+'！');
}
function initScratch(wel,onDone,opt){
 opt=opt||{};
 const cv=wel.querySelector('#scratchCv'); if(!cv)return;
 const ctx=cv.getContext('2d');
 const W=cv.width,H=cv.height;
 const g=ctx.createLinearGradient(0,0,W,H);
 g.addColorStop(0,opt.c0||'#c8cdd4');g.addColorStop(0.5,opt.c1||'#eef1f5');g.addColorStop(1,opt.c2||'#b3b9c1');
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle=opt.tc||'#7d858f';ctx.font='bold 22px sans-serif';ctx.textAlign='center';
 ctx.fillText(opt.text||'刮 开 此 处',W/2,H/2+8);
 let drawing=false,cnt=0,done=false;
 const pos=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height)]};
 const erase=(x,y)=>{ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();};
 const finish=()=>{
  if(done)return;done=true;
  cv.style.transition='opacity .5s';cv.style.opacity='0';cv.style.pointerEvents='none';
  setTimeout(()=>cv.remove(),500);
  if(onDone)onDone();
 };
 cv.addEventListener('pointerdown',e=>{drawing=true;const [x,y]=pos(e);erase(x,y);});
 cv.addEventListener('pointermove',e=>{
  if(!drawing||done)return;
  const [x,y]=pos(e);erase(x,y);
  if(++cnt>24&&(cnt&7)===0){
   const d=ctx.getImageData(0,0,W,H).data;let clear=0,tot=0;
   for(let i=3;i<d.length;i+=160){tot++;if(d[i]===0)clear++;}
   if(clear/Math.max(1,tot)>0.5)finish();
  }
 });
 window.addEventListener('pointerup',()=>{drawing=false;});
}
function futBet(dir){
 ensureFinance();
 if(S.cash<1000){toast('现金不足（起押 ¥1,000）');return}
 (S.fut=S.fut||[]);
 if(S.fut.length>=3){toast('最多同时持有 3 张期货合约');return}
 amountModal({title:dir==='up'?'📈 押涨 · 柴油期货':'📉 押跌 · 柴油期货',
  tag:`今日 ¥${S.fuelBase}/L · 押对赚 90%`,inputId:'futAmt',max:50000,
  chips:[[1000,'1千'],[10000,'1万'],[50000,'5万']],
  body:`判断明天开盘油价比今天（¥${S.fuelBase}/L）${dir==='up'?'高':'低'}，押对本息全拿还赚 90%，押错本金全无，持平退款。`,
  unitName:'押注金额',okLabel:'确认押注',onOk:v=>{
   S.cash-=v;addLedger('柴油期货押注',-v);
   S.fut.push({dir:dir,stake:v,at:S.fuelBase});
   toast((dir==='up'?'📈 押涨':'📉 押跌')+' '+money(v)+'，明天开盘见分晓');renderAll();renderView();
  }});
}
function openLoan(){
 ensureFinance();
 const max=Math.min(S.cash,50000);
 if(max<1000){toast('现金不足（起借 ¥1,000）');return}
 amountModal({title:'💸 放贷给司机',tag:'日息 2% · 3 天期',inputId:'loanAmt',max:max,
  chips:[[1000,'1千'],[5000,'5千'],[20000,'2万']],
  body:`到期本息 = 本金 × 1.06。约 90% 司机按时还款；<b style="color:#ff5000">10% 遇到老赖血本无归</b>。放出去的钱 3 天内不在理财总资产里。`,
  unitName:'放贷金额',okLabel:'确认放贷',onOk:v=>{
   S.cash-=v;addLedger('放贷',-v);
   const who=pick(SURNAMES)+pick(GIVEN);
   (S.loans=S.loans||[]).push({amt:v,dueT:S.T+72,who});
   toast('已放贷 '+money(v)+' 给司机 '+who+'，3 天后还款');renderAll();renderView();
  }});
}
/* ================= 娱乐页：开蚌 / 开石 ================= */
let funTab='pearl';
function ensureFun(){ S.fun=S.fun||{pearlN:0,stoneN:0,spent:0,got:0,hist:[]}; S.fun.hist=S.fun.hist||[]; }
function ensureDepot(){ S.depot=S.depot||{pearls:[],stones:[]}; S.depot.pearls=S.depot.pearls||[]; S.depot.stones=S.depot.stones||[]; }
/* 幸运加成：整体上调开蚌出珠 / 开石切涨概率（运营调这里即可） */
const PEARL_LUCK={empty:0.05,low:0.85,good:1.6}; /* 空蚌权重×0.05、半价回收×0.85、出珠×1.6 */
const STONE_LUCK=0.55, STONE_LUCK_MAX=0.95, RECUT_LUCK=0.30; /* 切涨+55%、上限95%、第二刀+30% */
function stoneEffUp(st){ return clamp(st.pUp+STONE_LUCK,0.05,STONE_LUCK_MAX); } /* 展示用实际涨率（不含手感异样） */
/* 蚌市货池：30 种轮换。table 为 [价格倍数, 权重]，出珠即店家按级回收 */
const PEARL_POOL=[
 {n:'破碎蚌壳', price:20, desc:'只剩半边壳，赌个寂寞', table:[[0,12],[0.5,58.8],[2,27],[6,1.85],[15,0.3],[50,0.05]]},
 {n:'沟渠臭蚌', price:30, desc:'味道上头，赌的就是口气', table:[[0,12],[0.5,53.7],[1.5,30.3],[4,2.9],[12,0.95],[25,0.25]]},
 {n:'田埂野蚌', price:60, desc:'田边顺手摸的，个头不大', table:[[0,10],[0.4,56.1],[1.6,29.45],[4,3.25],[12,0.95],[25,0.25]]},
 {n:'淡水小蚌', price:100, desc:'塘里现捞，出珠看命', table:[[0,10],[0.4,57.2],[1.6,28.1],[4,3.25],[12,1.25],[30,0.2]]},
 {n:'井底寒蚌', price:150, desc:'井水泡了几十年，寒气逼人', table:[[0,10],[0.5,65.8],[1.6,19.1],[4,3.5],[12,1.25],[30,0.25]]},
 {n:'稻田花蚌', price:180, desc:'花壳好看，珠也讲究', table:[[0,10],[0.5,53.6],[1.5,31.9],[3.5,3.15],[10,1.2],[22,0.15]]},
 {n:'芦苇荡蚌', price:220, desc:'苇荡野货，杂珠多', table:[[0,10],[0.4,47.5],[1.5,37.95],[3.5,3.4],[10,0.9],[20,0.25]]},
 {n:'河湾珠蚌', price:260, desc:'活水河湾货，珠气更足', table:[[0,10],[0.5,61.9],[1.5,22.75],[3.6,3.6],[10,1.55],[22,0.3]]},
 {n:'雪水蚌', price:350, desc:'雪山水喂大的，珠子凉润', table:[[0,10],[0.5,48],[1.4,37.15],[3.2,3.45],[9,1.15],[20,0.15]]},
 {n:'温泉暖蚌', price:420, desc:'温泉口的娇气蚌，空蚌少', table:[[0,10],[0.6,51.6],[1.4,33.55],[3,3.4],[8,1.3],[18,0.15]]},
 {n:'深水湖蚌', price:500, desc:'老渔民的私藏货，珠层更厚', table:[[0,10],[0.5,57.9],[1.4,26.75],[3.5,3.6],[10,1.55],[25,0.3]]},
 {n:'赤潮蚌', price:800, desc:'赤潮里硬活下来的狠货，性子烈', table:[[0,10],[0.5,60.5],[1.3,23.6],[3,3.75],[10,1.6],[25,0.55]]},
 {n:'深潭黑蚌', price:900, desc:'黑皮深潭货，紫气极重', table:[[0,10],[0.5,57.5],[1.4,26.95],[3,3.75],[10,1.6],[25,0.3]]},
 {n:'珍珠王蚌', price:1200, desc:'一蚌双珠的大家伙', table:[[0,10],[0.5,54.4],[1.4,30],[3.2,3.65],[9,1.65],[20,0.3]]},
 {n:'沉船蚌', price:1600, desc:'老渔船底抠出来的，带着海腥味', table:[[0,10],[0.5,52],[1.4,32.65],[3.2,3.85],[9,1.35],[20,0.25]]},
 {n:'双生蚌', price:2000, desc:'连体双蚌，据说会出对珠', table:[[0,10],[0.5,50.7],[1.4,34.3],[3,3.35],[9,1.45],[20,0.2]]},
 {n:'血蚌 · 稀品', price:2500, desc:'传说中的出金蚌，一刀万珠', table:[[0,10],[0.5,55.7],[1.4,28.7],[3,3.65],[9,1.65],[20,0.4]]},
 {n:'老蚌 · 三十年', price:3800, desc:'老蚌欲裂，一刀天一刀地', table:[[0,10],[0.4,66.2],[1.5,18.2],[4,3.65],[12,1.4],[30,0.55]]},
 {n:'珊瑚盘蚌', price:4800, desc:'珊瑚盘里的美容蚌', table:[[0,10],[0.5,64.1],[1.3,9.65],[2.8,14.7],[8,1.45],[18,0.2]]},
 {n:'金沙蚌', price:6000, desc:'金沙江里捞的，十蚌九空但有奇珍', table:[[0,10],[0.5,70.1],[1.3,2.95],[2.8,14.8],[8,1.75],[18,0.4]]},
 {n:'冰川蚌', price:7500, desc:'万年冰川融水养大，珠心极硬', table:[[0,10],[0.5,72],[1.3,0.75],[2.8,15],[9,1.9],[20,0.35]]},
 {n:'夜光蚌', price:9000, desc:'夜里会发光，妖气逼人', table:[[0,10],[0.5,71.3],[1.3,3.05],[2.8,13.7],[9,1.55],[22,0.4]]},
 {n:'墨蚌', price:11000, desc:'通体乌黑，专出墨珠', table:[[0,10],[0.5,51.9],[1.3,32.75],[3,3.6],[9,1.45],[24,0.4]]},
 {n:'妖蚌 · 传说', price:15000, desc:'蚌市压秤的镇市之宝', table:[[0,10],[0.5,68.3],[1.3,4.8],[2.8,15.1],[8,1.5],[16,0.4]]},
 {n:'琉璃蚌', price:18000, desc:'壳薄如琉璃，珠光惊人', table:[[0,10],[0.5,70.1],[1.3,3.15],[2.9,15.1],[9,1.4],[22,0.25]]},
 {n:'凤羽蚌', price:26000, desc:'壳纹似凤羽，传说出凤珠', table:[[0,10],[0.5,64.4],[1.3,19.7],[3,3.75],[10,1.6],[30,0.55]]},
 {n:'龙宫蚌 · 神话', price:30000, desc:'图志里的传说，十开九空', table:[[0,8],[0.5,75.9],[1.3,0.45],[2.8,13.6],[9,1.65],[40,0.4]]},
 {n:'月光蚌', price:33000, desc:'月圆之夜才肯开壳', table:[[0,8],[0.5,62.8],[1.3,23.4],[3,3.75],[10,1.65],[28,0.4]]},
 {n:'鲛人泪 · 禁售', price:45000, desc:'渔民都说这蚌哭过', table:[[0,8],[0.5,80.1],[1.3,5.35],[3,3.65],[10,2.15],[30,0.75]]},
 {n:'龙涎蚌', price:60000, desc:'深海巨物，一口价一奢侈', table:[[0,8],[0.5,72.8],[1.3,13.05],[3,3.85],[10,1.85],[40,0.45]]},
];
/* 石头货池：30 种轮换。pUp 切涨概率；grades 为 [价格倍数, 权重]；第二刀 p2 再涨则倍数上翻 sec 区间，切跨分文不剩 */
const STONE_POOL=[
 {n:'瓦砾小料', price:80, desc:'碎石堆里刨的，纯图一乐', pUp:0.90, grades:[[1.3,98.32],[2,0],[3.5,1],[7,0.69],[15,0.09]], p2:0.5, sec:[1.1,1.8]},
 {n:'河沟磨光料', price:150, desc:'河沟捡的练手料，亏不到哪去', pUp:0.84, grades:[[1.4,98.57],[2.2,0],[4,0.75],[8,0.69],[18,0.09]], p2:0.5, sec:[1.2,2]},
 {n:'碎皮小料', price:300, desc:'巴掌大的练手料，亏不到哪去', pUp:0.76, grades:[[1.5,98.5],[2.4,0],[4.5,0.6],[9,0.75],[20,0.15]], p2:0.5, sec:[1.3,2.1]},
 {n:'山皮水料', price:400, desc:'山皮水冲出来的圆疙瘩', pUp:0.80, grades:[[1.4,98.2],[2.2,0],[4.2,0.9],[8,0.75],[16,0.15]], p2:0.5, sec:[1.2,2]},
 {n:'蒙头料', price:500, desc:'全蒙皮看运气，一刀穷一刀富', pUp:0.68, grades:[[1.6,98.2],[2.4,0],[4.5,0.75],[9,0.9],[22,0.15]], p2:0.5, sec:[1.3,2.2]},
 {n:'老场口砖料', price:800, desc:'老场口出的砖头料，赌个翻身', pUp:0.64, grades:[[1.6,97.97],[2.5,0],[4.6,0.9],[9,0.99],[20,0.24]], p2:0.48, sec:[1.3,2.1]},
 {n:'脱砂料', price:1100, desc:'皮壳脱砂，行家最爱这一口', pUp:0.72, grades:[[1.4,97.1],[2.2,0.5],[4.2,1.2],[8.5,1.05],[17,0.15]], p2:0.52, sec:[1.3,2.1]},
 {n:'开窗蒙包料', price:1500, desc:'开过小窗又蒙上，赌个心跳', pUp:0.76, grades:[[1.5,97.1],[2.2,0.5],[4,1.2],[8,1.05],[16,0.15]], p2:0.52, sec:[1.3,2.1]},
 {n:'蜡壳料', price:1900, desc:'蜡状皮壳滑不留手，雾里看花', pUp:0.56, grades:[[1.7,97.3],[2.6,0],[4.8,1.2],[10,1.2],[24,0.3]], p2:0.48, sec:[1.3,2.2]},
 {n:'大块头料', price:2600, desc:'吨位压秤，涨了直接出货', pUp:0.60, grades:[[1.6,97.6],[2.6,0],[5,1.05],[10,1.05],[24,0.3]], p2:0.5, sec:[1.3,2.2]},
 {n:'翡壳包浆料', price:3200, desc:'包浆醇厚，老玩家蹲了半个月', pUp:0.64, grades:[[1.5,96.87],[2.4,0.5],[4.6,1.2],[9,1.29],[20,0.24]], p2:0.5, sec:[1.3,2.1]},
 {n:'半明料', price:4000, desc:'已开一窗见绿，风险小些', pUp:0.76, grades:[[1.4,97.1],[2.2,0.5],[4,1.2],[8,1.05],[16,0.15]], p2:0.55, sec:[1.3,2.1]},
 {n:'松花料', price:4800, desc:'皮上见松花，色赌在里头', pUp:0.54, grades:[[1.6,98],[2.8,0.5],[5,0],[10,1.2],[26,0.3]], p2:0.48, sec:[1.3,2.4]},
 {n:'黑乌纱皮料', price:5500, desc:'乌纱皮壳黑不溜秋，赌性极重', pUp:0.48, grades:[[1.6,98.9],[2.8,0.5],[5,0.3],[11,0],[28,0.3]], p2:0.48, sec:[1.3,2.4]},
 {n:'癣加绿料', price:7000, desc:'癣下藏绿，一刀见分晓', pUp:0.52, grades:[[1.7,97.77],[3,0.5],[5.5,0.3],[11,1.29],[28,0.24]], p2:0.46, sec:[1.3,2.4]},
 {n:'老坑半赌料', price:9000, desc:'老坑场口，半赌半凭眼力', pUp:0.52, grades:[[1.8,98.6],[3,0.5],[5.5,0.3],[10,0.3],[22,0.3]], p2:0.48, sec:[1.3,2.2]},
 {n:'白盐沙皮料', price:10000, desc:'盐沙皮白花花，种水的好兆头', pUp:0.56, grades:[[1.6,96.8],[2.6,0.5],[5,1.2],[10,1.2],[22,0.3]], p2:0.5, sec:[1.3,2.1]},
 {n:'赌手镯料', price:12000, desc:'切涨多半出镯芯，身价倍增', pUp:0.60, grades:[[1.8,98],[2.6,0.5],[4.6,0],[9,1.2],[18,0.3]], p2:0.55, sec:[1.3,2.1]},
 {n:'后江料', price:15000, desc:'后江小料起货猛，涨起来吓人', pUp:0.56, grades:[[1.7,98],[2.7,0.5],[5,0],[10,1.2],[20,0.3]], p2:0.52, sec:[1.3,2.1]},
 {n:'会卡料', price:17000, desc:'会卡场口，裂多绿也多', pUp:0.48, grades:[[1.8,97.77],[3,0.5],[5.5,0.3],[11,1.29],[26,0.24]], p2:0.46, sec:[1.3,2.4]},
 {n:'老坑全赌料', price:20000, desc:'石头行镇店之宝，一刀定富贵', pUp:0.44, grades:[[1.8,98.3],[3,0.5],[5.5,0.6],[10,0.3],[24,0.3]], p2:0.45, sec:[1.4,2.4]},
 {n:'木那料', price:28000, desc:'木那出名种，棉絮都值钱', pUp:0.46, grades:[[1.8,97.7],[3.2,0.5],[6,0.3],[12,1.2],[28,0.3]], p2:0.48, sec:[1.4,2.4]},
 {n:'赌色料', price:35000, desc:'赌的就是那抹绿，色进价翻', pUp:0.40, grades:[[1.6,98.5],[3,0],[6,0.6],[12,0.45],[30,0.45]], p2:0.42, sec:[1.4,2.5]},
 {n:'百三桥料', price:45000, desc:'百三桥场口，皮壳下谁也说不准', pUp:0.40, grades:[[2,98.9],[3.6,0.5],[6.5,0.3],[13,0],[32,0.3]], p2:0.42, sec:[1.4,2.5]},
 {n:'老帕敢料', price:52000, desc:'帕敢老场霸气回归，不是暴涨就是暴碎', pUp:0.36, grades:[[2,98.6],[3.8,0.5],[7,0.3],[14,0.15],[36,0.45]], p2:0.42, sec:[1.4,2.5]},
 {n:'帝王坑 · 传闻料', price:60000, desc:'据传出过帝王绿的坑口，十刀九跨', pUp:0.32, grades:[[2,98.6],[3.5,0.5],[6,0.3],[11,0.3],[26,0.3]], p2:0.4, sec:[1.4,2.7]},
 {n:'莫西沙玻璃标', price:80000, desc:'玻璃种标志皮壳，一票难求', pUp:0.36, grades:[[2,98.6],[3.8,0.5],[7,0.3],[14,0.15],[38,0.45]], p2:0.4, sec:[1.4,2.7]},
 {n:'翡翠原王 · 赌命料', price:120000, desc:'一口价拿命换的料，切跨跳河', pUp:0.29, grades:[[1.8,98.5],[3.5,0],[7,0.6],[14,0.45],[40,0.45]], p2:0.38, sec:[1.4,2.7]},
 {n:'老象皮 · 贡料', price:150000, desc:'象皮壳老场贡料，一刀定生死', pUp:0.28, grades:[[2,98.8],[4,0],[7.5,0.45],[15,0.3],[45,0.45]], p2:0.38, sec:[1.4,2.7]},
 {n:'神秘 · 无字料', price:200000, desc:'没有铭文的传说之料，全凭天意', pUp:0.25, grades:[[2.2,98.8],[4.5,0],[8,0.3],[16,0.45],[50,0.45]], p2:0.36, sec:[1.4,2.7]},
];
/* 每日随机上货：每天从货池抽 5 件，价格 ±10% 浮动、涨率微调，每件仅一份 */
function rollFunMarket(){
 const pick5=pool=>{
  const idx=[...pool.keys()];
  for(let i=idx.length-1;i>0;i--){const j=irnd(0,i);[idx[i],idx[j]]=[idx[j],idx[i]];}
  return idx.slice(0,5).map(i=>{
   const t=pool[i];
   const it={...t, price:Math.max(10,Math.round(t.price*rnd(0.92,1.1)/10)*10)};
   if(it.pUp!==undefined)it.pUp=clamp(+(it.pUp+rnd(-0.04,0.04)).toFixed(2),0.08,0.9);
   return it;
  });
 };
 S.fun.mkt={day:tday(S.T), pearls:pick5(PEARL_POOL), stones:pick5(STONE_POOL)};
 /* 每日第 5 个蚌/石固定为激励广告货：从货池随机一种（卡片显示真实货种），看广告免费领，可反复 */
 const adBase=PEARL_POOL[Math.floor(Math.random()*PEARL_POOL.length)];
 S.fun.mkt.pearls[4]={...adBase,adClam:true};
 const adStone=STONE_POOL[Math.floor(Math.random()*STONE_POOL.length)];
 S.fun.mkt.stones[4]={...adStone,adStone:true};
}
function ensureFunMarket(){
 ensureFun();
 if(!S.fun.mkt||S.fun.mkt.day!==tday(S.T))rollFunMarket();
 else{
  /* 兼容旧档：第 5 件缺失/带旧版已售标记/是旧版无货种条目时，重置为随机蚌种/石种 */
  const p4=S.fun.mkt.pearls&&S.fun.mkt.pearls[4];
  const realType=p4&&PEARL_POOL.some(t=>t.n===p4.n);
  if(!p4||!p4.adClam||p4.sold||!realType){
   const adBase=PEARL_POOL[Math.floor(Math.random()*PEARL_POOL.length)];
   S.fun.mkt.pearls[4]={...adBase,adClam:true};
  }
  const s4=S.fun.mkt.stones&&S.fun.mkt.stones[4];
  const realStone=s4&&STONE_POOL.some(t=>t.n===s4.n);
  if(!s4||!s4.adStone||s4.sold||!realStone){
   const adStone=STONE_POOL[Math.floor(Math.random()*STONE_POOL.length)];
   S.fun.mkt.stones[4]={...adStone,adStone:true};
  }
 }
}
function pearlGrade(m){
 if(m<=0)return{n:'空蚌（撬出只螺蛳）',i:'🐌',c:'#98a1a8'};
 if(m<1)return{n:'鱼目碎珠',i:'⚪',c:'#98a1a8'};
 if(m<3)return{n:'普通圆珠',i:'⚪',c:'#5f6b76'};
 if(m<10)return{n:'紫色妖珠',i:'🟣',c:'#8e5bd0'};
 if(m<20)return{n:'金珠',i:'🟡',c:'#c08a00'};
 if(m<100)return{n:'妖孽紫 · 蚌市头奖',i:'🔮',c:'#7b2ff2'};
 return{n:'琥珀金皇 · 千古一珠',i:'🏆',c:'#d4af37'};
}
function jadeGrade(m){
 if(m<2)return{n:'豆种',i:'🟢',c:'#6f9e57'};
 if(m<4)return{n:'糯种',i:'💚',c:'#3e9e78'};
 if(m<8)return{n:'冰种',i:'🧊',c:'#4aa3d0'};
 if(m<15)return{n:'玻璃种',i:'💎',c:'#3f8fd6'};
 return{n:'帝王绿 · 传世',i:'👑',c:'#0f9d58'};
}
function funRecord(kind,txt,net){ ensureFun(); S.fun.hist.unshift({k:kind,t:txt,v:Math.round(net),T:S.T}); if(S.fun.hist.length>10)S.fun.hist.pop(); }
/* 娱乐结果弹层：替换弹窗内容并自绑收尾按钮 */
function showFunResult(w,html,btnTxt){
 const sh=w.el.querySelector('.sheet');
 sh.innerHTML=html+`<div class="mbtns"><button class="btn pri">${btnTxt||'收下'}</button></div>`;
 sh.querySelector('.mbtns .btn').addEventListener('click',()=>w.close());
 renderAll();
}
function funBuyConfirm(o){
 askModal({center:true,title:o.title,tag:o.tag,
  body:o.body,
  buttons:[{t:o.ok,cls:'or',fn:()=>o.onOk()},{t:'算了',cls:'ghost'}]});
}
function openPearlBuy(i){
 ensureFunMarket();
 const b=S.fun.mkt.pearls[i]; if(!b)return;
 if(b.sold){toast('这只蚌已经被别人买走了');renderFun();return}
 if(S.cash<b.price){toast('现金不足，蚌店概不赊账');return}
 const top=Math.round(b.price*Math.max.apply(null,b.table.map(t=>t[0])));
 funBuyConfirm({title:'🦪 '+b.n,tag:'开蚌 · '+money(b.price),
  body:`${b.desc}。今日仅此一只，买下即放入<b>仓库</b>，什么时候撬开看运气，出的珍珠店家按级回收。运气好可出 <b class="price">${money(top)}</b> 的妖孽紫。`,
  ok:'买下 · 放入仓库',onOk:()=>buyPearl(b)});
}
/* 隐藏变数：约 11% 的货“手感异样”，可能是宝气（增益）也可能是暗伤（减益），开的那一刻才揭晓 */
function rollTrait(){ const r=Math.random(); return r<0.055?'treasure':(r<0.11?'dull':null); }
let _adClamIdx=4;
function openAdClamGet(i){
 ensureFunMarket();
 const b=S.fun.mkt.pearls[i]; if(!b||!b.adClam)return;
 if(b.sold){toast('今天的激励广告蚌已经领过了，明天再来');return}
 _adClamIdx=i;
 watchSupportAd('adClam');
}
let _adStoneIdx=4;
function openAdStoneGet(i){
 ensureFunMarket();
 const b=S.fun.mkt.stones[i]; if(!b||!b.adStone)return;
 if(b.sold){toast('今天的激励广告石已经领过了，明天再来');return}
 _adStoneIdx=i;
 watchSupportAd('adStone');
}
function buyPearl(b){
 if(S.cash<b.price){toast('现金不足');return}
 payCost(b.price,'开蚌 · '+b.n);
 S.fun.pearlN++;S.fun.spent+=b.price;b.sold=true;
 ensureDepot();
 S.depot.pearls.push({n:b.n,price:b.price,table:b.table,trait:rollTrait(),at:S.T});
 toast('🦪 '+b.n+' 已放入仓库，回「仓库」撬开它');
 save();renderAll();
}
/* 仓库撬蚌：瓜瓜乐式刮涂层，刮开蚌壳看有没有出珠（结果在下刀时已定） */
function openDepotPearl(i){
 ensureDepot();
 if(i<0||i>=S.depot.pearls.length)return;
 const b=S.depot.pearls.splice(i,1)[0];
 renderView(); // 从仓库列表即时移除
 const ent=weightedPick(b.table.map(t=>({mul:t[0],w:t[1]*(t[0]===0?PEARL_LUCK.empty:t[0]<1?PEARL_LUCK.low:PEARL_LUCK.good)})));
 let mul=ent.mul; const evs=[];
 if(ent.mul>0){
  const r=Math.random();
  if(r<0.0015){mul*=10;evs.push('🌟 九珠连珠 · 百年一遇 ×10！');}
  else if(r<0.0095){mul*=3;evs.push('✨ 双黄连珠 · 罕见喜事 ×3！');}
 }
 if(b.trait==='treasure'){mul*=1.5;evs.push('⚡ 果然异样：宝气涌动 · 价值 ×1.5！');}
 else if(b.trait==='dull'){mul*=0.6;evs.push('🌑 果然异样：珠光涣散 · 价值 ×0.6');}
 const val=Math.round(b.price*mul);
 const g=pearlGrade(mul);
 if(val>0){gain(val,'开蚌出珠');S.fun.got+=val;}
 funRecord('开蚌',g.n+(evs.length?'（事件）':''),val-b.price);
 if(mul>=12)nav('🔮 消息传开了：有司机在蚌市开出'+g.n+'，全蚌市都轰动了！');
 const w=askModal({center:true,title:'🦪 开蚌 · '+b.n,tag:'仓库开蚌 · 买价 '+money(b.price),
  body:`<p class="muted" style="text-align:center;margin:0 0 8px">小刀沿缝一挑，蚌壳张开一条缝——刮开涂层看看有没有珠！</p>
  <div class="scratch-wrap" style="background:linear-gradient(150deg,#41305e,#241a38)">
   <div class="prize" style="padding:16px 0"><div style="font-size:54px;line-height:1.2">${g.i}</div></div>
   <canvas id="scratchCv" width="300" height="110"></canvas>
  </div>
  <div id="pearlReward" style="margin-top:8px"></div>`,
  buttons:[{t:'收下',cls:'pri',fn:()=>{}}]});
 initScratch(w.el,()=>{
  const box=w.el.querySelector('#pearlReward'); if(!box)return;
  box.innerHTML=`<div class="funpop" style="background:rgba(0,0,0,.06);border-radius:10px;padding:9px 10px;text-align:center;font-size:12.5px">
   ${evs.map(e=>`<div style="font-weight:800;color:#c08a00">${e}</div>`).join('')}
   <div style="margin-top:2px">${val>0?`获得 <b style="color:${g.c}">${g.n}</b> · 店家回收 <b class="price">+${money(val)}</b>${val>b.price?'（净赚 '+money(val-b.price)+'）':''}`:`获得 <b style="color:${g.c}">${g.n}</b> · 一文不值，下把再来`}</div>
  </div>`;
 },{text:'✦ 刮 开 蚌 壳 ✦',c0:'#ead9e8',c1:'#f8eff5',c2:'#d2bcd4',tc:'#a8899e'});
}
function openStoneBuy(i){
 ensureFunMarket();
 const st=S.fun.mkt.stones[i]; if(!st)return;
 if(st.sold){toast('这块石头已经被别人切走了');renderFun();return}
 if(S.cash<st.price){toast('现金不足，石头行概不赊账');return}
 funBuyConfirm({title:'🪨 '+st.n,tag:'赌石 · '+money(st.price),
  body:`${st.desc}。今日仅此一块，买下即放入<b>仓库</b>，什么时候切都行。切涨了石头行按种水当场估价回收，<b style="color:#e05346">切跨了血本无归</b>。切涨概率约 ${Math.round(stoneEffUp(st)*100)}%，涨了还能赌第二刀。`,
  ok:'买下 · 放入仓库',onOk:()=>buyStone(st)});
}
function buyStone(st){
 if(S.cash<st.price){toast('现金不足');return}
 payCost(st.price,'开石 · '+st.n);
 S.fun.stoneN++;S.fun.spent+=st.price;st.sold=true;
 ensureDepot();
 S.depot.stones.push({n:st.n,price:st.price,pUp:st.pUp,grades:st.grades,p2:st.p2,sec:st.sec,trait:rollTrait(),at:S.T});
 toast('🪨 '+st.n+' 已放入仓库，回「仓库」开切');
 save();renderAll();
}
/* 仓库切石：下刀时才掷涨跨 */
function cutDepotStone(i){
 ensureDepot();
 if(i<0||i>=S.depot.stones.length)return;
 const st=S.depot.stones.splice(i,1)[0];
 renderView(); // 从仓库列表即时移除
 const w=askModal({center:true,title:'🪨 开石 · '+st.n,tag:'仓库切石 · 买价 '+money(st.price),
  body:`<div style="text-align:center;padding:12px 0 4px"><div style="font-size:56px">🪨</div><p class="muted" style="margin-top:6px">砂轮贴上石皮，水花四溅……</p></div>`,
  buttons:[{t:'⚡ 切第一刀',cls:'or',keep:true,fn:()=>{
   const eff=clamp(st.pUp+STONE_LUCK+(st.trait==='treasure'?0.12:st.trait==='dull'?-0.10:0),0.05,STONE_LUCK_MAX);
   if(!chance(eff)){
    const trLine=st.trait==='treasure'?'<div style="font-size:12px;font-weight:700;color:#c08a00;margin-top:4px">⚡ 宝光内蕴，也没救回来</div>':st.trait==='dull'?'<div style="font-size:12px;font-weight:700;color:#c08a00;margin-top:4px">🌑 果然异样：皮里暗伤，一碰就垮</div>':'';
    if(chance(0.06)){
     const back=Math.round(st.price*0.2);
     S.fun.got+=back;gain(back,'开石玉髓回血');
     funRecord('开石','切跨·玉髓回血',back-st.price);
     showFunResult(w,`<div style="text-align:center;padding:8px 0 2px"><div class="funpop" style="font-size:56px">🥀</div>
      <div style="font-size:16px;font-weight:800;color:#b07a12;margin-top:5px">切跨了 · 但有惊喜</div>${trLine}
      <div style="font-size:12px;color:#667;margin-top:5px">裂得稀碎，却意外切出一块玉髓，石头行含泪收走<br><b class="price">+${money(back)}</b> 回血</div></div>`);
     return;
    }
    const why=pick(['裂隙满身，一文不值','全是棉絮，废料一块','也就配压个咸菜缸','灰皮白肉，行家摇头']);
    funRecord('开石','切跨',-st.price);
    showFunResult(w,`<div style="text-align:center;padding:8px 0 2px"><div class="funpop" style="font-size:56px">💔</div>
     <div style="font-size:16px;font-weight:800;color:#e05346;margin-top:5px">切跨了</div>${trLine}
     <div style="font-size:12px;color:#98a1a8;margin-top:5px">${why} · ${money(st.price)}打了水漂</div></div>`);
    return;
   }
   const ent=weightedPick(st.grades.map(g=>({mul:g[0],w:g[1]})));
   let mul=ent.mul; const evs=[];
   const r=Math.random();
   if(r<0.01){mul=Math.max(mul*2,st.grades[st.grades.length-1][0]*1.2);evs.push('👑 帝王绿现世 · 千载难逢 ×2！');}
   else if(r<0.04){mul*=1.7;evs.push('🌿 满绿飘花 · 翠色欲流 ×1.7！');}
   else if(r<0.12){mul*=1.4;evs.push('💡 起荧 · 荧光耿耿 ×1.4！');}
   if(st.trait==='treasure'){mul*=1.2;evs.push('⚡ 果然异样：宝光内蕴 · 价值 ×1.2！');}
   else if(st.trait==='dull'){evs.push('🌑 果然异样：皮里暗伤 · 好在涨了');}
   stoneRiseModal(w,st,mul,1,evs);
  }}]});
}
/* 切涨：估价回收，或赌第二刀（最多两刀）；evs 为随机惊喜/特质事件 */
function stoneRiseModal(w,st,mult,cut,evs){
 const val=Math.round(st.price*mult);
 const g=jadeGrade(mult);
 const canRecut=cut<2;
 const evHtml=(evs||[]).map(e=>`<div style="font-size:12.5px;font-weight:800;color:#c08a00;margin-top:4px">${e}</div>`).join('');
 const sh=w.el.querySelector('.sheet');
 sh.innerHTML=`<div style="text-align:center;padding:8px 0 2px"><div class="funpop" style="font-size:56px">${g.i}</div>
  <div style="font-size:16px;font-weight:800;color:${g.c};margin-top:5px">切涨了 · ${g.n}</div>
  ${evHtml}
  <div style="font-size:12.5px;color:#667;margin-top:5px">石头行出价 <b class="price">${money(val)}</b>${canRecut?`<br><span class="muted">第二刀再涨可翻 ${st.sec[0]}~${st.sec[1]} 倍，切跨则分文不剩</span>`:''}</div></div>
  <div class="mbtns">
   ${canRecut?'<button class="btn or" data-fun="recut">⚠️ 再切一刀</button>':''}
   <button class="btn pri" data-fun="sell">直接卖掉 +${money(val)}</button>
  </div>`;
 sh.querySelectorAll('[data-fun]').forEach(btn=>btn.addEventListener('click',()=>{
  if(btn.dataset.fun==='sell'){
   gain(val,'开石出翠');S.fun.got+=val;
   funRecord('开石',g.n+((evs||[]).length?'（事件）':'')+'出手',val-st.price);
   showFunResult(w,`<div style="text-align:center;padding:8px 0 2px"><div class="funpop" style="font-size:56px">${g.i}</div>
    <div style="font-size:15px;font-weight:800;color:${g.c};margin-top:5px">${g.n}已出手</div>
    ${(evs||[]).map(e=>`<div style="font-size:12px;font-weight:800;color:#c08a00;margin-top:3px">${e}</div>`).join('')}
    <div style="font-size:13px;margin-top:5px">到账 <b class="price">+${money(val)}</b>${val>st.price?'，净赚 '+money(val-st.price):''}</div></div>`);
  }else{
   if(chance(Math.min(0.8,st.p2+RECUT_LUCK))){
    let m2=mult*rnd(st.sec[0],st.sec[1]); const ev2=[];
    if(chance(0.008)){m2=mult*5;ev2.push('💥 第二刀切爆了 · 妖色四溢 ×5！');}
    stoneRiseModal(w,st,m2,cut+1,ev2);
   }else{
    funRecord('开石','第二刀切跨',-st.price);
    showFunResult(w,`<div style="text-align:center;padding:8px 0 2px"><div class="funpop" style="font-size:56px">💔</div>
     <div style="font-size:16px;font-weight:800;color:#e05346;margin-top:5px">第二刀切跨了</div>
     <div style="font-size:12px;color:#98a1a8;margin-top:5px">${g.n}崩成碎片，${money(val)}的价飞了 · 贪心害人</div></div>`);
   }
  }
 }));
 renderView();
}
function renderFun(){
 ensureFunMarket();
 const el=$('#view-fun');
 const net=S.fun.got-S.fun.spent;
 let rows='';
 if(funTab==='pearl'){
  const list=S.fun.mkt.pearls,sold=list.filter(b=>b.sold).length;
  rows=list.map((b,i)=>{
   if(b.sold)return '';
   const top=Math.round(b.price*Math.max.apply(null,b.table.map(t=>t[0])));
   const btn=b.adClam
    ?`<button class="btn pri" data-act="adClamGet" data-i="${i}">▶ 看广告领 1 只</button>`
    :`<button class="btn or" data-act="pearlBuy" data-i="${i}">¥${fmt(b.price)}</button>`;
   return `<div class="invrow">
    <div class="invmain"><b>${b.adClam?'🎬 '+b.n:b.n}</b><span>${b.desc}${b.adClam?' · 看广告免费领':''}</span><span class="funtag">${b.adClam?'单只头奖可出 '+money(top):'头奖可出 '+money(top)}</span></div>
    <div class="invbtns">${btn}</div>
   </div>`;
  }).join('');
  rows+=`<div class="sect" style="box-shadow:none;padding:8px 0 2px"><span class="muted" style="text-align:center;display:block">🦪 蚌市每日随机上 5 件，今日已售 ${sold}/5${sold>=5?'，今日货已售罄，明天一早来补新货':''}</span></div>`;
 }else{
  const list=S.fun.mkt.stones,sold=list.filter(b=>b.sold).length;
  rows=list.map((st,i)=>{
   if(st.sold)return '';
   const top=Math.round(st.price*st.grades[st.grades.length-1][0]*st.sec[1]);
   const btn=st.adStone
    ?`<button class="btn pri" data-act="adStoneGet" data-i="${i}">▶ 看广告领 1 只</button>`
    :`<button class="btn or" data-act="stoneBuy" data-i="${i}">¥${fmt(st.price)}</button>`;
   return `<div class="invrow">
    <div class="invmain"><b>${st.adStone?'🎬 '+st.n:st.n}</b><span>${st.desc}${st.adStone?' · 看广告免费领':''}</span><span class="funtag">涨率 ${Math.round(stoneEffUp(st)*100)}% · 极限 ${money(top)}</span></div>
    <div class="invbtns">${btn}</div>
   </div>`;
  }).join('');
  rows+=`<div class="sect" style="box-shadow:none;padding:8px 0 2px"><span class="muted" style="text-align:center;display:block">🪨 石头行每日随机上 5 件，今日已售 ${sold}/5${sold>=5?'，今日货已售罄，明天一早来补新货':''}</span></div>`;
 }
 const hist=S.fun.hist.map(h=>`<div class="invrow" style="margin-bottom:6px">
   <div class="invmain"><b>${h.k} · ${h.t}</b><span>第${tday(h.T)}天 ${thhmm(h.T)}</span></div>
   <div class="invpos" style="color:${h.v>=0?'#0a8f60':'#e05346'};font-weight:800">${h.v>=0?'+':''}${money(h.v)}</div>
  </div>`).join('');
 el.innerHTML=`
  <div class="bigcard" style="background:linear-gradient(150deg,#5b3a86,#2c1b4d);color:#fff;border-radius:16px;padding:16px;margin-bottom:10px">
   <div class="muted" style="color:#cabde0">可用现金（娱乐概不赊账）</div>
   <div style="font-size:26px;font-weight:800;margin:2px 0">${money(S.cash)}</div>
   <div class="bnrow">
    <div><div class="muted" style="color:#cabde0">累计投入</div><div class="bn2">${money(S.fun.spent)}</div></div>
    <div><div class="muted" style="color:#cabde0">累计收回</div><div class="bn2">${money(S.fun.got)}</div></div>
    <div><div class="muted" style="color:#cabde0">净盈亏</div><div class="bn2" style="color:${net>=0?'#aef3d3':'#ffb4a8'}">${net>=0?'+':''}${money(net)}</div></div>
   </div>
   <p style="font-size:10px;opacity:.7;margin-top:8px">已开蚌 ${S.fun.pearlN} 次 · 已开石 ${S.fun.stoneN} 次</p>
  </div>
  <div class="seg" style="margin-bottom:10px">
   <button data-act="funTab" data-t="pearl" class="${funTab==='pearl'?'on':''}">🦪 开蚌</button>
   <button data-act="funTab" data-t="stone" class="${funTab==='stone'?'on':''}">🪨 开石</button>
  </div>
  ${funTab==='pearl'?`<div class="sect"><h4>🦪 蚌市行 <span class="r">买蚌入仓库，回「仓库」撬开</span></h4>${rows}</div>`
   :`<div class="sect"><h4>🪨 石头行 <span class="r">买石入仓库，回「仓库」开切</span></h4>${rows}</div>`}
  <div class="sect"><h4>📜 近期战绩</h4>${hist||'<div class="muted" style="padding:8px 0">还没玩过，手气尚未开启</div>'}</div>
  <div class="sect"><h4>娱乐须知</h4><div class="mbody" style="font-size:11px;color:#777;line-height:1.8">蚌市与石头行货池各 30 种，每天随机补 5 件新货，价格略有浮动，售完即止。买下的蚌与石头先入「仓库」，想开再开，结果动手那一刻才揭晓。开蚌可能撞上<b>双黄/九珠连珠</b>，切石可能撞上<b>起荧、飘花、帝王绿现世、切爆</b>，约一成货还"手感异样"藏着变数——可能瞬间暴富，也可能血本无归（偶尔切出玉髓回点血）。均为明码标价的虚拟娱乐，概不赊账、概不退换。十赌九输，图个乐子就好——别忘了，你还欠着银行 1 个亿，卡车比翡翠重要。</div></div>`;
}
/* ================= 仓库页：待开蚌 / 待切石 ================= */
function renderDepot(){
 ensureDepot();
 const el=$('#view-depot');
 const pN=S.depot.pearls.length, sN=S.depot.stones.length;
 const locked=S.depot.pearls.concat(S.depot.stones).reduce((s,x)=>s+x.price,0);
 const pearlRows=S.depot.pearls.map((b,i)=>`<div class="invrow">
   <div class="invmain"><b>🦪 ${b.n}</b><span>第${tday(b.at)}天购入 · 买价 ${money(b.price)}</span>${b.trait?'<span class="funtag">⚡ 手感异样，藏着变数</span>':''}</div>
   <div class="invbtns"><button class="btn or" data-act="dpPearl" data-i="${i}">撬开</button></div>
  </div>`).join('');
 const stoneRows=S.depot.stones.map((st,i)=>`<div class="invrow">
   <div class="invmain"><b>🪨 ${st.n}</b><span>第${tday(st.at)}天购入 · 买价 ${money(st.price)}</span><span class="funtag">涨率 ${Math.round(stoneEffUp(st)*100)}%${st.trait?' · ⚡ 手感异样，藏着变数':''}</span></div>
   <div class="invbtns"><button class="btn or" data-act="dpStone" data-i="${i}">开切</button></div>
  </div>`).join('');
 el.innerHTML=`
  <div class="bigcard" style="background:linear-gradient(150deg,#6e5222,#3d2d10);color:#fff;border-radius:16px;padding:16px;margin-bottom:10px">
   <div class="muted" style="color:#e2d3ae">仓库存货（买下未开的蚌与石）</div>
   <div style="font-size:26px;font-weight:800;margin:2px 0">${money(locked)}</div>
   <div class="bnrow">
    <div><div class="muted" style="color:#e2d3ae">待开蚌</div><div class="bn2">${pN} 只</div></div>
    <div><div class="muted" style="color:#e2d3ae">待切石</div><div class="bn2">${sN} 块</div></div>
    <div><div class="muted" style="color:#e2d3ae">占用资金</div><div class="bn2">${money(locked)}</div></div>
   </div>
   <p style="font-size:10px;opacity:.7;margin-top:8px">蚌和石头不会坏，但压在仓库里的钱可还不了债</p>
  </div>
  <div class="sect"><h4>🦪 待开蚌 <span class="r">撬开才知道出什么珠</span></h4>
   ${pearlRows||'<div class="muted" style="padding:8px 0">仓库里没有蚌，去「娱乐」页蚌市行逛逛</div>'}
  </div>
  <div class="sect"><h4>🪨 待切石 <span class="r">一刀穷一刀富，最多切两刀</span></h4>
   ${stoneRows||'<div class="muted" style="padding:8px 0">仓库里没有石头，去「娱乐」页石头行淘淘</div>'}
  </div>
  <div class="sect"><h4>仓管提示</h4><div class="mbody" style="font-size:11px;color:#777;line-height:1.8">在「娱乐」页买下的蚌与石头都会先放进这里，想开再开、想囤就囤，结果在动手那一刻才见分晓。货池共 30 种蚌、30 种石头每日轮换；个别货"手感异样"，可能藏着宝气，也可能藏着暗伤。蚌市与石头行每天只上 5 件货，看准了别手软。</div></div>`;
}
function renderInvest(){
 ensureFinance();
 ensureBiz();
 ensureIpo();
 const el=$('#view-invest');
 const dayChg=id=>{const m=S.market2[id];return (m.price/m.open-1)*100};
 const chgHtml=v=>`<span style="color:${v>=0?'#0a8f60':'#e05346'}">${v>=0?'+':''}${v.toFixed(2)}%</span>`;
 let stockRows=STOCKS.map(s=>{
  const m=S.market2[s.id],p=S.finance.stocks[s.id]||{shares:0,cost:0};
  const chg=dayChg(s.id);
  return `<div class="invrow">
   <div class="invmain"><b>${s.n}</b><span>现价 ${m.price.toFixed(2)} ${chgHtml(chg)}</span></div>
   <div class="invpos">${p.shares>0?`持 ${p.shares} 股 · 市值 ${money(Math.round(p.shares*m.price))}`:'未持仓'}</div>
   <div class="invbtns"><button class="btn ghost" data-act="stockBuy" data-id="${s.id}">买</button><button class="btn ghost" data-act="stockSell" data-id="${s.id}" ${p.shares<=0?'disabled':''}>卖</button></div>
  </div>`;
 }).join('');
 let fundRows=FUNDS.map(f=>{
  const m=S.market2[f.id],p=S.finance.funds[f.id]||{units:0,cost:0};
  return `<div class="invrow">
   <div class="invmain"><b>${f.n}</b><span>净值 ${m.price.toFixed(4)}</span></div>
   <div class="invpos">${p.units>0?`持 ${p.units} 份 · 市值 ${money(Math.round(p.units*m.price))}`:'未持有'}</div>
   <div class="invbtns"><button class="btn ghost" data-act="fundBuy" data-id="${f.id}">买</button><button class="btn ghost" data-act="fundSell" data-id="${f.id}" ${p.units<=0?'disabled':''}>卖</button></div>
  </div>`;
 }).join('');
 let fixedRows=S.finance.fixed.map(f=>`<div class="invrow"><div class="invmain"><b>定期 ${money(f.amt)}</b><span>到期总收益 +${Math.round(f.rate*1000)/10}%</span></div><div class="invpos">还剩 ${tspan(Math.max(0,f.dueT-S.T))} 到期</div></div>`).join('');
 el.innerHTML=`
  <div class="bigcard" style="background:linear-gradient(150deg,#123f31,#0c2c22);color:#fff;border-radius:16px;padding:16px;margin-bottom:10px">
   <div class="muted" style="color:#9fb8ac">理财总资产（不含现金）</div>
   <div style="font-size:26px;font-weight:800;margin:2px 0">${money(investTotal())}</div>
   <div class="bnrow">
    <div><div class="muted" style="color:#9fb8ac">活期存款</div><div class="bn2">${money(S.finance.deposit)}</div></div>
    <div><div class="muted" style="color:#9fb8ac">现金</div><div class="bn2">${money(S.cash)}</div></div>
   </div>
  </div>
  <div class="sect"><h4>🏦 银行存款 <span class="muted" style="font-weight:400;font-size:10px">活期每日 0.05% · ${FIXED_DAYS} 天定期 +${Math.round(FIXED_RATE*FIXED_DAYS*1000)/10}%</span></h4>
   ${fixedRows||''}
   <div class="mbtns"><button class="btn pri" data-act="depIn">存入活期</button><button class="btn ghost" data-act="depOut">取出活期</button><button class="btn or" data-act="fixIn">存定期</button></div>
  </div>
  <div class="sect"><h4>🛡️ 车辆保险 <span class="muted" style="font-weight:400;font-size:10px">爆胎 · 抢修 · 拖修 · 货损报销 70%（罚款不赔）</span></h4>
   <div class="invrow">
    <div class="invmain"><b>${S.insured?'✅ 已投保':'未投保'}</b><span>每日保费 ${money(Math.round(Math.max(truckDef().price,20000)*0.005))}（按车价 0.5%）</span></div>
    <div class="invbtns"><button class="btn ${S.insured?'ghost':'pri'}" data-act="insToggle">${S.insured?'退保':'投保'}</button></div>
   </div>
   <div class="mbody" style="font-size:10.5px;color:#888;margin-top:4px">${S.insured?'保费每天自动扣除，现金不足会自动失效。':'车况越差出险越频繁——爆胎、抢修、货损都能赔，跑烂路前值得考虑。'}</div>
  </div>
  <div class="sect"><h4>💸 司机放贷 <span class="muted" style="font-weight:400;font-size:10px">日息 2% · 3 天期 · 约 10% 老赖跑路</span></h4>
   ${(S.loans||[]).map(l=>`<div class="invrow"><div class="invmain"><b>借给司机 ${l.who} ${money(l.amt)}</b><span>到期本息 ${money(Math.round(l.amt*1.06))}</span></div><div class="invpos">还剩 ${tspan(Math.max(0,l.dueT-S.T))}</div></div>`).join('')}
   <div class="mbtns"><button class="btn pri" data-act="loanOut">💸 放出一笔借款</button></div>
  </div>
  <div class="sect"><h4>🎫 彩票站 <span class="muted" style="font-weight:400;font-size:10px">四种卡面 · 头奖最高 100 倍</span></h4>
   <div class="mbtns" style="flex-wrap:wrap">
    ${SCRATCH_CARDS.map((c,i)=>`<button class="btn pri" data-act="scratch" data-id="${i}" title="${c.desc}">🎫 ${c.n} ¥${c.price}</button>`).join('')}
   </div>
   <div class="mbody" style="font-size:10.5px;color:#888;margin-top:6px">${SCRATCH_CARDS.map(c=>c.n+'：'+c.desc).join(' · ')}</div>
  </div>
  <div class="sect"><h4>⛽ 柴油期货 <span class="muted" style="font-weight:400;font-size:10px">押明日油价涨跌 · 押对赚 90%</span></h4>
   ${(S.fut||[]).map(b=>`<div class="invrow"><div class="invmain"><b>${b.dir==='up'?'📈 押涨':'📉 押跌'} ${money(b.stake)}</b><span>今日油价 ¥${b.at} → 明日开盘结算</span></div><div class="invpos">待结算</div></div>`).join('')}
   <div class="invrow"><div class="invmain"><b>今日基准油价 ¥${S.fuelBase}/L</b><span>每天开盘重新定价，波动区间 ¥3.2~4.4</span></div></div>
   <div class="mbtns"><button class="btn pri" data-act="futBet" data-dir="up">📈 押涨</button><button class="btn rd" data-act="futBet" data-dir="down">📉 押跌</button></div>
  </div>
  <div class="sect"><h4>🏭 实体投资 <span class="muted" style="font-weight:400;font-size:10px">城市线下产业 · 按 60% 计入总资产</span></h4>
   <div class="invrow"><div class="invmain"><b>每日营业额</b><span>仓库 ¥300×规模 · 档口 ¥200×规模，每天自动入账</span></div><div class="invpos">${money(bizDailyIncome())}/天</div></div>
   ${['wh','fuel','stall'].map(k=>{
     const B=BIZ_DEFS[k],n=Object.keys(S.biz[k]).length;
     return `<div class="invrow">
      <div class="invmain"><b>${B.i} ${B.n}${n?` <span class="pn">已持 ${n} 处</span>`:''}</b><span>${B.d}</span></div>
      <div class="invbtns"><button class="btn ghost" data-act="bizOpen" data-k="${k}">${n?'去管理':'去投资'}</button></div>
     </div>`;
   }).join('')}
  </div>
  ${ipoSect()}
  <div class="sect"><h4>📈 苍南证券交易所 <span class="muted" style="font-weight:400;font-size:10px">价格实时波动，有涨有跌</span></h4>
   ${S.stockNews?`<div class="invrow" style="border-color:#ffd98e;background:#fffaf0"><div class="invmain"><b>📰 ${S.stockNews.text}</b><span>今日股价将持续${S.stockNews.dailyChg>0?'上涨':'下跌'}</span></div></div>`:''}
   ${stockRows}</div>
  <div class="sect"><h4>🧾 基金 <span class="muted" style="font-weight:400;font-size:10px">低波动 · 买卖收 0.5% 手续费</span></h4>${fundRows}</div>
  <div class="sect"><h4>行驶须知</h4><div class="mbody" style="font-size:11px;color:#888;line-height:1.8">行情随游戏时间实时波动，跑车途中也能看盘操作。存款利息每天结算；股票有涨有跌；刮刮乐头奖 100 倍；柴油期货押对赚 90%。理性投资，小赌怡情。</div></div>`;
}

/* ================= 车辆页（车队车库） ================= */
function garageTruck(){ return truckById(S.garageSel)||curTruck() }

/* ================= 雇佣司机系统 =================
 * 司机配到车上后，该车的「自动派送」由他来跑：吃特长加成、耗他的精力、攒他的经验；
 * 不配司机的车照旧由调度中心凭空开车（无加成）。亲自驾驶不走司机。
 * 日薪每日扣，发不出记欠薪掉忠诚；欠薪/低忠诚会跳槽；跑单攒经验升级，特长随级变强。 */
const DTRAIT={
 eco:   {n:'省油型', i:'⛽', d:'爱惜油耗', fx:lv=>'自动派送油耗 -'+(12+(lv-1)*3)+'%'},
 night: {n:'夜路型', i:'🌙', d:'开夜车又快又稳', fx:lv=>'自动派送速度 +'+(6+(lv-1)*2)+'%'},
 tough: {n:'耐造型', i:'🛠️', d:'护车如护己', fx:lv=>'自动派送磨损 -'+(20+(lv-1)*5)+'%'},
 steady:{n:'稳妥型', i:'🛡️', d:'谨慎驾驶少出事', fx:lv=>'结算货损风险 -'+Math.min(54,30+(lv-1)*6)+'%'},
};
const DLV=[0,60,150,300,520]; /* DLV[lv]：从 lv 升到 lv+1 所需经验 */
const DRIVER_MAX_LV=5;
const DRIVER_FLAVOR=['跑过八年冷链的老司机','以前在矿上拉过三年煤','部队汽车班退伍，作风硬朗','开半挂跑遍全国的主','县客运站出来的老师傅','原来是驾校教练，规矩多','车队里出了名的细心人','十里八乡的活地图','跑快递干线的快手','修车铺学徒出身，懂车'];
function ensureDrivers(){ S.drivers=S.drivers||[]; S.nextDriverId=S.nextDriverId||S.drivers.length+1; }
function driverById(id){ return (S.drivers||[]).find(d=>d.id===id)||null }
function driverOfTruck(tid){ return (S.drivers||[]).find(d=>d.truckId===tid)||null }
/* 特长数值：effect = 基础 + 每级成长 */
function drvEff(d){
 const lv=clamp(d.lv||1,1,DRIVER_MAX_LV);
 return {
  fuel:d.trait==='eco'?0.12+(lv-1)*0.03:0,
  spd:d.trait==='night'?0.06+(lv-1)*0.02:0,
  wear:d.trait==='tough'?0.20+(lv-1)*0.05:0,
  risk:d.trait==='steady'?Math.min(0.54,0.30+(lv-1)*0.06):0,
 };
}
/* 派单精力消耗：按行程小时数扣，夜间时段（22~6点）更累 */
function nightHours(t0,h){
 let n=0;
 for(let t=t0;t<t0+h;t+=0.25){const hr=((t%24)+24)%24;if(hr>=22||hr<6)n+=0.25;}
 return Math.min(n,h);
}
function drvDrain(totalH,t0){
 const nh=nightHours(t0,totalH);
 return totalH*3.2*(1+0.35*(totalH>0?nh/totalH:0));
}
/* ---- 每日招聘市场：4 名候选，跨天自动刷新 ---- */
function rollHireMkt(){
 ensureDrivers();
 const used=new Set(S.drivers.map(d=>d.name));
 const list=[];
 for(let i=0;i<4;i++){
  const trait=pick(['eco','night','tough','steady']);
  const lv=chance(0.6)?1:(chance(0.7)?2:3);
  const wage=Math.round(irnd(16,22)*10*Math.pow(1.35,lv-1)/10)*10;
  let name,g=0;
  do{name=shipperName();}while(used.has(name)&&g++<20);
  used.add(name);
  list.push({name,trait,lv,wage,fee:Math.round(wage*irnd(8,12)/50)*50,flavor:pick(DRIVER_FLAVOR)});
 }
 S.hireMkt={day:tday(S.T),list};
}
function ensureHire(){ ensureDrivers(); if(!S.hireMkt||S.hireMkt.day!==tday(S.T))rollHireMkt(); }
function driverCap(){ return fleetCap()+((S&&S.driverCapBonus)||0); } /* 司机上限 = 车队上限 + 激励广告加成 */
function hireDriver(i){
 ensureHire();
 const c=S.hireMkt.list[i]; if(!c){toast('这位候选刚刚被别人领走了');return}
 if(S.drivers.length>=driverCap()){toast('👷 司机人数已达上限 '+driverCap()+' 人，可解雇冗余司机，或看广告提升上限');return}
 if(S.cash<c.fee){toast('签约费不够，先攒攒钱');return}
 payCost(c.fee,'签约司机·'+c.name);
 S.drivers.push({id:S.nextDriverId++,name:c.name,trait:c.trait,lv:c.lv,xp:0,wage:c.wage,energy:100,loyalty:65,truckId:null,trips:0,owed:0,hiredDay:tday(S.T)});
 S.hireMkt.list.splice(i,1);
 toast('🤝 '+c.name+' 入伙！回车库给他安排一台车');
 checkAch();save();renderAll();
 /* 就地刷新招聘市场弹窗：被签走的候选卡片立即消失（当天不自动补货，签空了显示明日再来） */
 document.querySelectorAll('#modals .mwrap').forEach(w=>w.remove());
 modalOpen=false;
 openHireMarket();
}
function fireDriver(id){
 const d=driverById(id); if(!d)return;
 if(truckBusy(d.truckId)){toast('他车上的活儿还没送完，等这单到了再谈');return}
 const sever=d.wage*3;
 askModal({center:true,title:'解雇 '+d.name+'？',tag:'遣散',
  body:`按行规要结清 <b style="color:#ff5000">${money(sever)}</b> 遣散费（3 天日薪）。${d.owed>0?`<br>他还被欠着 ${money(d.owed)} 工钱，一并结清。`:''}<br><span class="muted">人走了车还在，这台车之后自动派送就没有特长加成了。</span>`,
  buttons:[{t:'确认解雇（'+money(sever+(d.owed||0))+'）',cls:'rd',fn:()=>{
    payCost(sever+(d.owed||0),'遣散结算·'+d.name);
    S.drivers=S.drivers.filter(x=>x.id!==id);
    toast(d.name+' 收拾行李走了');
    save();renderAll();
  }},{t:'再想想',cls:'ghost'}]});
}
function doAssignDriver(did,tid){
 const d=driverById(did),t=truckById(tid);
 if(!d||!t)return;
 const cur=driverOfTruck(tid);
 if(cur&&cur.id!==did){toast('这台车已经有司机（'+cur.name+'）了，先让他换车');return}
 if(truckBusy(tid)){toast('这台车任务中，等它回来再安排');return}
 d.truckId=tid;
 toast('👨‍✈️ '+d.name+' 已安排开 '+truckDef(t).n+(d.trait==='eco'?'，这车以后自动派送更省油':''));
 checkAch();save();renderAll();
}
function openDriverAssign(id){
 const d=driverById(id); if(!d)return;
 const free=(S.fleet||[]).filter(t=>{const cur=driverOfTruck(t.id);return (!cur||cur.id===id)&&!truckBusy(t.id)});
 if(!free.length){toast('没有空闲又没司机的车，等任务回来再安排');return}
 const rows=free.map(t=>{
  const st=tStatFor(t);
  return `<button class="routeopt" data-dtid="${t.id}" style="display:block;width:100%;text-align:left;margin-bottom:8px">
   <div class="rh"><b>${truckIcon(t.model)} ${truckDef(t).n}</b><span class="rt">${t.city===S.city?'在身边':'在'+cityById(t.city).n}</span></div>
   <div class="rg"><span>载重<b>${st.load}t</b></span><span>车况<b>${100-Math.round(t.wear)}%</b></span><span>状态<b>空闲</b></span></div>
  </button>`;
 }).join('');
 const md=askModal({center:true,title:'安排 '+d.name+' 开哪台车？',tag:DTRAIT[d.trait].n+' · Lv.'+d.lv,
  body:`<div class="deadline ok" style="margin-bottom:8px">${DTRAIT[d.trait].i} ${DTRAIT[d.trait].fx(d.lv)} · 精力 ${Math.round(d.energy)}%</div>${rows}`,
  buttons:[{t:'先不安排',cls:'ghost'}]});
 md.el.querySelectorAll('[data-dtid]').forEach(b=>b.addEventListener('click',()=>{md.close();doAssignDriver(id,+b.dataset.dtid);}));
}
function drvTreat(id){
 const d=driverById(id); if(!d)return;
 if(d.treatDay===tday(S.T)){toast('今天已经请过了，天天下馆子也扛不住');return}
 if(S.cash<150){toast('现金不足');return}
 payCost(150,'请客吃饭·'+d.name);
 d.treatDay=tday(S.T);
 d.loyalty=clamp(d.loyalty+8,0,100);
 d.energy=clamp(d.energy+15,0,100);
 toast('🍚 陪'+d.name+'搓了顿好的：忠诚 +8 · 精力 +15');
 save();renderAll();
}
function openDriverInfo(id){
 const d=driverById(id); if(!d)return;
 const t=d.truckId?truckById(d.truckId):null;
 const job=truckJob(d.truckId);
 const st=d.truckId?(truckJob(d.truckId)?('派送中 → '+cityById(job.to).n):(t?('空闲 · '+cityById(t.city).n):'')):'还没分配车辆';
 const xpNext=d.lv<DRIVER_MAX_LV?DLV[d.lv]:null;
 askModal({center:true,title:'👨‍✈️ '+d.name+' · '+DTRAIT[d.trait].n,tag:'司机档案',
  body:`<div class="deadline ok" style="margin-bottom:8px">${DTRAIT[d.trait].i} ${DTRAIT[d.trait].fx(d.lv)}${d.lv<DRIVER_MAX_LV?'（升到 Lv.'+(d.lv+1)+' → '+DTRAIT[d.trait].fx(d.lv+1)+'）':'（已满级）'}</div>
  等级 <b>Lv.${d.lv}</b> · 日薪 <b>${money(d.wage)}</b> · 完成运单 <b>${d.trips}</b> 单<br>
  车辆：${t?truckIcon(t.model)+' '+truckDef(t).n+'（'+st+'）':'<span class="muted">未分配，跑自动派送没有加成</span>'}<br>
  精力 <b>${Math.round(d.energy)}%</b>${d.truckId&&truckBusy(d.truckId)?'<span class="muted">（在途，休息自动回）</span>':'<span class="muted">（空闲每小时 +5）</span>'} · 忠诚 <b>${Math.round(d.loyalty)}</b> · 经验 ${fmt(d.xp)}${xpNext?'/'+fmt(xpNext):''}<br>
  ${d.owed>0?`<span style="color:#e05346">⚠️ 欠薪 ${money(d.owed)}，忠诚度持续下降，再拖就跳槽了</span><br>`:''}
  <span class="muted">忠告：每天发日薪忠诚 +2，送完一单 +2；欠薪一天 -12。忠诚见底人会走。</span>`,
  buttons:[
   {t:'🍚 请吃饭（¥150）',cls:'pri',fn:()=>{drvTreat(id);openDriverInfo(id);}},
   {t:'🚚 安排车辆',cls:'ghost',fn:()=>{openDriverAssign(id);}},
   {t:'🚪 解雇',cls:'ghost',fn:()=>{fireDriver(id);}},
   {t:'关闭',cls:'ghost'}]});
}
function openHireMarket(){
 ensureHire();
 const rows=S.hireMkt.list.map((c,i)=>`
  <div class="truckpick">
   <div class="tp-i">${DTRAIT[c.trait].i}</div>
   <div class="tp-m"><b>${c.name} <span class="otag">${DTRAIT[c.trait].n}</span> <span class="cur">Lv.${c.lv}</span></b>
    <p>${c.flavor} · ${DTRAIT[c.trait].d}<br>${DTRAIT[c.trait].fx(c.lv)} · 日薪 ${money(c.wage)}</p></div>
   <button class="upbtn ${S.cash>=c.fee?'':'lock'}" data-act="hireDo" data-i="${i}">签约 ¥${fmt(c.fee)}</button>
  </div>`).join('');
 askModal({center:true,title:'🗺️ 司机招聘市场',tag:'每日更新 · 第'+tday(S.T)+'天',
  body:`<span class="muted">签约即入伙：配到车上跑自动派送吃特长加成；每天发日薪，欠薪会掉忠诚甚至跳槽。</span>
  ${rows||'<div class="muted" style="padding:10px 0">今天的候选都被挑走了，明天再来，或花点钱换一批。</div>'}
  <div class="mbtns"><button class="btn ghost" data-act="hireRefresh" style="width:100%">🔄 换一批（¥500）</button></div>`,
  buttons:[{t:'关闭',cls:'ghost'}]});
}
function hireRefresh(){
 if(S.cash<500){toast('现金不足');return}
 payCost(500,'招聘市场换一批');
 rollHireMkt();
 document.querySelectorAll('#modals .mwrap').forEach(w=>w.remove());
 modalOpen=false;
 openHireMarket();
}
/* 司机精力恢复：任何游戏时间流逝都算休息（按小时恢复，跑车中的不回） */
function tickDriverEnergy(){
 if(!S)return;
 ensureDrivers();
 if(S.energyTickT===undefined||S.energyTickT>S.T)S.energyTickT=S.T;
 const dh=S.T-S.energyTickT;
 S.energyTickT=S.T;
 if(dh<=0||!S.drivers.length)return;
 let vis=false;
 S.drivers.forEach(d=>{
  if(d.truckId&&truckBusy(d.truckId))return;
  const before=Math.floor(d.energy);
  d.energy=clamp(d.energy+dh*5,0,100);
  if(Math.floor(d.energy)!==before)vis=true;
 });
 if(vis&&uiTab==='garage'&&!modalOpen)renderView();
}
/* 日薪结算 + 跳槽判定（挂在 dailyCharge） */
function chargeDrivers(){
 if(!S.drivers||!S.drivers.length)return;
 S.drivers=S.drivers.filter(d=>{
  if(S.cash>=d.wage){
   S.cash-=d.wage;addLedger('司机日薪·'+d.name,-d.wage);
   if(d.owed>0){const back=Math.min(d.owed,d.wage);d.owed-=back;S.cash-=back;addLedger('补发欠薪·'+d.name,-back);}
   d.loyalty=clamp(d.loyalty+2,0,100);
  }else{
   d.owed=(d.owed||0)+d.wage;
   d.loyalty=clamp(d.loyalty-12,0,100);
   toast('💸 现金不足，'+d.name+'的日薪没发出去（忠诚 -12）');
  }
  /* 在途的先让他把货送完，落地再算跳槽 */
  if(!truckBusy(d.truckId)){
   const q=d.loyalty<=0?0.9:(d.owed>=d.wage*2?0.3:(d.loyalty<30?0.15:0));
   if(chance(q)){
    toast('🚪 '+d.name+' 辞工走人了'+(d.owed>0?('，还欠他 '+money(d.owed)+' 工钱'):''));
    S.runaway='你的司机'+d.name+'跳槽去了对手车队';
    return false;
   }
  }
  return true;
 });
 S.drivers.forEach(d=>{ if(d.truckId&&!truckById(d.truckId))d.truckId=null; });
}
/* 自动派送出发：司机检查 + 行程加成 + 预扣精力。返回 false 表示被司机状态挡下 */
function drvPrepareAuto(o,t,legs){
 const d=driverOfTruck(t.id);
 if(!d)return true;
 if(d.energy<25){toast('⚠️ 司机'+d.name+'精力不足（'+Math.round(d.energy)+'%），让他歇歇再派这台车：等恢复、换台车，或亲自驾驶');return false}
 const k=drvEff(d);
 legs.forEach(l=>{
  if(k.fuel>0)l.fuel=Math.round(l.fuel*(1-k.fuel));
  if(k.spd>0)l.h=+(l.h*(1-k.spd)).toFixed(3);
 });
 return true;
}
/* 出发收尾：预扣精力 + 记名到行程（在 totalH 算完后调用） */
function drvDepartAuto(o,t,totalH){
 const d=driverOfTruck(t.id);
 if(!d)return;
 d.energy=clamp(d.energy-drvDrain(totalH,S.T),0,100);
 const k=drvEff(d);
 if(k.risk>0)o.steadyK=1-k.risk;
 o.job.driver={id:d.id,name:d.name};
}
/* 送达：司机涨经验/忠诚，升级涨日薪 */
function drvFinishAuto(o){
 const ref=o.job&&o.job.driver;
 if(!ref)return;
 const d=driverById(ref.id);
 if(!d)return;
 d.trips++;
 d.loyalty=clamp(d.loyalty+2,0,100);
 d.xp+=Math.round(o.price/1500)+3;
 const wasLv=d.lv;
 while(d.lv<DRIVER_MAX_LV&&d.xp>=DLV[d.lv]){d.lv++;d.wage=Math.round(d.wage*1.12/10)*10;}
 if(d.lv>wasLv)toast('📈 司机'+d.name+'升到 Lv.'+d.lv+'！'+DTRAIT[d.trait].fx(d.lv)+'，日薪涨到 '+money(d.wage));
}

/* ================= 实体投资：城市仓库 / 加油站入股 / 物流园档口 =================
 * 与股票基金并列的「实体产业」：分城市线下投资，吃功能加成 + 仓库/档口每日营业额。
 * 资产按买入价 60% 计入理财总资产，退股也返还 60%。 */
const BIZ_DEFS={
 wh:  {n:'城市仓库', i:'🏭', base:80000, d:'本城送达结算价 +10% · 卸货排队减半 · 每日营业额 +¥300×规模', perk:'送单到本城结算价 +10%，卸货排队减半', income:big=>300*big},
 fuel:{n:'加油站入股', i:'⛽', base:50000, biasMul:true, d:'本城加油一律 8 折（含车队途中自动加油）', perk:'在本城加油一律 8 折'},
 stall:{n:'物流园档口',i:'🏪', base:60000, d:'本城发货运价 +10% · 接单板多 1 单 · 每日流水 +¥200×规模', perk:'本城发货运价 +10%，接单板多 1 单', income:big=>200*big},
};
function ensureBiz(){ S.biz=S.biz||{wh:{},fuel:{},stall:{}}; S.biz.wh=S.biz.wh||{}; S.biz.fuel=S.biz.fuel||{}; S.biz.stall=S.biz.stall||{}; }
function bizPrice(kind,cityId){
 const B=BIZ_DEFS[kind],c=cityById(cityId);
 return Math.round(B.base*(1+((c.big||1)-1)*0.25)*(B.biasMul?c.bias:1)/100)*100;
}
function bizOwned(kind,cityId){ ensureBiz(); return S.biz[kind][cityId]||0 }
function bizDailyIncome(){
 ensureBiz(); let s=0;
 for(const k of ['wh','stall']){const B=BIZ_DEFS[k];for(const cid in S.biz[k])s+=B.income(cityById(cid).big||1);}
 return s;
}
function bizAssetValue(){
 ensureBiz(); let s=0;
 for(const k in BIZ_DEFS){for(const cid in S.biz[k])s+=Math.round(S.biz[k][cid]*0.6);}
 return s;
}
/* 档口城市为接单锚点时，订单板上限 +1 */
function bizBoardExtra(){ ensureBiz(); return S.biz.stall[boardAnchor()]?1:0; }
/* 自有仓库城市：卸货排队减半（亲自到站与自动派送共用） */
function unloadQueueH(o){
 let h=stationQueue(o.dstation,QUEUE_UNLOAD);
 if(S.biz&&S.biz.wh&&S.biz.wh[o.to])h*=0.5;
 return h;
}
/* 就地刷新实体投资弹窗：买/退后卡片状态立即更新 */
function refreshBizModal(kind){
 document.querySelectorAll('#modals .mwrap').forEach(w=>w.remove());
 modalOpen=false;
 openBizInvest(kind);
}
function bizBuy(kind,cityId){
 const B=BIZ_DEFS[kind],c=cityById(cityId);
 if(bizOwned(kind,cityId)){toast(c.n+'已经有这份产业了');return}
 const price=bizPrice(kind,cityId);
 if(S.cash<price){toast('现金不足，还差 '+money(price-S.cash));return}
 askModal({center:true,title:B.i+' '+B.n+' · '+c.n,tag:'实体投资',
  body:`投资额 <b style="color:#ff5000">${money(price)}</b><br>${B.d}<br><span class="muted">按 60% 计入理财总资产，日后可按 60% 退股。${B.income?'每日营业额自动入账。':''}</span>`,
  buttons:[{t:'确认投资',cls:'pri',fn:()=>{
   payCost(price,B.n+'·'+c.n);
   S.biz[kind][cityId]=price;
   toast(B.i+' '+c.n+B.n+'开张！'+B.perk);
   /* 上市公司联动：扩产利好，股价 +2% */
   if(S.ipo&&S.ipo.listed){S.ipo.price=+Math.max(0.05,S.ipo.price*1.02).toFixed(3);toast('📈 扩产利好，'+S.ipo.name+'股价上涨');}
   checkAch();save();renderAll();
   refreshBizModal(kind);
  }},{t:'再想想',cls:'ghost'}]});
}
function bizSell(kind,cityId){
 const B=BIZ_DEFS[kind],c=cityById(cityId);
 if(!bizOwned(kind,cityId))return;
 const back=Math.round(S.biz[kind][cityId]*0.6);
 askModal({center:true,title:'退出'+c.n+'的'+B.n+'？',tag:'实体投资',
  body:`按入股价 60% 退回 <b style="color:#0a8f60">${money(back)}</b>，之后不再享受本城的加成与营业额。`,
  buttons:[{t:'确认退出',cls:'rd',fn:()=>{
   gain(back,'退股·'+c.n+B.n);
   delete S.biz[kind][cityId];
   toast('已退出'+c.n+B.n+'，到账 '+money(back));
   save();renderAll();
   refreshBizModal(kind);
  }},{t:'再想想',cls:'ghost'}]});
}
function openBizInvest(kind){
 const B=BIZ_DEFS[kind];
 ensureBiz();
 /* 当前城排最前，其余按投资额升序 */
 const cities=[...CITIES].sort((a,b)=>(a.id===S.city?-1:(b.id===S.city?1:bizPrice(kind,a.id)-bizPrice(kind,b.id))));
 const rows=cities.map(c=>{
  const owned=S.biz[kind][c.id],price=bizPrice(kind,c.id);
  return `<div class="truckpick">
   <div class="tp-i">${c.big>=3?'🏙️':(c.big===2?'🌆':'🏘️')}</div>
   <div class="tp-m"><b>${c.n} <span class="pn">${c.z}</span></b><p>${c.d} · ${B.perk}</p></div>
   ${owned?`<button class="upbtn" data-act="bizSell" data-k="${kind}" data-city="${c.id}" style="background:#fdeeee;color:#e05346">退 60%</button>`
         :`<button class="upbtn ${S.cash>=price?'':'lock'}" data-act="bizBuy" data-k="${kind}" data-city="${c.id}">¥${fmt(price)}</button>`}
  </div>`;
 }).join('');
 askModal({center:true,title:B.i+' '+B.n,tag:'实体投资 · 已持 '+Object.keys(S.biz[kind]).length+' 处',
  body:`<span class="muted">${B.d}。城市规模越大投资额越高；已持有的城市可按 60% 退股。</span><div style="max-height:46vh;overflow-y:auto;margin-top:8px">${rows}</div>`,
  buttons:[{t:'关闭',cls:'ghost'}]});
}

/* ================= 公司上市（IPO） =================
 * 还清债务、产业成规模后可递表：3 天辅导期后按估值定价发行 25% 流通股募资（扣 5% 保荐费）。
 * 自家公司成为交易所第 12 只股票：股价随经营起伏（当日营收涨/罚款货损跌/扩产利好）与交易所新闻波动。
 * 大股东规则：每日最多减持 2% 持股，可随时回购；持股市值计入理财总资产。 */
const IPO_SHARES=1e8;   /* 总股本 1 亿股 */
const IPO_FLOAT=0.25;   /* IPO 发行 25% 流通盘 */
const IPO_TUTOR_DAYS=3; /* 辅导期天数 */
const IPO_MAX_SELL=0.02;/* 大股东单日减持上限：持股的 2% */
function ensureIpo(){
 if(!S.ipo)S.ipo={listed:0,name:'',applyT:0,val0:0,price:0,price0:0,open:0,pShares:Math.round(IPO_SHARES*(1-IPO_FLOAT)),fShares:Math.round(IPO_SHARES*IPO_FLOAT),soldDay:0,soldToday:0,todayEarned:0,todayBad:0,newsChg:0,warned:0};
 return S.ipo;
}
/* 公司估值：总资产+现金 ×1.15，实体产业与运单量加品牌溢价，最低 3000 万（取整到万） */
function ipoValuation(){
 const bizN=Object.keys(S.biz.wh).length+Object.keys(S.biz.fuel).length+Object.keys(S.biz.stall).length;
 return Math.max(30000000,Math.round(((investTotal()+S.cash)*1.15+bizN*500000+S.stats.trips*5000)/10000)*10000);
}
function ipoReady(){
 /* 上市看的是经营规模与实体底盘，不看债务：募资本身就是还债的路子 */
 const bizN=Object.keys(S.biz.wh).length+Object.keys(S.biz.fuel).length+Object.keys(S.biz.stall).length;
 return {
  asset:investTotal()>=20000000,
  biz:bizN>=3,
  earned:S.stats.earned>=5000000,
 };
}
function ipoOpenApply(){
 const ipo=ensureIpo();
 if(ipo.listed){toast('公司已经上市了');return}
 const r=ipoReady();
 if(!(r.asset&&r.biz&&r.earned)){toast('还不满足上市条件');return}
 askModal({center:true,title:'🏢 递交上市申请',tag:'苍南证券交易所',
  body:`<div style="margin-top:8px;font-size:12px;line-height:1.9">当前公司估值约 <b style="color:#ff5000">${money(ipoValuation())}</b><br>辅导期 ${IPO_TUTOR_DAYS} 天后定价发行 <b>${IPO_FLOAT*100}%</b> 流通股募资（扣 5% 保荐费）<br><span class="muted">上市后股价随经营起伏：多跑单涨、吃罚单跌、买产业利好；大股东每日最多减持 2%，可随时回购。</span></div>`,
  buttons:[{t:'递表',cls:'pri',fn:()=>{
   const name='陈氏物流';
   ipo.name=name; ipo.applyT=S.T; ipo.val0=ipoValuation();
   ipo.price0=Math.max(0.1,+((ipo.val0/IPO_SHARES)).toFixed(2));
   toast(`🏢 「${name}」上市申请已递交，辅导期 ${IPO_TUTOR_DAYS} 天`);
   save();renderAll();
  }},{t:'再等等',cls:'ghost'}]});
}
/* 辅导期满自动挂牌发行（dailyCharge 调用），返回是否刚刚上市 */
function ipoCheckListing(){
 const ipo=S.ipo;
 if(!ipo||ipo.listed||!ipo.applyT)return false;
 if(S.T-ipo.applyT>=IPO_TUTOR_DAYS*24){
  ipo.listed=1;
  ipo.price=ipo.price0;
  ipo.open=ipo.price0;
  const raise=Math.round(ipo.price0*IPO_SHARES*IPO_FLOAT*0.95);
  S.cash+=raise;addLedger('IPO募资（扣保荐费）',raise);
  toast(`🔔 ${ipo.name} 敲钟上市！发行价 ¥${ipo.price0.toFixed(2)}，募资 ${money(raise)} 到账`);
  checkAch();
  return true;
 }
 return false;
}
function ipoMarketValue(){ const ipo=ensureIpo(); return ipo.listed?Math.round(ipo.pShares*ipo.price):0 }
/* 每日收盘结算：随机波动 + 基本面（当日营收）- 罚款/货损/超时扣减 */
function ipoDailyClose(){
 const ipo=S.ipo;
 if(!ipo||!ipo.listed)return;
 const perf=clamp(ipo.todayEarned/1e7*0.05,-0.05,0.08)-ipo.todayBad*0.005;
 ipo.price=Math.max(0.05,+((ipo.price)*(1+clamp(rnd(-0.04,0.05)+perf,-0.10,0.12))).toFixed(3));
 ipo.todayEarned=0;ipo.todayBad=0;
 if(ipo.soldDay!==tday(S.T)){ipo.soldDay=tday(S.T);ipo.soldToday=0;}
 ipo.open=ipo.price; /* 今日收盘成为明日涨跌基准 */
 if(ipo.price<ipo.price0*0.4&&!ipo.warned){ipo.warned=1;toast('📉 交易所风险提示：'+ipo.name+'股价跌破发行价四成');}
}
/* 每小时微波动（updateMarket 调用）：噪声+微回归+当日新闻分摊 */
function ipoHourTick(){
 const ipo=S.ipo;
 if(!ipo||!ipo.listed)return;
 const ch=(Math.random()-0.5)*0.03+0.001+(ipo.newsChg||0)/24;
 ipo.price=Math.max(0.05,+(ipo.price*(1+ch)).toFixed(3));
}
/* 减持：大股东每日限 2% 持股 */
function ipoSellShares(){
 const ipo=ensureIpo();
 if(!ipo.listed){toast('公司还没上市');return}
 if(ipo.soldDay!==tday(S.T)){ipo.soldDay=tday(S.T);ipo.soldToday=0;}
 const cap=Math.floor(ipo.pShares*IPO_MAX_SELL)-ipo.soldToday;
 if(cap<=0){toast('今日减持额度已用完（大股东每日限 2%），明天再来');return}
 amountModal({title:'📉 减持 '+ipo.name,tag:'现价 ¥'+ipo.price.toFixed(2)+' · 今日余额 '+fmt(cap)+' 股',inputId:'ipoSellN',max:cap,
  chips:[[Math.floor(cap*0.25),'1/4 额度'],[Math.floor(cap*0.5),'半额'],[cap,'全部额度']],
  unitName:'减持股数',okLabel:'确认减持',onOk:n=>{
   n=Math.floor(Math.min(n,cap)); if(n<=0)return;
   ipo.soldToday+=n; ipo.pShares-=n; ipo.fShares+=n;
   const v=Math.round(n*ipo.price);
   gain(v,'减持·'+ipo.name);
   toast('📉 减持 '+fmt(n)+' 股，到账 '+money(v)+'，持股 '+(ipo.pShares/IPO_SHARES*100).toFixed(1)+'%');
   save();renderAll();
  }});
}
/* 回购：从流通盘买回，现金现价结算 */
function ipoBuyShares(){
 const ipo=ensureIpo();
 if(!ipo.listed){toast('公司还没上市');return}
 if(ipo.fShares<1){toast('流通盘已被你全部回购');return}
 const maxN=Math.min(ipo.fShares,Math.floor(S.cash/ipo.price));
 if(maxN<1){toast('现金不足买 1 股');return}
 amountModal({title:'📈 回购 '+ipo.name,tag:'现价 ¥'+ipo.price.toFixed(2)+' · 流通盘 '+fmt(ipo.fShares)+' 股',inputId:'ipoBuyN',max:maxN,
  chips:[[Math.floor(maxN*0.25),'1/4'],[Math.floor(maxN*0.5),'半数'],[maxN,'全部流通']],
  unitName:'回购股数',okLabel:'确认回购',onOk:n=>{
   n=Math.floor(Math.min(n,maxN)); if(n<=0)return;
   const v=Math.round(n*ipo.price);
   if(S.cash<v){toast('现金不足');return}
   S.cash-=v;addLedger('回购·'+ipo.name,-v);
   ipo.pShares+=n;ipo.fShares-=n;
   toast('📈 回购 '+fmt(n)+' 股，持股升至 '+(ipo.pShares/IPO_SHARES*100).toFixed(1)+'%');
   save();renderAll();
  }});
}
/* 理财页上市板块 */
function ipoSect(){
 const ipo=ensureIpo();
 const bizN=Object.keys(S.biz.wh).length+Object.keys(S.biz.fuel).length+Object.keys(S.biz.stall).length;
 if(!ipo.listed&&!ipo.applyT){
  const r=ipoReady();
  const item=(ok,txt)=>`<div class="invrow"><div class="invmain"><b>${ok?'✅':'⬜'} ${txt}</b></div></div>`;
  const allOk=r.asset&&r.biz&&r.earned;
  return `<div class="sect"><h4>🔔 公司上市 <span class="muted" style="font-weight:400;font-size:10px">做大做强后敲钟募资 · 背着债也能上</span></h4>
   ${item(r.asset,'理财总资产 ≥ ¥2,000 万（当前 '+money(investTotal())+'）')}
   ${item(r.biz,'持有实体产业 ≥ 3 处（当前 '+bizN+' 处）')}
   ${item(r.earned,'累计运费收入 ≥ ¥500 万（当前 '+money(S.stats.earned)+'）')}
   <div class="mbtns"><button class="btn ${allOk?'pri':'ghost'}" data-act="ipoApply">${allOk?'🏢 递交上市申请':'条件未满，继续做大做强'}</button></div>
   <div class="mbody" style="font-size:10.5px;color:#888;margin-top:4px">债务不必还清才能上市——募资到账后正好拿去财务页还债，轻装上阵。</div>
  </div>`;
 }
 if(!ipo.listed){
  const left=Math.max(1,Math.ceil((ipo.applyT+IPO_TUTOR_DAYS*24-S.T)/24));
  return `<div class="sect"><h4>🔔 公司上市 <span class="muted" style="font-weight:400;font-size:10px">辅导审核中</span></h4>
   <div class="invrow"><div class="invmain"><b>${ipo.name||'陈氏物流'} · 上市辅导中</b><span>估值约 ${money(ipo.val0||0)} · 拟发行 ${IPO_FLOAT*100}% 流通股</span></div><div class="invpos">约 ${left} 天后挂牌</div></div>
  </div>`;
 }
 const chg=ipo.open?((ipo.price/ipo.open-1)*100):0;
 const used=ipo.soldDay===tday(S.T)?ipo.soldToday:0;
 return `<div class="sect"><h4>🔔 ${ipo.name} <span class="muted" style="font-weight:400;font-size:10px">你的上市公司 · 代码 1949</span></h4>
  <div class="invrow"><div class="invmain"><b>股价 ¥${ipo.price.toFixed(2)} <span style="color:${chg>=0?'#0a8f60':'#e05346'}">${chg>=0?'+':''}${chg.toFixed(2)}%</span></b><span>发行价 ¥${ipo.price0.toFixed(2)} · 总市值 ${money(Math.round(ipo.price*IPO_SHARES))}</span></div></div>
  <div class="invrow"><div class="invmain"><b>你持股 ${(ipo.pShares/IPO_SHARES*100).toFixed(1)}%</b><span>市值 ${money(ipoMarketValue())}（已计入理财总资产）</span></div></div>
  <div class="invrow"><div class="invmain"><b>今日减持额度</b><span>大股东每日限 2% · 已用 ${fmt(used)} 股</span></div></div>
  <div class="mbtns"><button class="btn pri" data-act="ipoSell">📉 减持套现</button><button class="btn ghost" data-act="ipoBuy">📈 回购增持</button></div>
  <div class="mbody" style="font-size:10.5px;color:#888;margin-top:4px">多跑单、少罚款、扩产业，股价就涨；每日收盘按经营结算涨跌，交易所时不时还发自家新闻。</div>
 </div>`;
}

function renderGarage(){
 const el=$('#view-garage');
 const t=garageTruck();
 const td=truckDef(t), st=tStatFor(t);
 const local=t.city===S.city;
 const fuelPct=Math.round(t.fuel/st.cap*100), hp=100-Math.round(t.wear);
 /* 车队列表 */
 const fleetRows=S.fleet.map(ft=>{
  const fst=tStatFor(ft);
  const job=truckJob(ft.id);
  const busy=truckBusy(ft.id);
  const fdrv=driverOfTruck(ft.id);
  const isCur=ft.id===S.curTruck, isSel=ft.id===t.id;
  let status;
  if(S.journey&&S.journey.truckId===ft.id)status='<span style="color:#0a8f60;font-weight:700">亲自驾驶中</span>';
  else if(job)status='<span style="color:#1a73e8;font-weight:700">派送中 → '+cityById(job.to).n+'</span>';
  else status='空闲 · '+cityById(ft.city).n+(ft.city===S.city?'（身边）':'');
  const btns=[];
  if(!isSel)btns.push(`<button class="btn sm ghost" data-act="garSel" data-id="${ft.id}">查看</button>`);
  if(!isCur&&!busy&&ft.city===S.city&&!S.journey)btns.push(`<button class="btn sm ghost" data-act="curTruckBtn" data-id="${ft.id}">设为当前</button>`);
  if(!busy&&ft.city!==S.city)btns.push(`<button class="btn sm ghost" data-act="moveTruck" data-id="${ft.id}">调到这里</button>`);
  if(!busy&&S.fleet.length>1)btns.push(`<button class="btn sm ghost" data-act="sellTruck" data-id="${ft.id}" style="color:#e05346">卖出 ¥${fmt(Math.round(truckDef(ft).price*0.5))}</button>`);
  const fPct=Math.round(ft.fuel/fst.cap*100), wHp=100-Math.round(ft.wear);
  return `<div class="truckpick" style="${isSel?'background:#f2faf6;border-radius:10px;padding-left:8px;padding-right:8px':''}">
   <div class="tp-i">${truckIcon(ft.model)}</div>
   <div class="tp-m"><b>${truckDef(ft).n}${isCur?' <span class="cur" style="margin-left:4px">当前驾驶</span>':''}</b>
    <p>${status} · 载重${fst.load}t · 油${Math.round(ft.fuel)}/${fst.cap}L · 车况${wHp}% · ${fmt(ft.odo)}km${fdrv?` · 👨‍✈️ ${fdrv.name}（${DTRAIT[fdrv.trait].n} Lv.${fdrv.lv}）`:' · <span style="color:#9aa5b1">无司机</span>'}</p></div>
   <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;max-width:60%">${btns.join('')}</div>
  </div>`;
 }).join('');
 /* 司机团队列表 */
 ensureDrivers();
 const driverRows=S.drivers.map(d=>{
  const dt=d.truckId?truckById(d.truckId):null;
  const busyD=d.truckId&&truckBusy(d.truckId);
  const ePct=Math.round(d.energy), lPct=Math.round(d.loyalty);
  return `<div class="truckpick">
   <div class="tp-i">${DTRAIT[d.trait].i}</div>
   <div class="tp-m"><b>${d.name} <span class="otag">${DTRAIT[d.trait].n}</span> <span class="cur">Lv.${d.lv}</span>${d.owed>0?`<span class="otag hot">欠薪 ${money(d.owed)}</span>`:''}</b>
    <p>${dt?`${truckIcon(dt.model)} ${truckDef(dt).n} · ${busyD?'任务中':'空闲'}`:'<span style="color:#9aa5b1">未分配车辆（无加成）</span>'} · 日薪 ${money(d.wage)} · ${d.trips} 单</p>
    <div style="display:flex;gap:10px;margin-top:4px">
     <div style="flex:1"><div style="font-size:9px;color:#8a93a3">精力 ${ePct}%</div><div class="track" style="height:5px"><div class="fill ${ePct<25?'bad':ePct<50?'warn':''}" style="width:${ePct}%"></div></div></div>
     <div style="flex:1"><div style="font-size:9px;color:#8a93a3">忠诚 ${lPct}</div><div class="track" style="height:5px"><div class="fill ${lPct<30?'bad':lPct<60?'warn':''}" style="width:${lPct}%"></div></div></div>
    </div></div>
   <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;max-width:34%">
    <button class="btn sm ghost" data-act="drvInfo" data-id="${d.id}">详情</button>
    <button class="btn sm ghost" data-act="drvAssign" data-id="${d.id}">${dt?'换车':'派车'}</button>
   </div>
  </div>`;
 }).join('');
 const driverSect=`
 <div class="sect"><h4>👷 司机团队（${S.drivers.length}/${driverCap()}）<button class="btn sm pri" data-act="driverCapAd" style="padding:3px 10px;margin-left:8px;font-size:11px;vertical-align:middle" title="观看激励广告提升司机上限">📺 看广告 +1</button><button class="btn sm pri" data-act="hireMkt" style="padding:3px 10px;margin-left:8px;font-size:11px;vertical-align:middle">🗺️ 招聘市场</button><span class="muted" style="font-weight:400;font-size:10px;margin-left:8px">配到车上的司机跑自动派送有特长加成</span></h4>
 ${driverRows||'<div class="muted" style="font-size:11px;padding:6px 2px">还没有雇司机。招聘一位配到车上，自动派送更省油/更快/更护车；记得每天发日薪。</div>'}
 </div>`;
 /* 选中车的改装 */
 let parts='';
 for(const k in PARTS){
  const P=PARTS[k], cur=t.parts[k], next=cur+1;
  const t0=partTier(k,cur), t1=partTier(k,next);
  let info='';
  if(k==='engine')info=`极速 ${t0.spd} → <b style="color:#00b578">${t1.spd}</b> km/h`;
  if(k==='tank')info=`容量 ${td.tank+t0.cap-TANK_BASE}L → <b style="color:#00b578">${td.tank+t1.cap-TANK_BASE}</b>L`;
  if(k==='tire')info=`磨损 ×${t0.wearMul} → <b style="color:#00b578">${t1.wearMul}</b>`;
  if(k==='box')info=`载重 ${td.boxMax+t0.load-BOX_BASE}t → <b style="color:#00b578">${td.boxMax+t1.load-BOX_BASE}</b>t`;
  if(k==='cabin')info=`精力消耗 ×${t0.fatMul} → <b style="color:#00b578">${t1.fatMul}</b>`;
  if(k==='nav')info=t0.etc?`已有ETC${t1.evMul?'，下一级降低事件风险':''}`:'支持 ETC 过站不停车 95 折';
  const canBuy=local&&S.cash>=t1.cost&&!truckBusy(t.id);
  parts+=`<div class="part">
   <div class="pi">${P.i}</div>
   <div class="pm"><b>${P.n} <span class="pn">${t0.n}</span></b><span>${info}</span></div>
   <button class="upbtn ${canBuy?'':'lock'}" data-act="upgrade" data-k="${k}">¥${fmt(t1.cost)}</button>
  </div>`;
 }
 /* 购车列表：全价直购，同款可买多台 */
 const trucks=[...TRUCKS.keys()].sort((a,b)=>TRUCKS[a].price-TRUCKS[b].price).map((i)=>{
  const tr=TRUCKS[i];
  const owned=S.fleet.filter(x=>x.model===i).length;
  const buyable=tr.price>0;
  return `<div class="truckpick">
   <div class="tp-i">${truckIcon(i)}</div>
   <div class="tp-m"><b>${tr.n}</b><p>${tr.d} · 油箱${tr.tank}L · 最大载重${tr.boxMax}t${owned?` · 已有×${owned}`:''}</p></div>
   ${!buyable?'<span class="cur">非卖品</span>':`<button class="upbtn ${S.fleet.length>=fleetCap()?'lock':(S.cash>=tr.price?'':'lock')}" data-act="buyTruck" data-i="${i}">¥${fmt(tr.price)}</button>`}
  </div>`;
 }).join('');
 el.innerHTML=`
 <div class="sect" style="padding:0 13px"><h4 style="padding-top:12px">🚛 我的车队（${S.fleet.length}/${fleetCap()} 台）<button class="btn sm pri" data-act="fleetCapAd" style="padding:3px 10px;margin-left:8px;font-size:11px;vertical-align:middle" title="观看激励广告提升车队上限">📺 看广告 +1</button><span class="muted" style="font-weight:400;font-size:10px;margin-left:8px">多车多单并行派送</span></h4>${fleetRows}</div>
 ${driverSect}
 <div class="truckcard">
  <h3>${truckIcon(t.model)} ${td.n}<span style="font-size:11px;opacity:.75;font-weight:400"> · ${local?'就在'+cityById(S.city).n:'在'+cityById(t.city).n}</span></h3>
  <div class="ts">${td.d} · 总里程 ${fmt(t.odo)} km · 危化资质（司机） ${S.hazPermit?'✅':'未办理'}</div>
  <div class="tstat2">
   <div><div class="muted" style="color:#9fb8ac;font-size:10px">燃油 ${Math.round(t.fuel)}/${st.cap}L</div><div class="track"><div class="fill ${fuelPct<25?'bad':fuelPct<45?'warn':''}" style="width:${fuelPct}%"></div></div></div>
   <div><div class="muted" style="color:#9fb8ac;font-size:10px">车况 ${hp}%</div><div class="track"><div class="fill ${hp<25?'bad':hp<45?'warn':''}" style="width:${hp}%"></div></div></div>
   <div><div class="muted" style="color:#9fb8ac;font-size:10px">精力 ${100-Math.round(S.fatigue||0)}%</div><div class="track"><div class="fill ${(S.fatigue||0)>60?'bad':(S.fatigue||0)>40?'warn':''}" style="width:${100-(S.fatigue||0)}%"></div></div></div>
  </div>
  <div class="tstats-nums">
   <div class="tsn">极速<b>${Math.round(st.spd*adsSpeedMul())} km/h</b></div>
   <div class="tsn">载重<b>${st.load} 吨</b></div>
   <div class="tsn">油耗<b>${st.consBase.toFixed(1)} L/百km</b></div>
   <div class="tsn">今日油价<b>¥${fuelPrice().toFixed(2)}</b></div>
  </div>
  <div class="mbtns">
   <button class="btn pri" data-act="refuel">⛽ 加油</button>
   <button class="btn ${t.wear>2?'or':'ghost'}" data-act="repair">🔧 维修保养</button>
   ${t.id!==S.curTruck&&!truckBusy(t.id)&&local&&!S.journey?`<button class="btn ghost" data-act="curTruckBtn" data-id="${t.id}">设为当前驾驶</button>`:''}
  </div>
  <div class="mbtns" style="margin-top:9px">
   <button class="btn" style="background:rgba(255,255,255,.09);color:#cfe7db;box-shadow:none;padding:9px 0;font-size:12px" data-act="fleetRefuelAll">⛽ 一键补满油</button>
   <button class="btn" style="background:rgba(255,255,255,.09);color:#cfe7db;box-shadow:none;padding:9px 0;font-size:12px" data-act="fleetRepairAll">🔧 一键保养</button>
  </div>
  ${local?'':'<div class="ts" style="margin-top:6px;color:#ffd98e">ℹ️ 这台车在外地：加油/维修可直接办理（按当地油价与费率），改装需先「调到这里」回本地车库</div>'}
 </div>
 <div class="sect"><h4>改装升级 <span class="r">在本地车库施工</span></h4>${parts}</div>
 <div class="sect"><h4>购买新车 <span class="r">${S.fleet.length>=fleetCap()?'车队已满 '+fleetCap()+' 台，需先卖车或看广告提升上限':'全价直购 · 车队上限 '+fleetCap()+' 台'}</span></h4>${trucks}</div>
 <div class="sect"><h4>资质考取</h4><div class="part"><div class="pi">📋</div><div class="pm"><b>危险品运输证（司机持有） <span class="pn">${S.hazPermit?'已持有':'需 Lv.3'}</span></b><span>接危化品订单必备，考取后车队所有车辆均可运输，考试费 ¥2,000</span></div>${S.hazPermit?'<button class="upbtn max">已持有</button>':`<button class="upbtn ${S.level>=3&&S.cash>=2000?'':'lock'}" data-act="permit">去考取</button>`}</div></div>`;
}
/* 设为当前驾驶车辆 */
function setCurTruck(id,silent){
 const t=truckById(id); if(!t)return false;
 if(S.journey&&S.journey.truckId!==id){toast('行车中不能换车');return false}
 if(truckBusy(id)){toast('这台车任务中，完成后再切换');return false}
 if(t.city!==S.city){toast('车辆在'+cityById(t.city).n+'，不在身边，先用「调到这里」');return false}
 S.curTruck=id; S.truck=t; S.garageSel=id;
 if(!silent){toast('已切换当前驾驶：'+truckDef(t).n);renderAll();save();}
 return true;
}
/* 外地车调回身边：板车托运，付托运费+油耗 */
function openMoveTruck(id){
 const t=truckById(id); if(!t)return;
 if(truckBusy(id)){toast('任务中的车无法调动');return}
 if(t.city===S.city){toast('车已经在你身边');return}
 const ro=routeOptions(t.city,S.city,0,t);
 const best=ro.opts[0];
 const towFee=300, fuelC=best?best.fuel:0;
 askModal({center:true,title:'🚛 调车 · 板车托运',tag:'从'+cityById(t.city).n+'到'+cityById(S.city).n,
  body:`把 ${truckDef(t).n} 调到你身边：托运费 ¥300 + 途中油耗 ${money(fuelC)}，即到即用。`,
  buttons:[{t:'确认调车 '+money(towFee+fuelC),cls:'pri',fn:()=>{
   payCost(towFee+fuelC,'调车托运');
   t.fuel=Math.max(0,t.fuel-fuelC);
   t.city=S.city;
   toast(truckDef(t).n+' 已调到'+cityById(S.city).n);
   renderAll();save();
  }},{t:'算了',cls:'ghost'}]});
}
/* 卖车：闲置车按车价五折回收 */
function doSellTruck(id){
 const t=truckById(id); if(!t)return;
 if(S.fleet.length<=1){toast('至少要留一台车跑运输');return}
 if(truckBusy(id)){toast('任务中的车不能卖');return}
 const v=Math.round(truckDef(t).price*0.5);
 askModal({center:true,title:'卖出车辆？',tag:truckDef(t).n,
  body:`二手车行按车价五折回收：<b style="color:#0a8f60">${money(v)}</b>（改装不退）。${t.city!==S.city?'<br><span class="muted">车在'+cityById(t.city).n+'，车行上门收车。</span>':''}`,
  buttons:[{t:'确认卖出',cls:'rd',fn:()=>{
   S.fleet=S.fleet.filter(x=>x.id!==id);
   const sd=driverOfTruck(id);
   if(sd){sd.truckId=null;toast('👨‍✈️ 司机 '+sd.name+' 暂时没车开了，记得重新安排');}
   gain(v,'卖车');
   if(S.curTruck===id){S.curTruck=S.fleet[0].id;S.truck=S.fleet[0];S.truck.city=S.truck.city||S.city;}
   if(S.garageSel===id)S.garageSel=S.curTruck;
   toast('已卖出 '+truckDef(t).n);
   renderAll();save();
  }},{t:'再想想',cls:'ghost'}]});
}

/* ================= 更多页 ================= */
const ACHV=[
 {id:'first', i:'🎉', n:'开张首单', d:'完成第一笔货运订单', f:s=>s.stats.trips>=1},
 {id:'km1', i:'🛣️', n:'万里长征', d:'累计行驶 10,000 公里', f:s=>s.stats.km>=10000},
 {id:'km10', i:'🌍', n:'纵横干线', d:'累计行驶 100,000 公里', f:s=>s.stats.km>=100000},
 {id:'earn10', i:'💵', n:'小有积蓄', d:'累计运费收入 10 万', f:s=>s.stats.earned>=100000},
 {id:'earn100', i:'💰', n:'百万运费', d:'累计运费收入 100 万', f:s=>s.stats.earned>=1000000},
 {id:'repay10', i:'🏦', n:'开始还债', d:'累计还款 10 万', f:s=>s.stats.repaid>=100000},
 {id:'repay50', i:'📈', n:'过半见效', d:'累计还款 5000 万', f:s=>s.stats.repaid>=50000000},
 {id:'free', i:'🕊️', n:'无债一身轻', d:'还清全部 1 亿债务', f:s=>s.debt<=0},
 {id:'rich', i:'🏆', n:'千万存款', d:'无债且存款达到 1000 万', f:s=>s.debt<=0&&s.cash>=10000000},
 {id:'lv5', i:'⭐', n:'金牌司机', d:'司机等级达到 Lv.5', f:s=>s.level>=5},
 {id:'star', i:'👍', n:'口碑爆棚', d:'好评 500 单', f:s=>s.goodReviews>=500},
 {id:'haz', i:'🧪', n:'危化资质', d:'考取危险品运输证', f:s=>s.hazPermit},
 {id:'top', i:'👑', n:'旗舰座驾', d:'拥有麒麟 X9 级及以上旗舰', f:s=>(s.fleet||[]).some(t=>(TRUCKS[t.model]||{price:0}).price>=880000)},
 {id:'hundred', i:'💯', n:'百单老司机', d:'完成 100 单运输', f:s=>s.stats.trips>=100},
 // ---- 扩充成就 ----
 {id:'km50', i:'🛰️', n:'车行天下', d:'累计行驶 50,000 公里', f:s=>s.stats.km>=50000},
 {id:'trips10', i:'📦', n:'熟能生巧', d:'完成 10 单运输', f:s=>s.stats.trips>=10},
 {id:'trips300', i:'🚛', n:'运输大王', d:'完成 300 单运输', f:s=>s.stats.trips>=300},
 {id:'good100', i:'🌟', n:'好评如潮', d:'好评 100 单', f:s=>s.goodReviews>=100},
 {id:'earn1000', i:'💎', n:'千万俱乐部', d:'累计运费收入 1000 万', f:s=>s.stats.earned>=10000000},
 {id:'cash100', i:'💼', n:'百万现金流', d:'存款达到 100 万', f:s=>s.cash>=1000000},
 {id:'stock', i:'📈', n:'初试股市', d:'买入第一笔股票', f:s=>Object.values((s.finance&&s.finance.stocks)||{}).some(p=>p.shares>0)},
 {id:'stock3', i:'🧩', n:'分散投资', d:'同时持有 3 只不同股票', f:s=>Object.values((s.finance&&s.finance.stocks)||{}).filter(p=>p.shares>0).length>=3},
 {id:'fixed1', i:'💤', n:'稳定收益', d:'存入第一笔定期存款', f:s=>((s.finance&&s.finance.fixed)||[]).length>=1},
 {id:'fund1', i:'🥇', n:'基金持有人', d:'买入第一笔基金', f:s=>Object.values((s.finance&&s.finance.funds)||{}).some(p=>p.units>0)},
 {id:'ads20', i:'🙏', n:'广告守护者', d:'累计观看激励广告 20 次', f:s=>((s.ads&&s.ads.watched)||0)>=20},
 {id:'top10', i:'🛸', n:'鲲鹏展翅', d:'拥有鲲鹏 X10 级及以上座驾', f:s=>(s.fleet||[]).some(t=>(TRUCKS[t.model]||{price:0}).price>=1680000)},
 {id:'clean', i:'😇', n:'零罚单', d:'完成 30 单且从未被罚款', f:s=>s.stats.trips>=30&&s.stats.fines===0},
 {id:'punctual', i:'⏰', n:'从不迟到', d:'完成 30 单且从未迟到', f:s=>s.stats.trips>=30&&s.stats.lateCnt===0},
 {id:'tuned', i:'🔧', n:'改装爱好者', d:'发动机和轮胎都改到 3 级以上', f:s=>(s.fleet||[]).some(t=>t.parts.engine>=3&&t.parts.tire>=3)},
 {id:'fleet3', i:'🚛', n:'车队成军', d:'拥有 3 台及以上车辆', f:s=>(s.fleet||[]).length>=3},
 {id:'multi2', i:'🎯', n:'多线作战', d:'同时运送 2 单以上', f:s=>!!(s.flags&&s.flags.multi2)},
 {id:'lvmax', i:'🎖️', n:'十级车神', d:'司机等级达到满级 Lv.10', f:s=>s.level>=10},
 // ---- 雇佣司机成就 ----
 {id:'crew2', i:'👥', n:'车队长', d:'同时雇佣 2 名司机', f:s=>(s.drivers||[]).length>=2},
 {id:'crewBest', i:'🏅', n:'模范车队', d:'拥有 3 名司机且忠诚度全部 ≥90', f:s=>(s.drivers||[]).length>=3&&s.drivers.every(d=>d.loyalty>=90)},
 // ---- 实体投资成就 ----
 {id:'biz3', i:'🏭', n:'实体大亨', d:'同时持有 3 处实体产业', f:s=>{const b=s.biz||{};return Object.keys(b.wh||{}).length+Object.keys(b.fuel||{}).length+Object.keys(b.stall||{}).length>=3}},
 // ---- 公司上市成就 ----
 {id:'ipo', i:'🔔', n:'敲钟人', d:'公司成功上市', f:s=>!!(s.ipo&&s.ipo.listed)},
];
function checkAch(){ for(const a of ACHV){ if(!S.ach[a.id]&&a.f(S)){ S.ach[a.id]=1; AUDIO.sfx('ach'); toast(`${a.i} 成就达成：${a.n}`); } } }
function renderMore(){
 const el=$('#view-more');
 const achs=ACHV.map(a=>`<div class="achv ${S.ach[a.id]?'done':''}"><div class="ai">${a.i}</div><div><b>${a.n}</b><span>${a.d}</span></div></div>`).join('');
 el.innerHTML=`
 <div class="sect"><h4>司机档案</h4>
  <div class="mbody" style="font-size:12px;color:#555;line-height:2">
   等级 Lv.${S.level}（经验 ${fmt(S.xp)}）· 完成订单 ${S.stats.trips} 单<br>
   累计里程 ${fmt(S.stats.km)} km · 累计运费 ${money(S.stats.earned)}<br>
   已还款 ${money(S.stats.repaid)} · 罚款支出 ${money(S.stats.fines)}<br>
   雇佣司机 ${(S.drivers||[]).length} 名${(S.drivers||[]).length?` · 车队累计替你完成 ${(S.drivers||[]).reduce((s,d)=>s+(d.trips||0),0)} 单`:''}
  </div>
 </div>
 <div class="sect" style="padding:0 13px"><h4 style="padding-top:12px">设置</h4>
  <div class="mrow"><span class="mi">🎵</span>背景音乐<button class="btn sm ghost" data-act="cycleBgmVol">${AUDIO.volLabel()}</button></div>
  <div class="mrow"><span class="mi">🔔</span>操作音效<button class="btn sm ghost" data-act="toggleSfx">${AUDIO.sfxLabel()}</button></div>
  <div class="mrow"><span class="mi">🌙</span>黑色背景<div class="mv"></div><button class="switch ${S.dark?'on':''}" data-act="toggleDark" aria-label="切换黑色背景"><i></i></button></div>
  <div class="mrow"><span class="mi">⏩</span>行车时间流速<div class="mv"></div><button class="btn sm ghost" data-act="cycleTs">${S.timeScale}× 流速${maxUnlockedTs()<4?' 🔒':''}</button></div>
  <div class="mrow"><span class="mi">📖</span>玩法说明<button class="btn sm ghost" data-act="guide">查看</button></div>
  
  
 </div>
 <div class="sect"><h4>成就（${Object.keys(S.ach).length}/${ACHV.length}）</h4>${achs}</div>
  <div class="sect"><h4>关于</h4><div class="mbody" style="font-size:11px;color:#888;line-height:1.8">《大运卡车模拟：从一清二白到世界首富》<br>一款文字经营模拟游戏。所有城市、公司、人物均为虚构，如与现实雷同纯属巧合。进度自动保存在本机（纯离线，无需联网）。</div>
 <div class="mbtns"><button class="btn rd" data-act="resetGame">删除存档，重新开始</button></div></div>`;
}
/* ================= 支持页（平台激励广告） ================= */
const ADS_BOOST_HOURS=120; /* 双倍收入时长：5天=120游戏小时 */
const ADS_SPEED_HOURS=120; /* 车速提升时长：5天=120游戏小时 */
const ADS_FREE_HOURS=120; /* 免除消耗时长：5天=120游戏小时 */
function adsState(){
 if(!S.ads)S.ads={boostUntil:0,watched:0,speedUntil:0,freeUntil:0,speedWatch:0};
 if(!isFinite(S.ads.boostUntil))S.ads.boostUntil=0;
 if(!isFinite(S.ads.speedUntil))S.ads.speedUntil=0;
 if(!isFinite(S.ads.freeUntil))S.ads.freeUntil=0;
 if(!isFinite(S.ads.speedWatch))S.ads.speedWatch=0;
 return S.ads;
}
function adsBoostLeftH(){ return Math.max(0,(adsState().boostUntil||0)-S.T); }
function adsSpeedLeftH(){ return Math.max(0,(adsState().speedUntil||0)-S.T); }
function adsFreeLeftH(){ return Math.max(0,(adsState().freeUntil||0)-S.T); } /* 燃油/车况/精力零消耗 */
function adsSpeedMul(){ return adsSpeedLeftH()>0?1.3:1; } /* 车速提升 +30% */
function fmtBoostCd(h){
 const total=Math.max(0,Math.floor(h*60)); /* 游戏分钟 */
 const hh=Math.floor(total/60), mm=total%60;
 return hh+':'+String(mm).padStart(2,'0');
}
let _adsCdTimer=null;
function startAdsCdTicker(){
 if(_adsCdTimer)return;
 _adsCdTimer=setInterval(()=>{
  if(!S)return;
  const b=document.getElementById('adsBoostCd');
  if(b){
   const l=adsBoostLeftH();
   if(l<=0){renderView();return;} /* 到期：刷新支持页切回未生效状态 */
   b.textContent=fmtBoostCd(l);
  }
  const sp=document.getElementById('adsSpeedCd');
  if(sp){
   const l=adsSpeedLeftH();
   if(l<=0){renderView();return;}
   sp.textContent=fmtBoostCd(l);
  }
  const fr=document.getElementById('adsFreeCd');
  if(fr){
   const l=adsFreeLeftH();
   if(l<=0){renderView();return;}
   fr.textContent=fmtBoostCd(l);
  }
 },1000);
}
function renderSupport(){
 const el=$('#view-support');
 const ads=adsState();
 const left=adsBoostLeftH();
 const on=left>0;
 const sw=ads.speedWatch||0;
 const t2=sw>=2, t4=sw>=4;
 const spLeft=adsSpeedLeftH();
 const spOn=spLeft>0;
 const frLeft=adsFreeLeftH();
 const frOn=frLeft>0;
 el.innerHTML=`
 <div class="sect" style="padding:13px">
  <div style="display:flex;align-items:center;gap:10px">
   <div style="font-size:30px">${on?'⚡':'🎬'}</div>
   <div style="flex:1">
   <b style="font-size:13.5px">${on?'双倍收入生效中':'双倍订单收入'}</b>
   <div style="font-size:11px;color:#8a929c;margin-top:2px">${on?'剩余 <b id="adsBoostCd" style="color:#ff5000">'+fmtBoostCd(left)+'</b> 游戏时间 · 结算运费 ×2（可叠加）':'观看激励广告，5 天内每单运费翻倍结算（可叠加）'}</div>
   </div>
  </div>
  <button class="btn pri" data-act="watchSupportAd" style="width:100%;margin-top:12px">${on?'▶ 再看一段，续上双倍':'▶ 观看广告'}</button>
 </div>
 <div class="sect" style="padding:13px">
  <div style="display:flex;align-items:center;gap:10px">
   <div style="font-size:30px">${spOn?'🚀':'🛞'}</div>
   <div style="flex:1">
    <b style="font-size:13.5px">${spOn?'车速提升生效中':'车速提升 +30%'}</b>
    <div style="font-size:11px;color:#8a929c;margin-top:2px">${spOn?'剩余 <b id="adsSpeedCd" style="color:#ff5000">'+fmtBoostCd(spLeft)+'</b> 游戏时间 · 行驶速度 +30%（可叠加）':'观看激励广告，5 天内行驶速度提升 30%（可叠加）'}</div>
   </div>
  </div>
  <button class="btn pri" data-act="watchTruckAd" style="width:100%;margin-top:12px">${spOn?'▶ 再看一段，续上提升':'▶ 观看广告'}</button>
 </div>
 <div class="sect" style="padding:13px">
  <div style="display:flex;align-items:center;gap:10px">
   <div style="font-size:30px">${frOn?'⛽':'🛢️'}</div>
   <div style="flex:1">
    <b style="font-size:13.5px">${frOn?'零消耗生效中':'免除消耗'}</b>
    <div style="font-size:11px;color:#8a929c;margin-top:2px">${frOn?'剩余 <b id="adsFreeCd" style="color:#ff5000">'+fmtBoostCd(frLeft)+'</b> 游戏时间 · 燃油/车况/精力不消耗（可叠加）':'观看激励广告，5 天内燃油、车况、精力不消耗（可叠加）'}</div>
   </div>
  </div>
  <button class="btn pri" data-act="watchFreeAd" style="width:100%;margin-top:12px">${frOn?'▶ 再看一段，续上零耗':'▶ 观看广告'}</button>
 </div>
 <div class="sect" style="padding:13px">
  <div style="display:flex;align-items:center;gap:10px">
   <div style="font-size:30px">⏩</div>
   <div style="flex:1">
    <b style="font-size:13.5px">广告解锁流速</b>
    <div style="font-size:11px;color:#8a929c;margin-top:2px">累计观看广告，解锁更高行车时间流速（永久）</div>
   </div>
  </div>
  <div style="display:flex;gap:8px;margin-top:10px">
   <div style="flex:1;border:1px solid ${t2?'var(--gr)':'#e5e9ec'};border-radius:10px;padding:8px;text-align:center;background:${t2?'rgba(46,184,114,.07)':'#fafbfc'}">
    <b style="font-size:12.5px">${t2?'✅':'🔒'} 2× 流速</b>
    <div style="font-size:10px;color:#8a929c;margin-top:2px">${t2?'已解锁':'已看 '+Math.min(sw,2)+'/2'}</div>
   </div>
   <div style="flex:1;border:1px solid ${t4?'var(--gr)':'#e5e9ec'};border-radius:10px;padding:8px;text-align:center;background:${t4?'rgba(46,184,114,.07)':'#fafbfc'}">
    <b style="font-size:12.5px">${t4?'✅':'🔒'} 4× 流速</b>
    <div style="font-size:10px;color:#8a929c;margin-top:2px">${t4?'已解锁':'已看 '+Math.min(sw,4)+'/4'}</div>
   </div>
  </div>
  <button class="btn pri" data-act="watchSpeedAd" style="width:100%;margin-top:10px">${t4?'▶ 再看广告，支持开发者':(t2?'▶ 观看广告，冲击 4× 流速':'▶ 观看广告，解锁 2× 流速')}</button>
 </div>
 <div class="sect"><h4>支持记录</h4>
  <div class="mrow"><span class="mi">🎬</span>累计观看广告<span class="mv">${ads.watched||0} 次</span></div>
  <div class="mrow"><span class="mi">📜</span>玩法说明<button class="btn sm ghost" data-act="guide">查看</button></div>
 </div>`;
}
let _adsIntent='boost'; /* 本次观看广告的奖励意图：boost=双倍收入 speed=流速解锁 */
async function watchSupportAd(intent){
 _adsIntent=intent||'boost';
 /* Lamps 开放平台激励视频（App 内原生）：成功观看才发奖 */
 var LP=window.LampsPlatform;
 if(LP&&typeof LP.showRewardedVideo==='function'&&(!LP.isAvailable||LP.isAvailable())){
  if(LP.isPending&&LP.isPending()){toast('激励视频进行中，请稍候');return;}
  toast('🎬 广告加载中，请稍候…');
  var res;
  try{ res=await LP.showRewardedVideo({source:_adsIntent}); }
  catch(e){ res={ok:false,message:'广告调用失败'}; }
  if(res&&res.ok){ grantSupportReward(); }
  else{ toast((res&&res.message)||'广告未完成，未发放奖励'); }
  return;
 }
 /* 非 App 宿主（浏览器/本地调试）：模拟完整观看激励视频并发奖 */
 simulateSupportAd();
}
function simulateSupportAd(){
 let left=5;
 const m=askModal({center:true,title:'🎬 激励视频广告',tag:'模拟播放',
  body:`<div style="text-align:center;padding:6px 0 2px">📢 模拟广告播放中…<div style="font-size:26px;font-weight:800;color:#ff5000;margin-top:6px"><span id="adSimLeft">5</span> s</div><div style="font-size:10.5px;color:#999;margin-top:4px">完整观看后才能获得${_adsIntent==='speed'?'流速解锁':(_adsIntent==='board'?'换板×1.5':(_adsIntent==='truck'?'车速+30%':(_adsIntent==='free'?'免除消耗':(_adsIntent==='adClam'?'随机蚌×1':(_adsIntent==='adStone'?'随机石×1':(_adsIntent==='fleetCap'?'车队上限+1':(_adsIntent==='driverCap'?'司机上限+1':'双倍收入')))))))}奖励</div></div>`,
  buttons:[{t:'跳过（无奖励）',cls:'ghost',fn:()=>{clearInterval(iv);}}]});
 const iv=setInterval(()=>{
  left--;
  const el=m.el.querySelector('#adSimLeft');
  if(el)el.textContent=left;
  if(left<=0){
   clearInterval(iv);
   m.close();
   grantSupportReward();
  }
 },1000);
}
function grantSupportReward(){
 if(!S)return;
 const ads=adsState();
 const intent=_adsIntent||'boost';
 ads.watched=(ads.watched||0)+1; /* 累计观看次数（仅展示用） */
 AUDIO.sfx('coin');
 if(intent==='speed'){
  /* 流速解锁进度：只累计流速卡自己的观看 */
  const before=ads.speedWatch||0;
  ads.speedWatch=before+1;
  const unlocked=[];
  if(before<2&&ads.speedWatch>=2)unlocked.push('2×');
  if(before<4&&ads.speedWatch>=4)unlocked.push('4×');
  toast(unlocked.length?('⏩ 已解锁 '+unlocked.join('、')+' 流速！'):'⏩ 感谢支持！流速解锁进度 +1');
 }else if(intent==='adClam'){
  const b=S.fun.mkt&&S.fun.mkt.pearls&&S.fun.mkt.pearls[_adClamIdx];
  if(b&&b.adClam){
   ensureDepot();
   S.depot.pearls.push({n:b.n,price:b.price,table:b.table,trait:rollTrait(),at:S.T});
   /* 领完随机换一种蚌，继续看继续换 */
   const nb=PEARL_POOL[Math.floor(Math.random()*PEARL_POOL.length)];
   S.fun.mkt.pearls[_adClamIdx]={...nb,adClam:true};
   toast('🦪 '+b.n+' ×1 已放入仓库，下一只随机蚌已上架，继续看继续领！');
   nav('蚌市福利：激励广告「'+b.n+'」入库，手气如何开壳见分晓。');
  }
 }else if(intent==='adStone'){
  const b=S.fun.mkt&&S.fun.mkt.stones&&S.fun.mkt.stones[_adStoneIdx];
  if(b&&b.adStone){
   ensureDepot();
   S.depot.stones.push({n:b.n,price:b.price,pUp:b.pUp,grades:b.grades,p2:b.p2,sec:b.sec,trait:rollTrait(),at:S.T});
   /* 领完随机换一种石头，继续看继续换 */
   const nb=STONE_POOL[Math.floor(Math.random()*STONE_POOL.length)];
   S.fun.mkt.stones[_adStoneIdx]={...nb,adStone:true};
   toast('🪨 '+b.n+' ×1 已放入仓库，下一块随机石头已上架，继续看继续领！');
   nav('石头行福利：激励广告「'+b.n+'」入库，一刀下去见真章。');
  }
 }else if(intent==='fleetCap'){
  S.fleetCapBonus=(S.fleetCapBonus||0)+1; /* 车队上限永久 +1 */
  toast('🚛 感谢支持！车队上限 +1（当前上限 '+fleetCap()+' 台）');
  nav('感谢支持开发者！车队规模上限提升至 '+fleetCap()+' 台。');
 }else if(intent==='driverCap'){
  S.driverCapBonus=(S.driverCapBonus||0)+1; /* 司机上限永久 +1 */
  toast('👷 感谢支持！司机上限 +1（当前上限 '+driverCap()+' 人）');
  nav('感谢支持开发者！司机团队规模上限提升至 '+driverCap()+' 人。');
 }else if(intent==='board'){
  S.orders=[];genOrders(1.5); /* 换一板：整板新订单价格 ×1.5 */
  toast('🔄 已换一板，本板订单价格 ×1.5！');
 }else if(intent==='truck'){
  ads.speedUntil=Math.max(ads.speedUntil||0,S.T)+ADS_SPEED_HOURS; /* 时长叠加：剩余基础上 +5天 */
  toast('🚀 感谢支持！车速提升 +5 天，剩余 '+fmtBoostCd(adsSpeedLeftH()));
  nav('感谢支持开发者！车速提升已叠加，剩余 '+fmtBoostCd(adsSpeedLeftH())+' 游戏时间。');
 }else if(intent==='free'){
  ads.freeUntil=Math.max(ads.freeUntil||0,S.T)+ADS_FREE_HOURS; /* 时长叠加 */
  toast('⛽ 感谢支持！零消耗 +5 天，剩余 '+fmtBoostCd(adsFreeLeftH()));
  nav('感谢支持开发者！零消耗已叠加，剩余 '+fmtBoostCd(adsFreeLeftH())+' 游戏时间。');
 }else{
  ads.boostUntil=Math.max(ads.boostUntil||0,S.T)+ADS_BOOST_HOURS; /* 时长叠加 */
  toast('⚡ 感谢支持！双倍收入 +5 天，剩余 '+fmtBoostCd(adsBoostLeftH()));
  nav('感谢支持开发者！双倍收入已叠加，剩余 '+fmtBoostCd(adsBoostLeftH())+' 游戏时间。');
 }
 renderAll();save();
}
/* 流速解锁：仅统计「广告解锁流速」卡片的观看，2 次解锁 2×，4 次解锁 4×（永久） */
function maxUnlockedTs(){
 const w=(S&&S.ads&&S.ads.speedWatch)||0;
 return w>=4?4:(w>=2?2:1);
}
function cycleTimeScale(){
 const cap=maxUnlockedTs();
 if(S.timeScale>=cap){
  if(cap<4)toast(cap===1?'🔒 累计观看 2 个广告解锁 2× 流速（支持页）':'🔒 累计观看 4 个广告解锁 4× 流速（支持页）');
  S.timeScale=1;
 }else S.timeScale*=2;
 $('#dvTsBtn').textContent='⏩ 流速 ×'+S.timeScale;
 save();
}
/* ================= 寻路 ================= */
function dijkstra(src,dst,weight){
 const dist={},prev={},Q=new Set(CITIES.map(c=>c.id));
 CITIES.forEach(c=>dist[c.id]=Infinity); dist[src]=0;
 while(Q.size){
  let u=null,best=Infinity; Q.forEach(x=>{if(dist[x]<best){best=dist[x];u=x}});
  if(u===null||u===dst)break; Q.delete(u);
  for(const e of EDGES){
   if(e.a!==u&&e.b!==u)continue;
   const v=e.a===u?e.b:e.a; if(!Q.has(v))continue;
   const w=weight(e);
   if(dist[u]+w<dist[v]){dist[v]=dist[u]+w;prev[v]=u;}
  }
 }
 if(dist[dst]===Infinity)return null;
 const path=[]; let cur=dst;
 while(cur!==src){path.unshift(cur);cur=prev[cur];}
 path.unshift(src);
 return path;
}
function pathEdges(path){
 return path.slice(1).map((c,i)=>EDGES.find(e=>(e.a===path[i]&&e.b===c)||(e.a===c&&e.b===path[i])));
}
function routeOptions(from,to,tons,truck,overrideMode){
 const st=truck?tStatFor(truck):tStat();
 /* overrideMode：为自动派送等场景固定行驶档位（快速=2.3×车速、1.12×油耗），不随全局档位变化 */
 const spdMode=overrideMode||S.speedMode;
 const spdMul=overrideMode?({eco:1.25,std:1.65,fast:2.3}[overrideMode]||1.65):1;
 const loadFrac=tons?tons/st.load:0;
 const consPerKm=st.consBase*(1+0.32*loadFrac)/100;
 const fp=fuelPrice();
 const wTime=e=>e.km+(e.type==='hw'?0.12:0.05);
 const wMoney=e=>e.km*consPerKm*fp+e.toll;
 const wNoHw=e=>e.km+(e.type==='hw'?1.5:0);
 const mk=(path,label,tag)=>{
  if(!path)return null;
  let km=0,h=0,toll=0,fuel=0,hwKm=0,natKm=0;
  pathEdges(path).forEach(e=>{
   km+=e.km; if(e.type==='hw')hwKm+=e.km; else natKm+=e.km;
   const spd=st.spd*adsSpeedMul()*spdMul;
   h+=e.km/spd; if(e.type==='hw')h+=st.etc?0.02:0.15; else h+=0.12;
   if(edgeIsBorder(e))h+=BORDER.legH;
   toll+=st.etc?Math.round(e.toll*0.95):e.toll;
   fuel+=e.km*consPerKm*WX[S.weather].cons*({eco:0.82,std:1,fast:1.12}[spdMode]||1)*DRAIN_TUNE.fuel;
  });
  return {path,label,tag,km,h,toll,fuel:Math.round(fuel),hwKm:Math.round(hwKm),natKm:Math.round(natKm)};
 };
 const opts=[];
 const f=mk(dijkstra(from,to,wTime),'系统推荐','最快');
 if(f)opts.push(f);
 const c=mk(dijkstra(from,to,wMoney),'老司机路线','最省');
 if(c&&c.path.join()!==f.path.join())opts.push(c);
 const m=mk(dijkstra(from,to,e=>e.km+e.toll/600+(e.type==='hw'?0.05:0.22)),'均衡路线','混合');
 if(m&&!opts.some(o=>o.path.join()===m.path.join()))opts.splice(1,0,m);
 return {opts,consPerKm};
}

/* ================= 接单流程 ================= */
function openOrderDetail(id){
 const o=orderById(id); if(!o)return;
 const cg=CARGO.find(c=>c.id===o.cg), dest=cityById(o.to);
 const ofrom=orderOrigin(o);
 const ro=routeOptions(ofrom,o.to,o.tons);
 const best=ro.opts[0];
 const profit=estProfit(o);
 let dhd='';
 if(o.from!==S.city){
  if(S.journey){
   dhd=`需先空驶到${cityById(o.from).n}装货（当前距装货点约${liveAwayKm(o)}公里，油费自担）<br>`;
  }else{
   const d0=routeOptions(S.city,o.from,0).opts[0];
   if(d0)dhd=`需先从${cityById(S.city).n}空驶到${cityById(o.from).n}装货（约${d0.km}公里 · 约${tspan(d0.h)} · 油费约${money(d0.fuel)}${d0.toll?' · 过路费'+money(d0.toll):''}，自担）<br>`;
  }
 }
 const trust=trustLevel(S.shippers&&S.shippers[o.ship.co]);
 let extra='';
 const lq=QUEUE_LOAD[o.pstation]||[0.4,1.1];
 extra+=`装货排队：约 ${lq[0]}~${lq[1]} 小时（视${o.pstation}繁忙程度）<br>`;
 if(o.chain)extra+=`连送两程：${cityById(o.from).n} → ${cityById(o.chain.mid).n}（捎卸）→ ${dest.n}，中途自动继续第二程<br>`;
 if(o.req)extra+=`⚠️ 特殊要求【${REQ_INFO[o.req][0]}】：${REQ_INFO[o.req][1]}（运价已含补偿）<br>`;
 if(o.riskFlag)extra+=`⚠️ 低星货主：运价较高，但结算可能被克扣或拖延<br>`;
 if(o.lux)extra+=`💎 豪华单：运价 ×2，时限较紧，送达好评率更高<br>`;
 if(o.spec)extra+=`🛍️ ${o.spec===2?'南屿':'沧澜'}特产：只在产地国装货，跨境紧俏<br>`;
 if(o.cross)extra+=`🌍 跨国运单：途经口岸需查验过关（过境费+排队，运价已含溢价）<br>`;
 if(trust>0)extra+=`🤝 ${TRUST_NAMES[trust]}（合作 ${S.shippers[o.ship.co].trips} 次）：运价已上浮<br>`;
 if(o.wTag)extra+=`📈 ${o.wTag}：雨天需求旺盛，运价上浮<br>`;
 const tag=o.lux?'豪华单':(o.urgent?'加急单':(o.perish?'时效单':(o.chain?'连送单':'普通单')));
 askModal({center:true, title:`${cg.i} ${cg.n} · ${o.tons}吨`, tag,
  body:`货主：${o.ship.n}（★${o.ship.r}）· ${o.ship.co}<br>路线：${cityById(ofrom).n}${o.chain&&!o.chain.leg1Done?' → '+cityById(o.chain.mid).n:''} → ${dest.n} · 约${best?best.km:'?'}公里<br>
  <span style="color:#ff5000;font-weight:700;font-size:16px">${money(o.price)}</span>（${o.bargain?'可议价底价':'一口价'}${o.adBoard?'，🎬广告换板价×1.5':''}${S.flags.subLeft>0?'，含平台补贴15%':''}${adsBoostLeftH()>0?'，⚡支持加成结算×2':''}）<br>
  限时 ${tspan(o.hours)} 送达${o.perish?'，生鲜逾期将折价':''}<br>${dhd}${extra}备注：${o.note}<br>
  <span class="muted">预估油费 ${money(best?best.fuel:0)} · 过路费 ${money(best?best.toll:0)} · 预估到手利润 <b style="color:${profit!==null&&profit>=0?'#0a8f60':'#e05346'}">${profit!==null?money(profit):'?'}</b></span>`,
  buttons:[
   ...(o.bargain?[{t:'🗣️ 争取加价',cls:'pri',fn:()=>negotiate(id)}]:[]),
   {t:'接下这单',cls:o.bargain?'ghost':'pri',fn:()=>acceptOrder(id)},
   {t:'再想想',cls:'ghost'}]});
}
function negotiate(id){
 const o=orderById(id); if(!o||!o.bargain)return;
 o.bargain=0; // 只有一次还价机会
 if(chance(0.6)){
  const mul=1.1+Math.random()*0.1;
  o.price=Math.round(o.price*mul/10)*10;
  toast(`🎉 货主同意加价，新价格 ${money(o.price)}`);
 }else if(chance(0.3)){
  S.orders=S.orders.filter(x=>x.id!==id);
  toast('😤 谈崩了，这单被别的司机抢走了');
 }else{
  toast('没谈拢，货主维持原价');
 }
 save();renderAll();
}
function acceptOrder(id){
 const o=orderById(id); if(!o||o.truckId)return;
 /* 货源须在司机所在城市或其邻城（行车中按行程锚点判定） */
 const anc=boardAnchor();
 const nearOk=[anc,S.city].some(base=>o.from===base||nearCities(base).includes(o.from));
 if(!nearOk){S.orders=S.orders.filter(x=>x.id!==id);toast('该货源已不在附近');renderOrders();return}
 o.startT=S.T;
 AUDIO.sfx('accept');
 /* 进入已接列表，先指派车辆再出发 */
 S.accepted=S.accepted||[];
 S.accepted.push(o);
 S.orders=S.orders.filter(x=>x.id!==id);
 openAssignModal(o);
 renderAll();
}
/* 指派车辆弹窗：列出车队所有车，校验载重/车况/占用 */
function openAssignModal(o){
 const cg=CARGO.find(c=>c.id===o.cg);
 const rows=(S.fleet||[]).map(t=>{
  const st=tStatFor(t);
  const loadOk=st.load>=o.tons;
  const wearOk=o.req!=='wear'||(100-t.wear)>=70;
  const busy=truckBusy(t.id);
  const adrv=driverOfTruck(t.id);
  const tired=adrv&&adrv.energy<25;
  const disabled=!loadOk||!wearOk||busy;
  let why=[];
  if(!loadOk)why.push('载重'+st.load+'t不够');
  if(!wearOk)why.push('车况'+(100-Math.round(t.wear))+'%<70%');
  if(busy)why.push('任务中');
  if(tired)why.push('司机'+adrv.name+'精力不足');
  const away=t.city===o.from?0:routeDist(t.city,o.from);
  return `<button class="routeopt ${disabled?'off':''}" data-truck="${t.id}" style="display:block;width:100%;text-align:left;margin-bottom:8px;${disabled?'opacity:.5':''}">
   <div class="rh"><b>${truckIcon(t.model)} ${truckDef(t).n}</b><span class="rt">${t.city===S.city?'在你身边':'在'+cityById(t.city).n}</span></div>
   <div class="rg"><span>载重<b>${st.load}t</b></span><span>车况<b>${100-Math.round(t.wear)}%</b></span><span>油量<b>${Math.round(t.fuel)}L</b></span><span>距装货点<b>${away===0?'同城':away+'km'}</b></span><span>司机<b>${adrv?adrv.name+'·'+DTRAIT[adrv.trait].n+(tired?'（累）':''):'无'}</b></span></div>
   ${why.length?`<div class="deadline bad" style="margin-top:5px">⚠️ ${why.join(' · ')}</div>`:`<div class="deadline ok" style="margin-top:5px">✅ 可指派${busy?'（等当前任务完成）':''}</div>`}
  </button>`;
 }).join('');
 const md=askModal({center:true,title:'🚚 指派车辆运送',tag:`${cg.n} ${o.tons}吨 → ${cityById(o.to).n}`,
  body:`选择一台车承运这单。装货点：${cityById(o.from).n} · ${o.pstation}。<span class="muted">在身边的车可亲自驾驶或自动派送；外地的车可远程自动派送（无司机收代驾费 ¥150，配了司机的车由他出车免代驾费，全程按快速车速行驶，油费过路费自担）。</span><div style="margin-top:10px">${rows}</div>`,
  buttons:[{t:'先挂起（稍后指派）',cls:'ghost'}]});
 md.el.querySelectorAll('[data-truck]').forEach(b=>b.addEventListener('click',()=>{
  const t=truckById(+b.dataset.truck); if(!t)return;
  const st=tStatFor(t);
  if(st.load<o.tons){toast('这台车载重不够');return}
  if(o.req==='wear'&&(100-t.wear)<70){toast('货主要求车况≥70%，这台车车况不达标');return}
  if(truckBusy(t.id)){toast('这台车正在任务中');return}
  o.truckId=t.id; o.state='assigned';
  AUDIO.sfx('accept');
  md.close();
  afterAssign(o,t);
 }));
}
/* 指派后：询问亲自驾驶 / 自动派送（配了司机的车由司机出车，免代驾费） */
function afterAssign(o,t){
 const busy=truckBusy(t.id);
 const cg=CARGO.find(c=>c.id===o.cg);
 const drv=driverOfTruck(t.id);
 if(busy){ toast('已指派给 '+truckDef(t).n+'，等它完成当前任务后可在运单里派送'); renderAll(); return; }
 const local=t.city===S.city;
 const canManual=local&&!S.journey;
 const btns=[];
 if(canManual)btns.push({t:'🚚 亲自驾驶',cls:'pri',fn:()=>{ setCurTruck(t.id,true); startManualDrive(o); }});
 btns.push({t:drv?('🧑‍✈️ '+drv.name+'出车（免费）'):(canManual?'🤖 自动派送（¥150）':'🤖 自动派送 ¥150'),cls:canManual&&!drv?'ghost':'pri',fn:()=>dispatchAuto(o)});
 btns.push({t:'稍后出发',cls:'ghost',fn:()=>{toast('已挂起，可在「我的运单」里随时出发');renderAll();}});
 const driveLine=drv
  ?`司机 <b>${drv.name}</b>（${DTRAIT[drv.trait].n} Lv.${drv.lv}）替你取车运送：${DTRAIT[drv.trait].fx(drv.lv)}，<b>不收代驾费</b>（他的日薪每日已结）。`
  :'由平台代驾取车运送：收代驾费 ¥150 + 油费过路费自担。<span class="muted">在车库给他配名司机，出车免费还吃特长加成。</span>';
 askModal({center:true,title:'已指派 · '+truckDef(t).n,tag:`${cg.n} ${o.tons}吨`,
  body:local?`车辆就在身边，可以直接出发。<br>装货点：${cityById(o.from).n} · ${o.pstation}${o.from!==S.city?'<br><span class="muted">装货点在邻城，出发后先空驶过去。</span>':''}<br>${driveLine}`:`这台车在${cityById(t.city).n}，你人在${cityById(S.city).n}，只能远程出车。<br>${driveLine}`,
  buttons:btns});
}
/* 亲自驾驶：沿用原接单后的装货/规划流程 */
function startManualDrive(o){
 if(S.journey){toast('正在开车，无法再亲自驾驶');return}
 if(o.state==='running'){toast('这单已在运送中');return}
 const t=truckById(o.truckId);
 if(!t||truckBusy(t.id)){toast('车辆不可用，请重新指派');return}
 if(t.city!==S.city){toast('车辆不在身边，无法亲自驾驶');return}
 if(!setCurTruck(t.id,true)){toast('无法切换到指派车辆');return}
 if(o.req==='wear'&&(100-t.wear)<70){toast('货主要求车况≥70%，先维修后再出发');return}
 const pickup=orderOrigin(o); /* 连送单第一程已送时为中途捎卸城市 */
 if(pickup!==S.city){
  o.away=routeDist(S.city,pickup);
  askModal({center:true, title:'出发 · 邻城装货', tag:`装货点在${cityById(pickup).n}`,
   body:`装货点：<b>${cityById(pickup).n} · ${o.pstation}</b><br>先空驶约 <b>${o.away}</b> 公里到邻城，空驶油费自担，限时已把空驶算在内。<br>到达后自动装货，随即规划送货路线出发。`,
   buttons:[
    {t:'规划空驶路线',cls:'pri',fn:()=>openRouteModal(o,true)},
    {t:'返回',cls:'ghost',fn:()=>{renderAll();}}]});
 }else{
  askModal({center:true, title:'开始装货', tag:'装货点就在附近',
   body:`目的地装货点：<b>${cityById(pickup).n} · ${o.pstation}</b><br>空车前往装货，大约需要 40 分钟。${o.chain?'<br>⚠️ 这是连送两程的单：先送 '+cityById(o.chain.mid).n+' 捎卸，再去 '+cityById(o.to).n+'。':''}`,
   buttons:[
    {t:'开始装货',cls:'pri',fn:()=>{ beginLoading(o,()=>openRouteModal(o)); }},
    {t:'返回',cls:'ghost',fn:()=>{renderAll();}}]});
 }
}
/* 自动派送：为订单规划全程（空驶→装货→主送→连送第二程→卸货），后台按游戏时间推进。
 * AUTO_FEE 是无司机时的平台代驾费；配了司机的车由自己的司机出车，不收这笔钱。 */
const AUTO_FEE=150;
function dispatchAuto(o){
 const t=truckById(o.truckId);
 if(!t){toast('请先指派车辆');openAssignModal(o);return}
 if(truckBusy(t.id)){toast('这台车正在任务中');return}
 const legs=[];
 const pickup=orderOrigin(o); /* 连送单第一程已送时为中途捎卸城市 */
 const addLeg=(from,to,tons,kind)=>{
  if(from===to)return;
  const ro=routeOptions(from,to,tons,t,'fast'); /* 自动派送固定按快速车速行驶 */
  const best=ro.opts[0];
  if(!best)throw new Error('noline');
  legs.push({from,to,tons,kind,km:best.km,fuel:best.fuel,toll:best.toll,h:best.h,path:best.path});
 };
 try{
  addLeg(t.city,pickup,0,'deadhead');
  if(o.chain&&!o.chain.leg1Done){
   addLeg(pickup,o.chain.mid,o.tons,'leg1');
   addLeg(o.chain.mid,o.to,o.tons,'leg2');
  }else{
   addLeg(pickup,o.to,o.tons,'leg1');
  }
 }catch(e){toast('没有可达路线，自动派送失败');return}
 if(!drvPrepareAuto(o,t,legs))return; /* 司机精力不足会挡下这台车 */
 const loadH=0.5+stationQueue(o.pstation,QUEUE_LOAD);
 const midH=(o.chain&&!o.chain.leg1Done)?0.4:0;
 const unloadH=unloadQueueH(o); /* 自有仓库城市卸货排队减半 */
 /* 跨境口岸：代驾按普通通道申报缴费，过境费即时收取，查验排队计入用时 */
 let brN=0,brFee=0;
 legs.forEach(l=>{const n=pathBorderCount(l.path);if(n){brN+=n;brFee+=n*borderFeeFor(l.kind==='deadhead'?0:o.tons);}});
 const brH=brN*BORDER.legH;
 const totalH=legs.reduce((s,l)=>s+l.h,0)+loadH+midH+unloadH+brH;
 const totalKm=legs.reduce((s,l)=>s+l.km,0);
 o.job={legs, loadH, midH, unloadH, legIdx:0, startT:S.T, totalH:+totalH.toFixed(2), totalKm, eta:+(S.T+totalH).toFixed(2), mode:'fast', brFee, brN};
 o.state='running'; o.auto=1; o.manual=0;
 drvDepartAuto(o,t,totalH); /* 预扣司机精力 + 行程记名（特长加成已在上面写进 legs） */
 o.away=legs.length&&legs[0].kind==='deadhead'?legs[0].km:0;
 if(unloadH>1){o.detainFee=Math.round((unloadH-1)*150/10)*10;o.detainH=unloadH;}
 if(brFee>0){payCost(brFee,'过境费（代驾申报）');toast('🛃 途经口岸 '+brN+' 处，代驾已代缴过境费 '+money(brFee));}
 const outDrv=driverOfTruck(t.id);
 if(!outDrv)payCost(AUTO_FEE,'自动派送·代驾费'); /* 自己雇的司机出车不收代驾费，日薪已按天结算 */
 markParallelRun();
 AUDIO.sfx('accept');
 if(outDrv)toast(`🧑‍✈️ ${outDrv.name} 已开 ${truckDef(t).n} 出车，预计 ${thhmm(o.job.eta)} 送达`);
 else toast(`🤖 已派 ${truckDef(t).n} 自动运送，预计 ${thhmm(o.job.eta)} 送达`);
 renderAll(); save();
}
/* 多线作战标记：同时有 ≥2 单在途 */
function markParallelRun(){
 const n=(S.accepted||[]).filter(o=>o.state==='running').length;
 if(n>=2)S.flags.multi2=1;
}
/* 自愈：亲自驾驶运单失去对应行程（连送中途退出、到站结算被中断等）时退回已指派，可重新派送 */
function repairOrders(){
 if(!S||!S.accepted)return;
 for(const o of S.accepted){
  if(o.state==='running'&&o.manual&&(!S.journey||S.journey.order!==o)){
   o.state='assigned'; delete o.manual;
   toast('运单已退回待出发，可在「我的运单」重新派送或取消');
  }
 }
}
/* 后台推进自动派送：按游戏时间推进里程/油耗/磨损，到点送达结算 */
function tickFleet(){
 if(!S||!S.accepted)return;
 for(const o of S.accepted.slice()){
  if(o.state!=='running'||!o.auto||!o.job)continue;
  const t=truckById(o.truckId);
  if(!t){S.accepted=S.accepted.filter(x=>x!==o);continue}
  const j=o.job;
  const elapsed=Math.max(0,S.T-j.startT);
  let accH=0;
  while(j.legIdx<j.legs.length){
   const leg=j.legs[j.legIdx];
   if(elapsed>=accH+leg.h){
    /* 该段完成：油耗（不足自动加油）+ 里程 + 磨损 */
    consumeAutoFuel(t,leg);
    t.odo+=leg.km;
    const st=tStatFor(t);
    const dref=o.job.driver,ddrv=dref?driverById(dref.id):null;
    const toughK=ddrv&&ddrv.trait==='tough'?(0.20+(clamp(ddrv.lv,1,DRIVER_MAX_LV)-1)*0.05):0;
    const wearKm=(1.5+0.9+(leg.tons/st.load)*1.2)*st.wearMul*1.05/100*DRAIN_TUNE.wear*(1-toughK);
    t.wear=clamp(t.wear+wearKm*leg.km,0,100);
    t.city=leg.to;
    if(leg.kind==='leg1'&&o.chain&&!o.chain.leg1Done)o.chain.leg1Done=true;
    accH+=leg.h; j.legIdx++;
   }else break;
  }
  if(elapsed>=j.totalH){ finishAutoOrder(o,t); }
 }
}
function consumeAutoFuel(t,leg){
 if(adsFreeLeftH()>0)return;
 const need=leg.fuel;
 if(t.fuel<need){
  const price=fuelPrice(t.city); /* 途中加油按车所在城市价，入股站 8 折 */
  const buy=Math.ceil(need-t.fuel+8);
  payCost(Math.round(buy*price),'车队途中加油');
  const cap=tStatFor(t).cap;
  t.fuel=Math.min(cap,t.fuel+buy);
  toast('⛽ '+truckDef(t).n+' 油量不足，途中自动加油 '+Math.round(buy)+'L');
 }
 t.fuel=Math.max(0,t.fuel-need);
}
function finishAutoOrder(o,t){
 S.accepted=S.accepted.filter(x=>x!==o);
 t.city=o.to;
 drvFinishAuto(o); /* 司机涨经验/忠诚，可能升级 */
 if(S.settleQ===undefined)S.settleQ=[];
 S.settleQ.push(o);
 AUDIO.sfx('arrive');
 toast(`📦 ${truckDef(t).n} 已送达 ${cityById(o.to).n}，待结算`);
 processSettleQ();
 save();
}
/* 结算队列：自动送达的运单逐单弹结算（避免多单同时弹窗；亲自驾驶时延后到行程结束） */
function processSettleQ(){
 if(S.journey)return;
 if(modalOpen||!S.settleQ||!S.settleQ.length)return;
 const o=S.settleQ.shift();
 const t=truckById(o.truckId)||S.truck;
 settleOrder(o,t);
}
/* 取消已接订单（未出发/自动途中）：赔违约金，车辆停在当前位置 */
function cancelAcceptedOrder(id){
 const o=(S.accepted||[]).find(x=>x.id===id); if(!o)return;
 if(o.state==='running'&&o.manual&&S.journey){toast('亲自驾驶中，请在行车界面取消行程');return}
 const t=truckById(o.truckId);
 askModal({center:true,title:'取消运单？',tag:'违约',
  body:`取消这单将赔偿违约金 <b style="color:#ff5000">¥200</b>${o.state==='running'?'，车辆将停在就近位置。':'，订单作废。'}`,
  buttons:[
   {t:'确认取消（赔¥200）',cls:'rd',fn:()=>{
     S.accepted=S.accepted.filter(x=>x!==o);
     payCost(200,'违约赔偿');
     if(o.state==='running'&&o.auto&&t&&o.job){
      /* 自动途中取消：车辆停在当前进度就近节点 */
      t.city=jobNearestNode(o);
     }
     toast('运单已取消（违约金 ¥200）');
     genOrders(); save(); renderAll();
   }},
   {t:'继续运送',cls:'pri'}]});
}
/* 自动任务当前进度就近节点 */
function jobNearestNode(o){
 const j=o.job; if(!j)return o.to;
 const elapsed=Math.max(0,S.T-j.startT);
 let accH=0;
 for(let i=0;i<j.legs.length;i++){
  const leg=j.legs[i];
  if(elapsed<accH+leg.h){
   const frac=clamp((elapsed-accH)/Math.max(0.01,leg.h),0,1);
   const path=leg.path||[leg.from,leg.to];
   const kms=[0]; let km=0;
   pathEdges(path).forEach(e=>{km+=e.km;kms.push(km)});
   const target=frac*km;
   let node=path[0];
   for(let k=0;k<kms.length;k++){ if(kms[k]<=target)node=path[k]; }
   return node;
  }
  accH+=leg.h;
 }
 return j.legs.length?j.legs[j.legs.length-1].to:o.to;
}
let selRoute=0;
function openRouteModal(order,deadhead){
 const leg1=order&&order.chain&&!order.chain.leg1Done;
 const destId=deadhead?order.from:(order?(leg1?order.chain.mid:order.to):selCity);
 const dest=cityById(destId);
 const ro=routeOptions(S.city,destId,(order&&!deadhead)?order.tons:0);
 if(!ro.opts.length){toast('没有可达路线');return}
 selRoute=0;
 const body=ro.opts.map((op,i)=>{
  const arr=S.T+op.h;
  let dl='';
  if(order&&!deadhead){
   const slack=order.deadline-arr;
   dl=slack>=0?`<div class="deadline ok">✅ 预计 ${thhmm(arr)} 到达，比限时早 ${tspan(slack)}</div>`:`<div class="deadline bad">⚠️ 预计 ${thhmm(arr)} 到达，将超时 ${tspan(-slack)}</div>`;
  }else dl=`<div class="deadline ok">预计 ${thhmm(arr)} 到达</div>`;
  return `<div class="routeopt ${i===0?'on':''}" data-act="pickroute" data-i="${i}">
   <div class="rh"><b>${op.label}</b><span class="rt">${op.tag}</span></div>
   <div class="rg"><span>总里程<b>${op.km} km</b></span><span>用时<b>约${tspan(op.h)}</b></span><span>过路费<b>${money(op.toll)}</b></span></div>
   <div class="rg"><span>预估油费<b>${money(op.fuel)}</b></span><span>到达<b>${thhmm(arr)}</b></span><span>构成<b>${op.hwKm>0?'高速':'国道'}为主</b></span></div>
   <div class="deadline" style="color:#8a929c;margin-top:7px">🛣️ 路线构成：高速 ${op.hwKm} km · 国道 ${op.natKm} km${order&&order.req==='hw'&&!deadhead&&op.natKm>0?' · ⚠️ 该单要求全程高速':''}</div>
   ${dl}</div>`;
 }).join('');
 const w=askModal({center:true, title:deadhead?'选择空驶路线':(order?'选择送货路线':'选择行驶路线'), tag:deadhead?`先空驶到${dest.n}装货`:(order?(order.chain?(leg1?'连送第一程出发':'捎卸完毕，继续第二程'):'装货完毕，出发'):`空驶前往${dest.n}`),
  body:`${cityById(S.city).n} → ${dest.n}${order&&!deadhead?` · ${CARGO.find(c=>c.id===order.cg).n} ${order.tons}吨${leg1?`（在${dest.n}捎卸后继续去${cityById(order.to).n}）`:''}`:''}<div style="margin-top:10px">${body}</div>`,
  buttons:[{t:'🚚 出发',cls:'pri',fn:()=>{ startJourney(ro.opts[selRoute],deadhead?null:order,ro.consPerKm,deadhead?order.id:null); }},{t:'再想想',cls:'ghost',fn:()=>{
   /* 连送第二程半路退出：运单退回待出发，避免卡在“亲自驾驶中” */
   if(order&&order.state==='running'&&order.manual&&!S.journey){order.state='assigned';delete order.manual;toast('运单已退回待出发，可重新派送');}
   renderAll();
  }}] , noClose:true});
}
function pickRouteSel(i){
 selRoute=i;
 $$('#modals .routeopt').forEach((el,k)=>el.classList.toggle('on',k===i));
}

/* ================= 驾驶引擎 ================= */
const GAME_H_SEC=1/60; // ×1流速：1现实秒=1游戏分钟，行驶里程与车速/时间的对应更真实
/* 三系消耗整体调低：燃油/车况/精力，想再调快慢改这里（1=原速） */
const DRAIN_TUNE={fuel:0.25,wear:0.15,fatigue:0.5};
/* ---- 伪3D道路渲染引擎 ---- */
const ROAD={raf:0,travel:0,cars:[],oncoming:[],rain:[],signs:[],lights:true,lastT:0,W:0,H:0,dpr:1,lane:0,laneX:0,camX:0,_steerS:0,_wang:0,crashCd:0,steer:0,blink:0,blinkT:0,laneHold:0,preLane:0,blockWarn:0,fatWarn:0,tickPhase:false};
function resizeRoadCv(){
 const cv=$('#roadCv'); if(!cv)return;
 const r=$('#drive').getBoundingClientRect();
 if(r.width<50||r.height<50)return;
 ROAD.dpr=Math.min(2,window.devicePixelRatio||1);
 ROAD.W=r.width; ROAD.H=r.height;
 cv.width=Math.round(ROAD.W*ROAD.dpr); cv.height=Math.round(ROAD.H*ROAD.dpr);
 ROAD.ctx=cv.getContext('2d');
 ROAD.ctx.setTransform(ROAD.dpr,0,0,ROAD.dpr,0,0);
}
function startRoadAnim(){
 ROAD.mctx=$('#mirrorCv')?$('#mirrorCv').getContext('2d'):null;
 if(ROAD.raf)cancelAnimationFrame(ROAD.raf);
 ROAD.lastT=0;
 const loop=(t)=>{
  if($('#drive').classList.contains('hide')){ROAD.raf=0;engineUpdate(0,false);return;}
  const dt=Math.min(0.06,(t-(ROAD.lastT||t))/1000||0.016); ROAD.lastT=t;
  const jj=S&&S.journey;
  const rb=jj&&!jj.paused&&Math.abs(ROAD.laneX||0)>2.35;
  const rainLv=(S&&S.weather>=2&&S.weather<=3)?S.weather-1:0;
  ROAD._fr=(ROAD._fr||0)+1;
  if(ROAD._fr%4===1)engineUpdate(jj&&!jj.paused?(jj.spd||0):0,true,rb,rainLv);
  updateBlinker(jj);
  const fat=S?clamp(S.fatigue||0,0,100):0;
  const fl=ge('dvFatLamp');if(fl)fl.classList.toggle('on',fat>=70);
  if(fat>=70&&jj&&!jj.paused&&(!ROAD.fatWarn||performance.now()-ROAD.fatWarn>25000)){
   ROAD.fatWarn=performance.now();nav('⚠ 精力不足，请尽快驶入服务区休息！');
  }
  drawScene(dt); drawMirror();
  ROAD.raf=requestAnimationFrame(loop);
 };
 ROAD.raf=requestAnimationFrame(loop);
}
function projY(z){ return ROAD.H*0.42 + 1.15*(ROAD.W*0.75)/z; }
function projS(z){ return (ROAD.W*0.75)/z; }
function seeded(n){ const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function ensureCars(j){
 const lim=150;
 const carCols=['#8a4b3d','#4b5d7a','#6b6f5a','#7a5a7d','#93764a','#3d4a5c'];
 let tries=0;
 while(ROAD.cars.length<8&&tries++<60){
  const behind=ROAD.cars.length>=5;
  const nat=j&&j.cur&&j.cur.e.type!=='hw';
  const lane=nat?1:(behind?(chance(0.5)?-1:1):irnd(-1,1));
  const z=behind?-rnd(20,110):rnd(30,240);
  if(ROAD.cars.some(o=>o.lane===lane&&Math.abs(o.z-z)<28))continue;
  ROAD.cars.push({
   lane:lane,
   z:z,
   v:behind?lim*rnd(0.85,1.35):lim*rnd(0.42,0.78),
   kind:'car',
   col:pick(carCols),
   brake:false,brakeT:rnd(2,6),from:behind?'behind':'ahead'
  });
 }
}
function drawVehicleBack(ctx,cx,baseY,s,v,night){
 const w=(v.kind==='truck'?2.5:1.15)*s;
 const h=(v.kind==='truck'?2.6:1.42)*s;
 ctx.fillStyle='rgba(0,0,0,.3)';
 ctx.beginPath();ctx.ellipse(cx,baseY,w*0.55,h*0.05,0,0,7);ctx.fill();
 if(v.kind==='truck'){
  const bw=w, ground=baseY;
  const chassisH=0.3*s, boxH=h*0.8;
  const chassisTop=ground-chassisH, boxTop=chassisTop-boxH;
  // 轮胎阴影
  ctx.fillStyle='rgba(0,0,0,.32)';
  ctx.beginPath();ctx.ellipse(cx,ground,bw*0.52,0.16*s,0,0,7);ctx.fill();
  // 货箱主体（渐变）
  const grd=ctx.createLinearGradient(cx-bw/2,0,cx+bw/2,0);
  grd.addColorStop(0,'#9ea3ad');grd.addColorStop(0.45,v.col);grd.addColorStop(0.55,v.col);grd.addColorStop(1,'#848a95');
  ctx.fillStyle=grd;
  ctx.fillRect(cx-bw/2,boxTop,bw,boxH);
  // 货箱外框
  ctx.strokeStyle='rgba(10,14,18,.5)';
  ctx.lineWidth=Math.max(0.5,0.045*s);
  ctx.strokeRect(cx-bw/2,boxTop,bw,boxH);
  // 双开门中缝
  ctx.strokeStyle='rgba(10,14,18,.3)';
  ctx.beginPath();ctx.moveTo(cx,boxTop+0.05*s);ctx.lineTo(cx,chassisTop);ctx.stroke();
  // 竖向棱线
  ctx.strokeStyle='rgba(0,0,0,.14)';
  ctx.lineWidth=Math.max(0.5,0.03*s);
  for(const f of [-0.62,-0.31,0.31,0.62]){
   ctx.beginPath();ctx.moveTo(cx+f*bw,boxTop+0.05*s);ctx.lineTo(cx+f*bw,chassisTop);ctx.stroke();
  }
  // 顶部高光
  ctx.fillStyle='rgba(255,255,255,.35)';
  ctx.fillRect(cx-bw/2+0.03*s,boxTop+0.03*s,bw-0.06*s,Math.max(0.5,0.07*s));
  // 底部橙色反光条
  ctx.fillStyle='#e2593c';
  ctx.fillRect(cx-bw/2+0.03*s,chassisTop-Math.max(0.6,0.1*s),bw-0.06*s,Math.max(0.6,0.1*s));
  // 车架底盘
  ctx.fillStyle='#22262d';
  ctx.fillRect(cx-bw/2+0.05*s,chassisTop,bw-0.1*s,chassisH);
  // 尾灯组
  const tlw=Math.max(1,0.32*s), tlh=Math.max(1,0.15*s);
  ctx.fillStyle=v.brake?'#ff453a':'#c73029';
  ctx.fillRect(cx-bw/2+0.07*s,chassisTop+0.03*s,tlw,tlh);
  ctx.fillRect(cx+bw/2-0.07*s-tlw,chassisTop+0.03*s,tlw,tlh);
  if(night||v.brake){
   ctx.fillStyle=v.brake?'rgba(255,70,55,.5)':'rgba(255,50,40,.3)';
   ctx.fillRect(cx-bw/2+0.03*s,chassisTop-0.04*s,tlw+0.12*s,tlh+0.14*s);
   ctx.fillRect(cx+bw/2-0.09*s-tlw,chassisTop-0.04*s,tlw+0.12*s,tlh+0.14*s);
  }
  // 车牌
  ctx.fillStyle='#e8e8e0';
  ctx.fillRect(cx-0.2*s,chassisTop+0.04*s,0.4*s,Math.max(1,0.13*s));
  // 挡泥板
  ctx.fillStyle='#181b20';
  ctx.fillRect(cx-bw/2+0.06*s,chassisTop+chassisH-0.06*s,0.2*s,chassisH);
  ctx.fillRect(cx+bw/2-0.26*s,chassisTop+chassisH-0.06*s,0.2*s,chassisH);
 }else{
  // 轿车尾部：低矮车身+座舱+横向尾灯
  const bodyTop=baseY-h*0.56;
  // 轮胎（车身两侧底部露出）
  ctx.fillStyle='#0e1116';
  ctx.fillRect(cx-w*0.54,baseY-h*0.06,w*0.13,h*0.06);
  ctx.fillRect(cx+w*0.41,baseY-h*0.06,w*0.13,h*0.06);
  // 车身
  ctx.fillStyle=v.col;
  ctx.fillRect(cx-w/2,bodyTop,w,baseY-bodyTop);
  // 侧面阴影
  ctx.fillStyle='rgba(0,0,0,.22)';
  ctx.fillRect(cx-w/2,bodyTop,w*0.09,baseY-bodyTop);
  ctx.fillRect(cx+w*0.41,bodyTop,w*0.09,baseY-bodyTop);
  // 保险杠深色带
  ctx.fillStyle='rgba(0,0,0,.28)';
  ctx.fillRect(cx-w/2,baseY-h*0.09,w,h*0.09);
  // 行李厢盖高光
  ctx.fillStyle='rgba(255,255,255,.15)';
  ctx.fillRect(cx-w*0.38,bodyTop,w*0.76,Math.max(0.5,h*0.05));
  // 座舱
  ctx.fillStyle=v.col;
  ctx.fillRect(cx-w*0.36,baseY-h,w*0.72,bodyTop-(baseY-h));
  ctx.fillStyle='rgba(0,0,0,.15)';
  ctx.fillRect(cx-w*0.36,baseY-h,w*0.07,bodyTop-(baseY-h));
  ctx.fillRect(cx+w*0.29,baseY-h,w*0.07,bodyTop-(baseY-h));
  // 后挡风玻璃
  ctx.fillStyle=night?'#0a0e14':'#233040';
  ctx.fillRect(cx-w*0.29,baseY-h+Math.max(0.5,h*0.09),w*0.58,(bodyTop-(baseY-h))*0.58);
  // 车顶高光
  ctx.fillStyle='rgba(255,255,255,.14)';
  ctx.fillRect(cx-w*0.36,baseY-h,w*0.72,Math.max(0.5,h*0.05));
  // 横向长条尾灯
  const tlY=bodyTop+h*0.1;
  ctx.fillStyle=v.brake?'#ff5346':'#b32721';
  ctx.fillRect(cx-w*0.46,tlY,w*0.32,Math.max(1,h*0.09));
  ctx.fillRect(cx+w*0.14,tlY,w*0.32,Math.max(1,h*0.09));
  if(v.brake){
   ctx.fillStyle='rgba(255,80,60,.3)';
   ctx.beginPath();ctx.arc(cx-w*0.3,tlY+Math.max(1,h*0.045),w*0.2,0,7);ctx.fill();
   ctx.beginPath();ctx.arc(cx+w*0.3,tlY+Math.max(1,h*0.045),w*0.2,0,7);ctx.fill();
  }else if(night){
   ctx.fillStyle='rgba(255,90,70,.16)';
   ctx.beginPath();ctx.arc(cx-w*0.3,tlY+Math.max(1,h*0.045),w*0.12,0,7);ctx.fill();
   ctx.beginPath();ctx.arc(cx+w*0.3,tlY+Math.max(1,h*0.045),w*0.12,0,7);ctx.fill();
  }
  // 牌照
  ctx.fillStyle='#dfe3d8';
  ctx.fillRect(cx-w*0.14,baseY-h*0.2,w*0.28,Math.max(1,h*0.07));
 }
}
function drawVehicleFront(ctx,cx,baseY,s,col,night){
 const w=1.8*s,h=1.42*s;
 ctx.fillStyle='rgba(0,0,0,.3)';
 ctx.beginPath();ctx.ellipse(cx,baseY,w*0.55,h*0.05,0,0,7);ctx.fill();
 ctx.fillStyle=col;
 ctx.fillRect(cx-w/2,baseY-h*0.55,w,h*0.55);
 ctx.fillRect(cx-w*0.42,baseY-h,w*0.84,h*0.5);
 ctx.fillStyle='rgba(15,20,28,.85)';
 ctx.fillRect(cx-w*0.36,baseY-h*0.94,w*0.72,h*0.32);
 ctx.fillStyle=night?'rgba(255,240,190,.95)':'#d8dde2';
 ctx.fillRect(cx-w/2+0.06*s,baseY-h*0.5,0.28*s,Math.max(1,0.13*s));
 ctx.fillRect(cx+w/2-0.34*s,baseY-h*0.5,0.28*s,Math.max(1,0.13*s));
 if(night){
  ctx.fillStyle='rgba(255,240,180,.35)';
  ctx.beginPath();ctx.arc(cx-w/2+0.2*s,baseY-h*0.44,0.26*s,0,7);ctx.fill();
  ctx.beginPath();ctx.arc(cx+w/2-0.2*s,baseY-h*0.44,0.26*s,0,7);ctx.fill();
 }
}
function changeLane(d){
 if(!S||!S.journey||S.journey.paused||!S.journey.cur)return;
 ROAD.steer=0;
 const now=performance.now();
 if(now<(ROAD.laneHold||0))return;
 const from=ROAD.lane||0,to=clamp(from+d,-1,1);
 if(to===from)return;
 // 先打转向灯
 ROAD.blink=to>from?1:-1;ROAD.blinkT=now;
 // 侧后方来车则暂缓，等空当
 const blocked=ROAD.cars.some(c=>c.lane===to&&c.from==='behind'&&c.z>-45&&c.z<14);
 if(blocked){
  if(!ROAD.blockWarn||now-ROAD.blockWarn>2600){ROAD.blockWarn=now;dvLog('🔊 侧后方有车接近，先打灯等一等。','sys');}
  ROAD.laneHold=now+560;
  return;
 }
 ROAD.preLane=from;ROAD.lane=to;ROAD.laneHold=now+420;
}
function journeyMarks(j){
 if(j._marks)return j._marks;
 const sa=[],legs=[];let acc=0;
 for(const stp of j.steps){
  if(stp.type==='sa')sa.push({name:stp.name,at:acc});
  else{acc+=stp.km;legs.push({to:stp.to,at:acc,gate:!!stp.gate});}
 }
 return j._marks={sa,legs};
}
function spawnSigns(j){
 const M=journeyMarks(j);
 for(const m of M.sa){
  const gap=m.at-j.doneKm;
  if(!m.fired&&gap<=2.2&&gap>-0.2){m.fired=1;ROAD.signs.push({z:200,kind:'sa',text:m.name+' 2km'});}
 }
 for(const m of M.legs){
  const gap=m.at-j.doneKm;
  if(!m.fired&&gap<=1.1&&gap>-0.2){
   m.fired=1;
   ROAD.signs.push(m.gate?{z:160,kind:'toll',text:cityById(m.to).n+'收费站'}:{z:160,kind:'city',text:cityById(m.to).n});
  }
 }
}
/* 道路线形断面：按行程里程生成曲率/坡度控制点（平滑插值） */
function profileArr(j,key,step,amp,straight){
 if(!j.pseed)j.pseed=((j.totalKm*13.7+S.T*3.1)%99991+1)|0;
 let arr=j[key]||(j[key]=[0]);
 const need=Math.ceil((j.totalKm*1000+9000)/step)+3;
 while(arr.length<need){
  const i=arr.length;
  const r=seeded(j.pseed+i*7.77+step);
  arr.push(i===0||r<straight?0:clamp(arr[i-1]+(seeded(j.pseed+i*3.33+step)-0.5)*amp*2.4,-amp,amp));
 }
 return arr;
}
function profAt(arr,step,d){
 const f=clamp(d/step,0,arr.length-1.001),i=f|0,fr=f-i,t=fr*fr*(3-2*fr);
 return arr[i]+(arr[i+1]-arr[i])*t;
}
function drawScene(dt){
 const ctx=ROAD.ctx; if(!ctx||!ROAD.W)return;
 const W=ROAD.W,H=ROAD.H;
 const j=S&&S.journey;
 const spd=(j&&j.spd)||0;
 ROAD.travel+=spd/3.6*dt;
 // 道路线形：曲率+坡度断面 → 本帧横向/纵向偏移表
 let cNow=0,roadX=()=>0,roadY=()=>0,elevY=projY;
 if(j){
  const pc=profileArr(j,'_pc',260,0.00065,0.24),pg=profileArr(j,'_pg',340,0.0011,0.3);
  cNow=profAt(pc,260,ROAD.travel);
  const TL=6,TN=52,RX=[0],RY=[0];let tx=0,ty=0,tdx=0,tdy=0;
  for(let i=1;i<=TN;i++){
   const ab=ROAD.travel+i*TL;
   tdx+=profAt(pc,260,ab)*TL*TL;tx+=tdx;
   tdy+=profAt(pg,340,ab)*TL*TL;ty+=tdy;
   RX.push(tx);RY.push(ty);
  }
  roadX=z=>{const f=clamp(z/TL,0,TN-0.001),i=f|0;return RX[i]+(RX[i+1]-RX[i])*(f-i)};
  roadY=z=>{const f=clamp(z/TL,0,TN-0.001),i=f|0;return RY[i]+(RY[i+1]-RY[i])*(f-i)};
  elevY=z=>projY(z)-roadY(z)*projS(z);
 }
 // 弯道离心（柔和）：不放方向盘会被缓甩向外侧；转向输入平滑，转向灯先行
 const lean=cNow*Math.pow(spd/3.6,2)/1.1;
 ROAD._steerS+=((ROAD.steer*3.1)-ROAD._steerS)*Math.min(1,dt*7);
 if(j&&j.paused){/*停驶中横移冻结*/}
 else if(ROAD.steer){
  ROAD.laneX=clamp(ROAD.laneX+(ROAD._steerS-lean)*dt,-2.9,2.9);
  ROAD.lane=clamp(Math.round(ROAD.laneX/1.25),-1,1);
  if(!ROAD.blink&&Math.abs(ROAD.laneX-ROAD.lane*1.25)>0.45){ROAD.blink=ROAD.steer>0?1:-1;ROAD.blinkT=performance.now();}
 }else{
  const hold=performance.now()<(ROAD.laneHold||0);
  const lt=hold?(ROAD.preLane||ROAD.lane):ROAD.lane;
  ROAD.laneX+=((lt*1.25)-ROAD.laneX)*Math.min(1,dt*2.6)-lean*dt;
 }
 // 镜头横向缓动：吸收方向盘快速输入带来的画面晃动
 ROAD.camX+=(ROAD.laneX-ROAD.camX)*Math.min(1,dt*6);
 // 收费站 / 服务区闸道：减速滑行进站，到位后触发缴费/服务区
 if(ROAD.gantry&&j){
  const etc=tStat().etc,cap=ROAD.gantry.z<25?(etc?40:16):(etc?55:45);
  if(S._pedal==='gas')j.spd=Math.min(j.spdBase||60,(j.spd||0)+14*dt);
  else if(S._pedal==='brake')j.spd=Math.max(8,(j.spd||0)-20*dt);
  else if(j.spd>cap)j.spd=Math.max(cap,j.spd-16*dt);
  else j.spd=Math.max(8,j.spd);
  ROAD.gantry.z-=j.spd/3.6*dt;
  addTime(GAME_H_SEC*S.timeScale*dt);
  ge('dvSpeed').textContent=Math.round(j.spd);
  if(ROAD.gantry.z<=6){const g=ROAD.gantry;ROAD.gantry=null;showTollModal(g.step);}
 }
 if(ROAD.saGate&&j){
  const cap=ROAD.saGate.z<22?14:40;
  if(S._pedal==='gas')j.spd=Math.min(j.spdBase||60,(j.spd||0)+12*dt);
  else if(S._pedal==='brake')j.spd=Math.max(8,(j.spd||0)-18*dt);
  else if(j.spd>cap)j.spd=Math.max(cap,j.spd-14*dt);
  else j.spd=Math.max(8,j.spd);
  ROAD.saGate.z-=j.spd/3.6*dt;
  addTime(GAME_H_SEC*S.timeScale*dt);
  ge('dvSpeed').textContent=Math.round(j.spd);
  if(ROAD.saGate.z<=6){const g=ROAD.saGate;ROAD.saGate=null;saStop(g.step);}
 }
 // 压线路肩：车身细震 + 隆隆声，提醒回车道（记录峰值偏移，低速帧也不漏报）
 ROAD.laneXPeak=Math.max(ROAD.laneXPeak||0,Math.abs(ROAD.laneX||0));
 const rumbleOn=j&&!j.paused&&ROAD.laneXPeak>2.35;
 if(rumbleOn&&(!ROAD.rumbleWarn||performance.now()-ROAD.rumbleWarn>9000)){
  ROAD.rumbleWarn=performance.now();ROAD.laneXPeak=0;
  dvLog('🔊 车轮压到路肩了，快回到车道！','sys');
 }
 const camX=ROAD.camX||0;
 const type=(j&&j.cur)?j.cur.e.type:'hw';
 // 区域地貌：山区(岚烟/青崖/鹿鸣) 湖区(玄湖) 矿区(金汀) 其余城区
 const RREG={lanyan:'mnt',qingya:'mnt',luming:'mnt',xuanhu:'lake',jinting:'mine'};
 const region=(j&&j.cur)?(RREG[j.cur.e.a]||RREG[j.cur.e.b]||'city'):'city';
 const wx=S?WX[S.weather]:WX[0];
 const hour=S?(S.T%24):12;
 const night=hour>=19.5||hour<5.5;
 ge('drive').classList.toggle('dashNight',night);
 const dusk=(hour>=17&&hour<19.5)||(hour>=5&&hour<7);
 const wet=wx.n==='小雨'||wx.n==='大雨';
 ensureCars(j);
 if(j&&j.cur)spawnSigns(j);
 const shake=(S&&S.speedMode==='fast'&&spd>160)?1:0;
 ctx.save();
 if(shake)ctx.translate(rnd(-1,1),rnd(-0.6,0.6));
 if(rumbleOn)ctx.translate(rnd(-1.3,1.3),rnd(-0.8,0.8));
 const steer=clamp((ROAD.lane*1.25-camX)*-0.02-ROAD.steer*0.035,-0.07,0.07);
 ctx.translate(W/2,H*0.55);ctx.rotate(steer);ctx.translate(-W/2,-H*0.55);
 // 天空
 const hy=H*0.42;
 let sky1,sky2;
 if(night){sky1='#070c16';sky2='#1c2740';}
 else if(dusk){sky1='#2c3550';sky2='#c97a4a';}
 else{sky1='#5e97cf';sky2='#c3dcec';}
 if(wx.n==='大雾'){sky1='#9aa4ad';sky2='#b8c0c6';}
 const skyKey=sky1+'|'+sky2+'|'+(H|0);
 if(ROAD._skyKey!==skyKey){ROAD._skyKey=skyKey;const sky=ctx.createLinearGradient(0,0,0,hy);sky.addColorStop(0,sky1);sky.addColorStop(1,sky2);ROAD._sky=sky;}
 ctx.fillStyle=ROAD._sky;ctx.fillRect(-2,-2,W+4,hy+2);
 // 太阳/月亮
 if(!night&&!wx.n.includes('雨')&&wx.n!=='大雾'){ctx.fillStyle=dusk?'#ffb45e':'#ffe9a8';ctx.beginPath();ctx.arc(W*0.78,hy*0.34,dusk?14:11,0,7);ctx.fill();}
 else if(night){ctx.fillStyle='#e8e2cf';ctx.beginPath();ctx.arc(W*0.76,hy*0.3,9,0,7);ctx.fill();ctx.fillStyle=sky1;ctx.beginPath();ctx.arc(W*0.76+5,hy*0.3-3,8,0,7);ctx.fill();}
 // 远景：山区双层脊线（其余区域保持干净地平线）
 if(region==='mnt'){
  for(let lay=1;lay>=0;lay--){
   ctx.fillStyle=night?(lay?'#0d1522':'#111b2b'):(dusk?(lay?'#2a3050':'#343c5e'):(lay?'#6d84a0':'#8299b5'));
   ctx.beginPath();ctx.moveTo(-2,hy+1);
   for(let k=0;k<=8;k++){ctx.lineTo(k*W/8-2,hy-(14+seeded(k*3+lay*17)*36)*(1-lay*0.35));}
   ctx.lineTo(W+2,hy+1);ctx.closePath();ctx.fill();
  }
 }
 // 地面
 ctx.fillStyle=night?'#10160f':(type==='hw'?'#2f3641':'#3e5a3c');
 ctx.fillRect(-2,hy-1,W+4,H-hy+2);
 // 路面分段（透视，含弯道与坡度）——高速三车道带护栏肩线，国道窄双向两车道中央黄线，按颜色合批
 const zNear=0.62,zFar=170,segLen=6;
 const isHw=type==='hw';
 const RW=isHw?3.8:3.2;
 const band1=isHw?(night?'#1e2126':'#3f434c'):(night?'#20211f':'#454239');
 const band2=isHw?(night?'#22252b':'#454a54'):(night?'#242523':'#4a4740');
 const grassA=night?'#10160f':(isHw?'#2f3641':'#3e5a3c');
 const grassB=night?'#141b13':(isHw?'#343b46':'#446043');
 const startK=Math.floor((ROAD.travel+zNear)/segLen);
 const QA=ROAD._qa||(ROAD._qa=[]);QA.length=0;
 const QB=ROAD._qb||(ROAD._qb=[]);QB.length=0;
 const RA=ROAD._ra||(ROAD._ra=[]);RA.length=0;
 const RB=ROAD._rb||(ROAD._rb=[]);RB.length=0;
 const SH=ROAD._sh||(ROAD._sh=[]);SH.length=0;
 const DA=ROAD._da||(ROAD._da=[]);DA.length=0;
 const NE=ROAD._ne||(ROAD._ne=[]);NE.length=0;
 const CY=ROAD._cy||(ROAD._cy=[]);CY.length=0;
 for(let k=startK;k<startK+50;k++){
  const z1=k*segLen-ROAD.travel, z2=z1+segLen;
  if(z2<zNear)continue;
  const zz1=Math.max(z1,zNear), zz2=Math.min(z2,zFar);
  const s1=projS(zz1),s2=projS(zz2);
  const y1=Math.min(H+30,elevY(zz1)), y2=elevY(zz2);
  if(y2>y1)continue;
  const x1=W/2+(roadX(zz1)-camX)*s1, x2=W/2+(roadX(zz2)-camX)*s2;
  const e1=RW*s1, e2=RW*s2;
  QA.push(-2,y1,x1-e1,y1,x2-e2,y2,-2,y2, W+2,y1,x1+e1,y1,x2+e2,y2,W+2,y2);
  (k%2===0?RA:RB).push(x1-e1,y1,x1+e1,y1,x2+e2,y2,x2-e2,y2);
  if(isHw){
   SH.push(x1-3.66*s1,y1-0.5,x1-3.46*s1,y1-0.5,x2-3.46*s2,y2-0.5,x2-3.66*s2,y2-0.5,
    x1+3.46*s1,y1-0.5,x1+3.66*s1,y1-0.5,x2+3.66*s2,y2-0.5,x2+3.46*s2,y2-0.5);
   if(k%2===0)DA.push(x1-1.34*s1,y1,x1-1.16*s1,y1,x2-1.16*s2,y2,x2-1.34*s2,y2,
    x1+1.16*s1,y1,x1+1.34*s1,y1,x2+1.34*s2,y2,x2+1.16*s2,y2);
  }else{
   NE.push(x1-3.14*s1,y1-0.4,x1-2.94*s1,y1-0.4,x2-2.94*s2,y2-0.4,x2-3.14*s2,y2-0.4,
    x1+2.94*s1,y1-0.4,x1+3.14*s1,y1-0.4,x2+3.14*s2,y2-0.4,x2+2.94*s2,y2-0.4);
   if(k%2===0)CY.push(x1-0.09*s1,y1,x1+0.09*s1,y1,x2+0.09*s2,y2,x2-0.09*s2,y2);
  }
 }
 const fillQ=(arr,col)=>{if(!arr.length)return;ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<arr.length;i+=8){ctx.moveTo(arr[i],arr[i+1]);ctx.lineTo(arr[i+2],arr[i+3]);ctx.lineTo(arr[i+4],arr[i+5]);ctx.lineTo(arr[i+6],arr[i+7]);}ctx.closePath();ctx.fill();};
 fillQ(QA,grassA);fillQ(QB,grassB);fillQ(RA,band1);fillQ(RB,band2);
 if(isHw){fillQ(SH,night?'#7a7258':'#c8b24a');fillQ(DA,night?'#9c917a':'#e8e4d8');}
 else{fillQ(NE,night?'#49525b':'#d5d9de');fillQ(CY,night?'#6f6838':'#e0b23c');}
 // 路灯（夜间）：灯杆+三层光锥+地面光斑
 if(night&&type==='hw'){
  for(let k=Math.floor(ROAD.travel/38);k<Math.floor(ROAD.travel/38)+6;k++){
   const z=k*38+10-ROAD.travel;
   if(z<3||z>150)continue;
   const s=projS(z),y=elevY(z);
   const side=(k%2===0)?-1:1;
   const poleX=W/2+(roadX(z)+side*4.6-camX)*s;
   const lampX=poleX-side*0.8*s,lampY=y-2.1*s;
   ctx.strokeStyle='#3a4048';ctx.lineWidth=Math.max(1,0.09*s);
   ctx.beginPath();ctx.moveTo(poleX,y);ctx.lineTo(poleX,y-2.1*s);ctx.lineTo(lampX,y-2.1*s);ctx.stroke();
   ctx.fillStyle='rgba(255,224,160,.95)';
   ctx.beginPath();ctx.arc(lampX,lampY-0.05*s,Math.max(1,0.11*s),0,7);ctx.fill();
   const spr=1.5*s;
   ctx.fillStyle='rgba(255,218,150,.09)';
   ctx.beginPath();ctx.moveTo(lampX,lampY);ctx.lineTo(lampX-spr,y);ctx.lineTo(lampX+spr,y);ctx.closePath();ctx.fill();
   ctx.fillStyle='rgba(255,218,150,.13)';
   ctx.beginPath();ctx.moveTo(lampX,lampY);ctx.lineTo(lampX-spr*0.62,y);ctx.lineTo(lampX+spr*0.62,y);ctx.closePath();ctx.fill();
   ctx.fillStyle='rgba(255,224,170,.2)';
   ctx.beginPath();ctx.moveTo(lampX,lampY);ctx.lineTo(lampX-spr*0.32,y);ctx.lineTo(lampX+spr*0.32,y);ctx.closePath();ctx.fill();
   ctx.fillStyle='rgba(255,218,150,.15)';
   ctx.beginPath();ctx.ellipse(lampX,y,spr*0.9,Math.max(1,0.22*s),0,0,7);ctx.fill();
   if(wet){
    ctx.fillStyle='rgba(255,214,140,.28)';ctx.fillRect(lampX-1.1*s,y,2.2*s,3*s);
    ctx.fillStyle='rgba(255,214,140,.1)';ctx.fillRect(lampX-1.1*s,y+3*s,2.2*s,7*s);
   }
  }
 }
 // 两侧景物
 for(let k=Math.floor(ROAD.travel/22);k<Math.floor(ROAD.travel/22)+9;k++){
  const z=k*22+4-ROAD.travel;
  if(z<2||z>160)continue;
  const s=projS(z),y=elevY(z);
  const fade=clamp(1.25-z/140,0,1);
  if(type==='hw'){
   // 防撞栏
   for(const side of [-1,1]){
    ctx.fillStyle=night?'#2c323a':'#8d949c';
    ctx.fillRect(W/2+(roadX(z)+side*4.1-camX)*s-0.1*s,y-0.5*s,0.2*s,0.5*s);
   }
   if(region==='mnt'){
    // 山区：路侧松柏
    for(const side of [-1,1]){
     const r1=seeded(k*17+side*5);
     const tx=W/2+(roadX(z)+side*(4.8+r1*3)-camX)*s, th=(3+r1*3.2)*s;
     ctx.globalAlpha=fade;
     ctx.fillStyle=night?'#0d1410':'#1d3a20';
     ctx.beginPath();ctx.moveTo(tx,y-th);ctx.lineTo(tx-0.62*s,y);ctx.lineTo(tx+0.62*s,y);ctx.closePath();ctx.fill();
     ctx.globalAlpha=1;
    }
   }else if(region==='mine'){
    // 矿区：渣堆
    for(const side of [-1,1]){
     const r1=seeded(k*19+side*7);
     const mx=W/2+(roadX(z)+side*(5.6+r1*3)-camX)*s;
     ctx.globalAlpha=fade;
     ctx.fillStyle=night?'#161a1c':'#55534a';
     ctx.beginPath();ctx.arc(mx,y,(1.6+r1*1.6)*s,Math.PI,0);ctx.fill();
     ctx.globalAlpha=1;
    }
   }
  }else{
   // 树木与电线杆（山区为高大松柏）
   const pine=region==='mnt';
   for(const side of [-1,1]){
    const r1=seeded(k*17+side*5);
    const tx=W/2+(roadX(z)+side*(4.6+r1*3.4)-camX)*s, th=(2.2+r1*2.4)*s*(pine?1.55:1);
    ctx.globalAlpha=fade;
    ctx.fillStyle=pine?(night?'#0d1410':'#1d3a20'):(night?'#131a12':'#2e4a2c');
    ctx.beginPath();ctx.moveTo(tx,y-th);ctx.lineTo(tx-0.75*s,y);ctx.lineTo(tx+0.75*s,y);ctx.closePath();ctx.fill();
    ctx.globalAlpha=1;
   }
   // 国道岔路：土路从路侧汇入
   if(k%6===0){
    const sd2=seeded(k*7.7)>0.5?1:-1;
    const jx=W/2+(roadX(z)+sd2*3.3-camX)*s,jw=3.8*s;
    ctx.globalAlpha=fade;
    ctx.fillStyle=night?'#191d20':'#b7b2a0';
    ctx.fillRect(sd2>0?jx:jx-jw,y-0.2*s,jw,Math.max(1,0.4*s));
    ctx.globalAlpha=1;
   }
   if(k%2===0){
    const poleX=W/2+(roadX(z)+4.35-camX)*s;
    ctx.strokeStyle=night?'#262b31':'#6d747c';ctx.lineWidth=Math.max(1,0.06*s);
    ctx.beginPath();ctx.moveTo(poleX,y);ctx.lineTo(poleX,y-2.4*s);ctx.stroke();
   }
  }
 }
 // 路侧标志（服务区 / 收费站 / 城市界牌）
 ctx.textAlign='center';ctx.textBaseline='middle';
 for(let i=ROAD.signs.length-1;i>=0;i--){
  const sg=ROAD.signs[i];
  sg.z-=spd/3.6*dt;
  if(sg.z<3){ROAD.signs.splice(i,1);continue}
  if(sg.z>230)continue;
  const s2=projS(sg.z),gy=elevY(sg.z);
  const cx=W/2+(roadX(sg.z)+5.7-camX)*s2;
  const fade=clamp(1.55-sg.z/170,0,1);
  if(fade<=0)continue;
  ctx.globalAlpha=fade;
  {
   const chars=Math.min(sg.text.length,10);
   const bw=(chars*0.8+1.2)*s2,bh=1.55*s2,bx=cx-bw/2,by=gy-3.2*s2;
   ctx.fillStyle='#7d868e';ctx.fillRect(cx-Math.max(0.6,0.12*s2)/2,by+bh,Math.max(1.2,0.24*s2),gy-by-bh);
   ctx.fillStyle=sg.kind==='sa'?'#1c66c4':'#0c7a44';
   ctx.fillRect(bx,by,bw,bh);
   ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=Math.max(0.5,0.07*s2);
   ctx.strokeRect(bx+0.09*s2,by+0.09*s2,bw-0.18*s2,bh-0.18*s2);
   ctx.fillStyle='#fff';ctx.font='700 '+Math.max(4.5,0.92*s2)+'px sans-serif';
   ctx.fillText(sg.text,cx,by+bh/2+0.05*s2);
  }
  ctx.globalAlpha=1;
 }
 // 收费站龙门架（含车道信号灯与岗亭）/ 服务区蓝色门架+匝道
 if(ROAD.gantry&&ROAD.gantry.z<240&&ROAD.gantry.z>14){
  const g=ROAD.gantry,s2=projS(g.z),gy=elevY(g.z);
  const gcx=W/2+(roadX(g.z)-camX)*s2,h2=4.7*s2,bt=Math.max(2,0.5*s2);
  ctx.fillStyle='#5b6670';
  ctx.fillRect(W/2+(roadX(g.z)-4.1-camX)*s2-Math.max(1,0.22*s2)/2,gy-h2,Math.max(2,0.44*s2),h2);
  ctx.fillRect(W/2+(roadX(g.z)+4.1-camX)*s2-Math.max(1,0.22*s2)/2,gy-h2,Math.max(2,0.44*s2),h2);
  ctx.fillStyle='#3f6c4f';ctx.fillRect(gcx-4.1*s2,gy-h2,8.2*s2,bt);
  ctx.fillStyle='#2f5a40';ctx.fillRect(gcx-4.1*s2,gy-h2,8.2*s2,bt*0.4);
  ctx.fillStyle='#37e05f';
  for(const lx of [-1.25,0,1.25]){
   ctx.fillRect(W/2+(roadX(g.z)+lx-camX)*s2-Math.max(1,0.26*s2)/2,gy-h2+bt*0.5,Math.max(1,0.26*s2),Math.max(1,0.3*s2));
  }
  const bx2=W/2+(roadX(g.z)+2.55-camX)*s2;
  ctx.fillStyle='#cfd6de';ctx.fillRect(bx2-0.9*s2,gy-1.7*s2,1.8*s2,1.7*s2);
  ctx.fillStyle='#27343f';ctx.fillRect(bx2-0.72*s2,gy-1.48*s2,1.44*s2,0.62*s2);
 }
 if(ROAD.saGate&&ROAD.saGate.z<240&&ROAD.saGate.z>14){
  const g=ROAD.saGate,s2=projS(g.z),gy=elevY(g.z);
  const rx0=W/2+(roadX(g.z)-camX)*s2;
  ctx.fillStyle='#5b6670';ctx.fillRect(rx0+3.1*s2-Math.max(1,0.2*s2)/2,gy-4*s2,Math.max(2,0.4*s2),4*s2);
  ctx.fillStyle='#1c66c4';ctx.fillRect(rx0,gy-4*s2,3.4*s2,Math.max(2,0.55*s2));
  ctx.fillStyle='#fff';ctx.font='700 '+Math.max(4,0.85*s2)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('服务区',rx0+1.7*s2,gy-4*s2+Math.max(1,0.28*s2));
  // 白色导流匝道：岔道从门架向近处展开（两侧实线边缘+斜向分隔线，近处限宽淡出）
  const rFade=clamp((g.z-14)/40,0,1);
  if(rFade>0){
   const steps=8;
   const wAt=z=>clamp((g.z-z)*0.055,0.25,2.3);
   const stripQ=(zA,oA1,oA2,zB,oB1,oB2,col,a)=>{
    const sA=projS(zA),sB=projS(zB),yA=elevY(zA),yB=elevY(zB),rA=roadX(zA),rB=roadX(zB);
    ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();
    ctx.moveTo(W/2+(rA+oA1-camX)*sA,yA);ctx.lineTo(W/2+(rA+oA2-camX)*sA,yA);
    ctx.lineTo(W/2+(rB+oB2-camX)*sB,yB);ctx.lineTo(W/2+(rB+oB1-camX)*sB,yB);
    ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   };
   for(let i=0;i<steps;i++){
    const zA=g.z-(g.z-6)*i/steps,zB=g.z-(g.z-6)*(i+1)/steps;
    const wA=wAt(zA),wB=wAt(zB);
    stripQ(zA,3.58,wA-0.23,zB,3.58,wB-0.23,'#ffffff',0.22*rFade);
    if(wB>1.6)stripQ(zA,3.6,3.88,zB,wB-0.9,wB-0.62,'#ffffff',0.45*rFade);
    stripQ(zA,3.35,3.58,zB,3.35,3.58,'#f2f5f7',0.85*rFade);
    stripQ(zA,wA-0.23,wA,zB,wB-0.23,wB,'#f2f5f7',0.85*rFade);
   }
  }
 }
 // 车流（同向）：各色轿车（货车已移除）
 // AI 跟车：同车道保持车距，不追尾不重叠
 for(const c of ROAD.cars){
  for(const o of ROAD.cars){
   if(o===c||o.lane!==c.lane)continue;
   const gap=o.z-c.z;
   if(gap>=0.5&&gap<12&&o.v<c.v)c.v=Math.max(o.v*0.95,c.v-30*dt);
   if(gap>=0&&gap<4.5)c.z=o.z-4.5;
  }
 }
 for(let ci=ROAD.cars.length-1;ci>=0;ci--){
  const c=ROAD.cars[ci];
  c.z-=(spd-c.v)/3.6*dt;
  if(c.from==='behind'){
   // 同向后车：快追上玩家所在车道时自动变道避让或减速跟随
   if(c.z>-16&&c.z<0&&Math.abs(c.lane*1.25-ROAD.laneX)<1.15&&c.v>=spd*0.95){
    const other=c.lane===-1?1:-1;
    const laneBusy=ROAD.cars.some(o=>o!==c&&o.from==='ahead'&&o.lane===other&&o.z<45);
    if(!laneBusy)c.lane=other; else c.v=Math.min(c.v,Math.max(20,spd*0.88));
   }
   if(c.z>320||c.z<-150){c.z=-rnd(30,110);c.v=165*rnd(0.85,1.35);c.lane=(j&&j.cur&&j.cur.e.type!=='hw')?1:(chance(0.5)?-1:1);}
  }else if(c.z<3||c.z>320){
   c.z=rnd(90,300);c.lane=(j&&j.cur&&j.cur.e.type!=='hw')?1:irnd(-1,1);c.v=150*rnd(0.42,0.78);
   c.kind='car';
   c.col=pick(['#8a4b3d','#4b5d7a','#6b6f5a','#7a5a7d','#93764a','#3d4a5c']);
  }
  c.brakeT=(c.brakeT||0)-dt;
  if(c.brakeT<=0){c.brake=!c.brake;c.brakeT=c.brake?rnd(0.8,1.6):rnd(2,6);}
  // 与玩家碰撞：同车道接近=追尾事故，轻微接触=刮蹭（须先于 z<3 的重生判定）
  if(c.z<4.5&&c.z>-1&&Math.abs(c.lane*1.25-ROAD.laneX)<1.0&&(S.T||0)>=(ROAD.crashCd||0)){
   const rel=spd-c.v;
   ROAD.crashCd=S.T+0.3;
   let cost,wear;
   if(rel>18){
    cost=irnd(10,20)*100;wear=irnd(6,12);addTime(0.8);
    j.spd=Math.max(5,c.v*0.35);
    AUDIO.sfx('crash');
    dvLog('🔊 追尾碰撞！行车记录仪判你全责，维修+赔偿 '+money(cost)+'。','sys');
    toast('追尾碰撞：'+money(cost)+'，耗时48分钟');
   }else{
    cost=irnd(3,8)*100;wear=irnd(2,4);addTime(0.4);
    j.spd=Math.max(j.spd*0.6,c.v*0.8);
    AUDIO.sfx('scrape');
    dvLog('🔊 变道刮蹭！已靠边处理，注意观察后视镜。','sys');
    toast('变道刮蹭：修理 '+money(cost)+'，耗时24分钟');
   }
   payCost(cost,'车辆碰撞');
   S.truck.wear=clamp(S.truck.wear+wear,0,100);
   ROAD.cars.splice(ci,1);
   continue;
  }
  if(c.z<2||c.z>160)continue;
  const s=projS(c.z),y=elevY(c.z);
  const cx=W/2+(roadX(c.z)+c.lane*1.25-camX)*s;
  const fade=clamp(1.3-c.z/150,0,1);
  ctx.globalAlpha=fade;
  drawVehicleBack(ctx,cx,y,s,c,night);
  if(wet){
   const rc=c.brake?'rgba(255,70,50,':'rgba(255,125,95,';
   ctx.fillStyle=rc+(night?0.35:0.15)+')';ctx.fillRect(cx-0.55*s,y,1.1*s,2.2*s);
   ctx.fillStyle=rc+(night?0.14:0.05)+')';ctx.fillRect(cx-0.55*s,y+2.2*s,1.1*s,4.8*s);
  }
  ctx.globalAlpha=1;
 }
 // 本车大灯：近处光铺+两段远光锥
 if(night&&ROAD.lights){
  const nearY=projY(4)+H*0.05,midY=projY(14),farY=projY(38);
  const b1=W/2+(-1.9-camX)*projS(4),b2=W/2+(1.9-camX)*projS(4);
  const m1=W/2+(-1.2-camX)*projS(14),m2=W/2+(1.2-camX)*projS(14);
  const f1=W/2+(-0.6-camX)*projS(38),f2=W/2+(0.6-camX)*projS(38);
  ctx.fillStyle='rgba(255,240,196,.16)';
  ctx.beginPath();ctx.moveTo(b1,nearY);ctx.lineTo(b2,nearY);ctx.lineTo(m2,midY);ctx.lineTo(m1,midY);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,240,196,.1)';
  ctx.beginPath();ctx.moveTo(m1,midY);ctx.lineTo(m2,midY);ctx.lineTo(f2,farY);ctx.lineTo(f1,farY);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,240,200,.09)';
  ctx.beginPath();ctx.ellipse(W/2-camX*projS(9),projY(9),projS(9)*3.2,projS(9)*1.05,0,0,7);ctx.fill();
 }
 // 雨天
 if(wet){
  ctx.fillStyle='rgba(20,30,45,.22)';ctx.fillRect(-2,-2,W+4,H+4);
  ctx.strokeStyle='rgba(200,220,240,.4)';ctx.lineWidth=1;
  if(ROAD.rain.length<70)for(let i=ROAD.rain.length;i<70;i++)ROAD.rain.push({x:Math.random()*W,y:Math.random()*H,v:rnd(420,640)});
  ctx.beginPath();
  for(const d of ROAD.rain){
   d.y+=d.v*dt;d.x-=d.v*dt*0.12;
   if(d.y>H){d.y=-8;d.x=Math.random()*W;}
   ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+2,d.y+11);
  }
  ctx.stroke();
 }
 if(wx.n==='大雾'){ctx.fillStyle=night?'rgba(150,158,166,.16)':'rgba(178,188,196,.34)';ctx.fillRect(-2,-2,W+4,H+4);}
 ctx.restore();
 // 方向盘随踏板微转（带平滑）
 const wheel=ge('dvWheel');
 if(wheel){
  let ang;
  if(ROAD.steer)ang=ROAD.steer*55;
  else ang=(S._pedal==='gas'?-7:S._pedal==='brake'?6:Math.sin(ROAD.travel/9)*2.4)+(ROAD.lane*1.25-ROAD.laneX)*-14+cNow*Math.pow(spd/3.6,2)*60;
  ROAD._wang=ROAD._wang===undefined?ang:ROAD._wang+(ang-ROAD._wang)*Math.min(1,dt*6);
  wheel.style.transform='rotate('+ROAD._wang.toFixed(1)+'deg)';
 }
}
function drawMirror(){
 const m=ROAD.mctx; if(!m)return;
 const w=150,h=60;
 m.fillStyle='#0a0f14';m.fillRect(0,0,w,h);
 const hy=h*0.34;
 m.strokeStyle='rgba(210,215,222,.5)';m.lineWidth=1.5;
 m.beginPath();m.moveTo(3,h);m.lineTo(w/2-8,hy);m.moveTo(w-3,h);m.lineTo(w/2+8,hy);m.stroke();
 m.fillStyle='#171b21';
 m.beginPath();m.moveTo(4,h);m.lineTo(w/2-7,hy);m.lineTo(w/2+7,hy);m.lineTo(w-4,h);m.closePath();m.fill();
 m.fillStyle='#565e68';
 const off=(ROAD.travel*1.6)%16;
 for(let k=0;k<4;k++){
  const yy=h-((k*16+off)%(h-hy+8));
  m.fillRect(w/2-1.5,Math.max(hy+2,yy-5),3,5);
 }
 const hour=S?(S.T%24):12;
 const night=hour>=19.5||hour<5.5;
 // 后方同向车辆（后视镜里看到的是它们的车头）
 if(S&&S.journey){
  for(const c of ROAD.cars){
   if(c.from!=='behind'||c.z>=-3||c.z<=-70)continue;
   const d=-c.z;
   const sc=clamp(1-d/70,0.18,1);
   const yy=hy+(h-hy)*(1-sc*0.82);
   const xx=w/2+c.lane*13*sc-(ROAD.laneX||0)*2.2*sc;
   const cw=7*sc,ch=5*sc;
   // 车身
   m.fillStyle=night?'#3d4750':c.col;
   m.fillRect(xx-cw/2,yy-ch,cw,ch);
   // 挡风玻璃与车顶
   m.fillStyle='rgba(15,20,28,.8)';
   m.fillRect(xx-cw*0.38,yy-ch*0.82,cw*0.76,ch*0.34);
   // 大灯（夜间点亮）
   if(night){
    m.fillStyle='rgba(255,238,185,.92)';
    m.fillRect(xx-cw*0.4,yy-ch*0.28,cw*0.22,ch*0.2);
    m.fillRect(xx+cw*0.18,yy-ch*0.28,cw*0.22,ch*0.2);
    m.fillStyle='rgba(255,238,185,.28)';
    m.beginPath();m.arc(xx-cw*0.29,yy-ch*0.18,2.2*sc,0,7);m.fill();
    m.beginPath();m.arc(xx+cw*0.29,yy-ch*0.18,2.2*sc,0,7);m.fill();
   }else if(c.brake){
    m.fillStyle='rgba(255,70,50,.8)';
    m.fillRect(xx-cw*0.4,yy-ch*0.28,cw*0.2,ch*0.18);
    m.fillRect(xx+cw*0.2,yy-ch*0.28,cw*0.2,ch*0.18);
   }
  }
 }
}
function honk(){
 try{
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
  const ac=new AC(); const g=ac.createGain(); g.gain.value=0.07; g.connect(ac.destination);
  [362,458].forEach(f=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(g);o.start();o.stop(ac.currentTime+0.32);});
  setTimeout(()=>ac.close(),700);
 }catch(e){}
}
/* 引擎声（WebAudio 合成：低频轰鸣 + 路噪，音调随车速） */
const ENGINE={ctx:null};
function engineStart(){
 if(ENGINE.ctx)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
  const ac=new AC();
  const master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
  const o1=ac.createOscillator();o1.type='sawtooth';o1.frequency.value=45;
  const f1=ac.createBiquadFilter();f1.type='lowpass';f1.frequency.value=300;f1.Q.value=1.1;
  const g1=ac.createGain();g1.gain.value=0.55;o1.connect(f1);f1.connect(g1);g1.connect(master);
  const o2=ac.createOscillator();o2.type='square';o2.frequency.value=22.5;
  const g2=ac.createGain();g2.gain.value=0.3;o2.connect(g2);g2.connect(master);
  const buf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);
  const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const ns=ac.createBufferSource();ns.buffer=buf;ns.loop=true;
  const nf=ac.createBiquadFilter();nf.type='lowpass';nf.frequency.value=420;
  const ng=ac.createGain();ng.gain.value=0.12;ns.connect(nf);nf.connect(ng);ng.connect(master);
  const rf=ac.createBiquadFilter();rf.type='lowpass';rf.frequency.value=90;
  const rg=ac.createGain();rg.gain.value=0;ns.connect(rf);rf.connect(rg);rg.connect(master);
  const rh=ac.createBiquadFilter();rh.type='highpass';rh.frequency.value=1400;
  const rainG=ac.createGain();rainG.gain.value=0;ns.connect(rh);rh.connect(rainG);rainG.connect(master);
  o1.start();o2.start();ns.start();
  ENGINE.ctx=ac;ENGINE.master=master;ENGINE.o1=o1;ENGINE.o2=o2;ENGINE.rg=rg;ENGINE.rainG=rainG;
 }catch(e){}
}
function engineUpdate(spd,active,rumble,rain){
 const E=ENGINE;if(!E.ctx)return;
 try{
  if(E.ctx.state==='suspended')E.ctx.resume();
  const t=E.ctx.currentTime;
  const v=active?clamp(0.05+spd/750,0,0.16):0;
  E.master.gain.setTargetAtTime(v,t,0.25);
  const f=45+spd*0.82;
  E.o1.frequency.setTargetAtTime(f,t,0.18);
  E.o2.frequency.setTargetAtTime(f/2,t,0.18);
  if(E.rg)E.rg.gain.setTargetAtTime(active&&rumble?0.55:0,t,0.07);
  if(E.rainG)E.rainG.gain.setTargetAtTime(active&&rain?(rain===2?0.085:0.05):0,t,0.5);
 }catch(e){}
}
function blinkTick(){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  let ac=ENGINE.ctx,close=false;
  if(!ac||ac.state!=='running'){ac=new AC();close=true;}
  const g=ac.createGain();g.gain.value=0.026;g.connect(ac.destination);
  const o=ac.createOscillator();o.type='square';o.frequency.value=1080;
  o.connect(g);o.start();o.stop(ac.currentTime+0.05);
  if(close)setTimeout(()=>{try{ac.close()}catch(e){}},150);
 }catch(e){}
}
function updateBlinker(jj){
 const now=performance.now();
 const ph=ROAD.blink?Math.floor(now/360)%2===0:false;
 const bl=ge('dvBlinkL'),br=ge('dvBlinkR');
 if(bl)bl.classList.toggle('on',ROAD.blink===-1&&ph);
 if(br)br.classList.toggle('on',ROAD.blink===1&&ph);
 if(ROAD.blink&&ph&&!ROAD.tickPhase&&jj&&!jj.paused)blinkTick();
 ROAD.tickPhase=ph;
 if(ROAD.blink&&now-ROAD.blinkT>4600)ROAD.blink=0;
 if(ROAD.blink&&Math.abs(ROAD.laneX-ROAD.lane*1.25)<0.13&&now-ROAD.blinkT>900)ROAD.blink=0;
}
function setCruise(on){
 S.cruiseOn=on;
 const b=$('#dvCruiseBtn');
 if(b){b.classList.toggle('on',on);b.textContent=on?('🎯'+Math.round(ROAD.cruiseSpd||0)):'🎯 巡航';}
}
function buildSteps(path){
 const steps=[];
 const nodes=path;
 path.slice(1).forEach((c,i)=>{
  const e=EDGES.find(e2=>(e2.a===nodes[i]&&e2.b===c)||(e2.a===c&&e2.b===nodes[i]));
  const dirFrom=e.a===nodes[i]?e.a:e.b, dirTo=e.a===nodes[i]?e.b:e.a;
  /* 路段中途停靠点：服务区 + 跨境口岸（可同段共存），按里程排序切腿 */
  const cuts=[];
  if(e.type==='hw'&&e.sa)cuts.push({t:e.sa[1],type:'sa',name:e.sa[0]});
  if(edgeIsBorder(e))cuts.push({t:BORDER.splitAt,type:'br',name:borderPortName(e)});
  if(cuts.length){
   cuts.sort((a,b)=>a.t-b.t);
   let prevKm=0;
   for(const cut of cuts){
    const km=Math.round(e.km*cut.t)-prevKm;
    if(km>0)steps.push({type:'leg',e,km,to:dirTo});
    steps.push({type:cut.type,name:cut.name,e});
    prevKm=Math.round(e.km*cut.t);
   }
   const rest=e.km-prevKm;
   if(rest>0)steps.push({type:'leg',e,km:rest,gate:e.type==='hw',to:dirTo});
  }else steps.push({type:'leg',e,km:e.km,gate:e.type==='hw',to:dirTo});
 });
 return steps;
}
/* 顶部路线条：节点 / 收费站 / 服务区 / 口岸标记 */
function journeyProgMarks(j){
 if(j._pm)return j._pm;
 let acc=0;const marks=[];
 for(const stp of j.steps){
  if(stp.type==='sa')marks.push({at:acc,kind:'sa',name:stp.name});
  else if(stp.type==='br')marks.push({at:acc,kind:'br',name:stp.name});
  else{acc+=stp.km;marks.push({at:acc,kind:stp.gate?'toll':'node',name:cityById(stp.to).n});}
 }
 return j._pm=marks;
}
function renderProgBar(j){
 const el=$('#dvProgMarks');if(!el)return;
 el.innerHTML=journeyProgMarks(j).map(m=>`<i class="${m.kind}" style="left:${clamp(m.at/(j.totalKm||1)*100,0,100).toFixed(2)}%" title="${m.name}"></i>`).join('');
}
function startJourney(plan,order,consPerKm,pickupId){
 if(S.journey){toast('已在行程中');return}
 const dest=plan.path[plan.path.length-1];
 /* 亲自驾驶的必须是身边那台车：把当前车切到指派车辆 */
 if(order&&order.truckId)setCurTruck(order.truckId,true);
 S.journey={steps:buildSteps(plan.path),path:plan.path,idx:-1,legKm:0,legKmDone:0,doneKm:0,totalKm:plan.km,order:order||null,consPerKm,paused:false,dest,label:plan.label,riskCargo:0,cur:null,spd:0,night:false,truckId:S.curTruck,pickup:pickupId||null};
 if(order){
  order.state='running'; order.manual=1; order.auto=0;
  if(!order.startT)order.startT=S.T;
 }
 S.truck.city=S.city;
 S._pedal=null; S.status='drive';
 markParallelRun();
 AUDIO.autoTheme();
 // 出发后直接在地图上行驶：切到地图页，视野回到全图
 mapLastCity=null; focusHome();
 switchTab('map');
 nextStep();
 save();
}
function updateLegDyn(){
 const j=S.journey,st=tStat(),wx=WX[S.weather];
 const modeMul={eco:1.25,std:1.65,fast:2.3}[S.speedMode];
 const fatMode={eco:0.9,std:1,fast:1.28}[S.speedMode];
 const consMode={eco:0.82,std:1,fast:1.12}[S.speedMode];
 j.spdBase=Math.max(16,st.spd*modeMul*wx.spd)*adsSpeedMul();
 j.loadFrac=j.order?j.order.tons/st.load:0;
 j.roadMul=j.cur.e.type==='hw'?0.85:1.3;
 j.consNow=j.consPerKm*consMode*wx.cons*DRAIN_TUNE.fuel;
 j.wearKm=(1.5+j.spd/80+j.loadFrac*1.2)*st.wearMul*j.roadMul/100*DRAIN_TUNE.wear;
 const hour=S.T%24; j.night=hour>=22||hour<5;
 j.fatH=4.2*st.fatMul*fatMode*(j.night?1.3:1)*(wx.fat||1)*(j.cur.e.type==='hw'&&st.navLvl>=3?0.85:1)*DRAIN_TUNE.fatigue;
}
const DRIVE_TIMERS=new Set();
function beginLeg(stp){
 const j=S.journey;
 DRIVE_TIMERS.forEach(t=>clearInterval(t)); DRIVE_TIMERS.clear(); j.timer=null;
 j.cur=stp; j.cur._done=false; j.legKm=stp.km; j.legKmDone=0;
 j.tollWait=null;j.saWait=null;j.brWait=null;
 updateLegDyn();
 nav(`已驶入${stp.e.name}，本段${stp.km}公里，祝一路平安。`);
 const t=setInterval(tickDrive,120);
 DRIVE_TIMERS.add(t); j.timer=t;
}
function tickDrive(){
 const j=S.journey;
 if(!j||j.paused||!j.cur||j.tollWait||j.saWait||j.brWait)return;
 const dt=0.12;
 const hAdv=GAME_H_SEC*S.timeScale*dt;
 const pedal=S._pedal==='gas'?1.18:S._pedal==='brake'?0.42:1;
 // 重卡惯性：满载加速慢，松油门缓滑行，刹车急减速
 const limitCeil=j.spdBase;
 let tgt=Math.min(limitCeil,j.spdBase*pedal);
 // 定速巡航：松油门锁定设定车速，油门可临时超车，踩刹车解除
 if(S.cruiseOn){
  if(S._pedal==='brake'){setCruise(false);toast('踩刹车，定速巡航解除');}
  else tgt=S._pedal==='gas'?Math.max(ROAD.cruiseSpd||0,tgt):Math.max(16,Math.min(ROAD.cruiseSpd||0,limitCeil));
 }
 const up=(15-5*(j.loadFrac||0))*(0.72+0.28*WX[S.weather].spd);
 const dn=S._pedal==='brake'?20:6.5;
 j.spd=j.spd<tgt?Math.min(tgt,j.spd+up*dt):Math.max(tgt,j.spd-dn*dt);
 const kmAdv=j.spd*hAdv;
 j.wearKm=(1.5+j.spd/80+j.loadFrac*1.2)*tStat().wearMul*j.roadMul/100*DRAIN_TUNE.wear;
 j.legKmDone+=kmAdv; j.doneKm+=kmAdv; S.truck.odo+=kmAdv; S.stats.km+=kmAdv;
 if(adsFreeLeftH()>0){ /* 免除消耗：燃油/车况/精力零消耗 */ }
 else{
  S.truck.fuel=Math.max(0,S.truck.fuel-j.consNow*kmAdv);
  S.truck.wear=clamp(S.truck.wear+j.wearKm*kmAdv,0,100);
  S.fatigue=clamp((+S.fatigue||0)+j.fatH*hAdv,0,100);
 }
 addTime(hAdv);
 if(S.truck.fuel<=0){fuelOut();return}
 if(S.truck.wear>=100){breakdown();return}
 if(S.fatigue>=100){forcedRest();return}
 updateDriveHud();
 updateJourneyMap();
 if(j.legKmDone>=j.legKm){clearInterval(j.timer);j.timer=null;arriveLeg();}
}
function updateDriveHud(){
 const j=S.journey; if(!j)return;
 $('#dvProg').style.width=clamp(j.doneKm/j.totalKm*100,0,100)+'%';
 $('#dvRemain').textContent=Math.max(0,Math.round(j.totalKm-j.doneKm));
 $('#dvGn').textContent='里程 '+fmt(S.truck.odo)+' km';
 $('#dvSpeed').textContent=Math.round(j.spd||0);
 const wearPct=Math.round(100-S.truck.wear);
 $('#dvWearPct').textContent=wearPct+'%';
 const bar=$('#dvWearBar');
 bar.style.width=clamp(wearPct,0,100)+'%';
 bar.className=wearPct<25?'bad':wearPct<50?'warn':'';
 const st=tStat();
 $('#dvFuelPct').textContent=Math.round(S.truck.fuel/st.cap*100)+'%';
 $('#dvFatPct').textContent=Math.round(100-S.fatigue)+'%';
 const remH=Math.max(0,(j.totalKm-j.doneKm)/Math.max(20,j.spd));
 let eta=`预计 ${thhmm(S.T+remH)} 到达`;
 if(j.order){const left=j.order.deadline-S.T-remH; eta+=left>=0?` · 限时余${tspan(left)}`:' · ⚠️已超时';}
 $('#dvEta').textContent=eta;
 let nx=j.cur?j.cur.e.name:'正在出发…';
 let acc=j.cur?Math.max(0,j.legKm-j.legKmDone):0;
 for(let i=j.idx+1;i<j.steps.length;i++){
  const s=j.steps[i];
  if(s.type==='sa'){nx=`前方 · ${s.name} ${Math.round(acc)}km`;break}
  if(s.gate){nx=`前方 · ${cityById(s.to).n}收费站 ${Math.round(acc)}km`;break}
  acc+=s.km;
  if(acc>420)break;
 }
 $('#dvNext').textContent=nx;
}
function nextStep(){
 const j=S.journey; if(!j)return;
 j.idx++; j.legKmDone=0;
 if(j.idx>=j.steps.length){finishJourney();return}
 const stp=j.steps[j.idx];
 if(stp.type==='sa'){startSAApproach(stp);return}
 if(stp.type==='br'){startBorderApproach(stp);return}
 beginLeg(stp);
}
function arriveLeg(){
 const j=S.journey,stp=j.cur;
 if(!j||!stp||stp._done)return;
 stp._done=true;
 DRIVE_TIMERS.forEach(t=>clearInterval(t)); DRIVE_TIMERS.clear(); j.timer=null;
 if(stp.gate){startTollApproach(stp);return;}
 afterLegEvents();
}
/* 收费站 / 服务区：地图模式下直接弹出缴费 / 服务区面板 */
function startTollApproach(stp){
 const j=S.journey;j.tollWait=stp;
 updateJourneyMap();
 showTollModal(stp);
}
function startSAApproach(stp){
 const j=S.journey;j.saWait=stp;
 updateJourneyMap();
 saStop(stp);
}
/* ================= 口岸过关 ================= */
function startBorderApproach(stp){
 const j=S.journey;j.brWait=stp;
 updateJourneyMap();
 showBorderModal(stp);
}
function showBorderModal(stp){
 const j=S.journey,o=j.order;
 const fee=borderFeeFor(o?o.tons:0);
 const wait=Math.round(rnd(0.6,1.8)*4)/4;
 AUDIO.sfx('toll');
 dvLog('🔊 抵达'+stp.name+'，排队等待过关。');
 askModal({center:true,title:'🛃 '+stp.name,tag:'跨国口岸',
  body:`排队查验约 <b>${tspan(wait)}</b> · 过境费 <b style="color:#ff5000">${money(fee)}</b>${o?`（含货物申报 ¥${BORDER.feeTon}/吨 × ${o.tons}吨）`:''}<br><span class="muted">两国海关联检：生鲜要提前申报，危化品需两国许可。绿色通道免排队，偶尔也要抽检。</span>`,
  buttons:[
   {t:`🛃 普通通道 · ${tspan(wait)}`,cls:'pri',fn:()=>{
     S.cash-=fee;addLedger('过境费',-fee);toast('过境费 '+money(fee),'money');
     addTime(wait);borderInspect(stp);
   }},
   {t:`⚡ 绿色通道 ${money(BORDER.vipFee)} · 30分钟`,cls:'ghost',fn:()=>{
     S.cash-=BORDER.vipFee;addLedger('过境费(绿色通道)',-BORDER.vipFee);
     addTime(BORDER.vipH);borderInspect(stp);
   }}
  ]});
}
function borderInspect(stp){
 const j=S.journey;
 dvLog('🛃 '+stp.name+'：'+(j.brWait?'等待边检放行。':'已通关。'));
 if(chance(BORDER.inspect)){
  if(chance(0.4)){
   const f=irnd(BORDER.fineMin/100,BORDER.fineMax/100)*100;
   payCost(f,'口岸罚款');S.stats.fines+=f;addTime(0.5);
   askModal({center:true,title:'🔍 开箱查验',tag:stp.name,
    body:'海关开箱抽查发现货物单证不符，补办手续+罚款 <b style="color:#ff5000">'+money(f)+'</b>，额外耗时 30 分钟。<span class="muted"><br>跨境运单最好看清货主要求，申报一致才能顺畅过关。</span>',
    buttons:[{t:'继续行程',cls:'pri',fn:()=>nextStep()}]});
   return;
  }
  addTime(0.5);
  askModal({center:true,title:'🔍 开箱查验',tag:stp.name,
   body:'海关开箱抽查：货证一致，铅封完好，<b style="color:#0a8f60">查验通过</b>。多花了 30 分钟。<span class="muted"><br>属正常抽检，绿色通道也可能被抽到。</span>',
   buttons:[{t:'继续行程',cls:'pri',fn:()=>nextStep()}]});
  return;
 }
 toast('🛃 通关顺利，入境'+(cityCtry(j.path[j.idx+1]||j.dest)===2?'南屿':'沧澜')+'');
 nextStep();
}
function showTollModal(stp){
 const st=tStat();
 const toll=st.etc?Math.round(stp.e.toll*0.95):stp.e.toll;
 AUDIO.sfx('toll');
 if(st.etc){ S.cash-=toll; addLedger('过路费(ETC95折)',-toll); dvLog(`🔊 ETC 通道通行，扣费 ${money(toll)}。`); nextStep(); }
 else askModal({center:true,title:'⛩️ '+cityById(stp.to).n+'收费站',body:`本段高速通行费 <b style="color:#ff5000">${money(toll)}</b><br><span class="muted">装 ETC 可过站不停车，费用 95 折</span>`,buttons:[{t:'缴费通行',cls:'pri',fn:()=>{S.cash-=toll;addLedger('过路费',-toll);toast('收费站缴费 '+money(toll),'money');nextStep();}}]});
}
/* ================= 服务区 / 突发状况 ================= */
function pauseJ(){ if(S.journey)S.journey.paused=true; }
function saStop(stp){
 pauseJ();
 const st=tStat();
 const price=+(fuelPrice()*1.06).toFixed(2);
 const fullCost=Math.round((st.cap-S.truck.fuel)*price);
 askModal({center:true,title:'🛻 '+stp.name,tag:'高速途中',
  body:`油量 <b>${Math.round(S.truck.fuel)}L</b>（可跑约 ${Math.round(S.truck.fuel/j_consNowSafe())} km）· 车况 ${100-Math.round(S.truck.wear)}% · 精力 ${100-Math.round(S.fatigue)}%<br>本站油价 ¥${price.toFixed(2)}/L`,
  buttons:[
   {t:`⛽ 加满（${money(fullCost)}）`,cls:'pri',fn:()=>{ if(fullCost>0){payCost(fullCost,'加油'); S.truck.fuel=st.cap; toast('已加满油');} else toast('油箱是满的'); saStop(stp); }},
   {t:'😴 眯一会（1小时）',cls:'ghost',fn:()=>{ addTime(1); S.fatigue=clamp(S.fatigue-22,0,100); toast('睡了会，精神多了'); saStop(stp); }},
   {t:'🍜 吃碗面（¥25）',cls:'ghost',fn:()=>{ payCost(25,'餐费'); addTime(0.5); S.fatigue=clamp(S.fatigue-10,0,100); toast('吃饱了，继续赶路'); saStop(stp); }},
   {t:'➡️ 继续赶路',cls:'or',fn:()=>{ nextStep(); }}]});
}
function j_consNowSafe(){ const j=S.journey; return j&&j.consNow?j.consNow:0.3; }
function fuelOut(){
 pauseJ();
 S.journey.pauseReason='燃油耗尽';
 askModal({center:true,title:'⛽ 燃油耗尽！',body:'卡车趴窝在路上了。只能叫道路救援送油：<b>¥900（+80L）</b>，耗时约45分钟。<span class="muted"><br>提示：出发前看好油量，途中只有服务区能加油。</span>',
  buttons:[{t:'叫救援',cls:'or',fn:()=>{ payCost(900,'道路救援'); S.truck.fuel+=80; addTime(0.75); S.stats.breaks++; }}]});
}
function breakdown(){
 pauseJ();
 S.journey.pauseReason='车辆故障';
 const re=S.insured?Math.round(1500*0.7):0;
 payCost(1500,'拖车抢修');
 if(re>0){S.cash+=re;addLedger('保险理赔',re);toast('🛡️ 保险理赔 '+money(re)+'（拖车抢修）');}
 askModal({center:true,title:'🔧 车辆严重故障',body:'发动机冒烟趴了窝，只能拖到最近的服务区抢修：<b>拖车+抢修 ¥1,500</b>，耗时 1.5 小时。'+(re>0?`<span class="muted"><br>保险报销后实付 ¥${1500-re}。</span>`:'')+'<span class="muted"><br>平时注意维修保养，别把车开到报废。</span>',
  buttons:[{t:'拖车抢修',cls:'or',fn:()=>{ S.truck.wear=Math.min(S.truck.wear,35); addTime(1.5); S.stats.breaks++; toast('抢修完毕，车能动了'); }}]});
}
function forcedRest(){
 S.fatigue=62; addTime(3);
 dvLog('🔊 精力耗尽，已强制停车休息3小时。','sys');
 toast('精力耗尽，强制休息 3 小时后继续赶路');
}
function weightedPick(pool){
 let tot=0; pool.forEach(p=>tot+=(p.w||1));
 let r=Math.random()*tot;
 for(const p of pool){ r-=(p.w||1); if(r<=0)return p; }
 return pool[pool.length-1];
}
const EVENTS=[
 {w:2,cond:j=>j.cur.e.type==='hw',run(j){addTime(0.35);return{title:'🚧 收费站排队',body:'前方收费站车流密集，排队通行花了些时间。'}}},
 {w:2.5,cond:j=>j.cur.e.type==='hw'&&S.truck.wear>30,run(j){const c=irnd(3,8)*100;payCost(c,'换胎');insClaim(c,'换胎');addTime(1);return{title:'💥 爆胎！',body:`高速上后轮爆胎，万幸控制住了。换备胎+补胎花费 <b>${money(c)}</b>，耗时1小时。<span class="muted"><br>车况越差越容易爆胎，好轮胎更耐用。</span>`}}},
 {w:2,cond:j=>S.weather<=1,run(j){S.weather=chance(0.6)?2:3;dvLog('🔊 前方天气突变，请谨慎驾驶。','sys');return{title:'🌧️ 天气突变',body:`前方路段转为${WX[S.weather].n}，车速下降、油耗上升，请小心驾驶。`}}},
 {w:1.2,cond:j=>S.weather<=1,run(j){S.weather=4;return{title:'🌫️ 团雾来袭',body:'前方能见度骤降，请减速慢行，注意避让。'}}},
 {w:2.5,cond:j=>j.cur.e.type!=='hw',run(j){const ex=irnd(5,15);if(!adsFreeLeftH())S.truck.fuel=Math.max(0,S.truck.fuel-j.consNow*ex);addTime(ex/50);j.doneKm+=ex;j.totalKm+=ex;return{title:'🚧 前方修路',body:`国道施工，绕行约 ${ex} 公里，费时费油。`}}},
 {w:2,cond:j=>j.cur.e.type!=='hw',run(j){addTime(0.5);return{title:'🐷 赶集堵车',body:'路过乡镇正逢赶集，被堵在人流里半小时。'}}},
 {w:1.5,run(j){addTime(0.2);if(chance(0.18)){const f=200;payCost(f,'罚款');S.stats.fines+=f;return{title:'👮 交警检查',body:'例行检查证件齐全，但灯光不合格被罚款 '+money(f)+'。'}}return{title:'👮 交警检查',body:'例行检查，证件齐全，改装合规。放行！'}}},
 {w:2,cond:j=>(S.fatigue||0)>30,run(j){return{title:'🍜 路边美食城',body:'前方有名闻干线的司机饭店。来一顿？',b:[{t:'吃一顿（¥40）',cls:'pri',fn:()=>{payCost(40,'餐费');addTime(0.6);S.fatigue=clamp(S.fatigue-14,0,100);toast('舒坦！');}},{t:'忍忍赶路',cls:'ghost'}]}}},
 {w:1.5,cond:j=>j.order&&(CARGO.find(c=>c.id===j.order.cg)||{}).frag,run(j){return{title:'📦 货物移位',body:'刚才一段颠簸，好像听到货动了。停下去看看？',b:[{t:'停车检查（20分钟）',cls:'pri',fn:()=>{addTime(0.35);toast('重新固定好货物，安心了');}},{t:'应该没事',cls:'ghost',fn:()=>{j.riskCargo+=0.6;toast('但愿没事……');}}]}}},
 {w:2,cond:j=>(S.fatigue||0)>60,run(j){return{title:'😴 精力不足',body:'眼皮直打架！前面服务区还远，怎么办？',b:[{t:'应急车道眯20分钟',cls:'pri',fn:()=>{addTime(0.4);S.fatigue=clamp(S.fatigue-18,0,100);}},{t:'摇下窗户坚持',cls:'ghost',fn:()=>{S.fatigue=clamp(S.fatigue+4,0,100);toast('千万撑住……');}}]}}},
 {w:1.2,cond:j=>j.cur.e.type==='hw',run(j){addTime(0.6);return{title:'🚗 前方事故',body:'前方三车追尾，排队缓行约半小时。'}}},
 {w:1.5,run(j){const v=irnd(3,8)*100;gain(v,'顺路捎件');return{title:'📮 顺路捎件',body:'物流园托你捎两个急件到目的地，收了 <b>'+money(v)+'</b> 顺路费。'}}},
 {w:1,cond:j=>j.order&&j.order.tons>18&&j.cur.e.type!=='hw',run(j){addTime(0.8);return{title:'⚖️ 桥梁限重',body:'前方桥梁限重 15 吨，重车只能绕行乡道，多花了不少时间。'}}},
 {w:1.5,cond:j=>j.cur.e.type==='hw',run(j){const st=tStat(),price=+(fuelPrice()*0.9).toFixed(2);return{title:'⛽ 优惠加油站',body:'服务区加油站搞活动：¥'+price.toFixed(2)+'/L（9折）。加 200L？',b:[{t:'加 200L（'+money(Math.round(200*price))+'）',cls:'pri',fn:()=>{const c=Math.round(200*price);payCost(c,'加油优惠');S.truck.fuel=Math.min(st.cap,S.truck.fuel+200);toast('加油完毕');}},{t:'不用',cls:'ghost'}]}}},
 {w:1,cond:j=>S.truck.wear>60,run(j){const c=irnd(4,7)*100;payCost(c,'抢修');insClaim(c,'抢修');addTime(0.5);S.truck.wear=clamp(S.truck.wear-12,0,100);return{title:'🔧 半路抛锚小修',body:'老毛病又犯了，路边修理店应急处理，花了 '+money(c)+'。'}}},
];
function afterLegEvents(){
 const j=S.journey;
 if(j.idx>=j.steps.length-1){finishJourney();return}
 const st=tStat();
 // 超载硬开：每段路都可能被查
 if(j.order&&j.order.overload&&chance(0.4)){
  const fine=irnd(4,9)*100;
  j.order.overload=0;
  payCost(fine,'超载查扣罚款');
  S.truck.wear=clamp(S.truck.wear+3,0,100);
  addTime(0.5);
  pauseJ(); S.journey.pauseReason='超载被查';
  AUDIO.sfx('siren');
  askModal({center:true,title:'🚔 超载被查',body:`被查获超载，罚款 <b style="color:#ff5000">${money(fine)}</b>，卸载超载部分后放行，耗时 30 分钟。`,buttons:[{t:'知道了',cls:'pri',fn:()=>nextStep()}]});
  return;
 }
 let p=(j.cur.e.type==='hw'?0.30:0.42)*st.evMul*(j.night?1.15:1);
 if(chance(p)){
  const pool=EVENTS.filter(ev=>!ev.cond||ev.cond(j));
  if(pool.length){
   const ev=weightedPick(pool);
   const cfg=ev.run(j);
   pauseJ();
   S.journey.pauseReason='途中事件';
   askModal({center:true,title:cfg.title,body:cfg.body,buttons:(cfg.b&&cfg.b.length?cfg.b:[{t:'知道了',cls:'pri'}]).map(b=>({t:b.t,cls:b.cls||'pri',fn:()=>{if(b.fn)b.fn();nextStep();}})).concat([])});
   return;
  }
 }
 nextStep();
}
/* 途中取消运单：车辆停在最近途经的城市，赔违约金 */
function lastPassedNode(j){
 const kms=journeyNodeKm(j);
 let node=j.path[0];
 for(let i=0;i<kms.length;i++){ if(kms[i]<=j.doneKm)node=j.path[i]; }
 return node;
}
/* 途中停止行程：车辆停在最近途经的城市 */
function stopJourneyAt(node){
 const j=S.journey;
 if(j&&j.timer)clearInterval(j.timer);
 DRIVE_TIMERS.forEach(t=>clearInterval(t)); DRIVE_TIMERS.clear();
 if(ROAD.raf){cancelAnimationFrame(ROAD.raf);ROAD.raf=0;}
 S._pedal=null;
 S.journey=null;
 document.querySelectorAll('#modals .mwrap').forEach(w=>w.remove());
 modalOpen=false;
 $('#drive').classList.add('hide');
 S.city=node;
 if(S.truck)S.truck.city=node; /* 亲自驾驶：人车同址 */
}
function cancelJourneyTrip(){
 const j=S.journey;
 if(!j){toast('当前没有进行中的行程');return}
 const stopAt=lastPassedNode(j);
 if(!j.order){
  // 空驶取消：无违约金；车上挂着的取货运单保留，可重新规划
  const keepOrder=j.pickup&&(S.accepted||[]).some(o=>o.id===j.pickup);
  stopJourneyAt(stopAt);
  if(keepOrder)toast('空驶已取消，运单保留，车辆停在 '+cityById(stopAt).n+'，可在「我的运单」重新出发');
  else toast('空驶行程已取消，车辆停在 '+cityById(stopAt).n);
  genOrders(); save(); renderAll();
  return;
 }
 askModal({center:true,title:'取消运单？',tag:'违约',
  body:`货运途中取消，将赔偿违约金 <b style="color:#ff5000">¥200</b>，货物就地转运。<br>车辆将停在最近的途经地：<b>${cityById(stopAt).n}</b>。`,
  buttons:[
   {t:'确认取消（赔¥200）',cls:'rd',fn:()=>{
     const order=j.order;
     stopJourneyAt(stopAt);
     payCost(200,'违约赔偿');
     S.accepted=(S.accepted||[]).filter(x=>x!==order);
     toast('运单已取消（违约金 ¥200），车辆停在 '+cityById(stopAt).n);
     genOrders(); save(); renderAll();
   }},
   {t:'继续送货',cls:'pri'}]});
}
function finishJourney(){
 const j=S.journey;
 if(j&&j.timer)clearInterval(j.timer);
 DRIVE_TIMERS.forEach(t=>clearInterval(t)); DRIVE_TIMERS.clear();
 if(ROAD.raf){cancelAnimationFrame(ROAD.raf);ROAD.raf=0;}
 S._pedal=null;
 const order=j?j.order:null, dest=j?j.dest:S.city, risk=j?j.riskCargo:0;
 const origin=j?j.path[0]:S.city;
 S.journey=null;
 $('#drive').classList.add('hide');
 S.city=dest; S.status='idle';
 if(S.truck)S.truck.city=dest; /* 人车同址 */
 AUDIO.sfx('arrive'); AUDIO.autoTheme();
 if(order){
  try{
  // 记录本程是否全程高速（限高速要求用）
  const hwOk=pathEdges(j.path).every(e=>e.type==='hw');
  order._hwOk=order._hwOk===undefined?hwOk:order._hwOk&&hwOk;
  order.risk=(order.risk||0)+risk;
  if(order.req==='call'){addTime(0.3);toast('📞 应货主要求电话回执，多花了 20 分钟');}
  if(order.chain&&!order.chain.leg1Done){
   // 连锁单第一程到达：捎卸后自动接力第二程
   order.chain.leg1Done=true;
   addTime(0.4);
   S.status='load';
   toast(`📦 第一程已到 ${cityById(dest).n}，部分货物捎卸，继续前往 ${cityById(order.to).n}`);
   openRouteModal(order);
  }else{
   // 卸货排队：货场类型决定时长，超 1 小时开始有压车费补贴（自有仓库城市减半）
   const dqH=unloadQueueH(order);
   if(dqH>0.05){
    addTime(dqH);
    if(dqH>1){order.detainFee=Math.round((dqH-1)*150/10)*10;order.detainH=dqH;}
    toast('卸货排队 '+tspan(dqH)+(order.detainFee?'，压车费 +'+money(order.detainFee):''));
   }
   settleOrder(order,S.truck);
   if(chance(0.65))spawnReturnOrder(origin);
  }
  }catch(err){
   /* 结算流程被异常打断时兜底直结，绝不把运单卡在“亲自驾驶中” */
   console.error('到站结算异常',err);
   try{settleOrder(order,S.truck);}catch(e2){}
   toast('运单已结算（到站流程异常已自动恢复）');
  }
 }
 else{
  // 空驶到达：若车上挂着待取货的运单则自动装货并进入送货路线规划
  const po=j&&j.pickup?(S.accepted||[]).find(o=>o.id===j.pickup):null;
  const awaitPickup=po&&po.state!=='running'&&po.truckId===j.truckId&&orderOrigin(po)===S.city&&!po.loaded;
  toast(awaitPickup?('已到达 '+cityById(S.city).n+'，自动装货中…'):('已到达 '+cityById(S.city).n));
  genOrders();
  if(awaitPickup){
   S.status='load';
   beginLoading(po,()=>openRouteModal(po));
  }else if(chance(0.65)){
   spawnReturnOrder(origin);
  }
 }
 save();renderAll();
}
/* 回头货：送完一单后，在当前城市刷出回程货源，省去空驶 */
function spawnReturnOrder(originId){
 if(!S||S.journey)return;
 if(!originId||originId===S.city)return;
 const toId=chance(0.7)?originId:pick(nearCities(S.city));
 if(!toId||toId===S.city)return;
 const st=tStat();
 const elig=CARGO.filter(c=>c.lv<=S.level&&(!c.permit||S.hazPermit)&&c.tons[0]<=st.load);
 if(!elig.length)return;
 if(S.orders.length>=5)S.orders.shift();
 const cg=pick(elig), sh=pickShipper();
 const tons=Math.min(st.load, irnd(cg.tons[0], Math.max(cg.tons[0],cg.tons[1])));
 const dist=routeDist(S.city,toId);
 let price=(320+dist*tons*(4.5+0.45*cg.mult))*S.market*1.1*Math.pow(180/Math.max(120,dist),0.08); /* 回程补贴 +10%，运价同步上调 */
 const estH=estHours(S.city,toId,tons);
 const hours=Math.max(2,Math.round(estH*2.2+5));
 price=Math.round(price/10)*10;
 S.orders.push({
  id:S.oseq++, cg:cg.id, tons, to:toId, from:S.city, away:0, price,
  urgent:false, perish:!!cg.perish, retur:1, bargain:0, req:'', lux:0, riskFlag:0, wTag:'',
  ship:{n:sh.n, r:sh.r, co:sh.co},
  pstation:pick(STATION_TYPES), dstation:pick(STATION_TYPES),
  deadline:S.T+hours, hours, note:pick(NOTES), expire:S.T+rnd(3,5.5),
 });
 toast('📦 发现回头货源：'+cityById(S.city).n+' → '+cityById(toId).n+'（平台回程补贴 +10%）');
}

/* ================= 支付辅助 ================= */
function payCost(v,label){
 v=Math.round(v);
 if(S.cash>=v){ S.cash-=v; addLedger(label,-v); renderCash(); AUDIO.sfx('pay'); return v; }
 const need=v-S.cash;
 const borrow=Math.ceil(need*1.1/100)*100;
 S.debt+=borrow; addLedger('高息借款',borrow);
 toast('余额不足，被迫高息借款 '+money(borrow));
 AUDIO.sfx('warn');
 S.cash=0; addLedger(label,-v);
 renderCash();
 checkEndings();
 return v;
}
function gain(v,label){ v=Math.round(v); if(v>0){S.cash+=v; addLedger(label,v); renderCash(); checkEndings(); AUDIO.sfx('coin');} }
/* 余额实时刷新：任何路径改动现金后 0.4 秒内同步到顶栏 */
let _lastCashTxt='';
function renderCash(){
 if(!S)return;
 const txt=money(S.cash);
 if(txt!==_lastCashTxt){_lastCashTxt=txt;const el=document.getElementById('tCash');if(el)el.textContent=txt;}
}

/* ================= 结算 ================= */
function settleOrder(o,truck){
 truck=truck||S.truck;
 const cg=CARGO.find(c=>c.id===o.cg);
 // 风险单：货主可能在结算时挑刺克扣或拖延
 if(o.riskFlag&&chance(0.3)){
  if(chance(0.5))o._dock=Math.round(o.price*0.10);
  else{o._delay=1;addTime(1);toast('货主结账扯皮，多等了 1 小时…');}
 }
 const used=S.T-o.startT;
 const onTime=S.T<=o.deadline;
 let lines=[];
 let amt=o.price;
 lines.push([o.bargain?'运费（议后价）':'运费（一口价）',o.price]);
 if(S.flags.subLeft>0){const sub=Math.round(o.price*0.15);lines.push(['平台补贴 +15%',sub]);amt+=sub;S.flags.subLeft--;}
 const early=o.deadline-S.T>o.hours*0.3;
 if(onTime&&early){const b=Math.round(o.price*0.08);lines.push(['提前送达奖励',b]);amt+=b;}
 if(!onTime){
  const lateH=o.deadline-S.T<0?Math.ceil((S.T-o.deadline)):0;
  const pen=Math.min(0.3,lateH*0.08);
  const p=Math.round(o.price*pen);
  if(p>0){lines.push(['超时扣款',-p]);amt-=p;}
  S.stats.lateCnt++;
 }
 if(o.req==='hw'&&o._hwOk===false){
  const p=Math.round(o.price*0.10);
  lines.push(['未按要求全程高速，货主扣款',-p]);amt-=p;
 }
 if(o.req==='night'){
  const h=S.T%24;
  if(!(h>=22||h<5)){
   const p=Math.round(o.price*0.10);
   lines.push(['未在夜间时段送达，货主扣款',-p]);amt-=p;
  }
 }
 if(o._dock){lines.push(['低星货主挑刺克扣',-o._dock]);amt-=o._dock;}
 if(o.detainFee){lines.push(['压车费补贴（排队'+tspan(o.detainH)+'）',o.detainFee]);amt+=o.detainFee;}
 let dmg=0;
 /* 稳妥型司机：谨慎驾驶，货损风险按特长降低 */
 const risk=((cg.frag?0.03:0.01)+(truck.wear>60?0.05:0)+(o.risk||0)*0.05+(S.speedMode==='fast'?0.02:0))*(o.steadyK||1);
 if(chance(risk)){
  dmg=Math.round(o.price*(cg.frag===2?0.22:0.1));
  lines.push(['货损赔偿',-dmg]);amt-=dmg;
  if(S.insured){const re=Math.round(dmg*0.7);lines.push(['保险理赔（货损70%）',re]);amt+=re;}
 }
 // 实体投资：自有仓库城市直送，结算价 +10%
 ensureBiz();
 if(S.biz.wh[o.to]){
  const wb=Math.round(o.price*0.10);
  lines.push(['自有仓库直送加价 +10%',wb]);amt+=wb;
 }
 const fee=Math.round(o.price*platFee()/100);
 lines.push([`平台服务费（${platFee()}%）`,-fee]);amt-=fee;
 // 支持页激励广告：双倍收入生效中且应收为正时，运费翻倍
 if(adsBoostLeftH()>0&&amt>0){
  lines.push(['⚡ 支持者双倍收入',amt]);
  amt*=2;
 }
 // 熟客档案：合作次数+1，信赖升级时提示
 const sh=S.shippers&&S.shippers[o.ship.co];
 if(sh){
  const t0=trustLevel(sh);
  sh.trips++;
  const t1=trustLevel(sh);
  if(t1>t0)toast(`🤝 与「${sh.co}」合作升为${TRUST_NAMES[t1]}，后续运价上浮`);
 }
 S.stats.trips++;S.stats.earned+=Math.max(0,amt);S.deliv++;
 // 上市公司联动：运单结算计入当日营收（收盘推股价）；超时/货损算负面
 if(S.ipo&&S.ipo.listed){
  S.ipo.todayEarned+=Math.max(0,amt);
  if(dmg||!onTime)S.ipo.todayBad++;
 }
 const wasLv=S.level;
 S.xp+=Math.round(o.price/800)+(onTime?4:0)+(o.lux?6:0);
 while(S.level<LEVELS.length&&S.xp>=LEVELS[S.level])S.level++;
 S.rating=clamp(S.rating+(onTime&&!dmg?0.01:-0.15)-(dmg?0.12:0),3,5);
 if(onTime&&!dmg)S.goodReviews++;
 const body=lines.map(l=>`<div class="setl"><span>${l[0]}</span><span class="${l[1]>=0?'plus':'minus'}">${l[1]>=0?'+':''}${money(l[1])}</span></div>`).join('');
 let verdict=onTime?(early?'⭐ 提前送达，货主非常满意！':'✅ 按时送达，好评收下'):'😔 超时送达，货主不太满意…';
 if(dmg)verdict+='<br>💔 有货物破损，被投诉了';
 if(o.lux&&onTime&&!dmg)verdict='💎 豪华单完美交付，货主非常满意！';
 // 结算方式：秒结打九折，或等回单 2 天后全额到账
 let btns;
 if(amt>=0){
  const instant=Math.round(amt*0.9);
  btns=[
   {t:`平台秒结 90% · ${money(instant)}`,cls:'pri',fn:()=>{gain(instant,'运费秒结');toast('运费已实时到账 '+money(instant));}},
   {t:`等回单 · 2天后 ${money(amt)}`,cls:'ghost',fn:()=>{(S.pending=S.pending||[]).push({amt:amt,dueT:S.T+48,co:o.ship.co});toast('回单已寄出，运费 2 天后到账');}}
  ];
 }else btns=[{t:'确认亏损 '+money(amt),cls:'rd',fn:()=>{payCost(-amt,'运单亏损');}}];
 const w=askModal({center:true,title:'📋 运单结算',tag:`${cg.i} ${cg.n} ${o.tons}吨 · ${cityById(o.to).n}`,
  body:`${verdict}<div style="margin-top:9px">${body}</div><div class="setl total"><span>应收合计</span><span class="plus">${money(Math.max(0,amt))}</span></div>`,
  buttons:btns});
 AUDIO.sfx('settle',0.5);
 S.accepted=(S.accepted||[]).filter(x=>x!==o);
 delete o.state; delete o.manual; delete o.auto; delete o.job;
 if(S.level>wasLv)setTimeout(()=>{AUDIO.sfx('level');toast(`🎉 升级！Lv.${S.level} 解锁更高级货源`);nav(`恭喜司机升级到${S.level}级，解锁更多优质货源。`)},600);
 checkAch();checkEndings();genOrders();save();renderAll();
}

/* ================= 停留服务 ================= */
function openRest(){
 if(S.journey){toast('行车途中请在服务区休息');return}
 const opts=[
  {t:'😴 车里眯一会 · 1小时',cls:'ghost',fn:()=>{AUDIO.sfx('rest');addTime(1);S.fatigue=clamp(S.fatigue-25,0,100);toast('睡了会儿，缓过来了');renderTop();save();}},
  {t:'🛏️ 钟点房 · 3小时 ¥60',cls:'ghost',fn:()=>{AUDIO.sfx('rest');payCost(60,'住宿');addTime(3);S.fatigue=clamp(S.fatigue-60,0,100);toast('睡了个好觉');renderTop();save();}},
  {t:'🏨 旅馆睡到天亮 ¥120',cls:'pri',fn:()=>{AUDIO.sfx('rest');payCost(120,'住宿');const target=(Math.floor(S.T/24)+1)*24+7;addTime(Math.max(1,target-S.T));S.fatigue=0;toast('一觉睡到天亮，精神饱满！');renderTop();save();}},
  {t:'返回',cls:'ghost',fn:()=>{}},
 ];
 askModal({center:true,title:'休息一下',tag:cityById(S.city).n,body:`当前精力 <b>${100-Math.round(S.fatigue)}%</b>。精力不足会大幅增加事故与强制停车风险。`,buttons:opts});
}
function insClaim(cost,label){
 if(!S.insured)return 0;
 const v=Math.round(cost*0.7);
 if(v>0){S.cash+=v;addLedger('保险理赔',v);toast('🛡️ 保险理赔 '+money(v)+(label?'（'+label+'）':''));}
 return v;
}
function openRefuel(){
 const gt=garageTruck(), st=tStatFor(gt);
 const price=fuelPrice(gt.city); /* 按车辆所在城市油价（外地车当地代办），入股加油站城市 8 折 */
 const need=st.cap-gt.fuel;
 if(need<5){toast('油箱几乎是满的');return}
 const disc=S.biz&&S.biz.fuel&&S.biz.fuel[gt.city];
 askModal({center:true,title:'⛽ 加油站',tag:cityById(gt.city).n+' · 今日油价 ¥'+price.toFixed(2)+'/L'+(disc?'（股东价 8 折）':''),
  body:`${truckDef(gt).n} 当前油量 ${Math.round(gt.fuel)}/${st.cap}L<br><span class="muted">${gt.city!==S.city?'车辆在外地，由当地司机代办加油，':' '}${disc?'你在本城入股了加油站，加油享股东价 8 折。':'油价按'+cityById(gt.city).n+'指数 ×'+cityById(gt.city).bias+' 计。'}</span>`,
  buttons:[
   {t:'加满 '+money(Math.round(need*price)),cls:'pri',fn:()=>{payCost(Math.round(need*price),'加油');gt.fuel=st.cap;AUDIO.sfx('refuel');toast('已加满');renderAll();}},
   {t:'+100L '+money(Math.round(100*price)),cls:'ghost',fn:()=>{payCost(Math.round(100*price),'加油');gt.fuel=Math.min(st.cap,gt.fuel+100);AUDIO.sfx('refuel');renderAll();}},
   {t:'+200L '+money(Math.round(200*price)),cls:'ghost',fn:()=>{payCost(Math.round(200*price),'加油');gt.fuel=Math.min(st.cap,gt.fuel+200);AUDIO.sfx('refuel');renderAll();}},
   {t:'返回',cls:'ghost',fn:()=>{}}]});
}
function openRepair(){
 const gt=garageTruck();
 const w=gt.wear;
 if(w<2){toast('车况良好，无需维修');return}
 const perPct=10;
 const costTo=v=>Math.round((w-(100-v))*perPct); /* v为目标车况；收费=实际修复的点数 */
 const to80=w>20?costTo(80):0, to100=costTo(100);
 askModal({center:true,title:'🔧 维修保养',tag:truckDef(gt).n+' · 损耗 '+Math.round(w)+'%'+(gt.city!==S.city?' · 当地修理铺代修':''),
  body:`按损耗比例收费（每1%约¥10）。${gt.city!==S.city?'<span class="muted"><br>车辆在外地，由当地修理铺代办，修完直接上路。</span>':''}<span class="muted"><br>车况低于40%时爆胎、故障风险大增；低于15%随时抛锚。</span>`,
  buttons:[
   to80>0?{t:'快修到80% '+money(to80),cls:'ghost',fn:()=>{payCost(to80,'维修');gt.wear=20;AUDIO.sfx('repair');toast('修好了大半');renderAll();}}:null,
   {t:'大修到100% '+money(to100),cls:'pri',fn:()=>{payCost(to100,'大修');gt.wear=0;AUDIO.sfx('repair');toast('焕然一新！');renderAll();}},
   {t:'返回',cls:'ghost',fn:()=>{}}].filter(Boolean)});
}
/* 一键补满车队油量：车队所有车加满，按各车所在城市油价计费 */
function openFleetRefuelAll(){
 const list=S.fleet.filter(t=>tStatFor(t).cap-t.fuel>=1);
 if(!list.length){toast('车队油量都是满的');return}
 const costOf=t=>Math.round((tStatFor(t).cap-t.fuel)*fuelPrice(t.city));
 const total=list.reduce((s,t)=>s+costOf(t),0);
 askModal({center:true,title:'⛽ 一键补满油量',tag:S.fleet.length+' 台车 · 合计 '+money(total),
  body:list.map(t=>{const st=tStatFor(t);return `<div style="display:flex;justify-content:space-between;font-size:11.5px;line-height:1.9"><span>${truckIcon(t.model)} ${truckDef(t).n} ${Math.round(t.fuel)}→${st.cap}L</span><b>${money(costOf(t))}</b></div>`}).join('')+
   `<div style="font-size:10.5px;color:#888;margin-top:4px">所有车辆立即加满，按各车所在城市油价计费。</div>`,
  buttons:[
   {t:'一键加满 '+money(total),cls:'pri',fn:()=>{list.forEach(t=>{payCost(costOf(t),'车队加油');t.fuel=tStatFor(t).cap});AUDIO.sfx('refuel');toast('⛽ 已为 '+list.length+' 台车加满油');renderAll();save();}},
   {t:'返回',cls:'ghost',fn:()=>{}}]});
}
/* 一键保养车队：车队所有车大修到100%，按损耗比例收费（每1%约¥10） */
function openFleetRepairAll(){
 const list=S.fleet.filter(t=>t.wear>=2);
 if(!list.length){toast('车队车况都很好，无需保养');return}
 const costOf=t=>Math.round(t.wear*10);
 const total=list.reduce((s,t)=>s+costOf(t),0);
 askModal({center:true,title:'🔧 一键保养到100%',tag:S.fleet.length+' 台车 · 合计 '+money(total),
  body:list.map(t=>`<div style="display:flex;justify-content:space-between;font-size:11.5px;line-height:1.9"><span>${truckIcon(t.model)} ${truckDef(t).n} 车况 ${100-Math.round(t.wear)}%→100%</span><b>${money(costOf(t))}</b></div>`).join('')+
   `<div style="font-size:10.5px;color:#888;margin-top:4px">按损耗比例收费（每1%约¥10），车况100%后爆胎与故障风险最低。</div>`,
  buttons:[
   {t:'一键保养 '+money(total),cls:'pri',fn:()=>{list.forEach(t=>{payCost(costOf(t),'车队保养');t.wear=0});AUDIO.sfx('repair');toast('🔧 已保养 '+list.length+' 台车，全部恢复100%');renderAll();save();}},
   {t:'返回',cls:'ghost',fn:()=>{}}]});
}
function doUpgrade(k){
 const gt=garageTruck();
 if(gt.city!==S.city){toast('车在'+cityById(gt.city).n+'，先调回身边再改装');return}
 if(truckBusy(gt.id)){toast('任务中的车不能改装');return}
 const P=PARTS[k],cur=gt.parts[k],t1=partTier(k,cur+1);
 if(S.cash<t1.cost){toast('余额不足');return}
 payCost(t1.cost,'改装·'+P.n);
 gt.parts[k]=cur+1;
 AUDIO.sfx('upgrade');
 if(k==='tank')gt.fuel=Math.min(gt.fuel,tStatFor(gt).cap);
 toast(`已升级 ${P.n}：${t1.n}`);
 checkAch();save();renderAll();
}
function doBuyTruck(i){
 const t=TRUCKS[i];
 if(!t.price){toast('起步旧车是继承的非卖品');return}
 if(S.fleet.length>=fleetCap()){toast('🚛 车队已达上限 '+fleetCap()+' 台：可卖掉一些车，或看广告提升上限');return}
 if(S.cash<t.price){toast('余额不足，先攒攒钱');return}
 const owned=S.fleet.filter(x=>x.model===i).length;
 askModal({center:true,title:'购买新车',tag:t.n,
  body:`新车价 <b style="color:#ff5000">${money(t.price)}</b><br>${t.d}<br>油箱 ${t.tank}L · 原厂载重 ${t.boxMax}t${owned?`<br><span class="muted">已有 ${owned} 台同款，可重复购买扩充车队</span>`:''}<br><span class="muted">新车送到你所在城市（附部分燃油），买后即接单派送。</span>`,
  buttons:[{t:'确认购买',cls:'pri',fn:()=>{
   payCost(t.price,'购车');
   const nt={id:S.nextTruckId++, model:i, fuel:Math.round(t.tank*0.35), wear:0, odo:0, parts:{engine:0,tank:0,tire:0,box:0,cabin:0,nav:0}, city:S.city};
   S.fleet.push(nt);
   S.garageSel=nt.id;
   toast(`🎉 喜提 ${t.n}！已送达${cityById(S.city).n}`);
   AUDIO.sfx('upgrade');checkAch();save();renderAll();}},{t:'再想想',cls:'ghost'}]});
}
function doPermit(){
 if(S.level<3){toast('需要 Lv.3 才能考取');return}
 if(S.hazPermit)return;
 if(S.cash<2000){toast('余额不足');return}
 payCost(2000,'考取危化证');S.hazPermit=true;
 toast('🎉 危险品运输证到手！车队全员可运危化品');checkAch();save();renderAll();
}
function doRepay(v){
 let amt=v==='all'?Math.min(S.debt,S.cash):Math.min(v,S.cash,S.debt);
 amt=Math.floor(amt);
 if(amt<=0){toast('没有可还的金额');return}
 S.cash-=amt;S.debt-=amt;S.stats.repaid+=amt;
 addLedger('还贷',-amt);
 toast(`还款 ${money(amt)}，剩余债务 ${money(S.debt)}`,'money');
 checkAch();checkEndings();save();renderAll();
}
/* 自定义还款：输入金额，最高还到现金与债务的较小值 */
function openRepayCustom(){
 const max=Math.min(S.cash,S.debt);
 if(S.debt<=0){toast('没有债务需要还');return}
 if(max<=0){toast('现金不足，无法还款');return}
 amountModal({title:'💵 自定义还款',tag:'债务 '+money(S.debt)+' · 现金 '+money(S.cash),inputId:'repayAmt',max:max,
  chips:[[100000,'10 万'],[1000000,'100 万'],[10000000,'1000 万'],[max,'全部还清']],
  body:`输入要还的金额，当前最多可还 ${money(max)}。`,
  okLabel:'确认还款',onOk:v=>doRepay(v)});
}
/* ================= 时间 / 新闻 / 订单生成 ================= */
function addTime(h){
 S.T+=h;
 while(Math.floor(S.T/24)+1>S.lastDayCharged)dailyCharge(S.lastDayCharged+1);
}
function dailyCharge(d){
 const prevFuel=S.fuelBase;
 S.lastDayCharged=d;
 // 节日运价事件：18% 概率，当天相关货物运价暴涨
 S.festival=null;
 if(chance(0.18))S.festival=pick(FESTIVALS);
 const interest=Math.ceil(S.debt*0.0003);
 const cost=interest+S.lifeCost;
 S.debt+=cost;
 addLedger('第'+d+'天 利息+生活费',-cost);
 genNews();
 S.weather=pick([0,0,0,1,1,1,2,2,3,4]);
 S.market=+(0.94+Math.random()*0.18).toFixed(2);
 S.fuelBase=+clamp(3.7+rnd(-0.3,0.4),3.2,4.4).toFixed(2);
 // 柴油期货结算：对比昨日定价
 if(S.fut&&S.fut.length){
  let winV=0,loseN=0,pushV=0;
  S.fut.forEach(b=>{
   if(S.fuelBase===prevFuel){pushV+=b.stake;}
   else if((S.fuelBase>prevFuel)===(b.dir==='up')){winV+=Math.round(b.stake*1.9);}
   else loseN++;
  });
  if(winV){gain(winV,'柴油期货盈利');toast('📈 柴油期货押中！到账 '+money(winV));}
  if(loseN)toast('📉 柴油期货押错，'+loseN+' 张合约本金归零');
  if(pushV){S.cash+=pushV;addLedger('期货平局退款',pushV);toast('油价持平，期货退款 '+money(pushV));}
  S.fut=[];
 }
 // 车辆保险每日保费（现金不足自动失效）
 if(S.insured){
  const prem=Math.round(Math.max(truckDef().price,20000)*0.005);
  if(S.cash>=prem){S.cash-=prem;addLedger('车辆保险',-prem);}
  else{S.insured=false;toast('现金不足缴保费，车辆保险已失效');}
 }
 // 司机日薪：发得出涨忠诚；发不出记欠薪掉忠诚，长期欠薪/忠诚见底会跳槽
 chargeDrivers();
 // 实体投资每日营业额（仓库/档口）
 ensureBiz();
 const bizIn=bizDailyIncome();
 if(bizIn>0){S.cash+=bizIn;addLedger('实体产业营业额',bizIn);}
 // 公司上市：辅导期满挂牌；已上市的做每日收盘结算（股价随经营涨跌）
 ensureIpo();
 if(ipoCheckListing())toast('🎉 恭喜！公司正式成为上市公司');
 else ipoDailyClose();
 // 活期存款利息（每日 0.05%）
 ensureFinance();
 if(S.finance.deposit>0){
  const di=Math.round(S.finance.deposit*DEMAND_RATE);
  if(di>0){S.finance.deposit+=di;addLedger('存款利息',di);}
 }
 // 新的一天：股票开盘价重置
 STOCKS.forEach(s=>{S.market2[s.id].open=S.market2[s.id].price;});
 FUNDS.forEach(f=>{S.market2[f.id].open=S.market2[f.id].price;});
 toast(`第 ${d} 天开始 · 今日利息+生活费 ${money(cost)}`);
 if(S.debt>=120000000)setTimeout(()=>toast('⚠️ 银行催收电话：请尽快偿还贷款！'),1200);
 if(S.debt>=150000000)setTimeout(gameOver,2000);
}
/* ================= 节日运价事件 ================= */
const FESTIVALS=[
 {n:'电商大促', cargo:'kd',  mul:1.5},
 {n:'年货节',   cargo:'js2', mul:1.5},
 {n:'春耕农忙', cargo:'hf',  mul:1.4},
 {n:'花卉博览会', cargo:'xh', mul:1.5},
 {n:'开渔节',   cargo:'ll',  mul:1.4},
 {n:'海鲜丰收季', cargo:'hx2', mul:1.45},
 {n:'楼市交付潮', cargo:'jc',  mul:1.35},
 {n:'服装上新季', cargo:'fz',  mul:1.4},
 {n:'汽配展会', cargo:'qp',  mul:1.4},
];
function genNews(){
 // 股市新闻联动：40% 概率某只股票有利好/利空，当日缓涨缓跌兑现
 S.stockNews=null;
 let stockTxt='';
 if(chance(0.4)){
  const s=pick(STOCKS);
  const good=chance(0.6);
  const chg=(good?1:-1)*(0.15+Math.random()*0.15);
  const goodT=['发现新矿脉，产能大增','斩获全省物流大单','新品发布大火','获得巨额融资'];
  const badT=['环保整改停产半年','高管集体离职','主力产品遇冷','陷入合同纠纷'];
  const txt=pick(good?goodT:badT);
  S.stockNews={id:s.id,dailyChg:chg,text:s.n+txt}; // 当日累计涨跌幅，由行情每小时兑现 1/24
  stockTxt='【'+s.n+txt+'，股价'+(good?'大涨':'大跌')+'】';
 }
 let festTxt='';
 if(S.festival){festTxt='【今日'+S.festival.n+'，'+(CARGO.find(c=>c.id===S.festival.cargo)||{n:'相关货物'}).n+'运价暴涨】';}
 // 自家上市公司新闻：15% 概率利好/利空，当日股价缓涨缓跌
 let myTxt='';
 ensureIpo();
 if(S.ipo.listed&&chance(0.15)){
  const good=chance(0.6);
  const gT=['新干线物流专线开通','斩获省级冷链大单','入选省重点物流企业','智能调度系统上线','新一批新能源卡车交付'];
  const bT=['主力车辆被召回检修','核心司机团队出走传闻','货主投诉激增被约谈','分仓库失火损失惨重'];
  const txt=pick(good?gT:bT);
  S.ipo.newsChg=(good?1:-1)*(0.1+Math.random()*0.1);
  myTxt='【'+S.ipo.name+txt+'，股价'+(good?'大涨':'大跌')+'】';
 }else if(S.ipo){S.ipo.newsChg=0;}
 const flavor=pick(['高速车流平稳','雁回段或有施工，注意绕行','货运旺季持续，运价坚挺','望川市场货源增多','矿石外运需求旺盛','雨雾天气多发，谨慎驾驶','新收费政策落地，ETC更划算']);
 let runawayTxt='';
 if(S.runaway){runawayTxt='【'+S.runaway+'】';S.runaway=null;}
 S.news=myTxt+festTxt+stockTxt+runawayTxt+`柴油约¥${S.fuelBase.toFixed(1)}/L · 运价指数 ${S.market.toFixed(2)} · ${WX[S.weather].n} · ${flavor}`;
}
function genOrders(mul){
 if(!S)return;
 const anchor=boardAnchor();
 const nearIds=nearCities(anchor);
 S.orders=S.orders.filter(o=>o.from===anchor||nearIds.includes(o.from));
 let guard=0;
 const boardCap=4+bizBoardExtra(); /* 物流园档口城市为接单锚点时，板上多挂 1 单 */
 while(S.orders.length<boardCap&&guard++<8){
  const o=genOrder(nearIds,anchor);
  if(o){if(mul&&mul!==1){o.price=Math.round(o.price*mul);o.adBoard=1;}S.orders.push(o);}
 }
}

/* ================= 报价大厅：货主发需求，司机出价竞标 ================= */
function hallDemands(){
 S.hall=S.hall||[];
 S.hall=S.hall.filter(d=>d.hallExpire>S.T);
 if(S.journey)return;
 const anchor=boardAnchor();
 const nearIds=nearCities(anchor);
 S.hall=S.hall.filter(d=>d.from===anchor||nearIds.includes(d.from));
 let guard=0;
 while(S.hall.length<3&&guard++<6){
  const d=genOrder(nearIds,anchor);
  if(d){d.expect=d.price;d.hall=1;d.hallExpire=S.T+rnd(1.5,3);S.hall.push(d);}
 }
}
function openBidHall(){
 if(!S)return;
 if(S.journey){toast('行程进行中，送达后再来看行情');return}
 hallDemands();
 if(!S.hall.length){toast('大厅暂时没有合适的求购信息，稍后再来看看');return}
 const rows=S.hall.map(d=>{
  const cg=CARGO.find(c=>c.id===d.cg);
  const dist=routeDist(d.from,d.to);
  const lq=QUEUE_LOAD[d.pstation]||[0.4,1.1];
  return `<div class="hallrow">
   <div class="oname">${d.ship.n} <span class="ostar">★${d.ship.r}</span><span class="otag">${d.ship.co}</span>${d.urgent?'<span class="otag hot">加急</span>':''}${d.perish?'<span class="otag hot">时效</span>':''}${d.chain?'<span class="otag sub">连送</span>':''}</div>
   <div class="osub">${d.tons}吨 · ${cg.n} ${cg.i} · ${cityById(d.from).n} → ${cityById(d.to).n} · 约${dist}公里 · 限时${tspan(d.hours)}</div>
   <div class="osub">货主期望价 <b style="color:#ff5000">${money(d.expect)}</b> · 装货排队约${lq[0]}~${lq[1]}小时</div>
   <div class="obtns"><button class="btn pri" data-act="hallBid" data-id="${d.id}">出价竞标</button></div>
  </div>`;
 }).join('');
 askModal({center:true,title:'🗣️ 报价大厅',tag:cityById(boardAnchor()).n,
  body:`<span class="muted">货主发需求、司机出价：出价不低于货主底线即成交。好评评分越高、熟客越多，越能压低底线。</span><div style="margin-top:8px">${rows}</div>`,
  buttons:[{t:'关闭',cls:'ghost'}]});
}
function openHallBid(id){
 const d=(S.hall||[]).find(x=>x.id===id); if(!d){toast('该求购已结束');return}
 if(S.journey){toast('行程进行中，无法竞标');return}
 const cg=CARGO.find(c=>c.id===d.cg);
 const sh=S.shippers&&S.shippers[d.ship.co];
 const chips=[[0.85,'低价抢85%'],[1.0,'按期望'],[1.15,'加价15%'],[1.3,'高价130%']].map(c=>[Math.round(d.expect*c[0]/10)*10,c[1]]);
 amountModal({title:'💰 出价竞标',tag:`${cg.n} ${d.tons}吨 → ${cityById(d.to).n}`,inputId:'bidAmt',max:Math.round(d.expect*2/10)*10,
  chips:chips,placeholder:'手动输入出价金额',
  body:`货主期望价 <b style="color:#ff5000">${money(d.expect)}</b> · 限时 ${tspan(d.hours)}<br>你的好评评分 ★${S.rating.toFixed(2)}${sh?(' · 与该货主合作 '+sh.trips+' 次'):''}<br><span class="muted">出价低于货主底线会被其他司机抢走；评分和熟客记录能压低他们的底线。</span>`,
  unitName:'出价金额',okLabel:'确认出价',onOk:v=>resolveBid(d,v)});
}
function resolveBid(d,bid){
 if(S.journey){toast('行程进行中，无法竞标');return}
 S.hall=(S.hall||[]).filter(x=>x.id!==d.id);
 const trust=trustLevel(S.shippers&&S.shippers[d.ship.co]);
 const floor=Math.round(d.expect*(0.68+Math.random()*0.30)*(1-trust*0.05)*(1-(S.rating-4.5)*0.15)/10)*10;
 if(bid>=floor){
  d.price=bid;d.hall=0;d.bid=1;d.expire=S.T+rnd(2.5,4);
  if(S.orders.length>=5)S.orders.shift();
  S.orders.push(d);
  askModal({center:true,title:'🎉 竞标成功！',tag:'报价大厅',
   body:`以 <b style="color:#0a8f60">${money(bid)}</b> 中标：${CARGO.find(c=>c.id===d.cg).n} ${d.tons}吨 · ${cityById(d.from).n} → ${cityById(d.to).n}<br>订单已放进接单列表，记得留意限时。`,
   buttons:[{t:'好',cls:'pri'}]});
 }else{
  askModal({center:true,title:'竞标失败',tag:'报价大厅',
   body:`出价 ${money(bid)} 低于货主底线，这单被别的司机抢走了。<br><span class="muted">提高评分、多攒熟客，或者出价更爽快点。</span>`,
   buttons:[{t:'知道了',cls:'ghost'}]});
 }
 save();renderAll();
}

/* ================= 结局 ================= */
function checkEndings(){
 if(S.debt<=0&&!S.flags.win){
  S.flags.win=1; // 基本目标达成标记：之后无上限自由经营
  save();
  askModal({center:true,title:'🕊️ 无债一身轻！',tag:'基本目标达成',
   body:`经营第 <b>${tday(S.T)}</b> 天，1 亿债务全部还清！<br><br>
   <div style="background:rgba(0,0,0,.05);border-radius:10px;padding:10px 12px;font-size:12px;line-height:2;text-align:left">完成订单：${S.stats.trips} 单<br>累计里程：${fmt(S.stats.km)} km<br>累计运费：${money(S.stats.earned)}<br>累计还款：${money(S.stats.repaid)}</div>
   <span class="muted" style="display:block;margin-top:8px">这是基本目标，不是终点——游戏没有经营目标也没有上限，从今天起赚的每一分钱都是你自己的，想跑就跑，把生意做到多大都可以。</span>`,
   buttons:[{t:'🎉 继续经营（自由模式）',cls:'pri'}]});
 }
}
function gameOver(){
 if(!S||S.flags.lost)return;
 S.flags.lost=1;save();showEnd(false);
}
function showEnd(win){
 let el=$('#end');
 if(!el){el=document.createElement('div');el.id='end';$('#stage').appendChild(el);}
 el.className=win?'win':'lose';
 el.innerHTML=`<div class="eicon">${win?'🕊️':'🏚️'}</div><h1>${win?'无债一身轻！':'卡车被收走了…'}</h1>
 <div class="estat">经营天数：第 ${tday(S.T)} 天<br>完成订单：${S.stats.trips} 单<br>累计里程：${fmt(S.stats.km)} km<br>累计运费：${money(S.stats.earned)}<br>累计还款：${money(S.stats.repaid)}${win?'<br>银行存款：'+money(S.cash):''}</div>
 <div class="ebtns">${win?'<button data-act="endContinue">继续经营（自由模式）</button>':''}<button data-act="endRestart">重新开始</button></div>`;
}

/* ================= 界面切换 ================= */
function switchTab(t){
 uiTab=t;
 $$('#navbar .nitem').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
 $$('.view').forEach(v=>v.classList.add('hide'));
 $('#view-'+t).classList.remove('hide');
 renderView();
 AUDIO.autoTheme();
}
function renderView(){
 if(!S)return;
 if(uiTab==='orders')renderOrders();
 else if(uiTab==='map')renderMap();
 else if(uiTab==='finance')renderFinance();
 else if(uiTab==='invest')renderInvest();
 else if(uiTab==='garage')renderGarage();
 else if(uiTab==='fun')renderFun();
 else if(uiTab==='depot')renderDepot();
 else if(uiTab==='more')renderMore();
 else if(uiTab==='support')renderSupport();
}
function renderAll(){renderTop();renderView();}

/* ================= 交互分发 ================= */
let lastActT=0;
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]'); if(!el)return;
 const now=Date.now(); if(now-lastActT<300)return; lastActT=now;
 const a=el.dataset.act;
 if(a!=='dhorn'&&a!=='toggleSfx')AUDIO.sfx('click');
 try{
 switch(a){
  case 'tab': switchTab(el.dataset.tab); break;
  case 'watchSupportAd': watchSupportAd('boost'); break;
  case 'watchSpeedAd': watchSupportAd('speed'); break;
  case 'fleetCapAd': watchSupportAd('fleetCap'); break;
  case 'driverCapAd': watchSupportAd('driverCap'); break;
  case 'watchTruckAd': watchSupportAd('truck'); break;
  case 'watchFreeAd': watchSupportAd('free'); break;
  case 'orderDetail': openOrderDetail(+el.dataset.id); break;
  case 'bidHall': openBidHall(); break;
  case 'hallBid': openHallBid(+el.dataset.id); break;
  case 'sortBoard': S.sortMode=el.dataset.m; renderOrders(); break;
  case 'refreshBoard': {
   watchSupportAd('board'); /* 看一次激励广告换一板，新订单价格 ×1.5 */
   break;
  }
  case 'acceptOrder': acceptOrder(+el.dataset.id); break;
  case 'assignOrder': {
   const ao=(S.accepted||[]).find(x=>x.id===+el.dataset.id);
   if(ao){ if(ao.state==='running'){toast('这单已在运送中')} else openAssignModal(ao); }
   break;
  }
  case 'driveOrder': {
   const dord=(S.accepted||[]).find(x=>x.id===+el.dataset.id);
   if(dord){ if(dord.state==='running'){toast('这单已在运送中')} else startManualDrive(dord); }
   break;
  }
  case 'autoOrder': {
   const aord=(S.accepted||[]).find(x=>x.id===+el.dataset.id);
   if(aord){ if(aord.state==='running'){toast('这单已在运送中')} else if(!aord.truckId){openAssignModal(aord)} else dispatchAuto(aord); }
   break;
  }
  case 'cancelAccepted': cancelAcceptedOrder(+el.dataset.id); break;
  case 'garSel': S.garageSel=+el.dataset.id; renderGarage(); break;
  case 'curTruckBtn': setCurTruck(+el.dataset.id); break;
  case 'moveTruck': openMoveTruck(+el.dataset.id); break;
  case 'sellTruck': doSellTruck(+el.dataset.id); break;
  case 'hireMkt': openHireMarket(); break;
  case 'hireDo': hireDriver(+el.dataset.i); break;
  case 'hireRefresh': hireRefresh(); break;
  case 'drvInfo': openDriverInfo(+el.dataset.id); break;
  case 'drvAssign': openDriverAssign(+el.dataset.id); break;
  case 'drvTreat': drvTreat(+el.dataset.id); break;
  case 'drvFire': fireDriver(+el.dataset.id); break;
  case 'bizOpen': openBizInvest(el.dataset.k); break;
  case 'bizBuy': bizBuy(el.dataset.k, el.dataset.city); break;
  case 'bizSell': bizSell(el.dataset.k, el.dataset.city); break;
  case 'ipoApply': ipoOpenApply(); break;
  case 'ipoSell': ipoSellShares(); break;
  case 'ipoBuy': ipoBuyShares(); break;
  case 'pickroute': pickRouteSel(+el.dataset.i); break;
  case 'rest':
   openRest(); break;
  case 'refuel': openRefuel(); break;
  case 'fleetRefuelAll': openFleetRefuelAll(); break;
  case 'fleetRepairAll': openFleetRepairAll(); break;
  case 'depIn': openDepositIn(); break;
  case 'depOut': openDepositOut(); break;
  case 'fixIn': openFixedIn(); break;
  case 'stockBuy': openStockBuy(el.dataset.id); break;
  case 'stockSell': openStockSell(el.dataset.id); break;
  case 'fundBuy': openFundBuy(el.dataset.id); break;
  case 'fundSell': openFundSell(el.dataset.id); break;
  case 'amtFill': { const inp=document.getElementById(el.dataset.target); if(inp)inp.value=el.dataset.v; break; }
  case 'scratch': openScratch(+el.dataset.id||0); break;
  case 'funTab': funTab=el.dataset.t; renderFun(); break;
  case 'pearlBuy': openPearlBuy(+el.dataset.i); break;
  case 'adClamGet': openAdClamGet(+el.dataset.i); break;
  case 'stoneBuy': openStoneBuy(+el.dataset.i); break;
  case 'adStoneGet': openAdStoneGet(+el.dataset.i); break;
  case 'dpPearl': openDepotPearl(+el.dataset.i); break;
  case 'dpStone': cutDepotStone(+el.dataset.i); break;
  case 'futBet': futBet(el.dataset.dir); break;
  case 'insToggle': {
   ensureFinance();
   if(S.insured){S.insured=false;toast('车辆保险已退保，明日不再扣费');}
   else{
    const prem=Math.round(Math.max(truckDef().price,20000)*0.005);
    if(S.cash<prem){toast('现金不足缴首日保费 '+money(prem));break}
    S.cash-=prem;addLedger('车辆保险',-prem);S.insured=true;
    toast('🛡️ 投保成功，今日保费 '+money(prem));
   }
   renderAll(); break;
  }
  case 'loanOut': openLoan(); break;
  case 'repair': openRepair(); break;
  case 'upgrade': doUpgrade(el.dataset.k); break;
  case 'buyTruck': doBuyTruck(+el.dataset.i); break;
  case 'permit': doPermit(); break;
  case 'repay': doRepay(el.dataset.v==='all'?'all':+el.dataset.v); break;
  case 'repayCustom': openRepayCustom(); break;
  case 'city': selCity=el.dataset.id; renderMap(); break;
  case 'cityClose': selCity=null; renderMap(); break;
  case 'mapzoom': zoomMapAt(el.dataset.d==='in'?0.78:1.28); break;
  case 'maplocate': {
   const j=S.journey, pt=j?journeyPointAt(j,(j.doneKm||0)/(j.totalKm||1)):cityById(S.city);
   MAPV.w=46; MAPV.x=pt.x-23; MAPV.y=pt.y-mapH()/2; applyMapV(); break;
  }
  case 'deadhead':
   if(S.journey){toast('行车中无法再空驶，先完成当前行程');break}
   if(curTruck().city!==S.city){toast('当前车辆不在身边，先到车库「调到这里」或切换车辆');break}
   openRouteModal(null); break;
  case 'cycleTs': cycleTimeScale(); renderView(); break;
  case 'cycleBgmVol': AUDIO.cycleVol(); AUDIO.commit(); renderView(); break;
  case 'toggleSfx': AUDIO.toggleSfx(); AUDIO.commit(); renderView(); AUDIO.sfx('click'); break;
  case 'toggleDark': S.dark=S.dark?0:1; applyDark(); renderView(); save(); AUDIO.sfx('click'); break;

  case 'guide': showGuide(); break;
  case 'resetGame':
   askModal({center:true,title:'删除存档？',body:'当前进度将全部清空（仅本机存档），重新从负债 1 亿开始。',buttons:[{t:'删掉重来',cls:'rd',fn:()=>{deleteSaveAndReload();}},{t:'算了',cls:'ghost'}]});
   break;
  case 'dmode':
   S.speedMode=el.dataset.m;
   $('#dvModeSeg').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.m===S.speedMode));
   if(S.journey&&S.journey.cur)updateLegDyn();
   save(); break;
  case 'dspeed':
   cycleTimeScale();
   break;
  case 'dcruise':
   if(!S.journey||!S.journey.cur)break;
   if(S.journey.tollWait||S.journey.saWait){toast('进站过程中无法使用巡航');break}
   if(S.cruiseOn){setCruise(false);toast('定速巡航已解除');}
   else{
    const cs=S.journey.spd||0;
    if(cs<25){toast('车速太低，先提速再巡航');break}
    ROAD.cruiseSpd=cs;setCruise(true);toast('巡航 '+Math.round(cs)+' km/h，踩刹车解除');
   }
   save();break;
  case 'cancelJourney':
   if(!S.journey){toast('当前没有进行中的行程');break}
   cancelJourneyTrip();
   break;
  case 'dlights':
   ROAD.lights=!ROAD.lights;
   $('#dvLightBtn').classList.toggle('off',!ROAD.lights);
   break;
  case 'dhorn':
   honk(); dvLog('📣 嘀——嘀——让一让咧~');
   break;
  case 'tstart': openTitleSlotPick(true); break;
  case 'tcontinue': openTitleSlotPick(false); break;
  case 'tguide': showGuide(true); break;
  case 'endContinue': const ed=$('#end'); if(ed)ed.remove(); break;
  case 'endRestart': deleteSaveAndReload(); break;
 }
 }catch(err){toast('操作异常：'+err.message);console.error(err);}
 save();
});

/* ================= 引导 ================= */
function guideBody(){
 return `<b style="color:#e64340">你背着 1 亿债务</b>，每天产生利息和生活费。<br><br>
 1️⃣ 在<b>接单页</b>挑一单货运，点「接下这单」后<b>指派一台车</b>：在身边的车可「亲自驾驶」，也可「自动派送」（平台代驾费 ¥150；配了司机的车由司机出车，<b>免代驾费</b>还吃特长加成）；<br>
 2️⃣ 可以<b>同时接多单</b>，指派车队里不同的车并行运送，在「我的运单」里看进度；<br>
 3️⃣ 车辆页可<b>购买多台车</b>组建车队，外地的车可一键「调到这里」；<br>
 4️⃣ 亲自驾驶时选路线：<b>高速快但收费</b>，<b>国道免费但费时伤车</b>；盯紧燃油/车况/精力，服务区可加油休息；<br>
 5️⃣ 送达拿钱 → <b>财务页还债</b> → <b>车库买车改装</b>；<br>
 6️⃣ 车库可<b>招聘司机</b>：配到车上的司机跑自动派送自带特长（省油/夜路/耐造/稳妥），随送单升级变强；每天发日薪，欠薪会掉忠诚、拖久了跳槽；<br>
 7️⃣ 还清 1 亿债务，达成「无债一身轻」——之后没有目标也没有上限；<br><br>
 <span class="muted">债务超过 150 万，银行会收走卡车。接单页顶部有「报价大厅」：货主发需求、你出价竞标。订单有邻城货、回头货、可议价、特殊要求、豪华单等花样，卡片上的「利润约」已扣除油费过路费平台费。自动派送默认按快速车速行驶（略费油），有司机的车免代驾费；亲自驾驶无任何代驾支出，赚得更多。理财页可投资<b>实体产业</b>：城市仓库（送达加价+卸货快）、加油站入股（加油 8 折）、物流园档口（货源更好），每天还有营业额进账。总资产 2000 万、3 处产业、累计运费 500 万即可<b>递交上市申请</b>——背着债也能上，募资正好拿去还债；上市后自家股价随经营起伏，大股东每日限减 2%。</span>`;
}
function showGuide(onTitle){
 askModal({center:true,title:'📖 玩法说明',tag:'大运卡车模拟',body:guideBody(),buttons:[{t:onTitle?'返回':'知道了',cls:'pri'}]});
}

/* ================= 音频系统：程序化 BGM + 事件音效（WebAudio 合成，无外部资源） ================= */
function _mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t2=Math.imul(a^a>>>15,1|a);t2=t2+Math.imul(t2^t2>>>7,61|t2)^t2;return((t2^t2>>>14)>>>0)/4294967296}}
const THEME_S={
 /* 大厅：Lo-Fi 轻爵士（Am7-Dm7-G7-Cmaj7），电钢伴奏+贝斯+即兴旋律 */
 hall:{
  bpm:80,swing:0.30,
  prog:[
   {b:45,ch:[57,60,64,67]},
   {b:50,ch:[62,65,69,72]},
   {b:43,ch:[55,59,62,65]},
   {b:48,ch:[60,64,67,71]},
  ],
  PENT:[57,60,62,64,67,69,72,74,76,79,81,84],
  play(A,sub,bar,loop,p,t,sd){
   const nt=A.night?0.7:1;
   if(sub===0){
    p.ch.forEach((m,i)=>A.tone({m:m+12,t:t+i*0.03,d:sd*7.4,v:(0.018+i*0.003)*nt,type:'sawtooth',a:0.55,flt:720}));
    A.kick(t,0.17,A.bgmBus);
    A._melQ=A.genMel(THEME_S.hall,bar,loop,p);
   }
   if(sub===0)A.tone({m:p.b,t,d:sd*2.3,v:0.17*nt,type:'triangle',a:0.012,flt:500});
   if(sub===3)A.tone({m:p.b+7,t,d:sd*1.5,v:0.12*nt,type:'triangle',flt:500});
   if(sub===4){A.tone({m:p.b,t,d:sd*1.4,v:0.13*nt,type:'triangle',flt:500});A.kick(t,0.10,A.bgmBus);}
   if(sub===6)A.tone({m:p.b+7,t,d:sd*1.5,v:0.11*nt,type:'triangle',flt:500});
   if(sub===2||sub===5||(sub===7&&bar%2===1))p.ch.forEach((m,i)=>A.tone({m:m+12,t:t+i*0.012,d:sd*1.3,v:0.028*nt,type:'sine',a:0.01}));
   if(!A.night&&sub%2===0&&sub!==0)A.hat(t,0.03,A.bgmBus);
   const mn=A._melQ&&A._melQ[sub];
   if(mn)A.tone({m:mn.m,t,d:mn.d*0.92,v:mn.v*nt,type:'triangle',a:0.02,flt:2700});
  }
 },
 /* 公路：轻摇滚（A-D-E-D），鼓组+电贝斯+五声音阶主音吉他 RIFF */
 road:{
  bpm:118,swing:0,
  prog:[{b:45},{b:50},{b:52},{b:50}],
  RIFF:[[0,0,1],[1,3,1],[2,5,1.6],[4,7,2.6],[8,7,1],[10,5,1],[11,3,1],[12,0,2.4],[16,0,1],[17,3,1],[18,5,1],[19,7,1],[20,10,1.6],[22,7,1.6],[24,5,1],[25,3,1],[26,0,1],[27,-2,1],[28,0,3.2]],
  play(A,sub,bar,loop,p,t,sd){
   const nt=A.night?0.7:1;
   if(sub===0||sub===4)A.kick(t,0.42*nt,A.bgmBus);
   if(bar%2===1&&sub===3)A.kick(t,0.26*nt,A.bgmBus);
   if(sub===2||sub===6)A.snare(t,0.20*nt,A.bgmBus);
   if(!A.night||sub%2===0)A.hat(t,(sub%2?0.05:0.085)*nt,A.bgmBus);
   const oct=(sub===3||sub===7)?12:0;
   A.tone({m:p.b+oct,t,d:sd*0.92,v:(sub%2?0.10:0.15)*nt,type:'sawtooth',a:0.008,flt:640});
   if(sub===0)[0,7,12].forEach(iv=>A.tone({m:p.b+24+iv,t,d:sd*1.7,v:0.022*nt,type:'sawtooth',a:0.02,flt:2000}));
   const kp=(bar%4)*8+sub;
   for(const r of this.RIFF)if(r[0]===kp){A.tone({m:69+r[1],t,d:sd*r[2]*0.95,v:0.05*nt,type:'square',a:0.01,flt:2400});break;}
  }
 }
};
const AUDIO={
 ctx:null,master:null,sfxBus:null,bgmBus:null,bgmFlt:null,noiseBuf:null,
 ready:false,enabled:false,timer:null,step:0,schedT:0,themeName:'',night:false,_duck:false,_hidden:false,_melQ:null,_melP:null,_swT:0,
 pref:{bgm:1,sfx:1,vol:2},
 VOL:[0,0.9,1.5,2.0],
 SFXG:2.4,
 VOICE:1.7,
 ensure(){
  if(this.ctx){ if(this.ctx.state==='suspended'){try{this.ctx.resume()}catch(e){}} return true; }
  try{
   const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return false;
   const ac=new AC(); this.ctx=ac;
   this.master=ac.createGain(); this.master.gain.value=1.0;
   const comp=ac.createDynamicsCompressor();
   comp.threshold.value=-3; comp.knee.value=3; comp.ratio.value=12; comp.attack.value=0.002; comp.release.value=0.15;
   this.post=ac.createGain(); this.post.gain.value=1.35;
   /* 软限幅：0.55 以下线性透明，峰值平滑压向 ~0.95，杜绝爆音 */
   const N=1024, curve=new Float32Array(N);
   for(let i=0;i<N;i++){ const x=i/(N-1)*2-1, ax=Math.abs(x); curve[i]=ax<=0.55?x:Math.sign(x)*(0.55+0.42*Math.tanh((ax-0.55)/0.42)); }
   const ws=ac.createWaveShaper(); ws.curve=curve; ws.oversample='2x';
   this.limiter=ws;
   this.master.connect(comp); comp.connect(this.post); this.post.connect(ws); ws.connect(ac.destination);
   this.sfxBus=ac.createGain(); this.sfxBus.gain.value=this.pref.sfx?this.SFXG:0; this.sfxBus.connect(this.master);
   this.bgmFlt=ac.createBiquadFilter(); this.bgmFlt.type='lowpass'; this.bgmFlt.frequency.value=9000; this.bgmFlt.connect(this.master);
   this.bgmBus=ac.createGain(); this.bgmBus.gain.value=0; this.bgmBus.connect(this.bgmFlt);
   const len=Math.floor(ac.sampleRate*1.2), buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0);
   for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
   this.noiseBuf=buf; this.ready=true;
   if(!this.timer)this.timer=setInterval(()=>this.tick(),70);
  }catch(e){}
  return this.ready;
 },
 vol(){return this.VOL[this.pref.vol]||0},
 applyBgmGain(){
  if(!this.ctx)return;
  const v=(this.pref.bgm&&!this._hidden)?this.vol()*(this._duck?0.5:1)*(this.night?0.85:1):0;
  this.bgmBus.gain.setTargetAtTime(v,this.ctx.currentTime,this._hidden?0.1:0.35);
 },
 duck(on){ if(!this.ctx)return; const was=this._duck; this._duck=!!on; if(was!==this._duck)this.applyBgmGain(); },
 /* 切后台：静音 BGM 并暂停调度；回前台：恢复 AudioContext 与 BGM */
 setHidden(h){
  const was=this._hidden; this._hidden=!!h; if(was===this._hidden)return;
  if(!h&&this.ctx&&this.ctx.state==='suspended'){try{this.ctx.resume()}catch(e){}}
  this.applyBgmGain();
 },
 toggleBgm(){ this.pref.bgm=this.pref.bgm?0:1; if(this.pref.bgm)this.enabled=true; this.applyBgmGain(); },
 toggleSfx(){ this.pref.sfx=this.pref.sfx?0:1; if(this.sfxBus&&this.ctx)this.sfxBus.gain.setTargetAtTime(this.pref.sfx?this.SFXG:0,this.ctx.currentTime,0.03); },
 cycleVol(){ this.pref.vol=(this.pref.vol+1)%this.VOL.length; if(this.pref.vol>0)this.pref.bgm=1; this.applyBgmGain(); },
 volLabel(){ return ['🔇 关闭','🔈 轻柔','🔉 适中','🔊 响亮'][this.pref.vol]; },
 sfxLabel(){ return this.pref.sfx?'🔔 已开启':'🔕 已关闭'; },
 commit(){ if(typeof S!=='undefined'&&S&&S.audio){S.audio={bgm:this.pref.bgm,sfx:this.pref.sfx,vol:this.pref.vol};save();} },
 gameOn(){
  if(typeof S!=='undefined'&&S){ S.audio=Object.assign({bgm:1,sfx:1,vol:2},S.audio||{}); this.pref=Object.assign({},S.audio); }
  this.enabled=true;
  if(!this.ensure())return;
  this.applyBgmGain(); this.autoTheme();
 },
 /* ---------- 主题选择与切换 ---------- */
 autoTheme(){
  let th='hall';
  try{ if(typeof S!=='undefined'&&S&&S.journey)th='road'; }catch(e){}
  const hour=(typeof S!=='undefined'&&S)?(S.T%24):12, nv=(hour>=19.5||hour<5.5);
  if(nv!==this.night){ this.night=nv; this.applyNight(); this.applyBgmGain(); }
  this.setTheme(th);
 },
 applyNight(){
  if(!this.ctx||!this.bgmFlt)return;
  const f=this.themeName==='road'?(this.night?1100:12000):(this.night?2600:9000);
  this.bgmFlt.frequency.setTargetAtTime(f,this.ctx.currentTime,1.5);
 },
 setTheme(name){
  if(this.themeName===name)return;
  const doSwitch=()=>{ this.themeName=name; this.step=0; this._melQ=null; this._melP=null; if(this.ctx)this.schedT=this.ctx.currentTime+0.06; this.applyNight(); };
  if(!this.ctx||!this.enabled){ doSwitch(); return; }
  const ac=this.ctx;
  this.bgmBus.gain.cancelScheduledValues(ac.currentTime);
  this.bgmBus.gain.setTargetAtTime(0.0001,ac.currentTime,0.16);
  clearTimeout(this._swT);
  this._swT=setTimeout(()=>{ doSwitch(); this.applyBgmGain(); },600);
 },
 /* ---------- 音序器 ---------- */
 tick(){
  const ac=this.ctx; if(!ac||!this.enabled||!this.themeName||!THEME_S[this.themeName])return;
  if(ac.state!=='running'||this._hidden)return;
  const T=THEME_S[this.themeName], sd=30/T.bpm; /* 八分音符时长 */
  if(this.schedT<ac.currentTime-0.2)this.schedT=ac.currentTime+0.05;
  while(this.schedT<ac.currentTime+0.24){
   if(this.pref.bgm){
    const t2=this.schedT+(this.step%2?T.swing*sd:0);
    const bar=Math.floor(this.step/8), sub=this.step%8;
    T.play(this,sub,bar,Math.floor(bar/T.prog.length),T.prog[bar%T.prog.length],t2,sd);
   }
   this.step++; this.schedT+=sd;
  }
 },
 genMel(T,bar,loop,p){
  const rng=_mulberry32(4017+loop*97+bar*13);
  const cells=[[0,3,6],[0,2,4],[2,4,6],[0,4],[0,2,3,6],[4,6],[0,2,5,7],[0,3],[6],[]];
  const cell=cells[Math.floor(rng()*cells.length)];
  const P=T.PENT, q={}; let prev=this._melP==null?72:this._melP;
  cell.forEach(s=>{
   let m;
   if(s===0)m=p.ch[Math.floor(rng()*p.ch.length)]+12;
   else{
    let idx=0,best=1e9;
    P.forEach((n,i)=>{const d2=Math.abs(n-prev);if(d2<best){best=d2;idx=i}});
    idx+=[-2,-1,1,1,2][Math.floor(rng()*5)];
    idx=Math.max(4,Math.min(P.length-1,idx));
    m=P[idx];
   }
   q[s]={m,d:30/T.bpm*(s===0?2:(rng()<0.4?1.8:0.9)),v:0.045+rng()*0.02};
   prev=m;
  });
  if(cell.length)this._melP=prev;
  return q;
 },
 /* ---------- 合成器基元 ---------- */
 tone(o){
  const ac=this.ctx; if(!ac)return;
  const f=o.f!=null?o.f:440*Math.pow(2,(o.m-69)/12);
  const osc=ac.createOscillator(); osc.type=o.type||'sine'; osc.frequency.setValueAtTime(f,o.t);
  if(o.slide)osc.frequency.exponentialRampToValueAtTime(o.slide,o.t+o.d);
  const g=ac.createGain(); let v=o.v!=null?o.v:0.15; if((o.bus||this.bgmBus)===this.bgmBus)v*=this.VOICE; const a=o.a||0.006;
  g.gain.setValueAtTime(0.0001,o.t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0012,v),o.t+a);
  g.gain.exponentialRampToValueAtTime(0.0008,o.t+Math.max(o.d,a+0.02));
  let node=osc;
  if(o.flt){ const fl=ac.createBiquadFilter(); fl.type='lowpass'; fl.frequency.value=o.flt; osc.connect(fl); node=fl; }
  node.connect(g); g.connect(o.bus||this.bgmBus);
  osc.start(o.t); osc.stop(o.t+o.d+0.08);
  osc.onended=()=>{ try{g.disconnect();node.disconnect();}catch(e){} };
 },
 noise(o){
  const ac=this.ctx; if(!ac)return;
  const src=ac.createBufferSource(); src.buffer=this.noiseBuf; src.loop=true;
  const fl=ac.createBiquadFilter(); fl.type=o.ft||'bandpass'; fl.frequency.setValueAtTime(o.f||2000,o.t);
  if(o.slideF)fl.frequency.exponentialRampToValueAtTime(o.slideF,o.t+o.d);
  fl.Q.value=o.q||1;
  const g=ac.createGain(); let v=o.v!=null?o.v:0.2; if((o.bus||this.bgmBus)===this.bgmBus)v*=this.VOICE;
  g.gain.setValueAtTime(0.0001,o.t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0012,v),o.t+(o.a||0.006));
  g.gain.exponentialRampToValueAtTime(0.0008,o.t+o.d);
  src.connect(fl); fl.connect(g); g.connect(o.bus||this.sfxBus);
  src.start(o.t); src.stop(o.t+o.d+0.06);
  src.onended=()=>{ try{g.disconnect();fl.disconnect();}catch(e){} };
 },
 kick(t,v,bus){
  const ac=this.ctx; if(!ac)return;
  if((bus||this.bgmBus)===this.bgmBus)v*=this.VOICE;
  const o=ac.createOscillator(); o.type='sine';
  o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(44,t+0.11);
  const g=ac.createGain();
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(v,t+0.005); g.gain.exponentialRampToValueAtTime(0.001,t+0.24);
  o.connect(g); g.connect(bus||this.bgmBus); o.start(t); o.stop(t+0.28);
  o.onended=()=>{ try{g.disconnect()}catch(e){} };
 },
 snare(t,v,bus){ this.noise({t,d:0.15,v,f:1900,q:0.9,bus}); this.tone({f:196,t,d:0.07,v:v*0.5,type:'triangle',bus}); },
 hat(t,v,bus){ this.noise({t,d:0.045,v,f:7800,ft:'highpass',q:0.7,bus}); },
 /* ---------- 事件音效 ---------- */
 sfx(n,delay){
  if(!this.pref.sfx)return;
  if(!this.ensure())return;
  const ac=this.ctx; if(ac.state!=='running')return;
  const t=ac.currentTime+(delay||0)+0.015, B=this.sfxBus, A=this;
  const bell=(m,tt,d,v)=>{A.tone({m,t:tt,d:d||0.4,v:v||0.21,type:'sine',bus:B});A.tone({m:m+12,t:tt,d:(d||0.4)*0.55,v:(v||0.21)*0.25,type:'sine',bus:B});};
  switch(n){
   case 'click': A.tone({f:1700,t,d:0.04,v:0.1,type:'square',flt:3400,bus:B}); break;
   case 'accept': bell(76,t,0.3,0.22); bell(81,t+0.14,0.55,0.24); break;
   case 'coin': A.tone({f:987,t,d:0.075,v:0.21,type:'square',flt:4200,bus:B}); A.tone({f:1318,t:t+0.075,d:0.3,v:0.21,type:'square',flt:4200,bus:B}); break;
   case 'pay': A.tone({f:560,slide:340,t,d:0.18,v:0.18,type:'triangle',bus:B}); break;
   case 'settle': [72,76,79,84,88].forEach((m,i)=>bell(m,t+i*0.09,0.4,0.2)); [72,76,79,84].forEach(m=>A.tone({m,t:t+0.47,d:1.0,v:0.1,a:0.03,bus:B})); break;
   case 'arrive': bell(79,t,0.35,0.22); bell(84,t+0.17,0.7,0.24); break;
   case 'crash': A.noise({t,d:0.5,v:0.4,ft:'lowpass',f:900,a:0.004,bus:B}); A.kick(t,0.5,B); A.noise({t,d:0.1,v:0.22,f:3000,q:1.2,bus:B}); A.tone({f:2900,t,d:0.1,v:0.06,type:'square',bus:B}); break;
   case 'scrape': A.noise({t,d:0.3,v:0.5,f:2600,slideF:1000,q:2.5,bus:B}); break;
   case 'toll': A.tone({f:1180,t,d:0.09,v:0.18,type:'square',flt:3000,bus:B}); A.tone({f:1180,t:t+0.18,d:0.09,v:0.18,type:'square',flt:3000,bus:B}); break;
   case 'level': [72,74,76,79,84,88].forEach((m,i)=>A.tone({m,t:t+i*0.07,d:0.14,v:0.2,type:'square',flt:5200,bus:B})); A.tone({m:88,t:t+0.44,d:0.6,v:0.21,type:'triangle',bus:B}); break;
   case 'ach': bell(81,t,0.5,0.21); bell(88,t+0.1,0.7,0.2); A.noise({t:t+0.02,d:0.25,v:0.06,f:8200,ft:'highpass',bus:B}); break;
   case 'error': A.tone({f:210,t,d:0.16,v:0.15,type:'square',flt:1200,bus:B}); A.tone({f:224,t,d:0.16,v:0.15,type:'square',flt:1200,bus:B}); break;
   case 'warn': [0,0.16].forEach(dt=>A.tone({f:165,t:t+dt,d:0.12,v:0.17,type:'sawtooth',flt:900,bus:B})); break;
   case 'siren': [0,1,2].forEach(i=>{A.tone({f:690,t:t+i*0.44,d:0.2,v:0.13,type:'triangle',bus:B});A.tone({f:540,t:t+i*0.44+0.22,d:0.2,v:0.13,type:'triangle',bus:B});}); break;
   case 'scratch': A.noise({t,d:0.09,v:0.24,f:3200,q:1.6,bus:B}); break;
   case 'win': [72,76,79,84].forEach((m,i)=>A.tone({m,t:t+i*0.07,d:0.16,v:0.21,type:'triangle',flt:4500,bus:B})); A.tone({m:84,t:t+0.3,d:0.5,v:0.2,type:'triangle',bus:B}); break;
   case 'jackpot': [72,76,79,84,88,91,96].forEach((m,i)=>bell(m,t+i*0.06,0.35,0.21)); [72,76,79,84,88].forEach(m=>A.tone({m,t:t+0.52,d:1.2,v:0.085,a:0.03,bus:B})); A.noise({t:t+0.02,d:0.5,v:0.06,f:8000,ft:'highpass',bus:B}); break;
   case 'lose': A.tone({m:64,t,d:0.3,v:0.14,bus:B}); A.tone({m:60,t:t+0.24,d:0.55,v:0.14,bus:B}); break;
   case 'rest': A.tone({m:60,t,d:0.5,v:0.11,a:0.06,bus:B}); A.tone({m:55,t:t+0.3,d:0.9,v:0.11,a:0.1,bus:B}); break;
   case 'refuel': [300,380,470].forEach((f,i)=>A.tone({f,t:t+i*0.09,d:0.07,v:0.13,type:'square',flt:900,bus:B})); A.noise({t,d:0.55,v:0.14,ft:'lowpass',f:520,a:0.04,bus:B}); break;
   case 'repair': [0,0.11,0.22,0.33].forEach(dt=>A.noise({t:t+dt,d:0.03,v:0.21,f:4200,ft:'highpass',bus:B})); A.noise({t:t+0.42,d:0.4,v:0.1,f:6500,ft:'highpass',a:0.02,bus:B}); break;
   case 'upgrade': [69,73,76,81].forEach((m,i)=>bell(m,t+i*0.08,0.3,0.2)); break;
  }
 }
};

/* ================= 启动 ================= */
function resumeJourney(){
 const j=S.journey; if(!j)return;
 S.status='drive';
 /* 亲自驾驶的车必须回到当前车别名上 */
 const jt=truckById(j.truckId);
 if(jt){S.curTruck=jt.id;S.truck=jt;S.truck.city=S.city;}
 AUDIO.autoTheme();
 j.paused=false;
 mapLastCity=null; focusHome();
 switchTab('map');
 const stp=j.steps[j.idx];
 if(stp&&stp.type==='leg'){
  j.doneKm=Math.max(0,j.doneKm-(j.legKmDone||0));
  beginLeg(stp);
 }else if(stp&&(stp.type==='sa'||stp.type==='br')){ j.idx--; nextStep(); }
 else nextStep();
 updateJourneyMap();
 toast('已恢复上次的行车进度');
}
function startGame(fresh,slotId,nick){
 if(slotId&&window.SaveManager&&SaveManager.setSlot)SaveManager.setSlot(slotId); /* 玩家自选槽位：后续自动/手动保存都写这里 */
 S=fresh?newState():(load()||newState());
 migrateState(); /* 旧存档迁移：单车→车队、单运单→已接订单列表 */
 if(fresh&&nick)S.name=nick; /* 新开局：写入玩家输入的昵称 */
 S.fuelBase=+clamp(+S.fuelBase||3.8,3.2,4.4).toFixed(2); /* 旧存档油价并入下调后的区间 */
 if(S.fatigue===undefined)S.fatigue=10;
 adsState(); /* 兼容旧存档：确保广告字段存在 */
 S.timeScale=Math.min(S.timeScale||1,maxUnlockedTs()); /* 流速按解锁上限钳制 */
 applyDark(); /* 恢复玩家设置的深色模式 */
 /* 激励视频已改由 Lamps 开放平台提供（见文件顶部 lamps-bridge / lamps-platform 内联脚本），此处无需再初始化第三方广告 */

 if(fresh){genNews();genOrders();}
 AUDIO.gameOn();
 $('#title').classList.add('hide');
 $('#tbar').classList.remove('hide');
 $('#views').classList.remove('hide');
 $('#navbar').classList.remove('hide');
 switchTab('orders');renderAll();save();
 if(S.journey)resumeJourney();
 else if(fresh&&!S.flags.tut){S.flags.tut=1;setTimeout(()=>{ if(!(S.accepted||[]).length&&!S.journey&&!modalOpen)askModal({center:true,title:'🚛 开张第一天',tag:'新手必读',body:guideBody(),buttons:[{t:'开始跑运输',cls:'pri'}]}); },450);}
}
function renderTitle(){
 const has=window.SaveManager?SaveManager.hasSave():!!load();
 $('#titleBtns').innerHTML=`${has?'<button data-act="tcontinue">继续经营</button>':''}<button data-act="tstart" class="${has?'ghost':''}">新的开始</button><button data-act="tguide" class="ghost">玩法说明</button>`;
}
/* ============ 标题页槽位选择（新的开始 / 继续经营） ============
 * 玩家自己选玩哪个存档槽：继续=只能点已有存档的槽；新的开始=空槽直接开，
 * 已有存档的槽确认覆盖后重开。自动保存跟随该槽位。 */
function openTitleSlotPick(fresh){
 /* 旧版 SaveManager.js（无槽位接口）时兜底直接开局，保证按钮永远可用 */
 if(!window.SaveManager||!SaveManager.getCurrentSlot||!SaveManager.setSlot){startGame(fresh);return;}
 const cur=SaveManager.getCurrentSlot();
 const list=SaveManager.getSlotList();
 const rows=list.map(m=>{
  const hasSave=!m.isEmpty;
  let title,sub,dim=false;
  if(fresh){
   title='槽位 '+m.slotId+(hasSave?' · '+slotLocalLine(m):' · 空槽位');
   sub=hasSave?'已有存档，选择后需确认覆盖重开':'空槽位，点选直接开新档';
   if(m.slotId===cur)title+=' · 上次游玩';
  }else{
   title='槽位 '+m.slotId+(hasSave?' · '+slotLocalLine(m):' · 空槽位');
   sub=hasSave?('保存于 '+fmtSlotTime(m.timestamp)):'空槽位，没有可继续的进度';
   dim=!hasSave;
  }
  return slotRow(m.slotId,title,sub,dim);
 }).join('');
 const md=askModal({center:true,title:fresh?'新的开始 · 选择槽位':'继续经营 · 选择槽位',tag:'存档槽位',
  body:rows+(fresh
   ?'<div style="font-size:11px;color:#8a93a3;line-height:1.7">点选一个槽位开始新游戏；之后进度自动保存在该槽位，进度自动保存在本地槽位。</div>'
   :'<div style="font-size:11px;color:#8a93a3;line-height:1.7">点选要继续的存档槽位；进度将保存在所选槽位。</div>'),
  buttons:[{t:'返回',cls:'ghost'}]});
 md.el.querySelectorAll('[data-slot]').forEach(btn=>btn.addEventListener('click',()=>{
  const id=+btn.dataset.slot;
  const meta=list[id-1];
  if(!fresh&&!meta.isEmpty){AUDIO.sfx('click');md.close();startGame(false,id);return;}
  if(!fresh){toast('槽位'+id+'是空的，没有可继续的进度');return;}
  if(!meta.isEmpty){
   md.close();
   askModal({center:true,title:'覆盖槽位 '+id,
    body:'槽位 '+id+' 已有存档（'+slotLocalLine(meta)+'），新的开始会覆盖它并重新开局，确定？',
    buttons:[
     {t:'覆盖重开',cls:'rd',fn:()=>{
       SaveManager.suspend(); /* 挂起保存，防止删除前旧数据回写 */
       SaveManager.deleteSlot(id,()=>{ SaveManager.resume(); askNickName(id); });
     }},{t:'算了',cls:'ghost'}]});
   return;
  }
  AUDIO.sfx('click');md.close();askNickName(id);
 }));
}
/* 车手昵称固定为「陈师傅」（平台审核要求：不提供任何用户自定义输入） */
function askNickName(slotId){
 askModal({center:true,title:'车手身份',tag:'新的开始',
  body:'<div style="font-size:13px;line-height:1.9;color:#333">车手：<b>陈师傅</b><br><span style="color:#888">昵称由系统固定，无需输入。</span></div>',
  buttons:[{t:'开始经营',cls:'pri',fn:()=>{ startGame(true,slotId,'陈师傅'); }},{t:'返回',cls:'ghost'}]});
}
function boot(){
 // 音频：首次交互解锁 AudioContext（移动端自动播放策略）
 document.addEventListener('pointerdown',()=>{AUDIO.ensure();},{passive:true});
 document.addEventListener('keydown',()=>{AUDIO.ensure();},{passive:true});
 // 游戏切到后台时暂停背景音乐，回到前台自动恢复
 document.addEventListener('visibilitychange',()=>{AUDIO.setHidden(document.hidden); if(document.hidden)autoSaveLocal();});
window.addEventListener('pagehide',()=>{autoSaveLocal();});
window.addEventListener('beforeunload',()=>{autoSaveLocal();});
 // 踏板按住逻辑
 const bindPedal=(id,mode)=>{
  const el=$(id); if(!el)return;
  const on=e=>{e.preventDefault();S._pedal=mode;el.classList.add('press');};
  const off=()=>{if(S._pedal===mode)S._pedal=null;el.classList.remove('press');};
  el.addEventListener('pointerdown',on);
  el.addEventListener('pointerup',off);
  el.addEventListener('pointerleave',off);
  el.addEventListener('pointercancel',off);
 };
 bindPedal('#dvGas','gas');
 bindPedal('#dvBrake','brake');
 // 方向盘拖动转向
 const wheel=$('#dvWheel');
 let wdrag=null;
 wheel.addEventListener('pointerdown',e=>{
  if(!S||!S.journey||S.journey.paused)return;
  wdrag={id:e.pointerId,x0:e.clientX};
  try{wheel.setPointerCapture(e.pointerId);}catch(err){}
  e.preventDefault();
 });
 wheel.addEventListener('pointermove',e=>{
  if(!wdrag||e.pointerId!==wdrag.id)return;
  ROAD.steer=clamp((e.clientX-wdrag.x0)/70,-1,1);
 });
 const wend=e=>{
  if(!wdrag||e.pointerId!==wdrag.id)return;
  wdrag=null;
  ROAD.lane=clamp(Math.round(ROAD.laneX/1.25),-1,1);
  ROAD.steer=0;
 };
 wheel.addEventListener('pointerup',wend);
 wheel.addEventListener('pointercancel',wend);
 startAdsCdTicker(); /* 支持页双倍收入剩余时间倒计时 */
 window.addEventListener('keydown',e=>{
  if(!S||!S.journey||!S.journey.cur)return;
  if($('#drive').classList.contains('hide'))return;
  if(e.key==='ArrowLeft'||e.key==='a'){changeLane(-1);}
  else if(e.key==='ArrowRight'||e.key==='d'){changeLane(1);}
 });
 window.addEventListener('resize',()=>{ if(S&&S.journey)resizeRoadCv(); if(S&&uiTab==='map'){mapAspectRefresh();applyMapV();} });
 if(!load)return;
 /* 启动：直接按本机存档渲染标题页 */
 renderTitle();
 setInterval(()=>{
  if(!S)return;
  if(window.SaveManager)SaveManager.update(1.6); /* 驱动自动保存60s/脏保存3s/云同步+重试队列 */
  else if(Date.now()-_autoT>8000){ _autoT=Date.now(); autoSaveLocal(); } /* 无存档系统时：每8秒脏保存一次（纯本地） */
  AUDIO.autoTheme();
  renderCash();
  repairOrders(); /* 自愈：修复“亲自驾驶中”却无行程的孤儿运单 */
  tickFleet(); /* 车队自动派送推进（按游戏时间结算里程油耗） */
  tickDriverEnergy(); /* 司机精力随游戏时间恢复（空闲司机，跑车中的预扣制不回） */
  // 回单结算到账（任何界面/行程中都生效）
  if(S.pending&&S.pending.length){
   const due=S.pending.filter(p=>p.dueT<=S.T);
   if(due.length){
    S.pending=S.pending.filter(p=>p.dueT>S.T);
    const tot=due.reduce((s,p)=>s+p.amt,0);
    gain(tot,'回单结算到账');
    toast('💌 回单结算到账 '+money(tot));
   }
  }
  // 理财行情推进 + 定期到期
  ensureFinance();
  updateMarket();
  // 放贷到期：90% 还本息，10% 老赖跑路
  if(S.loans&&S.loans.length){
   const due=S.loans.filter(l=>l.dueT<=S.T);
   if(due.length){
    S.loans=S.loans.filter(l=>l.dueT>S.T);
    due.forEach(l=>{
     if(chance(0.9)){
      const v=Math.round(l.amt*1.06);
      S.cash+=v;addLedger('放贷回收',v);
      toast('💸 司机 '+l.who+' 还款到账 '+money(v));
     }else{
      toast('💸 司机 '+l.who+' 卷款跑路，'+money(l.amt)+' 血本无归');
      S.runaway='司机'+l.who+'卷款跑路，全城寻找线索';
     }
    });
   }
  }
  if(S.finance.fixed.length){
   const due=S.finance.fixed.filter(f=>f.dueT<=S.T);
   if(due.length){
    S.finance.fixed=S.finance.fixed.filter(f=>f.dueT>S.T);
    due.forEach(f=>{
     const v=Math.round(f.amt*(1+f.rate*FIXED_DAYS));
     S.finance.deposit+=v;
     toast('🏦 定期到期，本息 '+money(v)+' 已转入活期');
    });
   }
  }
  if(uiTab==='invest')renderInvest();
  if(uiTab==='fun'&&S.fun&&S.fun.mkt&&S.fun.mkt.day!==tday(S.T))renderFun(); // 跨天自动补新货
  processSettleQ(); /* 自动送达的运单逐单弹出结算 */
  if(S.journey){
   updateJourneyMap();
   if(!S.journey.paused)updateDriveHud();
   renderTop();
   // 行驶中订单板也跟随位置刷新：淘汰过期 + 按前方锚点城市补充
   const before=S.orders.length;
   S.orders=S.orders.filter(o=>o.expire>S.T);
   genOrders();
   if(uiTab==='orders'&&(before!==S.orders.length||chance(0.3)))renderOrders();
   return;
  }
  if(modalOpen)return;
  addTime(0.035);
  const before=S.orders.length;
  S.orders=S.orders.filter(o=>o.expire>S.T);
  genOrders();
  renderTop();
  if(uiTab==='orders'&&(before!==S.orders.length||chance(0.3)))renderOrders();
 },1600);
 window.addEventListener('error',ev=>{try{toast('程序异常：'+(ev.message||'未知错误'))}catch(e){}});
}
boot();
