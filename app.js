/* =========================================================================
 * 每日热点筛选 · 工作台逻辑
 * 数据来自 data.js（window.HOTSPOT_DATA / CATEGORIES / CHANNELS / CAT_META / DATA_DATE）
 * 审核状态存 localStorage（按 DATA_DATE 隔离）；历史驳回可导出/导入 rejected-log.json，
 * 供「每日热点筛选」自动化任务读取做同类降权。
 * ========================================================================= */
let DATE = window.DATA_DATE || new Date().toISOString().slice(0,10);
let AUDIT_KEY = "muxu_hotspot_audit_" + DATE;
const REJECT_KEY = "muxu_hotspot_rejected_log";

const CATEGORIES = window.CATEGORIES || [];
const CHANNELS  = window.CHANNELS || [];
const CAT_META  = window.CAT_META || {};
let DATA      = window.HOTSPOT_DATA || [];
const REMOTE_DATA_URL = "https://zhang22935.github.io/hotspot-workbench/data.js";
let LAST_FETCH = localStorage.getItem("muxu_hotspot_lastfetch") || "";

let curCat = CATEGORIES[0] || "美食";
let curCh = CHANNELS[0] || "综合";
let curFilter = "all";

// ============ 持久化 ============
function loadAudit(){try{return JSON.parse(localStorage.getItem(AUDIT_KEY))||{};}catch(e){return {};}}
function saveAudit(a){localStorage.setItem(AUDIT_KEY,JSON.stringify(a));}
function loadRejectLog(){try{return JSON.parse(localStorage.getItem(REJECT_KEY))||[];}catch(e){return [];}}
function saveRejectLog(arr){localStorage.setItem(REJECT_KEY,JSON.stringify(arr));}
let audit = loadAudit();

// 启动时尝试合并仓库内的 rejected-log.json（自动化维护的历史驳回）
function mergeFileRejectLog(){
  try{
    fetch("rejected-log.json",{cache:"no-store"}).then(r=>{ if(!r.ok) return null; return r.json(); })
      .then(arr=>{
        if(!Array.isArray(arr)||!arr.length) return;
        const log=loadRejectLog();
        let changed=false;
        arr.forEach(r=>{ if(!log.find(x=>x.id===r.id)){ log.push(r); changed=true; } });
        if(changed){ saveRejectLog(log); renderPref(); }
      }).catch(()=>{});
  }catch(e){/* file:// 下静默失败 */}
}

// ============ 判定逻辑 ============
function isFit(t,cat){return (t.cats||[]).includes(cat);}
function fitReason(t,cat){
  if(isFit(t,cat)) return "热点属「"+cat+"」范畴，与账号高度契合"+(t.caution?"（注意："+t.caution+"）":"");
  const others = t.cats.length? t.cats.join("/") : "社会民生";
  return "热点属「"+others+"」范畴，与「"+cat+"」账号调性不符";
}
function priOf(t,cat){
  if(!isFit(t,cat)) return "—";
  if(t.heatNum==null) return "P2";
  return t.heatNum>=1000?"P1":t.heatNum>=800?"P2":"P3";
}

// 候选推文生成（手工草稿优先，否则按分类模板）
function genContent(t,cat){
  if(t.drafts && t.drafts[cat]) return t.drafts[cat];
  const m = CAT_META[cat];
  const angle = m.em+" "+cat+"切入："+(t.hook||("结合热点做"+cat+"向内容"));
  const cn = m.lead+"「"+t.title+"」"+(t.hook||"")+"。"+m.tail+" "+m.h;
  const en = m.leadEn+'"'+t.title+'" — '+(t.hookEn||("a timely angle for "+cat+" creators."))+". "+m.tailEn+" "+m.h;
  return {angle,cn,en};
}

// 渠道过滤
function byChannel(list){
  if(curCh==="综合") return list;
  return list.filter(t=>(t.channels||[]).includes(curCh));
}

// ============ 渲染：选择器 ============
function renderSelectors(){
  document.getElementById("catChips").innerHTML = CATEGORIES.map(c=>
    `<span class="chip cat${c===curCat?' active':''}" data-cat="${c}">${(CAT_META[c]&&CAT_META[c].em)||""} ${c}</span>`).join("");
  document.getElementById("chChips").innerHTML = CHANNELS.map(c=>
    `<span class="chip ch${c===curCh?' active':''}" data-ch="${c}">${(c==='综合'?'🌐':(c==='抖音'?'🟥':(c==='小红书'?'🟥':(c==='快手'?'🟧':'🟢'))))} ${c}</span>`).join("");
  document.getElementById("hdCat").textContent = curCat+"账号";
  document.getElementById("hdCh").textContent = curCh+"渠道";
  document.getElementById("viewTag").textContent = curCh+" · "+curCat;
  document.getElementById("hdDate").textContent = DATE;
}

