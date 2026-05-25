# CodeMermaid HTML Style Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved CodeMermaid demo styling to real generated HTML pages, including the unified `whoa` highlight unit and the code file actions control.

**Architecture:** Keep CodeMermaid as static HTML with shared copied assets. `style.css` owns the visual treatment, `runtime.js` owns editor-opening and copy-path interactions, and `SKILL.md` plus `references/units-examples.md` define the HTML output contract that agents must generate.

**Tech Stack:** Static HTML, CSS variables, vanilla JavaScript, CodeMermaid skill docs, browser verification through the existing local static server.

---

## File Structure

- Modify `skills/codemermaid/assets/style.css`
  - Add production styles for `.unit-whoa`, `.whoa-label`, `.whoa-evidence`, `.file-actions`, `.file-action`, `.editor-menu`, and the css.gg-style `.gg-chevron-down` controlled by `--ggs`.
  - Keep all colors inside the existing Raycast token system: `--accent`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-dim`, `--text-faint`.

- Modify `skills/codemermaid/assets/runtime.js`
  - Add `initFileActions()` to support custom editor menus, same-value click-to-open behavior, `cursor://file/` and `vscode://file/` links, and a copy-path fallback.
  - Call `initFileActions()` from `bootPage()`.

- Modify `skills/codemermaid/SKILL.md`
  - Add `whoa` to the unit data contract.
  - Add the generated HTML contract for `whoa`.
  - Add the generated HTML contract for file actions in `code-walk` and `code-graph` headers.
  - Add validation checks for `whoa` units and editor path actions.

- Modify `skills/codemermaid/references/units-examples.md`
  - Add concrete `whoa` object examples.
  - Add a short rendering note that code units should use the shared file actions control when the source path is known.

- Modify `docs/codemermaid/whoa-unit-demo.html`
  - Keep the demo aligned with the final shared class names only if it diverges from `style.css` or `runtime.js` after the production changes.

---

### Task 1: Add The Whoa Unit Contract

**Files:**
- Modify: `skills/codemermaid/SKILL.md`
- Modify: `skills/codemermaid/references/units-examples.md`

- [ ] **Step 1: Update the unit kind list in `SKILL.md`**

In `skills/codemermaid/SKILL.md`, replace the `### Unit kinds (6 types)` heading with:

```markdown
### Unit kinds (7 types)
```

Then replace the unit kind code block with:

```javascript
{ kind: "concept",     title, body, style? }                          // style: "callout" for surprise-style red border
{ kind: "quiz",        question, options: [{letter, text, correct}], explanation }
{ kind: "takeaway",    body }
{ kind: "diagram",     title, mermaid, caption, zoomable? }               // Mermaid syntax, zoomable defaults true
{ kind: "code-walk",   title, file, startLine?, code, highlights: [{line, note}], layout? }  // layout defaults "split"
{ kind: "code-graph",  title, file, startLine?, code, highlights: [{line, note, graphNode?}], svg }  // left code, right mini graph
{ kind: "whoa",        angle, title, body, evidence? }                    // angle: "code" | "product" | "ux" | "architecture"
```

- [ ] **Step 2: Add `whoa` quality guidance in `SKILL.md`**

After the unit kind code block, insert:

```markdown
### Whoa unit rules

Use `whoa` only for rare design moments that explain why the project is unusually well-designed. A normal course should contain about 3-5 `whoa` units total across all pages.

Required fields:

- `angle`: one of `code`, `product`, `ux`, or `architecture`.
- `title`: a concrete statement of the design win.
- `body`: explains the constraint, why the design is strong, and what would be worse without it.

Optional `evidence` fields:

```javascript
{
  files?: string[],
  modules?: string[],
  interactions?: string[],
  constraints?: string[]
}
```

Use one visual treatment for every angle. `angle` changes the label and placement, not the color palette.
```

- [ ] **Step 3: Add a `whoa` example to `references/units-examples.md`**

Append this section after the `concept` section and before `code-walk`:

````markdown
---

## whoa

