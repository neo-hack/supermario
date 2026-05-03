/* _essay.js — essay page runtime.
   renderUnit dispatcher, bootEssay, anchor-diagram scroll-link, stepped-walk highlight migration,
   zoomable diagram overlay. Depends on helpers from _runtime.js. */

function renderUnit(unit) {
  switch (unit.kind) {
    case 'concept':     return renderConcept(unit);
    case 'code-walk':   return renderCodeWalk(unit);
    case 'guess-first': return renderGuessFirst(unit);
    case 'compare':     return renderCompare(unit);
    case 'surprise':    return renderSurprise(unit);
    case 'takeaway':    return renderTakeaway(unit);
    case 'diagram':     return renderDiagram(unit);
    default:
      return `<p style="color:#ff8a8a">Unknown unit kind: ${escapeHtml(unit.kind)}</p>`;
  }
}

function renderConcept(u) {
  const title = u.title ? `<h2>${escapeHtml(u.title)}</h2>` : '';
  const body = renderMarkdownLinks(escapeBodyParagraphs(u.body || ''));
  return `<span class="unit-kind">concept</span>${title}${body}`;
}

function renderSurprise(u) {
  const title = u.title ? `<h2>${escapeHtml(u.title)}</h2>` : '';
  const body = renderMarkdownLinks(escapeBodyParagraphs(u.body || ''));
  return `<span class="unit-kind">surprise</span>${title}${body}`;
}

function renderTakeaway(u) {
  const title = u.title ? `<h2>${escapeHtml(u.title)}</h2>` : '';
  const body = renderMarkdownLinks(escapeBodyParagraphs(u.body || ''));
  return `<span class="unit-kind">takeaway</span>${title}${body}`;
}

