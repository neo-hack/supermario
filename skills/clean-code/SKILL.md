---
name: clean-code
description: Use when asked to simplify, clean, or refactor code for readability. Triggers include unclear names, long functions, mixed abstraction levels, duplication, nested conditionals, or messy error handling. Also use when asked to apply Clean Code or run successive simplification passes over a file or module.
argument-hint: "[iterations] [scope]"
arguments:
  - iterations
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

## Arguments

- `$iterations`: how many simplification passes to run.
- `$scope`: optional path, package, module, or file.

## References

Load only the reference that matches the current pass:

| Remaining issue | Reference |
| --- | --- |
| Unclear names | `references/naming.md` |
| Long or mixed-level functions | `references/functions.md` |
| Comments that restate code | `references/comments.md` |
| Swallowed or vague errors | `references/error-handling.md` |
| What to do in the next pass | `references/successive-refinement.md` |

Do not paste the book. Use these operational checklists.

Local readability first, architecture later. Early passes use naming, functions, comments, and error handling. Do not introduce new architectural layers or design-pattern machinery to finish a pass.

## Iteration Loop

Parse `$iterations` as a positive integer.

If `$iterations` is missing, ask for a count. If the user does not provide one, use 3.

If `$iterations` is greater than 8, use 8 and say so.

Before pass 1:

1. Establish a git baseline of user-owned changes.
2. Detect verification commands for the changed scope.
3. Read `references/successive-refinement.md`.

For pass `i` from 1 to `$iterations`:

1. Re-read the target files and the current diff.
2. Read the matching Clean Code reference before applying that class of change.
3. If no remaining simplifications: stop and report early exit.
4. Apply the smallest behavior-preserving simplifications found in this pass.
5. Run verification for the changed scope.
6. If verification fails: revert this pass, keep earlier passes, stop.
7. Record what changed in this pass.

Do not repeat the same rewrite across passes. Each pass must target remaining issues.

Local readability first, architecture later.

## Guardrails

- Preserve observable behavior.
- Do not run a comment-only campaign.
- Do not delete unused code as the primary goal.
- Match existing project style. Do not reformat unrelated code.
- Prefer making code obvious over adding comments.
- Stop a pass rather than force a rewrite that only reshuffles style.

## Report

After the last pass or early exit, list:

- Passes run and whether the loop stopped early.
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
| Skipping verification | Run verification after every pass. |
| Repeating the same diff | Stop when a pass finds no remaining simplifications. |
| Architecture in an early pass | Local readability first, architecture later. |
