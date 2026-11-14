---
name: docs-code
description: Use when the user asks to add, modify, or delete code comments, or when about to write comments.
---

# Docs Code

Make code understandable before explaining it. Inspect the implementation, prefer small structural improvements over explanatory patches, then add, rewrite, or delete comments that still help maintainers. Preserve observable behavior.

## When NOT to Use

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

1. `full pass` (default when the user asks to document a codebase, directory, or module): run all phases below, including confirmations.
2. `inline annotation` (when triggered proactively — e.g., the agent is about to write a comment — or the target is a single file, function, or small comment change): skip Phase 0 and Phase 1. Apply Structure Before Comments, then Phase 2 and Phase 3 to the target and its relevant callers. Do not start a repository-wide cleanup from an inline trigger.

## Phase 0: Execution Mode

Full pass only. For `inline annotation`, skip this phase.

Before Phase 1, ask the user to choose one execution mode and wait for the answer: "Choose `subagent driven` or `inline exec`."

1. `subagent driven`: use concurrent subagents for both Phase 1 exploration and Phase 2 annotation when scopes can be kept independent; do not pause after each module during Phase 2.
2. `inline exec`: use concurrent subagents for Phase 1 exploration when useful, but do Phase 2 edits in the current thread with mandatory module gates; before each docs-code edit, briefly explain why that annotation is worth adding.

If the user already specified a mode, proceed with that mode.

For `subagent driven` mode:

- During Phase 2, use concurrent annotation subagents only after Phase 1 confirmation.
- Each annotation subagent must read the Phase 1 report, its owned files, and any immediately relevant local imports or importers before editing.
- Require each annotation subagent to follow Structure Before Comments within its owned files and the accepted plan. Explicit comment-only requests remain comment-only; structural changes must preserve code behavior.
- Do not pause after each module during Phase 2.
- Require each annotation subagent to return changed files, annotation types, and an ASCII flow for its owned module.
- Consolidate post-confirmation annotation results into the final annotation summary without per-module user gates.

For `inline exec` mode:

- Work directly in the current thread.
- During Phase 2, re-read the Phase 1 report, the target files, and any immediately relevant local imports or importers before editing.
- Process Phase 2 module by module.
- Before starting each module, show the module annotation plan and wait for user confirmation.
- Include structural findings, proposed code changes, preserved constraints, and verification in that plan. Before each structural edit, explain why it removes the need for an explanatory patch.
- Before adding, rewriting, or deleting each file header, doc comment, or inline comment, state the reason it helps future readers.
- When practical, show the reason together with the planned comment and a short code snippet or pseudocode sketch so the user can see where the comment will land.
- Pseudocode is allowed for readability, but it must reflect code that was actually re-read and must not replace checking the real target code before editing.
- Keep each reason brief and tied to intent, dependency boundaries, invariants, or non-obvious control flow.
- After finishing each module, show changed files, annotation types, and an ASCII flow explaining the module flow and comment coverage.
- Wait for user confirmation before continuing to the next module.

Inline exec preview format:

````markdown
Reason: [why this comment helps]
Planned comment: `[exact comment text]`
Code or pseudocode:
```language
[small snippet or pseudocode sketch showing where the comment will be inserted]
```
````

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

Complete this phase before editing. Both execution modes follow the same exploration rules.

1. Dispatch explorer subagents when the target contains two or more independent modules, directories, or meaningful file groups. Give each explorer a disjoint read scope and ask it to map responsibilities, key files, dependencies, dependents, likely annotation targets, and existing experimental comments to clean. Keep exploration read-only. Explorer subagents must not edit files.
2. If the target is a single small file or has no sensible independent scopes, explore inline and state why subagents were not useful.
3. Explore the target codebase or directory exhaustively, using the explorer findings plus direct reads as needed.
4. Identify project type: monorepo, single package, or multi-language project.
5. For each top-level module, package, or meaningful directory, read key files and map:
   - Module name and one-sentence responsibility.
   - Key files and what each does.
   - Core exports or public API.
   - Dependencies on other modules.
   - Which modules depend on it.
