# Free Mode

Free mode is page-level exploration. Work through interactive elements top-to-bottom, left-to-right. For each element, capture evidence before judging the interaction.

## Per-Step Workflow

1. **Screenshot before** the interaction:

```bash
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}.png
```

2. **Capture the baseline snapshot**:

```bash
agent-browser snapshot > {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt
```

3. **Highlight the target element and screenshot it**:

```bash
agent-browser highlight @eN
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-target.png
```

4. **Execute the operation** based on the element's ARIA role.
5. **Wait** for the page to settle: `agent-browser wait 1000`.
6. **Screenshot after** the interaction:

```bash
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-after.png
```

7. **Diff the snapshot**:

```bash
agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt
```

8. Use `agent-browser snapshot` only when the diff needs more page context.
9. Check `agent-browser console` and `agent-browser errors`.
10. Judge the interaction against intuition criteria, interaction states, and interaction feel.
11. Log the observation in first person. If an issue is found, assign a UX-NNN ID and record it.

## Action Strategy

| Role | Action | Details |
|------|--------|---------|
| button | `agent-browser click @eN` | Wait up to 2s, observe response |
| textbox / searchbox | `agent-browser fill @eN "content"` | Use meaningful test content: emails get `test@example.com`, search gets `test query`, names get `Test User` |
| combobox | `agent-browser click @eN` then select option | Open dropdown, screenshot options, pick first reasonable option |
| checkbox / switch | `agent-browser click @eN` | Toggle state, observe change |
| radio | `agent-browser click @eN` | Select first option in group |
| menuitem | `agent-browser click @eN` | Open menu, click item |
| slider | `agent-browser eval` or drag | Adjust to midpoint |
| tab | `agent-browser click @eN` | Switch tab panel, observe content change |
| dialog | Handle via `agent-browser dialog accept` or `dismiss` | Record dialog content |

## Skip Rules

Do not interact with:

- Links that navigate to external domains.
- Download links.
- Elements already interacted with in a previous step.
- Elements that are disabled or hidden.

## Screenshot Naming

```text
{OUTPUT_DIR}/screenshots/step-{NNN}.png          # before action
{OUTPUT_DIR}/screenshots/step-{NNN}-target.png   # highlighted target
{OUTPUT_DIR}/screenshots/step-{NNN}-after.png    # after action
```

Increment `{NNN}` for each element explored (001, 002, 003...). A step without before, target, and after screenshots is incomplete.

## Step Report Entry

```markdown
### Step 1: Click @e3 "Submit" button
- **Before**: ![step-001](screenshots/step-001.png)
- **Target**: ![step-001-target](screenshots/step-001-target.png)
- **Action**: click @e3
- **After**: ![step-001-after](screenshots/step-001-after.png)
- **Diff**: [step-001 diff](diffs/step-001.txt)
- **Observation**: [what happened, what changed]
- **Issue**: None / UX-NNN
```

## Stopping Condition

The exploration ends naturally when all interactive elements on the page have been explored. After every element has been visited or skipped with a documented reason, proceed to reporting and cleanup.

If a scroll reveals new interactive elements that were not in the initial snapshot, discover them with `agent-browser snapshot -i` after scrolling, add them to the queue, and continue the loop.

## Artifacts

- Screenshots: screenshots/
- Snapshot diffs: diffs/
