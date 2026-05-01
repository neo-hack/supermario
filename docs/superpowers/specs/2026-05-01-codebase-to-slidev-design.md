# Codebase to Slidev — Design Spec

## Overview

A Claude Code Skill that analyzes any codebase and generates a complete Slidev presentation project. The output is a ready-to-run Slidev project with architecture diagrams, flow charts (Mermaid), code walkthroughs, and extension guides — designed for both technical and non-technical audiences.

## Tool Form

Claude Code Skill, installed at `~/.claude/skills/codebase-to-slidev/`. Triggered by natural language in Claude Code (e.g. "Turn this codebase into a Slidev presentation").

## Skill Directory Structure

```
codebase-to-slidev/
├── SKILL.md                          # Core instructions: analysis steps + generation rules
└── references/
    ├── package.json                  # Pre-configured dependencies (slidev + mermaid)
    ├── slidev-config-example.md      # Slidev frontmatter config reference
    └── layout-examples.md            # Common Slidev layout patterns
```

## SKILL.md Core Flow

### Phase 1: Scan

- Read project root directory structure
- Identify entry files (main.go, index.ts, app.py, etc.)
- Find routing/config files
- Detect framework and language (Go, Node.js, Python, Java, etc.)
- Identify core modules and their responsibilities

### Phase 2: Analyze

- Determine architecture pattern (MVC, microservices, monolith, serverless, etc.)
- Trace main request/data flows
- Map inter-module dependencies
- Identify data models and storage layer

### Phase 3: Generate

- Copy `references/package.json` as base, adjust project name
- Generate `slides.md` — the core output
- Generate `slidev.config.yml` if custom config needed

## slides.md Content Structure

Fixed template that every generated presentation follows:

1. **Cover** — Project name + one-line description (layout: `cover`)
2. **Overview** — What it does, what problem it solves (layout: `default`)
3. **Tech Stack** — Languages, frameworks, key dependencies (layout: `default` or `two-cols`)
4. **Directory Structure** — File tree with brief annotations (layout: `two-cols`)
5. **Architecture Overview** — Mermaid architecture diagram (layout: `default`)
6. **Core Modules** — One section per major module:
   - Module responsibility
   - Key files
   - Code snippet with plain-language explanation (layout: `two-cols` or `default`)
7. **Request Trace** — Follow a primary user request end-to-end:
   - Mermaid flow chart
   - Code at each step with annotations
8. **Data Model / Storage** — If applicable (layout: `default`)
9. **How to Extend** — Guide for adding features or modifying behavior
10. **Summary** — Key takeaways (layout: `section`)

Each slide should use the appropriate Slidev layout for best visual presentation.

## Mermaid Diagrams

All flow charts and architecture diagrams use Mermaid syntax embedded directly in the Markdown. Supported diagram types:

- `graph` / `flowchart` — Architecture diagrams, request flows, module dependencies
- `sequenceDiagram` — Request/response traces between components
- `classDiagram` — Data models (if applicable)

## Template Files

### references/package.json

Pre-configured with:
- `@slidev/cli`
- `@slidev/theme-default`
- Slidev scripts (`dev`, `build`, `export`)

### references/slidev-config-example.md

Documents common Slidev frontmatter options:
- Theme selection
- PDF export settings
- Speaker notes
- Custom CSS overrides
- Drawing/annotating mode

### references/layout-examples.md

Examples of Slidev built-in layouts:
- `cover` — Title slide
- `section` — Section divider
- `default` — Standard content
- `two-cols` — Side-by-side (code + explanation)
- `image-right` / `image-left` — Image with text
- `center` — Centered content
- `fact` — Key statistics/facts

## Language Support

User specifies language at trigger time. Default is English.

Trigger examples:
- "Turn this codebase into a Slidev presentation" (English, default)
- "Turn this into a Chinese slide deck" (Chinese)
- "Generate a presentation in Japanese" (Japanese)

All slide content (titles, descriptions, annotations) uses the specified language. Code snippets keep original comments and variable names.

## Audience

Dual-audience design:
- **Non-technical**: Plain-language explanations, visual diagrams, analogies
- **Technical**: Actual code snippets, architecture patterns, dependency maps

Each module section uses `two-cols` layout where possible — code on left, explanation on right.

## Output

A complete Slidev project directory:
```
<project-name>-slides/
├── package.json
├── slides.md
└── slidev.config.yml  (optional)
```

User runs `npm install && npm run dev` to preview.

## Design Principles

1. **Show, don't tell** — Prefer diagrams and code over paragraphs
2. **Real code only** — Snippets are exact copies from the codebase, never simplified
3. **Mermaid-first** — Every architectural concept that can be a diagram should be a diagram
4. **Consistent structure** — Every generated deck follows the same section order
5. **Slidev-native** — Use built-in layouts and features, no custom Vue components unless necessary
