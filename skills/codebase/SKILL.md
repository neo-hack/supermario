---
name: codebase
description: Analyze any codebase and generate a complete Slidev presentation with architecture diagrams, Mermaid flow charts, code walkthroughs, and extension guides. Use when asked to "turn this codebase into a Slidev presentation", "generate a slide deck from this project", or "create a walkthrough for this codebase".
---

# Codebase to Slidev Skill

You are a presentation generator. Your job is to read a codebase, understand its architecture and workflows, and produce a complete Slidev presentation project that teaches others how the codebase works.

## Trigger Phrases

- "Turn this codebase into a Slidev presentation"
- "Generate a Slidev deck from this project"
- "Make a presentation about this codebase"
- "Create a Slidev walkthrough for this project"
- "Turn this into a slide deck"

## Language Detection

If the user specifies a language (e.g. "in Chinese", "en español", "in Japanese"), use that language for all slide content. Default is English.

Code snippets always keep their original comments and variable names regardless of language setting.

## Slidev Syntax Reference

This skill works alongside the official Slidev skill. For all Slidev syntax details (layouts, animations, code highlighting, Mermaid, frontmatter, exports), refer to the official Slidev skill's references at `.agents/skills/slidev/references/`. Key references you will need:

- `core-syntax.md` — Slide separators, frontmatter, notes
- `core-headmatter.md` — Deck-wide config (theme, title, transition, etc.)
- `core-frontmatter.md` — Per-slide config (layout, class, etc.)
- `core-layouts.md` — All built-in layouts (cover, two-cols, section, etc.)
- `layout-slots.md` — `::right::`, `::default::` slot syntax
- `diagram-mermaid.md` — Mermaid diagram syntax in slides
- `code-line-highlighting.md` — `{2,5-7}` line highlighting
- `core-animations.md` — `v-click`, transitions
- `core-exporting.md` — PDF/PPTX export

Read these references before generating if you need syntax details. Do NOT guess at Slidev syntax.

## Phase 1: Scan

Before generating anything, thoroughly explore the codebase:

1. **Directory structure** — Read the root directory, identify top-level folders and their purpose
2. **Entry files** — Find `main.*`, `index.*`, `app.*`, `server.*`, `cmd/`, or framework-specific entry points
3. **Config files** — Read `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `pom.xml`, `Makefile`, `docker-compose.yml`, or equivalent
4. **Routing** — Find route definitions, API endpoints, or URL mappings
5. **Framework detection** — Identify the language, framework, and runtime from config and imports
6. **Core modules** — Identify the 3-8 most important source directories/files

Use Glob and Grep tools extensively. Read key files to understand their purpose. Do NOT guess — read actual code.

## Phase 2: Analyze

Based on the scan results:

1. **Architecture pattern** — Determine if the project is MVC, microservices, monolith, serverless, event-driven, etc.
2. **Data flow** — Trace the primary request path from entry to response
3. **Module dependencies** — Map how modules depend on each other
4. **Data models** — Identify database schemas, type definitions, or data structures
5. **Key abstractions** — Find interfaces, base classes, or core types that define the system's vocabulary

## Phase 3: Generate

Create the Slidev project at `docs/codebase/` inside the current project directory.

### Step 3.1: Create output directory

```
mkdir -p docs/codebase
```

### Step 3.2: Copy and customize package.json

Read `references/package.json` from this skill directory. Copy it to `docs/codebase/`. Replace `"project-slides"` with the actual project name.

### Step 3.3: Generate slides.md

This is the main output. Follow the structure below exactly. Use Slidev layouts as specified. Use Mermaid for all diagrams.

#### Slide Structure (mandatory, in order)

**Slide 1: Cover** — layout: `cover`

Project name, one-line description, language/framework tag in bottom-right.

**Slide 2: Overview** — layout: `default`

Three bullets: problem it solves, who uses it, key capability.

**Slide 3: Tech Stack** — layout: `two-cols`

Left: language, framework, database, runtime. Right: key dependencies with one-line descriptions each.

**Slide 4: Directory Structure** — layout: `two-cols`

Left: file tree with `# purpose` annotations. Right: key directory descriptions.

**Slide 5: Architecture Overview** — layout: `default`

Mermaid `graph TB` diagram showing all major components and their connections. Add speaker note.

**Slides 6-N: Core Modules** — layout: `two-cols`

One slide per major module. Left: purpose, key files, key concepts. Right: 8-15 lines of real code with `filename=""` attribute.

Rules:
- Code must be exact copies from real files — never modify or simplify
- Add `filename="{path}"` to every code block
- If a module is complex, use two slides: Mermaid dependency diagram + code walkthrough

**Slide N+1: Request Trace** — layout: `default`

Mermaid `sequenceDiagram` showing the most important user-facing flow (login, API request, data save, etc.). Numbered flow steps below the diagram. Add speaker note.

**Slide N+2: Request Trace Code** — layout: `default`

Actual code of the request handler with line highlighting `{2,5-7}` and `filename=""`. 2-3 sentences of plain-language explanation.

**Slide N+3: Data Models** — layout: `default` (skip if not applicable)

Mermaid `classDiagram` showing key data structures and relationships. Brief explanation of key relationships.

**Slide N+4: How to Extend** — layout: `two-cols`

Left: step-by-step guides for common extensions (new endpoint, new model). Right: example code showing the pattern.

**Slide N+5: Summary** — layout: `section`

3 key takeaways. Project name and language/framework tag in bottom-left.

### Step 3.4: Verify output

After generating `slides.md`, verify:
1. Every `---` separator is correct (each slide must start with `---`)
2. Every code block has a language identifier
3. Every Mermaid block has valid syntax
4. Every `two-cols` slide has both left and right content
5. File paths in `filename=""` attributes match real files in the codebase

## Important Rules

1. **Real code only** — Never invent, simplify, or modify code. Copy exact snippets from actual files.
2. **Mermaid for every diagram** — Never use ASCII art or plain-text diagrams. Always use Mermaid.
3. **8-15 lines per code snippet** — If a function is longer, show only the most important part with a comment like `// ... (error handling omitted)`.
4. **Filename on every code block** — Always add `filename="path/to/file"` so the reader can find the source.
5. **Speaker notes on complex slides** — Add `<!-- speaker note -->` comments to slides with diagrams or complex flows.
6. **No more than 15 slides total** — Be selective. Cover the most important modules and flows. Quality over quantity.
7. **Check Mermaid syntax** — Ensure all Mermaid diagrams are valid before outputting. No unmatched brackets, missing semicolons in sequence diagrams, or invalid node shapes.

## References

- `references/package.json` — Copy to output, customize project name
- Official Slidev skill at `.agents/skills/slidev/references/` — For all Slidev syntax details
