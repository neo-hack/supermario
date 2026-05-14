# CodeMermaid v2: Direct HTML + Raw SVG + Side-by-Side Code

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the codemermaid skill to generate self-contained HTML pages using a minimal skeleton template with HTML-comment slots, raw SVG diagrams (no mermaid.js), and 6 unit types: concept, quiz, takeaway, diagram, code-walk, code-graph.

**Architecture:** Phase 1-3 (scan, analyze, build page data) remain identical. Phase 4 (Mermaid graphs) is replaced by raw SVG. Phase 5 (page list) stays. Phase 6 (assemble) uses a skeleton template with `<!-- SLOT:... -->` markers — skill fills content HTML into slots. Validation is done by a subagent reviewer instead of `validate-units.js`. The `code-walk` unit defaults to side-by-side split layout (code left, annotations right). A new `code-graph` unit shows code left, mini call-graph SVG right, with highlight sync. `quiz` replaces `guess-first` with single-choice Q&A. `compare`, `surprise`, `storyboard`, and anchor diagram are removed.

**Tech Stack:** Vanilla HTML/CSS/JS, raw SVG, Google Fonts CDN (Inter + Geist Mono). Zero npm, zero build tools, zero mermaid.js.

---

## Design Decisions Summary

| Decision | Old | New |
|----------|-----|-----|
| Page generation | Template + PAGE_DATA + runtime rendering | Skeleton template + `<!-- SLOT:... -->` + pre-rendered content |
| Diagrams | Mermaid.js from CDN | Raw inline SVG |
| Anchor diagram | SVG map with scroll-link | **Removed** — replaced by TOC |
| Code layout | Stacked (code above, explanation below) | Split (code left, annotations right) |
| Validation | `validate-units.js` Node script | **Removed** — subagent reviewer |
| Container width | `max-width: 760px` | `width: 80%; min-width: 900px; max-width: 1400px` |

**Unit types: 6 (down from 8)**

| Unit | Status | Notes |
|------|--------|-------|
| `concept` | **Kept** | Absorbs `surprise` — use `.unit-surprise` class for red-border callout style |
| `quiz` | **New** | Replaces `guess-first` — single-choice, 4 options, click-to-judge + explanation |
| `takeaway` | **Kept** | No change |
| `diagram` | **Kept** | `mermaid` field → `svg` field (raw inline SVG) |
| `code-walk` | **Kept** | Default layout → `split` (left code, right annotations) |
| `code-graph` | **New** | Replaces `storyboard` — left code, right mini call-graph SVG, highlight sync |
| `compare` | **Removed** | Use two `code-walk` + concept instead |
| `surprise` | **Removed** | Merged into `concept` with `.unit-surprise` class |
| `guess-first` | **Removed** | Replaced by `quiz` |
| `storyboard` | **Removed** | Replaced by `code-graph` |

---

## Wireframe

Visual reference at `docs/superpowers/plans/wireframe-codemermaid-v2.html` — shows all 6 unit types + TOC with the existing dark theme.

---

## File Structure

### Files to DELETE

```
skills/codemermaid/assets/template-essay.html
skills/codemermaid/assets/template-index.html
skills/codemermaid/assets/_runtime.js
skills/codemermaid/assets/_essay.js
skills/codemermaid/assets/_index.js
skills/codemermaid/scripts/validate-units.js
skills/codemermaid/references/storyboard-patterns.md
```

### Files to CREATE

```
skills/codemermaid/assets/skeleton-essay.html      — minimal HTML shell with <!-- SLOT:... --> markers
skills/codemermaid/assets/skeleton-index.html       — minimal HTML shell for index page
skills/codemermaid/assets/style.css                 — full design system CSS
skills/codemermaid/assets/runtime.js                — minimal runtime: quiz, zoom, annotation clicks, TOC active tracking
skills/codemermaid/references/svg-patterns.md       — SVG diagram patterns and node/edge templates
```

### Files to MODIFY

```
skills/codemermaid/SKILL.md                         — rewrite Phase 4, 5, 6 + unit specs
```

---

## Task 1: Create `skeleton-essay.html`

**Files:**
- Create: `skills/codemermaid/assets/skeleton-essay.html`

