# Evidence And Reporting

Use this reference in every mode. It defines artifact layout, scoring, report structure, and final output.

## Artifact Layout

```text
screenshots/
  initial.png
  step-001.png
  step-001-after.png
  issue-001-result.png
diffs/
  step-001.txt
snapshots/
  step-001-before.txt
report.md
report.html
baseline.json
```

Every action gets:

- A before screenshot.
- A pre-action snapshot baseline.
- An after screenshot.
- An `agent-browser diff snapshot --baseline` artifact.
- Console and error checks.

FAIL results also get an annotated issue screenshot:

```bash
agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/issue-{NNN}-result.png
```

## Evidence Tiers

- Interactive bugs: before screenshot, baseline snapshot, action, after screenshot, snapshot diff, console/errors.
- Static bugs: annotated screenshot, current snapshot if helpful, console/errors if relevant.
- Intermittent bugs: two attempts when practical, with both observations documented.

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

Every exploration step entry must include before/after screenshot links:

```markdown
![Before](screenshots/step-001.png) ![After](screenshots/step-001-after.png)
```

In the HTML report, use `<img>` tags inside the step-photos grid:

```html
<div class="step-photos">
  <figure><img src="screenshots/step-001.png" alt="Before"><figcaption>Before</figcaption></figure>
  <figure><img src="screenshots/step-001-after.png" alt="After"><figcaption>After</figcaption></figure>
</div>
```

A step without screenshot images is incomplete and must not be committed.

Required top-level sections:

- Title: `# QA Report: {URL}`
- Summary: TL;DR with final score, issue counts, and top risks.
- Session Info: URL, date, mode, qa.md source if any, counts, artifact directory.
- Health Score: category table and final score.
- Scenario Results: only in case verification or init mode.
- Exploration Log or Uncovered Elements: step-by-step action evidence.
- Issues: one block per issue.
- Artifacts: links to report.html, baseline.json, screenshots, diffs, and snapshots.

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
- Ensure every step has before/after screenshots and a snapshot diff.
- Ensure every step and issue in the HTML report contains `<img>` tags linking the actual screenshot files. Open `report.html` and verify images render correctly.
- Ensure `baseline.json` matches the final score and issue list.
- Ensure report links are relative to the output directory.
