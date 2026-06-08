# UX Explore Usage Output Design

## Goal

Extend `ux-explore` free mode so it produces two distinct Markdown artifacts and matching HTML previews:

- `ux-report.md`: UX findings, friction, goodwill score, issues, screenshots, and snapshot diffs.
- `ux-report.html`: rendered UX report for review.
- `usage.md`: product usage documentation discovered during exploration, focused on what users can do and the steps that complete each capability.
- `usage.html`: rendered usage guide for review.

The change keeps `ux-explore` useful for UX issue discovery while also turning free exploration into a lightweight product capability discovery pass.

## Problem

The current free mode report mixes all observations into one `report.md`. That format is good for UX critique, but it is not ideal for documenting product behavior such as:

- Click "Add feed".
- Paste an RSS URL.
- Click "Add".
- The feed appears and can be refreshed.

Those paths are not necessarily UX issues. They are usage knowledge. Keeping them in the UX report makes the report noisy and makes later journey-mode reuse harder.

## Proposed Output Model

When no output directory is provided, derive `ux-name` from the target host, route, journey goal, or requested scope. Resolve `{OUTPUT_DIR}` to `~/.config/supermario/ux/YYYY-MM-DD-<ux-name>/`, using a short lowercase slug such as `vercel-home`, `rss-subscription-journey`, or `settings-panel`.

Free mode writes these files into `{OUTPUT_DIR}`:

```text
ux-report.md
ux-report.html
usage.md
usage.html
explore-video.webm
screenshots/
snapshots/
diffs/
```

`ux-report.md` replaces the current `report.md` role. It remains the main UX assessment artifact.

`usage.md` is a discovered usage guide. It records feature paths in a way a person can read and a future agent can reuse as journey input.

`ux-report.html` and `usage.html` are generated from the Markdown artifacts using skill-owned templates:

```text
skills/ux-explore/templates/ux-report-template.html
skills/ux-explore/templates/usage-template.html
```

The two HTML outputs use separate templates because the UX report and usage guide have different information architecture. The UX report needs issue severity, goodwill, interaction evidence, and three screenshots per step. The usage guide needs capability sections, ordered steps, results, related controls, evidence links, and before/target/after screenshots for the steps that prove the capability.

## Evidence Model

Every interactive step must capture three screenshots, matching the QA skill evidence model:

```text
screenshots/step-001.png
screenshots/step-001-target.png
screenshots/step-001-after.png
```

The per-step sequence is:

```bash
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}.png
agent-browser snapshot > {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt
agent-browser highlight @eN
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-target.png
# perform the interaction
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-after.png
agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt
```

`step-{NNN}.png` shows the state before acting. `step-{NNN}-target.png` shows the highlighted target element. `step-{NNN}-after.png` shows the resulting state. A step without all three screenshots and a snapshot diff is incomplete.

## `ux-report.md`

`ux-report.md` should contain:

- Session metadata.
- Page overview.
- Exploration log.
- Goodwill dashboard.
- UX issues.
- Summary.
- Artifact links.
- A link to `usage.md`.
- A link to `usage.html`.

It should not try to explain every discovered product capability in detail. When a step reveals a coherent feature path, the report can reference the matching section in `usage.md`.

The HTML version should render step evidence with a three-column image grid: Before, Target, After.

## `usage.md`

`usage.md` should be descriptive, not evaluative. It documents what the product lets users do, where the entry point is, what steps complete the capability, and what result is visible.

Recommended shape:

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
```

Each usage entry should include:

- Title: concise capability name.
- Purpose: what user goal it serves.
- Entry point: visible control or page area.
- Steps: concrete user actions in order.
- Result: observable end state.
- Related controls: optional adjacent actions discovered during exploration.
- Evidence: step numbers and artifacts that support the path.
- Evidence screenshots: before, target, and after screenshots for the key step or steps that prove the capability.
- Limitations: optional notes when the path is partial or blocked.

The HTML version should render each usage entry as a readable capability section with the same fields, links back to relevant evidence, and a three-column image grid for Before, Target, and After screenshots. Usage screenshots can show the key proof step for the capability, or multiple proof steps when one screenshot triplet is not enough to understand the flow.

## Free Mode Behavior

Free mode continues to explore the page top-to-bottom, left-to-right and judge interactions against UX criteria. During that same exploration, it should maintain a usage draft:

1. When an interaction reveals a coherent capability, name the capability.
2. Group adjacent steps that belong to the same user goal.
3. Record only observable behavior.
4. Avoid speculating about backend behavior or hidden implementation.
5. If a path is incomplete, include it with `Limitations` rather than presenting it as complete.
6. At cleanup, rewrite `usage.md` into a clean guide ordered by likely user tasks, not raw exploration order.

Free mode should not invent workflows that were not observed. If a control looks related but was skipped, it can appear under `Related controls` only with a clear note that it was not exercised.

## Journey Mode Relationship

Journey mode remains goal-driven. It can use `usage.md` in future runs as source material for journey goals, but this design does not require a parser or automatic replay.

The relationship is:

- Free mode discovers and documents capabilities in `usage.md`.
- Journey mode executes a selected goal end-to-end and reports the outcome in `ux-report.md`.

## Naming Changes

Rename the report artifact from `report.md` to `ux-report.md` in the skill documentation.

Use `usage.md` for discovered product usage. Do not call it `journey-report.md`, because it is not a critique report. Do not call it `journey-results.md`, because that belongs to executing a specific journey.

## Reporting Rules

- Every `usage.md` entry must have evidence references.
- Every `usage.md` entry must include before, target, and after screenshot links for its evidence.
- `usage.md` should avoid UX severity labels.
- UX problems discovered while using a capability still belong in `ux-report.md`.
- `ux-report.md` should include `Artifacts` links to `usage.md`, `usage.html`, `ux-report.html`, screenshots, snapshots, and diffs.
- `usage.md` should include an `Artifacts` link to `usage.html`.
- `ux-report.html` and `usage.html` must be generated during cleanup.
- The generated HTML should be checked for relative links and image references.
- If no coherent capability is discovered, `usage.md` should still exist and state that no complete usage path was observed.

## Testing Strategy

Add structure tests for `skills/ux-explore/SKILL.md` that verify:

- The default output directory resolves to `~/.config/supermario/ux/YYYY-MM-DD-<ux-name>/`.
- The skill references `ux-report.md`.
- The skill references `ux-report.html`.
- The skill references `usage.md`.
- The skill references `usage.html`.
- Free mode is required to maintain a usage draft.
- `usage.md` includes Purpose, Entry point, Steps, Result, Related controls, Evidence, and Limitations.
- `usage.md` includes before, target, and after screenshot links.
- UX steps require before, target, and after screenshots.
- `ux-report.md` links to `usage.md` and `usage.html`.
- The skill references `templates/ux-report-template.html` and `templates/usage-template.html`.
- The template files contain required structural markers, including a three-column step evidence grid for the UX report and a three-column screenshot grid inside usage capability sections.
- The skill body remains English-only.

No runtime runner is added. The behavior is encoded in skill instructions and enforced by structure tests, matching the existing skill-test pattern.

## Out Of Scope

- Automatic replay of `usage.md`.
- Runtime parsing of `usage.md` into journey mode.
- Coverage ledger or convergence changes for `ux-explore`.
- Changes to the QA skill.