function escapeBodyParagraphs(text) {
  // Split body on blank lines into <p>; preserve markdown link tokens for renderMarkdownLinks.
  return String(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
    // Restore [label](href) tokens that escapeHtml has not damaged (brackets/parens are not escaped).
    ;
}

function renderCodeWalk(u) {
  const layout = u.layout || 'stacked';
  const headLabel = u.file ? escapeHtml(u.file) : '';
  const titleHtml = u.title ? `<h2>${escapeHtml(u.title)}</h2>` : '';

  if (layout === 'stepped') {
    const steps = (u.steps || []);
    const allLines = steps[0] ? steps[0].highlightLines : [];
    return `
      <span class="unit-kind">code-walk · stepped</span>${titleHtml}
      <div class="layout-stepped wide" data-stepped>
        <div class="codewalk">
          <div class="codewalk-head"><span>${headLabel}</span><span>stepped</span></div>
          ${renderCode(u.code || '', allLines)}
        </div>
        <div class="steps">
          ${steps.map((s, i) => `
            <div class="step${i === 0 ? ' active' : ''}" data-lines="${(s.highlightLines || []).join(',')}">
              <span class="step-num">${String(i + 1).padStart(2, '0')}</span>
              ${renderMarkdownLinks(escapeHtml(s.beat || ''))}
              <span class="lines">L${(s.highlightLines || []).join(', ')}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  if (layout === 'split') {
    return `
      <span class="unit-kind">code-walk · split</span>${titleHtml}
      <div class="layout-split wide">
        <div class="codewalk">
          <div class="codewalk-head"><span>${headLabel}</span><span>split</span></div>
          ${renderCode(u.code || '', u.highlightLines || [])}
        </div>
        <div class="side">${renderMarkdownLinks(escapeBodyParagraphs(u.explanation || ''))}</div>
      </div>`;
  }

  // stacked
  return `
    <span class="unit-kind">code-walk</span>${titleHtml}
    <div class="codewalk">
      <div class="codewalk-head"><span>${headLabel}</span><span>stacked</span></div>
      ${renderCode(u.code || '', u.highlightLines || [])}
    </div>
    <div class="explain">${renderMarkdownLinks(escapeBodyParagraphs(u.explanation || ''))}</div>`;
}

function renderGuessFirst(u) {
  const reveal = u.reveal || {};
  const code = reveal.code
    ? `<div class="codewalk" style="margin-top:14px">${renderCode(reveal.code, reveal.highlightLines || [])}</div>`
    : '';
  const expl = reveal.explanation
    ? `<div class="explain" style="margin-top:12px">${renderMarkdownLinks(escapeBodyParagraphs(reveal.explanation))}</div>`
    : '';
  return `
    <details class="guess unit-guess-first">
      <summary>${escapeHtml(u.question || '')}</summary>
      ${code}${expl}
    </details>`;
}

function renderCompare(u) {
  const left = u.left || {};
  const right = u.right || {};
  const titleHtml = u.title ? `<h2>${escapeHtml(u.title)}</h2>` : '';
  return `
    <span class="unit-kind">compare</span>${titleHtml}
    <div class="compare">
      <div class="col bad">
        <div class="col-label">${escapeHtml(left.label || 'before')}</div>
        <pre>${escapeHtml(left.code || '')}</pre>
      </div>
      <div class="col good">
        <div class="col-label">${escapeHtml(right.label || 'after')}</div>
        <pre>${escapeHtml(right.code || '')}</pre>
      </div>
    </div>
    ${u.lesson ? `<div class="lesson">${renderMarkdownLinks(escapeHtml(u.lesson))}</div>` : ''}`;
}

function renderDiagram(u) {
  const zoomable = u.zoomable !== false;
  const titleHtml = u.title ? `<h2>${escapeHtml(u.title)}</h2>` : '';
  return `
    <span class="unit-kind">diagram</span>${titleHtml}
    <figure class="figure" ${zoomable ? 'data-zoomable="true"' : ''}>
      ${zoomable ? '<button class="zoom-btn" data-zoom-trigger>Zoom</button>' : ''}
      <div class="figure-mermaid"><div class="mermaid">${escapeHtml(u.mermaid || '')}</div></div>
      ${u.caption ? `<figcaption>${renderMarkdownLinks(escapeHtml(u.caption))}</figcaption>` : ''}
    </figure>`;
}

async function bootEssay(page) {
  const unitsRoot = document.querySelector('.units');
  if (unitsRoot) {
    unitsRoot.innerHTML = (page.units || []).map((u, i) => {
      const anchorAttr = u.anchorNode ? ` data-anchor="${escapeHtml(u.anchorNode)}"` : '';
      return `<section class="unit unit-${u.kind}" data-unit-index="${i}"${anchorAttr}>${renderUnit(u)}</section>`;
    }).join('');
  }

  if (page.diagram) {
    const anchorMermaid = document.querySelector('.anchor .mermaid');
    if (anchorMermaid) {
      anchorMermaid.textContent = page.diagram;
      await renderMermaid('.anchor .mermaid');
      initAnchorScrollLink();
    }
  }

  await renderMermaid('.unit-diagram .mermaid, .figure .mermaid');
  initSteppedWalks();
  initZoomOverlay();
  startScrollLoop();
}

/* ------- Anchor diagram scroll-link ------- */
const _anchorState = {
  nodeIndex: new Map(), // anchor key -> mermaid <g.node>
  units: [],
  active: null,
};

function initAnchorScrollLink() {
  const anchorEl = document.querySelector('.anchor .mermaid');
  if (!anchorEl) return;
  _anchorState.units = Array.from(document.querySelectorAll('.unit[data-anchor]'));
  _anchorState.nodeIndex.clear();
  anchorEl.querySelectorAll('g.node').forEach((g) => {
    const m = g.id.match(/-([A-Za-z0-9_]+)-\d+$/);
    if (m) _anchorState.nodeIndex.set(m[1], g);
  });
  _anchorState.nodeIndex.forEach((g, key) => {
    g.addEventListener('click', () => {
      const u = _anchorState.units.find((x) => x.dataset.anchor === key);
      if (u) u.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

function pickActiveUnit() {
  if (_anchorState.units.length === 0) return;
  const center = window.innerHeight / 2;
  let best = null, bestDist = Infinity;
  for (const u of _anchorState.units) {
    const r = u.getBoundingClientRect();
    const mid = (r.top + r.bottom) / 2;
    const d = Math.abs(mid - center);
    if (d < bestDist) { bestDist = d; best = u; }
  }
  if (best && best !== _anchorState.active) {
    _anchorState.active = best;
    const key = best.dataset.anchor;
    _anchorState.nodeIndex.forEach((g, k) => g.classList.toggle('active', k === key));
  }
}

/* ------- Stepped code-walk highlight migration ------- */
function initSteppedWalks() {
  document.querySelectorAll('[data-stepped]').forEach((root) => {
    const codeEl = root.querySelector('.code-block');
    if (!codeEl) return;
    const lineEls = new Map();
    codeEl.querySelectorAll('.line').forEach((el) => {
      lineEls.set(el.dataset.line, el);
    });
    const steps = Array.from(root.querySelectorAll('.step'));

    function highlight(linesAttr) {
      const wanted = new Set(String(linesAttr || '').split(',').map((s) => s.trim()).filter(Boolean));
      lineEls.forEach((el, k) => el.classList.toggle('line-hl', wanted.has(k)));
    }

    function activateStep(s) {
      if (!s) return;
      steps.forEach((x) => x.classList.toggle('active', x === s));
      highlight(s.dataset.lines);
    }

    steps.forEach((s) => {
      s.addEventListener('click', () => {
        s.scrollIntoView({ behavior: 'smooth', block: 'center' });
        activateStep(s);
      });
    });

    activateStep(steps[0]);

    let activeStep = null;
    root._pickActiveStep = function pickActiveStep() {
      const center = window.innerHeight / 2;
      let best = null, bestDist = Infinity;
      for (const s of steps) {
        const r = s.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const mid = (r.top + r.bottom) / 2;
        const d = Math.abs(mid - center);
        if (d < bestDist) { bestDist = d; best = s; }
      }
      if (best && best !== activeStep) {
        activeStep = best;
        activateStep(best);
      }
    };
  });
}

/* ------- Zoomable diagram overlay ------- */
function initZoomOverlay() {
  const overlay = document.querySelector('.zoom-overlay');
  if (!overlay) return;
  const stage = overlay.querySelector('.zoom-stage');
  const levelEl = overlay.querySelector('[data-zoom-level]');
  let scale = 1, tx = 0, ty = 0;
  const MIN = 0.3, MAX = 6;

  function applyTransform() {
    stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    if (levelEl) levelEl.textContent = Math.round(scale * 100) + '%';
  }

  function openZoom(svg) {
    const clone = svg.cloneNode(true);
    const r = svg.getBoundingClientRect();
    clone.removeAttribute('style');
    clone.setAttribute('width', r.width);
    clone.setAttribute('height', r.height);
    clone.classList.add('zoom-svg-fix');
    stage.innerHTML = '';
    stage.appendChild(clone);
    scale = 1; tx = 0; ty = 0;
    applyTransform();
    overlay.classList.add('open');
    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeZoom() {
    overlay.classList.remove('open');
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-zoom-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fig = btn.closest('.figure, .unit-diagram');
      const svg = fig && fig.querySelector('svg');
      if (svg) openZoom(svg);
    });
  });

  overlay.querySelector('[data-zoom-close]')?.addEventListener('click', closeZoom);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeZoom(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeZoom();
  });

  overlay.querySelector('[data-zoom-in]')?.addEventListener('click', () => {
    scale = Math.min(MAX, scale * 1.25); applyTransform();
  });
  overlay.querySelector('[data-zoom-out]')?.addEventListener('click', () => {
    scale = Math.max(MIN, scale / 1.25); applyTransform();
  });
  overlay.querySelector('[data-zoom-reset]')?.addEventListener('click', () => {
    scale = 1; tx = 0; ty = 0; applyTransform();
  });

  overlay.addEventListener('wheel', (e) => {
    if (!overlay.classList.contains('open')) return;
    e.preventDefault();
    const rect = stage.getBoundingClientRect();
    const cxFromCenter = e.clientX - (rect.left + rect.width / 2);
    const cyFromCenter = e.clientY - (rect.top + rect.height / 2);
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const newScale = Math.min(MAX, Math.max(MIN, scale * factor));
    const ratio = newScale / scale;
    tx -= cxFromCenter * (ratio - 1);
    ty -= cyFromCenter * (ratio - 1);
    scale = newScale;
    applyTransform();
  }, { passive: false });

  let dragging = false, lastX = 0, lastY = 0;
  overlay.addEventListener('mousedown', (e) => {
    if (e.target.closest('.zoom-controls')) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    overlay.classList.add('dragging');
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    tx += e.clientX - lastX; ty += e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
    dragging = false; overlay.classList.remove('dragging');
  });
}

/* ------- Single rAF scroll loop ------- */
function startScrollLoop() {
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      pickActiveUnit();
      document.querySelectorAll('[data-stepped]').forEach((r) => r._pickActiveStep && r._pickActiveStep());
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}
