# Mermaid Course Multi-Perspective Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade codemermaid skill from single-file to multi-file output with index page router and flexible perspective system.

**Architecture:** Two HTML templates — `template-index.html` (card navigation, no Mermaid) and `template-course.html` (Mermaid + detail panel, renamed from template.html with breadcrumb added). SKILL.md updated to 6-phase workflow with perspective system and new data structures (INDEX, PERSPECTIVE).

**Tech Stack:** HTML/CSS/JS (vanilla), Mermaid v11, no build tools.

**Spec:** `docs/superpowers/specs/2026-05-02-codemermaid-multi-perspective-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Rename | `references/template.html` → `references/template-course.html` | Sub-page template (Mermaid + detail panel) |
| Create | `references/template-index.html` | Entry page template (card navigation) |
| Modify | `references/template-course.html` | Add breadcrumb + `{{BREADCRUMB_TITLE}}` + `{{BACK_LINK}}` |
| Modify | `skills/codemermaid/SKILL.md` | 6-phase workflow, perspective system, new data structures |
| Delete | `references/template.html` | Replaced by `template-course.html` |

---

### Task 1: Rename template.html to template-course.html

**Files:**
- Rename: `skills/codemermaid/references/template.html` → `skills/codemermaid/references/template-course.html`

- [ ] **Step 1: Rename the file**

```bash
cd skills/codemermaid/references
mv template.html template-course.html
```

- [ ] **Step 2: Verify rename**

```bash
ls -la skills/codemermaid/references/
```

Expected: `template-course.html`, `design-system.md` present. No `template.html`.

- [ ] **Step 3: Commit**

```bash
git add skills/codemermaid/references/
git commit -m "refactor: rename template.html to template-course.html"
```

---

### Task 2: Add breadcrumb to template-course.html

**Files:**
- Modify: `skills/codemermaid/references/template-course.html`

- [ ] **Step 1: Add breadcrumb CSS**

Insert after the `.start-guide.hidden` rule (after line 85 in current file):

```css
  .breadcrumb {
    position: absolute; top: 0; left: 0; right: 0; z-index: 10;
    padding: 10px 20px;
    background: var(--surface-100);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 500; letter-spacing: 0.2px;
  }
  .breadcrumb a {
    color: var(--text-dim); text-decoration: none;
    transition: opacity 0.2s;
  }
  .breadcrumb a:hover { opacity: 0.6; color: var(--text-primary); }
  .breadcrumb .sep { color: var(--text-dark); }
  .breadcrumb .current { color: var(--text-secondary); }
```

- [ ] **Step 2: Add breadcrumb HTML and push content down**

Replace the `<div id="root">` opening section. Add the breadcrumb bar inside `map-area` at the very top, and add `padding-top: 42px` to `.map-area` to prevent overlap:

Find:
```html
<div id="root">
  <div class="map-area">
    <div class="top-bar">
```

Replace with:
```html
<div id="root">
  <div class="map-area" style="padding-top: 42px;">
    <div class="breadcrumb">
      <a href="{{BACK_LINK}}">\u2190 {{PROJECT_NAME}}</a>
      <span class="sep">/</span>
      <span class="current">{{BREADCRUMB_TITLE}}</span>
    </div>
    <div class="top-bar">
