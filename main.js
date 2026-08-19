/* ============================================================================
 * main.js · 美食热点审核控制台（纯 UI 审核层）
 * ----------------------------------------------------------------------------
 * 架构分层：
 *   ① WorkBuddy Agent 推理层（网页外，由外部 Agent 执行，不在本文件）
 *        - Agent01（筛选打分）：hotspot.json  -> candidate_pool.json
 *        - Agent02（稿件生成）：candidate_pool.json -> output-articles.json
 *   ② 本文件 = 网页 UI 审核层（仅做渲染 + 人工审核 + 写回）
 *
 * 本文件【不包含】任何热点打分、过滤、稿件生成、模拟 Agent 推理的代码。
 * 推理按钮在 index.html 中已置灰（disabled），仅作架构示意。
 *
 * 数据流向：
 *   读取：hotspot.json / candidate_pool.json / output-articles.json / rejected-food.json
 *   写出：rejected-food.json（人工驳回记录，累加写回）
 *
 * 运行：
 *   - 本地：Live Server 开 http 服务，fetch 才能读同目录 JSON。
 *   - 公网 GitHub Pages：浏览器安全限制下无法写回 JSON（FileSystem Access API
 *     在 https 公网域名不可用），故驳回时自动触发【下载兜底】。
 * ==========================================================================*/

