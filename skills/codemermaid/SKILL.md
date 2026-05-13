---
name: codemermaid
description: Generates interactive multi-page HTML codebase courses with Mermaid diagrams, architecture walkthroughs, module dependency tutorials, data-flow views, state-machine views, and per-module deep dives. Use when asked to teach, map, explain, or visually tour a repository.
compatibility: Requires Node.js 18+ for validation scripts. Generated HTML uses external Mermaid and Google Fonts CDNs unless vendored by the caller.
---

# CodeMermaid

Generate a multi-page interactive HTML site that teaches a codebase as scrollable essays — Mermaid diagrams as anchors, typed pedagogical units (concept, guess-first, compare, surprise, takeaway, diagram, storyboard) carrying the lesson. Zero build tools, zero npm. Each output page is self-contained.

## When to Use

- "Generate an interactive course for this codebase"
- "Create a visual walkthrough of this project's architecture"
- "Make an interactive module dependency diagram"
- "Build a tutorial page from this codebase"

## When NOT to Use

- Slide-based presentations → use `presentation` skill (Slidev)
- Pure Markdown output → write `.md` with ````mermaid` blocks directly
- Need drag-and-drop node editing → use React Flow, not this skill

## Output

Directory: `docs/codebase/`

  index.html                    <- Entry page (perspective + module cards)
  architecture.html             <- Architecture perspective (essay)
  <perspective>.html            <- Other perspectives (essays)
  module-<name>.html            <- Per-module deep dives (essays)

Each file is fully self-contained — CSS/JS inlined at build time from `assets/`.

## Parallel Generation Mode

If subagents are available and the target repo has enough independent modules to benefit, use `references/subagent-generation.md`. The main agent remains coordinator: it owns module registry, filename registry, node ids, perspective list, index page, link graph, and final validation. Subagents may scan assigned areas, draft page data, and generate assigned `module-<name>.html` files, but they must not create unassigned files or make global architecture decisions.

## Phase 1: Scan

Read the codebase exhaustively. The goal is to discover ALL meaningful modules, not just the obvious ones.

### Step 1.1: Structural Scan

1. **Root directory** — list all top-level folders and files
2. **Source directories** — for each top-level folder, list its contents recursively (2 levels deep)
3. **Entry files** — `main.*`, `index.*`, `app.*`, `server.*`, `cmd/`, `src/`, `lib/`, `pkg/`
4. **Config files** — `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `Makefile`, `docker-compose.yml`, equivalent
5. **Framework detection** — language, framework, runtime from config and imports
6. **Test directories** — `test/`, `tests/`, `spec/`, `__tests__/`, `*_test.*`

### Step 1.2: Deep Module Discovery

For EACH source directory found above, determine if it qualifies as a module:

- A **module** is any directory or file that has a clear single responsibility
- Read the first 30 lines of every entry file to understand purpose
- Use Grep to find `import`, `require`, `use`, `from` patterns — map dependency edges
- Check `exports`, `module.exports`, `pub`, `public` — identify public interfaces

**What counts as a module:**
| Type | Examples |
|------|---------|
| Top-level source dir | `src/auth/`, `src/api/`, `src/models/` |
| Standalone config file | `tsconfig.json`, `docker-compose.yml`, `.env.example` |
| Utility/helper dir | `src/utils/`, `src/helpers/`, `src/lib/` |
| Plugin/extension dir | `plugins/`, `extensions/`, `modules/` |
| Data layer | `src/db/`, `src/store/`, `src/repositories/` |
| Build/CI config | `Makefile`, `Dockerfile`, `.github/workflows/` |
| Skill/command dir | `.agents/skills/`, `.opencode/commands/` |
| Single important file | `skills-lock.json`, `CLAUDE.md`, routing config |

**What to skip:**
- `node_modules/`, `vendor/`, `.git/`, `dist/`, `build/`, cache dirs
- Generated files, lock files (except `skills-lock.json` if meaningful)
- Test fixtures, static assets with no logic

### Step 1.3: Dependency Mapping

For every module discovered, trace its imports:

