# Free Exploration

Use this mode when no qa.md exists, or after case verification to cover interactive elements that were not exercised by scenarios.

## Coverage Ledger

Free exploration must maintain `{OUTPUT_DIR}/coverage.json`. Do not rely on conversation memory to decide what remains.

Use this shape:

```json
{
  "scope": null,
  "status": "running",
  "coverageThresholds": {
    "stablePassesRequired": 2
  },
  "stablePasses": 0,
  "rawInteractiveElements": {
    "initial": 0,
    "latest": 0,
    "distribution": {}
  },
  "coverageActions": {
    "discovered": 0,
    "visited": 0,
    "skipped": 0,
    "outOfScope": 0,
    "pending": 0
  },
  "behaviorCases": {
    "planned": [],
    "pending": [],
    "tested": [],
    "skipped": []
  },
  "discovered": [],
  "pending": [],
  "visited": [],
  "skipped": [],
  "outOfScope": [],
  "halted": null
}
```

`coverageThresholds.stablePassesRequired` defaults to 2. If the user sets `--converge-stable-passes N` or gives an equivalent natural-language instruction, use that value and record it in `coverage.json`.

`rawInteractiveElements` counts current browser snapshot elements by role. `coverageActions` counts planned interaction traits/actions derived from those elements. Do not label coverage action counts as element counts in the report.

Generate behavior cases with `references/behavior-testing.md` before executing raw element actions. Behavior cases are not optional polish; they are part of QA testing.

Each coverage action uses a stable key:

```text
scopeKey + "|" + path + "|" + role + "|" + accessibleName + "|" + nearbyText + "|" + actionKind
```

Do not use `@eN` as the stable key. Refs are only valid for the current snapshot.

## Queue

1. Run `agent-browser snapshot -i --json`.
2. Normalize each visible enabled interactive element into a stable key.
3. Infer feature models and add behavior cases from `references/behavior-testing.md` to `behaviorCases.planned` and `behaviorCases.pending`.
4. Add unseen in-scope elements to `discovered` and `pending`.
5. Sort `behaviorCases.pending` by user workflow order, then sort `pending` top-to-bottom, left-to-right when position is known; otherwise keep snapshot order.
6. Before each action, rematch the stable key to the current `@eN`.
7. Move completed work from `behaviorCases.pending` to `behaviorCases.tested` or `behaviorCases.skipped`, and from `pending` to `visited`, `skipped`, or `outOfScope`.
8. After every interaction, run `agent-browser snapshot -i --json` again and add newly revealed in-scope behavior cases or elements to the queues.

## Per-Element Workflow

For each queued element:

1. Screenshot before:

```bash
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}.png
```

2. Capture the baseline snapshot:

```bash
agent-browser snapshot > {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt
```

3. Highlight the target element and capture the target screenshot:

```bash
agent-browser highlight @eN
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-target.png
```

4. Execute the operation based on the element role.
5. Wait for the page to settle:

```bash
agent-browser wait 1000
```

6. Screenshot after:

```bash
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-after.png
```

7. Capture the snapshot diff:

```bash
agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt
```

8. Run `agent-browser snapshot` only if the diff needs more context.
9. Save console and error output:

```bash
agent-browser console > {OUTPUT_DIR}/console-step-{NNN}.txt
agent-browser errors > {OUTPUT_DIR}/errors-step-{NNN}.txt
```

10. Compare `console-step-{NNN}.txt` against `console-initial.txt` and the previous step's console output. Treat any new console delta as an issue candidate unless it is clearly benign test noise and documented as ignored. New `[error]`, unhandled promise rejection, failed critical request, and React duplicate key warning output such as `Warning: Encountered two children with the same key` must be reported or explicitly justified.
11. Judge the interaction against the 7-item checklist and `references/issue-taxonomy.md`.
12. If an issue is found, assign `ISSUE-NNN`, capture an annotated screenshot, and append it to the report immediately.
13. Write the step to the report. The report entry must include `<img>` tags (HTML) or `![alt](path)` (Markdown) linking the before screenshot (`step-{NNN}.png`), target screenshot (`step-{NNN}-target.png`), after screenshot (`step-{NNN}-after.png`), and annotated screenshot if any. A step without screenshot links is incomplete.

