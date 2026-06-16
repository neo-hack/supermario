# Evidence And Reporting

Use this reference in every mode. It defines artifact layout, scoring, report structure, and final output.

## Artifact Layout

```text
screenshots/
  initial.png
  step-001.png
  step-001-target.png
  step-001-after.png
  issue-001-result.png
diffs/
  step-001.txt
snapshots/
  step-001-before.txt
report.md
report.html
baseline.json
coverage.json
```

Every action gets:

- A before screenshot.
- A highlighted target screenshot showing the element that will be operated on.
- A pre-action snapshot baseline.
- An after screenshot.
- An `agent-browser diff snapshot --baseline` artifact.
- Console and error checks saved to `console-step-{NNN}.txt` and `errors-step-{NNN}.txt`.

FAIL results also get an annotated issue screenshot:

```bash
agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/issue-{NNN}-result.png
```

## Evidence Tiers

- Interactive bugs: before screenshot, highlighted target screenshot, baseline snapshot, action, after screenshot, snapshot diff, console/errors.
- Static bugs: annotated screenshot, current snapshot if helpful, console/errors if relevant.
- Intermittent bugs: two attempts when practical, with both observations documented.

## Console Delta

The report must distinguish pre-existing console output from new console output caused by interactions. Save the initial console as `console-initial.txt`, then compare each `console-step-{NNN}.txt` with both the initial log and previous step.

Report new issue candidates for:

- New `[error]` entries.
- Unhandled promise rejections or uncaught exceptions.
- Failed critical network/resource requests.
- React warnings that imply behavioral risk, including `Warning: Encountered two children with the same key`.

If a new console delta is ignored, the step must state why it is benign. Do not summarize the run as "no interaction introduced errors" unless the console delta check is clean.

## 8-Dimension Health Score

Weighted average. Each category starts at 100 and deducts per finding:

| Category | Weight | Scoring |
|----------|--------|---------|
| Console | 15% | 0 errors=100, 1-3=70, 4-10=40, 10+=10 |
| Links | 10% | each broken link -15, min 0 |
| Visual | 10% | critical -25, high -15, medium -8, low -3 |
| Functional | 20% | critical -25, high -15, medium -8, low -3 |
| UX | 15% | critical -25, high -15, medium -8, low -3 |
| Performance | 10% | critical -25, high -15, medium -8, low -3 |
| Content | 5% | critical -25, high -15, medium -8, low -3 |
| Accessibility | 15% | critical -25, high -15, medium -8, low -3 |

Final score = `sum(category_score * weight)`.

Save the baseline as `{OUTPUT_DIR}/baseline.json`:

```json
{
  "date": "YYYY-MM-DD",
  "url": "<target>",
  "healthScore": 0,
  "categoryScores": {
    "console": 0,
    "links": 0,
    "visual": 0,
    "functional": 0,
    "ux": 0,
    "performance": 0,
    "content": 0,
    "accessibility": 0
  },
  "issues": [
    {
      "id": "ISSUE-001",
      "title": "...",
      "severity": "...",
      "category": "..."
    }
  ]
}
```

## Severity

| Level | Definition |
|-------|------------|
| Critical | Blocks a core workflow, causes data loss, or crashes |
| High | Major feature broken with no reasonable workaround |
| Medium | Feature works with noticeable problems or a workaround exists |
| Low | Minor cosmetic, copy, or polish issue |

## Incremental Report Writing

Write `{OUTPUT_DIR}/report.md` as you work. Append each step, PASS/FAIL result, and issue immediately.

Every exploration step entry must include before, target, and after screenshot links:

```markdown
![Before](screenshots/step-001.png) ![Target](screenshots/step-001-target.png) ![After](screenshots/step-001-after.png)
```

In the HTML report, use `<img>` tags inside the step-photos grid:

```html
<div class="step-photos">
  <figure><img src="screenshots/step-001.png" alt="Before"><figcaption>Before</figcaption></figure>
  <figure><img src="screenshots/step-001-target.png" alt="Target"><figcaption>Target</figcaption></figure>
  <figure><img src="screenshots/step-001-after.png" alt="After"><figcaption>After</figcaption></figure>
</div>
```

A step without screenshot images is incomplete and must not be committed.

## Coverage Status

Every final report must include coverage status:

```markdown
## Coverage Status

| Field | Value |
|-------|-------|
| Status | completed / halted |
| Scope | full page / {scopeKey} |
| Raw interactive elements | {count by role} |
| Coverage actions discovered | {count} |
| Coverage actions visited | {count} |
| Skipped | {count} |
| Out of scope | {count} |
| Pending | {count} |
| Stable passes | {count} |
| Stable pass threshold | {count} |
| Halt reason | none / {ISSUE-NNN title} |
```

When coverage halts, include this sentence directly under the Coverage Status table:

```markdown
Halted after ISSUE-001 (P0). 7/19 elements explored. 12 pending elements were not explored because the page entered an unrecoverable state.
```

Do not count pending elements as passed.

For aggressive free exploration and aggressive supplemental exploration, every behavior step must identify its `intent`, `variant`, and `riskLevel` when those fields exist in `coverage.json`. Report these as compact tags, for example: `fault-seeking`, `boundary`, `high risk`. Scenario verification steps should use `checklist` intent and should not be labeled as aggressive unless qa.md explicitly asked for adversarial input.

Do not add a new complex filter system for the first version. Preserve the existing result filters (`All`, `Pass`, `Issues`, `Excluded`, `Inconclusive`) and search behavior. Intent, variant, and risk are displayed as compact tags so the reader can understand why each action was performed.

Required top-level sections:

- Title: `# QA Report: {URL}`
- Summary: TL;DR with final score, issue counts, and top risks.
- Session Info: URL, date, mode, qa.md source if any, raw interactive element counts, artifact directory.
- Health Score: category table and final score.
- Coverage Status: status, scope, ledger counts, stable passes, threshold, and halt reason.
- Behavior Testing: inferred feature models, behavior cases planned, tested, skipped, and untested limitations.
- Scenario Results: only in case verification or init mode.
- Exploration Log or Uncovered Elements: step-by-step action evidence.
- Issues: one block per issue.
- Artifacts: links to report.html, baseline.json, screenshots, diffs, and snapshots.

When qa.md exists, keep `Scenario Results` separate from `Aggressive Supplemental Exploration`. Scenario failures represent checklist expectation drift. Supplemental findings represent uncovered behavior discovered after scenario verification.

Issue blocks must include:

- ID.
- Severity.
- Category.
- Element or page area.
- Evidence paths, including screenshots and diffs.
- Expected behavior.
- Actual behavior.
- Recommendation.

Use `templates/qa-report-template.md` for Markdown shape and `templates/qa-report-template.html` for the final HTML report. The HTML report should put Summary near the top as the TL;DR, use compact tags for session metadata, and link snapshot diff artifacts from each step.

## Snapshot Diff Links

For each action, link the corresponding diff file:

```markdown
[Snapshot diff](diffs/step-001.txt)
```

The preview may use anchors, but real reports should point to the generated text artifact so the user can open the exact accessibility-tree change.

## Final Consistency Check

Before finishing:

- Count issues by severity again and update Summary.
- Ensure every issue has evidence.
- Ensure new console delta has either an issue or an explicit benign explanation.
- Ensure behavior testing lists every planned, tested, or skipped behavior case.
- Ensure every step has before, target, and after screenshots plus a snapshot diff.
- Ensure every step and issue in the HTML report contains `<img>` tags linking the actual screenshot files. Open `report.html` and verify images render correctly.
- Ensure `baseline.json` matches the final score and issue list.
- Ensure report links are relative to the output directory.
