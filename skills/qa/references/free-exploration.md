# Free Exploration

Use this mode when no qa.md exists, or after case verification to cover interactive elements that were not exercised by scenarios.

## Queue

1. Run `agent-browser snapshot -i`.
2. Build an interaction queue from visible enabled elements.
3. Sort top-to-bottom, left-to-right.
4. Record stable traits for each queued element: URL/path, role, accessible name/label, nearby text, and visible position.
5. After scrolling or opening a panel, run `agent-browser snapshot -i` again and append newly discovered elements.

Do not rely on `@eN` across snapshots. Use it only for the current action after rematching stable traits.

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

3. Execute the operation based on the element role.
4. Wait for the page to settle:

```bash
agent-browser wait 1000
```

5. Screenshot after:

```bash
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-after.png
```

6. Capture the snapshot diff:

```bash
agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt
```

7. Run `agent-browser snapshot` only if the diff needs more context.
8. Run `agent-browser console` and `agent-browser errors`.
9. Judge the interaction against the 7-item checklist and `references/issue-taxonomy.md`.
10. If an issue is found, assign `ISSUE-NNN`, capture an annotated screenshot, and append it to the report immediately.

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

- Console: no new JavaScript errors, unhandled promise rejections, or failed critical requests.
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