```
Module A → imports from → Module B, Module C
Module B → imports from → Module D
Module C → imports from → Module D (optional)
```

This becomes the edge list for the Mermaid graph.

Use Glob and Grep extensively. Read actual code. Do NOT guess.

## Phase 2: Analyze

From scan results:

1. **Architecture pattern** — MVC, microservices, monolith, event-driven, hexagonal, layered, etc.
2. **Data flow** — trace the primary request path entry → response, and secondary flows
3. **Module graph** — full dependency graph from Phase 1.3, identify cycles and layers
4. **Key abstractions** — interfaces, base classes, core types that define the system's vocabulary
5. **Module categorization** — group modules into layers:

| Layer | Typical Modules |
|-------|----------------|
| Entry | HTTP handlers, CLI commands, main entry points |
| Core | Business logic, domain models, services |
| Data | Database, repositories, ORM, state management |
| Infra | Config, logging, middleware, error handling |
| Output | Templates, serializers, API responses |
| DevX | Build tools, CI/CD, skills, commands |

**Prioritization:** If the codebase has more than 12 modules, organize into sub-graphs. The top-level diagram shows layers/modules. The detail panel for each module shows its internal structure.

5. **User perspective requirements** — parse user prompt for explicit perspective requests. If user says "must show data flow" or "include a sequence diagram", these are mandatory perspectives that cannot be omitted
6. **Auto-infer perspectives** — from project characteristics, select supplementary perspectives:
   - Has HTTP handlers → Data Flow perspective
   - Has database/ORM → Data Model perspective
   - Has state management → State Machine perspective
   - 10+ modules → Module Dependency perspective
   - Has CI/CD config → Build Pipeline perspective
7. **Merge perspective list** — user-specified (mandatory) + auto-inferred (supplementary), deduplicated. Architecture is always included. Every discovered module must be reachable from at least one perspective page

## Phase 3: Build Page Data

Each per-module and per-perspective page is one JS object with `learningPromise`, optional `prereqs`, optional anchor `diagram`, and a `units[]` array. Read `references/units-examples.md` for concrete patterns and `references/voice-examples.md` for tone.

### COURSE (per-module page, `module-<name>.html`)

```javascript
const COURSE = {
  module: "auth",              // required — the module identifier
  learningPromise: "...",      // required
  prereqs: ["..."],            // optional
  diagram: "graph TD ...",     // optional anchor diagram
  units: [ /* see UNIT shapes below */ ]
};
```

**Schema rule:** Module pages MUST use the property name `module` (not `name` or `title`). The validator checks for `page.module` to determine the page type.

### PERSPECTIVE (per-perspective page, e.g. `architecture.html`)

```javascript
const PERSPECTIVE = {
  perspective: "architecture", // required — the perspective identifier
  learningPromise: "...",      // required
  prereqs: ["..."],            // optional
  diagram: "graph TD ...",     // REQUIRED for perspective pages
  units: [ /* same UNIT shapes; cross-module refs are inline markdown links in body fields */ ]
};
```

**Schema rule:** Perspective pages MUST use the property name `perspective` (not `name` or `title`). The validator checks for `page.perspective` to determine the page type.

### INDEX (entry page, `index.html`)

```javascript
const INDEX = {
  project: { name, description, language, framework },
  perspectives: [{ title, description, page, unitCount }],
  modules:      [{ title, description, page, unitCount }]
};
```

### Unit kinds

```javascript
{ kind: "concept",     title, body }                                           // 60-150 words
{ kind: "guess-first", question, reveal: { code?, explanation } }              // collapsed
{ kind: "compare",     title, left: { label, code }, right: { label, code }, lesson }
{ kind: "surprise",    title, body }                                           // 1-3 sentences callout
{ kind: "takeaway",    body }                                                  // recap card
{ kind: "diagram",     title, mermaid, caption, zoomable? }                    // architecture/sequence figure; zoomable defaults true
{ kind: "storyboard",  title, caption?, scenes: [{ name, mermaid, explanation?, code?, focus? }] } // multi-scene Mermaid player with optional paired code
{ kind: "code-walk",   title, file, code, highlightLines, explanation, layout? } // single-file code with explanation (stacked, split, or stepped)
```

