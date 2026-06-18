# Behavior Testing

Use this reference in every QA mode. Element coverage answers "which controls were touched"; behavior testing answers "which user-facing capabilities were exercised."

The profiles below are a baseline seed set, not an exhaustive list. In every mode, start from this baseline, then test additional product-specific behavior inferred from the current snapshot, screenshot, visible copy, ARIA roles/states, and overlays revealed during testing. Do not treat the baseline as a maximum coverage list.

Keep this reference product-agnostic. It should describe behavior shapes and stress dimensions, not product-specific objects, labels, commands, domain entities, or business workflows. Product-specific behavior comes from the current snapshot, screenshot, visible copy, ARIA roles/states, qa.md, init QA inputs, and overlays revealed during testing.

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

## Operation Guidance Extraction

Product-authored operation guidance is actionable exploration input. Treat `aria-describedby`, `aria-description`, visible helper text, tooltip copy, placeholder text, and snapshot text as guidance when they describe how a user can operate the current control, panel, dialog, menu, picker, form, editor, or page region.

Operation guidance sources include:

- ARIA descriptions and `aria-describedby` targets.
- Visible helper text near controls.
- Tooltips and popovers that explain how to use a control.
- Placeholder text that describes an allowed operation or format.
- Snapshot text that describes keyboard, pointer, selection, filtering, drag, upload, command, or recovery behavior.
- Labels that imply a non-obvious workflow, such as multi-select, apply, clear, retry, manage, expand, choose, or request access.

When guidance is in scope, record each extracted instruction in `operationGuidance` and convert it into behavior cases using the product's own language. Each instruction must become one of:

- `operationGuidance.pending` when it should be exercised, with a linked or newly created behavior case.
- `operationGuidance.covered` when an existing or new scenario, behavior, or element step covers it.
- `operationGuidance.skipped` when it is unsafe, out of scope, redundant, impossible, or would navigate away.

Do not add a keyboard-specific checklist. Keyboard behavior is tested when the product describes it or when a feature model normally requires it. The general rule is that described operation contracts must be verified from the live browser with screenshots, snapshot diffs, console, and errors.

## Ledger Shape

Track behavior testing in `{OUTPUT_DIR}/coverage.json`:

```json
{
  "behaviorCases": {
    "planned": [],
    "pending": [],
    "tested": [],
    "skipped": []
  },
  "operationGuidance": {
    "discovered": [],
    "pending": [],
    "covered": [],
    "skipped": []
  }
}
```

Use stable behavior keys:

```text
scopeKey + "|" + model + "|" + behaviorName + "|" + variant
```

Operation guidance entries use this shape:

```json
{
  "key": "scope|source|selector-or-label|instruction",
  "source": "aria-describedby",
  "instruction": "Use ArrowDown to enter the list",
  "scopeKey": "current-picker",
  "riskLevel": "medium",
  "status": "pending",
  "behaviorCaseKey": "current-picker|picker|keyboard navigation|normal",
  "evidenceStep": null,
  "skipReason": null
}
```

Set `riskLevel` from the linked behavior case when one exists. If no behavior case exists yet, infer risk from the operation's user impact and update it when the guidance is linked to a behavior case.

## Case Generation

Generate baseline behavior cases before processing raw element actions, then keep adding snapshot-derived behavior cases as the page reveals new states. Behavior cases have priority over mechanical element clicks. Generate normal behavior first when needed to understand the workflow, then generate boundary, interruption, sequence, recovery, state, and console-risk variants for high-risk models such as editors, forms, pickers, uploads, dialogs, search, and destructive actions. If a behavior case covers an element, do not repeat that element only to satisfy element coverage.

Do not mark a feature complete after only opening a control, menu, picker, or popover. Opening reveals capability; it does not prove the capability works.

When a scoped or full-page snapshot exposes a product capability not named in the baseline profiles, create a behavior case for the observable workflow using the product's own language. Examples include inserting a reference, choosing a command, selecting an option, attaching a file, or changing a mode.

## General Fault-Seeking Dimensions

For every inferred feature model, generate behavior cases from these dimensions when applicable:

- Normal: prove the basic workflow works before stressing it.
- Boundary: use empty values, whitespace, long values, non-ASCII text, emoji, special characters, multiline input, invalid values, unavailable values, or no-match values.
- Interruption: stop a workflow midway with Escape, outside click, blur/focus change, cancel, close, or route-safe dismissal.
- Sequence: repeat or combine operations after cleanup, such as open-close-reopen, select-then-edit, delete-then-retry, or switch mode then return.
- Recovery: verify the surface remains usable after cancellation, validation errors, no-match states, failed safe actions, or dismissed overlays.
- State consistency: verify role/name/state, focus, selected/expanded/disabled/busy/invalid states, counters, badges, placeholders, chips, and visible copy remain coherent.
- Console risk: treat any new error, warning, unhandled rejection, or failed critical request as an issue candidate unless explicitly benign.

Do not test every dimension blindly for every element. Apply the dimensions that match the feature model and visible UI, then record skipped dimensions with clear reasons when they are unsafe, impossible, or out of scope.

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
- Trigger sequence behavior for any trigger-like character or control that opens suggestions, commands, mentions, references, emoji, macros, or similar insertion UI.
- Structured inline object lifecycle when a selected suggestion or command creates a chip, pill, inline link, mention, command block, or similar non-plain-text object.

Use mature editors as pattern examples, not expected behavior sources: Notion, Slack, Linear, GitHub comments, and Google Docs smart chips all expose trigger or insertion flows where selecting an item may create text, links, mentions, chips, commands, or other inline objects. The target product's visible UI still defines expected behavior.

Trigger sequence and structured-object lifecycle are separate behavior cases. Opening, filtering, canceling, and selecting from a suggestion UI covers the trigger sequence. If selection creates a non-plain-text object, separately verify that users can continue typing around it and remove or clear it when practical. If selection creates only plain text or is unsafe to perform, mark the structured-object case as skipped with the reason.

Trigger sequence cases must continue typing after the trigger, verify filtered suggestions update, select an option when available, test close/cancel behavior, and record residual text behavior. Do not count a trigger sequence as covered immediately after the popover opens.

#### Composer Trigger Sequences

When the scoped component is a composer/editor and exposes trigger characters such as `@`, `/`, `#`, `:`, or controls that open insertion UI, test the observable workflow without assuming a product-specific editor model.

Typed trigger path:

- Start from a clean empty editor with no open popover, stale trigger text, token, or selected item.
- Type the trigger character directly into the editor.
- Verify the suggestion popover/list appears.
- Type at least two filtering characters when practical.
- Verify suggestions update or a clear empty state appears.
- Test the cancel path: close with Escape or the visible close affordance, then verify focus and editor content return to a coherent state.
- Test the selection path when safe: select one candidate if selection is reversible, local to the tested surface, or clearly expected for the workflow. Skip candidates that navigate away, submit data, create external resources, or perform destructive actions.
- After selection, record whether the result is plain text, a structured object, or another visible state change.
- Clear or reset the editor before starting another trigger sequence.

Alternative entry points:

- If the same insertion capability is exposed through a button, menu item, toolbar control, shortcut, or other UI entry point, test that entry point as its own behavior case when practical.
- Verify that opening and dismissing the alternative entry point leaves the editor and focus in a coherent, user-understandable state.
- Do not assume the alternative entry point should insert trigger text, keep the editor focused, or behave identically to typed triggers. Judge only the observable contract exposed by the UI.

Do not run a second trigger while the first trigger text, token, popover, or selected item remains active.

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
