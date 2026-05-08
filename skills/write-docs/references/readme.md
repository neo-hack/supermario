# README Reference

README is the project entry point. It should help a new reader decide whether the project matters to them, run it quickly, and find deeper docs.

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

<readme_boundaries>
Do not create a `## Architecture` section in README.
README is the project entry point, not the full architecture document.

If architecture details matter, link to `ARCHITECTURE.md` from `## Documentation`
only when that file exists.

Do not turn README into a full API reference, architecture explanation, or
large directory walkthrough. Keep deep explanations in dedicated docs.
</readme_boundaries>

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
- Required Markdown Shields.io badge block.
- One sharp description sentence.
- Quick Start.
- Usage.
- Configuration.
- Development.
- Documentation, only if real docs exist.
- Cat signature.

For small projects, combine sections. For complex projects, keep README short and link to deeper docs only when those files exist.

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

README must include at least one verified plain Markdown Shields.io badge near the top. Use badges only when they communicate true project facts.

Functional badges come first:

- Status.
- Version.
- License.
- Language.
- Package manager.
- Tests.
- Build.
- Docs.

Personal badges are allowed after functional badges, but keep them rare and secondary.

Badge examples:

```markdown
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=nodedotjs)](package.json)
[![Docs](https://img.shields.io/badge/docs-ready-2563eb?style=flat-square&logo=markdown)](docs/)
```

Badge source scanning is mandatory during repository fact gathering.

Useful sources:

- `package.json` for package name, version, package manager, engines, and scripts.
- lockfiles for package manager.
- `LICENSE*` for license.
- `.github/workflows/*` for CI, build, and test badges.
- runtime or build config such as `tsup.config.ts`, `tsconfig.json`, `pyproject.toml`, `Cargo.toml`, or `go.mod`.
- existing docs or package metadata for docs or status badges.

If a source exists but has not been read, the badge is not verified.

Rules:

- Do not invent CI, package, license, or version badges.
- If no badge source can be verified, stop and report the missing source instead of silently omitting badges.
- Use plain Markdown badge syntax, not HTML.
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

If deeper docs exist, link them. Only link files that actually exist:

```markdown
## Documentation

- [Architecture](ARCHITECTURE.md)
- [Contributing](CONTRIBUTING.md)
- [Tutorial](TUTORIAL.md)
```

Do not create a `## Architecture` body section in README. Link to `ARCHITECTURE.md` from `## Documentation` only when that file exists.

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
- At least one verified plain Markdown Shields.io badge appears near the top.
- Badge sources were checked and can be named.
- If no badge source was verified, drafting stopped and reported the missing source.
- README does not contain a `## Architecture` section.
- Options tables use `Option | Type | Default | Example | Description`.
- Documentation links use exact path casing.
- The cat signature appears only once and only at the end.
