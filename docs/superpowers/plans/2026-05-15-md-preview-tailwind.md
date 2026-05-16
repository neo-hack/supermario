# md-preview Tailwind CSS Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace md-preview's vanilla CSS layout and typography with Tailwind CSS CDN + `@tailwindcss/typography` prose class for better markdown rendering and responsive layout.

**Architecture:** Add Tailwind CDN with typography plugin to `template.html`. Move layout (container, grid, topbar) to Tailwind utility classes on HTML elements. Apply `prose dark:prose-invert` to the content article. Strip typography/layout CSS from `style.css`, keeping only component styles (admonitions, task-lists, code extras, syntax highlighting, TOC cosmetics, comments system). Update `initThemeToggle()` to manage both `data-theme` and Tailwind `dark` class. Update SKILL.md TOC template with responsive Tailwind classes.

**Tech Stack:** Tailwind CSS CDN, @tailwindcss/typography, CSS custom properties, vanilla JS.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `.agents/skills/md-preview/assets/template.html` | Modify | Tailwind CDN + Tailwind utility classes on HTML |
| `.agents/skills/md-preview/assets/style.css` | Modify | Remove typography/layout, keep component styles |
| `.agents/skills/md-preview/assets/runtime.js` | Modify | Dual dark mode in theme toggle |
| `.agents/skills/md-preview/SKILL.md` | Modify | TOC sidebar template with responsive classes |

---

## Task 1: Update `template.html`

**Files:**
- Modify: `.agents/skills/md-preview/assets/template.html`

- [ ] **Step 1: Replace the full file content**

Replace `template.html` with:

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="source-file" content="<!-- SLOT:SOURCE -->">
  <title><!-- SLOT:TITLE --></title>
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          mono: ['Geist Mono', 'monospace'],
        },
      }
    }
  }
  </script>
  <style>
/* SLOT:STYLE */
  </style>
</head>
<body class="bg-[var(--bg)] text-[var(--text)]">
  <nav class="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 h-[52px] bg-[var(--bg)] border-b border-[var(--border-soft)]">
    <span class="text-sm font-semibold text-[var(--text)]"><!-- SLOT:TITLE --></span>
    <button class="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-dim)] rounded-md px-2.5 py-1.5 text-base cursor-pointer transition-opacity hover:opacity-70 leading-none" id="theme-toggle">&#9728;</button>
  </nav>
  <div class="w-full mx-auto px-4 md:px-8 pt-[68px] pb-40">
    <div class="grid grid-cols-[1fr_300px] xl:grid-cols-[200px_minmax(0,1fr)_300px] gap-8 items-start">
<!-- SLOT:TOC_SIDEBAR -->
      <article id="content" class="min-w-0 break-words prose dark:prose-invert max-w-none">
<!-- SLOT:CONTENT -->
      </article>
    </div>
  </div>
  <script>
/* SLOT:SCRIPT */
  </script>
</body>
</html>
```

Key changes:
- `<html>` gets `class="dark"` alongside `data-theme="dark"`
- Google Fonts `<link>` tags replaced with Tailwind CDN `<script>` + config
- `<body>` gets `bg-[var(--bg)] text-[var(--text)]`
- Topbar uses Tailwind utility classes
- Container uses `w-full mx-auto px-4 md:px-8 pt-[68px] pb-40`
- Grid uses `grid-cols-[1fr_300px] xl:grid-cols-[200px_minmax(0,1fr)_300px]`
- Article gets `prose dark:prose-invert max-w-none`

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/md-preview/assets/template.html
git commit -m "feat(md-preview): add Tailwind CDN + typography, use utility classes for layout"
```

---

## Task 2: Update `style.css`

**Files:**
- Modify: `.agents/skills/md-preview/assets/style.css`

This is the largest task. Remove typography and layout rules (now handled by Tailwind/prose). Keep component styles.

- [ ] **Step 1: Replace the full file content**

Replace `style.css` with:

