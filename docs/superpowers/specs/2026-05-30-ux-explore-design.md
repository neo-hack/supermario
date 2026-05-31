# UX Explore Skill Design

## Overview

A supermario agent skill that takes a URL, opens it with `agent-browser`, systematically discovers and interacts with every interactive element on the page, records the full exploration (screenshots + video), and produces a structured report identifying interactions that feel unintuitive from a user's perspective.

Unlike QA bug hunting (which finds broken things), this skill focuses on design-level issues: interactions that technically work but confuse, mislead, or frustrate users.

## Inputs

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| URL | Yes | - | Target page URL |
| Output directory | No | `./ux-explore-output/` | Where to save artifacts |

No scope, no navigation depth, no auth — single page, all interactive elements.

## Architecture

Single `SKILL.md` file at `skills/ux-explore/SKILL.md`. No auxiliary scripts. No `references/` directory for v1.

The skill instructs the LLM agent to:
1. Drive `agent-browser` CLI commands via Bash
2. Make autonomous decisions about what to interact with and how
3. Judge each interaction against the "interaction intuition" criteria
4. Build a report incrementally as it explores

This matches the project pattern established by `fire` and `ui-review` skills.

## Core Loop

```
agent-browser open <url>
    |
    v
record start (full session video)
screenshot --annotate (initial state)
snapshot -i (discover interactive elements)
    |
    v
For each interactive element (top-to-bottom):
    1. screenshot before
    2. execute operation (click/fill/type/hover/check)
    3. wait for response
    4. screenshot after
    5. snapshot (check what changed)
    6. judge against intuition criteria
    7. log observation + issue if any
    |
    v
record stop
generate report
close browser
```

### Element Discovery

`agent-browser snapshot -i` returns interactive elements with `@eN` refs. Elements are classified by ARIA role:

| Role | Action | Example content |
|------|--------|----------------|
| button | click | submit, cancel, toggle |
| textbox / searchbox | fill with meaningful content | email: `test@example.com`, search: `test query` |
| combobox / select | open, choose option | pick first non-empty option |
| checkbox / switch | toggle | check, observe state change |
| radio | click one option | select first option |
| link | skip (stay on page) | only note existence |
| menuitem | click | open menu, click item |
| slider | adjust value | move to midpoint |
| tab | click | switch tab panel |
| dialog | handle | accept/dismiss, record content |

### Skip Rules

- Links to external domains (would navigate away)
- Links to anchors on same page that cause full navigation
- Download links
- Elements already interacted with in a previous step

### Operation Strategy

Simulate a real user operating top-to-bottom, left-to-right:

1. **Forms**: fill fields with meaningful test content before submitting
2. **Buttons**: click, wait up to 2 seconds, observe response
3. **Dropdowns**: open, screenshot options, select reasonable value
4. **Toggles**: flip state, screenshot both states if possible
5. **Hover menus**: hover, screenshot revealed content
6. **Modals/dialogs**: handle (accept/dismiss), record content

Use `agent-browser wait 1000` between actions to let the page settle.

## Intuition Criteria

Each interaction is judged on six dimensions. An issue is logged when any dimension fails:

### 1. Action Feedback
After an operation, does the page provide clear visual feedback?
- Loading indicators for async operations
- State changes visible (button disabled, checkmark appears)
- Toast/notification for completed actions
- **Fail**: click submit, nothing visible happens

### 2. Expectation Match
Does the result match what a user would expect from the label/appearance?
- "Submit" button submits the form
- "Delete" removes the item
- Toggle switch reflects its state visually
- **Fail**: "Save" button navigates away instead of saving in-place

### 3. State Visibility
Can the user tell what the current state is?
- Selected/active states visible
- Form completion progress clear
- Which tab/section is active
- **Fail**: no visual difference between selected and unselected tabs

### 4. Error Recovery
When something goes wrong, can the user understand and fix it?
- Validation errors appear near the relevant field
- Error messages are specific and actionable
- User can correct and retry without losing work
- **Fail**: generic "something went wrong" with no indication which field

### 5. Operation Path
Is the number of steps reasonable for the task?
- Common actions reachable in 1-2 clicks
- No unnecessary confirmation steps for non-destructive actions
- Multi-step flows show progress
- **Fail**: 5 clicks to complete a simple toggle