// ============ 渲染：统计 ============
function renderStats(){
  const list = byChannel(DATA);
  const total=list.length;
  const fit=list.filter(t=>isFit(t,curCat)).length;
  const nofit=total-fit;
  const pend=list.filter(t=>(audit[t.id]?.status||"待审核")==="待审核"&&isFit(t,curCat)).length;
  const adopt=list.filter(t=>audit[t.id]?.status==="采纳").length;
  const reject=list.filter(t=>audit[t.id]?.status==="驳回").length;
  const cards=[
    {c:"s-total",num:total,lbl:"当前视图热点"},
    {c:"s-fit",num:fit,lbl:"适合跟进"},
    {c:"s-nofit",num:nofit,lbl:"不适合跟进"},
    {c:"s-pend",num:pend,lbl:"待审核"},
    {c:"s-adopt",num:adopt,lbl:"已采纳"},
    {c:"s-reject",num:reject,lbl:"已驳回"}
  ];
  document.getElementById("stats").innerHTML=cards.map(x=>
    `<div class="stat ${x.c}"><div class="num">${x.num}</div><div class="lbl">${x.lbl}</div></div>`).join("");
}

// ============ 渲染：总览 ============
function chTags(t){
  const arr = (t.channels&&t.channels.length)? t.channels : ["综合"];
  return arr.map(c=>`<span class="chtag ch-${c}">${c}</span>`).join("");
}
function priRank(p){return p==="P1"?3:p==="P2"?2:p==="P3"?1:0;}
function renderOverview(){
  const list = byChannel(DATA).slice().sort((a,b)=>{
    const pa=priRank(priOf(a,curCat)), pb=priRank(priOf(b,curCat));
    if(pa!==pb) return pb-pa;
    return (b.heatNum||0)-(a.heatNum||0);
  });
  document.getElementById("ovTag").textContent = curCh+" · "+curCat+"（"+list.length+"条）";
  document.getElementById("overviewBody").innerHTML = list.map(d=>{
    const pr=priOf(d,curCat);
    const prHtml = pr==="—"?'<span style="color:var(--muted)">—</span>':`<span class="pri ${pr.toLowerCase()}">${pr}</span>`;
    const fit=isFit(d,curCat);
    const fitHtml=fit?'<span class="pill fit-y">适合跟进</span>':'<span class="pill fit-n">不适合跟进</span>';
    return `<tr><td>${prHtml}</td><td>${chTags(d)}</td><td>${d.title}</td><td>${d.source}</td><td>${d.heat}</td><td>${fitHtml}</td><td>${fitReason(d,curCat)}</td></tr>`;
  }).join("") || `<tr><td colspan="7" class="note">该渠道暂无热点数据。</td></tr>`;
}

// ============ 渲染：内容池 ============
function renderPool(){
  const list = byChannel(DATA).filter(d=>isFit(d,curCat));
  document.getElementById("poolTag").textContent = curCh+" · "+curCat+"（适合 "+list.length+" 条）";
  const shown = list.filter(d=>{
    const st=audit[d.id]?.status||"待审核";
    return curFilter==="all"||st===curFilter;
  });
  document.getElementById("poolBody").innerHTML = shown.map(d=>{
    const st=audit[d.id]?.status||"待审核";
    const note=audit[d.id]?.note||"";
    const pr=priOf(d,curCat);
    const prHtml=`<span class="pri ${pr.toLowerCase()}">${pr}</span>`;
    const c=genContent(d,curCat);
    return `<div class="card">
      <div class="chead">
        <div><span class="cid">${d.id}</span> ${chTags(d)} ${prHtml}<div class="ctitle">${d.title}</div></div>
        <span class="st-mark st-${st}">${st}</span>
      </div>
      <div class="field"><span class="k">事件摘要</span>${d.summary||""}</div>
      <div class="field"><span class="k">信息来源</span>${d.source||""} ｜ 热度：${d.heat||""}</div>
      <div class="field"><span class="k">内容切入角度</span>${c.angle}</div>
      <div class="tweet"><span class="lang">中文候选推文</span>${c.cn}<button class="copy" data-copy="${encodeURIComponent(c.cn)}">复制</button></div>
      <div class="tweet"><span class="lang">英文候选推文</span>${c.en}<button class="copy" data-copy="${encodeURIComponent(c.en)}">复制</button></div>
      <div class="audit">
        <button class="btn btn-adopt" data-act="采纳" data-id="${d.id}">✓ 采纳</button>
        <button class="btn btn-reject" data-act="驳回" data-id="${d.id}">✕ 驳回</button>
        <input type="text" placeholder="审核备注（如：标题党/与调性不符）" value="${note.replace(/"/g,'&quot;')}" data-note="${d.id}">
      </div>
    </div>`;
  }).join("") || `<p class="note">当前「${curCat} · ${curCh}」暂无适合跟进的候选内容。</p>`;
}

