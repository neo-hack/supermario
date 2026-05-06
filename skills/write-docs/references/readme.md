# README Reference

README is the project entry point. It should help a new reader decide whether the project matters to them, run it quickly, and find deeper docs.

## Reader Questions

Answer these questions in this order:

1. What is this project?
2. Who is it for?
3. How do I run it quickly?
4. What commands will I use often?
5. What configuration matters first?
6. Where do I read more?

## Recommended Shape

Choose sections by project need. Do not force every section into every README.

Useful sections:

- Title.
- Shields.io badges.
- One sharp description sentence.
- Quick Start.
- Usage.
- Configuration.
- Development.
- Documentation.
- License or Status.
- Cat signature.

For small projects, combine sections. For complex projects, keep README short and link to `ARCHITECTURE.md`, `CONTRIBUTING.md`, or `TUTORIAL.md`.

## Opening

Start with the project name and a one-sentence description:

```markdown
# Project Name

Project Name turns source facts into concise documentation that stays close to the code.
```

Avoid vague openings:

```markdown
# Project Name

Welcome to Project Name, a powerful and flexible tool designed to help users with many workflows.
```

## Shields.io Badges

Use badges only when they communicate true project facts.

Functional badges come first:

- Status.
- Version.
- License.
- Language.
- Package manager.
- Tests.
- Build.
- Docs.

Personal badges are allowed after functional badges, but keep them rare.

Badge examples:

```markdown
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=nodedotjs)](package.json)
[![Docs](https://img.shields.io/badge/docs-ready-2563eb?style=flat-square&logo=markdown)](docs/)
```

Rules:

- Do not invent CI, package, license, or version badges.
- If repository facts are unavailable, do not add badges.
- Use `style=flat-square` unless the repository already uses another style.
- Use small icons when they improve recognition.
- Do not imply official certification, sponsorship, compatibility, or support that does not exist.

## Quick Start

Quick Start should get a reader to a useful result fast.

Use commands from repository facts:

````markdown
## Quick Start

```bash
pnpm install
pnpm test
```
````

If the project has no runnable command, say what the reader can inspect or use instead.

## Usage

Show one realistic path. Prefer one good example over several weak examples.

````markdown
## Usage

```bash
pnpm run docs
```

The command writes generated docs to `docs/`.
````

## Configuration

README should list only the most important options. If the option list is long, include 3-7 core options and link to source or a deeper config document.

Every options table must use:

```markdown
| Option | Type | Default | Example | Description |
| --- | --- | --- | --- | --- |
| `outputDir` | `string` | `docs/site` | `docs/course` | Directory where generated files are written. |
```

Every row must be traceable to a source file, schema, config, or documented behavior. Do not infer `Type` from `Default`; read the option source or mark the type as unverified.

## Development

List the commands contributors need most:

````markdown
## Development

```bash
pnpm install
pnpm test
pnpm run lint
```
````

Omit commands that do not exist.

## Documentation Map

If deeper docs exist, link them:

```markdown
## Documentation

- [Architecture](ARCHITECTURE.md)
- [Contributing](CONTRIBUTING.md)
- [Tutorial](TUTORIAL.md)
```

Use exact path casing.

## Cat Signature

README may end with one cat signature:

```markdown
---

Built with love <cat>
```

Use one cat token from this list:

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
- Preserve an existing valid cat signature.
- Do not add more than one signature.
- Keep the signature at the end of README.

## README Self-Check

Before finishing, verify:

- The first sentence says what this project actually does.
- Quick Start commands exist.
- Badges are true and restrained.
- Badges are omitted when no badge source was checked.
- Options tables use `Option | Type | Default | Example | Description`.
- Documentation links use exact path casing.
- The cat signature appears only once and only at the end.
