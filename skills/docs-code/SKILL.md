---
name: docs-code
description: Use when the user asks to add, modify, or delete code comments, or when about to write comments.
---

# Docs Code

Maintain useful code comments. Inspect the implementation, prefer small structural improvements over explanatory patches, then add, rewrite, or delete comments that still help maintainers. Preserve observable behavior.

Deliver a scoped maintenance diff and verification results.

## When NOT to Use

- The request is only to explain code, architecture, or design history: answer through a read-only explanation workflow. Do not edit code or comments as part of that request.
- The primary goal is a general simplification or refactoring pass: use `clean-code`. This skill starts from a comment or documentation need and uses `clean-code` for the specific structural problems it exposes.
- The goal is deleting unused code: use `fire` instead.
- The goal is documentation beyond code comments (README, guides, tutorials): use `write-docs` instead.

## Structure Before Comments

Read the relevant implementation and callers before judging a comment. Choose the action from what makes the code hard to understand:

| Finding | Action |
| --- | --- |
| A comment translates an unclear name or explains mixed responsibilities or misplaced code | Prefer a precise name, a cohesive function, or placing code beside its owner. Use the smallest behavior-preserving change. |
| A comment explains a public contract, external limitation, compatibility requirement, or durable design tradeoff | Keep or improve the explanation where future maintainers need it. |
| A comment describes a logic defect or compensates for a broken invariant | Reproduce a suspected logic bug and handle it through the bug-fix workflow with a regression test, within the user's authorized scope. Do not present a comment as the fix. |
| A comment repeats obvious code, duplicates another explanation, or records obsolete experiments | Delete it or retain only the verified, durable reason. |

Preserve observable behavior, public contracts, side-effect ordering, and compatibility. A rename, extraction, or move must improve clarity without adding layers merely to eliminate prose. Do not move code across ownership boundaries or change public paths as incidental cleanup.

If the user explicitly requests comments only, change only comments (add, rewrite, or delete) and report structural findings separately. A proactive trigger does not expand the current task: make structural changes only inside its authorized code scope. When a needed refactor or bug fix exceeds that scope, report the exact location and required follow-up instead of adding a reassuring explanation or deleting a still-needed warning.

Keep legal and license notices, public API contracts, external constraints and source links, and durable internal ownership or compatibility reasons that code alone does not explain. A useful comment may remain beside a type or test when it explains why the enforced rule exists. When a constraint is uncertain, inspect callers, tests, and relevant history before deleting it. If evidence is still missing, keep it and report the uncertainty.

## Trigger Scope

Pick one path based on how the skill was triggered:

1. `full pass` (when the user asks to maintain comments across a codebase, directory, or module): run all phases for that scope.
2. `inline annotation` (when triggered proactively — e.g., the agent is about to write a comment — or the target is a single file, function, or small comment change): keep analysis proportional to the target and its relevant callers. Apply Structure Before Comments and the same verification rules. Do not start a repository-wide cleanup from an inline trigger.

## Execution

Work in the current thread by default. Briefly state the planned maintenance, then proceed within the authorized scope. Honor user-requested checkpoints; pause when a required decision or scope expansion needs their input. Do not require an execution-mode choice or per-module approval by default.

If work is delegated and the session permits it, give each agent disjoint owned files and the same scope, comment-only restrictions, and verification requirements. Review its diff and results before accepting the work.

## Argument Handling

This skill accepts an optional target path:

- No argument: operate on the whole codebase.
- Directory argument: scope analysis and annotation to that directory.
- File argument: analyze that file plus one-hop local importers/imports, then edit only the target file. Caller or public-path changes require an explicitly expanded scope.
- Missing path: stop and report the missing path.

Resolve the argument relative to the project root.

Always skip generated and dependency directories:

```text
node_modules
.git
dist
build
.next
out
target
vendor
__pycache__
.cache
coverage
.turbo
.changeset
*.tsbuildinfo
```

## Phase 1: Module Analysis

Complete this phase before editing. Analysis supports the maintenance diff; it is not a separate code walkthrough.

1. Establish a baseline of user-owned changes and identify verification commands for the target scope.
2. Read the target implementation, relevant local imports and callers, public entrypoints, and tests. Identify responsibilities, ownership boundaries, and contracts before judging comments. For a directory or module, cover its relevant files; for a file argument, inspect one-hop local dependencies and dependents without expanding the edit scope.
3. Scan existing comments in the target files for experimental data. Identify outdated, redundant, or missing explanations, and verify any constraints they describe.
4. Apply Structure Before Comments to each candidate. Identify the exact symbol, clarity problem, smallest proposed fix, and constraint that must remain documented.
5. Briefly summarize the planned changes and unresolved findings, then proceed within the authorized scope. Report caller or public-path changes needed outside it separately.

