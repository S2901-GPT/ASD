(() => {
  if (!Array.isArray(window.DATA || DATA)) return;

  const sourceData = window.DATA || DATA;
  const state = {
    activeId: sourceData[0].id,
    filter: "all",
    search: ""
  };

  const typeLabel = {
    strength: "ميزة",
    challenge: "تحدي"
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function highlight(value) {
    const safe = escapeHtml(value);
    const query = state.search.trim();
    if (!query) return safe;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp(escaped, "gi"), m => `<mark>${m}</mark>`);
  }

  function getActive() {
    return sourceData.find(x => x.id === state.activeId) || sourceData[0];
  }

  function getVisiblePoints(item) {
    const q = state.search.trim().toLowerCase();
    return item.points.filter(point => {
      const passType = state.filter === "all" || point.type === state.filter;
      const passSearch = !q || `${item.title} ${item.group} ${point.text} ${point.example}`.toLowerCase().includes(q);
      return passType && passSearch;
    });
  }

  function renderSections() {
    const groups = [...new Set(sourceData.map(x => x.group))];
    return groups.map(group => `
      <div class="section-group">
        <div class="group-name">${escapeHtml(group)}</div>
        ${sourceData.filter(item => item.group === group).map(item => {
          const strengths = item.points.filter(p => p.type === "strength").length;
          const challenges = item.points.filter(p => p.type === "challenge").length;
          return `
            <button class="section-btn ${item.id === state.activeId ? "active" : ""}" data-section="${item.id}" style="--accent:${item.accent}">
              <span class="section-icon">${item.icon}</span>
              <span class="section-label">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${strengths} مميزات · ${challenges} تحديات</span>
              </span>
            </button>
          `;
        }).join("")}
      </div>
    `).join("");
  }

  function renderPoints(item) {
    const visible = getVisiblePoints(item);
    if (!visible.length) return `<div class="empty">لا توجد نتائج مطابقة.</div>`;

    return visible.map((point, index) => `
      <article class="point-card">
        <div class="point-main">
          <div class="point-number">${index + 1}</div>
          <div class="point-body">
            <span class="tag ${point.type}">${typeLabel[point.type]}</span>
            <h3>${highlight(point.text)}</h3>
            <p>${highlight(point.example)}</p>
          </div>
        </div>
      </article>
    `).join("");
  }

  function render() {
    const active = getActive();
    document.body.innerHTML = `
      <div class="reader-shell" style="--accent:${active.accent}">
        <header class="reader-top">
          <div class="reader-top-inner">
            <div class="reader-title">
              <h1>كنين سعد</h1>
              <p>شاشة قراءة منظمة: اختر القسم، ثم اقرأ العارض ومثاله مباشرة بدون تشتيت.</p>
            </div>
            <input class="reader-search" id="readerSearch" value="${escapeHtml(state.search)}" placeholder="بحث داخل العوارض والأمثلة..." />
          </div>
        </header>

        <main class="reader-page">
          <aside class="section-panel">
            <div class="section-panel-head">
              <h2>الأقسام</h2>
            </div>
            ${renderSections()}
          </aside>

          <section class="content-panel">
            <div class="section-hero">
              <div class="section-hero-head">
                <h2>${escapeHtml(active.title)}</h2>
                <p>${escapeHtml(active.group)}</p>
              </div>
            </div>

            <div class="filter-row">
              <button class="filter-btn ${state.filter === "all" ? "active" : ""}" data-filter="all">الكل</button>
              <button class="filter-btn ${state.filter === "strength" ? "active" : ""}" data-filter="strength">المميزات</button>
              <button class="filter-btn ${state.filter === "challenge" ? "active" : ""}" data-filter="challenge">التحديات</button>
            </div>

            <div class="notice-mini">
              هذه الأعراض والسمات ليست بالضرورة أن تكون موجودة لدى الجميع، وكل شخص مختلف تماماً عن الآخر في تفاصيل تجربته.
            </div>

            <div class="analysis-example">
              <h3>مثال تحليلي للقسم</h3>
              <p>"${escapeHtml(active.originalExample)}"</p>
            </div>

            <div class="point-list">
              ${renderPoints(active)}
            </div>
          </section>
        </main>
      </div>
    `;

    bind();
  }

  function bind() {
    document.querySelectorAll("[data-section]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.activeId = btn.dataset.section;
        window.scrollTo({ top: 0, behavior: "smooth" });
        render();
      });
    });

    document.querySelectorAll("[data-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.filter = btn.dataset.filter;
        render();
      });
    });

    const search = document.getElementById("readerSearch");
    search.addEventListener("input", e => {
      state.search = e.target.value;
      render();
      const next = document.getElementById("readerSearch");
      next.focus();
      next.setSelectionRange(next.value.length, next.value.length);
    });
  }

  window.addEventListener("load", render);
})();
