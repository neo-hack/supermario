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
