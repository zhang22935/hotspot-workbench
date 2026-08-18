// breakdown.js —— 爆款内容拆解 & 二次创作 模块（纯静态，无后端）
// 严格 8 步流程：样本对比 → 7维拆解 → 流量驱动因子 → 可复用模板 → 3条原创候选 → 资产库 → 强制人工审核 → 闭环/输出
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const ASSET_KEY = "muxu_bd_assets";

  // ---------- 导航：切换页面 ----------
  function switchPage(p) {
    document.querySelectorAll(".side-item").forEach((s) =>
      s.classList.toggle("active", s.dataset.page === p)
    );
    $("page-pool").hidden = p !== "pool";
    $("page-breakdown").hidden = p !== "breakdown";
  }
  document.querySelectorAll(".side-item").forEach((s) =>
    s.addEventListener("click", () => switchPage(s.dataset.page))
  );

  function toast(m) {
    const t = $("toast");
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("show"), 1600);
  }

  // ---------- 文本分析 ----------
  function splitSamples(txt) {
    return (txt || "")
      .split(/\n\s*-{3,}\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  function analyze(t) {
    if (!t) return null;
    const chars = t.replace(/\s/g, "").length;
    const sentences = t
      .split(/[。！？!?\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);
    const sc = sentences.length;
    const first = t.slice(0, 40);
    const hasQuestionHook =
      /[?？]/.test(first) ||
      /为什么|怎么|如何|揭秘|震惊|千万别|你一定|是不是|敢不敢|凭什么/.test(first);
    const emojiCount =
      (t.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu) ||
        []).length;
    const hasCTA =
      /点赞|关注|转发|评论|收藏|双击|下期|关注我|点个|记得|别忘|主页/.test(t);
    const infoPoints =
      (t.match(/[1-9]、|①|②|③|④|⑤|第一|第二|首先|其次|其一|其二|•\s|\d\.\s/g) ||
        []).length;
    const paras = t.split(/\n+/).filter((s) => s.trim()).length;
    const hasPain = /痛点|踩坑|别再|后悔|难|烦|焦虑|崩溃|误区|翻车/.test(t);
    const hasTurn = /没想到|结果|竟然|反转|但|可是|后来|其实/.test(t);
    return {
      chars,
      sc,
      hasQuestionHook,
      emoji: emojiCount,
      hasCTA,
      infoPoints,
      paras,
      hasPain,
      hasTurn,
      density: sc ? +(infoPoints / sc).toFixed(2) : 0,
    };
  }
  function avg(arr, key) {
    const v = arr.map((a) => a[key]).filter((x) => typeof x === "number");
    return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : 0;
  }
  function pct(arr, key) {
    const v = arr.filter((a) => a && a[key]);
    return arr.length ? Math.round((v.length / arr.length) * 100) : 0;
  }

  const STATE = { viral: [], normal: [], vA: [], nA: [], best: "", assetId: null, candidates: [] };

  // ---------- 步骤1：样本对比 ----------
  function renderCompare() {
    const v = STATE.vA, n = STATE.nA;
    const rows = [
      ["样本数", STATE.viral.length, STATE.normal.length, "—"],
      ["平均字数", avg(v, "chars"), avg(n, "chars"), "字数差异"],
      ["平均句数", avg(v, "sc"), avg(n, "sc"), "叙事长度"],
      ["疑问Hook占比", pct(v, "hasQuestionHook") + "%", pct(n, "hasQuestionHook") + "%", "开头钩子"],
      ["Emoji均值", avg(v, "emoji"), avg(n, "emoji"), "情绪密度"],
      ["CTA占比", pct(v, "hasCTA") + "%", pct(n, "hasCTA") + "%", "行动引导"],
      ["信息点均值", avg(v, "infoPoints"), avg(n, "infoPoints"), "信息密度"],
      ["信息密度(点/句)", avg(v, "density"), avg(n, "density"), "节奏"],
    ];
    let h =
      '<table class="bd-compare"><thead><tr><th>对比维度</th><th>🔥 爆款</th><th>🟢 普通</th><th>说明</th></tr></thead><tbody>';
    rows.forEach(
      (r) =>
        (h += `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td><td class="note">${r[3]}</td></tr>`)
    );
    h += "</tbody></table>";
    $("bdCompare").innerHTML = h;
  }

  // ---------- 步骤2：7维拆解 ----------
  function renderBreak() {
    const b = STATE.best, a = analyze(b);
    const firstLine = (b.split(/[。\n]/)[0] || "").slice(0, 40);
    const pain = a.hasPain ? "存在痛点/情绪词，直击用户焦虑" : "未明显命中痛点，建议补充";
    const hook = a.hasQuestionHook
      ? "疑问式开头（反问/设问）制造好奇缺口"
      : "非疑问式，可改为痛点反问提升停留";
    const struct = `${a.hasTurn ? "含转折/反转设计" : "缺少明显转折"}；${a.paras} 个段落层次`;
    const cta = a.hasCTA ? "结尾含明确行动引导（点赞/关注/收藏）" : "结尾缺 CTA，建议补充";
    const interact = /评论|说说|你觉得|聊聊|猜|留言/.test(b)
      ? "主动设问引导评论互动"
      : "互动引导偏弱，可增加“你怎么看”类提问";
    const dims = [
      ["选题：核心主题 / 用户痛点", firstLine + " …｜" + pain],
      ["Hook：开头钩子设计", hook],
      ["结构：开篇/展开/转折/收尾", struct],
      ["信息密度：信息点 / 节奏", `信息点 ${a.infoPoints} 个，密度 ${a.density} 点/句`],
      ["CTA：结尾行动引导", cta],
      ["互动设计：评论/点赞引导", interact],
      ["情绪/记忆点", a.emoji > 0 ? `Emoji ${a.emoji} 个强化情绪` : "可加入情绪符号/金句"],
    ];
    let h =
      "<thead><tr><th>维度</th><th>拆解（可编辑）</th></tr></thead><tbody>";
    dims.forEach(
      (d, i) =>
        (h += `<tr><td><b>${d[0]}</b></td><td><textarea data-dim="${i}" style="width:100%;border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;resize:vertical;min-height:56px;background:#fff;">${d[1]}</textarea></td></tr>`)
    );
    h += "</tbody>";
    $("bdBreak").innerHTML = h;
  }

  // ---------- 步骤3：流量驱动因子 ----------
  function renderDrivers() {
    const v = STATE.vA, n = STATE.nA;
    const sugg = [];
    if (pct(v, "hasQuestionHook") > pct(n, "hasQuestionHook"))
      sugg.push(
        `疑问式Hook（爆款 ${pct(v, "hasQuestionHook")}% vs 普通 ${pct(n, "hasQuestionHook")}%）`
      );
    if (avg(v, "emoji") > avg(n, "emoji") + 0.5)
      sugg.push(`更高情绪密度（Emoji 均值 ${avg(v, "emoji")} vs ${avg(n, "emoji")}）`);
    if (avg(v, "infoPoints") > avg(n, "infoPoints"))
      sugg.push(`更密集的信息点（${avg(v, "infoPoints")} vs ${avg(n, "infoPoints")}）`);
    if (pct(v, "hasCTA") >= pct(n, "hasCTA"))
      sugg.push(`明确的结尾CTA（${pct(v, "hasCTA")}% 含行动引导）`);
    if (avg(v, "density") > avg(n, "density"))
      sugg.push(`更紧凑的叙事节奏（密度 ${avg(v, "density")} vs ${avg(n, "density")}）`);
    $("bdDriverCopy").value = sugg.length
      ? sugg.join("；\n") + "\n（以上为可复制因素，请人工确认）"
      : "未检测到显著差异，请人工判断可复制因素。";
    $("bdDriverConclusion").value =
      "结论：真正带来高表现的可复制因素为上述项；运气因素（如平台偶然推荐、节点热点）已排除，不计入模板。";
  }

  // ---------- 步骤4：可复用结构模板 ----------
  function renderTemplate() {
    const a = analyze(STATE.best);
    const hook = a.hasQuestionHook ? "痛点反问/设问" : "结果/反常识抛钩";
    $("bdTemplate").value =
      `【可复用内容结构模板】（仅框架，禁止复制原文）\n` +
      `1. 开篇Hook：${hook} —— 前 3 秒制造好奇/焦虑缺口\n` +
      `2. 展开：用 ①-③ 分点陈述 ${a.infoPoints || 3} 个信息点，每点配 1 个画面/案例\n` +
      `3. 转折：${a.hasTurn ? "设置认知反转/情绪点" : "加入一个反差或意外"}，拉停留\n` +
      `4. 收尾：共鸣金句 + 明确CTA（${a.hasCTA ? "已有CTA，沿用" : "补充点赞/关注/收藏引导"}）\n` +
      `5. 互动：结尾抛 1 个开放问题引导评论`;
  }

  // ---------- 步骤5：3条原创候选 ----------
  function genCandidates() {
    const acc = ($("bdAccount").value || "该账号").trim();
    const cat = ($("bdCategory").value || "所属领域").trim();
    const angles = [
      {
        name: "角度A · 痛点反问式",
        title: `为什么你的${cat}总是做不好？这${3}个坑别再踩`,
        struct: "反问开篇→分点罗列误区→反转给出解法→共鸣收尾+CTA",
      },
      {
        name: "角度B · 清单体",
        title: `${cat}必备的${3}个冷知识，第${2}个大多数人不知道`,
        struct: "结果钩子开篇→①-③分点干货→金句收尾→引导收藏",
      },
      {
        name: "角度C · 故事转折式",
        title: `我差点放弃${cat}，直到试了这一个动作`,
        struct: "反常场景开篇→中途翻车/转折→逆袭升华→行动引导",
      },
    ];
    STATE.candidates = angles;
    let h = "";
    angles.forEach((ag, i) => {
      h += `<div class="card">
        <div class="chead"><span class="cid">候选 ${i + 1}</span>
          <span class="risk risk-low" id="rk${i}">风险：低（框架级复用）</span></div>
        <div class="ctitle">${ag.name}</div>
        <div class="cgrid">
          <div class="field"><span class="k">标题框架（示例）</span>${ag.title}</div>
          <div class="field"><span class="k">结构骨架</span>${ag.struct}</div>
        </div>
        <div class="field" style="margin-top:10px;"><span class="k">✍️ 原创文案（请人工撰写，禁止复制原文）</span>
          <textarea id="cand${i}" style="width:100%;border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;resize:vertical;min-height:84px;background:#fff;" placeholder="在此撰写基于该框架的全新原创内容……"></textarea></div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
          <span class="note">抄袭风险标记：</span>
          <select id="risk${i}" onchange="document.getElementById('rk'+${i}).textContent='风险：'+this.value;document.getElementById('rk'+${i}).className='risk '+(this.value==='低'?'risk-low':this.value==='中'?'risk-mid':'risk-high');">
            <option value="低">低（框架级复用，非复制原文）</option>
            <option value="中">中（部分句式雷同，需改写）</option>
            <option value="高">高（与样本高度重合，禁用）</option>
          </select>
        </div>
      </div>`;
    });
    $("bdCandidates").innerHTML = h;
    toast("已生成 3 条原创候选框架，请人工撰写文案并标记风险");
    buildReport();
  }

  // ---------- 步骤6：资产库 ----------
  function loadAssets() {
    try {
      return JSON.parse(localStorage.getItem(ASSET_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function renderAssets() {
    const list = loadAssets();
    if (!list.length) {
      $("bdAssets").innerHTML = '<p class="note">资产库为空。完成分析后点击「保存当前分析到资产库」。</p>';
      return;
    }
    let h = "";
    list
      .slice()
      .reverse()
      .forEach((a) => {
        h += `<div class="asset">
        <div class="ah">
          <div><b>${a.account || "未命名账号"}</b> <span class="note">｜${a.date}｜${a.viralN}爆/${a.normalN}普</span></div>
          <span class="st-mark st-${a.status || "待审核"}">${a.status || "待审核"}</span>
        </div>
        <div class="note" style="margin-top:6px;">流量结论：${(a.conclusion || "").slice(0, 60)}${(a.conclusion || "").length > 60 ? "…" : ""}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <input id="perf_${a.id}" class="bd-input" style="min-height:34px;flex:1;min-width:200px;" placeholder="闭环预留：录入发布后数据表现（播放/点赞/转化…）">
          <button class="btn btn-ghost" onclick="savePerf('${a.id}')">保存表现</button>
        </div>
      </div>`;
      });
    $("bdAssets").innerHTML = h;
  }
  window.savePerf = function (id) {
    const list = loadAssets();
    const a = list.find((x) => x.id === id);
    if (!a) return;
    a.performance = $("perf_" + id).value;
    localStorage.setItem(ASSET_KEY, JSON.stringify(list));
    toast("已记录发布后数据表现（闭环迭代）");
    renderAssets();
  };
  function saveAsset() {
    const report = buildReportText();
    const id = "bd_" + Date.now();
    const asset = {
      id,
      account: ($("bdAccount").value || "").trim(),
      category: ($("bdCategory").value || "").trim(),
      date: new Date().toISOString().slice(0, 10),
      viralN: STATE.viral.length,
      normalN: STATE.normal.length,
      viralSamples: STATE.viral,
      normalSamples: STATE.normal,
      compare: {
        vChars: avg(STATE.vA, "chars"),
        nChars: avg(STATE.nA, "chars"),
        vHook: pct(STATE.vA, "hasQuestionHook"),
        nHook: pct(STATE.nA, "hasQuestionHook"),
      },
      break7: Array.from(document.querySelectorAll("#bdBreak textarea")).map((t) => t.value),
      driversCopy: $("bdDriverCopy").value,
      driversLuck: $("bdDriverLuck").value,
      conclusion: $("bdDriverConclusion").value,
      template: $("bdTemplate").value,
      candidates: STATE.candidates.map((c, i) => ({
        angle: c.name,
        title: c.title,
        struct: c.struct,
        copy: ($("cand" + i) ? $("cand" + i).value : ""),
        risk: ($("risk" + i) ? $("risk" + i).value : "低"),
      })),
      report,
      status: "待审核",
      performance: "",
    };
    const list = loadAssets();
    list.push(asset);
    localStorage.setItem(ASSET_KEY, JSON.stringify(list));
    STATE.assetId = id;
    $("bdSaveHint").textContent = "✅ 已保存到资产库（ID: " + id + "），请在步骤7人工审核。";
    renderAssets();
    buildReport();
    toast("已写入内容资产库");
  }

  // ---------- 步骤7：强制人工审核 ----------
  function review(pass) {
    if (!STATE.assetId) {
      $("bdReviewHint").textContent = "⚠️ 请先在步骤6保存资产后再审核。";
      return;
    }
    const list = loadAssets();
    const a = list.find((x) => x.id === STATE.assetId);
    if (!a) return;
    a.status = pass ? "通过" : "不通过";
    a.reviewNote = $("bdReviewNote").value || (pass ? "审核通过" : "未填理由");
    a.reviewAt = new Date().toISOString();
    localStorage.setItem(ASSET_KEY, JSON.stringify(list));
    $("bdReviewHint").textContent = pass
      ? "✅ 已审核通过，稿件可进入发布流程。"
      : "❌ 已标记不通过：" + a.reviewNote + "（已回写资产库）";
    renderAssets();
    buildReport();
    toast(pass ? "审核通过" : "已驳回");
  }

  // ---------- 步骤8：报告 + JSON ----------
  function buildReportText() {
    const acc = ($("bdAccount").value || "未命名账号").trim();
    const cat = ($("bdCategory").value || "未填领域").trim();
    const L = [];
    L.push("# 爆款内容拆解 & 二次创作报告");
    L.push(`- 账号：${acc}｜领域：${cat}｜日期：${new Date().toISOString().slice(0, 10)}`);
    L.push(`- 样本：爆款 ${STATE.viral.length} 条 / 普通 ${STATE.normal.length} 条`);
    L.push("");
    L.push("## 1. 样本对比分析（爆款 vs 普通）");
    L.push(
      `- 平均字数：爆款 ${avg(STATE.vA, "chars")} / 普通 ${avg(STATE.nA, "chars")}`
    );
    L.push(
      `- 疑问Hook占比：爆款 ${pct(STATE.vA, "hasQuestionHook")}% / 普通 ${pct(STATE.nA, "hasQuestionHook")}%`
    );
    L.push(
      `- Emoji均值：爆款 ${avg(STATE.vA, "emoji")} / 普通 ${avg(STATE.nA, "emoji")}`
    );
    L.push(
      `- CTA占比：爆款 ${pct(STATE.vA, "hasCTA")}% / 普通 ${pct(STATE.nA, "hasCTA")}%`
    );
    L.push(
      `- 信息点均值：爆款 ${avg(STATE.vA, "infoPoints")} / 普通 ${avg(STATE.nA, "infoPoints")}`
    );
    L.push("");
    L.push("## 2. 结构化深度拆解（7维）");
    Array.from(document.querySelectorAll("#bdBreak textarea")).forEach((t, i) => {
      const names = ["选题", "Hook", "结构", "信息密度", "CTA", "互动设计", "情绪/记忆点"];
      L.push(`- ${names[i] || "维度" + i}：${t.value}`);
    });
    L.push("");
    L.push("## 3. 流量驱动因子");
    L.push(`- 可复制因素：${($("bdDriverCopy").value || "").replace(/\n/g, "；")}`);
    L.push(`- 偶然/运气因素：${$("bdDriverLuck").value || "（待填）"}`);
    L.push(`- 结论：${$("bdDriverConclusion").value || "（待填）"}`);
    L.push("");
    L.push("## 4. 可复用内容结构模板");
    L.push(($("bdTemplate").value || "").replace(/\n/g, "\n"));
    L.push("");
    L.push("## 5. 二次原创候选（3条）");
    STATE.candidates.forEach((c, i) => {
      const copy = $("cand" + i) ? $("cand" + i).value : "";
      const risk = $("risk" + i) ? $("risk" + i).value : "低";
      L.push(`### 候选${i + 1} · ${c.name}`);
      L.push(`- 标题框架：${c.title}`);
      L.push(`- 结构：${c.struct}`);
      L.push(`- 原创文案：${copy || "（待人工撰写）"}`);
      L.push(`- 相似度/抄袭风险：${risk}`);
    });
    L.push("");
    L.push("## 6. 资产库 & 审核状态");
    const st = STATE.assetId ? (loadAssets().find((x) => x.id === STATE.assetId) || {}).status : "未保存";
    L.push(`- 审核状态：${st}`);
    L.push("");
    L.push("> 硬性约束：Agent 不自动发布；生成稿件须人工审核；禁止直接抄袭原文。");
    return L.join("\n");
  }
  function buildReport() {
    $("bdReport").textContent = buildReportText();
  }
  function exportJson() {
    const data = {
      account: ($("bdAccount").value || "").trim(),
      category: ($("bdCategory").value || "").trim(),
      date: new Date().toISOString().slice(0, 10),
      samples: { viral: STATE.viral, normal: STATE.normal },
      compare: {
        viral: STATE.vA.map((a) => ({ chars: a.chars, sentences: a.sc, questionHook: a.hasQuestionHook, emoji: a.emoji, cta: a.hasCTA, infoPoints: a.infoPoints, density: a.density })),
        normal: STATE.nA.map((a) => ({ chars: a.chars, sentences: a.sc, questionHook: a.hasQuestionHook, emoji: a.emoji, cta: a.hasCTA, infoPoints: a.infoPoints, density: a.density })),
      },
      break7: Array.from(document.querySelectorAll("#bdBreak textarea")).map((t) => t.value),
      drivers: { copy: $("bdDriverCopy").value, luck: $("bdDriverLuck").value, conclusion: $("bdDriverConclusion").value },
      template: $("bdTemplate").value,
      candidates: STATE.candidates.map((c, i) => ({
        angle: c.name,
        title: c.title,
        struct: c.struct,
        copy: $("cand" + i) ? $("cand" + i).value : "",
        risk: $("risk" + i) ? $("risk" + i).value : "低",
      })),
      assetId: STATE.assetId,
      report: buildReportText(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `爆款拆解_${data.account || "account"}_${data.date}.json`;
    a.click();
    toast("已导出结构化 JSON");
  }

  // ---------- 示例样本 ----------
  function loadSample() {
    $("bdAccount").value = "@苜蓿的美食日记";
    $("bdCategory").value = "美食";
    $("bdViral").value =
      "为什么你做的红烧肉总是柴？教你3个锁嫩诀窍，第一步很多人就错了。①选三层五花 ②冷水下锅焯血沫 ③小火慢炖40分钟。其实关键在最后收汁那一下，别急着大火。关注我，明天教你糖醋排骨。\n" +
      "----\n" +
      "立秋第一锅糖炒栗子，甜到心坎里。剥开金黄的栗子，咬下去粉糯香甜，这就是秋天的味道吧。评论区说说你最爱哪道秋日美食？记得点赞收藏，下期做桂花糕。";
    $("bdNormal").value =
      "今天做了个番茄炒蛋，挺好吃的，分享一下做法。鸡蛋打散，番茄切块，先炒蛋再炒番茄，最后放一起炒匀，加盐出锅。\n" +
      "----\n" +
      "分享一下我的早餐搭配：面包、牛奶、一个苹果。简单健康，适合上班族。大家早餐一般都吃什么呀。";
    toast("已载入示例样本，点击「开始拆解分析」体验");
  }

  // ---------- 绑定 ----------
  $("bdRun").addEventListener("click", function () {
    const v = splitSamples($("bdViral").value);
    const n = splitSamples($("bdNormal").value);
    if (v.length === 0) {
      $("bdRunHint").textContent = "⚠️ 请至少粘贴 1 条爆款样本（普通样本可选）";
      return;
    }
    STATE.viral = v;
    STATE.normal = n;
    STATE.vA = v.map(analyze);
    STATE.nA = n.map(analyze);
    STATE.best = v.reduce((a, b) => (b.length > a.length ? b : a), v[0]);
    STATE.assetId = null;
    renderCompare();
    renderBreak();
    renderDrivers();
    renderTemplate();
    ["bdSec1", "bdSec2", "bdSec3", "bdSec4", "bdSec5", "bdSec6", "bdSec7", "bdSec8"].forEach(
      (id) => ($(id).hidden = false)
    );
    $("bdRunHint").textContent =
      "✅ 已生成步骤1-4，请补全后点击「生成3条原创候选」→「保存资产库」→ 步骤7人工审核。";
    buildReport();
  });
  $("bdLoadSample").addEventListener("click", loadSample);
  $("bdGen").addEventListener("click", genCandidates);
  $("bdSave").addEventListener("click", saveAsset);
  $("bdPass").addEventListener("click", () => review(true));
  $("bdReject").addEventListener("click", () => review(false));
  $("bdExportJson").addEventListener("click", exportJson);
  $("bdCopyReport").addEventListener("click", function () {
    const t = buildReportText();
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast("已复制报告"));
    else toast("当前环境不支持复制");
  });

  // 初始化：渲染已有资产库
  renderAssets();
})();