## Phase 2: Improve Structure, Then Annotations

After scope analysis, follow the authorized plan. Apply Structure Before Comments before adding or rewriting an annotation.

1. For an accepted structural finding, use `clean-code` for one pass on the exact accepted scope. Pass the existing authorization and preserve any comment-only restriction. If that skill is unavailable, follow the narrow refactor and verification rules here; do not invent a replacement cleanup framework.
2. Verify each structural change before removing the explanation it replaces. Re-read the resulting code before deciding which comments remain necessary.
3. Add, rewrite, or delete the remaining annotations using the rules below. For an explicit comment-only task, skip code edits and include unresolved structural findings in the report.

- Add comments where missing and valuable, following "What to Add".
- Modify comments that are outdated, wrong, vague, or fail the Comment Quality Rules.
- Delete comments that restate code, duplicate other comments, or cannot be made useful.
- Preserve good existing comments; do not rewrite for style alone. Experimental comments are not good comments; clean them as specified below.

Primary goal: help future maintainers understand the project. Document public contracts and the internal intent that names, types, and structure cannot communicate. A comment should explain a durable reason, not apologize for a fixable organization or logic problem.

### Comment Style

Detect project conventions first. If a project already uses a comment style, follow it.

| Language | File header | Doc comments | Inline |
| --- | --- | --- | --- |
| JS / TS | `/** @file ... */` or `//` | TSDoc `/** ... */` | `//` |
| JSX / TSX | same as JS / TS | TSDoc on exports | `//` outside JSX, `{/* ... */}` inside JSX |
| Python | `"""Module docstring."""` | `"""..."""` | `#` |
| Shell | `# ...` | `# ...` | `#` |
| Go | `// ...` | `// ...` | `//` |
| Rust | `//! ...` | `/// ...` | `//` |
| Java / Kotlin | `/** ... */` | `/** ... */` | `//` |
| C / C++ | `/* ... */` | `/** ... */` | `//` |
| Ruby | `# ...` | `# ...` | `#` |
| Lua | `-- ...` | `--- ...` | `--` |

For JS / TS config options, schema fields, interface properties, and public option metadata, prefer structured TSDoc / JSDoc tags over sentence-only doc blocks.

Good:

```ts
/**
 * @description Skip workspace file-change subscriptions while keeping plugin resources enabled.
 * @default true
 */
skipWorkspaceSubscriptions?: boolean;
```

Bad:

```ts
/** Skip workspace file-change subscriptions while keeping plugin resources enabled. Defaults to true. */
skipWorkspaceSubscriptions?: boolean;
```

Use sentence-only doc blocks only for brief API summaries. For option metadata, include `@default` only when the default value is verified from implementation or existing docs.

JSX / TSX rule: `//` and `/* */` are invalid inside JSX markup. Inside returned JSX, use `{/* ... */}`. Outside JSX markup, use normal JS comment syntax.

### What to Add

After the structural check, add comments only where useful information is still missing. Rewrite or delete existing comments that violate Comment Quality Rules:

1. File header: a role or boundary that is not already clear from the filename, exports, and layout. Do not add a header to every file by default.
2. Public functions, classes, interfaces, and class members: purpose, parameters, and return value when useful.
   - For packages, determine public API from `package.json` `exports` and the entrypoint/barrel files reachable from those exports.
   - Do not treat every `export` keyword as public API; exported symbols that are not reachable from a package entrypoint are internal implementation details.
   - For JS / TS / JSX / TSX public APIs, add `@example` only when it demonstrates non-obvious real usage, integration flow, or configuration.
   - Do not add trivial examples that merely restate a type shape, assign a dummy object, or call a function with placeholder values.
   - Good `@example` targets include components, hooks, non-obvious helpers, and complex config types. Simple data shapes and internal reducer/action types usually need explanation, not examples.
   - Treat exported symbols reachable from package entrypoints and public class members as public APIs. Do not require `@example` for private helpers.
3. Internal contracts and maintainer-critical implementation details:
   - Module boundaries and ownership rules.
   - Cross-module data flow and lifecycle handoffs.
   - State machines, reducer invariants, cache keys, dedupe rules, and race-condition guards.
   - Legacy compatibility paths, protocol fallbacks, and intentional deviations from simpler designs.