This is the minimal HTML shell. The `<head>`, zoom overlay, and `<script>` are always correct. Skill only fills content into `<!-- SLOT:... -->` markers.

- [ ] **Step 1: Create the skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><!-- SLOT:PAGE_TITLE --> — <!-- SLOT:PROJECT_NAME --></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* Full contents of assets/style.css inlined here */
</style>
</head>
<body>
<header class="topbar">
  <a class="back-link" href="<!-- SLOT:BACK_LINK -->">← <!-- SLOT:BACK_LABEL --></a>
</header>

<main class="container">
  <!-- SLOT:HERO -->
  <!-- SLOT:TOC -->
  <!-- SLOT:UNITS -->
  <!-- SLOT:FOOTER -->
</main>

<div class="zoom-overlay" hidden>
  <div class="zoom-stage"></div>
  <div class="zoom-controls">
    <button data-zoom-out aria-label="Zoom out" title="Zoom out">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>
    </button>
    <span class="zoom-level" data-zoom-level>100%</span>
    <button data-zoom-reset aria-label="Reset zoom" title="Reset zoom">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></svg>
    </button>
    <button data-zoom-in aria-label="Zoom in" title="Zoom in">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
    </button>
    <button data-zoom-close aria-label="Close zoom" title="Close zoom">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
  </div>
</div>

<script>
/* Full contents of assets/runtime.js inlined here */
</script>
</body>
</html>
```

**Slot inventory:**

| Slot | Type | Description |
|------|------|-------------|
| `<!-- SLOT:PAGE_TITLE -->` | plain text | Page title |
| `<!-- SLOT:PROJECT_NAME -->` | plain text | Project name |
| `<!-- SLOT:BACK_LINK -->` | URL | Back link href |
| `<!-- SLOT:BACK_LABEL -->` | plain text | Back link text |
| `<!-- SLOT:HERO -->` | HTML block | Hero section (title, learning promise, prereqs) |
| `<!-- SLOT:TOC -->` | HTML block | Table of contents |
| `<!-- SLOT:UNITS -->` | HTML block | All unit sections |
| `<!-- SLOT:FOOTER -->` | HTML block | Footer with next link + recap |

- [ ] **Step 2: Commit**

```bash
git add skills/codemermaid/assets/skeleton-essay.html
git commit -m "feat(codemermaid): add essay page skeleton template"
```

---

## Task 2: Create `skeleton-index.html`

**Files:**
- Create: `skills/codemermaid/assets/skeleton-index.html`

- [ ] **Step 1: Create the skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><!-- SLOT:PROJECT_NAME --> — Codebase Course</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* Full contents of assets/style.css inlined here */
</style>
</head>
<body>
<main class="container">
  <!-- SLOT:INDEX_HEADER -->
  <!-- SLOT:PERSPECTIVE_CARDS -->
  <!-- SLOT:MODULE_CARDS -->
</main>

<script>
/* Full contents of assets/runtime.js inlined here */
</script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add skills/codemermaid/assets/skeleton-index.html
git commit -m "feat(codemermaid): add index page skeleton template"
```

---

## Task 3: Create `style.css`

**Files:**
- Create: `skills/codemermaid/assets/style.css`
- Read: `skills/codemermaid/assets/template-essay.html` (lines 12–927 for existing CSS)

Extract all CSS from the current template. Keep everything that's unchanged, remove mermaid styles, add new styles for TOC, quiz, code-walk split, code-graph split.

- [ ] **Step 1: Create the CSS file**

Start with the full CSS from `template-essay.html` (lines 12–927). Then make these changes:

1. **Container width** — change from `max-width: 760px` to:
```css
.container {
  width: 80%;
  min-width: 900px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 32px 160px;
}
```

2. **Remove mermaid styles** — delete all `.mermaid` selectors (lines 235–260)

3. **Remove anchor diagram styles** — delete `.anchor`, `.anchor-label` (lines 219–234)

4. **Remove compare styles** — delete `.compare`, `.col`, `.col-label`, `.col.bad`, `.col.good`, `.lesson` (lines 422–460)

