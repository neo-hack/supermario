# Write Docs Skill Design

**Date:** 2026-05-05
**Skill:** `skills/write-docs/`
**Status:** Draft for planning
**Context:** User wants a general-purpose documentation writing skill that can audit and improve project docs, with built-in writing rules and references for common document types.

## Problem

Project documentation often fails in two opposite ways:

1. It follows a generic template and includes sections the project does not need.
2. It omits the practical details a reader needs to run, understand, or contribute to the project.

The new skill should help write docs from project facts rather than guesses. It should default to improving existing documentation before generating new files, and it should keep enough personality to match the user's README preferences without turning docs into decoration.

## Goal

Create a lightweight `write-docs` skill that can write and edit:

- `README.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `TUTORIAL.md`

The skill should provide:

- A clear documentation workflow in `SKILL.md`.
- Document-type guidance in `references/`.
- Built-in Elements of Style rules for concise, concrete, reader-centered writing.
- Fixed filename casing rules.
- README badge and cat signature preferences.
- A required options table format when documenting configuration.

## Non-Goals

- No validation script in the first version.
- No full documentation site generator.
- No automatic multi-file documentation suite unless the user asks for it.
- No dependency on a separate Elements of Style skill.
- No template-only generation that ignores the repository being documented.

## Proposed Structure

```text
skills/write-docs/
  SKILL.md
  references/
    elements-of-style.md
    readme.md
    architecture.md
    contributing.md
    tutorial.md
```

`SKILL.md` owns the workflow and routing. The reference files own document-specific judgment.

## Skill Workflow

The skill should follow this process:

1. Identify the requested document type, or infer it from the target filename.
2. Prefer auditing and editing existing documentation when a relevant file exists.
3. Scan project facts before writing:
   - Top-level directory structure.
   - Existing documentation.
   - Package or build configuration.
   - Install, development, test, lint, build, and deploy commands.
   - Entry points and important source directories.
   - Options, configuration, schema, or environment definitions.
4. Read the matching reference file.
5. Apply `references/elements-of-style.md`.
6. Write or edit the document.
7. Run a self-check and report:
   - Which document changed.
   - Which project facts supported the content.
   - Which details could not be verified.

The skill should not invent commands, defaults, paths, badges, options, or capabilities.

## Filename Casing

The default canonical filenames are:

```text
README.md
ARCHITECTURE.md
CONTRIBUTING.md
TUTORIAL.md
```

When creating new docs, use these names exactly. When editing existing docs with different casing, preserve the existing file unless the user asks for normalization or the repository already shows a clear convention.

## Reference Responsibilities

### `elements-of-style.md`

This file defines the general writing rules used by all document types:

- Prefer concrete nouns and active verbs.
- Put the reader's next task before background explanation.
- Delete generic welcome, marketing, and filler text.
- Say what the project actually does, not what projects like it usually do.
- Use short paragraphs and scannable sections.
- Keep examples executable and specific.
- Use personality as a light accent, not a substitute for clarity.

It should include a "personality without noise" rule for badges and README signatures.

### `readme.md`

README is the project entry point. It should answer:

- What is this?
- Who is it for?
- How do I run it quickly?
- What are the common commands?
- What configuration matters first?
- Where do I go for architecture, contribution, or tutorial details?

README should not become the full manual for complex projects. When detail grows, it should link to other docs.

Recommended sections are chosen by project need, not forced by template:

- Title.
- Shields.io badges.
- One sharp description sentence.
- Quick Start.
- Usage.
- Configuration, only for the most important options.
- Development commands.
- Documentation map.
- Status or license when discoverable.
- README-only cat signature.

### `architecture.md`

Architecture docs should explain the system shape:

- System boundary.
- Main modules.
- Data flow or request flow.
- Key design decisions and trade-offs.
- Extension points.
- Non-goals.

Diagrams are encouraged when they reduce cognitive load. Mermaid should be preferred for diagrams, but only after reading the actual code and file structure.

### `contributing.md`

Contributing docs should make collaboration executable:

- Prerequisites.
- Installation.
- Local development.
- Test, lint, and build commands.
- Code style conventions.
- Branch, commit, and pull request expectations.
- How to report issues.
- How to add or update documented options.

Avoid empty encouragement as the main content. "Contributions welcome" is fine as a small note, but the useful content is the workflow.

### `tutorial.md`

Tutorial docs should lead the reader through one real path:

- Goal.
- Prerequisites.
- Starting state.
- Step-by-step actions.
- Expected results.
- Troubleshooting notes when needed.
- Next steps.

A tutorial is not a feature list. It should help the reader finish a concrete task.

## README Badges

README may include Shields.io badges when the badge communicates a real, verifiable project fact.

Functional badges should come first:

- Status.
- Version.
- License.
- Language.
- Package manager.
- Tests.
- Build.
- Docs.

Personal or signature badges are allowed, but should be rare and secondary. They must not imply official certification, sponsorship, compatibility, or support that does not exist.

Badge rules:

- Prefer true project facts over decoration.
- Keep badge count small.
- Use Shields.io icons when they improve recognition, such as `logo=github`, `logo=typescript`, `logo=nodedotjs`, or `logo=markdown`.
- Do not invent CI, package, license, or version badges without a source.

## README Cat Signature

README may end with a lightweight cat signature. The sentence is fixed:

```md
---

Built with love <cat>
```

The cat token is selected from this initial built-in list:

```text
🐱
=^._.^=
(=｀ェ´=)
ฅ(=｀ω´=)ฅ
/ᐠ｡ꞈ｡ᐟ\
/ᐠ - ˕ -マ
```

Rules:

- Only the cat token varies.
- Keep the signature in README only unless the user asks otherwise.
- If an existing README already has a valid cat signature, preserve it instead of changing it every edit.
- Do not add multiple signatures.

## Options and Configuration Tables

Any documented repository option, configuration value, or setting table must use this column order:

```md
| Option | Type | Default | Example | Description |
| --- | --- | --- | --- | --- |
| `outputDir` | `string` | `docs/site` | `docs/course` | Directory where generated files are written. |
```

Rules:

- Types, defaults, and examples must come from real source, schema, config, or documented behavior.
- If a default is computed at runtime, write the source or mark it as derived.
- README should list only the most important options.
- Architecture may explain why options are normalized or passed through the system.
- Contributing should explain which files to update when adding an option.
- Tutorial should introduce only the options needed for the path being taught.

Useful search targets include:

```text
src/**/options.*
src/**/config.*
src/**/schema.*
*.config.*
package.json
pyproject.toml
Cargo.toml
.env.example
```

## Self-Check

Before finishing, the skill should check:

- Facts: commands, paths, options, defaults, and examples come from the repository.
- Structure: sections serve reader tasks rather than a fixed template.
- Style: generic filler, passive phrasing, and repeated setup prose are removed.
- Options: every options table uses `Option | Type | Default | Example | Description`.
- README personality: badges are true and restrained; cat signature appears only at the end.
- Links: internal links use correct path casing.
- Maintenance: instructions for adding new options or workflows mention related docs or tests when relevant.

## Success Criteria

- The skill can improve an existing README without overwriting accurate project-specific content.
- The skill can create a new `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, or `TUTORIAL.md` from scanned project facts.
- README output includes useful badge guidance and a restrained cat signature when appropriate.
- Options tables always include type, default, example, and description.
- The resulting docs sound concise, specific, and human rather than templated.
