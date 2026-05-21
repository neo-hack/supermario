---
name: fire
description: Dispatch parallel explorer agents to find, prove, and remove dead code from software projects, and report duplicated code without deleting it. Use when asked to analyze or delete unused files, unused exports, unused functions, unreachable branches, obsolete feature code, stale tests, orphaned assets, dependency dead weight, or duplicated code, especially when the user says "dead code", "remove unused code", "clean up unused", "fire", "prune", "parallel analysis", "duplicated code", "duplicate code", or "delete code safely".
argument-hint: "[--fix] [scope]"
arguments:
  - mode
  - scope
---

# Fire

## Core Rule

Use multiple explorer agents first. Delete conservatively: code with meaningful test coverage may be removed when evidence is strong and tests close the loop; code without test coverage should be treated as high risk and removed only with unusually strong evidence and clear entry-boundary analysis. Duplicated code is report-only: do not delete or refactor duplicated code unless the user explicitly asks for a separate refactor.

## Invocation Arguments

- `$mode`: use `--fix` to explicitly allow deletion after analysis. Without `--fix`, analyze and report only.
- `$scope`: optional path, package, module, or feature area to focus the analysis.
- Treat `--fix` as this skill's deletion intent flag, not as a recommendation to use any specific tool's fix mode.

## Workflow

### 1. Analyze

Goal: find dead-code candidates and prove which ones are safe enough to remove.

1. Establish a safe baseline.
   - Run `git status --short` and note user-owned changes before editing.
   - Inspect the top-level repo shape just enough to split exploration by concern.
   - Do not edit files until explorer results have been synthesized.

2. Dispatch explorers in parallel when subagents are available.
   - Keep prompts narrow, read-only, and evidence-oriented.
   - Avoid duplicate assignments. Each explorer should own a distinct question.
   - Tell explorers to report file paths, line references, commands run, confidence, and deletion risks.
   - Continue local non-overlapping work while explorers run: read manifests, identify test commands, and map user-owned changes.

3. Recommended explorer roles.
   - **Entry surface explorer**: identify public APIs, route conventions, CLI entry points, package exports, plugin registrations, generated folders, and files that should not be removed by text search alone.
   - **Static analyzer explorer**: identify repo-native unused-code tools, lint/typecheck scripts, dependency analyzers, and any existing reports. Run analysis in report-only mode first.
   - **Reference graph explorer**: use language-aware search plus `rg` to find unreferenced symbols, files, assets, tests, and re-export chains. Separate strong candidates from weak leads.
   - **Runtime/config explorer**: inspect config, migrations, dependency injection, feature flags, localization, framework discovery, reflection, string registries, and external-facing contracts.
   - **Duplication explorer**: identify duplicated code blocks, near-duplicate modules, copy-pasted tests, and repeated configuration patterns. Report duplication only; do not recommend deletion unless another explorer proves the duplicate is also dead code.
   - **Validation explorer**: identify the cheapest narrow verification commands and the broader commands required after deletion.

4. Synthesize before editing.
   - Merge duplicate candidates.
   - Reject candidates that conflict with entry-surface or runtime/config findings.
   - Prefer private leaf code, orphan assets, and obsolete tests before public exports or manifest changes.
   - Keep duplicated-code findings separate from dead-code candidates. Duplication is a maintainability signal, not deletion proof.
   - Read `references/dead-code-risk.md` when explorers flag dynamic behavior or public surfaces.

5. Classify evidence before deleting.
   - Strong: compiler errors after removing an export are absent; language server/analyzer marks a symbol unreachable or unused; dependency graph tool proves no inbound edges; typecheck/build/tests pass after removal.
   - Medium: no references by `rg`, no framework conventions imply discovery, and surrounding module ownership makes the code private.
   - Weak: no obvious references, but the code may be called by reflection, string lookup, routes, dependency injection, serialization, migrations, config, plugin discovery, or external consumers.
   - Coverage-aware: if the candidate has direct or meaningful integration tests, deletion can proceed after those tests pass. If the candidate has no test coverage, downgrade confidence unless static evidence is strong and entry-surface risk is low.
   - Delete only strong or well-corroborated medium candidates. Leave weak candidates in a report unless the user explicitly accepts the risk.

### 2. Delete

Goal: remove only the candidates proven during analysis, in small reversible batches, with extra restraint for untested code. Enter this phase only when `$mode` is `--fix` or the user otherwise explicitly asks to delete.

1. Start with the safest candidates.
   - Start with private leaf code that is covered by tests: unused local helpers, unreachable branches, unreferenced tests, orphan assets.
   - Then remove files/modules, exports, config entries, dependencies, and documentation references as needed.

2. Keep deletion scoped.
   - Do not include unrelated cleanup or style refactors.
   - Update imports, exports, manifests, dependency declarations, docs, fixtures, and snapshots only when they are part of the same dead-code removal.
   - Preserve user changes in the working tree; adapt around them rather than reverting them.