5. **Remove guess-first styles** — delete `.guess`, `.guess summary`, `.guess-icon`, `.guess-reveal` (lines 364–419)

6. **Remove storyboard styles** — delete `.storyboard*`, `.storyboard-mobile-guard`, `.storyboard-shell`, `.storyboard-stage`, `.storyboard-scene-label`, `.storyboard-zoom`, `.storyboard-mermaid`, `.storyboard-explanation`, `.storyboard-strip`, `.storyboard-tab*`, `.storyboard-code-slot`, `.storyboard-code-drawer`, `.storyboard-code-grid`, `.storyboard-notes`, `.storyboard-note*` (lines 534–803)

7. **Add TOC styles:**
```css
.toc {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 64px;
  box-shadow: var(--shadow-card);
}
.toc-label {
  font-size: 11px;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 600;
  margin-bottom: 16px;
}
.toc-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.toc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-dim);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.toc-item:hover {
  background: rgba(255,255,255,0.03);
  color: var(--text);
}
.toc-item.active {
  background: var(--accent-soft);
  color: var(--text);
}
.toc-num {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-faint);
  border: 1px solid var(--border);
  border-radius: 4px;
  flex-shrink: 0;
}
.toc-kind {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-faint);
  background: var(--surface-2);
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: auto;
  flex-shrink: 0;
}
```

8. **Add quiz styles:**
```css
.quiz {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0 16px;
  box-shadow: var(--shadow-card);
}
.quiz-question {
  padding: 18px 20px;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--text);
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}
.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}
.quiz-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-size: 15px;
  color: var(--text-dim);
  line-height: 1.5;
}
.quiz-option:hover {
  background: rgba(255,255,255,0.04);
  border-color: var(--text-faint);
}
.quiz-option-letter {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid var(--border);
  border-radius: 50%;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-faint);
  flex-shrink: 0;
  margin-top: 1px;
}
.quiz-option.correct {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.3);
}
.quiz-option.correct .quiz-option-letter {
  background: #34d399;
  border-color: #34d399;
  color: var(--bg);
}
.quiz-option.wrong {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.3);
}
.quiz-option.wrong .quiz-option-letter {
  background: #f87171;
  border-color: #f87171;
  color: var(--bg);
}
.quiz-option.dimmed {
  opacity: 0.4;
  pointer-events: none;
}
.quiz-explanation {
  padding: 14px 16px;
  border-top: 1px solid var(--border);
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.55;
  display: none;
}
.quiz-explanation.visible {
  display: block;
}
.quiz-explanation strong {
  color: var(--text);
}
```

9. **Add code-walk split styles:**
```css
.codewalk-split {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0 16px;
  box-shadow: var(--shadow-card);
}
.codewalk-split .codewalk-head {
  border-bottom: 1px solid var(--border);
}
.codewalk-split-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
}
.codewalk-split pre.code-block {
  border-right: 1px solid var(--border);
}
.codewalk-annotations {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: var(--surface-2);
  overflow-y: auto;
}
.codewalk-annotation {
  border: 1px dashed var(--accent);
  border-radius: 6px;
  padding: 10px 12px;
  background: rgba(255, 99, 99, 0.04);
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}
.codewalk-annotation.active {
  background: rgba(255, 99, 99, 0.11);
  box-shadow: 0 0 0 1px rgba(255, 99, 99, 0.22);
}
.codewalk-annotation .annotation-line {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--accent);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.codewalk-annotation p {
  margin: 0;
  color: var(--text);
  font-size: 12px;
  line-height: 1.5;
}
```

10. **Add code-graph split styles:**
```css
.codegraph-split {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0 16px;
  box-shadow: var(--shadow-card);
}
.codegraph-split .codewalk-head {
  border-bottom: 1px solid var(--border);
}
.codegraph-split-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
}
.codegraph-split pre.code-block {
  border-right: 1px solid var(--border);
}
.codegraph-graph {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--surface);
  overflow: auto;
}
.codegraph-graph svg .node-active rect,
.codegraph-graph svg .node-active path {
  fill: #FF6363;
  stroke: #FF6363;
  transition: fill 0.25s ease, stroke 0.25s ease;
}
.codegraph-graph svg .node-active text {
  fill: #ffffff;
  font-weight: 600;
}
.codegraph-graph svg .node { cursor: pointer; transition: opacity 0.2s ease; }
.codegraph-graph svg .node:hover { opacity: 0.85; }
```

