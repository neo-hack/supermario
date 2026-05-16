# MD Preview: Selection Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add inline commenting to md-preview HTML pages — user selects text, writes a comment, copies structured data (file + line range + selected text + comment) to clipboard for the agent.

**Architecture:** Agent annotates block-level HTML elements with `data-source-line` during MD→HTML conversion. Browser JS handles selection detection, popover input, inline badges, comment cards, and FAB for batch copy/clear. No server, no persistence — clipboard is the transport.

**Tech Stack:** Vanilla JS (inlined into HTML), CSS (inlined), no new dependencies.

---

### Task 1: Add source-file meta tag to template

**Files:**
- Modify: `skills/md-preview/assets/template.html:5-6`

- [ ] **Step 1: Add meta tag after viewport meta**

In `skills/md-preview/assets/template.html`, add a new meta tag and new slot after the viewport line:

```html
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="source-file" content="<!-- SLOT:SOURCE -->">
  <title><!-- SLOT:TITLE --></title>
```

- [ ] **Step 2: Verify template has no syntax errors**

Read the full file and confirm the `<meta name="source-file">` line is present and well-formed.

- [ ] **Step 3: Commit**

```bash
git add skills/md-preview/assets/template.html
git commit -m ":wrench: feat(md-preview): add source-file meta slot to template"
```

---

### Task 2: Update SKILL.md with line annotation rules and source slot

**Files:**
- Modify: `skills/md-preview/SKILL.md`

- [ ] **Step 1: Add `<!-- SLOT:SOURCE -->` to the workflow slot list**

In the "Fill the template slots" section (around line 18), add a new bullet after the title slot:

```markdown
   - `<!-- SLOT:TITLE -->` — page title and topbar (use first h1 text or filename)
   - `<!-- SLOT:SOURCE -->` — relative path of the source `.md` file (e.g. `docs/plans/my-plan.md`)
```

- [ ] **Step 2: Add source line annotation section after "HTML Entity Escaping"**

Insert a new section before "Verification":

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add skills/md-preview/SKILL.md
git commit -m ":memo: docs(md-preview): add source line annotation rules to SKILL.md"
```

---

### Task 3: Add comment UI CSS styles

**Files:**
- Modify: `skills/md-preview/assets/style.css`

- [ ] **Step 1: Append comment CSS at the end of style.css**

Append the following block after the existing `/* ===== SHIKI DUAL THEME ===== */` section (after line 311):

```css

/* ===== COMMENT SYSTEM ===== */
.comment-tooltip {
  position: absolute;
  z-index: 300;
  background: var(--accent);
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: var(--shadow-card);
  transition: opacity 0.15s;
}
.comment-tooltip:hover { opacity: 0.9; }

.comment-popover {
  position: absolute;
  z-index: 400;
  width: 340px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-card);
}
.comment-popover-loc {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-faint);
  margin-bottom: 8px;
}
.comment-popover-preview {
  font-size: 13px;
  color: var(--text-dim);
  background: var(--surface-2);
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  max-height: 80px;
  overflow-y: auto;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.comment-popover-input {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text);
  font-family: var(--font-primary);
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 60px;
}
.comment-popover-input:focus { outline: none; border-color: var(--accent); }
.comment-popover-input::placeholder { color: var(--text-faint); }
.comment-popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.comment-popover-cancel,
.comment-popover-add {
  padding: 6px 16px;
  border-radius: 6px;
  font-family: var(--font-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
}
.comment-popover-cancel {
  background: var(--surface-2);
  color: var(--text-dim);
}
.comment-popover-add {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}
.comment-popover-add:hover { opacity: 0.9; }

.comment-highlight {
  background: rgba(255, 212, 0, 0.2);
  border-bottom: 2px solid rgba(255, 212, 0, 0.6);
  border-radius: 2px;
  padding: 1px 0;
}
[data-theme="light"] .comment-highlight {
  background: rgba(255, 180, 0, 0.15);
  border-bottom-color: rgba(255, 180, 0, 0.5);
}

.comment-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--accent);
  color: white;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  vertical-align: middle;
  margin-left: 2px;
  line-height: 1;
  transition: opacity 0.15s;
}
.comment-badge:hover { opacity: 0.8; }

