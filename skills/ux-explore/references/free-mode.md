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

3. **Scan for operation guidance** when controls, menus, panels, dialogs, form fields, or overlays are visible. Use the ARIA description scan from `SKILL.md` when relevant and inspect visible helper text, tooltips, placeholders, and snapshot text.

4. **Queue in-scope guidance** as exploration work. Each instruction must be covered by an upcoming step, linked to an already covered step, or skipped with a reason.

5. **Highlight the target element and screenshot it**:

```bash
agent-browser highlight @eN
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-target.png
```

6. **Execute the operation** based on the element's ARIA role.
7. **Wait** for the page to settle: `agent-browser wait 1000`.
8. **Screenshot after** the interaction:

```bash
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-after.png
```

9. **Diff the snapshot**:

```bash
agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt
```

10. Use `agent-browser snapshot` only when the diff needs more page context.
11. Check `agent-browser console` and `agent-browser errors`.
12. Inspect the before, target, and after screenshots before writing the observation or issue severity. Treat screenshots as UX judgment evidence, not only report attachments.
13. Judge the interaction against intuition criteria, interaction states, and interaction feel. Snapshot diff explains what changed semantically; the screenshots decide what the user could see, trust, understand, or miss.
14. If the action opened a popover, menu, tooltip, dropdown, combobox list, suggestion panel, dialog, drawer, or other overlay, verify from the after screenshot that the overlay is anchored where a user expects, readable, not clipped, not covering unrelated critical UI, and visually connected to the action.
15. Log the observation in first person. If an issue is found, assign a UX-NNN ID and record it.

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

## Operation Guidance Entry

When operation guidance affects a step, include a compact note:

```markdown
- **Guidance source**: aria-describedby / visible helper text / tooltip / placeholder / snapshot text
- **Extracted operation**: {short product-language instruction}
- **Guidance result**: covered by this step / covered by step N / skipped because {reason}
```

## Stopping Condition

The exploration ends naturally when all interactive elements on the page have been explored and all in-scope operation guidance has been covered, linked to an evidence step, or skipped with a documented reason. After every element and in-scope guidance instruction has a documented outcome, proceed to reporting and cleanup.

If a scroll reveals new interactive elements that were not in the initial snapshot, discover them with `agent-browser snapshot -i` after scrolling, add them to the queue, and continue the loop.

If scrolling or opening a control reveals new in-scope operation guidance, add it to the queue before declaring exploration complete.

## Artifacts

- Screenshots: screenshots/
- Snapshot diffs: diffs/

## Reporting Handoff

After every interactive element and in-scope operation guidance instruction has been visited, covered, linked to an evidence step, or skipped with a documented reason, follow `references/reporting.md`.

Create both report families:

- UX critique in `{OUTPUT_DIR}/ux-report.md` and `{OUTPUT_DIR}/ux-report.html`.
- Product usage paths in `{OUTPUT_DIR}/usage.md` and `{OUTPUT_DIR}/usage.html`.