Rare highlight for a design choice that deserves extra attention. Use this when the reader should understand not only what the code does, but why the design is unusually strong.

### Example 1 — Product boundary

```javascript
{
  kind: "whoa",
  angle: "product",
  title: "The host owns the product policy; the component owns the conversation surface.",
  body:
    "The component is useful because it does not try to become the whole app. Transport, persistence, permissions, callbacks, and host slots stay outside the visible chat surface. That lets an embedder adopt the conversation UI without surrendering the product decisions around it.",
  evidence: {
    files: ["src/components/ChatPanel.tsx"],
    modules: ["ChatPanel"],
    constraints: ["embeddable UI", "host-controlled persistence", "optional extension points"]
  }
}
```

### Example 2 — Code boundary

```javascript
{
  kind: "whoa",
  angle: "code",
  title: "Internal stream metadata does not leak into the SDK message shape.",
  body:
    "The reducer needs metadata to dedupe live events and later snapshots, but consumers still expect SDK-shaped messages. Attaching non-enumerable Symbol metadata gives the reducer its private bookkeeping without changing what debug, export, or host code sees.",
  evidence: {
    files: ["src/hooks/threadStreamReducer.ts"],
    constraints: ["live stream dedupe", "snapshot replay", "public SDK compatibility"]
  }
}
```

### Whoa rules

- Use about 3-5 `whoa` units total for a normal course.
- Place `angle: "code"` after the proving `code-walk` or `code-graph`.
- Place `angle: "product"`, `"ux"`, and `"architecture"` near the feature, interaction, or diagram that makes the point understandable.
- Evidence can cite files, modules, interactions, or constraints. Do not invent evidence.
````

- [ ] **Step 4: Verify the contract text exists**

Run:

```bash
rg -n "Unit kinds \\(7 types\\)|kind: \"whoa\"|Whoa unit rules|## whoa" skills/codemermaid/SKILL.md skills/codemermaid/references/units-examples.md
```

Expected: output includes all four search terms in the two files.

- [ ] **Step 5: Commit**

```bash
git add skills/codemermaid/SKILL.md skills/codemermaid/references/units-examples.md
git commit -m "docs(codemermaid): add whoa unit output contract"
```

---

### Task 2: Add Production Whoa Styles

**Files:**
- Modify: `skills/codemermaid/assets/style.css`

- [ ] **Step 1: Add the `whoa` CSS after `.unit-surprise`**

Insert this block after the existing `.unit-surprise p` rule:

```css
/* ===== WHOA (rare design highlight) ===== */
.unit-whoa {
  --whoa-accent: var(--accent);
  --whoa-soft: rgba(255, 99, 99, 0.08);
  --whoa-border: rgba(255, 99, 99, 0.34);
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, var(--whoa-soft), rgba(255, 255, 255, 0.015) 48%),
    var(--surface);
  border: 1px solid var(--whoa-border);
  border-radius: 16px;
  padding: 24px 28px 26px;
  box-shadow: var(--shadow-card);
}

.unit-whoa::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--whoa-accent);
}

.whoa-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  color: var(--whoa-accent);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.2px;
  line-height: 1;
  text-transform: uppercase;
}

.whoa-label::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--whoa-accent);
  box-shadow: 0 0 18px var(--whoa-accent);
}

.unit-whoa h2,
.unit-whoa h3 {
  color: var(--text);
  margin-bottom: 12px;
}

.unit-whoa p {
  color: var(--text-dim);
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 0;
}

.whoa-evidence {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.whoa-evidence span {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.025);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.2;
}
```

- [ ] **Step 2: Add the mobile adjustment near the existing mobile media query**

Inside `@media (max-width: 900px)`, add:

```css
  .unit-whoa {
    padding: 22px 20px 24px;
  }
```

- [ ] **Step 3: Verify CSS selectors exist once**

Run:

```bash
rg -n "\\.unit-whoa|\\.whoa-label|\\.whoa-evidence" skills/codemermaid/assets/style.css
```

Expected: output lists the new production selectors.

- [ ] **Step 4: Commit**