6. Scan existing comments in the target files for experimental data.
   Apply Structure Before Comments to each annotation target. Name the exact symbol, the clarity problem, the smallest proposed fix, and any constraint that must remain documented.
7. Consolidate all findings into the report, present it, and wait for user confirmation before Phase 2.

Report format:

```markdown
## Module Analysis Report

### [Module Name]
- **Responsibility**: one-sentence description
- **Key Files**:
  - `path/to/file1.ext` — what it does
  - `path/to/file2.ext` — what it does
- **Exports**: key exported functions, types, classes, or commands
- **Depends On**: other modules it uses
- **Used By**: modules that depend on it
- **Comments to clean**: existing experimental comments and the planned rewrite or deletion
- **Structure before comments**: symbols to rename, extract, or move; behavior checks; changes outside the authorized scope
- **Comments to keep**: public contracts, external constraints, and durable reasons with their evidence
```

For a file argument, skip the module-level report. Instead:

1. Read the target file.
2. Read files it imports or requires and files that import it, one hop within the project.
3. Produce one paragraph explaining what the file does, what it depends on, and what depends on it.
4. Scan existing comments in the target files for experimental data and list **Comments to clean**. Include structural findings and comments whose constraints must be preserved.
5. Wait for user confirmation.
6. In Phase 2, edit only the accepted scope. Report any caller changes needed beyond it before expanding the scope.

## Phase 2: Improve Structure, Then Annotations

After the applicable scope confirmation, follow the accepted plan. Apply Structure Before Comments before adding or rewriting an annotation.

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

The main thread owns verification in both execution modes. Subagents can report local observations, but they do not decide that the full task is verified.

Verification steps:

1. Detect the project validation commands from package scripts, build files, CI config, or existing docs.
2. Run the relevant commands for the changed scope, such as tests, type checks, lint, formatting checks, and builds.
   For code changes, run the focused behavior tests before and after the refactor. If coverage is missing, add the smallest characterization test needed before changing code. Do not weaken assertions to make a refactor pass. Check affected imports, exports, and any ordering or compatibility guarantees when moving code.
3. Report commands that were skipped and why, such as missing scripts or unavailable tooling.
4. If verification fails, inspect whether the failure is caused by the code or comment changes.
5. Fix failures caused by this pass and rerun the failing verification command. If the structural change cannot be verified, undo only that change, preserve user-owned edits and the still-needed explanation, and report it open.
6. Do not present the task as complete until verification passes or the remaining failure is clearly reported as unrelated or blocked.

## ASCII Flow Summaries

Module flow summaries use terminal-friendly ASCII. Explain the module's key flow and where the new comments help future readers understand API boundaries, invariants, state transitions, data flow, or non-obvious branches.

Use descriptive labels such as `[API]`, `[Boundary]`, `[Invariant]`, `[Flow]`, `[State]`, or `[Compatibility]`. The labels are examples, not a fixed taxonomy.

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

Use Mermaid only in separate written documentation when explicitly useful.

## Final Report

The final report comes after Phase 3 verification.

Process files module by module. For each module, list changed files, annotation types, and the ASCII flow summary:

````markdown
## Annotation Summary

### parser

- `src/parser.ts` — file header and exported function docs
- `src/render.tsx` — JSX-safe inline comments for non-obvious branches

```text
Module: parser

[API] parse(input)
   |
   v
[Invariant] normalize tokens
   |
   v
[Flow] return parsed document
```
````

Also report:

- Changed files by module.
- Structural changes and the explanations they made unnecessary; preserved constraints and unresolved findings.
- Annotation types added by module.
- ASCII flow summaries by module.
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
| Skipping Phase 1 confirmation | Stop after the report and wait. |
| Using `//` inside JSX markup | Use `{/* ... */}` inside JSX. |
| Commenting trivial code | Explain intent only where it reduces confusion. |
| Adding comments to generated files | Skip generated, bundled, dependency, and build output files. |