### Voice rules

A teacher pointing at the thing. Signposted, opinionated, comparing to familiar mental models. See `references/voice-examples.md` for flat-vs-pointed pairs the AI MUST imitate. Anti-patterns: neutral description, academic filler ("it is important to note"), passive voice ("as we can see").

### Unit quality guidelines (soft limits)

| Unit | Suggested scope |
|------|-----------------|
| `concept` | 60–150 words |
| `guess-first` | question ≤ 2 sentences, reveal ≤ 150 words |
| `compare` | ≤ 12 lines per side, lesson ≤ 80 words |
| `surprise` | 1–3 sentences |
| `takeaway` | 2–4 sentences |
| `storyboard` | 2–5 scenes, 1–3 sentences per scene |
| `code-walk` | 8–15 lines code + 50–150 words explanation |

There is **no fixed unit budget**. A module page should include as many units as needed to teach its content thoroughly. If a page exceeds ~15 units, consider splitting into sub-modules.

### Pedagogy enforcement (mandatory)

Every generated page MUST satisfy these rules. Run `node skills/codemermaid/scripts/validate-units.js path/to/page.json` after assembly; the build fails on violation:

- Every module MUST have a non-empty `learningPromise`.
- Every module's `units[]` MUST contain ≥ 1 `guess-first` OR ≥ 1 `surprise`.
- Every module's `units[]` MUST end with a `takeaway`.
- Every perspective's `units[]` MUST start with a `concept` and end with a `takeaway`.
- Storyboard units SHOULD be separated by at least one non-storyboard text unit for pacing.
- There is no hard cap on unit count or storyboard count; quality of explanation determines the length.

### Real code only

All `code` values must be **exact, unmodified copies** from real source files. This includes:
- `storyboard.scenes[].code.source`
- `code-walk.code`
- `guess-first.reveal.code`
- `compare.left.code` and `compare.right.code`

**Prohibited:**
- Inventing code that does not exist in the source
- Simplifying logic (e.g., removing a ternary, reordering statements)
- Changing prop names, variable names, or function signatures
- Adding comments that don't exist in the source
- Using `...` ellipsis to hide lines inside a snippet (use `// ...` comment only at the top level to mark elision)

**Allowed:**
- Extracting a contiguous slice of a function with `// ...` at top/bottom to show it's truncated
- Removing import statements and surrounding boilerplate to focus on the logic
- Normalizing indentation to match the snippet's context

### Code presentation rules

Keep teaching snippets tight:

- Trim leading and trailing blank lines from every `code`, `left.code`, `right.code`, and `code.source` value.
- Collapse repeated interior blank lines to one blank line.
- Prefer `// ...` or `# ...` elision comments over airy blank rows when skipping irrelevant source.
- Highlight numbers are 1-based and must match the visible line numbers **within the extracted snippet** after trimming.
- **Verification rule:** Before finalizing a page, manually count lines in every `code.source`, `left.code`, and `right.code` value. Ensure every `highlightLines` entry and every `highlights[].line` / `highlights[].lines` points to a line that actually exists in that snippet and contains meaningful code (not a blank line or closing brace alone).
- **Common pitfall:** When extracting a 15-line function from a 200-line file, the highlights must reference line numbers 1–15 (the snippet), NOT the original file's line numbers 186–200. The renderer only sees the snippet.
- Do not highlight blank separator lines; move `highlightLines` to the nearest meaningful source line.
- **Annotation-note alignment:** The note text must describe what happens on the highlighted line(s). If the note says "mergeMessage dedupes by id" but the highlighted line is `...state,`, the highlight is on the wrong line.

### Storyboard units

Use `storyboard` when the reader needs to watch a system change across 2-5 scenes. Good fits: template assembly, request lifecycle, state transitions, build pipelines, parser phases, data synchronization, and cross-file interactions. Bad fits: one static architecture overview, long prose explanations, or anything that needs arbitrary 2D canvas layout.