3. Use tool fixes only after analysis.
   - Use project-configured tool fix modes only when `$mode` is `--fix` and the candidate set has been reviewed.
   - Prefer scoped fix commands when the project tool supports them.
   - Allow automatic file removal only when unused file deletion is explicitly intended; otherwise avoid automatic file removal.
   - Review the resulting diff before moving to tests.

4. Be cautious with untested code.
   - Prefer reporting untested candidates instead of deleting them.
   - Delete untested code only when it is private, has no inbound references across source/config/docs/tests, is not part of a framework convention or public API, and the user-requested scope clearly supports removal.
   - When deleting untested code, use the smallest possible batch and run broader verification immediately after the change.

5. Track what was removed.
   - Keep a concise list of deleted files, deleted symbols, and edited references so the final report can tie each removal back to evidence.

### 3. Test

Goal: prove the cleanup did not break the project.

1. Run verification in layers.
   - First run narrow checks relevant to the deleted code.
   - Then run repo-level typecheck/lint/build/test commands identified during analysis.
   - If a failure appears unrelated, investigate enough to separate pre-existing failure from cleanup regression.

2. Fix cleanup regressions.
   - If a test or build failure points to a bad deletion, restore or adjust the smallest necessary code.
   - If a candidate is only weakly proven after testing, leave it in place and report it as a follow-up candidate.

3. Report evidence and residual risk.
   - List what was removed, why it was considered dead, and which commands passed.
   - Include duplicated-code findings as report-only items with file paths, approximate repeated ranges, and refactor risk.
   - Call out any candidates intentionally left alone and why.

## Explorer Prompt Templates

Use prompts like these, adjusted to the repo and task:

```text
Explore this repository for dead-code entry-surface risks. Identify public exports, route/file conventions, CLI/package entry points, generated folders, plugin registrations, and anything that must not be deleted based on text search alone. Do not edit files. Return concise findings with file paths and confidence.
```

```text
Explore this repository for dead-code candidates using repo-native static analysis and read-only commands. Identify available lint/typecheck/test/dependency-analysis scripts and any unused-code results. Do not edit files. Return commands run, candidate paths/symbols, and confidence.
```

```text
Explore this repository for unreferenced symbols, files, assets, tests, and re-export chains. Use rg and language-aware evidence where available. Do not edit files. Separate strong deletion candidates from weak leads and include exact reference checks.
```

```text
Explore this repository for dynamic references that could make dead-code deletion unsafe: config, dependency injection, migrations, localization, reflection, feature flags, framework discovery, generated manifests, and external contracts. Do not edit files. Return risks with paths.
```

```text
Explore this repository for duplicated code. Identify repeated or near-repeated implementation blocks, test blocks, configuration fragments, and modules that look copy-pasted. Do not edit files and do not recommend deletion based on duplication alone. Return report-only findings with paths, approximate line ranges, duplication shape, and refactor risk.
```

```text
Explore this repository's verification strategy for a dead-code cleanup. Identify the narrowest commands to run after small deletions and the broad commands needed before completion. Do not edit files. Return commands and what each validates.
```

## Tool Choices

Use these as examples, but prefer project-local scripts when available:

- JavaScript/TypeScript: use project-configured dead-code analyzers and fix modes when available, such as Knip if the project already uses it. For duplicated-code reports, use project-local tooling when already configured, or inspect repeated patterns directly. Also consider `npm run typecheck`, `npm test`, `npm run lint`, `npx ts-prune`, and ESLint unused rules.
- Python: `ruff check`, `pytest`, `vulture`, import graph checks, package entry point review.
- Go: `go test ./...`, `go vet ./...`, `staticcheck ./...`.
- Rust: `cargo check`, `cargo test`, `cargo clippy`, `cargo machete` for unused dependencies.
- Java/Kotlin/Scala: `mvn test`, `gradle test`, IDE/compiler unused inspections, dependency analysis plugins.
- C/C++: build with warnings enabled, `clang-tidy`, link map or compilation database checks.

Read `references/dead-code-risk.md` when the project uses reflection, routing conventions, dependency injection, generated code, plugin systems, public packages, or stringly referenced entry points.

## Guardrails

- Do not remove generated files unless the generator and output lifecycle are understood.
- Do not remove migrations, fixtures, schema files, localization keys, or public exports based only on text search.
- Do not remove compatibility shims, re-export barrels, CLI commands, route handlers, plugin registrations, or package entry points without checking external contracts.
- Do not delete or refactor duplicated code as part of this skill's dead-code cleanup. Report it separately unless the user explicitly asks for a duplication refactor.
- Do not "clean up" unrelated code while deleting dead code.
- Preserve user changes in the working tree; adapt around them rather than reverting them.