```bash
git add skills/codemermaid/assets/style.css
git commit -m "style(codemermaid): add whoa highlight card"
```

---

### Task 3: Add File Action Styles

**Files:**
- Modify: `skills/codemermaid/assets/style.css`

- [ ] **Step 1: Add file action CSS after `.codewalk-head`**

Insert this block after the existing `.codewalk-head` rule:

```css
.file-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.file-action,
.file-action-select {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.025);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.file-action-select {
  padding-right: 7px;
}

.editor-menu {
  position: relative;
  display: inline-flex;
}

.editor-menu-trigger {
  justify-content: space-between;
  gap: 4px;
  min-width: 76px;
}

.gg-chevron-down {
  box-sizing: border-box;
  position: relative;
  display: block;
  width: 22px;
  height: 22px;
  margin: -4px;
  border: 2px solid transparent;
  border-radius: 100px;
  opacity: 0.75;
  flex-shrink: 0;
  transform: scale(var(--ggs, 1));
  transform-origin: center;
  --ggs: 0.58;
}

.gg-chevron-down::after {
  content: "";
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 10px;
  height: 10px;
  left: 4px;
  top: 2px;
  border-right: 2px solid;
  border-bottom: 2px solid;
  transform: rotate(45deg);
}

.editor-menu-trigger[aria-expanded="true"] {
  border-color: var(--accent);
}

.editor-menu-list {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 20;
  min-width: 112px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
  box-shadow: var(--shadow-card);
}

.editor-menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 7px 8px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.2;
  cursor: pointer;
  text-align: left;
}

.editor-menu-item:hover,
.editor-menu-item[aria-selected="true"] {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
}

.file-action-select:focus {
  outline: none;
  border-color: var(--accent);
}

.file-action:hover,
.file-action-select:hover {
  color: var(--text);
  border-color: var(--text-faint);
  opacity: 0.82;
}

.file-action[data-copy-state="copied"] {
  color: var(--accent);
  border-color: var(--accent);
}
```

- [ ] **Step 2: Add the mobile wrapping rule**

Inside `@media (max-width: 900px)`, add:

```css
  .codewalk-head {
    gap: 10px;
  }

  .file-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
```

- [ ] **Step 3: Verify the file action selectors exist**

Run:

```bash
rg -n "\\.file-actions|\\.editor-menu|\\.gg-chevron-down|--ggs" skills/codemermaid/assets/style.css
```

Expected: output includes each selector and the `--ggs` scale variable.

- [ ] **Step 4: Commit**

```bash
git add skills/codemermaid/assets/style.css
git commit -m "style(codemermaid): add code file actions"
```

---

### Task 4: Add Editor And Copy Runtime

**Files:**
- Modify: `skills/codemermaid/assets/runtime.js`

- [ ] **Step 1: Add runtime functions before `bootPage()`**

Insert this block immediately before `function bootPage()`:

```javascript
function splitFileTarget(value) {
  var match = String(value || '').match(/^(.*?)(?::(\d+))?$/);
  return {
    filePath: match && match[1] ? match[1] : '',
    line: match && match[2] ? match[2] : '1'
  };
}

function openEditorPath(value, editor) {
  var target = splitFileTarget(value);
  if (!target.filePath) return;
  var scheme = editor === 'vscode' ? 'vscode' : 'cursor';
  window.location.href = scheme + '://file/' + target.filePath + ':' + target.line;
}

function closeEditorMenus(except) {
  var menus = document.querySelectorAll('[data-editor-menu]');
  for (var i = 0; i < menus.length; i++) {
    if (menus[i] === except) continue;
    var trigger = menus[i].querySelector('[data-editor-trigger]');
    var list = menus[i].querySelector('[data-editor-list]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (list) list.hidden = true;
  }
}

function copyEditorPath(value, button) {
  var originalText = button.textContent;
  function markCopied() {
    button.textContent = 'Copied';
    button.setAttribute('data-copy-state', 'copied');
    window.setTimeout(function() {
      button.textContent = originalText;
      button.removeAttribute('data-copy-state');
    }, 1400);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(markCopied).catch(function() {
      window.prompt('Copy path', value);
    });
    return;
  }

  window.prompt('Copy path', value);
}

function initFileActions() {
  var menus = document.querySelectorAll('[data-editor-menu]');
  for (var i = 0; i < menus.length; i++) {
    (function(menu) {
      var trigger = menu.querySelector('[data-editor-trigger]');
      var list = menu.querySelector('[data-editor-list]');
      var current = menu.querySelector('[data-editor-current]');
      var actions = menu.closest('.file-actions');
      var copyButton = actions && actions.querySelector('[data-copy-path]');
      var value = copyButton ? copyButton.getAttribute('data-copy-path') || '' : '';

      if (trigger) {
        trigger.addEventListener('click', function(event) {
          event.stopPropagation();
          var expanded = trigger.getAttribute('aria-expanded') === 'true';
          closeEditorMenus(menu);
          trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          if (list) list.hidden = expanded;
        });
      }

      var options = menu.querySelectorAll('[data-editor-option]');
      for (var j = 0; j < options.length; j++) {
        options[j].addEventListener('click', function(event) {
          event.stopPropagation();
          var editor = this.getAttribute('data-editor-option') || 'cursor';
          menu.setAttribute('data-editor', editor);
          if (current) current.textContent = editor === 'vscode' ? 'VS Code' : 'Cursor';
          var allOptions = menu.querySelectorAll('[data-editor-option]');
          for (var k = 0; k < allOptions.length; k++) {
            allOptions[k].setAttribute('aria-selected', allOptions[k] === this ? 'true' : 'false');
          }
          closeEditorMenus();
          openEditorPath(value, editor);
        });
      }
    })(menus[i]);
  }

  var copyButtons = document.querySelectorAll('[data-copy-path]');
  for (var b = 0; b < copyButtons.length; b++) {
    copyButtons[b].addEventListener('click', function() {
      copyEditorPath(this.getAttribute('data-copy-path') || '', this);
    });
  }

  document.addEventListener('click', function() { closeEditorMenus(); });
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeEditorMenus();
  });
}
```

- [ ] **Step 2: Call `initFileActions()` from `bootPage()`**

Change `bootPage()` to:

```javascript
function bootPage() {
  initTocScroll();
  initQuiz();
  initCodeWalkAnnotations();
  initAnnotationResize();
  initCodeGraphSync();
  initZoomOverlay();
  initFileActions();
}
```

- [ ] **Step 3: Verify JavaScript syntax**

Run:

```bash
node --check skills/codemermaid/assets/runtime.js
```

Expected: no output and exit code 0.

- [ ] **Step 4: Verify runtime hooks exist**

Run:

```bash
rg -n "initFileActions|openEditorPath|data-editor-menu|data-copy-path" skills/codemermaid/assets/runtime.js
```

Expected: output includes the new function names and data attributes.

- [ ] **Step 5: Commit**

```bash
git add skills/codemermaid/assets/runtime.js
git commit -m "feat(codemermaid): add editor file actions runtime"
```

---

### Task 5: Define Generated HTML Shapes

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Add file action rules under `### Code presentation rules`**

After the existing code presentation rules, insert:

````markdown
### Code file action controls

When a `code-walk` or `code-graph` unit has a real source file path, render file actions in the `.codewalk-head` next to the file label.

Use an absolute file path in `data-copy-path` when the source repository path is known. Append `:{startLine}` when the unit provides `startLine`; otherwise append `:1`.

Required HTML shape:

```html
<div class="codewalk-head">
  <span>{FILE}</span>
  <span class="file-actions">
    <span class="editor-menu" data-editor-menu data-editor="cursor">
      <button class="file-action-select editor-menu-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" data-editor-trigger>
        <span data-editor-current>Cursor</span>
        <span class="gg-chevron-down" aria-hidden="true"></span>
      </button>
      <span class="editor-menu-list" role="listbox" hidden data-editor-list>
        <button class="editor-menu-item" type="button" role="option" aria-selected="true" data-editor-option="cursor">Cursor</button>
        <button class="editor-menu-item" type="button" role="option" aria-selected="false" data-editor-option="vscode">VS Code</button>
      </span>
    </span>
    <button class="file-action" type="button" data-copy-path="{ABSOLUTE_FILE_PATH}:{START_LINE}">Copy path</button>
  </span>
</div>
```

