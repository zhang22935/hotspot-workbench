// breakdown.js —— 每日热点候选池 · Demo 演示链路模块（纯静态，无后端）
// Demo 完整链路：输入热点 → 去重排序 → 跟进判断 → 生成中英文候选 → 存入待审核池 → 人工采纳/驳回 → 基于反馈输出优化策略
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const POOL_KEY = "muxu_demo_pool"; // 二次创作候选池（localStorage 持久化）
  const FLOW_STEPS = [
    "① 输入热点",
    "② 去重排序",
    "③ 跟进判断",
    "④ 中英文候选",
    "⑤ 存入待审核池",
    "⑥ 采纳/驳回",
    "⑦ 优化策略",
  ];
  const CATEGORIES = window.CATEGORIES || [];
  const CAT_META = window.CAT_META || {};

  function toast(m) {
    const t = $("toast");
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("show"), 2000);
  }

  // ---------- 工具 ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function today() {
    return new Date().toISOString().slice(0, 10);
  }
  function norm(s) {
    // 归一化：小写 + 去空白/标点/符号（用于相似度判定）
    return String(s || "").toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
  }
  function bigrams(s) {
    const out = new Set();
    for (let i = 0; i + 1 < s.length; i++) out.add(s.slice(i, i + 2));
    return out;
  }
  function jaccard(a, b) {
    const A = bigrams(a), B = bigrams(b);
    if (!A.size || !B.size) return 0;
    let inter = 0;
    A.forEach((x) => { if (B.has(x)) inter++; });
    return inter / (A.size + B.size - inter);
  }
  function isDup(a, b) {
    // 判定重复：①归一化后互为包含 ②bigram Jaccard 相似度 ≥ 0.55（同源事件多平台标题变体）
    if (!a || !b || a.length < 4 || b.length < 4) return false;
    const [s, l] = a.length <= b.length ? [a, b] : [b, a];
    if (l.includes(s) && s.length >= Math.min(6, l.length * 0.5)) return true;
    return jaccard(a, b) >= 0.55;
  }
  function heatOf(t) {
    return typeof t.heatNum === "number" ? t.heatNum : 0;
  }
  function priOf(t) {
    if (t.heatNum == null) return "P3";
    return t.heatNum >= 1000 ? "P1" : t.heatNum >= 800 ? "P2" : "P3";
  }
  function copyText(txt, okMsg) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => toast(okMsg || "已复制"))
        .catch(() => fallbackCopy(txt, okMsg));
    } else fallbackCopy(txt, okMsg);
  }
  function fallbackCopy(txt, okMsg) {
    const ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast(okMsg || "已复制"); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ---------- 状态 ----------
  const STATE = {
    step: 0, // 当前流程节点（0=未开始）
    hot: [], // 去重排序后 [{raw…, row, dup, dupOf}]
    judged: [], // [{hot, fit(boolean|null), reason, cat}]
    cand: [], // [{judge, angle, cn, en}]
    poolFilter: "all",
  };

  // ---------- 流程条 ----------
  function renderFlow(step) {
    STATE.step = step;
    $("dpFlow").innerHTML = FLOW_STEPS.map((s, i) => {
      const n = i + 1;
      const cls = n < step ? "done" : n === step ? "cur" : "";
      return `<span class="fstep ${cls}">${n < step ? "✓ " : ""}${s}</span>`;
    }).join("");
  }

  // ---------- 步骤1：输入热点 ----------
  function parseInput(text) {
    let blocks = (text || "")
      .split(/\n\s*-{3,}\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (blocks.length <= 1) {
      blocks = (text || "").split(/\n/).map((s) => s.trim()).filter(Boolean);
    }
    return blocks.map((b, idx) => {
      const lines = b.split(/\n/).map((s) => s.trim()).filter(Boolean);
      let title = lines[0] || "未命名热点" + (idx + 1);
      let heat = "", source = "";
      const parts = title.split("|").map((s) => s.trim());
      if (parts.length >= 3) { title = parts[0]; heat = parts[1]; source = parts[2]; }
      else if (parts.length === 2) { title = parts[0]; heat = parts[1]; }
      let heatNum = null;
      const m = (heat || "").match(/(\d+(?:\.\d+)?)/);
      if (m) heatNum = parseFloat(m[1]);
      return {
        id: "H" + (idx + 1),
        title, heat, heatNum, source,
        summary: lines.slice(1).join(" "),
        hook: "", hookEn: "", cats: [], drafts: null,
      };
    });
  }

  // 从今日热点数据导入（按热度取前 12 条）
  function importFromData() {
    const list = (window.HOTSPOT_DATA || [])
      .slice()
      .sort((a, b) => heatOf(b) - heatOf(a))
      .slice(0, 12);
    if (!list.length) { toast("暂无热点数据，请先更新今日热点"); return; }
    $("dpHotInput").value = list
      .map((t) => `${t.title}|${t.heat || ""}|${t.source || ""}\n${t.summary || ""}`)
      .join("\n----\n");
    toast("已导入今日热点 " + list.length + " 条，点击「① 开始去重排序」");
  }

  // Demo 示例：含 1 组相似话题，便于演示去重
  function loadDemo() {
    $("dpAccount").value = "@苜蓿的美食日记";
    $("dpCategory").value = "美食";
    $("dpHotInput").value =
      "开渔后第一顿海鲜有多鲜|抖音热榜第2(1138.9万)|抖音热点榜\n南海/东海开渔后第一网海鲜上岸，梭子蟹、皮皮虾、黄鱼成抢手货，鲜到掉眉毛\n----\n" +
      "人类对鸡蛋的开发不足万分之一|抖音热榜第4(1104.3万)|抖音热点榜\n鸡蛋创意吃法与营养讨论，引发厨艺党二创热潮\n----\n" +
      "开渔第一顿海鲜有多鲜！|热搜在榜|百度热搜\n开渔季头茬海鲜陆续上岸，网友晒图馋哭评论区（与第1条同源话题）\n----\n" +
      "立秋后第一顿贴秋膘吃什么|话题热度上升|微博热搜\n立秋贴秋膘传统与家常菜做法盘点";
    toast("已载入 Demo 示例（含 1 组相似话题便于演示去重）");
  }

  // ---------- 步骤2：去重排序 ----------
  function dedupeAndSort(list) {
    const arr = list.map((raw, i) => ({ raw, _i: i, keep: true, dupOf: null }));
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i].keep) continue;
      for (let j = i + 1; j < arr.length; j++) {
        if (!arr[j].keep) continue;
        if (isDup(norm(arr[i].raw.title), norm(arr[j].raw.title))) {
          const hi = heatOf(arr[i].raw) >= heatOf(arr[j].raw) ? i : j;
          const lo = hi === i ? j : i;
          arr[lo].keep = false;
          arr[lo].dupOf = hi;
        }
      }
    }
    const kept = arr.filter((a) => a.keep)
      .sort((a, b) => heatOf(b.raw) - heatOf(a.raw) || a._i - b._i);
    const dropped = arr.filter((a) => !a.keep);
    const pos = new Map(kept.map((k, i) => [k._i, i + 1])); // 原下标 → 显示行号
    const ordered = [
      ...kept.map((k) => ({ k, dup: false })),
      ...dropped.map((k) => ({ k, dup: true })),
    ];
    STATE.hot = ordered.map(({ k, dup }, i) => ({
      ...k.raw,
      row: i + 1,
      dup,
      dupOf: dup ? pos.get(k.dupOf) || null : null,
    }));
  }

  function renderDedupe() {
    const hot = STATE.hot;
    $("dpDedupTag").textContent = `共 ${hot.length} 条 · 保留 ${hot.filter((h) => !h.dup).length} · 合并重复 ${hot.filter((h) => h.dup).length}`;
    $("dpDedupBody").innerHTML = hot.map((h) => {
      const dupHtml = h.dup
        ? `<span class="dup dup-drop">与 #${h.dupOf} 重复 · 已合并</span>`
        : `<span class="dup dup-new">保留</span>`;
      const pr = priOf(h);
      return `<tr class="${h.dup ? "dropped" : ""}">
        <td>#${h.row}</td><td>${esc(h.title)}</td><td>${esc(h.heat || "—")}</td>
        <td>${esc(h.source || "—")}</td><td>${dupHtml}</td>
        <td><span class="pri ${pr.toLowerCase()}">${pr}</span></td>
      </tr>`;
    }).join("") || `<tr><td colspan="6" class="note">没有可分析的热点，请先输入。</td></tr>`;
  }

  // 领域关键词映射（用于手动粘贴热点无 cats 字段时的语义兜底）
  const DOMAIN_KEYWORDS = {
    美食: ["美食","海鲜","鸡蛋","菜","吃","食","榴莲","水果","饭","汤","甜品","烘焙","厨房","食谱","探店","食材","夜宵","早餐","晚餐","猪肉","牛肉","鸡","鸭","鱼","虾","蟹","饮料","咖啡","茶","立秋","开渔","贴秋膘"],
    摄影: ["摄影","相机","拍照","大片","镜头","调色","构图","光影","写真","旅拍","快门"],
    情绪: ["情绪","治愈","焦虑","emo","内耗","松弛感","深夜","孤独","成长","心理","安慰"],
    穿搭: ["穿搭","ootd","衣橱","上身","搭配","秋装","冬装","显瘦","配色","时尚","叠穿"],
    旅行: ["旅行","旅游","目的地","小众","景点","打卡","攻略","出行","机票","酒店","假期","露营"],
    知识: ["知识","科普","原理","冷知识","信息差","真相","误区","涨知识","干货","解析"],
    美妆: ["美妆","化妆","护肤","口红","眼影","底妆","防晒","面膜","变美","妆造"],
    萌宠: ["萌宠","猫咪","猫","狗狗","狗","宠物","毛孩子","铲屎","仓鼠","兔子","主子"],
    健身: ["健身","减脂","增肌","训练","运动","跑步","撸铁","身材","瘦","自律","瑜伽"],
    搞笑: ["搞笑","梗","段子","笑死","哈哈","沙雕","整活","名场面","离谱","社死"],
    影视: ["影视","电影","电视剧","综艺","追剧","名场面","演员","导演","票房","剧集","番剧"],
    音乐: ["音乐","歌曲","歌词","旋律","歌手","专辑","演唱会","单曲","节奏","嗓音"],
    母婴: ["母婴","育儿","宝宝","辅食","孕","带娃","宝妈","儿童","早教","奶粉"],
    家居: ["家居","装修","收纳","布置","改造","家具","居家","打扫","租房","软装"],
    数码: ["数码","手机","电脑","耳机","测评","新品","芯片","电池","游戏机","智能","参数","发布"],
  };
  function hitDomain(h, catKey) {
    const hay = (h.title + " " + (h.summary || "")).toLowerCase();
    if (hay.includes(catKey.toLowerCase())) return true;
    const kws = DOMAIN_KEYWORDS[catKey];
    return !!(kws && kws.some((k) => hay.includes(k)));
  }

  // ---------- 步骤3：跟进判断 ----------
  function judge(list, cat) {
    const catKey = (cat || "").trim();
    return list.map((h) => {
      let fit = false, reason = "";
      if (!catKey) {
        fit = null;
        reason = "请先填写「账号领域」再判断";
      } else if (CATEGORIES.includes(catKey)) {
        const hasCat = (h.cats || []).includes(catKey);
        const kw = hitDomain(h, catKey);
        fit = hasCat || kw;
        reason = fit
          ? (hasCat
              ? `热点属「${catKey}」范畴，与账号高度契合`
              : `标题/摘要命中「${catKey}」领域关键词，建议跟进`)
          : `热点属「${(h.cats || []).join("/") || "其他"}」范畴，标题/摘要未命中「${catKey}」，与账号调性不符`;
      } else {
        fit = hitDomain(h, catKey);
        reason = fit
          ? `标题/摘要命中「${catKey}」关键词，建议跟进`
          : `未命中「${catKey}」关键词，与账号调性关联弱，谨慎跟进`;
      }
      return { hot: h, fit, reason, cat: catKey };
    });
  }

  function renderJudged() {
    $("dpJudged").innerHTML = STATE.judged.map((j, i) => {
      const h = j.hot;
      const fitHtml = j.fit == null
        ? `<span class="pill" style="background:#e2e8f0;color:#475569;">待判断</span>`
        : j.fit
          ? `<span class="pill fit-y">适合跟进</span>`
          : `<span class="pill fit-n">不适合跟进</span>`;
      return `<div class="judge-card">
        <div class="chead">
          <div><span class="cid">#${h.row} ${esc(h.title)}</span> ${fitHtml}</div>
          <div class="note">热度：${esc(h.heat || "—")} ｜ 来源：${esc(h.source || "—")}</div>
        </div>
        ${h.summary ? `<div class="field" style="margin-top:8px;"><span class="k">事件摘要</span>${esc(h.summary)}</div>` : ""}
        <div class="bd-field" style="margin-top:8px;"><span class="k">跟进判断理由（可编辑）</span>
          <textarea id="dpReason${i}" style="min-height:44px;">${esc(j.reason)}</textarea></div>
      </div>`;
    }).join("");
  }

  // ---------- 步骤4：生成中英文候选 ----------
  function genCandidates() {
    const cat = ($("dpCategory").value || "").trim();
    const meta = CAT_META[cat] || {
      em: "🔥", h: "#热点 #二创 #新角度", lead: "蹭一波热度：", leadEn: "Trending now — ",
      tail: "关注我，明天继续更新。", tailEn: "Follow for more.",
    };
    STATE.cand = STATE.judged
      .filter((j) => j.fit)
      .map((j) => {
        const h = j.hot;
        let angle, cn, en;
        if (h.drafts && h.drafts[cat]) {
          angle = h.drafts[cat].angle;
          cn = h.drafts[cat].cn;
          en = h.drafts[cat].en;
        } else {
          angle = `${meta.em} ${cat || "内容"}切入：「${h.title}」${h.hook ? " —— " + h.hook : ""}`;
          cn = `${meta.lead}「${h.title}」${h.hook || ("结合热点做" + (cat || "内容") + "向内容")}。${meta.tail} ${meta.h}`;
          en = `${meta.leadEn}"${h.title}" — ${h.hookEn || ("a timely angle for " + (cat || "content") + " creators.")}. ${meta.tailEn} ${meta.h}`;
        }
        return { judge: j, angle, cn, en };
      });
    $("dpCandList").innerHTML = STATE.cand.map((c, i) => {
      const j = c.judge, h = j.hot;
      return `<div class="card">
        <div class="chead">
          <div><span class="cid">#${h.row} · ${esc(h.title)}</span></div>
          <span class="pill fit-y">适合跟进</span>
        </div>
        <div class="field" style="margin-top:8px;"><span class="k">切入角度</span>${esc(c.angle)}</div>
        <div class="tweet"><span class="lang">🇨🇳 中文候选（可编辑）</span>
          <textarea id="dpCandCn${i}" style="width:100%;min-height:64px;border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;resize:vertical;background:#fff;margin-top:6px;">${esc(c.cn)}</textarea>
          <button class="copy" data-copy-i="${i}" data-lang="cn">复制</button></div>
        <div class="tweet"><span class="lang">🌐 英文候选（可编辑）</span>
          <textarea id="dpCandEn${i}" style="width:100%;min-height:64px;border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;resize:vertical;background:#fff;margin-top:6px;">${esc(c.en)}</textarea>
          <button class="copy" data-copy-i="${i}" data-lang="en">复制</button></div>
      </div>`;
    }).join("") || `<p class="note">没有「适合跟进」的热点，请返回上一步调整账号领域或热点列表。</p>`;
    $("dpGenHint").textContent = `已为 ${STATE.cand.length} 个热点生成中英文候选，可逐条编辑后存入待审核池。`;
  }
  // 候选编辑同步（textarea 变更 → 更新 STATE）
  function syncCandEdit(i, lang, v) {
    if (STATE.cand[i]) STATE.cand[i][lang] = v;
  }
  // 候选复制（读 textarea 实时值）
  function copyCand(i, lang) {
    const el = $("dpCand" + (lang === "en" ? "En" : "Cn") + i);
    copyText(el ? el.value : "", "已复制" + (lang === "en" ? "英文" : "中文") + "候选");
  }

  // ---------- 步骤5：存入待审核池 ----------
  function loadPool() {
    try { return JSON.parse(localStorage.getItem(POOL_KEY)) || []; } catch (e) { return []; }
  }
  function savePool(p) { localStorage.setItem(POOL_KEY, JSON.stringify(p)); }

  function saveToPool() {
    if (!STATE.cand.length) { toast("暂无可入库候选"); return; }
    const pool = loadPool();
    let added = 0, updated = 0;
    STATE.cand.forEach((c, i) => {
      const j = c.judge, h = j.hot;
      const ex = pool.find((p) => p.hotId === h.id && p.cat === j.cat);
      const base = {
        hotId: h.id, cat: j.cat, title: h.title, heat: h.heat || "", source: h.source || "",
        reason: $("dpReason" + STATE.judged.indexOf(j)) ? $("dpReason" + STATE.judged.indexOf(j)).value : j.reason,
        angle: c.angle, cn: c.cn, en: c.en,
      };
      if (ex) {
        // 已存在：仅更新文案与理由，不重置审核状态
        Object.assign(ex, base);
        updated++;
      } else {
        pool.push({
          id: "DP_" + today().replace(/-/g, "") + "_" + (pool.length + 1) + "_" + Date.now().toString(36).slice(-3),
          ...base,
          status: "待审核", note: "", createdAt: new Date().toISOString(), reviewAt: "",
        });
        added++;
      }
    });
    savePool(pool);
    $("dpSaveHint").textContent = `✅ 已存入待审核池：新增 ${added} 条${updated ? "，更新 " + updated + " 条" : ""}。请在下方「待审核内容池」逐条采纳/驳回。`;
    renderFlow(5);
    renderPool();
    renderStrategy();
    toast(`已存入待审核池 ${added} 条` + (updated ? "（更新" + updated + "条）" : ""));
  }

  // ---------- 步骤6：待审核池 采纳/驳回 ----------
  let poolFilter = "all";
  function renderPool() {
    const pool = loadPool();
    const shown = pool.filter((p) => poolFilter === "all" || p.status === poolFilter);
    $("dpPoolBody").innerHTML = shown.map((p) => {
      const st = p.status;
      return `<div class="card">
        <div class="chead">
          <div><span class="cid">${esc(p.id)}</span> ${esc(p.hotId)} · ${esc(p.cat)}<div class="ctitle">${esc(p.title)}</div></div>
          <span class="st-mark st-${st}">${st}</span>
        </div>
        <div class="field"><span class="k">切入角度 / 判断理由</span>${esc(p.angle)}<div class="note" style="margin-top:4px;">${esc(p.reason || "")}</div></div>
        <div class="field" style="margin-top:8px;"><span class="k">来源 / 热度</span>${esc(p.source || "—")} ｜ ${esc(p.heat || "—")}</div>
        <div class="tweet"><span class="lang">🇨🇳 中文候选</span>${esc(p.cn)}<button class="copy" data-copy-text="${encodeURIComponent(p.cn)}">复制</button></div>
        <div class="tweet"><span class="lang">🌐 英文候选</span>${esc(p.en)}<button class="copy" data-copy-text="${encodeURIComponent(p.en)}">复制</button></div>
        <div class="audit">
          <button class="btn btn-adopt" data-act="采纳" data-id="${esc(p.id)}">✓ 采纳</button>
          <button class="btn btn-reject" data-act="驳回" data-id="${esc(p.id)}">✕ 驳回</button>
          <input type="text" placeholder="驳回理由（如：标题党 / 与调性不符 / 价值不足）" value="${esc(p.note)}" data-note="${esc(p.id)}">
          ${p.reviewAt ? `<span class="note">审核于 ${p.reviewAt.replace("T", " ").slice(0, 16)}</span>` : ""}
        </div>
      </div>`;
    }).join("") ||
      `<p class="note">${pool.length ? "当前筛选下无候选。" : "待审核池为空。完成「步骤4 生成候选」后点击「📥 全部候选存入待审核池」，候选会出现在这里逐条审核。"}</p>`;
    const nAdopt = pool.filter((p) => p.status === "采纳").length;
    const nReject = pool.filter((p) => p.status === "驳回").length;
    $("dpPoolFilters").innerHTML = ["all", "待审核", "采纳", "驳回"]
      .map((f) => `<button class="${poolFilter === f ? "active" : ""}" data-f="${f}">${
        f === "all" ? "全部" : f === "待审核" ? "待审核" : f === "采纳" ? "已采纳" : "已驳回"}${f === "all" ? "（" + pool.length + "）" : ""}</button>`)
      .join("");
    $("dpStrategyStats").innerHTML =
      `<b>累计记录：</b>${pool.length} 条候选 ｜ <span class="st-mark st-采纳">采纳 ${nAdopt}</span> <span class="st-mark st-驳回">驳回 ${nReject}</span> <span class="st-mark st-待审核">待审核 ${pool.length - nAdopt - nReject}</span>`;
  }

  function reviewPool(id, act) {
    const pool = loadPool();
    const p = pool.find((x) => x.id === id);
    if (!p) return;
    p.status = act;
    p.reviewAt = new Date().toISOString();
    savePool(pool);
    renderPool();
    renderStrategy();
    toast(act === "采纳" ? "已采纳：该候选进入发布备选" : "已驳回：理由已记录为策略反馈");
  }
  function notePool(id, v) {
    const pool = loadPool();
    const p = pool.find((x) => x.id === id);
    if (!p) return;
    p.note = v;
    savePool(pool);
  }

  // ---------- 步骤7：基于反馈输出优化策略 ----------
  function clusterRejects(rejected) {
    const rules = [
      { k: "标题党", re: /标题党|夸张|夸大|震惊|博眼球|噱头|骗/ },
      { k: "调性不符", re: /调性|不符合|不搭|跑偏|不相关|无关|违和/ },
      { k: "同质重复", re: /重复|同质|看腻|类似|模板化|没新意/ },
      { k: "价值不足", re: /价值|干货|信息量|太水|空洞|浅|没用/ },
    ];
    const groups = {};
    rejected.forEach((r) => {
      const note = r.note || "";
      let tag = "其他";
      for (const ru of rules) { if (ru.re.test(note)) { tag = ru.k; break; } }
      (groups[tag] = groups[tag] || []).push(r);
    });
    return groups;
  }
  function buildStrategy() {
    const pool = loadPool();
    const adopted = pool.filter((p) => p.status === "采纳");
    const rejected = pool.filter((p) => p.status === "驳回");
    const pending = pool.filter((p) => p.status === "待审核");
    const L = [];
    if (!pool.length) {
      return "尚无审核反馈。当候选存入待审核池并执行采纳/驳回后，此处将自动生成下一次创作的优化策略。";
    }
    L.push("【热点候选优化策略】（基于 " + pool.length + " 条候选的审核反馈自动生成）");
    L.push("");
    L.push("✅ 采纳概览：" + adopted.length + " 条" +
      (adopted.length ? "——" + adopted.map((a) => "「" + a.title.slice(0, 18) + "」").join("、") : "（暂无）"));
    if (adopted.length) {
      const byCat = {};
      adopted.forEach((a) => { byCat[a.cat || "未分类"] = (byCat[a.cat || "未分类"] || 0) + 1; });
      const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
      L.push("   → 高潜力领域：「" + top[0] + "」（采纳 " + top[1] + " 条）→ 后续优先保证该领域选题供给。");
    }
    L.push("");
    L.push("❌ 驳回概览：" + rejected.length + " 条" +
      (rejected.length ? "——" + rejected.map((r) => "「" + r.title.slice(0, 18) + "」").join("、") : "（暂无）"));
    if (rejected.length) {
      const groups = clusterRejects(rejected);
      L.push("   → 驳回原因聚类：");
      Object.entries(groups).forEach(([tag, arr]) => {
        L.push("     · " + tag + "：" + arr.length + " 条" + (tag !== "其他" ? " → 下次生成应规避此类问题" : ""));
      });
    }
    L.push("");
    L.push("📌 下次生成调整建议：");
    if (adopted.length && rejected.length) {
      const groups = clusterRejects(rejected);
      const badTags = Object.keys(groups).filter((k) => k !== "其他");
      L.push("1. 保留高采纳切入方式（清单体/教程式/有明确 CTA），延续已验证的选题方向。");
      L.push("2. 规避" + (badTags.length ? badTags.join("、") : "被驳回") + "问题：生成后先自查一遍再入库。");
      L.push("3. 文案统一采用「钩子开场 + ①-③ 分点 + 共鸣收尾 + CTA」，保持干货密度。");
    } else if (adopted.length) {
      L.push("1. 当前采纳率为 100%，按现有风格继续产出，并扩大同类选题供给。");
      L.push("2. 继续保留中英双语候选，便于多渠道分发。");
    } else if (rejected.length) {
      L.push("1. 当前全部被驳回，建议暂停生成，先根据驳回原因重构角度与文案风格。");
      L.push("2. 在「待审核池」为每条候选补充具体驳回理由，策略将更精准。");
    } else {
      L.push("1. 候选尚未审核，请先在「待审核内容池」执行采纳/驳回，策略将随反馈自动更新。");
    }
    L.push("");
    L.push(pending.length
      ? "⏳ 仍有 " + pending.length + " 条候选待人工审核，审核后策略会继续进化。"
      : "🎯 所有候选已审核完毕，策略已收敛到当前最优生成方向。");
    return L.join("\n");
  }
  function renderStrategy() {
    const t = buildStrategy();
    $("dpStrategy").value = t;
  }

  // ---------- 导出 ----------
  function exportPool() {
    const pool = loadPool();
    const blob = new Blob([JSON.stringify({
      date: today(),
      pool,
      strategy: buildStrategy(),
    }, null, 2)], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `每日热点候选池_${today()}.json`;
    a.click();
    toast("已导出候选池 JSON");
  }

  // ---------- 绑定 ----------
  $("dpImportData").addEventListener("click", importFromData);
  $("dpLoadSample").addEventListener("click", loadDemo);

  $("dpRun").addEventListener("click", function () {
    const items = parseInput($("dpHotInput").value);
    if (!items.length) {
      $("dpRunHint").textContent = "⚠️ 请先输入热点（或点击「从今日热点导入」/「载入 Demo 示例」）";
      return;
    }
    dedupeAndSort(items);
    renderDedupe();
    $("dpSec1").hidden = false;
    $("dpSec2").hidden = true;
    $("dpSec3").hidden = true;
    renderFlow(2);
    $("dpRunHint").textContent = `已解析 ${items.length} 条热点，去重后保留 ${STATE.hot.filter((h) => !h.dup).length} 条。`;
    toast("去重排序完成");
  });

  $("dpJudge").addEventListener("click", function () {
    const cat = ($("dpCategory").value || "").trim();
    if (!cat) {
      $("dpJudgeHint").textContent = "⚠️ 请先填写「账号领域」，判定才有依据";
      return;
    }
    STATE.judged = judge(STATE.hot.filter((h) => !h.dup), cat);
    renderJudged();
    $("dpSec2").hidden = false;
    renderFlow(3);
    $("dpJudgeHint").textContent = `已判定 ${STATE.judged.length} 条：适合 ${STATE.judged.filter((j) => j.fit).length} 条。`;
    toast("跟进判断完成");
  });

  $("dpGen").addEventListener("click", function () {
    genCandidates();
    $("dpSec3").hidden = false;
    renderFlow(4);
    toast("已生成中英文候选");
  });

  // 候选编辑 + 复制（事件委托）
  $("dpCandList").addEventListener("input", function (e) {
    const m = /^dpCand(Cn|En)(\d+)$/.exec(e.target.id || "");
    if (m) syncCandEdit(+m[2], m[1] === "En" ? "en" : "cn", e.target.value);
  });
  $("dpCandList").addEventListener("click", function (e) {
    if (e.target.classList.contains("copy")) {
      copyCand(+e.target.dataset.copyI, e.target.dataset.lang);
    }
  });

  $("dpSavePool").addEventListener("click", saveToPool);

  // 池过滤 + 采纳/驳回 + 备注（事件委托）
  $("dpPoolFilters").addEventListener("click", function (e) {
    if (e.target.dataset.f) {
      poolFilter = e.target.dataset.f;
      renderPool();
    }
  });
  $("dpPoolBody").addEventListener("click", function (e) {
    if (e.target.classList.contains("copy")) {
      copyText(decodeURIComponent(e.target.dataset.copyText), "已复制候选");
    }
    if (e.target.dataset.act && e.target.dataset.id) {
      reviewPool(e.target.dataset.id, e.target.dataset.act);
    }
  });
  $("dpPoolBody").addEventListener("input", function (e) {
    if (e.target.dataset.note) notePool(e.target.dataset.note, e.target.value);
  });

  $("dpCopyStrategy").addEventListener("click", function () {
    copyText($("dpStrategy").value, "已复制优化策略");
  });
  $("dpExportPool").addEventListener("click", exportPool);

  // ---------- 初始化 ----------
  renderFlow(0);
  renderPool();
  renderStrategy();
})();
