# Supermario

[![skills.sh](https://skills.sh/b/neo-hack/supermario)](https://skills.sh/neo-hack/supermario)

A collection of agent skills for documentation, code annotation, visual mockups, and development workflows.

## Skills

| Skill | Description | Gitmoji |
| --- | --- | --- |
| [changeset](skills/changeset/SKILL.md) | Create Changesets release note files from verified package metadata, semver impact, and actual diffs. | `:memo:` |
| [ci](skills/ci/SKILL.md) | Set up developer tooling including ESLint, Changesets, Husky, lint-staged, GitHub workflows, templates, and commitizen. | `:construction_worker:` |
| [codemermaid](skills/codemermaid/SKILL.md) | Generate interactive multi-page HTML codebase courses with Mermaid diagrams, architecture walkthroughs, and module dependency tutorials. | `:memo:` |
| [create-mr](skills/create-mr/SKILL.md) | Create a GitHub pull request from the current branch, respecting project PR templates. | `:twisted_rightwards_arrows:` |
| [docs-code](skills/docs-code/SKILL.md) | Analyze code and add explanatory annotations, file headers, doc comments, and inline comments. | `:bulb:` |
| [fast-commit](skills/fast-commit/SKILL.md) | Stage all changes and commit with an automatically selected message. | `:wrench:` |
| [mockup](skills/mockup/SKILL.md) | Create framed PNG screenshot mockups from images, URLs, or local HTML in Chrome, Safari, iPhone, or iPad frames. | `:camera_flash:` |
| [request-plan-review](skills/request-plan-review/SKILL.md) | Convert markdown plan/spec files into styled HTML review pages with code highlighting, Mermaid diagrams, inline comments, and a theme toggle. | `:mag:` |
| [write-docs](skills/write-docs/SKILL.md) | Write and maintain README, ARCHITECTURE, CONTRIBUTING, TUTORIAL, and other project documentation. | `:memo:` |

## Quick Start

Install all skills into your agent environment:

```bash
npx skills add neo-hack/supermario
```

Then ask your agent to use a skill:

```text
Use the mockup skill to wrap this screenshot in a Chrome frame.
```

Review skills before installing. The skills.sh ecosystem runs routine security audits, but cannot guarantee the quality or security of every skill.

## Development

Skills are authored in `skills/<name>/SKILL.md` and mirrored into `.agents/skills/` for local agent consumption.

Clone and explore:

```bash
git clone git@github.com:neo-hack/supermario.git
```

Each skill directory contains its own `SKILL.md` with usage instructions, workflow steps, and examples.

## Contributing

Open an issue or pull request at [github.com/neo-hack/supermario](https://github.com/neo-hack/supermario).

---

Built with love ฅ(=｀ω´=)ฅ
