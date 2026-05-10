# Mermaid Course — Subagent Generation Design

**Date:** 2026-05-05
**Skill:** `skills/codemermaid/`
**Status:** Approved for planning
**Supersedes:** Nothing. This extends the existing 6-phase `codemermaid` workflow with an optional parallel generation path.

## Problem

`codemermaid` now produces richer pages: scrollable essays, typed pedagogical units, Mermaid diagrams, storyboards, validators, and self-contained HTML. The quality bar is higher, but the generation workflow is still written as a single-agent serial process:

1. Scan the whole repo.
2. Analyze architecture.
3. Build page data for every perspective and module.
4. Build Mermaid graphs.
5. Generate page list.
6. Assemble every page.

That serial shape is reliable but slow on larger repos. The expensive parts are naturally parallel: scanning independent directories, drafting individual module pages, and preparing perspective page drafts. The current `SKILL.md` does not tell an agent when or how to use subagents, so even when subagents are available, the generator will likely proceed one page at a time.

## Goal

Add an optional **Parallel Generation Mode** to `codemermaid`:

- Keep the existing 6-phase workflow as the canonical path.
- If subagents are available and the repo is large enough to benefit, use subagents to accelerate independent work.
- Let subagents generate standalone module HTML pages when the coordinator has assigned them exact modules, filenames, and global rules.
- Keep global architecture decisions, registries, index generation, final link graph, and final validation under the main agent's control.

## Non-Goals

- No changes to HTML templates, runtime JavaScript, CSS, or validators.
- No new CLI tool or automation script.
- No requirement that every run use subagents.
- No permission for subagents to invent modules, change global scope, or write unassigned files.
- No replacement of the existing 6 phases.

## Recommended Approach

Use a two-file documentation change:

1. Add a short `Parallel Generation Mode` section near the top of `skills/codemermaid/SKILL.md`.
2. Add `skills/codemermaid/references/subagent-generation.md` for detailed worker roles, prompt templates, output contracts, merge rules, and failure handling.

This keeps `SKILL.md` discoverable without making the main workflow bloated. Agents that do not have subagents can ignore the reference and run the normal serial workflow.

## Architecture

The main agent becomes the **coordinator**. Subagents become **workers**.

### Coordinator Responsibilities

The coordinator owns all global state:

- Repo boundary and skip list.
- Module registry.
- Filename registry.
- Mermaid node id registry.
- Perspective list.
- Global voice, unit, storyboard, and link rules.
- `index.html`.
- Final page graph and link closure.
- Final `validate-units.js` runs.
- Final browser/manual verification.

The coordinator may write all files itself in serial mode. In parallel mode, it may delegate independent slices but still performs the final merge gate.

### Worker Responsibilities

Workers may perform bounded tasks:

- Scan assigned directories and return factual module notes.
- Draft `COURSE` page data for assigned modules.
- Generate assigned `docs/codebase-course/module-<name>.html` files after the coordinator provides the registry and template rules.
- Draft `PERSPECTIVE` page data for assigned perspectives.
- Draft local Mermaid diagrams, code-walks, and storyboards for their assigned scope.

Workers must not:

- Rename modules.
- Create new modules outside assignment.
- Change global node ids or filenames.
- Write `index.html`.
- Write unassigned perspective pages.
- Decide the final perspective list.
- Skip validation for pages they generate.

## Parallel Boundaries

### Safe To Parallelize

**Phase 1: Scan**

The coordinator can split source directories across workers. Each worker reports discovered modules, public interfaces, imports, exports, entry points, and source evidence.

**Phase 2: Analyze**

Workers can draft layer/pattern observations for assigned areas. The coordinator merges these into the final architecture analysis.

**Phase 3: Build Page Data**

Workers can draft module `COURSE` data and perspective `PERSPECTIVE_DRAFT` data. Module workers can also assemble module HTML when assigned exact output paths.

**Phase 4: Build Mermaid Graphs**

Workers can draft Mermaid diagrams for their assigned pages. The coordinator verifies node ids and cross-page consistency.