Use `storyboard` for multi-step sequences, state transitions, and cross-file interactions. Use `code-walk` for single-file deep dives where the lesson is about reading one focused piece of code.

Read `references/storyboard-patterns.md` before writing storyboard units. Follow the approved Variant B Cinema Strip shape: large Mermaid stage, scene strip, collapsible code drawer, and P3 aside-panel annotations.

```javascript
{
  kind: "storyboard",
  title: "How Phase 6 assembles one page",
  caption: "One output page is slot replacement plus validation.",
  scenes: [
    {
      name: "Read shell",
      mermaid: "flowchart LR\n  A[template-essay.html] --> B[slot markers]",
      explanation: "The shell owns page structure. The content is still missing."
    },
    {
      name: "Inline partials",
      mermaid: "flowchart LR\n  A[template-essay.html] --> C[output HTML]\n  B[_runtime.js] --> C",
      code: {
        file: "skills/codemermaid/SKILL.md",
        lang: "markdown",
        source: "1. Read the shell template\n2. Read the partials\n3. Inline the partials",
        highlights: [
          { line: 2, note: "Reusable CSS and JS become page-local assets." },
          { line: 3, note: "The output stays self-contained after replacement." }
        ]
      },
      explanation: "This is where reusable pieces become one file."
    }
  ]
}
```

Storyboard rules:

- `scenes.length` is 2-5. Use 3 scenes as the default.
- Every scene has a short `name` and non-empty `mermaid`.
- `explanation` is 1-3 sentences.
- `code.source` is copied from real source or from the current skill instructions. Do not invent code.
- `code.source` follows the same code presentation rules: no leading/trailing blank lines and no repeated interior blank rows.
- Use `code.highlights`, not `highlightLines`, for storyboard code.
- A single-line annotation uses `{ line, note }`.
- A multi-line annotation uses `{ lines: [start, ...end], note }`.
- Cap annotations at 5 per scene; split the scene when more are needed.
- Use Mermaid image nodes only for local paths or data URLs. Do not use remote image URLs.
- Separate consecutive storyboard units with at least one non-storyboard text unit for pacing.

### Code-walk units

Use `code-walk` for single-file deep dives. Good fits: examining a single hook, a utility function, a type definition, or one coherent block of logic. Bad fits: multi-step sequences, cross-file interactions, or state transitions (use `storyboard` for those).

```javascript
{
  kind: "code-walk",
  title: "Token check before any handler",
  file: "src/middleware/auth.ts",
  code: `export const auth: Middleware = async (c, next) => {
  const token = c.req.header('Authorization')?.slice(7);
  if (!token) { c.set('user', null); return next(); }
  try {
    const user = await verify(token);
    c.set('user', user);
  } catch {
    c.set('user', null);
  }
  return next();
};`,
  highlightLines: [3, 6, 9],
  explanation: "Watch what they do here — the token check happens before any handler runs, but they don't throw on a malformed token, they `next()` with a null user. That's the move. Downstream handlers decide whether `null user` is OK for them, instead of the middleware deciding for everyone."
}
```

Code-walk rules:

- `code` is the exact, unmodified source snippet.
- `highlightLines` uses 1-based indexing within the snippet.
- `explanation` is 1-3 sentences explaining why the highlighted lines matter.
- `layout` is optional: `stacked` (default, code above explanation), `split` (code left, explanation right), or `stepped` (scroll-synced beats). Only `code-walk` honors `layout`.

## Phase 4: Build Mermaid Graphs

Mermaid plays two roles. Never share one graph between them.

### Role 1 — Anchor diagram

The page-level `diagram` field on COURSE/PERSPECTIVE. Job: orientation, not navigation.

- ≤ 8 nodes recommended (hard cap is reader patience).
- `graph TD` for layered architecture; `graph LR` for sequential flows.
- Use `["bracket labels"]` for readable node names.
- **No `click nodeId callback` directives.** Click handling is wired by `_essay.js` via the `anchorNode` binding on units.
- Optional. Omit if the page doesn't benefit from a mini-map.

