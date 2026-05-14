# MD Preview Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an agent skill that converts markdown files into styled HTML preview pages with code syntax highlighting, Mermaid diagram rendering, light/dark theme toggle, and sticky TOC sidebar.

**Architecture:** Agent reads MD, manually converts to HTML, fills template slots, copies CSS/JS assets to output directory, opens in browser. Runtime JS handles only shiki highlighting, Mermaid rendering, theme toggle, and TOC scroll tracking. No remark, no Node scripts, no npm.

**Tech Stack:** Vanilla HTML/CSS/JS, shiki (ESM CDN), Mermaid v11 (ESM CDN), Inter + Geist Mono (Google Fonts CDN). Raycast-inspired design system from `skills/codemermaid/DESIGN.md`.

---

## File Structure

```
skills/md-preview/
  SKILL.md                    # Skill instructions — agent reads this to know the workflow
  assets/
    template.html             # HTML shell with <!-- SLOT:TITLE -->, <!-- SLOT:CONTENT -->, <!-- SLOT:TOC_SIDEBAR -->
    style.css                 # Dark + light theme variables, markdown element styles, TOC sidebar, code blocks
    runtime.js                # ESM module: shiki init, Mermaid init, theme toggle, TOC scroll tracking, copy buttons

Output (per invocation):
docs/md-preview/
  <filename>.html             # Generated from template.html with content filled in
  style.css                   # Copied from assets/
  runtime.js                  # Copied from assets/
```

Files to reference during implementation:
- `skills/codemermaid/assets/style.css` — CSS variable names, shadow system, typography tokens to reuse
- `skills/codemermaid/DESIGN.md` — Design rationale and do's/don'ts
- `skills/mockup/SKILL.md` — Example SKILL.md format to follow
- `/var/folders/b1/0fd1b6hs7lz0fm_mh346lybm0000gn/T/opencode/md-preview-wireframe.html` — Working wireframe with all styles

---

## Task 1: Create `skills/md-preview/assets/style.css`

**Files:**
- Create: `skills/md-preview/assets/style.css`