```css
:root {
  --bg: #07080a;
  --surface: #101111;
  --surface-2: #161718;
  --border: hsl(195, 5%, 15%);
  --border-soft: hsl(195, 5%, 12%);
  --text: #f9f9f9;
  --text-dim: #9c9c9d;
  --text-faint: #6b6b6c;
  --accent: #FF6363;
  --accent-soft: rgba(255, 99, 99, 0.12);
  --code-bg: #0c0d0f;
  --highlight: rgba(255, 99, 99, 0.10);
  --shadow-card:
    0 1px 0 rgba(255,255,255,0.04) inset,
    0 0 0 1px rgba(255,255,255,0.02),
    0 8px 24px rgba(0,0,0,0.35),
    0 2px 6px rgba(0,0,0,0.25);
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  --green: #34d399;
  --green-soft: rgba(52, 211, 153, 0.12);
  --blue: hsl(202, 100%, 67%);
  --blue-soft: hsla(202, 100%, 67%, 0.12);
  --yellow: hsl(43, 100%, 60%);
  --yellow-soft: hsla(43, 100%, 60%, 0.12);
  --orange: hsl(24, 100%, 60%);
  --orange-soft: hsla(24, 100%, 60%, 0.12);
}

[data-theme="light"] {
  --bg: #ffffff;
  --surface: #f6f8fa;
  --surface-2: #eaeef2;
  --border: #d0d7de;
  --border-soft: #e0e5e9;
  --text: #1f2328;
  --text-dim: #656d76;
  --text-faint: #8b949e;
  --accent: #cf222e;
  --accent-soft: rgba(207, 34, 46, 0.08);
  --code-bg: #f6f8fa;
  --highlight: rgba(207, 34, 46, 0.06);
  --shadow-card:
    0 1px 0 rgba(0,0,0,0.04) inset,
    0 0 0 1px rgba(0,0,0,0.04),
    0 8px 24px rgba(0,0,0,0.08),
    0 2px 6px rgba(0,0,0,0.04);
  --green: #1a7f37;
  --green-soft: rgba(26, 127, 55, 0.08);
  --blue: #0969da;
  --blue-soft: rgba(9, 105, 218, 0.08);
  --yellow: #9a6700;
  --yellow-soft: rgba(154, 103, 0, 0.08);
  --orange: #bc4c00;
  --orange-soft: rgba(188, 76, 0, 0.08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
* { scrollbar-color: rgba(156,156,157,0.42) rgba(255,255,255,0.035); scrollbar-width: thin; }
*::-webkit-scrollbar { width: 10px; height: 10px; }
*::-webkit-scrollbar-track { background: rgba(255,255,255,0.035); border-radius: 999px; }
*::-webkit-scrollbar-thumb { background: rgba(156,156,157,0.42); border: 2px solid var(--bg); border-radius: 999px; }
*::-webkit-scrollbar-thumb:hover { background: rgba(249,249,249,0.58); }

html, body {
  font-feature-settings: 'calt', 'kern', 'liga', 'ss03';
  letter-spacing: 0.2px;
  font-weight: 400;
  line-height: 1.65;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}

.task-list { @apply list-none pl-0; }
.task-list li { @apply flex items-start gap-2.5 py-1.5; }
.task-list input[type="checkbox"] {
  @apply appearance-none w-[18px] h-[18px] border rounded bg-[var(--surface)]
         shrink-0 mt-[3px] cursor-pointer relative;
  border-color: var(--border);
}
.task-list input[type="checkbox"]:checked { background: var(--green); border-color: var(--green); }
.task-list input[type="checkbox"]:checked::after {
  content: '\2713'; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); font-size: 11px; color: white; font-weight: 700;
}

.admonition { @apply py-4 px-5 my-5 rounded-lg border-l-4; }
.admonition-title { @apply text-[13px] font-semibold uppercase tracking-wider mb-2; }
.admonition p { @apply mb-0 text-[15px]; }
.admonition-note { border-color: var(--blue); background: var(--blue-soft); }
.admonition-note .admonition-title { color: var(--blue); }
.admonition-warning { border-color: var(--yellow); background: var(--yellow-soft); }
.admonition-warning .admonition-title { color: var(--yellow); }
.admonition-tip { border-color: var(--green); background: var(--green-soft); }
.admonition-tip .admonition-title { color: var(--green); }
.admonition-caution { border-color: var(--orange); background: var(--orange-soft); }
.admonition-caution .admonition-title { color: var(--orange); }

pre {
  @apply rounded-xl py-[18px] px-5 overflow-x-auto my-5 relative;
  background: var(--code-bg); border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
}
pre code { @apply text-[13.5px] leading-[1.7]; color: var(--text); }
.code-lang {
  @apply absolute top-2 right-3 font-mono text-[11px] bg-[var(--surface-2)]
         px-2 py-[2px] rounded border uppercase tracking-wider;
  color: var(--text-faint);
  border-color: var(--border-soft);
}
.copy-btn {
  @apply absolute top-2 right-[72px] bg-[var(--surface-2)] border rounded
         px-2 py-[3px] font-sans text-[11px] font-semibold tracking-tight
         cursor-pointer opacity-0 transition-opacity;
  color: var(--text-faint);
  border-color: var(--border-soft);
}
pre:hover .copy-btn { @apply opacity-100; }
.copy-btn:hover { color: var(--text); border-color: var(--border); }

.tok-keyword { color: #ff7b72; }
.tok-string { color: #a5d6ff; }
.tok-function { color: #d2a8ff; }
.tok-comment { color: #8b949e; font-style: italic; }
.tok-type { color: #79c0ff; }
.tok-variable { color: #ffa657; }
.tok-number { color: #79c0ff; }
.tok-tag { color: #7ee787; }
.tok-attr { color: #79c0ff; }
.tok-punctuation { color: #8b949e; }
.tok-selector { color: #7ee787; }
.tok-property { color: #79c0ff; }
.tok-value { color: #a5d6ff; }

[data-theme="light"] .tok-keyword { color: #cf222e; }
[data-theme="light"] .tok-string { color: #0a3069; }
[data-theme="light"] .tok-function { color: #8250df; }
[data-theme="light"] .tok-comment { color: #8b949e; font-style: italic; }
[data-theme="light"] .tok-type { color: #0550ae; }
[data-theme="light"] .tok-variable { color: #953800; }
[data-theme="light"] .tok-number { color: #0550ae; }
[data-theme="light"] .tok-tag { color: #116329; }
[data-theme="light"] .tok-attr { color: #0550ae; }
[data-theme="light"] .tok-punctuation { color: #6e7781; }
[data-theme="light"] .tok-selector { color: #6639ba; }
[data-theme="light"] .tok-property { color: #0550ae; }
[data-theme="light"] .tok-value { color: #0a3069; }

.toc-sidebar nav {
  border-right: 1px solid var(--border-soft);
  padding-right: 16px;
}
.toc-sidebar-title {
  @apply text-[11px] font-semibold uppercase tracking-[1.2px] mb-3;
  color: var(--text-faint);
}
.toc-sidebar ul {
  @apply list-none p-0 m-0 flex flex-col gap-[1px];
}
.toc-sidebar li { @apply m-0; }
.toc-sidebar a {
  @apply block py-[5px] px-2.5 text-[13px] no-underline rounded leading-snug
         truncate transition-colors duration-150;
  color: var(--text-faint);
}
.toc-sidebar a:hover {
  color: var(--text-dim);
  background: rgba(255,255,255,0.03);
}
[data-theme="light"] .toc-sidebar a:hover {
  background: rgba(0,0,0,0.03);
}
.toc-sidebar a.active {
  color: var(--accent);
  background: var(--accent-soft);
  @apply font-medium;
}
.toc-sidebar .toc-h3 a {
  @apply pl-[22px] text-xs;
}

.shiki-wrapper { @apply relative; }
.shiki-wrapper pre.shiki-dark { @apply block; }
.shiki-wrapper pre.shiki-light { @apply hidden; }
[data-theme="light"] .shiki-wrapper pre.shiki-dark { @apply hidden; }
[data-theme="light"] .shiki-wrapper pre.shiki-light { @apply block; }
.shiki-wrapper pre {
  @apply m-0 !bg-transparent !border-none !shadow-none !p-0;
}

.comment-tooltip {
  @apply absolute z-[300] text-white px-3 py-1 rounded-md text-xs font-semibold
         tracking-tight cursor-pointer whitespace-nowrap transition-opacity;
  background: var(--accent);
  box-shadow: var(--shadow-card);
}
.comment-tooltip:hover { @apply opacity-90; }

.comment-popover {
  @apply absolute z-[400] w-[340px] rounded-xl p-4;
  background: var(--surface); border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
}
.comment-popover-loc {
  @apply font-mono text-[11px] mb-2;
  color: var(--text-faint);
}
.comment-popover-preview {
  @apply text-[13px] bg-[var(--surface-2)] rounded-md px-3 py-2 mb-3
         max-h-[80px] overflow-y-auto leading-snug whitespace-pre-wrap break-words;
  color: var(--text-dim);
  border: 1px solid var(--border-soft);
}
.comment-popover-input {
  @apply w-full rounded-lg px-3 py-2.5 text-sm leading-snug resize-y min-h-[60px];
  background: var(--surface-2); border: 1px solid var(--border);
  color: var(--text); font-family: var(--font-primary);
}
.comment-popover-input:focus { @apply outline-none; border-color: var(--accent); }
.comment-popover-input::placeholder { color: var(--text-faint); }
.comment-popover-actions { @apply flex justify-end gap-2 mt-3; }
.comment-popover-cancel,
.comment-popover-add {
  @apply px-4 py-1.5 rounded-md font-sans text-[13px] font-semibold cursor-pointer;
  border: 1px solid var(--border);
}
.comment-popover-cancel {
  @apply bg-[var(--surface-2)];
  color: var(--text-dim);
}
.comment-popover-add {
  @apply text-white;
  background: var(--accent); border-color: var(--accent);
}
.comment-popover-add:hover { @apply opacity-90; }

.comment-highlight {
  background: rgba(255, 212, 0, 0.2);
  border-bottom: 2px solid rgba(255, 212, 0, 0.6);
  @apply rounded-[2px] py-px;
}
[data-theme="light"] .comment-highlight {
  background: rgba(255, 180, 0, 0.15);
  border-bottom-color: rgba(255, 180, 0, 0.5);
}

.comment-badge {
  @apply inline-flex items-center justify-center w-[18px] h-[18px] rounded-full
         text-white text-[10px] font-bold cursor-pointer align-middle ml-0.5
         leading-none transition-opacity;
  background: var(--accent);
}
.comment-badge:hover { @apply opacity-80; }

.comment-card {
  @apply rounded-lg overflow-hidden transition-colors;
  background: var(--surface); border: 1px solid var(--border-soft);
}
.comment-card.active { border-color: var(--accent); }
.comment-card-header {
  @apply flex justify-between items-center px-3 py-2 font-mono text-[11px];
  color: var(--text-faint);
}
.comment-card-delete {
  @apply bg-transparent border-none text-base cursor-pointer px-1 leading-none transition-colors;
  color: var(--text-faint);
}
.comment-card-delete:hover { color: var(--accent); }
.comment-card-body {
  @apply px-3 pt-2 pb-2.5 text-[13px] leading-snug whitespace-pre-wrap break-words;
  color: var(--text);
}
.comment-card-preview {
  @apply px-3 pb-2 text-[11px] font-mono leading-snug max-h-[48px] overflow-hidden;
  color: var(--text-faint);
}

.comments-panel {
  @apply sticky top-[68px] max-h-[calc(100vh-84px)] overflow-y-auto flex flex-col;
}
.comments-panel-header { @apply flex justify-between items-center mb-3; }
.comments-panel-title {
  @apply text-[11px] font-semibold uppercase tracking-[1.2px];
  color: var(--text-faint);
}
.comments-panel-actions { @apply flex gap-1.5; }
.comments-panel-btn {
  @apply px-2.5 py-[3px] rounded font-sans text-[11px] font-medium cursor-pointer transition-opacity;
  background: var(--surface-2); border: 1px solid var(--border-soft);
  color: var(--text-faint);
}
.comments-panel-btn:hover { @apply opacity-80; }
.comments-panel-empty {
  @apply text-xs text-center py-6;
  color: var(--text-faint);
}
.comments-panel-list { @apply flex flex-col gap-2; }
```