// ============ 渲染：偏好 ============
function renderPref(){
  const log=loadRejectLog();
  const body=document.getElementById("prefBody");
  if(!log.length){
    body.innerHTML=`<p class="note">暂无驳回记录。当你在「待审核内容池」点击「驳回」并填写备注，记录会出现在这里，并成为下次筛选的降权依据（跨分类/渠道保留）。</p>
      <p class="note">接入「每日热点筛选」自动化后：导出的 <code>rejected-log.json</code> 由任务读取，对同类热点自动降权。点下方「⬇ 导出偏好」下载后提交到仓库即可生效。</p>`;
    return;
  }
  body.innerHTML=`<p>累计驳回 <b>${log.length}</b> 条。下次运行将参考以下清单做同类降权：</p><ul>`+
    log.map(r=>`<li><b>${r.title}</b> <span class="note">（${r.date||""}${r.cat? ' · 分类：'+r.cat:''}${r.note? ' · 备注：'+r.note:''}）</span></li>`).join("")+`</ul>`;
  const sync=document.getElementById("prefSync");
  if(sync) sync.style.display="block";
}

// ============ 交互 ============
document.getElementById("catChips").addEventListener("click",e=>{
  if(e.target.dataset.cat){curCat=e.target.dataset.cat;renderSelectors();renderAll();}
});
document.getElementById("chChips").addEventListener("click",e=>{
  if(e.target.dataset.ch){curCh=e.target.dataset.ch;renderSelectors();renderAll();}
});
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");
  const v=t.dataset.view;
  document.getElementById("view-overview").style.display=v==="overview"?"block":"none";
  document.getElementById("view-pool").style.display=v==="pool"?"block":"none";
  document.getElementById("view-pref").style.display=v==="pref"?"block":"none";
});
document.querySelectorAll("#poolFilters button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("#poolFilters button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");curFilter=b.dataset.f;renderPool();
});
document.getElementById("poolBody").addEventListener("click",e=>{
  if(e.target.classList.contains("copy")){copy(e.target.dataset.copy);}
  if(e.target.dataset.act){
    const id=e.target.dataset.id, act=e.target.dataset.act;
    audit[id]=audit[id]||{};audit[id].status=act;
    if(act==="驳回"){
      const log=loadRejectLog();const item=DATA.find(d=>d.id===id);
      if(!log.find(r=>r.id===id)) log.push({id,title:item&&item.title,date:DATE,cat:curCat,note:audit[id].note||""});
      saveRejectLog(log);
    }
    saveAudit(audit);renderStats();renderPool();renderPref();
    toast(act==="采纳"?"已标记为采纳":"已标记为驳回并记录偏好");
  }
});
document.getElementById("poolBody").addEventListener("input",e=>{
  if(e.target.dataset.note){
    const id=e.target.dataset.note;audit[id]=audit[id]||{};audit[id].note=e.target.value;
    if(audit[id].status==="驳回"){const log=loadRejectLog();const it=log.find(r=>r.id===id);if(it){it.note=e.target.value;it.cat=curCat;saveRejectLog(log);renderPref();}}
    saveAudit(audit);
  }
});

// 偏好 JSON 同步
function exportRejectJSON(){
  const log=loadRejectLog();
  const blob=new Blob([JSON.stringify(log,null,2)],{type:"application/json;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rejected-log.json";a.click();
  toast("已导出 rejected-log.json（提交到仓库即可让自动化降权）");
}
function importRejectJSON(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const arr=JSON.parse(reader.result);
      if(!Array.isArray(arr)) throw new Error("格式错误");
      const log=loadRejectLog();
      arr.forEach(r=>{ if(r&&r.id && !log.find(x=>x.id===r.id)) log.push(r); });
      saveRejectLog(log);renderPref();
      toast("已导入 "+arr.length+" 条驳回偏好");
    }catch(e){ toast("导入失败："+e.message); }
  };
  reader.readAsText(file);
}
document.getElementById("exportRejectBtn").onclick=exportRejectJSON;
document.getElementById("importRejectBtn").onclick=()=>document.getElementById("importRejectFile").click();
document.getElementById("importRejectFile").addEventListener("change",e=>{
  if(e.target.files&&e.target.files[0]) importRejectJSON(e.target.files[0]);
  e.target.value="";
});