11. **Add inline SVG diagram styles (replacing mermaid):**
```css
.figure-diagram {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}
.figure-diagram svg {
  max-width: 100%;
  height: auto;
}
```

12. **Important: `<pre>` whitespace rule** — add a comment at the top of the code-block section:
```css
/* CRITICAL: Inside <pre class="code-block">, .line spans MUST be adjacent with NO whitespace
   between them. Any newline or space between .line spans will render as visible blank lines
   in the <pre> context. The skill MUST generate: <span class="line">...</span><span class="line">...</span> */
```

- [ ] **Step 2: Verify no mermaid references**

Run: `grep -ci "mermaid" skills/codemermaid/assets/style.css`
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add skills/codemermaid/assets/style.css
git commit -m "feat(codemermaid): create style.css with TOC, quiz, split-code, SVG styles"
```

---

## Task 4: Create `runtime.js`

**Files:**
- Create: `skills/codemermaid/assets/runtime.js`

Minimal runtime — no mermaid, no unit rendering. Only handles interactive features:
- TOC active tracking (highlight current section on scroll)
- Quiz click handling (judge answer, show explanation)
- Code-walk annotation ↔ code line click sync
- Code-graph annotation ↔ SVG node click sync
- Zoom overlay (pan/zoom SVG diagrams)

- [ ] **Step 1: Create the runtime**

```javascript
/* runtime.js — minimal interactive runtime for codemermaid v2.
   No mermaid, no unit rendering. Handles: TOC scroll, quiz, annotation clicks, zoom.
   Inlined into each generated HTML page. */

function initTocScroll() {
  const tocLinks = Array.from(document.querySelectorAll('.toc-item'));
  const units = Array.from(document.querySelectorAll('.unit[id]'));
  if (tocLinks.length === 0 || units.length === 0) return;

  let active = null;
  function pickActive() {
    const center = window.innerHeight / 2;
    let best = null, bestDist = Infinity;
    for (const u of units) {
      const r = u.getBoundingClientRect();
      const d = Math.abs((r.top + r.bottom) / 2 - center);
      if (d < bestDist) { bestDist = d; best = u; }
    }
    if (best && best !== active) {
      active = best;
      tocLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === '#' + best.id);
      });
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { pickActive(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}

function initQuiz() {
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', function() {
      const quiz = this.closest('.quiz');
      if (quiz.classList.contains('answered')) return;
      quiz.classList.add('answered');
      const isCorrect = this.dataset.correct === 'true';
      quiz.querySelectorAll('.quiz-option').forEach(o => {
        if (o === this) {
          o.classList.add(isCorrect ? 'correct' : 'wrong');
        } else if (o.dataset.correct === 'true') {
          o.classList.add('correct');
        } else {
          o.classList.add('dimmed');
        }
      });
      const explanation = quiz.querySelector('.quiz-explanation');
      if (explanation) explanation.classList.add('visible');
    });
  });
}