```

- [ ] **Step 3: Adjust top-bar z-index below breadcrumb**

In the `.top-bar` CSS rule, change `z-index: 5` to `z-index: 4` so the breadcrumb (z-index 10) appears above it.

- [ ] **Step 4: Verify in browser**

Open `template-course.html` directly in browser. Expected: breadcrumb bar visible at top showing "← {{PROJECT_NAME}} / {{BREADCRUMB_TITLE}}". Mermaid graph and detail panel still work.

- [ ] **Step 5: Commit**

```bash
git add skills/codemermaid/references/template-course.html
git commit -m "feat: add breadcrumb navigation to template-course.html"
```

---

### Task 3: Create template-index.html

**Files:**
- Create: `skills/codemermaid/references/template-index.html`

- [ ] **Step 1: Write the complete template-index.html**

Create `skills/codemermaid/references/template-index.html` with this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{PROJECT_NAME}} - Codebase Course</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg-void: #07080a;
    --surface-100: #101111;
    --surface-card: #1b1c1e;
    --border: rgba(255, 255, 255, 0.06);
    --border-visible: rgba(255, 255, 255, 0.1);
    --text-primary: #f9f9f9;
    --text-secondary: #cecece;
    --text-tertiary: #9c9c9d;
    --text-dim: #6a6b6c;
    --text-dark: #434345;
    --accent-red: #FF6363;
    --accent-blue: hsl(202, 100%, 67%);
    --accent-green: hsl(151, 59%, 59%);
    --accent-yellow: hsl(43, 100%, 60%);
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%; height: 100%;
    font-family: var(--font-primary);
    font-feature-settings: 'calt', 'kern', 'liga', 'ss03';
    background: var(--bg-void);
    -webkit-font-smoothing: antialiased;
  }
  .page {
    max-width: 960px; margin: 0 auto; padding: 60px 32px;
  }

  .project-header { margin-bottom: 48px; }
  .project-header h1 {
    font-size: 32px; font-weight: 600; line-height: 1.1;
    color: var(--text-primary); margin-bottom: 8px;
  }
  .project-header p {
    font-size: 16px; font-weight: 500; line-height: 1.6;
    color: var(--text-secondary); letter-spacing: 0.2px; margin-bottom: 12px;
  }
  .badges { display: flex; gap: 8px; }
  .badge {
    font-size: 12px; font-weight: 600;
    color: var(--text-primary);
    background: var(--surface-card);
    padding: 3px 10px; border-radius: 6px;
  }

  .section-title {
    font-size: 14px; font-weight: 600; letter-spacing: 0.2px;
    color: var(--text-dim); text-transform: uppercase;
    margin-bottom: 16px;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px; margin-bottom: 48px;
  }

  .card {
    background: var(--surface-100);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    text-decoration: none;
    transition: opacity 0.2s, border-color 0.2s;
    box-shadow: rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset;
  }
  .card:hover {
    opacity: 0.85;
    border-color: rgba(255,255,255,0.12);
  }
  .card-type {
    font-size: 11px; font-weight: 600;
    color: var(--accent-blue);
    background: hsla(202,100%,67%,0.12);
    padding: 2px 8px; border-radius: 4px;
    display: inline-block; margin-bottom: 10px;
  }
  .card h3 {
    font-size: 16px; font-weight: 500; line-height: 1.3;
    color: var(--text-primary); margin-bottom: 6px;
  }
  .card p {
    font-size: 13px; font-weight: 500; line-height: 1.5;
    color: var(--text-tertiary); letter-spacing: 0.2px;
  }
  .card-meta {
    font-size: 11px; font-weight: 600;
    color: var(--text-dark); margin-top: 10px;
  }

  .perspectives { margin-bottom: 48px; }
</style>
</head>
<body>
<div class="page">
  <div class="project-header">
    <h1>{{PROJECT_NAME}}</h1>
    <p>{{PROJECT_DESCRIPTION}}</p>
    <div class="badges">
      <span class="badge">{{LANGUAGE}}</span>
      {{FRAMEWORK}}
    </div>
  </div>

  <div class="perspectives">
    <div class="section-title">Perspectives</div>
    <div class="card-grid" id="perspectives-grid"></div>
  </div>

  <div class="modules">
    <div class="section-title">Module Deep Dives</div>
    <div class="card-grid" id="modules-grid"></div>
  </div>
</div>

<script>
const INDEX = {{INDEX_DATA}};

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderCards() {
  const pGrid = document.getElementById('perspectives-grid');
  const mGrid = document.getElementById('modules-grid');

  pGrid.innerHTML = INDEX.perspectives.map(p => `
    <a class="card" href="${escapeHtml(p.page)}">
      <span class="card-type">${escapeHtml(p.diagramType)}</span>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.description)}</p>
    </a>
  `).join('');

  mGrid.innerHTML = INDEX.modules.map(m => `
    <a class="card" href="${escapeHtml(m.page)}">
      <span class="card-type">module</span>
      <h3>${escapeHtml(m.title)}</h3>
      <p>${escapeHtml(m.description)}</p>
      <div class="card-meta">${m.steps} step${m.steps !== 1 ? 's' : ''}</div>
    </a>
  `).join('');
}

renderCards();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify template renders**

Create a quick test: copy the file to `/tmp/test-index.html`, replace placeholders with sample data, open in browser. Expected: card grid with project name, perspective cards, module cards, all clickable.

- [ ] **Step 3: Commit**

```bash
git add skills/codemermaid/references/template-index.html
git commit -m "feat: add template-index.html entry page template"
```

---

### Task 4: Update SKILL.md — Phase 2 (Analyze), Phase 3 (Build Data)

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Update description in frontmatter**

Find:
```yaml
description: Use when asked to generate an interactive codebase course, visual architecture walkthrough, or module dependency tutorial as a standalone HTML page. Produces a single .html file with Mermaid diagram navigation and step-by-step code explanations.
```

Replace with:
```yaml
description: Use when asked to generate an interactive codebase course, visual architecture walkthrough, or module dependency tutorial as a multi-page HTML site. Produces a directory with index page, multiple perspective views (architecture, data flow, state machines, etc.), and per-module deep dive pages — all with Mermaid diagrams and step-by-step code explanations.
```

- [ ] **Step 2: Update Output section**

Find:
```
Single file: `docs/codebase-course.html`
```

Replace with:
```
Directory: `docs/codebase-course/`

  index.html                    ← Entry page (perspective + module cards)
  architecture.html             ← Architecture perspective
  <perspective>.html            ← Other perspectives (agent decides)
  module-<name>.html            ← Per-module deep dives (agent decides)
