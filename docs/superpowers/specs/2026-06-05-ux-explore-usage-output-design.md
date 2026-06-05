# UX Explore Usage Output Design

## Goal

Extend `ux-explore` free mode so it produces two distinct Markdown artifacts:

- `ux-report.md`: UX findings, friction, goodwill score, issues, screenshots, and snapshot diffs.
- `usage.md`: product usage documentation discovered during exploration, focused on what users can do and the steps that complete each capability.

The change keeps `ux-explore` useful for UX issue discovery while also turning free exploration into a lightweight product capability discovery pass.

## Problem

The current free mode report mixes all observations into one `report.md`. That format is good for UX critique, but it is not ideal for documenting product behavior such as:

- Click "Add feed".
- Paste an RSS URL.
- Click "Add".
- The feed appears and can be refreshed.

Those paths are not necessarily UX issues. They are usage knowledge. Keeping them in the UX report makes the report noisy and makes later journey-mode reuse harder.

## Proposed Output Model

Free mode writes both files into `{OUTPUT_DIR}`:

```text
ux-report.md
usage.md
explore-video.webm
screenshots/
snapshots/
diffs/
```

`ux-report.md` replaces the current `report.md` role. It remains the main UX assessment artifact.

`usage.md` is a discovered usage guide. It records feature paths in a way a person can read and a future agent can reuse as journey input.

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

It should not try to explain every discovered product capability in detail. When a step reveals a coherent feature path, the report can reference the matching section in `usage.md`.

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
```

Each usage entry should include:

- Title: concise capability name.
- Purpose: what user goal it serves.
- Entry point: visible control or page area.
- Steps: concrete user actions in order.
- Result: observable end state.
- Related controls: optional adjacent actions discovered during exploration.
- Evidence: step numbers and artifacts that support the path.
- Limitations: optional notes when the path is partial or blocked.

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
- `usage.md` should avoid UX severity labels.
- UX problems discovered while using a capability still belong in `ux-report.md`.
- `ux-report.md` should include an `Artifacts` link to `usage.md`.
- If no coherent capability is discovered, `usage.md` should still exist and state that no complete usage path was observed.

## Testing Strategy

Add structure tests for `skills/ux-explore/SKILL.md` that verify:

- The skill references `ux-report.md`.
- The skill references `usage.md`.
- Free mode is required to maintain a usage draft.
- `usage.md` includes Purpose, Entry point, Steps, Result, Related controls, Evidence, and Limitations.
- `ux-report.md` links to `usage.md`.
- The skill body remains English-only.

No runtime runner is added. The behavior is encoded in skill instructions and enforced by structure tests, matching the existing skill-test pattern.

## Out Of Scope

- Automatic replay of `usage.md`.
- A separate `usage.html` renderer.
- Runtime parsing of `usage.md` into journey mode.
- Coverage ledger or convergence changes for `ux-explore`.
- Changes to the QA skill.
