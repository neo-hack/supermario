# UX Explore Reporting References Design

## Problem

`ux-explore` now has three concerns that are easy to confuse:

- Execution mode selection: free mode or journey mode.
- Observation style: first-person, concrete user narration.
- Output artifacts: UX critique reports and usage guides in Markdown and HTML.

The current reference split improved free mode, but `Journey Mode` still carries detailed behavior in `SKILL.md`, and `Narration Mode` reads like a third execution mode even though it is only a writing style. `references/usage-output.md` is also misnamed because it owns both `usage` and `ux-report` artifacts.

## Goals

- Keep `SKILL.md` as the route and mode-selection entrypoint.
- Move journey execution details into `references/journey-mode.md`.
- Rename `references/usage-output.md` to `references/reporting.md`.
- Make `Observation Style` the name for first-person narration guidance.
- Keep free mode and journey mode mutually exclusive as primary execution modes.
- Make both modes produce both artifact families:
  - UX report: `ux-report.md` and `ux-report.html`.
  - Usage guide: `usage.md` and `usage.html`.

## Non-Goals

- Do not change the agent-browser command model.
- Do not add runtime Markdown rendering scripts.
- Do not change HTML template filenames.
- Do not change QA skill behavior.
- Do not add automatic replay or parsing of `usage.md`.

## Proposed Structure

```text
skills/ux-explore/
  SKILL.md
  references/
    free-mode.md
    journey-mode.md
    reporting.md
  templates/
    ux-report-template.html
    usage-template.html
```

## `SKILL.md`

`SKILL.md` should contain:

- Inputs and mode detection.
- Output directory resolution.
- Initial browser setup.
- Shared UX judgment models:
  - How Users Actually Behave.
  - Trunk Test.
  - Goodwill Reservoir.
  - Interaction States Checklist.
  - Intuition Criteria.
  - Issue Severity.
- Reference routing.

It should not contain detailed free mode traversal, journey execution, usage guide format, UX report format, HTML generation rules, or cleanup artifact validation.

Required reference routing:

```markdown
## Required References

Read the references for the selected work:

- For free mode, follow `references/free-mode.md`.
- For journey mode, follow `references/journey-mode.md`.
- For all Markdown and HTML artifacts, follow `references/reporting.md`.
```

`Narration Mode` should be renamed to `Observation Style`. This keeps it visibly separate from execution modes. Observation style applies to both free mode and journey mode.

## `references/free-mode.md`

This file owns page-level traversal.

It should contain:

- Free mode purpose.
- Per-step evidence workflow.
- Before, target, and after screenshot naming.
- Snapshot baseline and diff commands.
- Action strategy by ARIA role.
- Skip rules.
- Free mode stopping condition.
- Reporting handoff to `references/reporting.md`.

It should not define report formats or cleanup rules beyond the handoff.

## `references/journey-mode.md`

This file owns goal-driven task exploration.

It should contain:

- Journey mode purpose.
- Journey brief fields.
- Journey planning rules.
- Journey execution rules.
- Journey stopping rules.
- Journey results format.
- Rule that journey mode does not become full-page free traversal unless the user explicitly asks.
- Reporting handoff to `references/reporting.md`.

Journey mode should use the same before, target, after, snapshot diff, console, and error evidence model as free mode. It may reference `references/free-mode.md` for per-step evidence mechanics instead of duplicating every command.

## `references/reporting.md`

This file owns all UX Explore output artifacts for every mode.

It should define:

- Artifact list:
  - `{OUTPUT_DIR}/ux-report.md`
  - `{OUTPUT_DIR}/ux-report.html`
  - `{OUTPUT_DIR}/usage.md`
  - `{OUTPUT_DIR}/usage.html`
  - `{OUTPUT_DIR}/explore-video.webm`
  - `{OUTPUT_DIR}/screenshots/`
  - `{OUTPUT_DIR}/snapshots/`
  - `{OUTPUT_DIR}/diffs/`
- UX report format.
- Usage guide format.
- Mode-specific usage rules.
- Boundary rules between UX critique and product usage.
- HTML generation rules.
- Cleanup checklist.

### UX Report Format

`ux-report.md` is the critique artifact. It answers: where does the product confuse, block, mislead, or drain user confidence?

It should contain:

- Session metadata.
- Page or journey overview.
- Exploration or journey log.
- Before, target, and after screenshot references.
- Snapshot diff links.
- Goodwill score and final verdict.
- UX issues with severity.
- Summary counts.
- Artifact links.

`ux-report.html` is generated from `ux-report.md` using `templates/ux-report-template.html`.

### Usage Guide Format

`usage.md` is the descriptive product-behavior artifact. It answers: what can the user do, what do they click or type, and what visible result follows?

Each usage entry should contain:

- Title.
- Purpose.
- Entry point.
- Ordered steps.
- Visible result.
- Related controls.
- Evidence steps.
- Before, target, and after screenshot references.
- Limitations.

`usage.html` is generated from `usage.md` using `templates/usage-template.html`.

### Mode-Specific Usage Rules

Free mode:

- Write one usage entry per observed coherent capability.
- Group adjacent steps that belong to the same user goal.
- Do not invent unobserved behavior.
- If no coherent capability is discovered, still write `usage.md` and say no complete usage path was observed.

Journey mode:

- Write one primary usage entry for the journey goal.
- If completed, document the successful path.
- If partial or blocked, document the observed path and put the gap in `Limitations`.
- Do not turn UX problems into usage guide recommendations.

### Boundary Rules

- UX problems belong in `ux-report.md`.
- Product behavior paths belong in `usage.md`.
- `usage.md` avoids severity labels.
- `usage.md` avoids recommendations unless they are necessary to explain a limitation.
- Both free mode and journey mode produce both UX report and usage guide artifacts.

## Testing

Update `tests/ux-explore/structure.test.js` to verify:

- `SKILL.md` routes free mode to `references/free-mode.md`.
- `SKILL.md` routes journey mode to `references/journey-mode.md`.
- `SKILL.md` routes all Markdown and HTML artifacts to `references/reporting.md`.
- `SKILL.md` contains `Observation Style` and does not contain `Narration Mode`.
- `references/journey-mode.md` contains Journey Brief, Journey Planning, Journey Execution, Journey Stopping, Journey Results, and the full-page traversal boundary.
- `references/reporting.md` contains both UX report and usage guide format contracts.
- No test expects artifact format details to live in `SKILL.md`.

## Migration

1. Move journey-specific sections from `SKILL.md` into `references/journey-mode.md`.
2. Rename `references/usage-output.md` to `references/reporting.md`.
3. Update `SKILL.md` reference routing.
4. Rename `Narration Mode` to `Observation Style`.
5. Update tests and plan/spec references.
6. Run full validation:
   - `pnpm test`
   - `git diff --check`
   - English-only scan for UX Explore files and related docs.

## Acceptance Criteria

- `SKILL.md` is the route and shared-judgment entrypoint.
- `free-mode.md` owns page traversal.
- `journey-mode.md` owns goal-driven flow execution.
- `reporting.md` owns `ux-report` and `usage` artifact formats.
- Both execution modes produce both report families.
- Observation style no longer looks like an execution mode.
- Tests pass and the UX Explore files remain English-only.