## Convergence Loop

Continue until the queue converges:

1. If `behaviorCases.pending` has an item, process exactly one behavior case using the same evidence workflow.
2. If `pending` has an item, process exactly one item through the per-element workflow.
3. After the action, discover again with `agent-browser snapshot -i --json`.
4. If new in-scope stable keys or behavior cases appear, add them to the appropriate pending queue and set `stablePasses` to 0.
5. If both pending behavior cases and pending element actions are empty, scroll the scope container. If no scope exists, scroll the page.
6. Discover again with `agent-browser snapshot -i --json`.
7. If no new stable keys or behavior cases appear, increment `stablePasses`.
8. If new stable keys or behavior cases appear, add them to pending and set `stablePasses` to 0.
9. Stop only when `pending` is empty, `behaviorCases.pending` is empty, `stablePasses >= coverageThresholds.stablePassesRequired`, the scroll boundary is reached, and no open menu, popover, or dialog remains unexplored.

For scoped exploration, apply every convergence check only to the resolved scope and to overlays triggered by that scope.

## P0 Halt

If an interaction appears to trigger a P0 bug:

1. Mark the issue as `critical` and `P0 candidate`.
2. Capture after screenshot, target screenshot, snapshot diff, console, and errors.
3. Attempt one minimal reproduction from a clean page state:

```bash
agent-browser reload
agent-browser wait 1000
```

4. Repeat only the shortest action sequence that caused the P0.
5. If reproduced, mark the issue as `confirmed P0`.
6. Set `coverage.json.status` to `halted`.
7. Set `coverage.json.halted`:

```json
{
  "issueId": "ISSUE-001",
  "reason": "confirmed P0: submit causes unrecoverable blank screen",
  "lastStep": "step-007",
  "remainingPending": 12
}
```

8. Stop coverage. Do not continue exploring polluted state.

If the issue does not reproduce, mark it intermittent and continue only if the page returns to a trustworthy state.

## Action Strategy

| Role | Action | Details |
|------|--------|---------|
| button | `agent-browser click @eN` | Wait up to 2s and observe the response |
| textbox / searchbox | `agent-browser fill @eN "content"` | Use meaningful values: emails get `test@example.com`, search gets `test query` |
| combobox | `agent-browser click @eN` then select an option | Screenshot the opened options before choosing |
| checkbox / switch | `agent-browser click @eN` | Toggle once, then observe state and dependent UI |
| radio | `agent-browser click @eN` | Select one option in the group |
| menuitem | `agent-browser click @eN` | Open the menu first, then click the item |
| slider | `agent-browser eval` or drag | Move to a midpoint or clearly different value |
| tab | `agent-browser click @eN` | Verify the selected panel changes |
| dialog | `agent-browser dialog accept` or `agent-browser dialog dismiss` | Record dialog text before responding |

## 7-Item Checklist

- Console: no new JavaScript errors, React warnings, unhandled promise rejections, failed critical requests, or unexplained console delta.
- Functional: the action produces the expected state change or clear feedback.
- Visual: no overlap, clipping, layout jump, unreadable state, or broken media appears.
- UX: the interaction is discoverable, reversible when appropriate, and gives timely feedback.
- Accessibility: the element has a meaningful role/name/state and keyboard-visible behavior remains coherent.
- Content: copy is accurate, complete, and not placeholder text.
- Performance: the page responds within a reasonable time and does not appear stuck.

## Skip Rules

Do NOT interact with:

- Links that navigate to external domains.
- Download links.
- Disabled or hidden elements.
- Elements already covered by a previous action or scenario.
- Destructive actions unless the page clearly provides a safe sandbox or confirmation path.

If a skipped element looks risky or important, mention it in the report as skipped with the reason.

## Scrolling And Stopping

After visible elements are explored, scroll through the page and run `agent-browser snapshot -i` again. Add newly visible interactive elements to the queue.

Stop only when:

- All non-skipped visible interactive elements have before/after evidence.
- Newly revealed elements from scrolling or opened panels have been handled.
- `references/stopping-criteria.md` is satisfied.