The selected editor option opens immediately. Selecting the already-active option still opens the file, because the menu uses buttons instead of a native `<select>`.
````

- [ ] **Step 2: Add the `whoa` HTML shape under `### Essay page slots`**

Inside the `<!-- SLOT:UNITS -->` section, after the generic section wrapper example, insert:

````markdown
For `whoa` units, render:

```html
<section class="unit unit-whoa" id="unit-{INDEX}" data-angle="{ANGLE}">
  <div class="whoa-label">whoa · {ANGLE}</div>
  <h2>{TITLE}</h2>
  <p>{BODY}</p>
  <div class="whoa-evidence">
    <span>{EVIDENCE_ITEM}</span>
  </div>
</section>
```

Render `.whoa-evidence` only when evidence exists. Flatten evidence in this order: files, modules, interactions, constraints. Keep evidence text short enough to fit in a pill; use file basenames or repo-relative paths rather than long absolute paths inside evidence chips.
````

- [ ] **Step 3: Add validation checks to Phase 6 pre-flight**

In the Phase 6 pre-flight checklist, add these items:

```markdown
   - [ ] Every `whoa` unit has `angle`, `title`, and `body`
   - [ ] Every `whoa.angle` is `code`, `product`, `ux`, or `architecture`
   - [ ] `whoa` units use one visual treatment; no angle-specific color classes
   - [ ] Every rendered file action with `data-copy-path` points to a real source file path and includes a line number
```

- [ ] **Step 4: Verify generated HTML contract text exists**

Run:

```bash
rg -n "Code file action controls|data-editor-menu|unit-whoa|whoa-evidence|Every `whoa` unit" skills/codemermaid/SKILL.md
```

Expected: output includes file action instructions, `unit-whoa` rendering instructions, and validation checks.

- [ ] **Step 5: Commit**

```bash
git add skills/codemermaid/SKILL.md
git commit -m "docs(codemermaid): define whoa html rendering"
```

---

### Task 6: Align The Demo With Shared Assets

**Files:**
- Modify: `docs/codemermaid/whoa-unit-demo.html`

- [ ] **Step 1: Remove duplicated runtime code from the demo**

Delete the inline `<script>` block that defines:

```javascript
openEditorPath
closeEditorMenus
copyEditorPath
document.querySelectorAll('[data-editor-menu]')
document.querySelectorAll('[data-copy-path]')
```

Keep this existing shared script line:

```html
<script src="../../skills/codemermaid/assets/runtime.js"></script>
```

- [ ] **Step 2: Remove demo-only file action CSS after shared CSS exists**

Delete these demo-only style blocks from `docs/codemermaid/whoa-unit-demo.html` after confirming they exist in `skills/codemermaid/assets/style.css`:

```css
.file-actions
.file-action
.file-action-select
.editor-menu
.editor-menu-trigger
.gg-chevron-down
.gg-chevron-down::after
.editor-menu-trigger[aria-expanded="true"]
.editor-menu-list
.editor-menu-item
.editor-menu-item:hover
.editor-menu-item[aria-selected="true"]
.file-action-select:focus
.file-action:hover
.file-action[data-copy-state="copied"]
```

Keep demo-specific layout styles such as `.demo-grid`, `.demo-verdict`, and page-specific spacing.

- [ ] **Step 3: Keep the demo whoa cards visually equivalent**

If the demo still uses `.whoa-card` or `.whoa-inline`, either leave those as demo variants or convert the main examples to:

```html
<section class="unit unit-whoa" data-angle="product">
  <div class="whoa-label">whoa · product</div>
  <h2>The component boundary is the product feature.</h2>
  <p>The host keeps transport, persistence, and permissions while chat-kit owns the conversation surface.</p>
  <div class="whoa-evidence">
    <span>ChatPanel.tsx</span>
    <span>host callbacks</span>
    <span>resource config</span>
  </div>
</section>
```