What was removed (handled by Tailwind/prose):
- `a, a:hover` link styles
- `code, pre` font-family
- `.topbar, .topbar-title, .theme-toggle` layout
- `.container` layout
- `h1, h2, h3, h4` heading styles
- `p, p strong` paragraph styles
- `ul, ol, li` list styles
- `blockquote` styles
- `table, th, td, tr` table styles
- `code:not(pre code)` inline code styles
- `hr` horizontal rule
- `.page-layout, #content` grid layout
- `.toc-sidebar` layout (sticky, top, max-height, overflow)
- Both `@media` queries

What was kept and converted to `@apply`:
- CSS variables / theme (cannot use @apply)
- Scrollbar styles (pseudo-elements, cannot use @apply)
- `html, body` font-feature-settings (not a Tailwind utility)
- `.task-list` custom checkbox
- `.admonition` callout boxes
- `pre, pre code, .code-lang, .copy-btn` code block extras
- `.tok-*` syntax highlighting (simple color tokens, no @apply benefit)
- `.toc-sidebar` cosmetic styles (nav border, link colors, hover/active)
- `.shiki-wrapper` dual theme
- Full comments system

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/md-preview/assets/style.css
git commit -m "feat(md-preview): remove typography/layout CSS, keep component styles for Tailwind migration"
```

---

## Task 3: Update `runtime.js`

**Files:**
- Modify: `.agents/skills/md-preview/assets/runtime.js`

Update `initThemeToggle()` to manage both `data-theme` attribute (CSS variables) and `dark` class (Tailwind).

- [ ] **Step 1: Replace `initThemeToggle` function**

Find the `initThemeToggle` function (starts at `function initThemeToggle() {`) and replace it with:

```javascript
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    html.classList.toggle('dark', theme === 'dark');
    toggle.textContent = theme === 'dark' ? '\u2600' : '\uD83C\uDF19';
    localStorage.setItem('md-preview-theme', theme);
  }

  const saved = localStorage.getItem('md-preview-theme');
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  } else {
    applyTheme('dark');
  }

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}
```

Key changes:
- New `applyTheme()` helper sets both `data-theme` attribute and `dark` class
- Default to dark theme when no preference saved and system prefers dark
- Toggle click uses `applyTheme()` for consistent dual-mode switching

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/md-preview/assets/runtime.js
git commit -m "feat(md-preview): dual dark mode — data-theme attr + Tailwind dark class"
```

