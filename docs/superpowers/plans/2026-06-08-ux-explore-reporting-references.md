# UX Explore Reporting References Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the UX Explore skill so execution modes, observation style, and reporting artifacts have clear reference ownership.

**Architecture:** Keep `skills/ux-explore/SKILL.md` as the route, setup, and shared UX judgment entrypoint. Move goal-driven journey behavior into `references/journey-mode.md`, rename the output contract reference to `references/reporting.md`, and keep `references/free-mode.md` focused on page traversal and per-step evidence.

**Tech Stack:** Markdown skill files, Node.js built-in test runner, CommonJS test helpers, `pnpm test`, `git mv`.

---

## File Structure

- Modify: `tests/ux-explore/structure.test.js`
  - Owns structural assertions for UX Explore skill routing, references, templates, and English-only content.
- Modify: `skills/ux-explore/SKILL.md`
  - Owns user inputs, mode selection, output directory setup, browser setup, shared UX judgment models, observation style, and reference routing.
- Modify: `skills/ux-explore/references/free-mode.md`
  - Owns page-level traversal, per-step evidence capture, action strategy, skip rules, stopping condition, and reporting handoff.
- Rename: `skills/ux-explore/references/usage-output.md` to `skills/ux-explore/references/reporting.md`
  - Owns all UX Explore output artifacts, UX report format, usage guide format, mode-specific usage rules, boundary rules, HTML generation, and cleanup checks.
- Create: `skills/ux-explore/references/journey-mode.md`
  - Owns goal-driven journey flow behavior, journey brief, journey planning, journey execution, stopping rules, journey results, and reporting handoff.
- Modify: `docs/superpowers/specs/2026-06-05-ux-explore-usage-output-design.md`
  - Historical design doc should point at the renamed reporting reference when it mentions the active file name.
- Modify: `docs/superpowers/plans/2026-06-05-ux-explore-usage-output.md`
  - Historical implementation plan should point at the renamed reporting reference when it mentions the active file name.

## Implementation Tasks

### Task 1: Add Structure Tests For The Target Reference Split

**Files:**
- Modify: `tests/ux-explore/structure.test.js`

- [ ] **Step 1: Replace usage-output reads with reporting and journey references**

In `tests/ux-explore/structure.test.js`, keep the helper functions and update the affected tests so they read `reporting.md` and `journey-mode.md`.

Replace the current `ux-explore supports journey mode for complete feature flows` test with:

```js
test('ux-explore routes execution modes and reporting to references', () => {
  const skill = readSkill();

  assert.match(skill, /\[--journey "<goal>"\]/);
  assert.match(skill, /Mode Selection/);
  assert.match(skill, /Free mode/);
  assert.match(skill, /Journey mode/);
  assert.match(skill, /For free mode, follow `references\/free-mode\.md`/);
  assert.match(skill, /For journey mode, follow `references\/journey-mode\.md`/);
  assert.match(skill, /For all Markdown and HTML artifacts, follow `references\/reporting\.md`/);
  assert.doesNotMatch(skill, /references\/usage-output\.md/);
  assert.doesNotMatch(skill, /## Usage Guide Format/);
  assert.doesNotMatch(skill, /### Per-Element Workflow/);
});
```

Replace the current `ux-explore writes separate UX report and usage guide markdown` test with:

```js
test('ux-explore writes separate UX report and usage guide markdown', () => {
  const skill = readSkill();
  const reporting = readReference('reporting.md');

  assert.match(skill, /~\/\.config\/supermario\/ux\/YYYY-MM-DD-<ux-name>\//);
  assert.match(skill, /derive `ux-name` from the target host, route, journey goal, or requested scope/);
  assert.match(skill, /Resolve `\{OUTPUT_DIR\}` to `~\/\.config\/supermario\/ux\/YYYY-MM-DD-<ux-name>\/`/);
  assert.match(reporting, /ux-report\.md/);
  assert.match(reporting, /usage\.md/);
  assert.match(reporting, /The final UX report goes to `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(reporting, /Both free mode and journey mode write `\{OUTPUT_DIR\}\/usage\.md`/);
  assert.match(reporting, /Usage Guide Format/);
  assert.match(reporting, /Purpose: Subscribe to a new RSS source\./);
  assert.match(reporting, /Entry point: "Add feed" button in the sidebar\./);
  assert.match(reporting, /Steps:/);
  assert.match(reporting, /Result:/);
  assert.match(reporting, /Related controls:/);
  assert.match(reporting, /Evidence:/);
  assert.match(reporting, /Evidence screenshots:/);
  assert.match(reporting, /\!\[Before\]\(screenshots\/step-003\.png\)/);
  assert.match(reporting, /\!\[Target\]\(screenshots\/step-003-target\.png\)/);
  assert.match(reporting, /\!\[After\]\(screenshots\/step-003-after\.png\)/);
  assert.match(reporting, /Limitations:/);
  assert.match(reporting, /UX report: ux-report\.md/);
  assert.match(reporting, /Usage guide: usage\.md/);
  assert.doesNotMatch(skill, /The final report goes to `\{OUTPUT_DIR\}\/report\.md`/);
});
```

Replace the current `ux-explore free mode maintains a usage draft from observed capabilities` test with:

```js
test('ux-explore free mode maintains a usage draft from observed capabilities', () => {
  const reporting = readReference('reporting.md');

  assert.match(reporting, /maintain a usage draft/i);
  assert.match(reporting, /coherent capability/i);
  assert.match(reporting, /Group adjacent steps that belong to the same user goal/);
  assert.match(reporting, /Record only observable behavior/);
  assert.match(reporting, /Do not speculate about backend behavior or hidden implementation/);
  assert.match(reporting, /If a path is incomplete, include it with `Limitations`/);
  assert.match(reporting, /not exercised/);
  assert.match(reporting, /If no coherent capability is discovered/);
});
```

Replace the current `ux-explore provides HTML templates for UX report and usage guide` test with:

```js
test('ux-explore provides HTML templates for UX report and usage guide', () => {
  const skill = readSkill();
  const reporting = readReference('reporting.md');
  const uxTemplate = readTemplate('templates/ux-report-template.html');
  const usageTemplate = readTemplate('templates/usage-template.html');

  assert.match(reporting, /templates\/ux-report-template\.html/);
  assert.match(reporting, /templates\/usage-template\.html/);
  assert.match(reporting, /ux-report\.html/);
  assert.match(reporting, /usage\.html/);
  assert.match(skill, /references\/reporting\.md/);

  assert.match(uxTemplate, /<title>UX Explore Report - \{DOMAIN\}<\/title>/);
  assert.match(uxTemplate, /<h2>Exploration Log<\/h2>/);
  assert.match(uxTemplate, /class="step-photos"/);
  assert.match(uxTemplate, /grid-template-columns: repeat\(3, 1fr\)/);
  assert.match(uxTemplate, /screenshots\/step-\{NNN\}\.png[^]*<figcaption>Before<\/figcaption>/);
  assert.match(uxTemplate, /screenshots\/step-\{NNN\}-target\.png[^]*<figcaption>Target<\/figcaption>/);
  assert.match(uxTemplate, /screenshots\/step-\{NNN\}-after\.png[^]*<figcaption>After<\/figcaption>/);
  assert.match(uxTemplate, /href="usage\.html"/);

  assert.match(usageTemplate, /<title>Usage Guide - \{DOMAIN\}<\/title>/);
  assert.match(usageTemplate, /<h1>Usage Guide<\/h1>/);
  assert.match(usageTemplate, /class="capability"/);
  assert.match(usageTemplate, /Purpose/);
  assert.match(usageTemplate, /Entry point/);
  assert.match(usageTemplate, /Related controls/);
  assert.match(usageTemplate, /Evidence/);
  assert.match(usageTemplate, /Limitations/);
  assert.match(usageTemplate, /class="usage-photos"/);
  assert.match(usageTemplate, /grid-template-columns: repeat\(3, 1fr\)/);
  assert.match(usageTemplate, /screenshots\/step-\{NNN\}\.png[^]*<figcaption>Before<\/figcaption>/);
  assert.match(usageTemplate, /screenshots\/step-\{NNN\}-target\.png[^]*<figcaption>Target<\/figcaption>/);
  assert.match(usageTemplate, /screenshots\/step-\{NNN\}-after\.png[^]*<figcaption>After<\/figcaption>/);
});
```

Replace the current `ux-explore cleanup generates and verifies markdown and html artifacts` test with:

```js
test('ux-explore cleanup generates and verifies markdown and html artifacts', () => {
  const reporting = readReference('reporting.md');

  assert.match(reporting, /Generate `\{OUTPUT_DIR\}\/ux-report\.html` from `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(reporting, /Generate `\{OUTPUT_DIR\}\/usage\.html` from `\{OUTPUT_DIR\}\/usage\.md`/);
  assert.match(reporting, /Re-read `ux-report\.md` and update the summary counts/);
  assert.match(reporting, /Re-read `usage\.md` and make sure every usage entry has evidence/);
  assert.match(reporting, /usage entry has before, target, and after screenshot references/);
  assert.match(reporting, /Open both HTML files and verify relative links and image references/);
  assert.match(reporting, /Tell the user both Markdown and HTML artifacts are ready/);
  assert.match(reporting, /Journey mode can use `usage\.md` as source material/);
  assert.match(reporting, /does not parse or replay `usage\.md` automatically/);
});
```

Replace the current `ux-explore routes free mode and usage output to references` test with:

```js
test('ux-explore observation style is shared by execution modes', () => {
  const skill = readSkill();

  assert.match(skill, /## Observation Style/);
  assert.match(skill, /Explore in first person/);
  assert.match(skill, /applies to both free mode and journey mode/i);
  assert.doesNotMatch(skill, /## Narration Mode/);
});
```

Add this new test after the routing test:

```js
test('ux-explore journey mode reference owns goal-driven flow', () => {
  const journeyMode = readReference('journey-mode.md');

  assert.match(journeyMode, /^# Journey Mode/m);
  assert.match(journeyMode, /Journey Brief/);
  assert.match(journeyMode, /Journey Planning/);
  assert.match(journeyMode, /Journey Execution/);
  assert.match(journeyMode, /Journey Stopping/);
  assert.match(journeyMode, /Journey Results/);
  assert.match(journeyMode, /complete feature flow/);
  assert.match(journeyMode, /Do not convert journey mode into full-page traversal unless the user explicitly asks/i);
  assert.match(journeyMode, /references\/free-mode\.md/);
  assert.match(journeyMode, /references\/reporting\.md/);
});
```

Add this new test after the usage draft test:

```js
test('ux-explore reporting reference owns all output artifact contracts', () => {
  const reporting = readReference('reporting.md');

  assert.match(reporting, /^# Reporting/m);
  assert.match(reporting, /\{OUTPUT_DIR\}\/ux-report\.md/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/ux-report\.html/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/usage\.md/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/usage\.html/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/explore-video\.webm/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/screenshots\//);
  assert.match(reporting, /\{OUTPUT_DIR\}\/snapshots\//);
  assert.match(reporting, /\{OUTPUT_DIR\}\/diffs\//);
  assert.match(reporting, /## UX Report Format/);
  assert.match(reporting, /## Usage Guide Format/);
  assert.match(reporting, /## Mode-Specific Usage Rules/);
  assert.match(reporting, /## Boundary Rules/);
  assert.match(reporting, /## HTML Generation/);
  assert.match(reporting, /## Cleanup Checklist/);
  assert.match(reporting, /Before writing or generating any output artifact, read this reference end-to-end/);
});
```

- [ ] **Step 2: Run the UX Explore structure tests and verify they fail**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because `skills/ux-explore/references/reporting.md` and `skills/ux-explore/references/journey-mode.md` do not exist yet, and `SKILL.md` still routes to `references/usage-output.md`.

- [ ] **Step 3: Commit the failing test changes**

Run:

```bash
git add tests/ux-explore/structure.test.js
git commit -m "test(ux-explore): expect reporting reference split"
```

Expected: commit succeeds with only the test file staged.

### Task 2: Rename Usage Output Reference To Reporting

**Files:**
- Rename: `skills/ux-explore/references/usage-output.md` to `skills/ux-explore/references/reporting.md`
- Modify: `skills/ux-explore/references/reporting.md`

- [ ] **Step 1: Rename the reference file**

Run:

```bash
git mv skills/ux-explore/references/usage-output.md skills/ux-explore/references/reporting.md
```

Expected: `git status --short` shows `R  skills/ux-explore/references/usage-output.md -> skills/ux-explore/references/reporting.md`.

- [ ] **Step 2: Replace reporting reference content**

Replace the complete contents of `skills/ux-explore/references/reporting.md` with:

````markdown
# Reporting

This reference owns every UX Explore output artifact for both free mode and journey mode.

Before writing or generating any output artifact, read this reference end-to-end. Before writing `ux-report.md`, read the UX Report Format section. Before writing `usage.md`, read the Usage Guide Format, Mode-Specific Usage Rules, and Boundary Rules sections. Before generating HTML, read the HTML Generation section and the matching template.

## Artifact List

Create or verify these artifacts before finishing:

- `{OUTPUT_DIR}/ux-report.md`
- `{OUTPUT_DIR}/ux-report.html`
- `{OUTPUT_DIR}/usage.md`
- `{OUTPUT_DIR}/usage.html`
- `{OUTPUT_DIR}/explore-video.webm`
- `{OUTPUT_DIR}/screenshots/`
- `{OUTPUT_DIR}/snapshots/`
- `{OUTPUT_DIR}/diffs/`

Write UX findings to `{OUTPUT_DIR}/ux-report.md`. This file is the UX critique artifact: interaction evidence, goodwill score, UX issues, summary, and links to artifacts.

Write discovered product usage to `{OUTPUT_DIR}/usage.md`. This file is descriptive, not evaluative: what users can do, where the entry point is, the steps, the visible result, related controls, and evidence.

The final UX report goes to `{OUTPUT_DIR}/ux-report.md`.

Both free mode and journey mode write `{OUTPUT_DIR}/usage.md`.

## UX Report Format

Write the UX report incrementally as you explore. Append each step and each UX issue to `{OUTPUT_DIR}/ux-report.md` as you find them so nothing is lost if the session is interrupted. Do not batch all writing for the end.

```markdown
# UX Explore Report: {URL}

## Session Info
| Field | Value |
|-------|-------|
| URL | {url} |
| Date | {date} |
| Mode | free / journey |
| Interactive elements found | {count} |
| Elements explored | {count} |
| Issues found | {count} |
| Video | explore-video.webm |

## Page Or Journey Overview
[1-2 sentence description of the page, journey goal, or observed flow]
[Element distribution when available: N buttons, M textboxes, L selects, ...]
![Initial state](screenshots/initial.png)

## Exploration Or Journey Log
[... one entry per element or journey step explored ...]

## Goodwill
[score, step deltas, and final verdict]

## UX Issues
[... one entry per UX-NNN issue ...]

## Summary
- Total issues: {count}
- High: {count}
- Medium: {count}
- Low: {count}
- Most critical issue: {UX-NNN or none}

## Artifacts
- UX report: ux-report.md
- Usage guide: usage.md
- UX report HTML: ux-report.html
- Usage guide HTML: usage.html
- Full video: explore-video.webm
- Screenshots: screenshots/
- Snapshots: snapshots/
- Snapshot diffs: diffs/
```

## Usage Guide Format

`usage.md` describes observed product behavior. It answers what a user can do, what they click or type, and what visible result follows.

```markdown
# Usage Guide

## Add an RSS feed

Purpose: Subscribe to a new RSS source.

Entry point: "Add feed" button in the sidebar.

Steps:
1. Click "Add feed".
2. Paste an RSS URL into the feed URL field.
3. Click "Add".
4. Confirm the feed appears in the feed list.

Result:
The app subscribes to the feed and starts fetching items.

Related controls:
- Refresh feed
- Open item
- Remove feed

Evidence:
- steps 003-006

Evidence screenshots:
![Before](screenshots/step-003.png) ![Target](screenshots/step-003-target.png) ![After](screenshots/step-003-after.png)

Limitations:
- None observed.
```

Every usage entry must include: title, Purpose, Entry point, Steps, Result, Related controls, Evidence, Evidence screenshots, and Limitations.

## Mode-Specific Usage Rules

During free mode, maintain a usage draft alongside the UX report.

1. When an interaction reveals a coherent capability, name the capability.
2. Group adjacent steps that belong to the same user goal.
3. Record only observable behavior.
4. Do not speculate about backend behavior or hidden implementation.
5. If a path is incomplete, include it with `Limitations` rather than presenting it as complete.
6. If a related control was skipped, mention it only with a clear note that it was not exercised.
7. At cleanup, rewrite `usage.md` into a clean guide ordered by likely user tasks, not raw exploration order.

For journey mode, write one primary usage entry for the journey goal.

1. If the journey completed, document the successful path.
2. If the journey was partial or blocked, document the observed path and explain the gap in `Limitations`.
3. Keep the entry focused on the user's stated goal.
4. Do not turn UX problems into usage guide recommendations.

If no coherent capability is discovered, still create `usage.md` with this content:

```markdown
# Usage Guide

No complete usage path was observed during this exploration.
```

## Boundary Rules

UX problems discovered while using a capability belong in `ux-report.md`.

Product behavior paths belong in `usage.md`.

`usage.md` avoids severity labels.

`usage.md` avoids recommendations unless they are necessary to explain a limitation.

Both free mode and journey mode produce both UX report and usage guide artifacts.

Journey mode can use `usage.md` as source material for future goals, but this skill does not parse or replay `usage.md` automatically.

## HTML Generation

Use `templates/ux-report-template.html` to generate `{OUTPUT_DIR}/ux-report.html` from `ux-report.md`.

Use `templates/usage-template.html` to generate `{OUTPUT_DIR}/usage.html` from `usage.md`.

The UX report HTML must render every step with Before, Target, and After screenshots.

The usage HTML must render each discovered capability as a readable section with purpose, entry point, steps, result, related controls, evidence, limitations, and Before, Target, and After screenshots for the evidence step.

## Cleanup Checklist

1. Re-read `ux-report.md` and update the summary counts to match actual issues found.
2. Re-read `usage.md` and make sure every usage entry has evidence. Each usage entry has before, target, and after screenshot references. If no coherent capability was discovered, confirm the file says no complete usage path was observed.
3. Generate `{OUTPUT_DIR}/ux-report.html` from `{OUTPUT_DIR}/ux-report.md` using `templates/ux-report-template.html`.
4. Generate `{OUTPUT_DIR}/usage.html` from `{OUTPUT_DIR}/usage.md` using `templates/usage-template.html`.
5. Open both HTML files and verify relative links and image references. The UX report HTML must show before, target, and after screenshots for each step. The usage HTML must show before, target, and after screenshots for each documented capability.
6. Tell the user both Markdown and HTML artifacts are ready and summarize: goodwill score with verdict, total issues, breakdown by severity, most critical UX items, and the number of usage entries documented.
````

- [ ] **Step 3: Run the UX Explore structure tests and verify partial progress**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because `journey-mode.md` does not exist and `SKILL.md` still routes to `references/usage-output.md`. Reporting-specific assertions should pass.

- [ ] **Step 4: Commit the reporting reference rename**

Run:

```bash
git add skills/ux-explore/references/reporting.md
git add -u skills/ux-explore/references/usage-output.md
git commit -m "docs(ux-explore): rename reporting reference"
```

Expected: commit succeeds and records the rename.

### Task 3: Add Journey Mode Reference

**Files:**
- Create: `skills/ux-explore/references/journey-mode.md`

- [ ] **Step 1: Create the journey mode reference**

Create `skills/ux-explore/references/journey-mode.md` with:

````markdown
# Journey Mode

Journey mode is goal-driven exploration for a complete feature flow. Use it when the user names a task that should be experienced end-to-end, such as adding an RSS feed, refreshing it, opening an item, and recovering from invalid input.

The goal is not to click every element on the page. The goal is to find whether a real user can finish the stated task with confidence.

Use the same before screenshot, target screenshot, after screenshot, baseline snapshot, snapshot diff, console, and error evidence model as `references/free-mode.md`.

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

## Journey Execution

For each journey step:

1. Follow the per-step evidence workflow in `references/free-mode.md`.
2. Narrate in first person: what I thought I should do, what I clicked or typed, what changed, and whether I felt confident.
3. Judge the step against the Intuition Criteria and Goodwill Reservoir from `SKILL.md`.
4. Continue toward the success criteria, not toward unrelated controls.
5. If the path branches, choose the branch that best matches the user's stated goal.
6. If the journey needs test data and none was provided, use safe realistic data when obvious, such as `https://example.com/feed.xml` for an RSS URL. If realistic data is not obvious, ask the user for it.

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
````

- [ ] **Step 2: Run the UX Explore structure tests and verify remaining failures**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because `SKILL.md` still routes to `references/usage-output.md` and still contains `## Narration Mode`. Journey-reference assertions should pass.

- [ ] **Step 3: Commit the journey reference**

Run:

```bash
git add skills/ux-explore/references/journey-mode.md
git commit -m "docs(ux-explore): add journey mode reference"
```

Expected: commit succeeds with the new reference file.

### Task 4: Route SKILL.md To The New References

**Files:**
- Modify: `skills/ux-explore/SKILL.md`
- Modify: `skills/ux-explore/references/free-mode.md`

- [ ] **Step 1: Update required reference routing**

In `skills/ux-explore/SKILL.md`, replace the entire `## Required References` section with:

```markdown
## Required References

Read the references for the selected work:

- For free mode, follow `references/free-mode.md`.
- For journey mode, follow `references/journey-mode.md`.
- For all Markdown and HTML artifacts, follow `references/reporting.md`.
```

- [ ] **Step 2: Replace inline Journey Mode details with a route**

In `skills/ux-explore/SKILL.md`, replace everything from `## Journey Mode` through the end of the `## Journey Results` section with:

```markdown
## Journey Mode

For journey mode, follow `references/journey-mode.md`.
```

Keep the following `## Free Mode` section in place.

- [ ] **Step 3: Rename narration to observation style**

In `skills/ux-explore/SKILL.md`, replace the heading and first paragraph of `## Narration Mode` with:

```markdown
## Observation Style

This style applies to both free mode and journey mode. Explore in first person, as a real user who has never seen this page before. Name the specific element, its position, its visual weight. If you can't name it specifically, you're generating platitudes; look harder.
```

Keep the example and remaining guidance under the renamed heading.

- [ ] **Step 4: Update reporting and cleanup reference names**

Search inside `skills/ux-explore/SKILL.md` and replace every remaining `references/usage-output.md` with `references/reporting.md`.

Run:

```bash
rg -n "usage-output\.md|Narration Mode|Journey Brief|Journey Planning|Journey Execution|Journey Stopping|Journey Results" skills/ux-explore/SKILL.md
```

Expected: exit code 1 with no matches.

- [ ] **Step 5: Add the free-mode reporting handoff**

Append this section to the end of `skills/ux-explore/references/free-mode.md`:

```markdown
## Reporting Handoff

After every interactive element has been visited or skipped with a documented reason, follow `references/reporting.md`.

Create both report families:

- UX critique in `{OUTPUT_DIR}/ux-report.md` and `{OUTPUT_DIR}/ux-report.html`.
- Product usage paths in `{OUTPUT_DIR}/usage.md` and `{OUTPUT_DIR}/usage.html`.
```

- [ ] **Step 6: Run the UX Explore structure tests and verify they pass**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS. All UX Explore structure tests pass.

- [ ] **Step 7: Commit the skill routing changes**

Run:

```bash
git add skills/ux-explore/SKILL.md skills/ux-explore/references/free-mode.md
git commit -m "docs(ux-explore): route modes through references"
```

Expected: commit succeeds with only skill and free-mode reference changes.

### Task 5: Update Related Design And Plan References

**Files:**
- Modify: `docs/superpowers/specs/2026-06-05-ux-explore-usage-output-design.md`
- Modify: `docs/superpowers/plans/2026-06-05-ux-explore-usage-output.md`

- [ ] **Step 1: Replace active file-name references in the usage output design doc**

In `docs/superpowers/specs/2026-06-05-ux-explore-usage-output-design.md`, replace references to `skills/ux-explore/references/usage-output.md` with `skills/ux-explore/references/reporting.md`.

If the document has prose that says the active reference file is named `usage-output.md`, rewrite that sentence to say the active reporting contract now lives in `reporting.md`.

- [ ] **Step 2: Replace active file-name references in the usage output implementation plan**

In `docs/superpowers/plans/2026-06-05-ux-explore-usage-output.md`, replace references to `skills/ux-explore/references/usage-output.md` with `skills/ux-explore/references/reporting.md`.

If a command creates or edits `usage-output.md`, update it to create or edit `reporting.md`.

- [ ] **Step 3: Verify no active UX Explore files point at the old reference**

Run:

```bash
rg -n "usage-output\.md|Narration Mode" skills/ux-explore tests/ux-explore docs/superpowers/specs/2026-06-08-ux-explore-reporting-references-design.md docs/superpowers/plans/2026-06-08-ux-explore-reporting-references.md
```

Expected: exit code 1 with no matches.

Run this separate historical-doc check:

```bash
rg -n "usage-output\.md|Narration Mode" docs/superpowers/specs/2026-06-05-ux-explore-usage-output-design.md docs/superpowers/plans/2026-06-05-ux-explore-usage-output.md
```

Expected: exit code 1 with no matches.

- [ ] **Step 4: Run the UX Explore structure tests**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS. The doc reference changes should not affect test behavior.

- [ ] **Step 5: Commit the doc reference cleanup**

Run:

```bash
git add docs/superpowers/specs/2026-06-05-ux-explore-usage-output-design.md docs/superpowers/plans/2026-06-05-ux-explore-usage-output.md
git commit -m "docs(ux-explore): update reporting reference docs"
```

Expected: commit succeeds with only the historical design and plan docs staged.

### Task 6: Final Validation

**Files:**
- Verify: `skills/ux-explore/SKILL.md`
- Verify: `skills/ux-explore/references/free-mode.md`
- Verify: `skills/ux-explore/references/journey-mode.md`
- Verify: `skills/ux-explore/references/reporting.md`
- Verify: `tests/ux-explore/structure.test.js`
- Verify: `docs/superpowers/specs/2026-06-08-ux-explore-reporting-references-design.md`
- Verify: `docs/superpowers/plans/2026-06-08-ux-explore-reporting-references.md`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
pnpm test
```

Expected: PASS. All tests pass.

- [ ] **Step 2: Run whitespace validation**

Run:

```bash
git diff --check
```

Expected: exit code 0 with no output.

- [ ] **Step 3: Run English-only validation for active UX Explore files**

Run:

```bash
rg -n "[\p{Han}]" skills/ux-explore tests/ux-explore docs/superpowers/specs/2026-06-08-ux-explore-reporting-references-design.md docs/superpowers/plans/2026-06-08-ux-explore-reporting-references.md
```

Expected: exit code 1 with no matches.

- [ ] **Step 4: Verify the old names are gone from active UX Explore surfaces**

Run:

```bash
rg -n "usage-output\.md|Narration Mode" skills/ux-explore tests/ux-explore docs/superpowers/specs/2026-06-08-ux-explore-reporting-references-design.md docs/superpowers/plans/2026-06-08-ux-explore-reporting-references.md
```

Expected: exit code 1 with no matches.

- [ ] **Step 5: Inspect the final file list**

Run:

```bash
find skills/ux-explore -maxdepth 3 -type f -print | sort
```

Expected output includes:

```text
skills/ux-explore/SKILL.md
skills/ux-explore/references/free-mode.md
skills/ux-explore/references/journey-mode.md
skills/ux-explore/references/reporting.md
skills/ux-explore/templates/usage-template.html
skills/ux-explore/templates/ux-report-template.html
```

Expected output does not include:

```text
skills/ux-explore/references/usage-output.md
```

- [ ] **Step 6: Inspect git status**

Run:

```bash
git status --short --branch
```

Expected: branch is clean after the task commits.

## Self-Review Checklist

- [ ] `SKILL.md` still owns input parsing, mode selection, setup, shared UX judgment models, and reference routing.
- [ ] `SKILL.md` routes free mode to `references/free-mode.md`.
- [ ] `SKILL.md` routes journey mode to `references/journey-mode.md`.
- [ ] `SKILL.md` routes all Markdown and HTML artifacts to `references/reporting.md`.
- [ ] `SKILL.md` uses `Observation Style` and does not use `Narration Mode`.
- [ ] `free-mode.md` owns page traversal and hands off to `reporting.md`.
- [ ] `journey-mode.md` owns complete feature flow execution and does not become full-page traversal unless requested.
- [ ] `reporting.md` owns `ux-report.md`, `ux-report.html`, `usage.md`, and `usage.html`.
- [ ] Both free mode and journey mode produce both UX report and usage guide artifacts.
- [ ] Structure tests cover routing, journey reference ownership, reporting reference ownership, and observation style naming.
- [ ] Full validation passes with `pnpm test`, `git diff --check`, and English-only scans.
