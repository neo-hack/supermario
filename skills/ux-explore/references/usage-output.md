# Usage Output

This reference owns UX Explore output artifacts: `ux-report.md`, `usage.md`, `ux-report.html`, and `usage.html`.

Write UX findings to `{OUTPUT_DIR}/ux-report.md`. This file is the UX critique artifact: interaction evidence, goodwill score, UX issues, summary, and links to artifacts.

Write discovered product usage to `{OUTPUT_DIR}/usage.md`. This file is descriptive, not evaluative: what users can do, where the entry point is, the steps, the visible result, related controls, and evidence.

The final UX report goes to `{OUTPUT_DIR}/ux-report.md`.

Free mode also writes `{OUTPUT_DIR}/usage.md`:

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

## Usage Drafting

During free mode, maintain a usage draft alongside the UX report.

1. When an interaction reveals a coherent capability, name the capability.
2. Group adjacent steps that belong to the same user goal.
3. Record only observable behavior.
4. Do not speculate about backend behavior or hidden implementation.
5. If a path is incomplete, include it with `Limitations` rather than presenting it as complete.
6. If a related control was skipped, mention it only with a clear note that it was not exercised.
7. At cleanup, rewrite `usage.md` into a clean guide ordered by likely user tasks, not raw exploration order.

If no coherent capability is discovered, still create `usage.md` with this content:

```markdown
# Usage Guide

No complete usage path was observed during this exploration.
```

## HTML Templates

Use `templates/ux-report-template.html` to generate `{OUTPUT_DIR}/ux-report.html` from `ux-report.md`. Use `templates/usage-template.html` to generate `{OUTPUT_DIR}/usage.html` from `usage.md`. The UX report HTML must render every step with Before, Target, and After screenshots. The usage HTML must render each discovered capability as a readable section with purpose, entry point, steps, result, related controls, evidence, limitations, and Before, Target, and After screenshots for the evidence step.

## Reporting Boundary

UX problems discovered while using a capability still belong in `ux-report.md`. `usage.md` should avoid severity labels and recommendations unless they are necessary to explain a limitation. Journey mode can use `usage.md` as source material for future goals, but this skill does not parse or replay `usage.md` automatically.

## UX Report Format

Write the UX report incrementally as you explore. Append each step and each UX issue to `{OUTPUT_DIR}/ux-report.md` as you find them so nothing is lost if the session is interrupted. Do not batch all writing for the end.

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
[... one entry per element explored ...]

## Artifacts
- UX report: ux-report.md
- Usage guide: usage.md
- Full video: explore-video.webm
- Screenshots: screenshots/
- Snapshot diffs: diffs/
```

## Cleanup

1. Re-read `ux-report.md` and update the summary counts to match actual issues found.
2. Re-read `usage.md` and make sure every usage entry has evidence. Each usage entry has before, target, and after screenshot references. If no coherent capability was discovered, confirm the file says no complete usage path was observed.
3. Generate `{OUTPUT_DIR}/ux-report.html` from `{OUTPUT_DIR}/ux-report.md` using `templates/ux-report-template.html`.
4. Generate `{OUTPUT_DIR}/usage.html` from `{OUTPUT_DIR}/usage.md` using `templates/usage-template.html`.
5. Open both HTML files and verify relative links and image references. The UX report HTML must show before, target, and after screenshots for each step. The usage HTML must show before, target, and after screenshots for each documented capability.
6. Tell the user both Markdown and HTML artifacts are ready and summarize: goodwill score with verdict, total issues, breakdown by severity, most critical UX items, and the number of usage entries documented.