function copy(enc){
  const txt=decodeURIComponent(enc);
  navigator.clipboard?.writeText(txt).then(()=>toast("已复制推文")).catch(()=>{
    const ta=document.createElement("textarea");ta.value=txt;document.body.appendChild(ta);ta.select();
    try{document.execCommand("copy");toast("已复制推文");}catch(e){}document.body.removeChild(ta);
  });
}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),1600);}

// ============ 实时更新：拉取线上最新 data.js ============
async function refreshData(){
  const btn=document.getElementById("refreshBtn");
  const orig=btn.innerHTML;
  btn.disabled=true;
  btn.innerHTML='<span class="spin">⏳</span> 抓取中…';
  try{
    const url=REMOTE_DATA_URL+"?t="+Date.now();
    const res=await fetch(url,{cache:"no-store"});
    if(!res.ok) throw new Error("HTTP "+res.status);
    const txt=await res.text();
    // data.js 用 window.xxx 赋值，注入 window 在沙箱内求值取回
    const r=new Function("window", txt+"; return {D:window.HOTSPOT_DATA, DATE:window.DATA_DATE};")(window);
    if(!Array.isArray(r.D)||!r.D.length) throw new Error("数据为空");
    DATA=r.D;
    if(r.DATE) DATE=r.DATE;
    AUDIT_KEY="muxu_hotspot_audit_"+DATE;
    audit=loadAudit();
    LAST_FETCH=new Date().toLocaleString("zh-CN",{hour12:false});
    localStorage.setItem("muxu_hotspot_lastfetch",LAST_FETCH);
    renderAll();renderPref();mergeFileRejectLog();updateFetchStatus();
    toast("已更新至 "+DATE+" 的最新数据");
  }catch(e){
    toast("更新失败："+(e&&e.message?e.message:e)+" · 每日09:00自动更新");
  }finally{
    btn.disabled=false; btn.innerHTML=orig;
  }
}
function updateFetchStatus(){
  const s=document.getElementById("fetchStatus");
  if(s) s.textContent="数据日期 "+DATE+" · 最近刷新 "+(LAST_FETCH||"—");
  const hd=document.getElementById("hdFetch");
  if(hd) hd.textContent=LAST_FETCH||"—";
}
document.getElementById("refreshBtn").onclick=refreshData;

// ============ 导出 Markdown ============
document.getElementById("exportBtn").onclick=()=>{
  const list = byChannel(DATA).filter(d=>isFit(d,curCat));
  let md=`# 每日热点筛选 · 待审核内容池 ${DATE}\n\n> 账号分类：${curCat}｜渠道：${curCh}｜来源：公开渠道｜未编造\n\n`;
  md+=`## 待审核内容池（${curCat}·${curCh} 适合跟进 ${list.length} 条）\n\n`;
  md+=`| 池编号 | 渠道 | 关联热点 | 事件摘要 | 信息来源 | 切入角度 | 中文候选推文 | 英文候选推文 | 审核状态 | 审核备注 |\n|---|---|---|---|---|---|---|---|---|---|\n`;
  list.forEach(d=>{
    const st=audit[d.id]?.status||"待审核";const note=audit[d.id]?.note||"";
    const c=genContent(d,curCat);
    const ch=(d.channels&&d.channels.length)?d.channels.join("/"):"综合";
    md+=`| ${d.id} | ${ch} | ${d.title} | ${d.summary||""} | ${d.source||""} | ${c.angle} | ${c.cn} | ${c.en} | ${st} | ${note} |\n`;
  });
  const rejected=loadRejectLog();
  if(rejected.length){md+=`\n## 偏好进化 · 历史驳回（${rejected.length} 条）\n`;rejected.forEach(r=>md+=`- ${r.title}（${r.date||""}${r.cat?' · '+r.cat:''}${r.note?' · '+r.note:''}）\n`);}
  const blob=new Blob([md],{type:"text/markdown;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`每日热点筛选_${curCat}_${curCh}_${DATE}.md`;a.click();
  toast("已导出 Markdown");
};

// ============ 初始化 ============
function renderAll(){renderSelectors();renderStats();renderOverview();renderPool();}
renderAll();renderPref();mergeFileRejectLog();updateFetchStatus();