This is the largest file. Contains all styling: CSS variables (dark + light), base reset, typography, markdown element styles, code blocks, tables, admonitions, task lists, TOC sidebar, topbar, responsive breakpoints.

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p skills/md-preview/assets
```

- [ ] **Step 2: Create `style.css`**

Copy the complete CSS from the wireframe at `/var/folders/b1/0fd1b6hs7lz0fm_mh346lybm0000gn/T/opencode/md-preview-wireframe.html` (the `<style>` block). This wireframe has been visually validated with real plan content. It contains:

- `:root` dark theme variables (same naming as codemermaid: `--bg`, `--surface`, `--surface-2`, `--border`, `--border-soft`, `--text`, `--text-dim`, `--text-faint`, `--accent`, `--accent-soft`, `--code-bg`, `--highlight`, `--shadow-card`, `--font-primary`, `--font-mono`, `--green`, `--green-soft`, `--blue`, `--blue-soft`, `--yellow`, `--yellow-soft`, `--orange`, `--orange-soft`)
- `[data-theme="light"]` overrides (white bg, GitHub-style light colors, adjusted shadows)
- Scrollbar styling
- Base reset and body typography
- `.topbar` fixed nav with `.topbar-title` and `.theme-toggle` button
- `.container` (80% width, 900-1400px)
- Typography: `h1` (44px/600), `h2` (26px/600 with bottom border), `h3` (18px/600), `h4` (15px/600), `p`, `a`
- `ul`, `ol`, `li` lists
- `.task-list` with custom checkbox styling (`.task-list input[type="checkbox"]`)
- `blockquote` (accent left border + accent-soft background)
- `.admonition` base + `.admonition-note` (blue), `.admonition-warning` (yellow), `.admonition-tip` (green), `.admonition-caution` (orange)
- `table` with `th`, `td`, zebra striping
- `code:not(pre code)` inline code
- `pre` code blocks with `.code-lang` label and `.copy-btn`
- Shiki token classes for both dark and light themes: `.tok-keyword`, `.tok-string`, `.tok-function`, `.tok-comment`, `.tok-type`, `.tok-variable`, `.tok-number`, `.tok-tag`, `.tok-attr`, `.tok-punctuation`, `.tok-selector`, `.tok-property`, `.tok-value`
- `hr` divider
- `.page-layout` grid (1fr + 220px sidebar)
- `.toc-sidebar` sticky positioning with `.toc-sidebar-title`, `.toc-sidebar ul`, `.toc-sidebar a`, `.toc-sidebar a.active`, `.toc-sidebar .toc-h3 a` indented
- Responsive: `@media (max-width: 1100px)` hides sidebar, `@media (max-width: 960px)` collapses container

After copying, verify the file was created:

```bash
wc -l skills/md-preview/assets/style.css
```

Expected: ~230+ lines

- [ ] **Step 3: Commit**

```bash
git add skills/md-preview/assets/style.css
git commit -m "feat(md-preview): add style.css with Raycast dark/light theme and markdown element styles"
```

---

## Task 2: Create `skills/md-preview/assets/runtime.js`

**Files:**
- Create: `skills/md-preview/assets/runtime.js`

Runtime module loaded via `<script type="module">`. Four concerns: shiki highlighting, Mermaid rendering, theme toggle, TOC scroll tracking.

- [ ] **Step 1: Create `runtime.js`**

```js
async function initShiki() {
  const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
  if (codeBlocks.length === 0) return;

  const { createHighlighter } = await import('https://esm.sh/shiki');
  const highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['typescript', 'python', 'bash', 'css', 'html', 'json', 'yaml', 'rust', 'go', 'sql', 'markdown', 'jsx', 'tsx', 'diff']
  });

  codeBlocks.forEach(block => {
    const lang = Array.from(block.classList)
      .find(c => c.startsWith('language-'))
      ?.replace('language-', '') || 'text';
    
    if (lang === 'mermaid') return;
    if (lang === 'text') return;

    try {
      if (!highlighter.getLoadedLanguages().includes(lang)) return;
      const darkHtml = highlighter.codeToHtml(block.textContent, { lang, theme: 'github-dark' });
      const lightHtml = highlighter.codeToHtml(block.textContent, { lang, theme: 'github-light' });

      const wrapper = document.createElement('div');
      wrapper.className = 'shiki-wrapper';
      wrapper.innerHTML = darkHtml;
      wrapper.querySelector('pre')?.classList.add('shiki-dark');
      const lightPre = document.createElement('pre');
      lightPre.className = 'shiki-light';
      lightPre.innerHTML = new DOMParser().parseFromString(lightHtml, 'text/html').querySelector('pre')?.innerHTML || '';
      wrapper.appendChild(lightPre);

      const pre = block.parentElement;
      const langLabel = pre.querySelector('.code-lang');
      const copyBtn = pre.querySelector('.copy-btn');
      pre.innerHTML = '';
      if (langLabel) pre.appendChild(langLabel);
      if (copyBtn) pre.appendChild(copyBtn);
      pre.appendChild(wrapper);
    } catch (e) {
      // Language not supported, leave as plain text
    }
  });
}

function initMermaid() {
  const mermaidBlocks = document.querySelectorAll('pre.mermaid');
  if (mermaidBlocks.length === 0) return;

  import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs').then(mermaid => {
    mermaid.default.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#101111',
        primaryColor: '#1b1c1e',
        primaryTextColor: '#f9f9f9',
        primaryBorderColor: '#252829',
        lineColor: '#9c9c9d',
        secondaryColor: '#161718',
        tertiaryColor: '#07080a'
      }
    });
    mermaid.default.run({ nodes: mermaidBlocks });
  });
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const saved = localStorage.getItem('md-preview-theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
    toggle.textContent = saved === 'dark' ? '\u2600' : '\uD83C\uDF19';
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    html.setAttribute('data-theme', 'light');
    toggle.textContent = '\uD83C\uDF19';
  }

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    toggle.textContent = next === 'dark' ? '\u2600' : '\uD83C\uDF19';
    localStorage.setItem('md-preview-theme', next);
  });
}

