# UX Explore Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a supermario agent skill (`skills/ux-explore/SKILL.md`) that takes a URL, uses agent-browser to systematically interact with every interactive element on the page, records the session, and produces a structured report of unintuitive interactions.

**Architecture:** Single SKILL.md file with YAML frontmatter + Markdown instructions. The skill instructs an LLM agent to drive `agent-browser` CLI commands via Bash, make autonomous interaction decisions, judge each action against six intuition criteria, and build a report incrementally. No auxiliary scripts or reference files.

**Tech Stack:** agent-browser CLI, Bash, Markdown

---

### Task 1: Create skill directory and YAML frontmatter

**Files:**
- Create: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p skills/ux-explore
```

- [ ] **Step 2: Create SKILL.md with frontmatter**

Write `skills/ux-explore/SKILL.md` with this frontmatter block:

```markdown
---
name: ux-explore
description: Systematically explore a web page's interactive elements using agent-browser, record every interaction with screenshots and video, and produce a structured report identifying unintuitive UX patterns. Use when asked to "explore this page", "test UX", "check interaction intuition", "audit interactions", "UX review", or "find UX issues on this page".
argument-hint: "<url> [output-dir]"
arguments:
  - url
  - output-dir
---
```

- [ ] **Step 3: Verify the file was created correctly**

Run: `head -10 skills/ux-explore/SKILL.md`
Expected: Shows the YAML frontmatter with name, description, argument-hint, and arguments.

- [ ] **Step 4: Commit**

```bash
git add skills/ux-explore/SKILL.md
git commit -m "feat(ux-explore): scaffold skill with frontmatter"
```

---

### Task 2: Write the Setup section

**Files:**
- Modify: `skills/ux-explore/SKILL.md` (append after frontmatter)

- [ ] **Step 1: Append the title, overview, and setup instructions**

Append to `skills/ux-explore/SKILL.md` after the `---` closing the frontmatter:

```markdown

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
```

- [ ] **Step 2: Verify the file reads correctly**

Run: `grep -c "## Setup" skills/ux-explore/SKILL.md`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add skills/ux-explore/SKILL.md
git commit -m "feat(ux-explore): add setup section"
```

---

### Task 3: Write the Exploration Loop section

**Files:**
- Modify: `skills/ux-explore/SKILL.md` (append after Setup)

- [ ] **Step 1: Append the exploration loop instructions**

Append to `skills/ux-explore/SKILL.md`:

```markdown

## Exploration Loop

Work through interactive elements top-to-bottom, left-to-right. For each element:

### Per-Element Workflow

1. **Screenshot before** the interaction.
2. **Execute the operation** based on the element's ARIA role (see Action Strategy below).
3. **Wait** for the page to settle: `agent-browser wait 1000`.
4. **Screenshot after** the interaction.
5. **Re-snapshot** to check what changed: `agent-browser snapshot`.
6. **Check console** for errors triggered by the interaction: `agent-browser console`.
7. **Judge** the interaction against the Intuition Criteria below.
8. **Log** the observation. If an issue is found, assign a UX-NNN ID and record it.

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
```

- [ ] **Step 2: Verify**

Run: `grep -c "## Exploration Loop" skills/ux-explore/SKILL.md`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add skills/ux-explore/SKILL.md
git commit -m "feat(ux-explore): add exploration loop section"
```

---

### Task 4: Write the Intuition Criteria section

**Files:**
- Modify: `skills/ux-explore/SKILL.md` (append after Exploration Loop)

- [ ] **Step 1: Append the intuition criteria**

Append to `skills/ux-explore/SKILL.md`:

```markdown

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
```

- [ ] **Step 2: Verify**

Run: `grep -c "### [1-6]\." skills/ux-explore/SKILL.md`
Expected: `6`

- [ ] **Step 3: Commit**

```bash
git add skills/ux-explore/SKILL.md
git commit -m "feat(ux-explore): add intuition criteria section"
```

---

### Task 5: Write the Report Format section

**Files:**
- Modify: `skills/ux-explore/SKILL.md` (append after Intuition Criteria)

- [ ] **Step 1: Append the report format and issue severity**

Append to `skills/ux-explore/SKILL.md`:

```markdown

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
```

- [ ] **Step 2: Verify**

Run: `grep -c "## Report Format" skills/ux-explore/SKILL.md`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add skills/ux-explore/SKILL.md
git commit -m "feat(ux-explore): add report format and severity section"
```

---

### Task 6: Write the Cleanup and Guidance section

**Files:**
- Modify: `skills/ux-explore/SKILL.md` (append after Report Format)

- [ ] **Step 1: Append cleanup and guidance**

Append to `skills/ux-explore/SKILL.md`:

```markdown

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

4. Tell the user the report is ready and summarize: total issues, breakdown by severity, and the most critical items.

## Guidance

- **Judge as a user, not a tester.** You are exploring like a real person who has never seen this page before. If something feels off, investigate.
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
```

- [ ] **Step 2: Verify**

Run: `grep -c "## Guidance" skills/ux-explore/SKILL.md`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add skills/ux-explore/SKILL.md
git commit -m "feat(ux-explore): add cleanup and guidance section"
```

---

### Task 7: Verify the complete skill works end-to-end

**Files:**
- Verify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Verify the full file is well-formed**

Run: `wc -l skills/ux-explore/SKILL.md`
Expected: ~200+ lines

- [ ] **Step 2: Verify all required sections are present**

Run: `grep "^## " skills/ux-explore/SKILL.md`
Expected output should contain:
```
## Inputs
## Setup
## Exploration Loop
## Intuition Criteria
## Issue Severity
## Report Format
## Cleanup
## Guidance
```

- [ ] **Step 3: Verify the frontmatter parses correctly**

Run: `head -8 skills/ux-explore/SKILL.md`
Expected: Shows `---`, `name: ux-explore`, `description:`, `argument-hint:`, `arguments:`, `---`

- [ ] **Step 4: Do a dry-run test against a real page**

Run the skill manually against a simple page to verify the commands work:

```bash
agent-browser open https://example.com
agent-browser wait --load networkidle
agent-browser snapshot -i
agent-browser close
```

Expected: Opens the page, returns interactive elements, closes without errors.

- [ ] **Step 5: Commit any fixes**

If any fixes were needed during verification:

```bash
git add skills/ux-explore/SKILL.md
git commit -m "fix(ux-explore): address verification findings"
```