```

- [ ] **Step 3: Add perspective selection to Phase 2**

Append to the end of Phase 2 (after the prioritization table):

```markdown
5. **User perspective requirements** — parse user prompt for explicit perspective requests. If user says "must show data flow" or "include a sequence diagram", these are mandatory perspectives that cannot be omitted
6. **Auto-infer perspectives** — from project characteristics, select supplementary perspectives:
   - Has HTTP handlers → Data Flow perspective
   - Has database/ORM → Data Model perspective
   - Has state management → State Machine perspective
   - 10+ modules → Module Dependency perspective
   - Has CI/CD config → Build Pipeline perspective
7. **Merge perspective list** — user-specified (mandatory) + auto-inferred (supplementary), deduplicated. Architecture is always included. Every discovered module must be reachable from at least one perspective page
```

- [ ] **Step 4: Add INDEX and PERSPECTIVE data structures to Phase 3**

Append to Phase 3 after the COURSE data structure definition:

```markdown
### INDEX Data (for index.html)

```javascript
const INDEX = {
  project: { name: "Project Name", description: "One-line description", language: "TypeScript", framework: "Next.js" },
  perspectives: [
    { title: "Architecture Overview", description: "12 modules across 5 layers", page: "architecture.html", diagramType: "graph TD" }
  ],
  modules: [
    { title: "user-service", description: "User management and authentication", page: "module-user-service.html", steps: 3 }
  ]
};
```

### PERSPECTIVE Data (for perspective pages)

```javascript
const PERSPECTIVE = {
  title: "Request Lifecycle",
  backLink: "index.html",
  graph: "sequenceDiagram\n  participant Client\n  ...",
  nodes: [
    { id: "auth", label: "Auth Middleware", summary: "Validates JWT tokens and sets user context.", deepLink: "module-auth.html" }
  ]
};
```

