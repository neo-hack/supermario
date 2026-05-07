# Write Docs README Gates Design

**Date:** 2026-05-07
**Skill:** `skills/write-docs/`
**Status:** Draft for planning
**Context:** Follow-up from reviewing `/Volumes/ORICO/Users/jiangwei/projects/claudeui/packages/cli/readme-process.json`, which recorded a README generation run that skipped references on the first draft, omitted badges, and produced a `## Architecture` section inside README.

## Problem

The first real use of `write-docs` exposed three behavior gaps:

1. The agent wrote README v1 before reading `references/readme.md` and `references/elements-of-style.md`.
2. README badges were treated as optional and were omitted even when package, runtime, CI, or license facts could be checked.
3. README gained a `## Architecture` section, likely because the current references mention architecture as a documentation destination and a generally good heading.

The existing prose rules are not strong enough. The skill needs hard, early constraints that are hard to skip.

## Goal

Update `write-docs` so README generation reliably:

- Reads required references before drafting.
- Includes a verified Markdown Shields.io badge block near the top.
- Keeps README as an entry point, not an architecture document.
- Reports the references and badge sources used.

The change should also improve the skill's own discoverability by adding a `## File Organization` section modeled after `skills/mermaid-course/SKILL.md`.

## Non-Goals

- No generated README rewrite in this change.
- No process-log schema requirement yet.
- No HTML badge block in README output.
- No removal of the independent `architecture.md` reference.
- No validation script in this follow-up.

## Required Hard Blocks

Add XML-style hard blocks to make the rules visually and semantically distinct from normal guidance.

### `<required_reading>`

This block belongs near the top of `skills/write-docs/SKILL.md`. It applies to all document types, not only README.

Required behavior:

```xml
<required_reading>
Before drafting or editing any document, read:
- references/elements-of-style.md
- the matching document reference for the target type

Required mapping:
- README.md -> references/readme.md
- ARCHITECTURE.md -> references/architecture.md
- CONTRIBUTING.md -> references/contributing.md
- TUTORIAL.md -> references/tutorial.md

For unsupported document types, read references/elements-of-style.md,
choose the closest supported reference, and tell the user which fallback
reference was used.

Do not draft until required reading is complete.
The final response must list the references read.
</required_reading>
```

This closes the exact failure from the process log: README v1 was drafted before the README reference was loaded.

### `<readme_identity>`

This block belongs in `skills/write-docs/references/readme.md`. `SKILL.md` should briefly mention that README has extra hard blocks.

Required behavior:

```xml
<readme_identity>
README must open with project identity:
- title
- at least one verified Markdown Shields.io badge
- one sharp description sentence

Use plain Markdown badge syntax, not HTML.
If no badge source can be verified, stop and report the missing source
instead of silently omitting badges.

Future visual identity additions, such as a hero image or product screenshot,
belong in this block and require a real asset source.
</readme_identity>
```

Badge output stays plain Markdown:

```md
[![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)](package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=nodedotjs)](package.json)
```

Badge source scanning should be proactive during repository fact gathering. Useful sources include:

- `package.json` for package name, version, package manager, engines, scripts.
- lockfiles for package manager.
- `LICENSE*` for license.
- `.github/workflows/*` for CI/build/test badges.
- runtime or build config such as `tsup.config.ts`, `tsconfig.json`, `pyproject.toml`, `Cargo.toml`, or `go.mod`.
- existing docs or package metadata for docs/status badges.

If a source exists but has not been read, the badge is not verified.

### `<readme_boundaries>`

This block belongs in `skills/write-docs/references/readme.md`.

Required behavior:

```xml
<readme_boundaries>
Do not create a `## Architecture` section in README.
README is the project entry point, not the full architecture document.

If architecture details matter, link to ARCHITECTURE.md from `## Documentation`
only when that file exists.

Do not turn README into a full API reference, architecture explanation, or
large directory walkthrough. Keep deep explanations in dedicated docs.
</readme_boundaries>
```

This does not forbid short orientation material. README may still include a concise project-layout note when it helps the reader use the package, but it should not explain design trade-offs, dependency graphs, or data flow. Those belong in `ARCHITECTURE.md`.

## Skill File Organization

Add a `## File Organization` section to `skills/write-docs/SKILL.md`, modeled after `skills/mermaid-course/SKILL.md`.

Recommended content:

```text
skills/write-docs/
  SKILL.md                         # Main workflow, hard gates, reporting rules
  references/
    elements-of-style.md           # General writing rules for all docs
    readme.md                      # README identity, badge rules, boundaries
    architecture.md                # System boundary, modules, flows, decisions
    contributing.md                # Setup, checks, PR workflow, option changes
    tutorial.md                    # Goal-led teaching path
```

This section should sit before or near the existing reference routing. It makes the skill's internal resources discoverable before writing starts.

## README Reference Changes

Update `skills/write-docs/references/readme.md`:

- Change badges from optional to required.
- State that badge output uses plain Markdown Shields.io syntax.
- Add proactive badge-source scanning guidance.
- Add `<readme_identity>`.
- Add `<readme_boundaries>`.
- Remove or soften any wording that encourages README to contain architecture content.
- Keep the documentation map, but link `ARCHITECTURE.md` only when the file exists.
- Keep the cat signature rule unchanged unless the current sentence differs from the approved form.

Recommended README shape after the change:

- Title.
- Required Markdown Shields badge block.
- One sharp description sentence.
- Quick Start.
- Usage.
- Configuration.
- Development.
- Documentation, only if real docs exist.
- Cat signature.

## Elements of Style Changes

Update `skills/write-docs/references/elements-of-style.md`:

- Remove `Architecture` from the generic "good headings" list, or qualify it as valid for `ARCHITECTURE.md`, not a default README heading.
- Add a note that document-specific references override generic heading examples.
- Keep "Facts First" and "Personality Without Noise" rules.

## SKILL.md Workflow Changes

Update `skills/write-docs/SKILL.md`:

- Add `<required_reading>` near the top.
- Add `## File Organization`.
- In repository fact scanning, explicitly include badge source scanning.
- In the final report, require:
  - references read,
  - badge sources checked,
  - missing facts that blocked required identity elements,
  - README boundary enforcement when the target is README.

## Success Criteria

- A README draft cannot start before `references/elements-of-style.md` and `references/readme.md` are read.
- A generated README includes at least one verified plain Markdown Shields.io badge.
- If no badge source can be verified, the agent stops and reports the missing source instead of omitting badges.
- README output does not contain a `## Architecture` section.
- README may link `ARCHITECTURE.md` from `## Documentation` only when the file exists.
- `SKILL.md` lists `write-docs` internal resources in a `## File Organization` section.
- The final report lists references read and badge sources checked.

## Validation

Verification can stay lightweight for this follow-up:

- Search `skills/write-docs/SKILL.md` for `<required_reading>` and `## File Organization`.
- Search `skills/write-docs/references/readme.md` for `<readme_identity>` and `<readme_boundaries>`.
- Search `skills/write-docs/references/readme.md` for "plain Markdown" and "Shields.io".
- Search `skills/write-docs/references/elements-of-style.md` to confirm `Architecture` is no longer presented as a default README heading.
- Run a pressure scenario based on `readme-process.json`:
  - ask for a README,
  - confirm references are read before drafting,
  - confirm badge sources are checked,
  - confirm no `## Architecture` section appears.