To enable scroll-linked highlighting, set `anchorNode: "<mermaidNodeId>"` on the unit(s) you want bound. The reader's scroll position drives which node lights up; tap a node to scroll back. Units without `anchorNode` are ignored.

**Node ID naming rule:** The `anchorNode` value MUST exactly match the Mermaid node ID. Use descriptive, kebab-case IDs instead of single letters:

```javascript
// ✅ Good — node IDs match anchorNode values exactly
{ kind: "concept", anchorNode: "chat-panel", title: "..." }
// diagram: 'graph TD\n  chat-panel[ChatPanel] --> message-router[MessageRouter]'

// ❌ Bad — generic IDs break scroll-link
{ kind: "concept", anchorNode: "panel", title: "..." }
// diagram: 'graph TD\n  A[ChatPanel] --> B[MessageRouter]'  // "panel" never matches "A" or "B"
```

**Enforcement:** Before writing any page, verify that every `anchorNode` value appears as a node ID in the page's `diagram`. Run this mental check: for each `anchorNode`, can I find that exact string as a node name in the Mermaid source? If not, rename the Mermaid node or the `anchorNode` value until they match.

### Role 2 — Architecture / sequence / state figure

The new `diagram` unit kind. Lives inline in `units[]`.

```javascript
{ kind: "diagram", title: "Auth handshake", mermaid: "sequenceDiagram\n  ...", caption: "...", zoomable: true }
```

- Nodes represent real components, message flows, states, dependencies — independent of reading order.
- No scroll-linking. No `anchorNode`. Just a captioned figure.
- `zoomable` defaults to `true`; set `false` only for tiny figures where zoom would be theater.
- Other diagram types fit naturally here: `sequenceDiagram` (request flow), `classDiagram` (data models), `stateDiagram-v2` (lifecycle).

### Subgraph rules (Role 1, large repos)

For 8+ modules, group into `subgraph` blocks by layer. For 15+ modules, generate multiple narrower perspectives instead of one mega-diagram.

```mermaid
graph TD
  subgraph Entry["Entry Layer"]
    E1["CLI Handler"]
    E2["HTTP Server"]
  end
  subgraph Core["Business Layer"]
    C1["Auth Service"]
  end
  E1 -->|"calls"| C1
```

### Edge labels

`-->|"label"|` describes the relationship verb (reads, triggers, registers in, imports). `-.->` for optional/indirect dependencies.

### Cross-page node IDs

The same module uses the same node ID across all pages it appears on (e.g., `auth` is `auth` everywhere).

## Phase 5: Generate Page List

| File | Shell template | Page JS partial | Data | Condition |
|------|----------------|-----------------|------|-----------|
| `index.html`            | `template-index.html` | `_index.js` | `INDEX`       | Always |
| `architecture.html`     | `template-essay.html` | `_essay.js` | `PERSPECTIVE` | Always |
| `<perspective>.html`    | `template-essay.html` | `_essay.js` | `PERSPECTIVE` | One per non-architecture perspective |
| `module-<name>.html`    | `template-essay.html` | `_essay.js` | `COURSE`      | One per discovered module |

All generated course files go in the target repo's `docs/codebase-course/`. Filenames are kebab-case except the fixed `index.html`.

Do not generate `story.html` when executing this skill for a target codebase. `story.html` is a maintainer fixture for this skill repository only; see "Maintainer story page" below.

## Phase 6: Assemble

For each page in the file list (Phase 5):

1. **Read the shell template**: `assets/template-essay.html` or `assets/template-index.html`. Styles and scripts are already inlined in the template.
2. **Read the partials**:
   - `assets/_runtime.js` (shared helpers)
   - `assets/_essay.js` OR `_index.js` (per page kind runtime)
3. **Inline the scripts** by replacing slot markers in the shell:
   - `{{COMMON_SCRIPTS}}` ← contents of `_runtime.js`
   - `{{PAGE_SCRIPTS}}` ← contents of `_essay.js` or `_index.js`