.comment-card {
  position: fixed;
  z-index: 500;
  width: 280px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}
.comment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-soft);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-faint);
}
.comment-card-delete {
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.15s;
}
.comment-card-delete:hover { color: var(--accent); }
.comment-card-body {
  padding: 12px 14px;
  font-size: 14px;
  color: var(--text);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: var(--accent);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: opacity 0.15s;
}
.comment-fab:hover { opacity: 0.9; }
.comment-fab-count {
  color: white;
  font-size: 14px;
  font-weight: 700;
}
.comment-fab-menu {
  position: absolute;
  bottom: 52px;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  padding: 4px;
  display: none;
  min-width: 120px;
}
.comment-fab-menu.open { display: block; }
.comment-fab-btn {
  display: block;
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  color: var(--text);
  font-family: var(--font-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  border-radius: 4px;
  white-space: nowrap;
}
.comment-fab-btn:hover { background: var(--surface-2); }
```

- [ ] **Step 2: Verify CSS has no syntax errors**

```bash
grep -c 'comment-' skills/md-preview/assets/style.css
```

Expected: ~30+ matches (all comment-related class references).

- [ ] **Step 3: Commit**

```bash
git add skills/md-preview/assets/style.css
git commit -m ":sparkles: feat(md-preview): add comment UI CSS styles"
```

---

### Task 4: Add initCommentSystem to runtime.js

**Files:**
- Modify: `skills/md-preview/assets/runtime.js`

- [ ] **Step 1: Add initCommentSystem function before the init calls**

Insert the following function before the `initThemeToggle();` line (before line 133). This is the complete comment system implementation:

```js
function initCommentSystem() {
  var meta = document.querySelector('meta[name="source-file"]');
  var sourceFile = meta ? meta.content : '';
  if (!sourceFile) return;

  var comments = [];
  var nextId = 1;
  var tooltip = null;
  var popover = null;
  var activeCard = null;
  var article = document.getElementById('content');

  var fab = document.createElement('div');
  fab.className = 'comment-fab';
  fab.style.display = 'none';
  fab.innerHTML = '<span class="comment-fab-count">0</span>';
  var fabMenu = document.createElement('div');
  fabMenu.className = 'comment-fab-menu';
  fabMenu.innerHTML = '<button class="comment-fab-btn" data-action="copy">Copy All</button><button class="comment-fab-btn" data-action="clear">Clear All</button>';
  fab.appendChild(fabMenu);
  document.body.appendChild(fab);

  fab.addEventListener('click', function(e) {
    var btn = e.target.closest('.comment-fab-btn');
    if (btn) {
      if (btn.dataset.action === 'copy') copyAll();
      if (btn.dataset.action === 'clear') clearAll();
      fabMenu.classList.remove('open');
      return;
    }
    fabMenu.classList.toggle('open');
  });

  document.addEventListener('click', function(e) {
    if (!fab.contains(e.target)) fabMenu.classList.remove('open');
  });

  function updateFab() {
    fab.style.display = comments.length > 0 ? 'flex' : 'none';
    fab.querySelector('.comment-fab-count').textContent = comments.length;
  }

  document.addEventListener('selectionchange', function() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) { hideTooltip(); return; }
    if (!sel.rangeCount) { hideTooltip(); return; }
    var range = sel.getRangeAt(0);
    if (!article.contains(range.commonAncestorContainer)) { hideTooltip(); return; }
    if (popover) return;
    var startLine = findLine(range.startContainer);
    var endLine = findLine(range.endContainer);
    if (!startLine && !endLine) { hideTooltip(); return; }
    showTooltip(range);
  });

  function findLine(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== document.body) {
      if (el.dataset && el.dataset.sourceLine) return parseInt(el.dataset.sourceLine, 10);
      el = el.parentElement;
    }
    return null;
  }

  function showTooltip(range) {
    hideTooltip();
    var rect = range.getBoundingClientRect();
    var el = document.createElement('div');
    el.className = 'comment-tooltip';
    el.textContent = 'Comment';
    el.style.left = Math.max(8, rect.left + rect.width / 2 - 36 + window.scrollX) + 'px';
    el.style.top = (rect.top + window.scrollY - 36) + 'px';
    document.body.appendChild(el);
    tooltip = el;
    el.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      hideTooltip();
      showPopover();
    });
  }

  function hideTooltip() {
    if (tooltip) { tooltip.remove(); tooltip = null; }
  }

  function showPopover() {
    hidePopover();
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    var startLine = findLine(range.startContainer) || 0;
    var endLine = findLine(range.endContainer) || startLine;
    var text = sel.toString().trim();
    var rect = range.getBoundingClientRect();
    var loc = sourceFile + ':' + startLine + (startLine !== endLine ? '-' + endLine : '');

    var el = document.createElement('div');
    el.className = 'comment-popover';
    el.innerHTML =
      '<div class="comment-popover-loc">' + loc + '</div>' +
      '<div class="comment-popover-preview">' + escapeHtml(text.slice(0, 200)) + (text.length > 200 ? '...' : '') + '</div>' +
      '<textarea class="comment-popover-input" placeholder="Write your comment..." rows="3"></textarea>' +
      '<div class="comment-popover-actions">' +
        '<button class="comment-popover-cancel">Cancel</button>' +
        '<button class="comment-popover-add">Add</button>' +
      '</div>';
    el.style.left = Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 360)) + 'px';
    el.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
    document.body.appendChild(el);
    popover = el;

    var input = el.querySelector('.comment-popover-input');
    input.focus();

    function addComment() {
      var commentText = input.value.trim();
      if (!commentText) return;
      var id = nextId++;
      comments.push({ id: id, startLine: startLine, endLine: endLine, selectedText: text, comment: commentText });
      try {
        var mark = document.createElement('mark');
        mark.className = 'comment-highlight';
        mark.dataset.commentId = id;
        range.surroundContents(mark);
        var badge = document.createElement('span');
        badge.className = 'comment-badge';
        badge.textContent = id;
        badge.dataset.commentId = id;
        mark.after(badge);
        badge.addEventListener('click', function(e) {
          e.stopPropagation();
          toggleCard(id, badge);
        });
      } catch (err) {}
      sel.removeAllRanges();
      updateFab();
      hidePopover();
    }

    el.querySelector('.comment-popover-add').addEventListener('click', addComment);
    el.querySelector('.comment-popover-cancel').addEventListener('click', hidePopover);
    input.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') addComment();
      if (e.key === 'Escape') hidePopover();
    });
  }

  function hidePopover() {
    if (popover) { popover.remove(); popover = null; }
  }

  function toggleCard(id, badge) {
    if (activeCard) activeCard.remove();
    activeCard = null;
    var c = comments.find(function(x) { return x.id === id; });
    if (!c) return;
    var badgeRect = badge.getBoundingClientRect();
    var card = document.createElement('div');
    card.className = 'comment-card';
    var loc = sourceFile + ':' + c.startLine + (c.startLine !== c.endLine ? '-' + c.endLine : '');
    card.innerHTML =
      '<div class="comment-card-header">' +
        '<span>#' + c.id + ' ' + loc + '</span>' +
        '<button class="comment-card-delete">&times;</button>' +
      '</div>' +
      '<div class="comment-card-body">' + escapeHtml(c.comment) + '</div>';
    card.style.right = '24px';
    card.style.top = badgeRect.top + 'px';
    document.body.appendChild(card);
    activeCard = card;
    card.querySelector('.comment-card-delete').addEventListener('click', function() {
      deleteComment(id);
    });
    setTimeout(function() {
      document.addEventListener('mousedown', function handler(e) {
        if (!card.contains(e.target) && e.target !== badge) {
          card.remove();
          if (activeCard === card) activeCard = null;
          document.removeEventListener('mousedown', handler);
        }
      });
    }, 10);
  }

  function deleteComment(id) {
    var idx = comments.findIndex(function(x) { return x.id === id; });
    if (idx === -1) return;
    comments.splice(idx, 1);
    var mark = document.querySelector('mark[data-comment-id="' + id + '"]');
    var badge = document.querySelector('span.comment-badge[data-comment-id="' + id + '"]');
    if (mark) {
      var parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      mark.remove();
    }
    if (badge) badge.remove();
    if (activeCard) { activeCard.remove(); activeCard = null; }
    updateFab();
  }

  function clearAll() {
    var ids = comments.map(function(c) { return c.id; });
    ids.forEach(function(id) { deleteComment(id); });
  }

  function copyAll() {
    var parts = comments.map(function(c) {
      var loc = c.startLine === c.endLine
        ? sourceFile + ':' + c.startLine
        : sourceFile + ':' + c.startLine + '-' + c.endLine;
      var lines = c.selectedText.split('\n').slice(0, 5);
      if (c.selectedText.split('\n').length > 5) lines.push('...');
      var quoted = lines.map(function(l) { return '> ' + l; }).join('\n');
      return '@' + loc + '\n\n' + quoted + '\n\n' + c.comment;
    });
    navigator.clipboard.writeText(parts.join('\n\n---\n\n')).then(function() {
      fab.querySelector('.comment-fab-count').textContent = '\u2713';
      setTimeout(function() {
        fab.querySelector('.comment-fab-count').textContent = comments.length;
      }, 1500);
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
```

- [ ] **Step 2: Add initCommentSystem() call at the bottom**

Add `initCommentSystem();` after the existing init calls. The end of runtime.js should be:

```js
initThemeToggle();
initTocScroll();
initCopyButtons();
initShiki();
initMermaid();
initCommentSystem();
```

- [ ] **Step 3: Verify JS has no syntax errors**

```bash
node -c skills/md-preview/assets/runtime.js && echo "OK"
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add skills/md-preview/assets/runtime.js
git commit -m ":sparkles: feat(md-preview): add initCommentSystem for inline comments"
```

---

### Task 5: Regenerate test preview and verify

**Files:**
- Regenerate: `docs/md-preview/codemermaid-v2-direct-html.html`

This task requires following the updated SKILL.md instructions to regenerate the preview with source line annotations, the new meta tag, and the inlined comment JS/CSS.

- [ ] **Step 1: Regenerate the preview HTML**

Use the md-preview skill to regenerate `docs/md-preview/codemermaid-v2-direct-html.html` from source `docs/superpowers/plans/2026-05-13-codemermaid-v2-direct-html.md`. The agent must:

1. Read the source `.md` file
2. Read `template.html` — note the new `<!-- SLOT:SOURCE -->` slot
3. Read `style.css` and `runtime.js` (both updated with comment system code)
4. Convert MD to HTML with `data-source-line` attributes on all block elements, following the rules in the updated SKILL.md
5. Generate TOC sidebar
6. Fill all slots including:
   - `<!-- SLOT:SOURCE -->` → `docs/superpowers/plans/2026-05-13-codemermaid-v2-direct-html.md`
   - `/* SLOT:STYLE */` → full contents of updated style.css
   - `/* SLOT:SCRIPT */` → full contents of updated runtime.js
7. Write to `docs/md-preview/codemermaid-v2-direct-html.html`

- [ ] **Step 2: Verify generated file**

```bash
test -s docs/md-preview/codemermaid-v2-direct-html.html && echo "OK"
grep -c 'data-source-line' docs/md-preview/codemermaid-v2-direct-html.html
grep -c 'initCommentSystem' docs/md-preview/codemermaid-v2-direct-html.html
grep 'SLOT:SOURCE' docs/md-preview/codemermaid-v2-direct-html.html | wc -l
```

Expected:
- File exists
- `data-source-line` count > 50 (many block elements annotated)
- `initCommentSystem` count = 2 (definition + call)
- `SLOT:SOURCE` count = 0 (slot filled, no unfilled markers)
- `meta name="source-file"` present with correct content path

- [ ] **Step 3: Open in browser and verify**

```bash
open docs/md-preview/codemermaid-v2-direct-html.html
```

Check in browser:
- Select text → "Comment" tooltip appears above selection
- Click tooltip → popover with location, preview, textarea
- Write comment → click Add → yellow highlight + numbered badge appears
- Click badge → comment card appears at right edge, aligned vertically
- FAB appears in bottom-right showing count
- Click FAB → dropdown with Copy All / Clear All
- Copy All → clipboard contains formatted `@path:line` blocks separated by `---`
- Clear All → all highlights and badges removed, FAB hidden
- Delete button on card removes single comment

- [ ] **Step 4: Commit**

```bash
git add docs/md-preview/
git commit -m ":sparkles: feat(md-preview): regenerate preview with comment system"
```