### 6. Accident Prevention
Are dangerous or confusing operations protected?
- Destructive actions require confirmation
- Irreversible actions have undo or clear warning
- Easy-to-misclick targets have adequate spacing
- **Fail**: delete button next to edit button with no confirmation

## Issue Severity

| Level | Definition |
|-------|------------|
| High | User gets stuck, confused, or makes a wrong decision (no feedback on submit, misleading button label) |
| Medium | Noticeably unintuitive but discoverable (missing placeholder, non-obvious default, extra steps) |
| Low | Minor friction (slow tooltip, subtle hover effect, slightly confusing icon) |

## Output

```
ux-explore-output/
  report.md              # Structured findings report
  screenshots/
    initial.png          # Annotated initial page
    step-001.png         # Before each action
    step-001-after.png   # After each action
    ...
  explore-video.webm     # Full session recording
```

### Report Format

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
[1-2 sentence description of the page]
[Element distribution: N buttons, M inputs, L selects, ...]
![Initial state](screenshots/initial.png)

## Exploration Log

### Step 1: Click @e3 "Submit" button
- **Before**: ![step-001](screenshots/step-001.png)
- **Action**: click @e3
- **After**: ![step-001-after](screenshots/step-001-after.png)
- **Observation**: Loading spinner appeared, success toast after 1.5s
- **Issue**: None

### Step 2: Fill @e5 "Email" input
- **Before**: ![step-002](screenshots/step-002.png)
- **Action**: fill @e5 "test@example.com"
- **After**: ![step-002-after](screenshots/step-002-after.png)
- **Observation**: No placeholder text to indicate expected format
- **Issue**: UX-001

...

## Issues

### UX-001: Email input lacks format guidance
| Field | Value |
|-------|-------|
| Severity | medium |
| Category | Action Feedback |
| Element | @e5 textbox "Email" |
| Evidence | step-002 screenshots, video 0:15-0:18 |
| Criterion | Action Feedback |
| Description | The email input has no placeholder, label, or hint text. A user unfamiliar with the form cannot tell what format is expected. |
| Recommendation | Add placeholder="e.g. user@company.com" or a visible label above the input. |

...

## Summary
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

## agent-browser Commands Used

| Phase | Command | Purpose |
|-------|---------|---------|
| Setup | `agent-browser open <url>` | Launch browser |
| Setup | `agent-browser wait --load networkidle` | Wait for page ready |
| Setup | `agent-browser screenshot --annotate <path>` | Initial annotated screenshot |
| Setup | `agent-browser record start <path>` | Start video recording |
| Explore | `agent-browser snapshot -i` | Discover interactive elements |
| Explore | `agent-browser snapshot` | Full accessibility tree for context |
| Explore | `agent-browser click @eN` | Click element |
| Explore | `agent-browser fill @eN "text"` | Fill input |
| Explore | `agent-browser select @eN "value"` | Select dropdown option |
| Explore | `agent-browser check @eN` | Check checkbox |
| Explore | `agent-browser hover @eN` | Hover element |
| Explore | `agent-browser press Enter` | Press key |
| Explore | `agent-browser wait 1000` | Let page settle |
| Explore | `agent-browser screenshot <path>` | Capture state |
| Explore | `agent-browser console` | Check for JS errors |
| Explore | `agent-browser errors` | Check for uncaught exceptions |
| Cleanup | `agent-browser record stop` | Save video |
| Cleanup | `agent-browser close` | Close browser |

## Constraints

- Single page only: do not follow links that navigate away
- No source code reading: judge only from what a user sees
- Fully automated: no user confirmation during exploration
- agent-browser only: no Playwright, Puppeteer, or other tools
- Headless by default: use `--headed` only if user requests it

## Relationship to Existing Skills

- **ui-review**: compares live UI against design references or quality standards. UX Explore is complementary — it actively interacts with the page rather than passively inspecting it.
- **fire**: dispatches parallel agents for dead code analysis. UX Explore could eventually use parallel agents for responsive testing, but v1 is sequential.
- **agent-browser dogfood**: built-in QA skill that does multi-page bug hunting. UX Explore is different in scope (single page), focus (interaction intuition vs bugs), and is a standalone supermario skill.

## Future Considerations (out of scope for v1)

- Multi-page exploration with configurable depth
- Responsive testing (mobile/tablet viewports)
- Performance metrics collection (Web Vitals)
- Parallel exploration of independent page sections
- `references/` directory with detailed intuition criteria if the skill grows
