---
name: ux-explore
description: Systematically explore a web page's interactive elements using agent-browser, record every interaction with screenshots and video, and produce a structured report identifying unintuitive UX patterns. Use when asked to "explore this page", "test UX", "check interaction intuition", "audit interactions", "UX review", or "find UX issues on this page".
argument-hint: "<url> [output-dir]"
arguments:
  - url
  - output-dir
---

# UX Explore

Systematically explore a web page by interacting with every interactive element, recording the full session, and reporting interactions that feel unintuitive from a user's perspective. Unlike QA bug hunting, this skill focuses on design-level issues: things that technically work but confuse, mislead, or frustrate users.

## Inputs

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| URL | Yes | - | Target page URL |
| Output directory | No | `./ux-explore-output/` | Where to save artifacts |

If the user says something like "explore example.com", start immediately. Do not ask clarifying questions unless the URL is missing.

## Setup

1. Create output directories and start the report file:

```bash
mkdir -p {OUTPUT_DIR}/screenshots
```

2. Launch the browser and wait for the page to fully load:

```bash
agent-browser open {URL}
agent-browser wait --load networkidle
```

3. Start recording the full session video:

```bash
agent-browser record start {OUTPUT_DIR}/explore-video.webm
```

4. Capture the initial annotated screenshot and discover interactive elements:

```bash
agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/initial.png
agent-browser snapshot -i
agent-browser console
agent-browser errors
```

5. Count the interactive elements and classify them by role. Note the distribution in the report header (e.g., "5 buttons, 3 textboxes, 2 selects, 1 checkbox").

## Exploration Loop

Work through interactive elements top-to-bottom, left-to-right. For each element:

### Per-Element Workflow

1. **Screenshot before** the interaction.
2. **Execute the operation** based on the element's ARIA role (see Action Strategy below).
3. **Wait** for the page to settle: `agent-browser wait 1000`.
4. **Screenshot after** the interaction.
5. **Re-snapshot** to check what changed: `agent-browser snapshot`.
6. **Check console** for errors triggered by the interaction: `agent-browser console`.
7. **Judge** the interaction against the Intuition Criteria below, and evaluate the interaction feel:
   - **Response feel**: Does clicking feel responsive? Any delays or missing loading states?
   - **Transition quality**: Are transitions intentional or generic/absent?
   - **Feedback clarity**: Did the action clearly succeed or fail? Is the feedback immediate?
   - **Form polish**: Focus states visible? Validation timing correct? Errors near the source?
8. **Update the goodwill meter** based on drains and fills from this step.
9. **Log** the observation in first person. If an issue is found, assign a UX-NNN ID and record it.

### Action Strategy

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

### Skip Rules

Do NOT interact with:
- Links that navigate to external domains (would leave the page)
- Download links
- Elements already interacted with in a previous step
- Elements that are disabled or hidden

### Screenshot Naming

```
{OUTPUT_DIR}/screenshots/step-{NNN}.png          # before action
{OUTPUT_DIR}/screenshots/step-{NNN}-after.png    # after action
```

Increment `{NNN}` for each element explored (001, 002, 003...).

### Stopping Condition

The exploration ends naturally when all interactive elements on the page have been explored. After every element has been visited (or skipped with a documented reason), proceed to the Cleanup section.

If a scroll reveals new interactive elements that were not in the initial snapshot, discover them with `agent-browser snapshot -i` after scrolling, add them to the queue, and continue the loop.

## Narration Mode

Explore in first person, as a real user who has never seen this page before. Name the specific element, its position, its visual weight. If you can't name it specifically, you're generating platitudes — look harder.

```
"I click the '引用资源' button... the page jumps to a different URL... a '正在备份' 
overlay appears... everything is greyed out... I can't do anything... 5 seconds pass... 
still backing up... 10 seconds... where did my text go? It's gone. I'm stuck."
```

Every observation in the exploration log should read like this — specific, first-person, naming what you see and how it feels. Not "the interaction lacked feedback" but "I clicked and nothing happened — did it work? I can't tell."

## Goodwill Reservoir