4. **Fill page-specific slots** (see below).
5. **Pre-flight verification** (mandatory — do not skip):
   - [ ] Every `anchorNode` value appears as a node ID in the page's `diagram`
   - [ ] Every `highlightLines` / `highlights[].line` points to an existing, non-blank line in its snippet
   - [ ] Every code snippet is an exact copy from source (no invented lines, no reordered statements)
   - [ ] No `href="#"` placeholders — all back/next links point to real files
   - [ ] No `**bold**` markdown — use `<strong></strong>` instead
   - [ ] `module` pages use `module: "name"`; `perspective` pages use `perspective: "name"`
   - [ ] Mermaid diagrams contain no references to undefined nodes (e.g., `style A` when `A` is not declared)
6. **Validate** by piping the page-data object as JSON to `node skills/codemermaid/scripts/validate-units.js -`. Abort the build on failure.
7. **Write** the resolved HTML to `docs/codebase-course/<filename>.html`.

Every emitted HTML is fully self-contained — all CSS is baked into the template, and JS partials are inlined at assembly time. No external stylesheets or runtime asset loading.

## Maintainer story page

This skill repository keeps a local component fixture at `tests/story.html`. It is for maintaining and testing the `codemermaid` renderer itself, not for normal skill execution against a user's codebase.

Maintainer-only sources:

- `tests/fixtures/template-story.html` — shell for the maintainer story page.
- `tests/fixtures/story-page-data.json` — stable fixture data covering major unit kinds and interaction states.
- `assets/_runtime.js`, `_essay.js` — shared renderer partials inlined at assembly time.

Use the story page when editing renderer UI, interaction behavior, or shared visual rules. It should expose stable `data-story-id` selectors for future e2e tests. Update `tests/fixtures/story-page-data.json` whenever adding a unit kind, interaction state, or reusable visual rule. Keep this fixture in the `supermario` repo; do not copy it into generated target-codebase output unless explicitly doing maintainer QA.

### Page-specific slots — `template-essay.html`

| Slot | Source |
|------|--------|
| `{{PROJECT_NAME}}` | from Phase 1 |
| `{{PAGE_TITLE}}` | perspective title or module name |
| `{{LEARNING_PROMISE}}` | `page.learningPromise` |
| `{{LEARNING_PROMISE_RECAP}}` | shorter restatement of the promise (≤ 1 sentence) |
| `{{PREREQ_CHIPS}}` | `page.prereqs.map(p => '<li>' + p + '</li>').join('')` |
| `{{BACK_LINK}}` | `index.html` |
| `{{BACK_LABEL}}` | `Index` |
| `{{NEXT_LINK}}` | next page in reading order, or `index.html` |
| `{{NEXT_LABEL}}` | name of the next page |
| `{{PAGE_DATA}}` | the COURSE or PERSPECTIVE object as a valid JS literal (NOT a JSON string) |

**Link completeness rule:** `{{BACK_LINK}}` and `{{NEXT_LINK}}` must always point to an existing HTML file in the output directory. Never use `#` or empty string as a placeholder. If the page is the first or last in the sequence, link back to `index.html`.

**Markdown support note:** The renderer only supports `[label](href)` link syntax. `**bold**`, `*italic*`, and other Markdown features are NOT supported in body text. Use HTML tags (`<strong>`, `<em>`) if formatting is needed, or rely on the CSS styling of unit kinds (concept, surprise, takeaway already have distinct visual treatment).

### Page-specific slots — `template-index.html`

| Slot | Source |
|------|--------|
| `{{PROJECT_NAME}}` | from Phase 1 |
| `{{PROJECT_DESCRIPTION}}` | one-line description |
| `{{LANGUAGE}}` | from Phase 1 |
| `{{FRAMEWORK}}` | `<span class="badge">Next.js</span>` or empty string |
| `{{INDEX_DATA}}` | the INDEX object as a valid JS literal |

## Design System

Built-in Raycast-inspired dark theme. For the full design reference (CSS variables, typography, shadows, colors, spacing), read `references/design-system.md` and `references/DESIGN.md`.

## Important Rules

