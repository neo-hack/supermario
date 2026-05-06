---
name: write-docs
description: Use when asked to create, rewrite, audit, or maintain README, ARCHITECTURE, CONTRIBUTING, TUTORIAL, docs navigation, project options, badges, or documentation signatures.
---

# Write Docs

Write useful project documentation by reading the repository first. Default to improving existing docs before creating new files.

## When to Use

- "Write a README"
- "Improve the README"
- "Create architecture docs"
- "Write CONTRIBUTING.md"
- "Make a tutorial"
- "Audit these docs"
- "Document these options"
- "Add docs badges"
- "Fix documentation navigation"

## Baseline Failures This Skill Prevents

Agents without this skill tend to:

- Guess `npm` or `pnpm` commands without reading the repository.
- Document options without `Type` and `Example`.
- Invent decorative badges such as "config simple" or "theme customizable".
- Treat a default value as proof of an option type.
- Add nonstandard signatures such as "Written with care by X".
- Link to mixed-case docs paths without checking the actual filenames.

Treat those as red flags. Read repository facts first.

## Supported Documents

Canonical filenames:

```text
README.md
ARCHITECTURE.md
CONTRIBUTING.md
TUTORIAL.md
```

If creating a new document, use the canonical filename. If editing an existing document with different casing, preserve that file unless the user asks to normalize names or the repository already has a clear casing convention.

## Required References

Always read `references/elements-of-style.md`.

Then read the matching document reference:

| Target | Reference |
| --- | --- |
| `README.md` | `references/readme.md` |
| `ARCHITECTURE.md` | `references/architecture.md` |
| `CONTRIBUTING.md` | `references/contributing.md` |
| `TUTORIAL.md` | `references/tutorial.md` |

If the user asks for another document type, use `references/elements-of-style.md`, scan the repository, and adapt the closest supported reference. Tell the user which reference you used.

## Workflow

### Phase 1: Identify the Target

Determine the requested document type from the user's words or the target filename.

If multiple documents are requested, handle them in this order unless the user gives another order:

1. `README.md`
2. `ARCHITECTURE.md`
3. `CONTRIBUTING.md`
4. `TUTORIAL.md`

### Phase 2: Audit Existing Docs

Before writing, search for existing documentation:

```bash
rg --files -g 'README*' -g 'ARCHITECTURE*' -g 'CONTRIBUTING*' -g 'TUTORIAL*' -g 'docs/**'
```

Read any existing target document. Preserve accurate project-specific content. Remove or rewrite content that conflicts with current repository facts.

### Phase 3: Scan Repository Facts

Use `rg` and direct file reads before drafting. Look for:

- Top-level directory structure.
- Existing docs and docs navigation.
- Package, build, and runtime config.
- Install, development, test, lint, build, and deploy commands.
- Entry points and important source directories.
- CI, license, package, or version sources for badges.
- Options, configuration, schema, or environment definitions.

Useful searches:

```bash
rg --files -g 'package.json' -g 'pnpm-lock.yaml' -g 'package-lock.json' -g 'yarn.lock' -g 'pyproject.toml' -g 'Cargo.toml' -g 'go.mod' -g 'Makefile' -g '.env.example' -g 'LICENSE*'
rg -n "scripts|dev|test|lint|build|start|serve|deploy" package.json Makefile pyproject.toml Cargo.toml go.mod 2>/dev/null
rg -n "options|config|schema|default|env" .
```

Do not invent commands, defaults, paths, badges, options, types, examples, or capabilities. If repository facts are unavailable, say what cannot be verified instead of filling the gap from convention.

### Phase 4: Write or Edit

Use the matching reference and `references/elements-of-style.md`.

When documenting repository options or configuration in a table, always use this column order:

```markdown
| Option | Type | Default | Example | Description |
| --- | --- | --- | --- | --- |
```

Every option row must be traceable to source, schema, config, or documented behavior. If a default is computed at runtime, explain the source or mark it as derived. Do not infer `Type` from a provided default value unless a source file or user-provided requirement explicitly gives that type.

### Phase 5: Self-Check

Before finishing, check:

- Commands, paths, options, defaults, types, and examples come from the repository.
- Badges and option types have explicit sources.
- Sections serve reader tasks instead of a fixed template.
- Generic filler, passive phrasing, and repeated setup prose are removed.
- Every options table uses `Option | Type | Default | Example | Description`.
- README badges are true and restrained.
- README cat signature appears only at the end.
- Internal links use correct path casing.
- Instructions for adding options or workflows mention related docs or tests when relevant.

### Phase 6: Report

In the final response, say:

- Which document changed.
- Which repository facts supported the content.
- Which details could not be verified.
- Which checks or commands were run.

If no file changed, say what blocked the edit and what facts were missing.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Guessing commands from project type | Read scripts, Makefiles, or existing docs first. |
| Options table lacks `Type` or `Example` | Rewrite with `Option | Type | Default | Example | Description`. |
| Option type inferred from a default value | Read the schema/type source or mark the type as unverified. |
| Badge looks nice but has no source | Remove it or replace it with a verified fact badge. |
| README signature is not a cat signature | Use only the README cat signature rule. |
| Docs links have casual casing | Match real filenames exactly. |
