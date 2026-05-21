# CodeMermaid Skill Slimming Design

**Date:** 2026-05-21
**Skill:** `skills/codemermaid/`
**Status:** Draft for planning
**Context:** The main `SKILL.md` has grown large and repeats guidance that already lives in `references/`. The user wants to slim the main skill file while keeping references intact and making agents explicitly read the relevant reference files.

## Problem

`skills/codemermaid/SKILL.md` currently mixes four kinds of content:

1. The core workflow agents must follow.
2. Hard quality rules that must remain close to the workflow.
3. Long examples and style guidance already covered by `references/`.
4. Maintenance-oriented file notes that are not useful during normal skill execution.

This makes the main skill harder to scan. It also creates drift risk: if the same rule appears in `SKILL.md` and a reference file, one can be updated while the other stays stale.

There is also a duplicate skill copy under `.agents/skills/codemermaid/`. That copy appears byte-identical to `skills/codemermaid/`, including all reference files. This design does not decide whether to delete or regenerate `.agents`; it focuses on the source skill content under `skills/codemermaid/`.

## Goals

- Slim `skills/codemermaid/SKILL.md` without reducing generation quality.
- Keep every file under `skills/codemermaid/references/`.
- Make `SKILL.md` explicitly tell agents when to read the relevant reference file.
- Keep hard safety and quality rules in `SKILL.md` where agents will see them during execution.
- Remove runtime-irrelevant maintenance paths such as `vendor/beautiful-mermaid/` from the skill-facing file organization.
- Fix misleading references to `references/DESIGN.md`; the design rationale file is `DESIGN.md` at the skill root.

## Non-Goals

- Do not delete `references/`.
- Do not delete or redesign assets.
- Do not change generated HTML behavior.
- Do not change the CodeMermaid page model.
- Do not decide the lifecycle of `.agents/skills/codemermaid/` in this change.
- Do not move the Phase 6 HTML slot templates unless a new reference file is introduced later.

## Source Of Truth Boundaries

`SKILL.md` should remain the source of truth for:

- When to use CodeMermaid.
- The six generation phases.
- Required output files.
- Page data shapes at a high level.
- Hard requirements: real code only, page pedagogy, quiz correctness, link validity, line-number alignment, no placeholder links, no invented snippets.
- Which reference files to read before writing prose, diagrams, examples, or subagent prompts.

Reference files should be the source of truth for:

- `references/voice-examples.md`: voice, signposts, anti-patterns, rewrite recipes.
- `references/units-examples.md`: concrete unit object examples and teaching patterns.
- `references/svg-patterns.md`: Mermaid diagram templates, node and edge patterns, raw SVG reference for `code-graph`.
- `references/subagent-generation.md`: parallel generation protocol, worker prompts, output contract, merge gate.
- `references/design-system.md`: CSS tokens, typography, color roles, shadows, spacing.
- `DESIGN.md`: broader visual rationale for the Raycast-inspired direction.

## Proposed Changes

### 1. Voice Rules

Replace the current prose-heavy voice paragraph with a short execution instruction:

```markdown
### Voice rules

Before writing generated prose, read `references/voice-examples.md`. Follow that file for voice, signposts, anti-patterns, and rewrite recipes.
```

Reasoning: agents need a clear action, not duplicated voice examples. The detailed examples stay in `references/voice-examples.md`.

### 2. Unit Examples

Keep the compact unit schema in `SKILL.md`, but remove the long per-unit example sections:

- `### Concept units`
- `### Quiz units`
- `### Diagram units`
- `### Code-walk units`
- `### Code-graph units`

Replace those sections with a short reference handoff:

```markdown
### Unit examples

Before drafting unit data, read `references/units-examples.md` for concrete object shapes and teaching patterns. Keep the hard requirements in this file: page pedagogy, real code only, quiz correctness, code presentation rules, and highlight alignment.
```

Reasoning: the object examples belong in `units-examples.md`; the hard constraints should stay in `SKILL.md` because they are quality gates.

### 3. Code Explanation Rules

Do not remove the `Code explanation depth`, `Pedagogy enforcement`, `Real code only`, or `Code presentation rules` sections in the first slimming pass.

