# Docs Code Module Gates And Verify Design

## Goal

Update `docs-code` so annotation work is easier to review in `inline exec`
mode and safer to finish in both execution modes.

The skill already separates `inline exec` from `subagent driven`. This design
keeps that split, adds explicit module checkpoints for `inline exec`, adds
ASCII module flow summaries, and introduces a required verification phase after
comments are added.

## User Decisions

- `inline exec` uses mandatory module gates during Phase 2.
- `subagent driven` does not pause after each module during Phase 2.
- Module flow explanations should use ASCII text, not Mermaid, because the
  checkpoint output is meant for terminal reading.
- Verification is required after annotations because comment-only edits can
  still break tests, type checks, lint, JSX syntax, or builds.

## Current Behavior

`docs-code` currently has:

1. Phase 0 execution mode selection.
2. Phase 1 module analysis with a required user confirmation gate.
3. Phase 2 annotation work.
4. A final annotation summary.

For `inline exec`, the skill already requires explaining why each annotation is
worth adding before making the edit. It does not clearly require a user gate at
module boundaries.

For `subagent driven`, annotation subagents can work concurrently after Phase 1
confirmation. The final summary consolidates their results, but there is no
explicit requirement for module-level flow explanations.

The current skill also lacks a verification phase. That leaves a real failure
mode: comments can accidentally be placed in invalid syntax positions, break JSX
markup, violate formatting or lint rules, or expose parser/tooling bugs.

## Proposed Flow

### Phase 0: Execution Mode

Keep the current execution mode choice:

- `subagent driven`
- `inline exec`

The mode determines only Phase 2 checkpoint behavior. Phase 1 confirmation and
Phase 3 verification apply to both modes.

### Phase 1: Module Analysis

Keep the current read-only module analysis behavior.

The Phase 1 report remains the first required user gate. No annotation edits
happen until the user confirms the report.

### Phase 2: Add Annotations

Phase 2 should continue to add comments only. It must not change runtime logic.

#### Inline Exec

`inline exec` becomes a module-gated workflow:

1. Process modules one at a time.
2. Before starting a module, show the module annotation plan and wait for user
   confirmation.
3. Within the module, keep the existing per-edit explanation rule: before adding
   each file header, doc comment, or inline comment, briefly explain why it helps
   future readers.
4. After finishing the module, show changed files, annotation types, and an
   ASCII flow that explains the module flow and comment coverage.
5. Wait for user confirmation before continuing to the next module.

This makes `inline exec` slower but more inspectable. It is the right default
when the user wants the current thread to make each annotation decision visible.

#### Subagent Driven

`subagent driven` stays optimized for concurrent work:

1. Do not pause after each module during Phase 2.
2. Each annotation subagent owns a disjoint file or module scope.
3. Each annotation subagent returns changed files, annotation types, and an
   ASCII flow for its owned module.
4. The main thread consolidates all module results in the final summary.

This keeps the speed benefit of subagents while still giving the user a
module-by-module explanation at the end.

## ASCII Flow Summaries

Module flow summaries use terminal-friendly ASCII. They should explain the
module's key flow and where the new comments help future readers understand API
boundaries, invariants, state transitions, data flow, or non-obvious branches.

Example:

```text
Module: parser

[API] parse(input)
   |
   v
[Invariant] normalize tokens
   |
   v
{ cached? }
   | yes              | no
   v                  v
[Flow] return hit   [Boundary] resolve grammar
```

The labels are descriptive, not a fixed taxonomy. Useful labels include:

- `[API]`
- `[Boundary]`
- `[Invariant]`
- `[Flow]`
- `[State]`
- `[Compatibility]`

The flow should be written for terminal readability. Use Mermaid only in a
separate written spec or documentation artifact when that format is explicitly
useful.

## Phase 3: Verify

Add a required verification phase after Phase 2 and before the final report.

The main thread owns verification in both modes. Subagents can report local
observations, but they do not decide that the full task is verified.

Verification should:

1. Detect the project's likely validation commands from package scripts, build
   files, CI config, or existing docs.
2. Run the relevant commands that are reasonable for the changed scope, such as
   tests, type checks, lint, formatting checks, and builds.
3. Report commands that were skipped and why, such as missing scripts or
   unavailable tooling.
4. If verification fails, inspect whether the failure is caused by the annotation
   changes.
5. Fix comment-related failures when possible and rerun the failing verification
   command.
6. Do not present the task as complete until verification passes or the remaining
   failure is clearly reported as unrelated or blocked.

Examples of useful commands:

```text
npm test
npm run typecheck
npm run lint
npm run build
pnpm test
pnpm lint
cargo test
go test ./...
pytest
```

The skill should choose commands from the actual project. It should not run all
examples blindly.

## Final Report

The final report should come after Phase 3.

It should include:

- Changed files by module.
- Annotation types added by module.
- ASCII flow summaries by module.
- Verification commands and outcomes.
- Any skipped verification with reasons.
- Any remaining risk, especially if a verification failure is unrelated or could
  not be resolved.

## Documentation Updates

Update `skills/docs-code/SKILL.md` in these places:

1. `Phase 0: Execution Mode`
   - Clarify that `inline exec` has mandatory Phase 2 module gates.
   - Clarify that `subagent driven` does not pause per module during Phase 2.
2. `For inline exec`
   - Add module annotation plan before each module.
   - Add user confirmation before starting each module.
   - Add per-module post-edit summary with ASCII flow.
   - Add user confirmation before moving to the next module.
3. `For subagent driven`
   - Require each annotation subagent to return changed files, annotation types,
     and ASCII flow for its scope.
   - State that the main thread consolidates those results without per-module
     pauses.
4. `Phase 2: Add Annotations`
   - Add a short module checkpoint subsection or fold the checkpoint rules into
     the mode-specific sections.
5. Add `Phase 3: Verify`
   - Define verification ownership, command selection, failure handling, reruns,
     and reporting.
6. `Final Report`
   - Require verification results in addition to module annotation summaries.

## Acceptance Criteria

- `inline exec` clearly requires a user gate before each module and after each
  module before continuing.
- `subagent driven` clearly avoids per-module user gates during Phase 2.
- Both modes produce ASCII module flow explanations.
- Both modes run a required verification phase after annotations.
- The final report cannot appear before verification is attempted or explicitly
  reported as unavailable.
- The skill preserves the existing rule that annotation edits must not change
  runtime logic.

## Non-Goals

- Do not add a new execution mode.
- Do not require Mermaid for module checkpoints.
- Do not require every individual annotation in `inline exec` to wait for user
  approval.
- Do not make subagent annotation work serial.
- Do not define a fixed universal verification command list independent of the
  target project.
