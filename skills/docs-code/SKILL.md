---
name: docs-code
description: Use when asked to analyze code and add explanatory code annotations, file headers, doc comments, inline comments, or JSX-safe comments.
---

# Docs Code

Analyze a codebase, get confirmation on the module map, then add high-value comments without changing code behavior.

## Phase 0: Execution Mode

Before Phase 1, ask the user to choose one execution mode and wait for the answer: "Choose `subagent driven` or `inline exec`."

1. `subagent driven`: use concurrent subagents for both Phase 1 exploration and Phase 2 annotation when scopes can be kept independent; do not pause after each module during Phase 2.
2. `inline exec`: use concurrent subagents for Phase 1 exploration when useful, but do Phase 2 edits in the current thread with mandatory module gates; before each docs-code edit, briefly explain why that annotation is worth adding.

If the user already specified a mode, proceed with that mode.

Phase 1 exploration rule for both modes:

- Prefer dispatching explorer subagents during Phase 1 when the target contains two or more independent modules, directories, or meaningful file groups.
- Give each explorer subagent a disjoint read scope and ask it to map responsibilities, key files, dependencies, dependents, and likely annotation targets.
- Keep exploration read-only. Explorer subagents must not edit files.
- If the target is a single small file or has no sensible independent scopes, explore inline and state why subagents were not useful.
- Consolidate explorer findings into the Phase 1 report, then wait for user confirmation before any edits.

For `subagent driven` mode:

- During Phase 2, use concurrent annotation subagents only after Phase 1 confirmation.
- Each annotation subagent must read the Phase 1 report, its owned files, and any immediately relevant local imports or importers before editing.
- Require each annotation subagent to add comments only within its owned files and to preserve code behavior.
- Do not pause after each module during Phase 2.
- Require each annotation subagent to return changed files, annotation types, and an ASCII flow for its owned module.
- Consolidate post-confirmation annotation results into the final annotation summary without per-module user gates.

For `inline exec` mode:

- Work directly in the current thread.
- During Phase 2, re-read the Phase 1 report, the target files, and any immediately relevant local imports or importers before editing.
- Process Phase 2 module by module.
- Before starting each module, show the module annotation plan and wait for user confirmation.
- Before adding each file header, doc comment, or inline comment, state the reason it helps future readers.
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

### ASCII Flow Summaries

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

## Argument Handling

This skill accepts an optional target path:

- No argument: operate on the whole codebase.
- Directory argument: scope analysis and annotation to that directory.
- File argument: analyze that file plus one-hop local importers/imports, then annotate only the target file.
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

Complete this phase before editing.

1. Dispatch explorer subagents for independent modules, directories, or meaningful file groups when the scope is large enough to split.
2. Explore the target codebase or directory exhaustively, using the explorer findings plus direct reads as needed.
3. Identify project type: monorepo, single package, or multi-language project.
4. For each top-level module, package, or meaningful directory, read key files and map:
   - Module name and one-sentence responsibility.
   - Key files and what each does.
   - Core exports or public API.
   - Dependencies on other modules.
   - Which modules depend on it.
5. Present a report and wait for user confirmation before Phase 2.

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
```

For a file argument, skip the module-level report. Instead:

1. Read the target file.
2. Read files it imports or requires and files that import it, one hop within the project.
3. Produce one paragraph explaining what the file does, what it depends on, and what depends on it.
4. Wait for user confirmation.
5. In Phase 2, annotate only the target file.

## Phase 2: Add Annotations

After user confirmation, add only comments. Do not modify code logic.

Primary goal: help future maintainers understand the project. Public APIs must be documented, but they are not the only target. Also document internal contracts, module boundaries, data flow, state machines, invariants, compatibility paths, and non-obvious maintenance decisions.

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

Add comments only where they do not already exist:

1. File header: brief role of the file in the module.
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
4. Non-obvious logic blocks: a short comment explaining why the block exists.

## Comment Quality Rules

- Explain why, not what.
- Do not restate obvious code.
- Do not duplicate existing comments.
- If a comment would be vague, leave it out and flag the code as unclear.
- For bug workarounds, explain the bug and reference the issue when available.
- For copied or adapted code, include a source link.
- For standards or specs, include a source link.
- Use `TODO:` for incomplete implementation and `FIXME:` for known bugs.
- Add `NOTE:` for critical logic that requires extra care.
- Do not add emojis to comments.
- Match the natural language of existing comments, README, or the user's language.

## Large File Rules

- If a function exceeds 50 lines or cyclomatic complexity exceeds 10, add intent comments before major branches or loops.
- If a file exceeds 300 lines, add section banners between major logical groups.
- If lint config sets `max-lines`, `max-lines-per-function`, or `complexity`, use project thresholds instead.
- For large files, focus on top-level structure and exported API. Do not comment every line.

Example section banner:

```javascript
// ═══════════ Parsing ═══════════
```

## Phase 3: Verify

Run verification after Phase 2 and before the final report.

The main thread owns verification in both execution modes. Subagents can report local observations, but they do not decide that the full task is verified.

Verification steps:

1. Detect the project validation commands from package scripts, build files, CI config, or existing docs.
2. Run the relevant commands for the changed scope, such as tests, type checks, lint, formatting checks, and builds.
3. Report commands that were skipped and why, such as missing scripts or unavailable tooling.
4. If verification fails, inspect whether the failure is caused by the annotation changes.
5. Fix comment-related failures when possible and rerun the failing verification command.
6. Do not present the task as complete until verification passes or the remaining failure is clearly reported as unrelated or blocked.

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
- Annotation types added by module.
- ASCII flow summaries by module.
- Verification commands and outcomes.
- Skipped verification with reasons.
- Remaining risk, especially if a verification failure is unrelated or blocked.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Editing code while documenting | Only add comments. |
| Skipping Phase 1 confirmation | Stop after the report and wait. |
| Using `//` inside JSX markup | Use `{/* ... */}` inside JSX. |
| Commenting trivial code | Explain intent only where it reduces confusion. |
| Adding comments to generated files | Skip generated, bundled, dependency, and build output files. |