- `PERSPECTIVE` is used for cross-module perspective pages (architecture, data flow, etc.)
- `COURSE` is used for per-module deep-dive pages (unchanged)
- Node IDs must be consistent across all pages
```

- [ ] **Step 5: Commit**

```bash
git add skills/codemermaid/SKILL.md
git commit -m "feat: add perspective system and multi-page data structures to SKILL.md"
```

---

### Task 5: Update SKILL.md — Phase 4 (Build Graphs), Phase 5 (Generate Page List), Phase 6 (Assemble)

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Update Phase 4 — clarify one graph per page**

Find Phase 4 section. Replace the `**Graph rules:**` section's last bullet about subgraphs. Add a new paragraph after the sub-graph example:

```markdown
**Multi-page graph rules:**
- Each perspective page gets its own independent Mermaid graph
- Module pages use `COURSE` data (existing behavior)
- Perspective pages use `PERSPECTIVE` data (new)
- Node IDs must be consistent across pages (e.g. `auth` node is `auth` everywhere)
- Every node in a perspective page must have a `click nodeId callback` directive
```

- [ ] **Step 2: Replace Phase 5 entirely**

Find the existing Phase 5 section. Replace it with:

```markdown
## Phase 5: Generate Page List

From the perspective list (Phase 2) and module list (Phase 1), determine which files to generate:

| File | Template | Data | Condition |
|------|----------|------|-----------|
| `index.html` | `template-index.html` | `INDEX` | Always |
| `architecture.html` | `template-course.html` | `PERSPECTIVE` | Always (architecture is mandatory) |
| `<perspective>.html` | `template-course.html` | `PERSPECTIVE` | One per non-architecture perspective |
| `module-<name>.html` | `template-course.html` | `COURSE` | One per discovered module |

File naming: `index.html` is fixed. All other filenames are kebab-case, agent-decides. All files go in `docs/codebase-course/`.
```

- [ ] **Step 3: Replace Phase 6 entirely**

Find the existing Phase 5 (now becoming Phase 6). Replace:

Find:
```markdown
## Phase 5: Generate HTML
```

Replace with:
```markdown
## Phase 6: Assemble

Read both templates. For each page in the file list (Phase 5), fill placeholders and output to `docs/codebase-course/`.

### Using template-index.html

Replace these placeholders:
- `{{PROJECT_NAME}}` — from Phase 1
- `{{PROJECT_DESCRIPTION}}` — one-line project description
- `{{LANGUAGE}}` — from Phase 1
- `{{FRAMEWORK}}` — badge HTML string like `<span class="badge">Next.js</span>`, or empty string if none
- `{{INDEX_DATA}}` — the `INDEX` JavaScript object as a literal (not JSON string — must be valid JS)

### Using template-course.html

Replace these placeholders:
- `{{PROJECT_NAME}}` — from Phase 1
- `{{LANGUAGE}}` — from Phase 1
- `{{MERMAID_GRAPH}}` — Mermaid graph definition from Phase 4
- `{{BREADCRUMB_TITLE}}` — page title (e.g. "Architecture Overview", "user-service")
- `{{BACK_LINK}}` — always `index.html`

Then replace the data section:
- Module pages: replace `COURSE` object in SECTION 1
- Perspective pages: replace `COURSE` with `PERSPECTIVE` and update the runtime to use perspective-mode rendering

### Perspective Mode vs Module Mode

The runtime in `template-course.html` supports two modes:

**Module mode** (default): `COURSE` data with `flowOrder`, click nodes show code steps.