function initTocScroll() {
  const tocLinks = document.querySelectorAll('.toc-sidebar a');
  const headings = document.querySelectorAll('article h2[id], article h3[id]');
  if (tocLinks.length === 0 || headings.length === 0) return;

  let active = null;
  function updateToc() {
    const top = 80;
    let current = null;
    for (const h of headings) {
      if (h.getBoundingClientRect().top <= top) current = h;
    }
    if (current && current !== active) {
      active = current;
      tocLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
      });
      history.replaceState(null, '', '#' + current.id);
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateToc(); ticking = false; });
  }, { passive: true });
  updateToc();
}

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('pre');
      const code = pre.querySelector('code') || pre.querySelector('.shiki-wrapper');
      const text = code ? code.textContent : '';
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    });
  });
}

initThemeToggle();
initTocScroll();
initCopyButtons();
initShiki();
initMermaid();
```

- [ ] **Step 2: Verify file**

```bash
wc -l skills/md-preview/assets/runtime.js
```

Expected: ~120+ lines

- [ ] **Step 3: Commit**

```bash
git add skills/md-preview/assets/runtime.js
git commit -m "feat(md-preview): add runtime.js with shiki, mermaid, theme toggle, TOC tracking"
```

---

## Task 3: Create `skills/md-preview/assets/template.html`

**Files:**
- Create: `skills/md-preview/assets/template.html`

HTML shell with three slots: `<!-- SLOT:TITLE -->`, `<!-- SLOT:CONTENT -->`, `<!-- SLOT:TOC_SIDEBAR -->`.

- [ ] **Step 1: Create `template.html`**

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><!-- SLOT:TITLE --></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="topbar">
    <span class="topbar-title"><!-- SLOT:TITLE --></span>
    <button class="theme-toggle" id="theme-toggle">&#9728;</button>
  </nav>
  <div class="container">
    <div class="page-layout">
      <article id="content">
<!-- SLOT:CONTENT -->
      </article>
<!-- SLOT:TOC_SIDEBAR -->
    </div>
  </div>
  <script type="module" src="runtime.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify**

```bash
cat skills/md-preview/assets/template.html | grep 'SLOT:'
```

Expected: three lines with `SLOT:TITLE` (x2), `SLOT:CONTENT`, `SLOT:TOC_SIDEBAR`

- [ ] **Step 3: Commit**

```bash
git add skills/md-preview/assets/template.html
git commit -m "feat(md-preview): add template.html with title, content, and TOC sidebar slots"
```

---

## Task 4: Add shiki dual-theme CSS to `style.css`

**Files:**
- Modify: `skills/md-preview/assets/style.css`

The runtime.js creates two `<pre>` elements (one for dark, one for light). CSS must toggle visibility based on `[data-theme]`.

- [ ] **Step 1: Append shiki dual-theme styles to the end of `style.css`**

Add these rules after the existing responsive media queries:

```css
/* ===== SHIKI DUAL THEME ===== */
.shiki-wrapper {
  position: relative;
}
.shiki-wrapper pre.shiki-dark {
  display: block;
}
.shiki-wrapper pre.shiki-light {
  display: none;
}
[data-theme="light"] .shiki-wrapper pre.shiki-dark {
  display: none;
}
[data-theme="light"] .shiki-wrapper pre.shiki-light {
  display: block;
}
.shiki-wrapper pre {
  margin: 0;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}
```

- [ ] **Step 2: Verify**

```bash
grep -c 'shiki-wrapper' skills/md-preview/assets/style.css
```

Expected: 5+

- [ ] **Step 3: Commit**

```bash
git add skills/md-preview/assets/style.css
git commit -m "feat(md-preview): add shiki dual-theme visibility CSS"
```

---

## Task 5: Create `skills/md-preview/SKILL.md`

**Files:**
- Create: `skills/md-preview/SKILL.md`

This is the file the agent reads to understand how to use the skill. Follows the same format as `skills/mockup/SKILL.md`.

- [ ] **Step 1: Create `SKILL.md`**

```markdown
---
name: md-preview
description: Convert markdown files into styled HTML preview pages with code syntax highlighting, Mermaid diagram rendering, and light/dark theme toggle. Use when asked to preview, render, or display a markdown file as HTML.
---

