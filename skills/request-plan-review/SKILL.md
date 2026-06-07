---
name: request-plan-review
description: Convert markdown plan/spec files into styled HTML review pages with code syntax highlighting, Mermaid diagram rendering, inline comments, and light/dark theme toggle. Use when asked to preview, render, or display a markdown file as HTML for review.
---

# Request Plan Review

Generate a styled HTML review page from a markdown file. The output is a self-contained HTML page with Raycast-inspired design, code syntax highlighting, Mermaid diagram rendering, inline comments, and light/dark theme toggle.

## Workflow

1. Read the target `.md` file.
2. Read `skills/request-plan-review/assets/template.html` as the HTML shell.
3. Read `skills/request-plan-review/assets/style.css` and `skills/request-plan-review/assets/runtime.js` — these will be inlined into the HTML.
4. Run automated markdown review:
   - Import helper functions from `skills/request-plan-review/scripts/review-utils.mjs`.
   - Read `skills/request-plan-review/references/review-template.md`.
   - Discover available reviewer CLIs with `discoverReviewers()`.
   - Build one prompt with `buildReviewPrompt({ sourcePath, markdown, reviewTemplate })`, where `sourcePath` is the target `.md` plan/spec address and `markdown` is the full target file contents.
   - Run every supported detected reviewer with a 120 second timeout.
   - Write `docs/request-plan-review/<filename>.reviews.md` with `renderReviewsMarkdown(...)`.
   - Parse that reviews markdown with `parseReviewsMarkdown(...)`.
   - Build review data with `buildAutomatedReviewDataScript(...)`.
   - If no reviewer CLI is detected, still write a `.reviews.md` file that records automated reviews were not run.
   - If a reviewer fails, times out, or returns invalid output, record the failure in `.reviews.md` and continue rendering.
5. Convert the markdown content to HTML manually (see MD→HTML rules below).
6. Generate a TOC sidebar from all h2/h3 headings.
7. Fill the template slots:
   - `<!-- SLOT:TITLE -->` — page title and topbar (use first h1 text or filename)
   - `<!-- SLOT:SOURCE -->` — relative path of the source `.md` file (e.g. `docs/plans/my-plan.md`)
   - `<!-- SLOT:STYLE -->` — paste the full contents of `style.css` (replaces the entire line including the `/* SLOT:STYLE */` comment)
   - `<!-- SLOT:CONTENT -->` — the converted HTML content
   - `<!-- SLOT:TOC_SIDEBAR -->` — the generated TOC sidebar HTML
   - `/* SLOT:REVIEW_DATA */` — paste the full output from `buildAutomatedReviewDataScript(...)`
   - `/* SLOT:SCRIPT */` — paste the full contents of `runtime.js` (replaces the entire line including the `/* SLOT:SCRIPT */` comment)
8. Write the result to `docs/request-plan-review/<filename>.html` (same basename as source).
9. Run `open docs/request-plan-review/<filename>.html`.

**Output is a single self-contained HTML file** — CSS and JS are inlined, no external assets needed. This ensures the file works with `open` on `file://` protocol without CORS issues.

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

## Source Line Annotation

During MD→HTML conversion, track the source line number for each block-level element. Add a `data-source-line="<N>"` attribute where `<N>` is the 1-indexed line number from the source `.md` file where the element starts.

### Elements to annotate

| Element | Annotate? |
|---------|-----------|
| `<p>` | Yes |
| `<h1>`–`<h4>` | Yes |
| `<pre>` | Yes |
| `<blockquote>` | Yes |
| `<table>` | Yes |
| `<div class="admonition">` | Yes |
| `<hr>` | Yes |
| `<li>` | Yes |
| `<ul>`, `<ol>` | No (children are annotated) |
| `<thead>`, `<tbody>` | No (parent `<table>` is annotated) |

### Rules

- Nested structures (e.g. `<p>` inside `<blockquote>`) annotate independently — each gets its own starting line number.
- The line number corresponds to where the markdown construct begins in the source file, not where it ends.
- Example: a fenced code block starting at line 42 gets `data-source-line="42"` on the `<pre>` element, even though the closing fence is on line 48.

### Example

Source markdown (lines 10-13):

```markdown
Some paragraph text.
## Section Name
```

Generated HTML:

```html
<p data-source-line="10">Some paragraph text.</p>
<h2 data-source-line="12" id="section-name">Section Name</h2>
```

## Automated Review Comments

During generation, create a sidecar reviews file:

```text
docs/request-plan-review/<filename>.reviews.md
```

Reviewer findings use this parseable markdown format:

```markdown
## Reviewer: claude

### Finding: Missing failure path
Severity: high
Location: docs/superpowers/plans/example.md:42-48
Quote:
> original markdown snippet

Comment:
This step assumes the command succeeds but does not define what to do if the
generated HTML has no source-line annotations.
```

Allowed severity values are `critical`, `high`, `medium`, `low`, and `note`.

Injected automated comments use this shape:

```js
window.__AUTOMATED_REVIEW_COMMENTS__ = [
  {
    id: 'A1',
    source: 'automated',
    reviewer: 'claude',
    severity: 'high',
    title: 'Missing failure path',
    startLine: 42,
    endLine: 48,
    selectedText: 'original markdown snippet',
    comment: 'This step assumes the command succeeds...',
    unanchored: false
  }
];
```

Automated comments reuse the existing comments panel. They get `A1`, `A2`, and
`A3` IDs so manual comments can continue using numeric IDs.

## Verification

After generating the HTML file:

```bash
test -s docs/request-plan-review/<filename>.html
open docs/request-plan-review/<filename>.html
```

Check in browser:
- Dark theme renders correctly
- Theme toggle switches to light and back
- Code blocks show shiki syntax highlighting
- TOC sidebar highlights active section on scroll
- Tables, admonitions, task lists render properly
- `docs/request-plan-review/<filename>.reviews.md` exists.
- If no reviewer CLI is available, the reviews file says automated reviews were not run.
- If reviewer findings exist, automated comments appear in the comments panel.
- Rough Notation underlines appear when the CDN is available and CSS highlights remain when it is not.

## Debugging

If the page looks wrong:
1. Check the browser DevTools console for errors
2. Verify the HTML file contains inlined `<style>` and `<script>` (not external links)
3. Verify all heading ids are unique and match TOC links
4. Verify code blocks have `class="language-xxx"` for shiki to detect
5. Verify mermaid blocks use `<pre class="mermaid">` not `<pre><code class="language-mermaid">`
6. If shiki/mermaid CDN fails (no network), content still renders as plain HTML
