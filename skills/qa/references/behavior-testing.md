# Behavior Testing

Use this reference in every QA mode. Element coverage answers "which controls were touched"; behavior testing answers "which user-facing capabilities were exercised."

The profiles below are a baseline seed set, not an exhaustive list. Always extend them with behavior inferred from the current snapshot, screenshot, visible copy, ARIA roles/states, and overlays revealed during testing.

## Feature Model Inference

After scope resolution and the first interactive snapshot, infer feature models from roles, labels, placeholders, visible text, and opened overlays. Record the inferred models in `coverage.json` so later coverage and reporting can see which behavior cases were planned, tested, or skipped.

Common models:

- `text-input`, `editor`, `composer`
- `form`
- `combobox`, `select`, `picker`
- `menu`, `popover`, `dialog`
- `tabs`, `segmented-control`
- `table`, `list`
- `file`, `upload`
- `search`
- `navigation`
- `destructive-action`

If multiple models apply, keep all relevant models. A composer with a textbox, toolbar buttons, pickers, and tokens should be tested as an editor/composer plus picker behavior, not as isolated buttons.

## Snapshot-Derived Behavior

Before and after each action, inspect the current snapshot and screenshot for product-specific behavior signals. Add inferred cases to `behaviorCases.planned` and `behaviorCases.pending` when the UI exposes:

- ARIA state transitions: `expanded`, `selected`, `checked`, `pressed`, `disabled`, `invalid`, `busy`.
- Roles that imply a workflow: `listbox`, `option`, `tree`, `grid`, `row`, `dialog`, `alert`, `status`, `progressbar`, `toolbar`.
- Visible copy that implies behavior: "queued", "retry", "undo", "draft", "saved", "filter", "upload", "permission", "context", "token", "command", "mention".
- Newly revealed controls inside popovers, dialogs, menus, drawers, panels, or inline editors.
- State changes in nearby counters, badges, selected values, chips, validation messages, placeholders, or empty states.

Do not limit testing to the common models list. When the snapshot exposes a capability that is not named below, create a behavior case with the closest product language and test the observable user workflow.

## Ledger Shape

Track behavior testing in `{OUTPUT_DIR}/coverage.json`:

```json
{
  "behaviorCases": {
    "planned": [],
    "pending": [],
    "tested": [],
    "skipped": []
  }
}
```

Use stable behavior keys:

```text
scopeKey + "|" + model + "|" + behaviorName + "|" + variant
```

## Case Generation

Generate baseline behavior cases before processing raw element actions, then keep adding snapshot-derived behavior cases as the page reveals new states. Behavior cases have priority over mechanical element clicks. If a behavior case covers an element, do not repeat that element only to satisfy element coverage.

Do not mark a feature complete after only opening a control, menu, picker, or popover. Opening reveals capability; it does not prove the capability works.

## Behavior Profiles

### Text Input, Editor, Composer

Required cases when applicable:

- Empty input and disabled/enabled submit state.
- Plain text entry.
- Leading/trailing spaces.
- Long text.
- Multi-line text or Enter/Shift+Enter behavior.
- Paste behavior when practical.
- Non-ASCII text and emoji.
- Keyboard editing: Backspace, Delete, Escape.
- Submit/reset behavior.
- Trigger sequence behavior for any trigger-like character or toolbar entry that opens suggestions, commands, mentions, references, emoji, macros, or similar insertion UI.
- Token insertion, continuing after inserted content, and deletion if the editor creates chips, links, commands, or structured tokens.

Trigger sequence cases must continue typing after the trigger, verify filtered suggestions update, select an option when available, test close/cancel behavior, and record residual text behavior. Do not count a trigger sequence as covered immediately after the popover opens.

### Form

Required cases when applicable:

- Submit empty required fields.
- Submit invalid values.
- Submit valid values.
- Correct an error and resubmit.
- Loading or disabled state if visible.
- Reset/cancel behavior if available.

### Combobox, Select, Picker

Required cases when applicable:

- Open options.
- Filter or search options when supported.
- Select by mouse.
- Select or move by keyboard when practical.
- Escape close.
- No-match or empty state when practical.
- Reopen after selection or close.

### Menu, Popover, Dialog

Required cases when applicable:

- Open.
- Close with Escape.
- Close by outside click when safe.
- Verify focus or active control returns coherently.
- Execute at least one safe contained action.
- Verify nested popover/menu behavior if revealed.

### Tabs And Segmented Controls

Required cases when applicable:

- Switch to each visible option when safe.
- Verify selected state and content change.
- Verify keyboard movement when practical.

### Table And List

Required cases when applicable:

- Row/item selection or activation.
- Sort, filter, or search when controls exist.
- Pagination or scroll loading when present.
- Empty state when practical.
- Bulk action only when safe and reversible.

### File And Upload

Required cases when applicable:

- Click the upload entry point.
- Record native picker limitation if `agent-browser` cannot select a file.
- Verify cancel/no-file state.
- If a page-level dropzone or programmatic test file path is available, test accepted and rejected file types.

### Search

Required cases when applicable:

- Query with results.
- Query with no results.
- Clear query.
- Select a result when safe.
- Loading/debounce state if visible.

### Navigation And Destructive Actions

Required cases when applicable:

- Test only same-origin or explicitly allowed navigation.
- Skip external navigation with reason.
- Execute destructive actions only in a sandbox or when a confirmation path makes the action reversible.
- If skipped, record the skipped risk in behaviorCases and the report.

## Completion Rule

Behavior testing is complete only when `behaviorCases.pending` is empty or every remaining case is skipped with a clear reason. The convergence loop must consider pending behavior cases in addition to pending element actions.