# MD Preview

Generate a styled HTML preview page from a markdown file. The output is a self-contained HTML page with Raycast-inspired design, code syntax highlighting, Mermaid diagram rendering, and light/dark theme toggle.

## Workflow

1. Read the target `.md` file.
2. Create output directory: `docs/md-preview/` (if it doesn't exist).
3. Copy `skills/md-preview/assets/style.css` and `skills/md-preview/assets/runtime.js` to `docs/md-preview/`.
4. Read `skills/md-preview/assets/template.html` as the HTML shell.
5. Convert the markdown content to HTML manually (see MD→HTML rules below).
6. Generate a TOC sidebar from all h2/h3 headings.
7. Fill the template slots:
   - `<!-- SLOT:TITLE -->` — page title and topbar (use first h1 text or filename)
   - `<!-- SLOT:CONTENT -->` — the converted HTML content
   - `<!-- SLOT:TOC_SIDEBAR -->` — the generated TOC sidebar HTML
8. Write the result to `docs/md-preview/<filename>.html` (same basename as source).
9. Run `open docs/md-preview/<filename>.html`.

## MD → HTML Conversion Rules

### Headings

All h2 and h3 elements MUST have an `id` attribute. Generate the id by slugifying the heading text: lowercase, replace spaces with hyphens, remove non-alphanumeric characters except hyphens, strip leading/trailing hyphens. If duplicate ids exist, append `-2`, `-3`, etc.

```html
<h1>Title</h1>
<h2 id="section-name">Section Name</h2>
<h3 id="subsection-name">Subsection Name</h3>
```

### Code Blocks

Wrap in `<pre>` with a language label and copy button. The `<code>` element gets `class="language-xxx"`.

```html
<pre><code class="language-typescript">const x = 1;</code><span class="code-lang">typescript</span><button class="copy-btn">Copy</button></pre>
```

For unknown language, omit the class: `<pre><code>...</code></pre>`.

For Mermaid blocks, use `<pre class="mermaid">` without a `<code>` wrapper:

```html
<pre class="mermaid">graph TD
  A --> B</pre>
```

### Inline Code

```html
<code>variable_name</code>
```

### Bold and Italic

```html
<strong>bold text</strong>
<em>italic text</em>
```

### Links

```html
<a href="url">link text</a>
```

### Images

```html
<img src="url" alt="alt text">
```

### Lists

```html
<ul>
  <li>Item</li>
</ul>
<ol>
  <li>Item</li>
</ol>
```

### Task Lists

```html
<ul class="task-list">
  <li><input type="checkbox"> <span>Unchecked task</span></li>
  <li><input type="checkbox" checked disabled> <span>Completed task</span></li>
</ul>
```

### Tables

```html
<table>
  <thead>
    <tr><th>Header 1</th><th>Header 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Cell 1</td><td>Cell 2</td></tr>
  </tbody>
</table>
```

### Blockquotes

```html
<blockquote>
  <p>Quoted text</p>
</blockquote>
```

### Admonitions

Parse GitHub-style admonitions from blockquotes:

```html
<div class="admonition admonition-note">
  <div class="admonition-title">NOTE</div>
  <p>Note content</p>
</div>
```

Supported types: `NOTE` (blue), `WARNING` (yellow), `TIP` (green), `CAUTION` (orange). The type maps to the CSS class suffix.

### Horizontal Rules

```html
<hr>
```

## TOC Sidebar Generation

After converting all markdown to HTML, scan the converted content for all h2 and h3 elements. Build the sidebar HTML:

```html
<aside class="toc-sidebar">
  <nav>
    <div class="toc-sidebar-title">On this page</div>
    <ul>
      <li><a href="#section-id">Section Title</a></li>
      <li class="toc-h3"><a href="#subsection-id">Subsection Title</a></li>
    </ul>
  </nav>
</aside>
```

Rules:
- h2 entries are top-level `<li>` elements
- h3 entries get `class="toc-h3"` for indentation
- Each `<a href>` uses the heading's `id` as the anchor
- The link text is the heading text (trimmed)
- h4 and below are NOT included in the TOC

## HTML Entity Escaping

Inside code blocks (`<pre><code>`), escape these characters:
- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`

Do NOT escape these in regular content — only inside code contexts.

## Verification

After generating the HTML file:

```bash
test -s docs/md-preview/<filename>.html
test -s docs/md-preview/style.css
test -s docs/md-preview/runtime.js
open docs/md-preview/<filename>.html
```

## Debugging

If the page looks wrong:
1. Check the browser DevTools console for errors
2. Verify `style.css` and `runtime.js` are in the same directory as the HTML file
3. Verify all heading ids are unique and match TOC links
4. Verify code blocks have `class="language-xxx"` for shiki to detect
5. Verify mermaid blocks use `<pre class="mermaid">` not `<pre><code class="language-mermaid">`
```

- [ ] **Step 2: Verify**

```bash
head -5 skills/md-preview/SKILL.md
```

Expected: frontmatter with `name: md-preview`

- [ ] **Step 3: Commit**

```bash
git add skills/md-preview/SKILL.md
git commit -m "feat(md-preview): add SKILL.md with complete MD→HTML conversion guide"
```

---

## Task 6: Generate test preview and validate

**Files:**
- Create: `docs/md-preview/codemermaid-v2-direct-html.html` (generated)
- Create: `docs/md-preview/style.css` (copied)
- Create: `docs/md-preview/runtime.js` (copied)

Test the full workflow by using the skill to preview a real plan file.

- [ ] **Step 1: Create output directory and copy assets**

```bash
mkdir -p docs/md-preview
cp skills/md-preview/assets/style.css docs/md-preview/
cp skills/md-preview/assets/runtime.js docs/md-preview/
```

- [ ] **Step 2: Verify assets copied**

```bash
test -s docs/md-preview/style.css && test -s docs/md-preview/runtime.js && echo "OK"
```

Expected: `OK`

- [ ] **Step 3: Generate preview HTML from a real plan file**

Use the skill to generate HTML from `docs/superpowers/plans/2026-05-13-codemermaid-v2-direct-html.md`. Follow the SKILL.md workflow:

1. Read the MD file content
2. Read `skills/md-preview/assets/template.html`
3. Convert all MD elements to HTML following the conversion rules
4. Generate TOC sidebar from h2/h3 headings
5. Fill slots and write to `docs/md-preview/codemermaid-v2-direct-html.html`

- [ ] **Step 4: Verify output**

```bash
test -s docs/md-preview/codemermaid-v2-direct-html.html && echo "OK"
```

Expected: `OK`

- [ ] **Step 5: Open and visually validate**

```bash
open docs/md-preview/codemermaid-v2-direct-html.html
```

Check in browser:
- Dark theme renders correctly
- Theme toggle switches to light and back
- Code blocks show shiki syntax highlighting (both themes)
- TOC sidebar highlights active section on scroll
- Clicking TOC links scrolls to section
- Tables render with zebra striping
- Admonitions render with correct colors
- Task list checkboxes render
- Copy buttons work on code blocks
- Mermaid diagrams render (if present in the MD)
- Responsive: sidebar hides below 1100px

- [ ] **Step 6: Commit**

```bash
git add docs/md-preview/
git commit -m "feat(md-preview): generate test preview from codemermaid-v2 plan"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Create `style.css` (dark/light theme, all markdown styles) | 5 min |
| 2 | Create `runtime.js` (shiki, mermaid, theme, TOC, copy) | 10 min |
| 3 | Create `template.html` (three-slot HTML shell) | 3 min |
| 4 | Add shiki dual-theme CSS to `style.css` | 3 min |
| 5 | Create `SKILL.md` (complete agent instructions) | 10 min |
| 6 | Generate test preview and validate | 10 min |
| **Total** | | **~40 min** |