function bindAnnotationClicks(scope) {
  const annotations = Array.from(scope.querySelectorAll('[data-note-lines]'));
  const codeLines = Array.from(scope.querySelectorAll('.code-block .line'));
  if (annotations.length === 0 || codeLines.length === 0) return;

  function activate(note, lineNumber) {
    annotations.forEach(a => a.classList.toggle('active', a === note));
    codeLines.forEach(l => l.classList.toggle('active-note-line', l.dataset.line === lineNumber));
  }

  codeLines.forEach(line => {
    line.addEventListener('click', () => {
      const target = annotations.find(a => {
        const lines = String(a.dataset.noteLines || '').split(',').filter(Boolean);
        return lines.includes(line.dataset.line);
      });
      if (!target) return;
      activate(target, line.dataset.line);
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  annotations.forEach(note => {
    note.addEventListener('click', () => {
      const firstLine = String(note.dataset.noteLines || '').split(',')[0];
      const target = codeLines.find(l => l.dataset.line === firstLine);
      if (!target) return;
      activate(note, firstLine);
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    });
  });
}

function initCodeWalkAnnotations() {
  document.querySelectorAll('.codewalk-split').forEach(container => {
    bindAnnotationClicks(container);
  });
}

function initCodeGraphSync() {
  document.querySelectorAll('.codegraph-split').forEach(container => {
    const codeLines = Array.from(container.querySelectorAll('.code-block .line'));
    const svgNodes = Array.from(container.querySelectorAll('.codegraph-graph [data-node-id]'));
    if (codeLines.length === 0 || svgNodes.length === 0) return;

    const lineToNode = new Map();
    codeLines.forEach(line => {
      const nodeId = line.dataset.graphNode;
      if (nodeId) lineToNode.set(line.dataset.line, nodeId);
    });

    function highlightNode(nodeId) {
      svgNodes.forEach(g => g.classList.toggle('node-active', g.dataset.nodeId === nodeId));
    }

    function highlightLine(lineNum) {
      codeLines.forEach(l => l.classList.remove('active-note-line'));
      const target = codeLines.find(l => l.dataset.line === lineNum);
      if (target) target.classList.add('active-note-line');
    }

    svgNodes.forEach(node => {
      node.addEventListener('click', () => {
        const nodeId = node.dataset.nodeId;
        highlightNode(nodeId);
        const matchingLine = codeLines.find(l => l.dataset.graphNode === nodeId);
        if (matchingLine) {
          highlightLine(matchingLine.dataset.line);
          matchingLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    codeLines.forEach(line => {
      line.addEventListener('click', () => {
        const nodeId = line.dataset.graphNode;
        if (!nodeId) return;
        highlightNode(nodeId);
        highlightLine(line.dataset.line);
      });
    });
  });
}

function initZoomOverlay() {
  const overlay = document.querySelector('.zoom-overlay');
  if (!overlay) return;
  const stage = overlay.querySelector('.zoom-stage');
  const levelEl = overlay.querySelector('[data-zoom-level]');
  let scale = 1, tx = 0, ty = 0;
  const MIN = 0.3, MAX = 6;

  function applyTransform() {
    stage.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
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

  document.querySelectorAll('[data-zoom-trigger]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fig = btn.closest('.figure, .unit-diagram');
      const svg = fig && fig.querySelector('svg');
      if (svg) openZoom(svg);
    });
  });

  overlay.querySelector('[data-zoom-close]')?.addEventListener('click', closeZoom);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeZoom(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeZoom(); });
  overlay.querySelector('[data-zoom-in]')?.addEventListener('click', () => { scale = Math.min(MAX, scale * 1.25); applyTransform(); });
  overlay.querySelector('[data-zoom-out]')?.addEventListener('click', () => { scale = Math.max(MIN, scale / 1.25); applyTransform(); });
  overlay.querySelector('[data-zoom-reset]')?.addEventListener('click', () => { scale = 1; tx = 0; ty = 0; applyTransform(); });

  overlay.addEventListener('wheel', e => {
    if (!overlay.classList.contains('open')) return;
    e.preventDefault();
    const rect = stage.getBoundingClientRect();
    const cx = e.clientX - (rect.left + rect.width / 2);
    const cy = e.clientY - (rect.top + rect.height / 2);
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const ns = Math.min(MAX, Math.max(MIN, scale * factor));
    const r = ns / scale;
    tx -= cx * (r - 1); ty -= cy * (r - 1);
    scale = ns;
    applyTransform();
  }, { passive: false });

  let dragging = false, lx = 0, ly = 0;
  overlay.addEventListener('mousedown', e => {
    if (e.target.closest('.zoom-controls')) return;
    dragging = true; lx = e.clientX; ly = e.clientY;
    overlay.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    tx += e.clientX - lx; ty += e.clientY - ly;
    lx = e.clientX; ly = e.clientY;
    applyTransform();
  });
  window.addEventListener('mouseup', () => { dragging = false; overlay.classList.remove('dragging'); });
}

function bootPage() {
  initTocScroll();
  initQuiz();
  initCodeWalkAnnotations();
  initCodeGraphSync();
  initZoomOverlay();
}

document.addEventListener('DOMContentLoaded', bootPage);
```

- [ ] **Step 2: Verify no mermaid references**

Run: `grep -ci "mermaid" skills/codemermaid/assets/runtime.js`
Expected: 0

- [ ] **Step 3: Commit**

```bash
git add skills/codemermaid/assets/runtime.js
git commit -m "feat(codemermaid): create minimal runtime with TOC, quiz, annotations, zoom"
```

---

## Task 5: Create `references/svg-patterns.md`

**Files:**
- Create: `skills/codemermaid/references/svg-patterns.md`

- [ ] **Step 1: Create the reference file**

Content is the same as the old plan's Task 5 (SVG skeleton, node types, edges, grouping, layout math, design tokens). See the wireframe's SVG for working examples.

Key patterns:
- Skeleton with `<defs><marker id="arrowhead">...</marker></defs>`
- Rectangle node: `<g class="node" data-node-id="..."><rect rx="8"/><text/></g>`
- Edge: `<line marker-end="url(#arrowhead)"/>`
- Dashed edge: `stroke-dasharray="6 3"`
- Design tokens: fill `#161718`, stroke `#252829`, text `#f9f9f9`, active `#FF6363`, edge `#9c9c9d`

- [ ] **Step 2: Commit**

```bash
git add skills/codemermaid/references/svg-patterns.md
git commit -m "feat(codemermaid): add SVG diagram patterns reference"
```

---

## Task 6: Delete old files

**Files:**
- Delete all old template, runtime, and validation files

- [ ] **Step 1: Delete old files**

```bash
rm skills/codemermaid/assets/template-essay.html
rm skills/codemermaid/assets/template-index.html
rm skills/codemermaid/assets/_runtime.js
rm skills/codemermaid/assets/_essay.js
rm skills/codemermaid/assets/_index.js
rm skills/codemermaid/scripts/validate-units.js
rm skills/codemermaid/references/storyboard-patterns.md
```

- [ ] **Step 2: Verify**

Run: `ls skills/codemermaid/assets/`
Expected: `skeleton-essay.html  skeleton-index.html  style.css  runtime.js`

- [ ] **Step 3: Commit**

```bash
git add -u skills/codemermaid/
git commit -m "chore(codemermaid): remove old templates, mermaid runtime, validator, storyboard patterns"
```

---

## Task 7: Rewrite SKILL.md

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

This is the largest task. Phase 1-3 remain unchanged. Everything from Phase 4 onward needs rewriting.

- [ ] **Step 1: Update frontmatter and description**

Replace mermaid references with SVG. Update unit list to: concept, quiz, takeaway, diagram, code-walk, code-graph.

- [ ] **Step 2: Update unit kinds section**

Replace the 8 unit kinds with 6:

```javascript
{ kind: "concept",     title, body, style? }                          // style: "callout" for surprise-style red border
{ kind: "quiz",        question, options: [{letter, text, correct}], explanation }
{ kind: "takeaway",    body }
{ kind: "diagram",     title, svg, caption, zoomable? }
{ kind: "code-walk",   title, file, code, highlights: [{line, note}], layout? }
{ kind: "code-graph",  title, file, code, highlights: [{line, note, graphNode?}], svg }
```

- [ ] **Step 3: Replace Phase 4 — "Build SVG Diagrams"**

No more mermaid syntax. Generate raw SVG with `<g data-node-id>` nodes. Read `references/svg-patterns.md` for templates.

- [ ] **Step 4: Replace Phase 5 — page list**

```
| File | Skeleton | Condition |
|------|----------|-----------|
| `index.html`            | `skeleton-index.html` | Always |
| `architecture.html`     | `skeleton-essay.html` | Always |
| `<perspective>.html`    | `skeleton-essay.html` | One per non-architecture perspective |
| `module-<name>.html`    | `skeleton-essay.html` | One per discovered module |
```

- [ ] **Step 5: Replace Phase 6 — "Write HTML Pages"**

For each page:
1. Read the skeleton template
2. Read `assets/style.css` and `assets/runtime.js`
3. Inline CSS and JS into the skeleton
4. Generate content HTML for each slot
5. Replace `<!-- SLOT:... -->` markers with content
6. **Critical HTML rule:** Inside `<pre class="code-block">`, `.line` spans must be adjacent with NO whitespace between them
7. Write the completed HTML to `docs/codebase-course/`

**Essay page content generation:**

HERO slot:
```html
<section class="hero">
  <div class="eyebrow">{PROJECT_NAME}</div>
  <h1>{PAGE_TITLE}</h1>
  <p class="learning-promise">{LEARNING_PROMISE}</p>
  <ul class="prereqs">{PREREQ_CHIPS}</ul>
</section>
```

TOC slot:
```html
<nav class="toc">
  <div class="toc-label">On this page</div>
  <ol class="toc-list">
    <li><a class="toc-item" href="#unit-0"><span class="toc-num">1</span>{TITLE}<span class="toc-kind">{KIND}</span></a></li>
    ...
  </ol>
</nav>
```

UNITS slot — each unit wrapped in:
```html
<section class="unit unit-{KIND}" id="unit-{INDEX}">
  {UNIT_CONTENT}
</section>
```

Unit HTML templates:
- **concept** (normal): `<span class="unit-kind">concept</span><h2>...</h2><p>...</p>`
- **concept** (callout): Same but wrapped in `<div class="unit-surprise">` with `<span class="unit-kind">concept</span>` inside
- **quiz**: `<div class="quiz"><div class="quiz-question">...</div><div class="quiz-options"><div class="quiz-option" data-correct="true/false">...</div>...</div><div class="quiz-explanation">...</div></div>`
- **takeaway**: Same as before
- **diagram**: `<figure class="figure"><div class="figure-diagram">{SVG}</div><figcaption>...</figcaption></figure>`
- **code-walk** (split): `<div class="codewalk-split"><div class="codewalk-head">...</div><div class="codewalk-split-body"><pre class="code-block">...</pre><div class="codewalk-annotations">...</div></div></div>`
- **code-graph**: `<div class="codegraph-split"><div class="codewalk-head">...</div><div class="codegraph-split-body"><pre class="code-block">...</pre><div class="codegraph-graph">{SVG}</div></div></div>`

**Pre-flight checks:**
- [ ] Every `highlightLines` / `highlights[].line` points to an existing line
- [ ] Every code snippet is an exact copy from source
- [ ] No `href="#"` placeholders
- [ ] No `**bold**` markdown — use `<strong>` directly
- [ ] SVG diagrams contain no broken references
- [ ] No whitespace between `.line` spans inside `<pre>` blocks

**Validation:** Dispatch a subagent reviewer to check the generated HTML.

- [ ] **Step 6: Update Important Rules, Common Mistakes, File Organization**

- Remove mermaid references
- Add rules about `<pre>` whitespace
- Add quiz answer rules (exactly 1 `data-correct="true"`)
- Update file organization tree

- [ ] **Step 7: Commit**

```bash
git add skills/codemermaid/SKILL.md
git commit -m "feat(codemermaid): rewrite SKILL.md for v2 pipeline"
```

---

## Task 8: Generate test page + validate

**Files:**
- Create: `tests/fixtures/test-page-v2.html`

Use the wireframe at `docs/superpowers/plans/wireframe-codemermaid-v2.html` as reference. Generate a proper test page using the skeleton template + inlined CSS/JS.

- [ ] **Step 1: Create test page**
- [ ] **Step 2: Open in browser and verify all interactions**
- [ ] **Step 3: Commit**

---

## Task 9: Fix issues from validation

**Files:**
- Modify: whatever needs fixing

- [ ] **Step 1: Fix and re-verify**
- [ ] **Step 2: Commit**

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Create `skeleton-essay.html` | 5 min |
| 2 | Create `skeleton-index.html` | 3 min |
| 3 | Create `style.css` | 15 min |
| 4 | Create `runtime.js` | 15 min |
| 5 | Create `svg-patterns.md` | 10 min |
| 6 | Delete old files | 3 min |
| 7 | Rewrite SKILL.md | 25 min |
| 8 | Generate test page + validate | 15 min |
| 9 | Fix validation issues | 10 min |
| **Total** | | **~100 min** |