**Perspective mode**: `PERSPECTIVE` data, click nodes show summary + "Deep dive →" link to module page. To activate, replace the `COURSE` object with a `PERSPECTIVE` object and add `const PAGE_MODE = 'perspective';` before the runtime section. The runtime checks `PAGE_MODE` and adjusts `renderPanel()` accordingly.
```

- [ ] **Step 4: Update Important Rules**

Find the Important Rules section. Add these rules:

```markdown
7. **Cover every module** — every module discovered in Phase 1 must appear in at least one perspective page AND have its own `module-<name>.html`
8. **Consistent node IDs** — the same module uses the same node ID across all pages
9. **User perspective overrides** — if the user specifies perspectives, those are mandatory; auto-inferred perspectives are supplementary only
```

- [ ] **Step 5: Update File Organization section**

Find:
```markdown
```
skills/codemermaid/
  SKILL.md                     # This file
  references/
    design-system.md           # Full CSS/typography/shadow reference
    template.html              # Working HTML template — agent only fills data
```
```

Replace with:
```markdown
```
skills/codemermaid/
  SKILL.md                       # This file (6-phase workflow)
  references/
    design-system.md             # Full CSS/typography/shadow reference
    template-index.html          # Entry page — card navigation
    template-course.html         # Sub-page — Mermaid + detail panel + breadcrumb
```
```

- [ ] **Step 6: Commit**

```bash
git add skills/codemermaid/SKILL.md
git commit -m "feat: update SKILL.md with 6-phase workflow and perspective system"
```

---

### Task 6: Add perspective mode to template-course.html runtime

**Files:**
- Modify: `skills/codemermaid/references/template-course.html`

- [ ] **Step 1: Add PAGE_MODE constant**

In the SECTION 1 area, before the `COURSE` object, add:

```javascript
const PAGE_MODE = 'module'; // 'module' or 'perspective'
```

- [ ] **Step 2: Add perspective rendering logic to renderPanel()**

Find the `renderPanel()` function. After the line `const d = COURSE[currentId];`, add perspective mode handling:

```javascript
  if (PAGE_MODE === 'perspective') {
    const node = PERSPECTIVE.nodes.find(n => n.id === currentId);
    if (!node) {
      panel.className = 'detail-panel empty';
      panel.innerHTML = 'Click a node to explore';
      return;
    }
    panel.className = 'detail-panel';
    panel.innerHTML = `
      <div class="detail-header">
        <h2>${node.label}</h2>
        <p>${node.summary}</p>
      </div>
      <div class="nav-buttons">
        <a class="nav-btn primary" href="${node.deepLink}" style="text-align:center;text-decoration:none;">Deep dive into ${node.label} \u2192</a>
      </div>
    `;
    return;
  }
```

This block must be inserted right after `const d = COURSE[currentId];` and before the existing `const step = d.steps[currentStep]` line.

- [ ] **Step 3: Commit**

```bash
git add skills/codemermaid/references/template-course.html
git commit -m "feat: add perspective mode to template-course.html runtime"
```

---

### Task 7: Verify all templates work together

**Files:**
- All templates in `skills/codemermaid/references/`

- [ ] **Step 1: Create a test output directory**

```bash
mkdir -p /tmp/codemermaid-test
```

- [ ] **Step 2: Create test index.html**

Copy `template-index.html` to `/tmp/codemermaid-test/index.html` and replace placeholders with:

- `{{PROJECT_NAME}}` → `Test Project`
- `{{PROJECT_DESCRIPTION}}` → `A test project to verify templates`
- `{{LANGUAGE}}` → `TypeScript`
- `{{FRAMEWORK}}` → `<span class="badge">React</span>`
- `{{INDEX_DATA}}` → the INDEX sample data from the spec

- [ ] **Step 3: Create test architecture.html**

Copy `template-course.html` to `/tmp/codemermaid-test/architecture.html` and replace placeholders with:

- `{{BREADCRUMB_TITLE}}` → `Architecture`
- `{{BACK_LINK}}` → `index.html`
- Add `PAGE_MODE = 'perspective'` and a `PERSPECTIVE` object with 3 nodes
- `{{MERMAID_GRAPH}}` → a simple `graph TD` with those 3 nodes

- [ ] **Step 4: Create test module page**

Copy `template-course.html` to `/tmp/codemermaid-test/module-auth.html` and replace with module-mode `COURSE` data (existing behavior).

- [ ] **Step 5: Open and verify all three pages**

```bash
open /tmp/codemermaid-test/index.html
```

Expected behavior:
1. **index.html**: Cards rendered, clicking a card navigates to the correct HTML file
2. **architecture.html**: Breadcrumb shows "← Test Project / Architecture", Mermaid renders, clicking node shows summary + "Deep dive →" link, clicking link goes to module-auth.html
3. **module-auth.html**: Breadcrumb shows "← Test Project / Auth Module", Mermaid renders, clicking node shows code step

- [ ] **Step 6: Commit if any fixes needed**

If verification reveals issues, fix them in the templates and commit.