4. Non-obvious logic blocks: first check whether naming or structure can make the logic clear. Comment the remaining constraint or design reason; report defects through the bug-fix workflow.

## Comment Quality Rules

- Explain why, not what.
- Do not restate obvious code.
- Do not duplicate existing comments. Rewriting an experimental comment is not duplication.
- If a comment would be vague, leave it out and investigate the specific naming or responsibility problem through Structure Before Comments.
- For bug workarounds, explain the bug and reference the issue when available.
- For copied or adapted code, include a source link.
- For standards or specs, include a source link.
- Use `TODO:` for incomplete implementation and `FIXME:` for known bugs.
- Add `NOTE:` for critical logic that requires extra care.
- Do not add emojis to comments.
- Match the natural language of existing comments, README, or the user's language.

Do not add, and do not preserve, experimental comments. Existing comments that contain experimental data must be rewritten to the constraint reason or deleted if no durable reason remains.

Remove from comments:

- One-off benchmark or timing measurements
- One-time investigation conclusions
- Phrases like "previously 577ms" or "later measured 1200ms"

These belong in a performance report, not long-lived business code. Keep only the durable constraint reason.

Good:

```ts
// Timeout must cover cold start so slow requests are not killed.
```

Bad:

```ts
// Previously 577ms; later measured 1200ms, so timeout was raised to 2000.
```

Do not skip a comment because it already exists. Review feedback about comments is in scope. If a reviewer asks to clean experimental comments, apply the cleanup. Do not leave those comments in place.

## Large File Rules

- Treat size and complexity thresholds as investigation signals, not comment quotas.
- If a function exceeds 50 lines or cyclomatic complexity exceeds 10, inspect mixed responsibilities, abstraction levels, and nesting before considering an explanation.
- If a file exceeds 300 lines, inspect whether cohesive responsibilities belong in separate functions or files.
- If lint config sets `max-lines`, `max-lines-per-function`, or `complexity`, use project thresholds instead.
- Do not add section banners or split files solely because a line threshold was crossed. Keep a navigation comment only when it helps readers and a structural change would not improve the organization.
- For large files, focus on ownership, top-level structure, and public contracts. Do not comment every line.

## Phase 3: Verify

Run verification after Phase 2 and before the final report.

The main thread owns final verification. Delegated checks are observations to review, not proof that the full task is verified.

Verification steps:

1. Detect the project validation commands from package scripts, build files, CI config, or existing docs.
2. Run the relevant commands for the changed scope, such as tests, type checks, lint, formatting checks, and builds.
   For code changes, run the focused behavior tests before and after the refactor. If coverage is missing, add the smallest characterization test needed before changing code. Do not weaken assertions to make a refactor pass. Check affected imports, exports, and any ordering or compatibility guarantees when moving code.
3. Report commands that were skipped and why, such as missing scripts or unavailable tooling.
4. If verification fails, inspect whether the failure is caused by the code or comment changes.
5. Fix failures caused by this pass and rerun the failing verification command. If the structural change cannot be verified, undo only that change, preserve user-owned edits and the still-needed explanation, and report it open.
6. Do not present the task as complete until verification passes or the remaining failure is clearly reported as unrelated or blocked.

## Final Report

The final report comes after Phase 3 verification.

Keep the report focused on the maintenance result:

- Changed files by module.
- Structural changes and the explanations they made unnecessary; preserved constraints and unresolved findings.
- Comments added, rewritten, or removed.
- Verification commands and outcomes.
- Skipped verification with reasons.
- Remaining risk, especially if a verification failure is unrelated or blocked.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Commenting around confusing structure | Fix the scoped naming, responsibility, or placement problem first. |
| Turning annotation into a broad rewrite | Use one focused `clean-code` pass, preserve behavior, and respect explicit comment-only scope. |
| Deleting a warning before understanding it | Read its implementation, callers, tests, and history; preserve unresolved constraints. |
| Hiding a logic defect behind a comment | Reproduce it and use the bug-fix workflow with a regression test. |
| Leaving experimental comments | Rewrite to the constraint reason or delete. |
| Skipping existing comments | Existing experimental comments must be cleaned, not preserved. |
| Treating maintenance as a code walkthrough | Deliver the scoped diff and verification results; keep teaching requests separate. |
| Using `//` inside JSX markup | Use `{/* ... */}` inside JSX. |
| Commenting trivial code | Explain intent only where it reduces confusion. |
| Adding comments to generated files | Skip generated, bundled, dependency, and build output files. |
