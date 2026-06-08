---
name: ux-explore
description: Use when asked to explore, test UX, check interaction intuition, audit interactions, review UX, or find unintuitive behavior on a web page with agent-browser.
argument-hint: '[--journey "<goal>"] <url> [output-dir]'
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
| Mode | No | free | Use free mode for page-level exploration, or journey mode when the user gives `--journey "<goal>"` or describes a complete feature flow |
| Journey goal | Journey mode only | - | User task to complete, such as "RSS subscription journey" |
| Output directory | No | `~/.config/supermario/ux/YYYY-MM-DD-<ux-name>/` | Where to save artifacts |

If the user says something like "explore example.com", start in free mode immediately. If the user describes a product task, feature flow, or says `--journey "<goal>"`, start in journey mode. Do not ask clarifying questions unless the URL is missing or the journey goal is too vague to identify a first action.

## Mode Selection

Use exactly one mode:

- **Free mode**: page-level exploration. Use this when the user asks to explore, review, or audit a page without naming a product task.
- **Journey mode**: complete feature flow exploration. Use this when the user names a goal that should be experienced end-to-end, such as adding an RSS feed, refreshing it, opening an item, and recovering from invalid input.

In journey mode, the user goal controls the path. Do not traverse unrelated elements before the journey is complete or blocked.

## Required References

Read the references for the selected work:

- For free mode, follow `references/free-mode.md`.
- For Markdown and HTML outputs, follow `references/usage-output.md`.

Journey mode still uses the same evidence, reporting, and output contracts from those references for each journey step.

## Setup

1. Create output directories:

```bash
mkdir -p {OUTPUT_DIR}/screenshots {OUTPUT_DIR}/snapshots {OUTPUT_DIR}/diffs
```

When no output directory is provided, derive `ux-name` from the target host, route, journey goal, or requested scope. Resolve `{OUTPUT_DIR}` to `~/.config/supermario/ux/YYYY-MM-DD-<ux-name>/`, using a short lowercase slug such as `vercel-home`, `rss-subscription-journey`, or `settings-panel`.

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

## How Users Actually Behave

These principles govern how real humans interact with interfaces. Apply them during exploration:

- **Users scan, they don't read.** They look for something to click. Headings, bold text, links — anything that looks like a button. If your exploration narration reads like a novel, the page is failing the scan test.
- **Users satisfice.** They pick the first reasonable option, not the best. If a dropdown has 20 options and the first one is wrong, flag it — most users will never see option 19.
- **Users muddle through.** They don't read tooltips or discover hidden features. If an element requires explanation to use, the design has failed.
- **Make clickable things obviously clickable.** No relying on hover states for discoverability. Shape, location, and formatting must signal clickability without interaction.
- **Clarity trumps consistency.** If something being slightly inconsistent would make it significantly clearer, the inconsistency is the right call.

## Trunk Test

After the initial page load, answer these 6 questions. A FAIL on any is a HIGH issue:

1. What site/app is this? (branding visible and identifiable)
2. What page/screen am I on? (page name matches what I'd expect)
3. What are the major sections? (primary nav or sidebar visible)
4. What are my options at this level? (available actions obvious)
5. Where am I in the scheme of things? (active state, breadcrumbs, or "you are here" indicator)
6. How can I search? (search box findable without hunting)

Score: PASS (all 6 clear) / PARTIAL (4-5) / FAIL (3 or fewer).

## Journey Mode

Use journey mode to experience a complete feature flow from the user's point of view. The goal is not to click every element on the page; it is to find whether a real user can finish the task with confidence.

### Journey Brief

Before interacting, write a brief in the report:

```markdown
## Journey Brief

| Field | Value |
|-------|-------|
| Goal | {journey goal} |
| Starting page | {url} |
| Assumed user | first-time user |
| Success criteria | {observable end state} |
| Known test data | {feed URL, account, search term, or none} |
```

Define success criteria as observable product states, not internal implementation details. For an RSS subscription journey, good success criteria are: the feed is added, the feed appears in the list, refresh feedback is visible, items appear or a clear empty/error state appears, and an item can be opened.

### Journey Planning

1. Run `agent-browser snapshot -i` and inspect the initial annotated screenshot.
2. Identify the most direct user path toward the goal.
3. If there are multiple plausible starts, choose the one a first-time user would pick first.
4. If no credible first action exists, record the journey as blocked and explain what was missing.
5. Keep navigation within the product unless the journey explicitly requires leaving the page.

### Journey Execution

For each journey step:

1. Capture the same before screenshot, target screenshot, baseline snapshot, after screenshot, snapshot diff, console, and errors required by the per-element workflow.
2. Narrate in first person: what I thought I should do, what I clicked or typed, what changed, and whether I felt confident.
3. Judge the step against the Intuition Criteria and Goodwill Reservoir.
4. Continue toward the success criteria, not toward unrelated controls.
5. If the path branches, choose the branch that best matches the user's stated goal.
6. If the journey needs test data and none was provided, use safe realistic data when obvious, such as `https://example.com/feed.xml` for an RSS URL placeholder. If realistic data is not obvious, ask the user for it.

### Journey Stopping

Stop journey mode when one of these is true:

- The success criteria are met.
- The flow is blocked and no user-visible recovery path exists.
- The flow becomes partial because a sub-step works but the final state cannot be verified.

After the journey stops, optionally free-explore only directly related controls that were revealed by the journey. Do not convert journey mode into full-page traversal unless the user asks for free exploration too.

### Journey Results

Record the journey outcome in `ux-report.md`:

```markdown
## Journey Results

| Field | Value |
|-------|-------|
| Goal | {journey goal} |
| Outcome | completed / partial / blocked |
| Success criteria | {met / unmet list} |
| Critical path steps | {count} |
| Biggest friction | {short description} |
```

## Free Mode

For free mode, follow `references/free-mode.md`.

## Narration Mode

Explore in first person, as a real user who has never seen this page before. Name the specific element, its position, its visual weight. If you can't name it specifically, you're generating platitudes — look harder.

```
"I click the 'Attach resources' button... the page jumps to a different URL... a 'Backing up'
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
  Step 3: Click "Attach resources" 70 → 45  (-15 text cleared without warning, -10 all buttons disabled)
  Step 4: Wait for backup       45 → 40  (-5 no progress indication)
  FINAL: 40/100 ⚠️ NEEDS WORK
```

Thresholds:
- **Below 30**: Critical UX debt. Users are actively suffering.
- **30–60**: Needs work. Cumulative friction is building.
- **Above 60**: Healthy. Users feel in control.

## Interaction States Checklist

For each interactive element, verify these states are present and correct. Flag missing or broken states as issues.

| # | State | What to check | Fail example |
|---|-------|---------------|-------------|
| 1 | Hover | Visual change on hover (color shift, underline, shadow) | Button looks identical with and without hover |
| 2 | Focus | `focus-visible` ring present; never `outline: none` without replacement | Tabbing to a button shows no focus indicator |
| 3 | Active/Pressed | Depth effect or color shift on press; `transform: scale(0.95)` or equivalent | Clicking a button feels like clicking dead air |
| 4 | Disabled | Reduced opacity + `cursor: not-allowed`; visually distinct from enabled | Can't tell which buttons are clickable and which aren't |
| 5 | Loading | Skeleton shapes match real content layout; spinner or progress bar during async work | Click submit → blank screen → result appears with no indication anything happened |
| 6 | Empty | Warm message + primary action + visual (not just "No items.") | Empty list shows blank white space |
| 7 | Error | Specific message + includes fix or next step; appears near the source | Generic "Something went wrong" with no context |
| 8 | Success | Confirmation animation, color change, or toast; auto-dismiss after a few seconds | Action succeeds silently — user wonders if it worked |
| 9 | Touch targets | All interactive elements >= 44px hit area; adequate spacing between adjacent targets | Tiny 20px icon button next to another tiny button — misclicks likely |
| 10 | Cursor | `cursor: pointer` on all clickable elements; `cursor: not-allowed` on disabled | Clickable div shows default arrow cursor |

### Mindless Choice Audit

At every decision point (button, link, dropdown, modal choice), ask: is this a mindless click? Can I tell what happens next without thinking? If a click requires thought about whether it's the right choice, flag it as HIGH. Three mindless, unambiguous clicks beat one click that requires thought.

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

## Reporting And Cleanup

After exploring all interactive elements:

1. Stop the video recording:

```bash
agent-browser record stop
```

2. Close the browser:

```bash
agent-browser close
```

3. For Markdown and HTML outputs, follow `references/usage-output.md`.

## Snapshot Diff Technique

Use `agent-browser diff snapshot` to detect what changed after an interaction:

1. Before the action: run `agent-browser snapshot` to establish the session baseline, or save it with `agent-browser snapshot > {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt`
2. After the action: run `agent-browser diff snapshot`, or save it with `agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt`
3. If you need a permanent after-state archive, save it after diffing: `agent-browser snapshot > {OUTPUT_DIR}/snapshots/step-{NNN}-after.txt`

The diff shows exactly which elements appeared, disappeared, or changed text content. This catches state changes that are invisible in screenshots (e.g., aria-label updates, hidden field changes, class toggles).

## Guidance

- **Judge as a user, not a tester.** You are exploring like a real person who has never seen this page before. If something feels off, investigate.
- **Narrate in first person.** "I click the button... nothing happens... did it work?" — not "the interaction lacked feedback." Specific, concrete, naming elements. If you can't name the element, you're generating platitudes.
- **Write findings incrementally.** Append each issue to the report as you discover it. If the session is interrupted, findings are preserved. Never batch all issues for the end.
- **Use the right snapshot command.** `snapshot -i` finds clickable/fillable elements. `agent-browser diff snapshot --baseline` records what changed after an action. `snapshot` (no flag) reads page content when the diff needs more context.
- **Screenshot each step.** Capture the before state, highlighted target, and after state so someone reading the report can follow along visually.
- **Match evidence to issue type.** Every issue needs a screenshot reference. If the issue involves user interaction or state change, reference the before, target, and after screenshots.
- **Check console periodically.** Run `agent-browser console` and `agent-browser errors` every few interactions. Some issues are invisible in the UI but show up as JS errors or failed network requests.
- **Never read the target app's source code.** You are testing as a user. All findings must come from what you observe in the browser.
- **Never delete output files.** Do not `rm` screenshots, videos, or the report mid-session. Work forward, not backward.
- **Pace the exploration.** Use `agent-browser wait 1000` between actions to let the page settle and make the video watchable.
- **Be thorough but use judgment.** Not every element needs the same depth of investigation. Spend more time on complex interactions (forms, modals, multi-state controls) and less on simple static buttons.
- **Skip navigation links.** This is a single-page exploration. Do not follow links that would navigate away from the current URL. Note their existence but do not click them.
- **Only use `agent-browser` directly.** Never use `npx agent-browser` or any other browser automation tool. The direct binary is faster.