Track a running goodwill score as you explore. Start at 70/100. These scores are heuristic, not measured. The value is in identifying specific drains and fills, not the final number.

### Drains (subtract)

| Trigger | Points |
|---------|--------|
| Hidden information the user would want (pricing, status, progress) | -15 |
| Action destroys user work without warning or confirmation | -15 |
| Interstitials, forced tours, overlays blocking the task | -15 |
| Format punishment (rejecting valid input like dashes in phone numbers) | -10 |
| Unnecessary information requests | -10 |
| Sloppy or unprofessional appearance | -10 |
| Ambiguous choices that require thinking | -5 each |
| No feedback after an action (did it work?) | -5 |
| Inconsistent behavior (same pattern works differently elsewhere) | -5 |

### Fills (add)

| Trigger | Points |
|---------|--------|
| Top user tasks are obvious and prominent | +10 |
| Graceful error recovery with specific fix instructions | +10 |
| Saves steps (direct links, smart defaults, autofill) | +5 each |
| Upfront about costs, limitations, or consequences | +5 |
| Apologizes or explains when things go wrong | +5 |
| Delightful micro-interaction that builds confidence | +5 |

### Reporting

At the end of the exploration, include a goodwill dashboard in the report:

```
Goodwill: 70 ██████████████████░░░░░░░░░░░░
  Step 1: Focus input          70 → 70  (neutral, placeholder is clear)
  Step 2: Type text             70 → 70  (send button enables, good)
  Step 3: Click "引用资源"       70 → 45  (-15 text cleared without warning, -10 all buttons disabled)
  Step 4: Wait for backup       45 → 40  (-5 no progress indication)
  FINAL: 40/100 ⚠️ NEEDS WORK
```

Thresholds:
- **Below 30**: Critical UX debt. Users are actively suffering.
- **30–60**: Needs work. Cumulative friction is building.
- **Above 60**: Healthy. Users feel in control.

## Intuition Criteria

Judge each interaction against these six dimensions. Log an issue when any dimension fails:

### 1. Action Feedback
After an operation, does the page provide clear visual feedback?
- Loading indicators for async operations
- State changes visible (button disabled, checkmark appears)
- Toast/notification for completed actions
- **Fail example**: click submit, nothing visible happens

### 2. Expectation Match
Does the result match what a user would expect from the label/appearance?
- "Submit" button submits the form
- "Delete" removes the item
- Toggle switch reflects its state visually
- **Fail example**: "Save" button navigates away instead of saving in-place

### 3. State Visibility
Can the user tell what the current state is?
- Selected/active states visible
- Form completion progress clear
- Which tab/section is active
- **Fail example**: no visual difference between selected and unselected tabs

### 4. Error Recovery
When something goes wrong, can the user understand and fix it?
- Validation errors appear near the relevant field
- Error messages are specific and actionable
- User can correct and retry without losing work
- **Fail example**: generic "something went wrong" with no indication which field

### 5. Operation Path
Is the number of steps reasonable for the task?
- Common actions reachable in 1-2 clicks
- No unnecessary confirmation steps for non-destructive actions
- Multi-step flows show progress
- **Fail example**: 5 clicks to complete a simple toggle

### 6. Accident Prevention
Are dangerous or confusing operations protected?
- Destructive actions require confirmation
- Irreversible actions have undo or clear warning
- Easy-to-misclick targets have adequate spacing
- **Fail example**: delete button next to edit button with no confirmation

## Issue Severity

| Level | Definition |
|-------|------------|
| High | User gets stuck, confused, or makes a wrong decision (no feedback on submit, misleading button label) |
| Medium | Noticeably unintuitive but discoverable (missing placeholder, non-obvious default, extra steps) |
| Low | Minor friction (slow tooltip, subtle hover effect, slightly confusing icon) |

## Report Format

Write the report incrementally as you explore. Append each step and each issue as you find them so nothing is lost if the session is interrupted. Do not batch all writing for the end.

The final report goes to `{OUTPUT_DIR}/report.md`:

```markdown
# UX Explore Report: {URL}

## Session Info
| Field | Value |
|-------|-------|
| URL | {url} |
| Date | {date} |
| Interactive elements found | {count} |
| Elements explored | {count} |
| Issues found | {count} |
| Video | explore-video.webm |

## Page Overview
[1-2 sentence description of the page purpose and layout]
[Element distribution: N buttons, M textboxes, L selects, ...]
![Initial state](screenshots/initial.png)

## Exploration Log

### Step 1: Click @e3 "Submit" button
- **Before**: ![step-001](screenshots/step-001.png)
- **Action**: click @e3
- **After**: ![step-001-after](screenshots/step-001-after.png)
- **Observation**: [what happened, what changed]
- **Issue**: None / UX-NNN

[... one entry per element explored ...]

## Goodwill Dashboard

```
Goodwill: 70 ██████████████████░░░░░░░░░░░░
  Step 1: [description]    70 → 75  (+5 reason)
  Step 2: [description]    75 → 60  (-15 reason)
  ...
  FINAL: XX/100 [VERDICT]
```

## Issues

### UX-001: [Short title]
| Field | Value |
|-------|-------|
| Severity | high / medium / low |
| Category | Action Feedback / Expectation Match / State Visibility / Error Recovery / Operation Path / Accident Prevention |
| Element | @eN role "label" |
| Evidence | step-NNN screenshots, video timestamp |
| Description | [what is wrong, what was expected, what actually happened] |
| Recommendation | [how to fix it] |

[... one block per issue ...]

## Summary

### Goodwill
| Field | Value |
|-------|-------|
| Final score | XX/100 |
| Verdict | Critical UX Debt / Needs Work / Healthy |
| Biggest drain | [what hurt most] |
| Biggest fill | [what helped most] |

### Issues
| Severity | Count |
|----------|-------|
| High | N |
| Medium | M |
| Low | L |
| **Total** | **T** |

## Artifacts
- Full video: explore-video.webm
- Screenshots: screenshots/
```

**Important:** Re-read the report after finishing exploration and update the summary severity counts so they match the actual issues found. Every `### UX-` block must be reflected in the totals.

## Cleanup

After exploring all interactive elements:

1. Stop the video recording:

```bash
agent-browser record stop
```

2. Close the browser:

```bash
agent-browser close
```

3. Re-read the report and update the summary counts to match actual issues found.

4. Tell the user the report is ready and summarize: goodwill score with verdict, total issues, breakdown by severity, and the most critical items.

## Guidance

- **Judge as a user, not a tester.** You are exploring like a real person who has never seen this page before. If something feels off, investigate.
- **Narrate in first person.** "I click the button... nothing happens... did it work?" — not "the interaction lacked feedback." Specific, concrete, naming elements. If you can't name the element, you're generating platitudes.
- **Write findings incrementally.** Append each issue to the report as you discover it. If the session is interrupted, findings are preserved. Never batch all issues for the end.
- **Use the right snapshot command.** `snapshot -i` for finding clickable/fillable elements. `snapshot` (no flag) for reading page content and understanding context after an action.
- **Screenshot each step.** Capture the before, the action, and the after so someone reading the report can follow along visually.
- **Match evidence to issue type.** Every issue needs a screenshot reference. If the issue involves user interaction or state change, reference both the before and after screenshots.
- **Check console periodically.** Run `agent-browser console` and `agent-browser errors` every few interactions. Some issues are invisible in the UI but show up as JS errors or failed network requests.
- **Never read the target app's source code.** You are testing as a user. All findings must come from what you observe in the browser.
- **Never delete output files.** Do not `rm` screenshots, videos, or the report mid-session. Work forward, not backward.
- **Pace the exploration.** Use `agent-browser wait 1000` between actions to let the page settle and make the video watchable.
- **Be thorough but use judgment.** Not every element needs the same depth of investigation. Spend more time on complex interactions (forms, modals, multi-state controls) and less on simple static buttons.
- **Skip navigation links.** This is a single-page exploration. Do not follow links that would navigate away from the current URL. Note their existence but do not click them.
- **Only use `agent-browser` directly.** Never use `npx agent-browser` or any other browser automation tool. The direct binary is faster.
