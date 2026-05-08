# Elements of Style for Project Docs

Use these rules for every document written by the `write-docs` skill.

## Core Rules

1. Start with the reader's next useful action.
2. Prefer concrete nouns and active verbs.
3. Say what this project does, not what projects like it usually do.
4. Keep paragraphs short enough to scan.
5. Use examples that can be copied or verified.
6. Delete generic welcome, marketing, and filler text.
7. Use lists for choices, commands, or checks; use prose for explanation.
8. Name files, commands, options, and outputs exactly.
9. Mark uncertainty instead of hiding it.
10. Keep personality as a light accent, not the main content.

## Strong Sentences

Write like this:

```text
Run `pnpm test` before opening a pull request.
```

Not like this:

```text
It is recommended that tests are run before contribution work is submitted.
```

Write like this:

```text
`outputDir` controls where generated files are written.
```

Not like this:

```text
The `outputDir` option is an important configuration value that can be used for output-related behavior.
```

## Structure

Use headings that name reader tasks:

- Quick Start
- Configuration
- Development
- Testing
- Release Process
- Troubleshooting

Document-specific references override this generic heading list. For example, `Architecture` is appropriate in `ARCHITECTURE.md`, but it is not a default README heading.

Avoid headings that only name document chores:

- Introduction
- Overview
- More Information
- Miscellaneous

Use a brief overview only when it helps the reader choose what to do next.

## Facts First

Every command, option, path, default, type, example, badge, and claim must come from repository evidence.

Good evidence includes:

- Source code.
- Config files.
- Package scripts.
- Lockfiles.
- CI workflows.
- Existing docs.
- `.env.example`.
- Test files.

When a detail cannot be verified, write that limitation plainly or omit the detail.

## Options Tables

Any options or configuration table must use this exact column order:

```markdown
| Option | Type | Default | Example | Description |
| --- | --- | --- | --- | --- |
```

Rules:

- `Option` names the exact option or environment variable.
- `Type` uses the source type when available.
- `Default` names the literal default, `none`, `required`, or `derived`.
- `Example` shows a realistic value.
- `Description` explains the behavior in one sentence.

Do not guess types, defaults, or examples. A default value alone is not a type source.

If the repository cannot be inspected, do not fill unknown columns from convention. State the missing source or ask for it.

## Personality Without Noise

Personality can make docs feel cared for. It must not hide the useful path.

Allowed:

- A small number of true Shields.io badges.
- One README cat signature at the end.
- Human, direct phrasing.

Avoid:

- Badge walls.
- Decorative claims with no source.
- Badges when the repository cannot be inspected.
- Long jokes before setup instructions.
- Signature text outside README unless the user asks for it.
