# MD Preview Skill Design

## Goal

Create an agent skill that converts markdown files into styled HTML preview pages with code syntax highlighting, Mermaid diagram rendering, and light/dark theme toggle. The agent reads the source MD and writes HTML directly — no markdown parser dependency.

## Architecture

**Agent reads MD → writes complete HTML → `open` in browser**

1. Agent reads target `.md` file
2. Agent converts MD to HTML manually (headings, paragraphs, lists, tables, code blocks, admonitions, etc.)
3. Agent writes HTML into `template.html` slots (`<!-- SLOT:TITLE -->`, `<!-- SLOT:CONTENT -->`)
4. Agent copies `style.css` and `runtime.js` to output directory
5. Agent runs `open docs/md-preview/<filename>.html`

**No Node.js scripts, no remark, no build step.** The agent is the MD→HTML converter.

## File Structure

```
skills/md-preview/
  SKILL.md                    # Skill instructions for the agent
  assets/
    template.html             # HTML shell with <!-- SLOT:TITLE --> and <!-- SLOT:CONTENT -->
    style.css                 # Raycast design system (dark) + light theme override + markdown element styles
    runtime.js                # shiki init + Mermaid init + theme toggle (~50 lines)

Output:
docs/md-preview/
  <filename>.html             # Generated HTML with rendered content
  style.css                   # Copied from assets/
  runtime.js                  # Copied from assets/
```

## Agent Responsibilities

The agent converts all standard and extended markdown to HTML:

| MD Element | HTML Output |
|------------|-------------|
| `# h1` – `#### h4` | `<h1>` – `<h4>` |
| Paragraphs | `<p>` |
| `**bold**`, `*italic*` | `<strong>`, `<em>` |
| `- [ ] task`, `- [x] done` | `<input type="checkbox">` in `<li>` |
| Ordered / unordered lists | `<ol>`, `<ul>`, `<li>` |
| Tables (GFM) | `<table>` with `<thead>`, `<tbody>` |
| `> blockquote` | `<blockquote>` |
| `> [!NOTE]`, `> [!WARNING]`, etc. | `<div class="admonition admonition-note">` with `::before` pseudo-element icon + title `<div class="admonition-title">` |
| `` ```lang code ``` `` | `<pre><code class="language-xxx">...</code></pre>` |
| `` ```mermaid ``` `` | `<pre class="mermaid">...</pre>` |
| `![alt](url)` | `<img src="url" alt="alt">` |
| `[text](url)` | `<a href="url">text</a>` |
| `---` | `<hr>` |
| Inline code | `<code>...</code>` |

## Runtime.js Responsibilities

Three concerns only:

### 1. Shiki Code Highlighting

Loads shiki via ESM CDN with dual themes:

```js
const highlighter = await createHighlighter({
  themes: ['github-light', 'github-dark'],
  langs: ['typescript', 'python', 'bash', 'css', 'html', 'json', 'yaml', 'rust', 'go', 'sql', 'markdown']
})
```

Scans all `<pre><code class="language-xxx">` elements, replaces with shiki-highlighted HTML containing both theme outputs. CSS toggles visibility via `[data-theme]`.

### 2. Mermaid Rendering

Scans `<pre class="mermaid">` blocks, calls `mermaid.run()`.

### 3. Theme Toggle

- Default: read `localStorage('md-preview-theme')`
- Fallback: `prefers-color-scheme` media query
- Click toggle button → set `data-theme` on `<html>` + persist to localStorage
- shiki dual-theme syncs via CSS class visibility

## CDN Dependencies (ESM only)

| Library | Purpose | CDN |
|---------|---------|-----|
| shiki | Code syntax highlighting with dual themes | esm.sh/shiki |
| Mermaid | Diagram rendering | cdn.jsdelivr.net/npm/mermaid@11 |

No remark, no unified, no rehype, no npm packages.

## Design System

Follows the codemermaid Raycast-inspired design system (`skills/codemermaid/DESIGN.md`):

- Same CSS variable naming convention (`--bg`, `--surface`, `--text`, etc.)
- Same fonts: Inter (primary) + Geist Mono (code) via Google Fonts CDN
- Same typography rules: weight 500 body, +0.2px letter-spacing, `font-feature-settings: 'calt', 'kern', 'liga', 'ss03'`
- Same shadow system: double-ring containment, multi-layer inset
- Same border radius scale: 12px code blocks, 16px cards, 6px buttons
- Same interaction pattern: opacity transition hover
- Background must be `#07080a` (not pure black)

### Light Theme Extension

```css
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
}
```

### Markdown Element Styles

| Element | Style |
|---------|-------|
| Code blocks | shiki highlighted + language label + copy button, rounded container, `--code-bg` background |
| Inline code | `--surface` background, rounded, Geist Mono |
| Tables | GFM style, borders + zebra striping |
| Task lists | Rendered checkboxes |
| Admonitions | Colored left border card (NOTE=blue, WARNING=yellow, TIP=green, CAUTION=red) |
| Mermaid blocks | Centered in `.figure` container |
| Blockquotes | 4px left color bar, muted text |
| Images | `max-width: 100%`, rounded corners |
| Links | `--accent` color, underline on hover |

### Top Navigation Bar

Fixed top bar with: filename (from first h1 or file basename) + theme toggle button (sun/moon icon).

## template.html

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><!-- SLOT:TITLE --></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="topbar">
    <span class="topbar-title"><!-- SLOT:TITLE --></span>
    <button class="theme-toggle" id="theme-toggle"><!-- sun/moon icon --></button>
  </nav>
  <div class="container">
    <article id="content">
      <!-- SLOT:CONTENT -->
    </article>
  </div>
  <script type="module" src="runtime.js"></script>
</body>
</html>
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Unknown code language | Agent writes `<code>` without class, shiki skips, rendered as plain monospace |
| No network (CDN down) | Content renders as plain HTML, code blocks unhighlighted, Mermaid shows raw code |
| Mermaid syntax error | `mermaid.run()` catches error, shows raw code block with error message |
| Large MD files (>1MB) | Normal processing, no special handling needed |
| Empty file | Empty content page |
| `<script>` in MD | Agent HTML-escapes content within code blocks; non-code script tags are preserved as-is |

## Verification

After generating:
1. `test -s docs/md-preview/<filename>.html`
2. `test -s docs/md-preview/style.css && test -s docs/md-preview/runtime.js`
3. `open docs/md-preview/<filename>.html`

## Out of Scope (YAGNI)

- File watching / hot reload
- Multi-file index page
- Print stylesheet
- SEO / meta tags
- Offline PWA
- Node.js scripts or npm dependencies
- Server-side processing