These are not just examples. They are the main safeguards against low-quality generated courses:

- lazy annotations,
- fake or simplified snippets,
- wrong highlight line numbers,
- diagrams without useful captions,
- quiz explanations without code evidence.

They may be lightly tightened later, but this first pass should keep them visible.

### 4. Mermaid And SVG Patterns

Shorten Phase 4 to an instruction plus a few non-negotiable rules:

```markdown
## Phase 4: Build Mermaid Diagrams

Before writing diagrams, read `references/svg-patterns.md`.

Use Mermaid for `diagram` units and raw inline SVG only for `code-graph` mini-graphs that need `data-node-id` click-sync. Keep node IDs consistent across pages, use descriptive labels, and do not inline theme overrides; the Raycast dark theme is configured in `mermaid-bridge.js`.
```

Reasoning: detailed diagram syntax and SVG skeletons already live in `references/svg-patterns.md`. `SKILL.md` should retain only the rules that shape output safety and consistency.

### 5. Parallel Generation Mode

Replace the current detailed summary with a shorter handoff:

```markdown
## Parallel Generation Mode

If subagents are available and the repo has enough independent modules, read `references/subagent-generation.md` before dispatching work.

The main agent remains coordinator and owns the module registry, filename registry, perspective list, index page, link graph, and final validation. Subagents may only work inside assigned scopes.
```

Reasoning: subagent worker prompts, output contracts, and merge gates belong in the reference. `SKILL.md` only needs to preserve the coordinator ownership boundary and tell agents to read the protocol first.

### 6. Design System

Replace the current design system paragraph with:

```markdown
## Design System

Use the bundled Raycast-inspired dark theme in `assets/style.css`. For visual rationale and token guidance, read `DESIGN.md` and `references/design-system.md`.
```

Reasoning: `references/DESIGN.md` is not a real path. The rationale file is `skills/codemermaid/DESIGN.md`.

### 7. File Organization

Update `File Organization` so it lists only files useful to agents running the skill:

```markdown
skills/codemermaid/
  SKILL.md
  DESIGN.md
  references/
    design-system.md
    svg-patterns.md
    subagent-generation.md
    units-examples.md
    voice-examples.md
  assets/
    skeleton-essay.html
    skeleton-index.html
    style.css
    runtime.js
    beautiful-mermaid.bundle.js
    mermaid-bridge.js
```

Remove `vendor/beautiful-mermaid/` from `SKILL.md`.

Reasoning: `vendor/beautiful-mermaid/` is maintenance context for rebuilding the bundled renderer, not execution context for the agent generating a course. Keeping it in `SKILL.md` can send agents looking for a path that may not be loaded.

### 8. Phase 6 HTML Templates

Do not slim the Phase 6 HTML slot templates in this pass.

Reasoning: there is no dedicated `references/html-assembly.md` yet. The templates are output contracts, not duplicated reference material. Removing them now would make page assembly less explicit.

## Validation

Update or add tests in `tests/codemermaid/assets.test.js` so the slimming does not remove important guidance:

- `SKILL.md` still points to `references/voice-examples.md`.
- `SKILL.md` still points to `references/units-examples.md`.
- `SKILL.md` still points to `references/svg-patterns.md`.
- `SKILL.md` still points to `references/subagent-generation.md`.
- `SKILL.md` points to `DESIGN.md` and `references/design-system.md`.
- `SKILL.md` no longer points to `references/DESIGN.md`.
- `SKILL.md` no longer includes `vendor/beautiful-mermaid/`.
- Existing asset and metadata tests still pass.

Manual review should confirm:

- The main file is shorter and easier to scan.
- Agents are explicitly told to read reference files before using those domains.
- Hard quality gates remain visible in `SKILL.md`.
- No reference file is deleted.

## Success Criteria

- `skills/codemermaid/SKILL.md` is materially shorter without losing mandatory workflow or quality gates.
- Voice, unit examples, diagram patterns, subagent protocol, and design-system details are delegated to their reference files.
- `references/` remains intact.
- The skill-facing file organization no longer mentions `vendor/beautiful-mermaid/`.
- Tests verify the reference handoffs and catch accidental reintroduction of misleading paths.
