# MD Preview: Selection Comment Feature Design

## Goal

Add inline commenting to md-preview HTML pages. User selects text in the browser, writes a comment, and copies structured data (source file path + line numbers + selected text + comment) to clipboard for the agent to consume. The agent uses line numbers to locate the source `.md` position and the selected text as a secondary verification.

## Architecture

**Pure inline — no side panel.** All interactions happen in page context.

1. Agent annotates block-level HTML elements with `data-source-line` during MD→HTML conversion
2. User selects text → "Comment" tooltip appears
3. Click tooltip → inline popover for writing the comment
4. Comment added → badge + highlight on text, hover/click badge to view comment card
5. Right-corner FAB manages batch actions (Copy All, Clear All)

No panel, no side column, no server. Clipboard is the transport.

## Source Line Annotation

### Template Change

Add a `<meta>` tag so JS knows the source file path:

```html
<meta name="source-file" content="<!-- SLOT:SOURCE -->">
```

Agent fills `<!-- SLOT:SOURCE -->` with the source `.md` relative path during generation.

### Annotation Rules

Agent maintains a line counter during MD→HTML conversion and adds `data-source-line="<N>"` to every block-level element:

| Element | Annotated? |
|---------|-----------|
| `<p>` | Yes |
| `<h1>`–`<h4>` | Yes |
| `<pre>` | Yes |
| `<blockquote>` | Yes |
| `<table>` | Yes |
| `<div class="admonition">` | Yes |
| `<hr>` | Yes |
| `<li>` | Yes |
| `<ul>`, `<ol>` | No (line info on children) |
| `<thead>`, `<tbody>` | No (line info on parent `<table>`) |

Nested structures (e.g. `<p>` inside `<blockquote>`) annotate independently.

### How JS Reads Line Numbers

On text selection, JS walks up from `selection.anchorNode` and `selection.focusNode` to find the nearest ancestors with `data-source-line`. The start line comes from the anchor ancestor, the end line from the focus ancestor. If only one ancestor has the attribute, start and end are the same line.

## Browser Interaction Flow

### Select → Tooltip

1. JS listens to `selectionchange`
2. Non-empty selection detected → check if selection has at least one `data-source-line` ancestor
3. If yes: show "Comment" tooltip positioned above the end of the selection
4. Selection disappears → tooltip hides

### Tooltip → Inline Popover

5. Click "Comment" → hide tooltip, show inline popover near the selection
6. Popover contains:
   - Source location: `file.md:15-18`
   - Selected text preview (truncated to 200 chars, read-only)
   - `<textarea>` for writing the comment
   - "Add" and "Cancel" buttons
7. Textarea auto-focuses. `Cmd+Enter` triggers Add.

### Add Comment

8. Click "Add" → popover closes, comment stored in JS array
9. Selected text wrapped in `<mark class="comment-highlight" data-comment-id="1">`. If the selection spans multiple block-level elements (e.g. across paragraphs), only the first block is wrapped — the comment references the line range from all spanned blocks, but the visual highlight applies to the first block only.
10. Badge `[1]` inserted after the mark (numbered sequentially)
11. Original selection cleared

### View Comment

12. Hover or click badge → comment card appears
13. Card positioned: `position: absolute`, horizontal fixed at article right edge, vertical aligned with badge `top`
14. Card shows:
    - Header: `#1 file.md:15-18`
    - Comment text (full)
    - Delete button `[×]`
15. Only one card open at a time. Click elsewhere or another badge to close.

### Delete Comment

16. Click `[×]` on card → remove comment from JS array, remove `<mark>` wrapper (restore plain text), remove badge

### FAB (Floating Action Button)

Small fixed button in bottom-right corner:

- Shows comment count as badge: `③`
- Click → dropdown with:
  - "Copy All" — copies all comments to clipboard
  - "Clear All" — removes all comments, marks, badges
- Hidden when no comments exist

## Clipboard Format

### Single comment

```
@docs/plans/xxx.md:15-18

> const x = shiki.createHighlighter({
>   themes: ['github-light', 'github-dark'],
> });

This is wrong - use the async API instead.
```

### Multiple comments (Copy All)

Separated by `---`:

```
@docs/plans/xxx.md:15-18

> const x = shiki.createHighlighter({
>   themes: ['github-light', 'github-dark'],
> });

This is wrong - use the async API instead.

---

@docs/plans/xxx.md:42

> some typo here

Fix the typo.

---

@docs/plans/xxx.md:67-70

> another paragraph with issues

Rewrite this section.
```

### Format rules

- First line: `@<relative-path>:<startLine>-<endLine>`
- If start equals end: `@<path>:42` (single number, no range)
- Blank line
- Selected text with `>` prefix, max 5 lines, truncated with `...` if longer
- Blank line
- User comment text (preserved as-is, including line breaks)

### Agent parsing

Agent parses clipboard text by splitting on `---` delimiters. Each block:
1. Extract path and line range from first line (`@path:start-end` or `@path:line`)
2. Read source file at those lines
3. Compare `>` quoted text against source for secondary verification
4. Apply user comment as modification instruction

## CSS Additions

~80 lines added to `style.css`:

| Class | Purpose |
|-------|---------|
| `.comment-tooltip` | "Comment" button above selection |
| `.comment-popover` | Input popover near selection |
| `.comment-badge` | Inline numbered badge after highlighted text |
| `.comment-card` | Hover/click card showing comment content |
| `.comment-highlight` | Yellow highlight on commented text |
| `.comment-fab` | Bottom-right floating action button |
| `.comment-fab-menu` | Dropdown from FAB |

Highlight colors:
- Dark theme: `rgba(255, 212, 0, 0.2)` background, `rgba(255, 212, 0, 0.6)` bottom border
- Light theme: `rgba(255, 180, 0, 0.15)` background, `rgba(255, 180, 0, 0.5)` bottom border
- Badge: `--accent` background, white text, 14px×14px rounded

## JS Additions

`initCommentSystem()` added to `runtime.js`, ~120 lines:

- `selectionchange` listener → tooltip positioning
- Tooltip click handler → popover creation
- Add handler → mark + badge + comment storage
- Badge hover/click handler → card creation
- FAB click handler → dropdown with Copy All / Clear All
- Delete handler → cleanup mark, badge, comment entry
- `navigator.clipboard.writeText()` for Copy All

State stored in a JS array (not persisted — comments are session-scoped, gone on page close):

```js
const comments = [];
// { id: 1, startLine: 15, endLine: 18, selectedText: '...', comment: '...' }
```

## Template Changes

```html
<meta name="source-file" content="<!-- SLOT:SOURCE -->">
```

New slot for agent to fill with source `.md` relative path.

## Files Changed

| File | Change |
|------|--------|
| `skills/md-preview/SKILL.md` | Add line annotation rules, `<!-- SLOT:SOURCE -->` slot |
| `skills/md-preview/assets/template.html` | Add `<meta name="source-file">` line |
| `skills/md-preview/assets/style.css` | Add ~80 lines of comment UI styles |
| `skills/md-preview/assets/runtime.js` | Add `initCommentSystem()` ~120 lines |

No new files. No new dependencies. No server.

## Out of Scope

- Comment persistence (localStorage, sidecar files) — comments are session-only
- Real-time collaboration
- Reply threads on comments
- Resolved/done state for comments
- Local HTTP server for agent communication
- Comment resolution tracking
