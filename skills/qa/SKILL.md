---
name: qa
description: >-
  Use when asked to QA, test, quality check, bug hunt, find bugs, or verify a
  web page or site with agent-browser, including free exploration, qa.md
  scenario verification, or bootstrapping qa.md from E2E tests.
argument-hint: "[--init] [--converge-stable-passes N] <url> [output-dir]"
arguments:
  - url
  - output-dir
---

# QA

Systematically test a web page as a user, record evidence for every action, and produce Markdown and HTML QA reports. This skill discovers and reports issues only. It does not fix the target app.

## Inputs

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| URL | Yes | - | Target page URL |
| qa.md | No | - | Scenario file with `<scenario>` blocks |
| `--init` | No | false | Generate qa.md from existing E2E tests before verification |
| Output directory | No | `./qa-output/` | Where to save artifacts |
| Convergence threshold | No | `2` stable passes | Set with `--converge-stable-passes N` or natural language such as "stop after 3 stable passes" |

If the user gives a URL, start immediately. Ask only when the URL is missing or the target cannot be opened.

The convergence threshold controls how many consecutive discovery passes may find no new in-scope elements before coverage stops. Default: `stablePassesRequired = 2`. Use a higher value for dynamic pages that reveal controls late; use a lower value only when the user explicitly prefers speed over exhaustiveness.

## Hard Rules

- Use `agent-browser` directly. Never use `npx agent-browser` or another browser automation tool.
- Put `--profile Default` before the `open` subcommand: `agent-browser --profile Default open URL`.
- Test from the browser only. Never inspect the target app source code to decide whether behavior is correct.
- Capture evidence for every action before judging it.
- Use `agent-browser diff snapshot --baseline` as the primary change detector after each action.
- Check `agent-browser console` and `agent-browser errors` after each interaction.
- Write the report incrementally as findings happen. Do not save all reporting for the end.
- Do not delete output artifacts mid-session.
- If an issue is not reproducible, mark it intermittent rather than confirmed.

## Required References

Read these shared references before judging or reporting:

- `references/evidence-and-reporting.md`
- `references/issue-taxonomy.md`
- `references/stopping-criteria.md`
- `references/scope-resolution.md` when the user asks to focus on part of the page

Then read the mode-specific reference:

| Situation | Read |
|-----------|------|
| User passed `--init` | `references/init-qa.md`, then `references/case-verification.md` |
| qa.md exists or was provided | `references/case-verification.md` |
| No qa.md | `references/free-exploration.md` |
| Scenarios leave uncovered interactive elements | `references/free-exploration.md` |

## Scope Detection

Detect scope before executing any mode. Read `references/scope-resolution.md` when the request describes a component, section, panel, modal, dialog, card, form, chart, table, or uses language such as `only`, `focus`, `scope`, `component`, `section`, `panel`, `modal`, `dialog`, `card`, or `form`.

If a scope is resolved, execute the selected mode inside that resolved scope. Scope changes where QA explores; it does not change whether the mode is free exploration, case verification, or init QA.

Use these templates for final artifacts:

- `templates/qa-report-template.md`
- `templates/qa-report-template.html`

## Setup

1. Create output directories:

```bash
mkdir -p {OUTPUT_DIR}/screenshots {OUTPUT_DIR}/diffs {OUTPUT_DIR}/snapshots
```

2. Detect the mode:

- If `--init` is present, generate qa.md from E2E tests, then run case verification.
- Else if qa.md was provided or exists in the current directory, run case verification.
- Else run free exploration.

3. Open the target page:

```bash
agent-browser --profile Default open {URL}
agent-browser wait --load networkidle
```

4. Capture the initial state:

```bash
agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/initial.png
agent-browser snapshot -i
agent-browser console
agent-browser errors
```

5. Count interactive elements by role. Include the distribution in the report metadata, such as `5 buttons, 3 textboxes, 2 selects, 1 checkbox`.

## Execution

Follow the selected reference exactly:

- For free exploration, run the queue and action strategy in `references/free-exploration.md`.
- For qa.md verification, parse and execute scenarios with `references/case-verification.md`.
- For `--init`, generate qa.md with `references/init-qa.md`, then immediately verify the generated scenarios.

When case verification completes, free-explore any interactive elements that were not covered by scenario actions.

## Coverage Applicability

Coverage applies by mode:

- Free exploration: required. Maintain `coverage.json` and run the convergence loop.
- Scoped free exploration: required, but only inside the resolved scope and overlays triggered by that scope.
- Case verification: partial. Execute scenarios first, then run coverage for uncovered elements.
- Scoped case verification: partial, only for uncovered in-scope elements.
- Init QA: generate qa.md, verify generated scenarios, then run coverage for uncovered elements.
- Multi-page: disabled unless the user explicitly requests multi-page or same-origin following.

## Cleanup

After all required interactions are complete:

1. Compute the final 8-dimension health score using `references/evidence-and-reporting.md`.
2. Re-read the report and make summary counts match actual issues.
3. Generate `{OUTPUT_DIR}/report.html` from `{OUTPUT_DIR}/report.md` using `templates/qa-report-template.html`. Every exploration step and issue card must include `<img>` tags referencing the actual before/after screenshots in `screenshots/`. Do not write a step or issue without linking its evidence images.
4. Save `{OUTPUT_DIR}/baseline.json`.
5. Close the browser:

```bash
agent-browser close
```

6. Ask whether the user wants to update qa.md from the exploration result:

- Create qa.md when none existed, using discovered actions and observed expected behavior.
- Update qa.md by appending newly discovered uncovered elements when qa.md existed.
- Skip if the user declines.

## Artifacts

- `{OUTPUT_DIR}/report.md` - Markdown report
- `{OUTPUT_DIR}/report.html` - Apple-style HTML report
- `{OUTPUT_DIR}/baseline.json` - Health score baseline for comparison
- `{OUTPUT_DIR}/screenshots/` - Before/after screenshots and annotated issue screenshots
- `{OUTPUT_DIR}/diffs/` - Snapshot diff text output for each interaction
- `{OUTPUT_DIR}/snapshots/` - Pre-action snapshot baselines used for diffing
