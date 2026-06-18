# Journey Mode

Journey mode is goal-driven exploration for a complete feature flow. Use it when the user names a task that should be experienced end-to-end, such as adding an RSS feed, refreshing it, opening an item, and recovering from invalid input.

The goal is not to click every element on the page. The goal is to find whether a real user can finish the stated task with confidence.

Use the same before screenshot, target screenshot, after screenshot, baseline snapshot, snapshot diff, console, and error evidence model as `references/free-mode.md`.

Journey confidence is judged from screenshots as well as snapshot diffs. Before narrating a journey step, changing goodwill, or marking the journey completed, partial, or blocked, inspect the before, target, and after screenshots for visible feedback, placement, hierarchy, readability, overlay anchoring, clipping, overlap, and whether a first-time user would feel confident continuing.

## Journey Brief

Before interacting, write this brief in `ux-report.md`:

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

Define success criteria as observable product states, not internal implementation details. For an RSS subscription journey, useful success criteria are: the feed is added, the feed appears in the list, refresh feedback is visible, items appear or a clear empty or error state appears, and an item can be opened.

## Journey Planning

1. Run `agent-browser snapshot -i` and inspect the initial annotated screenshot.
2. Identify the most direct user path toward the goal.
3. If there are multiple plausible starts, choose the one a first-time user would pick first.
4. If no credible first action exists, record the journey as blocked and explain what was missing.
5. Keep navigation within the product unless the journey explicitly requires leaving the page.
6. Do not traverse unrelated elements before the journey is complete or blocked.

## Operation Guidance In Journeys

During journey mode, operation guidance is followed only when it is attached to the journey path, the active scoped component, or a surface revealed by the journey. Do not traverse unrelated guidance before the journey is complete or blocked.

If in-scope guidance explains how to complete, recover, cancel, filter, select, or continue the journey, convert it into a journey step with normal evidence. If guidance would navigate away, perform an unsafe action, or leave the stated journey, record it as skipped with the reason.

## Journey Execution

For each journey step:

1. Follow the per-step evidence workflow in `references/free-mode.md`.
2. Inspect the before, target, and after screenshots.
3. Narrate in first person: what I thought I should do, what I clicked or typed, what changed, and whether I felt confident.
4. Judge the step against the Intuition Criteria and Goodwill Reservoir from `SKILL.md`.
5. Continue toward the success criteria, not toward unrelated controls.
6. If the path branches, choose the branch that best matches the user's stated goal.
7. If the journey needs test data and none was provided, use safe realistic data when obvious, such as `https://example.com/feed.xml` for an RSS URL. If realistic data is not obvious, ask the user for it.

## Journey Stopping

Stop journey mode when one of these is true:

- The success criteria are met.
- The flow is blocked and no user-visible recovery path exists.
- The flow becomes partial because a sub-step works but the final state cannot be verified.

After the journey stops, optionally explore only directly related controls that were revealed by the journey.

Do not convert journey mode into full-page traversal unless the user explicitly asks for free exploration too.

## Journey Results

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

## Reporting Handoff

After journey mode stops, follow `references/reporting.md`.

Create both report families:

- UX critique in `{OUTPUT_DIR}/ux-report.md` and `{OUTPUT_DIR}/ux-report.html`.
- Product usage path in `{OUTPUT_DIR}/usage.md` and `{OUTPUT_DIR}/usage.html`.