Choose the conversion only for examples that should preview production output. Keep the broader demo comparison sections if they still help visual review.

- [ ] **Step 4: Verify the demo no longer owns production runtime**

Run:

```bash
rg -n "function openEditorPath|function closeEditorMenus|function copyEditorPath|data-editor-menu" docs/codemermaid/whoa-unit-demo.html skills/codemermaid/assets/runtime.js
```

Expected: the function definitions appear only in `skills/codemermaid/assets/runtime.js`; the demo can still contain `data-editor-menu` markup.

- [ ] **Step 5: Commit**

```bash
git add docs/codemermaid/whoa-unit-demo.html
git commit -m "docs(codemermaid): align whoa demo with shared assets"
```

---

### Task 7: End-To-End Verification

**Files:**
- Inspect: `skills/codemermaid/assets/style.css`
- Inspect: `skills/codemermaid/assets/runtime.js`
- Inspect: `skills/codemermaid/SKILL.md`
- Inspect: `skills/codemermaid/references/units-examples.md`
- Inspect: `docs/codemermaid/whoa-unit-demo.html`

- [ ] **Step 1: Run syntax and text checks**

Run:

```bash
node --check skills/codemermaid/assets/runtime.js
rg -n "unit-whoa|whoa-label|whoa-evidence|file-actions|editor-menu|gg-chevron-down|--ggs" skills/codemermaid/assets/style.css
rg -n "kind: \"whoa\"|Code file action controls|data-copy-path|unit-whoa" skills/codemermaid/SKILL.md skills/codemermaid/references/units-examples.md
```

Expected: `node --check` exits with code 0, and each `rg` command prints matching lines.

- [ ] **Step 2: Start or reuse the static server**

If the server on port `8765` is not running, run:

```bash
python3 -m http.server 8765
```

Expected: server prints `Serving HTTP on :: port 8765` or equivalent.

- [ ] **Step 3: Open the visual demo**

Open:

```text
http://127.0.0.1:8765/docs/codemermaid/whoa-unit-demo.html?actual=1&editor=copy-side
```

Expected visual result:

- `whoa` cards use the unified Raycast-style red accent, dark surface, cool border, and neutral evidence chips.
- The editor control shows `Cursor` by default, with the CSS chevron vertically centered.
- `Copy path` sits beside the editor control, not inside the dropdown.
- Opening the dropdown and clicking `Cursor` opens the current file target instead of doing nothing.
- Choosing `VS Code` updates the selected text and opens the current file target.

- [ ] **Step 4: Inspect responsive behavior**

Resize the browser to a narrow viewport.

Expected visual result:

- `whoa` cards keep readable padding.
- File actions wrap without overlapping the file label or code block.
- Code annotation panels keep their existing behavior.

- [ ] **Step 5: Review git diff**

Run:

```bash
git diff --stat HEAD~5..HEAD
git status --short
```

Expected:

- The diff contains only CodeMermaid style/runtime/docs/demo changes.
- `git status --short` is clean.

---

## Self-Review

Spec coverage:

- `whoa` data model is covered by Task 1.
- Unified visual treatment is covered by Task 2.
- Editor dropdown, same-value click-to-open, and side-by-side Copy path are covered by Tasks 3 and 4.
- Generated HTML instructions are covered by Task 5.
- Demo alignment and visual verification are covered by Tasks 6 and 7.

Placeholder scan:

- The plan contains concrete file paths, exact insertion text, exact CSS, exact JavaScript, exact HTML shapes, exact commands, and expected outputs.

Type consistency:

- `startLine?` is added to `code-walk` and `code-graph`, and the HTML contract consumes it as `{START_LINE}`.
- `data-copy-path`, `data-editor-menu`, `data-editor-trigger`, `data-editor-current`, `data-editor-list`, and `data-editor-option` are used consistently between CSS, runtime, and generated HTML instructions.
