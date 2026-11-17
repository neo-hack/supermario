---
name: clean-code
description: Use when asked to simplify, clean, or refactor code for readability. Triggers include unclear names, long functions, mixed abstraction levels, duplication, nested conditionals, or messy error handling. Also use when asked to apply Clean Code or run successive simplification passes. Targets the current diff unless a path is given.
argument-hint: "[scope]"
arguments:
  - scope
---

# Clean Code

Simplify live code in successive passes. Preserve observable behavior. Read the matching Clean Code reference before applying that class of change.

## When to Use

- "Simplify this"
- "Clean this up"
- "Make this readable"
- "Apply Clean Code"
- Unclear names, long functions, mixed abstraction levels, duplication, or nested conditionals

Do not use this skill to add comments only (`use docs-code`) or to delete unused code as the primary goal (`use fire`).

## Scope

- `$scope`: optional path, package, module, or file. When given, simplify that code.
- No scope: use the current diff against the base branch, including the working tree. The base branch is the one the user names, otherwise the repository's merge baseline. Simplify only code the diff adds or changes. Read surrounding code for context, but leave untouched code as it is.
- An empty diff with no scope: report that there is nothing to simplify and stop.

## References

Load only the reference that matches the current pass:

| Remaining issue | Reference |
| --- | --- |
| Unclear names | `references/naming.md` |
| Long or mixed-level functions | `references/functions.md` |
| Comments that compensate for structure or explain constraints | `references/comments.md` |
| Swallowed or vague errors | `references/error-handling.md` |
| What to do in the next pass | `references/successive-refinement.md` |

Do not paste the book. Use these operational checklists.

Local readability first, architecture later. Early passes use naming, functions, comments, and error handling. Do not introduce new architectural layers or design-pattern machinery to finish a pass.

## Iteration Loop

There is no pass limit. Keep running passes until one finds no worthwhile simplification left in scope. If the user names a pass count, treat it as a ceiling, not a quota.

Before pass 1:

1. Record the starting state, including user-owned and already staged changes. Track this skill's edits separately: create a snapshot directory outside the repository for this run, with one subdirectory per pass.
2. Detect verification commands for the changed scope and record relevant baseline results. If no applicable result is available, run the smallest useful check before editing. If no test, type check, lint, or build covers the scope, follow "Without verification" below.
3. Read `references/successive-refinement.md`.

Repeat for each pass:

1. Re-read the target files and the current diff. In diff scope, recompute the diff so the pass sees its own earlier edits.
2. Read the matching Clean Code reference before applying that class of change.
3. If no worthwhile simplification remains in scope, stop. This is the normal end of the loop.
4. Before the first edit to each file in this pass, copy the file as it stands into this pass's snapshot directory. Then apply the smallest behavior-preserving simplifications found in this pass.
5. Run verification for the changed scope.
6. If verification fails, stop and compare with the baseline. For a regression introduced by this pass, undo only this pass's own edits by restoring the files from this pass's snapshot directory. That keeps earlier passes and user changes, and leaves the index alone. Do not use `git checkout`, `git restore`, or `git stash` for this. For an existing failure, environment blocker, or uncertain cause, report the evidence and verification gap instead of blindly reverting or claiming success.
7. Record what changed in this pass.

### Without verification

When nothing can verify the scope, run one pass only. Limit it to renames and local restructuring whose behavior can be checked by reading. Do not change control flow, error handling, or signatures. Report the pass as unverified and list the remaining issues instead of looping.

Do not repeat the same rewrite across passes. Each pass must target remaining issues. A pass that would undo or reshuffle an earlier pass means the loop is done.

Local readability first, architecture later.

## Guardrails

- Preserve observable behavior.
- Do not run a comment-only campaign.
- Do not delete unused code as the primary goal.
- Match existing project style. Do not reformat unrelated code.
- Prefer making code obvious over adding comments; extract or inline only when it reduces the reader's work.
- Apply `references/comments.md` when changing comments. Uncertainty about a comment is a reason to investigate, not delete it.
- Stop a pass rather than force a rewrite that only reshuffles style.

## Report

After the loop stops, list:

- Scope used, with the base branch for diff scope.
- Passes run and why the loop stopped.
- Files changed per pass.
- References used per pass.
- Verification commands and outcomes.
- Remaining issues left for a later pass.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| One giant rewrite | Run the iteration loop. Smallest change per pass. |
| Commenting instead of simplifying | Make the code obvious, or `use docs-code`. |
| Deleting unused code | `use fire`. |
| Skipping verification | Run verification after every pass. With no check available, one restricted pass, reported as unverified. |
| Repeating the same diff | Stop when a pass finds no remaining simplifications. |
| Architecture in an early pass | Local readability first, architecture later. |