**Phase 6: Assemble**

Workers can assemble assigned module pages only after receiving the coordinator-owned registry and template rules.

### Coordinator-Owned

The coordinator keeps these serial:

- Final module registry.
- Final perspective list.
- Final filename map.
- Final node id map.
- `index.html`.
- Cross-page links.
- Final validation and verification.

## Subagent Output Contract

Every worker returns a structured handoff:

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
  - `docs/codebase-course/module-auth.html`
- Draft-only files:
  - none

## Validation

- Command: `node skills/codemermaid/scripts/validate-units.js <path-or-stdin>`
- Result: PASS | FAIL | NOT_RUN
- Notes: <exact errors if failed>

## Links And Assumptions

- Cross-links requested:
  - `module-router.html`
- Unresolved assumptions:
  - none
```

The coordinator rejects a handoff if:

- `Source Evidence` is missing.
- `Validation` is missing for generated module pages.
- A worker writes files outside its assigned paths.
- A worker invents links not present in the registry.
- A generated filename collides with another page.
- The page data violates unit, voice, or storyboard budgets.

## Module HTML Generation

Subagents may write module HTML directly. This is the most valuable parallel write path.

Required coordinator input:

- Assigned module names.
- Assigned output filenames.
- Source files for each module.
- Global `INDEX` link rules.
- Node id registry.
- Template paths and assembly rules.
- Voice examples and unit examples.
- Storyboard rules.

Worker output:

- Complete `COURSE` data for each assigned module.
- One generated `docs/codebase-course/module-<name>.html` per assigned module.
- Validation result for each page.
- List of source files read.
- List of assumptions or missing context.

Coordinator final checks:

- Every discovered module has exactly one page.
- No duplicate `module-*.html` files.
- Every module page linked from `index.html` exists.
- Perspective links point to real module pages.
- All module pages pass validation.
- Voice and pedagogy are consistent across workers.

## Error Handling

If a worker fails validation, the coordinator can either:

- Ask the same worker to fix only its assigned output.
- Fix the page directly if the issue is small and local.
- Reassign the module to a new worker if the output lacks source evidence or is too speculative.

If global inconsistencies appear, the coordinator fixes the registry first, then asks affected workers to regenerate against the updated registry.

## SKILL.md Changes

Add a concise section after `Output` or before `Phase 1`:

```markdown
## Parallel Generation Mode

If subagents are available and the target repo has enough independent modules to benefit, use `references/subagent-generation.md`. The main agent remains coordinator: it owns module registry, filename registry, node ids, perspective list, index page, link graph, and final validation. Subagents may scan assigned areas, draft page data, and generate assigned `module-<name>.html` files, but they must not create unassigned files or make global architecture decisions.
```

Add `references/subagent-generation.md` to the file organization list.

## Reference Document Shape

Create `skills/codemermaid/references/subagent-generation.md` with:

- When to use subagents.
- Coordinator checklist.
- Worker roles.
- Module worker prompt template.
- Perspective worker prompt template.
- Scan worker prompt template.
- Output contract.
- Merge gate.
- Failure handling.
- Common mistakes.

## Testing

This is a documentation/process change, so verification is textual plus existing validator safety:

- `rg "Parallel Generation Mode|subagent-generation" skills/codemermaid/SKILL.md`
- `rg "module-<name>.html|Output Contract|Coordinator" skills/codemermaid/references/subagent-generation.md`
- `node --test skills/codemermaid/scripts/validate-units.test.js`

Optional review:

- Read `subagent-generation.md` as if assigning one worker and confirm the worker can know exactly what it may write.
- Confirm module HTML is explicitly parallel-writable, while `index.html` and global registries remain coordinator-owned.

## Success Criteria

- Future agents see the subagent option without reading the whole reference first.
- Subagent-enabled runs can generate module pages in parallel without losing global consistency.
- Subagents have enough structure to produce useful artifacts without guessing.
- Serial generation remains valid when subagents are unavailable.
- The skill stays focused: `SKILL.md` remains the high-level workflow; detailed parallel protocol lives in the reference file.