1. **Real code only** — never invent, simplify, or modify code snippets.
2. **Cover every module** — every module discovered in Phase 1 must appear in at least one perspective page AND have its own `module-<name>.html`.
3. **Self-contained output** — each emitted HTML has all CSS baked into the template and JS inlined at assembly time. No external stylesheets or runtime asset loading.
4. **Vanilla JS only** — no React, no build tools.
5. **No Mermaid click directives** on essay pages. Anchor-diagram navigation comes from `_essay.js` reading `anchorNode` bindings on units.
6. **Validate before writing** — `node scripts/validate-units.js` must pass for every page.
7. **Test in browser** — open each generated `.html` and verify scroll-link, stepped-walk, and zoom interactions.
8. **Consistent node IDs** — same module = same node ID across all pages.
9. **User perspective overrides** — user-specified perspectives are mandatory; auto-inferred are supplementary.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Anchor highlight doesn't migrate | Check unit has `anchorNode` matching a node ID in the page's `diagram`. Use descriptive IDs (e.g., `chat-panel`) instead of single letters (`A`, `B`). |
| Highlight points to blank line or wrong logic | Count lines within the extracted snippet, not the original source file. The note must describe what happens on the highlighted line. |
| Code snippet has invented or reordered lines | Paste the snippet back into a temp file and run the type checker. If it fails, you modified the source. |
| `style A` in Mermaid but node `A` is undefined | Every node referenced in `style`, `class`, or `click` must be declared in the diagram body. |
| `href="#"` in back/next links | Replace with actual relative paths (`./index.html`, `./module-foo.html`). Never leave placeholder links. |
| `**bold**` renders as literal asterisks | The renderer only supports `[label](href)` links. Use `<strong>text</strong>` for bold. |
| PAGE uses `name` or `title` instead of `module`/`perspective` | Module pages MUST use `module: "..."`. Perspective pages MUST use `perspective: "..."`. The validator relies on this. |
| Zoomed Mermaid SVG looks blurry | Ensure template CSS has NO `will-change: transform` on `.zoom-stage`; keep `shape-rendering: geometricPrecision` |
| Zoom opens to empty stage | SVG clone must get explicit `width`/`height` attributes from `getBoundingClientRect()` of the source |
| Validator fails on a module | Read the error — usually missing `guess-first`/`surprise`, missing trailing `takeaway`, or too many storyboards |
| Storyboard drawer feels noisy | Use fewer annotations, cap at 5 notes per scene, and split crowded scenes into two smaller scenes |
| Storyboard image fails validation | Mermaid image nodes must use local paths or data URLs, never remote URLs |
| Code block unreadable | Template CSS sets `font-family: Geist Mono, line-height: 1.7` on `pre.code-block` |
| Cross-module link in body doesn't render | Use markdown link syntax `[label](module-foo.html)`; `renderMarkdownLinks()` parses it |

## File Organization

```
skills/codemermaid/
  SKILL.md                            # This file (6-phase workflow)
  references/
    design-system.md                  # CSS/typography/shadow reference
    storyboard-patterns.md            # Mermaid storyboard patterns and annotation rules
    subagent-generation.md            # Optional parallel generation protocol
    units-examples.md                 # 2-3 examples per unit kind
    voice-examples.md                 # Flat-vs-pointed prose pairs
  assets/
    template-essay.html               # Shell for perspective and module pages (styles inlined)
    template-index.html               # Shell for the entry page (styles inlined)
    _runtime.js                       # Shared Mermaid init, markdown link parser, helpers
    _essay.js                         # Scroll-link, storyboard player, zoom controls
    _index.js                         # Index runtime (currently minimal)
  scripts/
    validate-units.js                 # Pedagogy enforcement
  tests/
    render-essay.test.js              # Renderer and maintainer story tests
    validate-units.test.js            # Tests for the validator
    fixtures/
      template-story.html             # Maintainer story shell, not normal output
      story-page-data.json            # Maintainer story component fixture
```

## Relationship to Other Skills

- **presentation** — Slidev-based slides (slide deck). Use `codemermaid` for interactive exploration, `presentation` for linear slide-based talks.
- **Slidev skill** — Syntax reference for Slidev. `codemermaid` does NOT use Slidev.