---

## Task 4: Update SKILL.md TOC template

**Files:**
- Modify: `.agents/skills/md-preview/SKILL.md`

- [ ] **Step 1: Update TOC sidebar template**

In SKILL.md, find the TOC sidebar template at the `## TOC Sidebar Generation` section. Replace:

```html
<aside class="toc-sidebar">
```

with:

```html
<aside class="toc-sidebar hidden xl:block sticky top-[68px] max-h-[calc(100vh-84px)] overflow-y-auto">
```

This makes the TOC sidebar:
- Hidden by default (`hidden`)
- Visible at xl breakpoint and above (`xl:block`)
- Sticky positioned with scroll containment (via Tailwind utilities)

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/md-preview/SKILL.md
git commit -m "feat(md-preview): add responsive Tailwind classes to TOC sidebar template"
```

---

## Task 5: Verify with test page

**Files:**
- Regenerate: `docs/md-preview/2026-05-13-codemermaid-v2-direct-html.html`

- [ ] **Step 1: Regenerate preview**

Run the conversion script to regenerate the test page using the updated template, style, and runtime:

```bash
python3 /var/folders/b1/0fd1b6hs7lz0fm_mh346lybm0000gn/T/opencode/convert_md.py \
  docs/superpowers/plans/2026-05-13-codemermaid-v2-direct-html.md \
  .agents/skills/md-preview/assets/template.html \
  .agents/skills/md-preview/assets/style.css \
  .agents/skills/md-preview/assets/runtime.js \
  docs/md-preview/2026-05-13-codemermaid-v2-direct-html.html
```

- [ ] **Step 2: Open and verify**

```bash
open docs/md-preview/2026-05-13-codemermaid-v2-direct-html.html
```

Check in browser:
- Tailwind CSS loads from CDN
- Prose typography renders (headings, paragraphs, lists, tables, code blocks)
- Dark theme renders correctly
- Theme toggle switches between dark/light (both CSS variables and Tailwind dark class)
- Code blocks show shiki syntax highlighting
- TOC sidebar is hidden below 1280px, visible above
- Comments panel is always visible in right column
- No horizontal scrolling
- 2-col layout (content + comments) below 1280px
- 3-col layout (TOC + content + comments) at 1280px+

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Update `template.html` with Tailwind CDN + utility classes | 5 min |
| 2 | Strip typography/layout CSS from `style.css` | 10 min |
| 3 | Update `runtime.js` theme toggle for dual dark mode | 3 min |
| 4 | Update SKILL.md TOC template with responsive classes | 2 min |
| 5 | Regenerate preview and verify | 5 min |
| **Total** | | **~25 min** |