(function () {
  'use strict';

  /* ---------- 极小 DOM 辅助 ---------- */
  const $ = (id) => document.getElementById(id);
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  let toastTimer;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1900);
  }
  function setStatus(msg) { $('statusNote').textContent = msg; }

  /* ---------- 全局状态（仅 UI 状态，无推理状态） ---------- */
  const state = {
    hotspot: { hotspots: [] },
    pool: { candidates: [] },
    articles: { articles: [] },
    rejected: [],          // 人工驳回记录（写回 rejected-food.json）
  };

  /* ---------- JSON 读取（带缓存绕过） ---------- */
  async function loadJSON(name) {
    const res = await fetch(name + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error(name + ' HTTP ' + res.status);
    return res.json();
  }

  async function init() {
    setStatus('加载中…');
    try {
      const [hs, pl, ar] = await Promise.all([
        loadJSON('hotspot.json').catch(() => ({ hotspots: [] })),
        loadJSON('candidate_pool.json').catch(() => ({ candidates: [] })),
        loadJSON('output-articles.json').catch(() => ({ articles: [] })),
      ]);
      state.hotspot = hs;
      state.pool = pl;
      state.articles = ar;
      // 已驳回清单可选存在（首次运行可能 404）
      state.rejected = await loadJSON('rejected-food.json').catch(() => []);
      if (!Array.isArray(state.rejected)) state.rejected = [];
    } catch (e) {
      setStatus('加载失败：' + e.message);
      toast('JSON 加载失败，请用 Live Server 开 http 服务');
    }
    renderAll();
    const now = new Date();
    $('hdDate').textContent = now.toISOString().slice(0, 10);
    $('hdFetch').textContent = now.toLocaleTimeString('zh-CN');
    setStatus('已加载');
  }

  /* ---------- 渲染 ---------- */
  function renderAll() {
    renderArticles();
    renderPool();
    renderHotspot();
    renderRejected();
  }

  function priClass(p) {
    p = Number(p) || 0;
    if (p >= 8) return 'p1';
    if (p >= 5) return 'p2';
    return 'p3';
  }

  function renderArticles() {
    const body = $('articlesBody');
    const list = state.articles.articles || [];
    if (!list.length) { body.innerHTML = '<div class="empty">暂无稿件（output-articles.json 为空或尚未由 Agent02 生成）</div>'; return; }
    const pending = list.filter((a) => (a.status || '待审核') !== '驳回' && (a.status || '待审核') !== '采纳').length;
    $('artTag').textContent = '待人工审核 ' + pending + ' / ' + list.length;
    body.innerHTML = list.map((a) => {
      const status = a.status || '待审核';
      const rejected = state.rejected.find((r) => r.articleId === a.id);
      const reasonVal = rejected ? rejected.reason : '';
      const locked = status === '采纳' || status === '驳回';
      return `
      <div class="card" data-id="${esc(a.id)}">
        <div class="chead">
          <div>
            <span class="cid">${esc(a.id)} · 来源 ${esc(a.source || '—')} · 热度 ${esc(a.heat != null ? a.heat : '—')}</span>
            <div class="ctitle">${esc(a.title || '（无标题）')}</div>
          </div>
          <span class="pill st-${esc(status)}">${esc(status)}</span>
        </div>
        <div class="cgrid">
          <div class="field"><span class="k">中文稿</span>
            <div class="tweet"><span class="lang">中文</span>${esc(a.cn || '（无）')}
              <button class="copy" data-copy="${esc(a.cn || '')}">复制</button></div>
          </div>
          <div class="field"><span class="k">英文稿</span>
            <div class="tweet"><span class="lang">English</span>${esc(a.en || '（无）')}
              <button class="copy" data-copy="${esc(a.en || '')}">复制</button></div>
          </div>
        </div>
        <div class="audit">
          <input class="rej-reason" type="text" placeholder="驳回原因（硬约束：驳回必填）" value="${esc(reasonVal)}" ${locked ? 'disabled' : ''}>
          <button class="btn btn-adopt" data-act="adopt" data-id="${esc(a.id)}" ${locked ? 'disabled' : ''}>✅ 采纳</button>
          <button class="btn btn-reject" data-act="reject" data-id="${esc(a.id)}" ${locked ? 'disabled' : ''}>❌ 驳回</button>
          ${rejected ? `<span class="note" style="margin:0;">已记录驳回原因</span>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  function renderPool() {
    const body = $('poolBody');
    const list = state.pool.candidates || [];
    if (!list.length) { body.innerHTML = '<div class="empty">候选池为空（candidate_pool.json 尚无数据）</div>'; return; }
    body.innerHTML = list.map((c) => `
      <div class="card">
        <div class="chead">
          <div>
            <span class="cid">${esc(c.id)} · ${esc(c.source || '—')} · 热度 ${esc(c.heat != null ? c.heat : '—')}</span>
            <div class="ctitle">${esc(c.title || '（无标题）')}</div>
          </div>
          <span class="pri ${priClass(c.priority)}">优先级 ${esc(c.priority != null ? c.priority : '—')}</span>
        </div>
        <div class="field" style="margin-top:8px;"><span class="k">跟进决策</span>${esc(c.decision || '—')} · ${esc(c.summary || '')}</div>
        <div class="field" style="margin-top:8px;"><span class="k">切入角度</span>${(c.angles || []).map(esc).join(' / ') || '—'}</div>
      </div>`).join('');
  }

  function renderHotspot() {
    const body = $('hotspotBody');
    const list = state.hotspot.hotspots || [];
    if (!list.length) { body.innerHTML = '<div class="empty">原始热点为空（hotspot.json 尚无数据）</div>'; return; }
    body.innerHTML = list.map((h) => `
      <div class="card">
        <div class="chead">
          <div>
            <span class="cid">${esc(h.id)} · ${esc(h.source || '—')} · 热度 ${esc(h.heat != null ? h.heat : '—')}</span>
            <div class="ctitle">${esc(h.title || '（无标题）')}</div>
          </div>
        </div>
        <div class="field" style="margin-top:8px;"><span class="k">分类</span>${esc(h.category || '—')}</div>
      </div>`).join('');
  }

  function renderRejected() {
    const body = $('rejectedBody');
    const list = state.rejected;
    $('rejTag').textContent = list.length + ' 条';
    if (!list.length) { body.innerHTML = '<div class="empty">暂无驳回记录</div>'; return; }
    body.innerHTML = list.map((r) => `
      <div class="card">
        <div class="chead">
          <div>
            <span class="cid">稿件 ${esc(r.articleId || '—')} · ${esc(r.rejectedAt || '')}</span>
            <div class="ctitle">${esc(r.title || '（无标题）')}</div>
          </div>
          <span class="pill st-驳回">已驳回</span>
        </div>
        <div class="field" style="margin-top:8px;"><span class="k">驳回原因</span>${esc(r.reason || '（未填）')}</div>
      </div>`).join('');
  }

  /* ---------- 人工审核：采纳 / 驳回 ---------- */
  function findArticle(id) { return (state.articles.articles || []).find((a) => a.id === id); }

  function onAdopt(id) {
    const a = findArticle(id);
    if (!a) return;
    a.status = '采纳';
    renderArticles();
    toast('✅ 已采纳：' + (a.title || id));
  }

  function onReject(id) {
    const a = findArticle(id);
    if (!a) return;
    const card = document.querySelector('.card[data-id="' + CSS.escape(id) + '"]');
    const reasonEl = card && card.querySelector('.rej-reason');
    const reason = (reasonEl && reasonEl.value || '').trim();
    if (!reason) {                 // 硬约束：驳回必填原因
      toast('⚠️ 驳回必须填写原因');
      if (reasonEl) reasonEl.focus();
      return;
    }
    a.status = '驳回';
    // 去重：同一稿件只保留一条驳回记录
    state.rejected = state.rejected.filter((r) => r.articleId !== id);
    state.rejected.push({
      articleId: id,
      title: a.title || '',
      source: a.source || '',
      reason: reason,
      rejectedAt: new Date().toISOString(),
    });
    renderArticles();
    renderRejected();
    persistRejected();            // 写回 rejected-food.json（localhost 直写 / 否则下载）
  }

  /* ---------- rejected-food.json 写回 ----------
   * localhost（Live Server / http://localhost）：优先用 FileSystem Access API
   *   直接写回磁盘；首次需用户点击「绑定写回文件」选择该文件并授权。
   * 公网（GitHub Pages 等 https）：API 不可用 → 自动下载兜底。            */
  let fileHandle = null;

  // 简易 IndexedDB 存文件句柄（仅 localhost 持久化用）
  function idbPut(k, v) {
    return new Promise((res, rej) => {
      const r = indexedDB.open('wb_console');
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => {
        const tx = r.result.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(v, k);
        tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
      };
      r.onerror = () => rej(r.error);
    });
  }
  function idbGet(k) {
    return new Promise((res, rej) => {
      const r = indexedDB.open('wb_console');
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => {
        const tx = r.result.transaction('kv', 'readonly');
        const rq = tx.objectStore('kv').get(k);
        rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
      };
      r.onerror = () => rej(r.error);
    });
  }

  async function bindFile() {
    if (!window.showSaveFilePicker) {
      toast('当前浏览器/环境不支持直接写回，已改为下载');
      return;
    }
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: 'rejected-food.json',
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
      });
      await idbPut('rejectedHandle', fileHandle);
      toast('✅ 已绑定写回文件，后续驳回将直接写入磁盘');
    } catch (e) {
      toast('已取消绑定（将使用下载兜底）');
    }
  }

  function download(name, text) {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function persistRejected() {
    const text = JSON.stringify(state.rejected, null, 2);
    if (fileHandle && fileHandle.createWritable) {
      try {
        const w = await fileHandle.createWritable();
        await w.write(text); await w.close();
        toast('✅ 已写入 rejected-food.json（localhost 直接写回）');
        return;
      } catch (e) { /* 权限失效则回退下载 */ }
    }
    download('rejected-food.json', text);
    toast('已下载 rejected-food.json（请放回站点根目录；GitHub Pages 不支持写回）');
  }

  function exportRejected() {
    download('rejected-food.json', JSON.stringify(state.rejected, null, 2));
    toast('⬇ 已导出 rejected-food.json');
  }

  /* ---------- 事件委托 ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.copy !== undefined) {     // 复制稿件
      navigator.clipboard && navigator.clipboard.writeText(t.dataset.copy);
      toast('已复制');
      return;
    }
    if (t.classList.contains('tab')) {                  // 切换 tab
      const v = t.dataset.view;
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
      document.querySelectorAll('.page').forEach((p) => { p.hidden = (p.id !== 'view-' + v); });
      return;
    }
    if (t.id === 'reloadBtn') { init(); return; }
    if (t.id === 'exportBtn') { exportRejected(); return; }
    if (t.id === 'bindBtn') { bindFile(); return; }

    const act = t.dataset && t.dataset.act;
    if (act === 'adopt') onAdopt(t.dataset.id);
    else if (act === 'reject') onReject(t.dataset.id);
  });

  /* ---------- 启动 ---------- */
  // 尝试恢复上次绑定的写回文件句柄（仅 localhost 生效）
  if (window.indexedDB) {
    idbGet('rejectedHandle').then((h) => { if (h) fileHandle = h; }).catch(() => {});
  }
  init();
})();
