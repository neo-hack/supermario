# Subagent Generation

Use this reference when subagents are available and the repo has enough independent modules or directories to make parallel work useful. Multiple subagents may run concurrently on disjoint module assignments. Serial generation remains valid.

## Coordinator Owns

The main agent is always the coordinator. It owns:

- Repo boundary and skip list.
- Module registry.
- Filename registry.
- Mermaid node id registry.
- Perspective list.
- Build-Up route.
- Global voice, unit, storyboard, and link rules.
- `index.html`.
- `build-up.html`.
- Final page graph and link closure.
- Final `validate-units.js` runs.
- Final browser/manual verification.

Do not delegate global architecture decisions or final consistency checks.

## Safe To Parallelize

| Phase | Worker task | Max concurrency |
| --- | --- | --- |
| Scan | Read assigned directories and report source facts | 4–6 |
| Analyze | Draft layer, pattern, and dependency observations | 3–4 |
| Page data | Draft assigned module `COURSE` data or perspective drafts | 4–8 |
| Mermaid | Draft local diagrams for assigned pages | 4–8 |
| Assemble | Generate assigned `module-<name>.html` files after coordinator provides exact rules | 4–8 |

Coordinator-owned work stays serial: final module list, perspective list, filename map, node id map, `index.html`, cross-page links, and final validation.

## Worker Limits

Workers may:

- Scan assigned paths.
- Scan related files discovered via imports/exports of assigned source (for cross-file storyboards).
- Draft assigned page data.
- Draft assigned Build-Up step fragments only when the coordinator provides exact capability, source files, node ids, and link targets.
- Generate assigned `docs/codemermaid/module-<name>.html` files.
- Draft local Mermaid diagrams and storyboards for assigned scope.

Workers must not:

- Rename modules.
- Create unassigned modules or files.
- Change global node ids or filenames.
- Write `index.html`.
- Write unassigned perspective pages.
- Decide the Build-Up route.
- Write `build-up.html` unless explicitly assigned that exact file by the coordinator.
- Decide the final perspective list.
- Skip validation for generated pages.

## Coordinator Checklist

Before dispatching workers, prepare:

- Assigned modules, source files, and output filenames.
- Default perspective list with `architecture.html` and `build-up.html`.
- Build-Up route with capability increments, covered modules, source files, and expected diagrams.
- Global `INDEX` link rules.
- Node id registry.
- Template paths and assembly rules.
- Voice examples, unit examples, and storyboard rules.
- Validation command.

After workers return, reject any handoff that lacks source evidence, validation, assigned-path discipline, registry-safe links, unique filenames, or valid unit/storyboard budgets. Accept cross-file storyboards when workers provide import/export evidence.

## Module Worker Prompt

```markdown
You are generating one assigned codemermaid module page.

Scope:
- Module: <module name>
- Source files: <paths>
- Output file: docs/codemermaid/module-<name>.html

Rules:
- Read assigned source files and their direct dependencies (via imports/exports).
- Use exact real code snippets.
- Follow global node ids and filename registry exactly.
- Use storyboard units for multi-step sequences, state transitions, and cross-file interactions.
- Use code-walk units for single-file deep dives.
- Do not write index.html or unassigned files.
- Validate before reporting.
- **EXPLAIN CODE THOROUGHLY.** Every annotation note must explain the *why* — not restate the code. Every concept must explain the module's role and reasoning. Lazy notes like "Calls verify() to validate the token" are banned. Good notes explain the mechanism, tradeoffs, and non-obvious behavior. See SKILL.md "Code explanation depth" section for the full standard.

Return the output contract below.
```

## Perspective Worker Prompt

```markdown
You are drafting one assigned codemermaid perspective.

Scope:
- Perspective: <name>
- Covered modules: <module list>
- Registry: <filenames and node ids>

Rules:
- Draft PERSPECTIVE page data only unless coordinator assigns an output file.
- Use inline markdown links only to registered pages.
- Do not add modules, rename modules, or change node ids.
- Return assumptions and requested links.
```

## Build-Up Fragment Worker Prompt

```markdown
You are drafting one assigned Build-Up fragment for codemermaid.

Scope:
- Capability increment: the coordinator-provided capability name
- Source files: the exact assigned source paths
- Covered modules: the exact assigned module names
- Registered page: build-up.html
- Registry: the coordinator-provided filenames and node ids

Rules:
- Read references/build-up.md before drafting.
- Treat the route as a learning order, not a historical implementation order.
- Explain what capability exists before this step, what capability appears after it, and why this code is needed now.
- Use exact real code snippets.
- Use Mermaid diagrams only when they clarify structure, flow, sequence, state, or before/after shape.
- Use code-graph only when code lines need click-sync to a small SVG graph.
- Do not change the Build-Up route.
- Do not write build-up.html unless the coordinator explicitly assigns final assembly.
- Return page data draft only.
```

## Scan Worker Prompt

```markdown
You are scanning assigned codebase paths for codemermaid.

Scope:
- Paths: <paths>

Report:
- Files read.
- Candidate modules and responsibilities.
- Imports, exports, entry points, public interfaces.
- Dependency edges with source evidence.
- Unknowns or skipped paths.

Do not decide final module names or write course files.
```

## Output Contract

Every worker returns:

```markdown
## Assignment

- Worker type: module-page | perspective-draft | scan
- Assigned scope: <modules, directories, or perspective>

## Source Evidence

- Files read:
  - `path/to/file.ext`
- Imports/exports observed:
  - `<fact>`

## Generated Or Drafted Artifacts

- Page data kind: COURSE | PERSPECTIVE_DRAFT | SCAN_REPORT
- Generated files:
  - `docs/codemermaid/module-auth.html`
- Draft-only files:
  - none

## Validation

- Command: `node skills/codemermaid/scripts/validate-units.js <path-or-stdin>`
- Result: PASS | FAIL | NOT_RUN
- Notes: <exact errors if failed>
- Double-escape self-check: scan generated HTML for `&amp;#`, `&amp;lt;`, `&amp;gt;`, `&amp;mdash;`, `&amp;nbsp;` patterns. If any found, the output has been double-escaped. Fix by replacing with the single-escaped forms (`&#39;`, `&lt;`, `&gt;`, `&mdash;`, `&nbsp;`). This is a common subagent artifact where already-escaped content gets escaped again.

## Links And Assumptions

- Cross-links requested:
  - `module-router.html`
- Unresolved assumptions:
  - none
```

## Merge Gate

Before accepting parallel work:

- Every discovered module has exactly one page.
- No duplicate `module-*.html` files exist.
- Every module page linked from `index.html` exists.
- Perspective links point to real registered pages.
- All module pages pass validation.
- Voice, pedagogy, storyboards, and code presentation rules are consistent.

## Failure Handling

If validation fails, ask the same worker to fix only its assigned output or fix it directly when the issue is small and local. Reassign if the output lacks source evidence or is too speculative.

If global inconsistencies appear, fix the coordinator-owned registry first, then ask affected workers to regenerate against the updated registry.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Worker writes `index.html` | Reject; coordinator owns the index |
| Worker invents a module | Reject; coordinator owns module registry |
| Worker uses unregistered links | Reject until links match filename registry |
| Worker skips validation | Reject generated pages without validation |
| Double-escaped entities in output | Worker must self-check for `&amp;#`, `&amp;lt;`, `&amp;gt;` patterns and fix before reporting. Caused by escaping already-escaped content. |
| Multiple workers edit same output | Assign disjoint files only |
