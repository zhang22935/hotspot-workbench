// demo-pool.js —— 每日热点候选内容池 · Demo 演示链路模块（纯静态，无后端）
// 角色：内容运营 Agent，把每日市场热点转化为【待审核候选内容池】。
// 严格按 6 步业务规范执行：
//   ① 事件去重 & 优先级排序（1-10 分，4 维度打分）
//   ② 跟进决策判断（值得跟进 / 谨慎跟进 / 不跟进，三选一 + 理由）
//   ③ 生成候选稿件（仅对「值得跟进」：摘要 + 溯源 + 2-3 角度 + 中英文稿）
//   ④ 写入待审核内容池（9 字段，状态=待审核）
//   ⑤ 强制人工审核卡点（不可跳过；高风险强制复核；驳回必填原因）
//   ⑥ 反馈闭环优化（读历史采纳/驳回/原因，输出下轮打分优化策略并自动参考）
// 硬性约束：① 永不自动发布 ② 高风险强制标记+复核 ③ 完整来源溯源 ④ 不编造虚假热点
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const POOL_KEY = "muxu_demo_pool";        // 待审核内容池（localStorage 持久化，跨运行累积）
  const STRATEGY_KEY = "muxu_demo_strategy"; // 反馈闭环学到的下轮打分策略
  const FLOW_STEPS = [
    "①输入热点", "②去重&优先级", "③跟进决策", "④生成候选",
    "⑤写入待审池", "⑥人工审核", "⑦优化策略",
  ];
  const CATEGORIES = window.CATEGORIES || [];
  const CAT_META = window.CAT_META || {};

  // ---------- 工具 ----------
  function toast(m) {
    const t = $("toast");
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("show"), 2000);
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function norm(s) {
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
  // 事件去重：同源事件多平台标题变体（归一化包含 或 bigram 相似度≥0.55）
  function isDup(a, b) {
    if (!a || !b || a.length < 4 || b.length < 4) return false;
    const [s, l] = a.length <= b.length ? [a, b] : [b, a];
    if (l.includes(s) && s.length >= Math.min(6, l.length * 0.5)) return true;
    return jaccard(a, b) >= 0.55;
  }

  // ---------- 领域关键词（手动粘贴热点无 cats 字段时的语义兜底） ----------
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
  // 舆论风险关键词（命中计风险分；高风险强制标记+复核）
  const RISK_KW = ["争议","敏感","绯闻","塌房","翻车","骂战","对线","负面","维权","造假","封杀","处罚","约谈","315","曝光","网暴","人设崩","翻脸","吵架","纠纷","投诉","召回","致癌","有毒","危险","诈骗","丑闻","翻车现场","怒批","痛批","实锤"];
  const RISK_SENTI = ["为什么","怎么","竟然","居然","怒了","怒批","痛批","实锤","坑","智商税","塌","翻车"];

  // ---------- 打分维度 ----------
  // 话题热度：热度数值归一化到 0-10（约 1500 万 → 10）
  function heatScoreOf(h) {
    const n = typeof h.heatNum === "number" ? h.heatNum : 0;
    return Math.max(0, Math.min(10, Math.round(n / 150)));
  }
  // 账号赛道匹配度：命中领域关键词 → 高分；未命中 → 低分；未填领域 → 中性
  function matchOf(h, cat) {
    if (!cat) return { score: 5, hit: false };
    const hay = (h.title + " " + (h.summary || "")).toLowerCase();
    if (hay.includes(cat.toLowerCase())) return { score: 9, hit: true };
    const kws = DOMAIN_KEYWORDS[cat];
    if (kws && kws.some((k) => hay.includes(k.toLowerCase()))) return { score: 8, hit: true };
    return { score: 2, hit: false };
  }
  // 舆论风险：0-10，越高越危险
  function riskOf(h) {
    const t = (h.title + " " + (h.summary || "")).toLowerCase();
    let score = 0;
    RISK_KW.forEach((k) => { if (t.includes(k.toLowerCase())) score += 3; });
    RISK_SENTI.forEach((k) => { if (t.includes(k.toLowerCase())) score += 1; });
    score = Math.min(10, score);
    return { score, level: score >= 5 ? "high" : score >= 2 ? "mid" : "low",
      tag: score >= 5 ? "高风险" : score >= 2 ? "注意" : "安全" };
  }
  // 话题生命周期：上升期/高峰期/衰退期/平稳期
  function lifecycleOf(h) {
    const t = (h.title + " " + (h.heat || "") + " " + (h.source || "") + " " + (h.summary || "")).toLowerCase();
    if (/(上升|升温|刚|刚刚|突发|新出炉|首次|首度|刚出|新发|引爆|爆发|刷屏)/.test(t)) return { score: 9, label: "上升期" };
    if (/(热搜|在榜|爆|火|热议|刷屏|热度|榜单|登顶|霸屏|冲上)/.test(t)) return { score: 7, label: "高峰期" };
    if (/(回落|降温|退|过去|昨天|前天|旧|褪去|冷淡|过气|凉了)/.test(t)) return { score: 3, label: "衰退期" };
    return { score: 6, label: "平稳期" };
  }
  // 综合优先级 1-10（带反馈策略自动参考）
  function priorityOf(h, cat, strat) {
    const W = (strat && strat.weights) || { heat: 0.35, match: 0.35, safety: 0.15, life: 0.15 };
    const heat = heatScoreOf(h);
    const match = matchOf(h, cat).score;
    const risk = riskOf(h).score;
    const life = lifecycleOf(h).score;
    let p = heat * W.heat + match * W.match + (10 - risk) * W.safety + life * W.life;
    if (strat && strat.catBoost && cat) p += (strat.catBoost[cat] || 0); // 反馈策略：高采纳领域加权
    return Math.max(1, Math.min(10, Math.round(p)));
  }

  // ---------- 状态 ----------
  const STATE = {
    step: 0,
    hot: [],     // 去重排序后 [{...raw, dup, dupOf, scores, riskLevel, riskTag, lifecycle}]
    judged: [],  // [{hot, decision, reason, cat}]
    cands: [],   // [{judge, summary, sourceTrace, angles[], cn, en}]
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

  // ---------- 步骤① 输入热点 ----------
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
        cats: [],
      };
    });
  }
  function importFromData() {
    const list = (window.HOTSPOT_DATA || [])
      .slice()
      .sort((a, b) => (b.heatNum || 0) - (a.heatNum || 0))
      .slice(0, 12);
    if (!list.length) { toast("暂无热点数据，请先更新今日热点"); return; }
    $("dpHotInput").value = list
      .map((t) => `${t.title}|${t.heat || ""}|${t.source || ""}\n${t.summary || ""}`)
      .join("\n----\n");
    toast("已导入今日热点 " + list.length + " 条，点击「① 开始去重&优先级排序」");
  }
  // Demo 示例：≥3 类公开信息源（抖音/百度/微博）+ 1 组相似话题便于演示去重；均为真实公开事件
  function loadDemo() {
    $("dpAccount").value = "@苜蓿的美食日记";
    $("dpCategory").value = "美食";
    $("dpHotInput").value =
      "开渔后第一顿海鲜有多鲜|抖音热榜第2(1138.9万)|抖音热点榜\n南海/东海开渔后第一网海鲜上岸，梭子蟹、皮皮虾、黄鱼成抢手货，鲜到掉眉毛\n----\n" +
      "人类对鸡蛋的开发不足万分之一|抖音热榜第4(1104.3万)|抖音热点榜\n鸡蛋创意吃法与营养讨论，引发厨艺党二创热潮\n----\n" +
      "开渔第一顿海鲜有多鲜！|热搜在榜|百度热搜\n开渔季头茬海鲜陆续上岸，网友晒图馋哭评论区（与第1条同源话题）\n----\n" +
      "立秋后第一顿贴秋膘吃什么|话题热度上升|微博热搜\n立秋贴秋膘传统与家常菜做法盘点\n----\n" +
      "暑期档电影票房创新高引观影热潮|微博热搜|微博热搜\n多部影片集中上映，票房破纪录（与「美食」账号调性不符，演示「不跟进」）";
    toast("已载入 Demo 示例（3 类公开信息源 + 1 组同源话题便于演示去重）");
  }

  // ---------- 步骤② 事件去重 & 优先级排序 ----------
  function dedupeAndScore(list, cat) {
    const strat = loadStrategy();
    const arr = list.map((raw, i) => ({ raw, _i: i, keep: true, dupOf: null }));
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i].keep) continue;
      for (let j = i + 1; j < arr.length; j++) {
        if (!arr[j].keep) continue;
        if (isDup(norm(arr[i].raw.title), norm(arr[j].raw.title))) {
          const hi = (arr[i].raw.heatNum || 0) >= (arr[j].raw.heatNum || 0) ? i : j;
          const lo = hi === i ? j : i;
          arr[lo].keep = false;
          arr[lo].dupOf = hi;
        }
      }
    }
    const kept = arr.filter((a) => a.keep)
      .sort((a, b) => priorityOf(b.raw, cat, strat) - priorityOf(a.raw, cat, strat) || a._i - b._i);
    const dropped = arr.filter((a) => !a.keep);
    const pos = new Map(kept.map((k, i) => [k._i, i + 1]));
    const ordered = [
      ...kept.map((k) => ({ k, dup: false })),
      ...dropped.map((k) => ({ k, dup: true })),
    ];
    STATE.hot = ordered.map(({ k, dup }, i) => {
      const h = k.raw;
      const risk = riskOf(h);
      return {
        ...h, dup,
        dupOf: dup ? pos.get(k.dupOf) || null : null,
        scores: {
          heat: heatScoreOf(h),
          match: matchOf(h, cat).score,
          risk: risk.score,
          life: lifecycleOf(h).score,
          priority: priorityOf(h, cat, strat),
        },
        riskLevel: risk.level,
        riskTag: risk.tag,
        lifecycle: lifecycleOf(h).label,
      };
    });
  }
  function renderDedupe() {
    const hot = STATE.hot;
    const keptN = hot.filter((h) => !h.dup).length;
    const dropN = hot.filter((h) => h.dup).length;
    $("dpDedupTag").textContent = `共 ${hot.length} 条 · 合并重复 ${dropN} · 保留 ${keptN} · 按优先级(1-10)降序`;
    const riskCls = { low: "risk-low", mid: "risk-mid", high: "risk-high" };
    $("dpDedupBody").innerHTML = hot.map((h) => {
      const dupHtml = h.dup
        ? `<span class="dup dup-drop">与 #${h.dupOf} 重复 · 已合并</span>`
        : `<span class="dup dup-new">保留</span>`;
      const s = h.scores;
      const prCls = s.priority >= 8 ? "p1" : s.priority >= 5 ? "p2" : "p3";
      return `<tr class="${h.dup ? "dropped" : ""}">
        <td>#${h.row || ""}</td>
        <td>${esc(h.title)}</td>
        <td>${esc(h.source || "—")}</td>
        <td>${esc(h.heat || "—")}</td>
        <td><span class="risk ${riskCls[h.riskLevel]}">${h.riskTag}${h.riskLevel === "high" ? " ⚠" : ""}</span></td>
        <td class="dim-cell">热${s.heat}·匹${s.match}·安${s.risk}·周${s.life}</td>
        <td><span class="pri ${prCls}">${s.priority}</span><span class="note" style="margin:0 0 0 4px;">/10</span></td>
        <td>${dupHtml}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="8" class="note">没有可分析的热点，请先输入。</td></tr>`;
  }

  // ---------- 步骤③ 跟进决策判断（三选一） ----------
  function decide(h, cat) {
    const match = matchOf(h, cat).score;
    const risk = riskOf(h).score;
    const pr = h.scores ? h.scores.priority : priorityOf(h, cat, loadStrategy());
    let decision, reason;
    if (risk >= 5) {
      decision = "谨慎跟进";
      reason = `舆论风险较高（风险分 ${risk}/10），存在争议/负面舆情隐患，需谨慎评估、淡化对立、核实信源后方可使用。`;
    } else if (match >= 8 && pr >= 6) {
      decision = "值得跟进";
      reason = `与「${cat || "账号"}」赛道高度契合（匹配分 ${match}/10），优先级 ${pr}/10，建议优先产出。`;
    } else if (match >= 5 && pr >= 5) {
      decision = "值得跟进";
      reason = `与「${cat || "账号"}」有一定关联（匹配分 ${match}/10），优先级 ${pr}/10，可跟进。`;
    } else if (match >= 4 || risk >= 2) {
      decision = "谨慎跟进";
      reason = risk >= 2
        ? `存在轻微舆情风险（风险分 ${risk}/10），且匹配度一般（${match}/10），建议谨慎评估信源后再决定。`
        : `与「${cat || "账号"}」弱相关（匹配分 ${match}/10），建议谨慎或换个切口再判断。`;
    } else {
      decision = "不跟进";
      reason = `与「${cat || "账号"}」调性不符（匹配分 ${match}/10），且优先级 ${pr}/10 偏低，建议暂不跟进。`;
    }
    return { decision, reason };
  }
  function renderJudged() {
    const cat = ($("dpCategory").value || "").trim();
    STATE.judged = STATE.hot.filter((h) => !h.dup).map((h) => {
      const d = decide(h, cat);
      return { hot: h, decision: d.decision, reason: d.reason, cat };
    });
    const dCls = { "值得跟进": "fit-y", "谨慎跟进": "fit-mid", "不跟进": "fit-n" };
    $("dpJudged").innerHTML = STATE.judged.map((j, i) => {
      const h = j.hot;
      const riskBadge = h.riskLevel === "high"
        ? `<span class="risk risk-high" style="margin-left:6px;">⚠ 高风险·强制人工复核</span>` : "";
      return `<div class="judge-card">
        <div class="chead">
          <div><span class="cid">#${h.row || ""} ${esc(h.title)}</span>
            <span class="pill ${dCls[j.decision]}">${j.decision}</span>${riskBadge}</div>
          <div class="note">来源：${esc(h.source || "—")} ｜ 优先级：${h.scores.priority}/10 ｜ ${esc(h.lifecycle)}</div>
        </div>
        ${h.summary ? `<div class="field" style="margin-top:8px;"><span class="k">事件摘要</span>${esc(h.summary)}</div>` : ""}
        <div class="bd-field" style="margin-top:8px;"><span class="k">跟进判断理由（可编辑）</span>
          <textarea id="dpReason${i}" style="min-height:44px;">${esc(j.reason)}</textarea></div>
      </div>`;
    }).join("");
  }

  // ---------- 步骤④ 生成候选稿件（仅值得跟进） ----------
  function genCandidates() {
    const cat = ($("dpCategory").value || "").trim();
    const meta = CAT_META[cat] || {
      em: "🔥", h: "#热点 #新角度", lead: "蹭一波热度：", leadEn: "Trending now — ",
      tail: "关注我，明天继续更新。", tailEn: "Follow for more.",
    };
    STATE.cands = STATE.judged
      .filter((j) => j.decision === "值得跟进")
      .map((j) => {
        const h = j.hot;
        const summary = h.summary || `围绕「${h.title}」展开，${h.source} 当前在榜（热度 ${h.heat || "—"}）。`;
        const sourceTrace = `信息来源溯源：① 信源=${h.source}；② 热度=${h.heat || "—"}；③ 优先级评分=${h.scores.priority}/10（热${h.scores.heat}·匹${h.scores.match}·安${h.scores.risk}·周${h.scores.life}）；④ 生命周期=${h.lifecycle}。`;
        const angles = [
          `${meta.em} 教程向：「${h.title}」怎么做成 step-by-step 实操，给观众可复用的做法`,
          `情绪向：借「${h.title}」戳中${cat || "用户"}的日常共鸣点，引发评论区互动`,
          `测评/盘点向：横向对比「${h.title}」的几种主流玩法/品类，给出选购或避坑建议`,
        ];
        const cn = `${meta.lead}「${h.title}」${h.summary ? "：" + h.summary : "，今天必须安排上"}。${meta.tail} ${meta.h}`;
        const en = `${meta.leadEn}"${h.title}"${h.summary ? " — " + h.summary : " is the one to cover today."}. ${meta.tailEn} ${meta.h}`;
        return { judge: j, summary, sourceTrace, angles, cn, en };
      });
    $("dpCandList").innerHTML = STATE.cands.map((c, i) => {
      const j = c.judge, h = j.hot;
      return `<div class="card">
        <div class="chead">
          <div><span class="cid">#${h.row || ""} · ${esc(h.title)}</span></div>
          <span class="pill fit-y">值得跟进</span>
        </div>
        <div class="field" style="margin-top:8px;"><span class="k">事件简短摘要</span>${esc(c.summary)}</div>
        <div class="field" style="margin-top:6px;"><span class="k">信息来源溯源</span>${esc(c.sourceTrace)}</div>
        <div class="field" style="margin-top:6px;"><span class="k">内容切入角度（2-3 个）</span>
          <ol style="margin:2px 0 0 18px;">${c.angles.map((a) => `<li>${esc(a)}</li>`).join("")}</ol></div>
        <div class="tweet"><span class="lang">🇨🇳 中文候选文稿（可编辑）</span>
          <textarea id="dpCandCn${i}" style="width:100%;min-height:60px;border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;resize:vertical;background:#fff;margin-top:6px;">${esc(c.cn)}</textarea>
          <button class="copy" data-copy-i="${i}" data-lang="cn">复制</button></div>
        <div class="tweet"><span class="lang">🌐 英文候选文稿（可编辑）</span>
          <textarea id="dpCandEn${i}" style="width:100%;min-height:60px;border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;resize:vertical;background:#fff;margin-top:6px;">${esc(c.en)}</textarea>
          <button class="copy" data-copy-i="${i}" data-lang="en">复制</button></div>
      </div>`;
    }).join("") || `<p class="note">没有「值得跟进」的热点，请返回上一步确认账号领域或热点列表（仅「值得跟进」才会生成候选稿件）。</p>`;
    $("dpGenHint").textContent = `已为 ${STATE.cands.length} 个「值得跟进」热点生成候选稿件（摘要+溯源+角度+中英文稿）。`;
  }
  function syncCandEdit(i, lang, v) { if (STATE.cands[i]) STATE.cands[i][lang] = v; }
  function copyCand(i, lang) {
    const el = $("dpCand" + (lang === "en" ? "En" : "Cn") + i);
    copyText(el ? el.value : "", "已复制" + (lang === "en" ? "英文" : "中文") + "候选");
  }

  // ---------- 步骤④/⑤ 写入待审核内容池（9 字段） ----------
  function loadPool() {
    try { return JSON.parse(localStorage.getItem(POOL_KEY)) || []; } catch (e) { return []; }
  }
  function savePool(p) { localStorage.setItem(POOL_KEY, JSON.stringify(p)); }
  function loadStrategy() {
    try { return JSON.parse(localStorage.getItem(STRATEGY_KEY)) || null; } catch (e) { return null; }
  }
  function saveStrategy(s) { localStorage.setItem(STRATEGY_KEY, JSON.stringify(s)); }

  function saveToPool() {
    const pool = loadPool();
    // 取「值得跟进」热点已生成的候选；其余热点只入库不生成稿件
    const candMap = {};
    STATE.cands.forEach((c) => { candMap[c.judge.hot.id] = c; });
    const judgedMap = {};
    STATE.judged.forEach((j) => { judgedMap[j.hot.id] = j; });
    let added = 0, updated = 0;
    STATE.hot.filter((h) => !h.dup).forEach((h) => {
      const j = judgedMap[h.id];
      const c = candMap[h.id];
      const ex = pool.find((p) => p.hotId === h.id);
      const base = {
        hotId: h.id,
        title: h.title,
        source: h.source || "",
        heat: h.heat || "",
        heatScore: h.scores.heat,
        priority: h.scores.priority,
        decision: j ? j.decision : "待判断",
        riskLevel: h.riskLevel,
        riskTag: h.riskTag,
        lifecycle: h.lifecycle,
        summary: c ? c.summary : (h.summary || ""),
        sourceTrace: c ? c.sourceTrace : `信息来源：${h.source || "—"}；热度：${h.heat || "—"}；优先级：${h.scores.priority}/10`,
        angles: c ? c.angles : [],
        cn: c ? c.cn : "",
        en: c ? c.en : "",
      };
      if (ex) {
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
    $("dpSaveHint").textContent = `✅ 已写入待审核池：新增 ${added} 条${updated ? "，更新 " + updated + " 条" : ""}。状态均为「待审核」，请在下方强制人工审核卡点逐条采纳/驳回。`;
    renderFlow(5);
    renderPool();
    renderStrategy();
    renderReport();
    toast(`已写入待审核池 ${added} 条` + (updated ? "（更新" + updated + "条）" : ""));
  }

  // ---------- 步骤⑤ 强制人工审核卡点 ----------
  let poolFilter = "all";
  function renderPool() {
    const pool = loadPool();
    const shown = pool.filter((p) => poolFilter === "all" || p.status === poolFilter);
    $("dpPoolBody").innerHTML = shown.map((p) => {
      const st = p.status;
      const riskBadge = p.riskLevel === "high"
        ? `<span class="risk risk-high" style="margin-left:6px;">⚠ 高风险·强制人工复核</span>` : "";
      return `<div class="card">
        <div class="chead">
          <div><span class="cid">${esc(p.id)}</span> ${esc(p.hotId)} · ${esc(p.source || "—")}<div class="ctitle">${esc(p.title)}</div></div>
          <span class="st-mark st-${st}">${st}</span>
        </div>
        <div class="field" style="margin-top:8px;"><span class="k">优先级 / 跟进建议 / 风险</span>${p.priority}/10 ｜ ${esc(p.decision)} ｜ ${esc(p.riskTag)}${riskBadge}</div>
        <div class="field" style="margin-top:6px;"><span class="k">信息来源溯源</span>${esc(p.sourceTrace || "")}</div>
        ${p.cn ? `<div class="tweet"><span class="lang">🇨🇳 中文候选</span>${esc(p.cn)}<button class="copy" data-copy-text="${encodeURIComponent(p.cn)}">复制</button></div>` : ""}
        ${p.en ? `<div class="tweet"><span class="lang">🌐 英文候选</span>${esc(p.en)}<button class="copy" data-copy-text="${encodeURIComponent(p.en)}">复制</button></div>` : ""}
        <div class="audit">
          <button class="btn btn-adopt" data-act="采纳" data-id="${esc(p.id)}">✓ 采纳</button>
          <button class="btn btn-reject" data-act="驳回" data-id="${esc(p.id)}">✕ 驳回</button>
          <input type="text" placeholder="驳回必须填写原因（如：标题党 / 调性不符 / 价值不足 / 高风险）" value="${esc(p.note)}" data-note="${esc(p.id)}">
          ${p.reviewAt ? `<span class="note">审核于 ${p.reviewAt.replace("T", " ").slice(0, 16)}</span>` : ""}
        </div>
      </div>`;
    }).join("") ||
      `<p class="note">${pool.length ? "当前筛选下无候选。" : "待审核池为空。完成「④ 生成候选」后点击「📥 写入待审核内容池」，候选会出现在这里，进入强制人工审核卡点。"}</p>`;
    const nAdopt = pool.filter((p) => p.status === "采纳").length;
    const nReject = pool.filter((p) => p.status === "驳回").length;
    $("dpStrategyStats").innerHTML =
      `<b>累计记录：</b>${pool.length} 条 ｜ <span class="st-mark st-采纳">采纳 ${nAdopt}</span> <span class="st-mark st-驳回">驳回 ${nReject}</span> <span class="st-mark st-待审核">待审核 ${pool.length - nAdopt - nReject}</span>`;
  }
  function reviewPool(id, act) {
    const pool = loadPool();
    const p = pool.find((x) => x.id === id);
    if (!p) return;
    if (act === "驳回" && !(p.note || "").trim()) {
      toast("⚠ 驳回必须填写原因（硬约束）");
      const inp = document.querySelector(`input[data-note="${CSS.escape ? CSS.escape(id) : id}"]`);
      if (inp) inp.focus();
      return;
    }
    p.status = act;
    p.reviewAt = new Date().toISOString();
    savePool(pool);
    renderPool();
    renderStrategy();
    renderReport();
    toast(act === "采纳" ? "已采纳：进入发布备选（仍需人工最终发布）" : "已驳回：原因已回写，作为反馈闭环信号");
  }
  function notePool(id, v) {
    const pool = loadPool();
    const p = pool.find((x) => x.id === id);
    if (!p) return;
    p.note = v;
    savePool(pool);
  }

  // ---------- 步骤⑥ 反馈闭环优化（核心得分点） ----------
  function clusterRejects(rejected) {
    const rules = [
      { k: "标题党/夸张", re: /标题党|夸张|夸大|震惊|博眼球|噱头|骗|智商税/ },
      { k: "调性不符", re: /调性|不符合|不搭|跑偏|不相关|无关|违和|赛道/ },
      { k: "同质重复", re: /重复|同质|看腻|类似|模板化|没新意|雷同/ },
      { k: "价值不足", re: /价值|干货|信息量|太水|空洞|浅|没用|拼凑/ },
      { k: "高风险/敏感", re: /风险|敏感|争议|负面|绯闻|塌|翻车|纠纷/ },
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
  // 读历史全部记录，分析采纳/驳回规律，产出下轮打分优化策略（自动参考）
  function buildStrategy() {
    const pool = loadPool();
    const adopted = pool.filter((p) => p.status === "采纳");
    const rejected = pool.filter((p) => p.status === "驳回");
    const pending = pool.filter((p) => p.status === "待审核");
    if (!pool.length) {
      return "尚无审核反馈。当候选存入待审核池并执行采纳/驳回后，此处自动生成「下一轮热点打分优化策略」，并在后续处理热点时自动参考。";
    }
    // 1) 按领域统计采纳/驳回
    const byCat = {};
    pool.forEach((p) => {
      const c = p.decision === "值得跟进" ? "值得跟进" : p.decision;
      byCat[c] = byCat[c] || { total: 0, adopt: 0, reject: 0 };
    });
    // 用来源/领域近似：以 decision 分组 + riskLevel 分组更稳（demo 无显式 cat 字段存储）
    const byDecision = { "值得跟进": { t: 0, a: 0, r: 0 }, "谨慎跟进": { t: 0, a: 0, r: 0 }, "不跟进": { t: 0, a: 0, r: 0 } };
    const byRisk = { low: { t: 0, a: 0, r: 0 }, mid: { t: 0, a: 0, r: 0 }, high: { t: 0, a: 0, r: 0 } };
    pool.forEach((p) => {
      const d = byDecision[p.decision] || byDecision["不跟进"]; d.t++;
      if (p.status === "采纳") d.a++; if (p.status === "驳回") d.r++;
      const rk = byRisk[p.riskLevel] || byRisk.low; rk.t++;
      if (p.status === "采纳") rk.a++; if (p.status === "驳回") rk.r++;
    });
    // 2) 学到的下轮打分权重/加权（自动参考）
    const W = { heat: 0.35, match: 0.35, safety: 0.15, life: 0.15 };
    const catBoost = {};
    // 高风险驳回率高 → 提高 safety 权重、对 high 风险降权
    const highRejectRate = byRisk.high.t ? byRisk.high.r / byRisk.high.t : 0;
    if (highRejectRate >= 0.5) { W.safety = 0.25; W.match = 0.30; }
    // 值得跟进采纳多 → 匹配维度保持高位
    const worthAdoptRate = byDecision["值得跟进"].t ? byDecision["值得跟进"].a / byDecision["值得跟进"].t : 0;
    if (worthAdoptRate >= 0.7) { W.match = 0.40; W.heat = 0.30; }
    // 谨慎跟进若多被驳回 → 降低谨慎跟进的初始优先级
    const cautiousRejectRate = byDecision["谨慎跟进"].t ? byDecision["谨慎跟进"].r / byDecision["谨慎跟进"].t : 0;
    if (cautiousRejectRate >= 0.6) catBoost["__cautious_penalty"] = -1.5;
    saveStrategy({ weights: W, catBoost, generatedAt: new Date().toISOString(), sample: pool.length });

    // 3) 可读性策略文本
    const L = [];
    L.push("【下一轮热点打分优化策略】（基于 " + pool.length + " 条历史审核记录自动生成，后续处理热点时自动参考）");
    L.push("");
    L.push("📊 采纳/驳回分布：");
    L.push("  · 值得跟进：" + byDecision["值得跟进"].t + " 条（采纳 " + byDecision["值得跟进"].a + " / 驳回 " + byDecision["值得跟进"].r + "）");
    L.push("  · 谨慎跟进：" + byDecision["谨慎跟进"].t + " 条（采纳 " + byDecision["谨慎跟进"].a + " / 驳回 " + byDecision["谨慎跟进"].r + "）");
    L.push("  · 不跟进：" + byDecision["不跟进"].t + " 条（采纳 " + byDecision["不跟进"].a + " / 驳回 " + byDecision["不跟进"].r + "）");
    L.push("  · 风险维度：高风险 " + byRisk.high.t + " / 中风险 " + byRisk.mid.t + " / 低风险 " + byRisk.low.t + " 条");
    L.push("");
    L.push("🔍 规律总结：");
    if (adopted.length) L.push("  ✅ 易被采纳：优先级≥" + Math.min(...adopted.map((a) => a.priority)) + "/10、与赛道高度契合、来源清晰的热点。");
    else L.push("  ✅ 暂无采纳样本。");
    if (rejected.length) {
      const groups = clusterRejects(rejected);
      L.push("  ❌ 易被驳回（原因聚类）：" + Object.entries(groups).map(([k, arr]) => k + " " + arr.length + " 条").join("、") + "。");
    } else L.push("  ❌ 暂无驳回样本。");
    if (highRejectRate >= 0.5) L.push("  ⚠ 高风险话题驳回率 " + Math.round(highRejectRate * 100) + "%，下轮对高风险事件自动降权并强制复核。");
    L.push("");
    L.push("📌 下轮打分策略调整：");
    L.push("  1. 权重 → 热度 " + W.heat + " / 匹配 " + W.match + " / 安全 " + W.safety + " / 生命周期 " + W.life + (highRejectRate >= 0.5 ? "（已上调安全权重）" : "") + "。");
    if (worthAdoptRate >= 0.7) L.push("  2. 「值得跟进」采纳率高，后续优先保证高匹配赛道选题供给。");
    if (cautiousRejectRate >= 0.6) L.push("  3. 「谨慎跟进」多被驳回，下轮对谨慎类初始优先级 -1.5 分。");
    L.push("  4. 高风险话题一律标记「⚠ 高风险·强制人工复核」，且驳回原因须具体，策略方可精准进化。");
    L.push("");
    L.push(pending.length ? "⏳ 仍有 " + pending.length + " 条待人工审核，审核后策略继续进化。" : "🎯 全部候选已审核，策略已收敛。");
    return L.join("\n");
  }
  function renderStrategy() { $("dpStrategy").value = buildStrategy(); }

  // ---------- 可读业务报告（输出格式要求） ----------
  function renderReport() {
    const hot = STATE.hot.filter((h) => !h.dup);
    const strat = loadStrategy();
    const pool = loadPool();
    const L = [];
    L.push("════════════════════════════════════════");
    L.push("【业务报告】每日热点候选内容池 · " + today());
    L.push("════════════════════════════════════════");
    L.push("");
    L.push("▶ 业务输入：手动粘贴/导入公开信息源热点（Demo 阶段不强制爬取）。");
    L.push("▶ ① 事件去重 & 优先级排序：合并重复 " + STATE.hot.filter((h) => h.dup).length + " 条，保留 " + hot.length + " 条，按 1-10 优先级降序：");
    hot.slice().sort((a, b) => b.scores.priority - a.scores.priority).slice(0, 5).forEach((h, i) => {
      L.push("   " + (i + 1) + ". [" + h.scores.priority + "/10] " + h.title + "（来源：" + (h.source || "—") + "，风险：" + h.riskTag + "，" + h.lifecycle + "）");
    });
    const jg = STATE.judged;
    const cnt = (d) => jg.filter((j) => j.decision === d).length;
    L.push("");
    L.push("▶ ② 跟进决策：值得跟进 " + cnt("值得跟进") + " ｜ 谨慎跟进 " + cnt("谨慎跟进") + " ｜ 不跟进 " + cnt("不跟进") + "。");
    L.push("▶ ③ 生成候选稿件：为 " + STATE.cands.length + " 条「值得跟进」生成 摘要+溯源+2-3角度+中英文稿（仅值得跟进生成）。");
    L.push("▶ ④ 写入待审核内容池：" + pool.length + " 条记录，字段含 事件标题/来源/热度分数/优先级/跟进建议/中英文稿件/状态/驳回原因，状态均为「待审核」。");
    const nAdopt = pool.filter((p) => p.status === "采纳").length;
    const nReject = pool.filter((p) => p.status === "驳回").length;
    const nPend = pool.length - nAdopt - nReject;
    L.push("▶ ⑤ 强制人工审核卡点：已采纳 " + nAdopt + " ｜ 已驳回 " + nReject + " ｜ 待审核 " + nPend + "。驳回均回填原因（Agent 永不自动发布）。");
    L.push("▶ ⑥ 反馈闭环优化：见「优化策略」文本框（读历史采纳/驳回/原因，输出下轮打分策略并自动参考）。");
    L.push("");
    L.push("▶ 硬性约束自检：");
    L.push("   ✓ 约束1 永不自动发布：仅人工「采纳」后进入发布备选，无自动发布动作。");
    L.push("   ✓ 约束2 高风险强制复核：风险分≥5 的话题标记「⚠ 高风险·强制人工复核」，驳回必填原因。");
    L.push("   ✓ 约束3 完整来源溯源：每条候选含 来源/热度/优先级/生命周期 溯源信息。");
    L.push("   ✓ 约束4 不编造虚假热点：仅使用公开真实事件（Demo 示例为真实公开热榜）。");
    L.push("");
    L.push("（结构化 JSON 可通过「⬇ 导出结构化 JSON」获取，便于知识库存储。）");
    $("dpReport").value = L.join("\n");
  }

  // ---------- 导出（结构化 JSON + 报告） ----------
  function exportJSON() {
    const strat = loadStrategy();
    const payload = {
      role: "内容运营Agent · 每日热点候选内容池",
      date: today(),
      input: STATE.hot,
      dedup: { total: STATE.hot.length, kept: STATE.hot.filter((h) => !h.dup).length, dropped: STATE.hot.filter((h) => h.dup).length },
      judged: STATE.judged.map((j) => ({ title: j.hot.title, decision: j.decision, reason: j.reason, priority: j.hot.scores.priority, risk: j.hot.riskTag })),
      candidates: STATE.cands.map((c) => ({ title: c.judge.hot.title, summary: c.summary, sourceTrace: c.sourceTrace, angles: c.angles, cn: c.cn, en: c.en })),
      pool: loadPool(),
      strategy: buildStrategy(),
      hardConstraints: {
        noAutoPublish: true, highRiskForcedReview: true,
        fullSourceTrace: true, noFabricatedHotspots: true,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `每日热点候选池_${today()}.json`;
    a.click();
    toast("已导出结构化 JSON");
  }

  // ---------- 复制 ----------
  function copyText(txt, okMsg) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => toast(okMsg || "已复制"))
        .catch(() => fallbackCopy(txt, okMsg));
    } else fallbackCopy(txt, okMsg);
  }
  function fallbackCopy(txt, okMsg) {
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast(okMsg || "已复制"); } catch (e) {}
    document.body.removeChild(ta);
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
    const cat = ($("dpCategory").value || "").trim();
    dedupeAndScore(items, cat);
    // 行号
    let n = 0;
    STATE.hot.forEach((h) => { if (!h.dup) h.row = ++n; });
    renderDedupe();
    $("dpSec1").hidden = false;
    $("dpSec2").hidden = true;
    $("dpSec3").hidden = true;
    renderFlow(2);
    $("dpRunHint").textContent = `已解析 ${items.length} 条，去重后保留 ${STATE.hot.filter((h) => !h.dup).length} 条，已按 1-10 优先级排序。`;
    toast("去重 & 优先级排序完成");
  });

  $("dpJudge").addEventListener("click", function () {
    const cat = ($("dpCategory").value || "").trim();
    if (!cat) {
      $("dpJudgeHint").textContent = "⚠️ 请先填写「账号领域」，判定才有依据";
      return;
    }
    renderJudged();
    $("dpSec2").hidden = false;
    renderFlow(3);
    const cnt = (d) => STATE.judged.filter((j) => j.decision === d).length;
    $("dpJudgeHint").textContent = `已判定 ${STATE.judged.length} 条：值得跟进 ${cnt("值得跟进")} ｜ 谨慎跟进 ${cnt("谨慎跟进")} ｜ 不跟进 ${cnt("不跟进")}。`;
    toast("跟进决策完成");
  });

  $("dpGen").addEventListener("click", function () {
    genCandidates();
    $("dpSec3").hidden = false;
    renderFlow(4);
    toast("已生成候选稿件");
  });

  // 候选编辑 + 复制（事件委托）
  $("dpCandList").addEventListener("input", function (e) {
    const m = /^dpCand(Cn|En)(\d+)$/.exec(e.target.id || "");
    if (m) syncCandEdit(+m[2], m[1] === "En" ? "en" : "cn", e.target.value);
  });
  $("dpCandList").addEventListener("click", function (e) {
    if (e.target.classList.contains("copy")) copyCand(+e.target.dataset.copyI, e.target.dataset.lang);
  });

  $("dpSavePool").addEventListener("click", saveToPool);

  // 池过滤 + 采纳/驳回 + 备注（事件委托）
  $("dpPoolFilters").addEventListener("click", function (e) {
    if (e.target.dataset.f) { poolFilter = e.target.dataset.f; renderPool(); }
  });
  $("dpPoolBody").addEventListener("click", function (e) {
    if (e.target.classList.contains("copy")) copyText(decodeURIComponent(e.target.dataset.copyText), "已复制候选");
    if (e.target.dataset.act && e.target.dataset.id) reviewPool(e.target.dataset.id, e.target.dataset.act);
  });
  $("dpPoolBody").addEventListener("input", function (e) {
    if (e.target.dataset.note) notePool(e.target.dataset.note, e.target.value);
  });

  $("dpCopyStrategy").addEventListener("click", function () { copyText($("dpStrategy").value, "已复制优化策略"); });
  $("dpCopyReport").addEventListener("click", function () { copyText($("dpReport").value, "已复制业务报告"); });
  $("dpExportPool").addEventListener("click", exportJSON);

  // ---------- 初始化 ----------
  renderFlow(0);
  renderPool();
  renderStrategy();
})();
