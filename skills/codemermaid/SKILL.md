---
name: codemermaid
description: Generates interactive multi-page HTML codebase courses with raw SVG diagrams, architecture walkthroughs, module dependency tutorials, data-flow views, and per-module deep dives. Use when asked to teach, map, explain, or visually tour a repository.
compatibility: Generated HTML uses Google Fonts CDN (Inter + Geist Mono). Zero npm, zero mermaid.js, zero build tools.
---

# CodeMermaid v2

Generate a multi-page interactive HTML site that teaches a codebase as scrollable essays — raw SVG diagrams, typed pedagogical units (concept, quiz, takeaway, diagram, code-walk, code-graph) carrying the lesson. Zero build tools, zero npm, zero external JS libraries. Each output page is self-contained with all CSS/JS/SVG inlined.

## When to Use

- "Generate an interactive course for this codebase"
- "Create a visual walkthrough of this project's architecture"
- "Make an interactive module dependency diagram"
- "Build a tutorial page from this codebase"

## When NOT to Use

- Slide-based presentations → use `presentation` skill (Slidev)
- Pure Markdown output → write `.md` directly
- Need drag-and-drop node editing → use React Flow, not this skill

## Output

Directory: `docs/codebase-course/`

```
index.html                    <- Entry page (perspective + module cards)
architecture.html             <- Architecture perspective (essay)
<perspective>.html            <- Other perspectives (essays)
module-<name>.html            <- Per-module deep dives (essays)
```

Each file is fully self-contained — all CSS from `assets/style.css` and JS from `assets/runtime.js` are inlined directly into the HTML. All diagrams are raw SVG inline. No external JS libraries.

## Parallel Generation Mode

If subagents are available and the target repo has enough independent modules to benefit, use `references/subagent-generation.md`. The main agent remains coordinator: it owns module registry, filename registry, perspective list, index page, link graph, and final validation. Subagents may scan assigned areas, draft page content, and generate assigned `module-<name>.html` files, but they must not create unassigned files or make global architecture decisions.

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

This becomes the edge list for SVG diagrams. Use Glob and Grep extensively. Read actual code. Do NOT guess.

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

**Prioritization:** If the codebase has more than 12 modules, organize into sub-graphs.

6. **User perspective requirements** — parse user prompt for explicit perspective requests
7. **Auto-infer perspectives** — from project characteristics:
   - Has HTTP handlers → Data Flow perspective
   - Has database/ORM → Data Model perspective
   - Has state management → State Machine perspective
   - 10+ modules → Module Dependency perspective
   - Has CI/CD config → Build Pipeline perspective
8. **Merge perspective list** — user-specified (mandatory) + auto-inferred (supplementary), deduplicated. Architecture is always included. Every discovered module must be reachable from at least one perspective page

## Phase 3: Build Page Data

Each per-module and per-perspective page has a `learningPromise`, optional `prereqs`, and a `units[]` array. Read `references/units-examples.md` for concrete patterns and `references/voice-examples.md` for tone.

### COURSE (per-module page, `module-<name>.html`)

```javascript
const COURSE = {
  module: "auth",
  learningPromise: "...",
  prereqs: ["..."],
  units: []
};
```

### PERSPECTIVE (per-perspective page, e.g. `architecture.html`)

```javascript
const PERSPECTIVE = {
  perspective: "architecture",
  learningPromise: "...",
  prereqs: ["..."],
  units: []
};
```

### INDEX (entry page, `index.html`)

```javascript
const INDEX = {
  project: { name, description, language, framework },
  perspectives: [{ title, description, page, unitCount }],
  modules:      [{ title, description, page, unitCount }]
};
```

### Unit kinds (6 types)

```javascript
{ kind: "concept",     title, body, style? }                          // style: "callout" for surprise-style red border
{ kind: "quiz",        question, options: [{letter, text, correct}], explanation }
{ kind: "takeaway",    body }
{ kind: "diagram",     title, svg, caption, zoomable? }               // raw SVG, zoomable defaults true
{ kind: "code-walk",   title, file, code, highlights: [{line, note}], layout? }  // layout defaults "split"
{ kind: "code-graph",  title, file, code, highlights: [{line, note, graphNode?}], svg }  // left code, right mini graph
```

### Voice rules

A teacher pointing at the thing. Signposted, opinionated, comparing to familiar mental models. See `references/voice-examples.md` for flat-vs-pointed pairs the AI MUST imitate. Anti-patterns: neutral description, academic filler ("it is important to note"), passive voice ("as we can see").

### Unit quality guidelines (soft limits)

| Unit | Suggested scope |
|------|-----------------|
| `concept` | 60–150 words |
| `quiz` | question ≤ 2 sentences, 4 options, explanation ≤ 100 words |
| `takeaway` | 2–4 sentences |
| `diagram` | ≤ 8 nodes, caption ≤ 40 words |
| `code-walk` | 8–15 lines code + 3–5 annotations |
| `code-graph` | 8–15 lines code + mini SVG (4–6 nodes) |

There is **no fixed unit budget**. A module page should include as many units as needed to teach its content thoroughly. If a page exceeds ~15 units, consider splitting into sub-modules.

### Pedagogy enforcement (mandatory)

Every generated page MUST satisfy these rules:

- Every module MUST have a non-empty `learningPromise`.
- Every module's `units[]` MUST contain ≥ 1 `quiz`.
- Every module's `units[]` MUST end with a `takeaway`.
- Every perspective's `units[]` MUST start with a `concept` and end with a `takeaway`.
- There is no hard cap on unit count; quality of explanation determines the length.

### Real code only

All `code` values must be **exact, unmodified copies** from real source files. This includes:
- `code-walk.code`
- `code-graph.code`

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

- Trim leading and trailing blank lines from every `code` value.
- Collapse repeated interior blank lines to one blank line.
- Prefer `// ...` or `# ...` elision comments over airy blank rows when skipping irrelevant source.
- Highlight numbers are 1-based and must match the visible line numbers **within the extracted snippet** after trimming.
- **Verification rule:** Before finalizing a page, manually count lines in every `code` value. Ensure every `highlights[].line` points to a line that actually exists in that snippet and contains meaningful code.
- **Common pitfall:** When extracting a 15-line function from a 200-line file, the highlights must reference line numbers 1–15 (the snippet), NOT the original file's line numbers 186–200.
- Do not highlight blank separator lines; move highlights to the nearest meaningful source line.
- **Annotation-note alignment:** The note text must describe what happens on the highlighted line(s). If the note says "mergeMessage dedupes by id" but the highlighted line is `...state,`, the highlight is on the wrong line.

### Concept units

```javascript
{ kind: "concept", title: "Token extraction", body: "This middleware extracts the Bearer token from the Authorization header..." }
```

For surprising or counter-intuitive content, add `style: "callout"`:

```javascript
{ kind: "concept", title: "This middleware doesn't throw", body: "Most auth middleware throws 401 on invalid tokens. This one doesn't...", style: "callout" }
```

Callout concepts render with a red border (`unit-surprise` class) — visually distinct from normal concepts.

### Quiz units

```javascript
{
  kind: "quiz",
  question: "When the token is invalid (expired/bad signature), what does this middleware do?",
  options: [
    { letter: "A", text: "Throws a 401 Unauthorized error", correct: false },
    { letter: "B", text: "Sets user to null and continues", correct: true },
    { letter: "C", text: "Redirects to the login page", correct: false },
    { letter: "D", text: "Returns an empty response", correct: false }
  ],
  explanation: "The middleware sets c.set('user', null) in the catch block, then next(). It doesn't throw, redirect, or stop the request."
}
```

Quiz rules:
- Exactly 4 options.
- Exactly 1 option has `correct: true`.
- `explanation` is shown after answering, regardless of correctness.
- `letter` is A, B, C, D.

### Diagram units

```javascript
{
  kind: "diagram",
  title: "Request flow path",
  svg: '<svg viewBox="0 0 580 120" ...>...</svg>',
  caption: "Request flows from Client through Auth MW to Handler. Auth MW annotates, doesn't block.",
  zoomable: true
}
```

Diagram rules:
- `svg` is raw SVG markup. Read `references/svg-patterns.md` for templates.
- `zoomable` defaults to `true`.
- Nodes represent real components. Use descriptive kebab-case `data-node-id` attributes.
- `caption` is 1-2 sentences.

### Code-walk units

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
  highlights: [
    { line: 2, note: "Optional chaining — no crash if header is missing." },
    { line: 5, note: "verify() throws on malformed tokens — caught below." },
    { line: 8, note: "Does NOT throw — sets null user, continues. Downstream decides." }
  ],
  layout: "split"
}
```

Code-walk rules:
- `layout` defaults to `split` (code left, annotations right). `stacked` is alternative.
- `highlights` is an array of `{ line, note }` objects. Line is 1-based within the snippet.
- `code` is the exact, unmodified source snippet.

### Code-graph units

```javascript
{
  kind: "code-graph",
  title: "auth in the call chain",
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
  highlights: [
    { line: 2, note: "Extracts token from header.", graphNode: "auth-mw" },
    { line: 5, note: "Calls verify() to validate JWT.", graphNode: "verify" },
    { line: 10, note: "Calls next() to continue.", graphNode: "next" }
  ],
  svg: '<svg viewBox="0 0 280 200" ...>...</svg>'
}
```

Code-graph rules:
- Same as code-walk, plus a `svg` field containing a mini call-graph SVG.
- `highlights[].graphNode` maps a code line to a SVG node `data-node-id`.
- The runtime syncs highlights: clicking a code line highlights the SVG node, clicking a SVG node highlights the code line.
- SVG should have 4-6 nodes showing the function's position in the call chain.

## Phase 4: Build SVG Diagrams

All diagrams are raw SVG. Read `references/svg-patterns.md` for node/edge templates and design tokens.

Key rules:
- Every node is a `<g class="node" data-node-id="...">` with `<rect>` + `<text>`.
- Edges are `<line>` or `<path>` with `marker-end="url(#arrowhead)"`.
- Use `<defs><marker id="arrowhead">...</marker></defs>` once per SVG.
- Design tokens: node fill `#161718`, stroke `#252829`, text `#f9f9f9`, active `#FF6363`, edge `#9c9c9d`.
- Auto-size viewBox to content + 40px padding.
- `shape-rendering: geometricPrecision` on root `<svg>`.
- Cross-page: same module = same node ID everywhere.

## Phase 5: Generate Page List

| File | Skeleton | Condition |
|------|----------|-----------|
| `index.html`            | `skeleton-index.html` | Always |
| `architecture.html`     | `skeleton-essay.html` | Always |
| `<perspective>.html`    | `skeleton-essay.html` | One per non-architecture perspective |
| `module-<name>.html`    | `skeleton-essay.html` | One per discovered module |

All generated course files go in `docs/codebase-course/`. Filenames are kebab-case except the fixed `index.html`.

## Phase 6: Write HTML Pages

For each page in the file list (Phase 5):

### Assembly process

1. **Read the skeleton template**: `assets/skeleton-essay.html` or `assets/skeleton-index.html`
2. **Read `assets/style.css`** and replace `/* STYLE_INLINE */` with its full contents
3. **Read `assets/runtime.js`** and replace `/* RUNTIME_INLINE */` with its full contents
4. **Generate content HTML** for each `<!-- SLOT:... -->` marker (see below)
5. **Replace all slots** with their content HTML
6. **Pre-flight verification** (mandatory — do not skip):
   - [ ] Every `highlights[].line` points to an existing, non-blank line in its snippet
   - [ ] Every code snippet is an exact copy from source (no invented lines, no reordered statements)
   - [ ] No `href="#"` placeholders — all back/next links point to real files
   - [ ] No `**bold**` markdown — use `<strong></strong>` instead
   - [ ] SVG diagrams contain no broken references
   - [ ] Inside `<pre class="code-block">`, `.line` spans are adjacent with NO whitespace between them
   - [ ] Quiz has exactly 1 option with `data-correct="true"`
7. **Dispatch a subagent reviewer** to validate the generated HTML
8. **Write** the completed HTML to `docs/codebase-course/<filename>.html`

### Essay page slots

**`<!-- SLOT:HERO -->`:**
```html
<section class="hero">
  <div class="eyebrow">{PROJECT_NAME}</div>
  <h1>{PAGE_TITLE}</h1>
  <p class="learning-promise">{LEARNING_PROMISE}</p>
  <ul class="prereqs">{PREREQ_CHIPS}</ul>
</section>
```

**`<!-- SLOT:TOC -->`:**
```html
<nav class="toc">
  <div class="toc-label">On this page</div>
  <ol class="toc-list">
    <li><a class="toc-item" href="#unit-0"><span class="toc-num">1</span>{TITLE}<span class="toc-kind">{KIND}</span></a></li>
    <!-- one per unit -->
  </ol>
</nav>
```

**`<!-- SLOT:UNITS -->`:** One `<section>` per unit:
```html
<section class="unit unit-{KIND}" id="unit-{INDEX}">
  <!-- unit content HTML -->
</section>
```

**`<!-- SLOT:FOOTER -->`:**
```html
<footer class="page-footer">
  <a class="next-link" href="{NEXT_LINK}">{NEXT_LABEL} →</a>
  <p class="recap">{LEARNING_PROMISE_RECAP}</p>
</footer>
```

### Unit HTML templates

**concept (normal):**
```html
<span class="unit-kind">concept</span>
<h2>{TITLE}</h2>
<p>{BODY}</p>
```

**concept (callout/surprise style):**
```html
<div class="unit-surprise">
<span class="unit-kind">concept</span>
<h2>{TITLE}</h2>
<p>{BODY}</p>
</div>
```

**quiz:**
```html
<div class="quiz">
  <div class="quiz-question">{QUESTION}</div>
  <div class="quiz-options">
    <div class="quiz-option" data-correct="true"><span class="quiz-option-letter">A</span><span>{TEXT}</span></div>
    <div class="quiz-option" data-correct="false"><span class="quiz-option-letter">B</span><span>{TEXT}</span></div>
    <div class="quiz-option" data-correct="false"><span class="quiz-option-letter">C</span><span>{TEXT}</span></div>
    <div class="quiz-option" data-correct="false"><span class="quiz-option-letter">D</span><span>{TEXT}</span></div>
  </div>
  <div class="quiz-explanation"><strong>Correct: {LETTER}</strong> — {EXPLANATION}</div>
</div>
```

**takeaway:**
```html
<div class="unit-takeaway">
<span class="unit-kind">takeaway</span>
<p>{BODY}</p>
</div>
```

**diagram:**
```html
<figure class="figure">
  {ZOOMABLE ? '<button class="zoom-btn" data-zoom-trigger>Zoom</button>' : ''}
  <div class="figure-diagram">{SVG}</div>
  <figcaption>{CAPTION}</figcaption>
</figure>
```

**code-walk (split layout):**
```html
<div class="codewalk-split">
  <div class="codewalk-head"><span>{FILE}</span><span>{LANG}</span></div>
  <div class="codewalk-split-body">
    <pre class="code-block">{LINES}</pre>
    <div class="codewalk-annotations">{ANNOTATIONS}</div>
  </div>
</div>
```

Each line: `<span class="line{? line-hl}" data-line="{N}"><span class="ln">{N}</span><span class="code-text">{CODE}</span></span>`

**CRITICAL:** `.line` spans inside `<pre>` MUST be adjacent with NO whitespace (newlines, spaces) between them.

Each annotation: `<div class="codewalk-annotation" data-note-lines="{LINES}"><span class="annotation-line">L{N}</span><p>{NOTE}</p></div>`

**code-graph:**
```html
<div class="codegraph-split">
  <div class="codewalk-head"><span>{FILE}</span><span>{LANG}</span></div>
  <div class="codegraph-split-body">
    <pre class="code-block">{LINES with data-graph-node}</pre>
    <div class="codegraph-graph">{SVG}</div>
  </div>
</div>
```

Code lines with graph binding: `<span class="line{? line-hl}" data-line="{N}" data-graph-node="{NODE_ID}"><span class="ln">{N}</span><span class="code-text">{CODE}</span></span>`

### Index page slots

**`<!-- SLOT:INDEX_HEADER -->`:**
```html
<div class="project-header">
  <h1>{PROJECT_NAME}</h1>
  <p>{PROJECT_DESCRIPTION}</p>
  <div class="badges">
    <span class="badge">{LANGUAGE}</span>
    {FRAMEWORK_BADGE}
  </div>
</div>
```

**`<!-- SLOT:PERSPECTIVE_CARDS -->`:**
```html
<div class="section">
  <div class="section-title">Perspectives</div>
  <div class="card-grid">
    <a class="card" href="{PAGE}"><span class="card-type">perspective</span><h3>{TITLE}</h3><p>{DESCRIPTION}</p><div class="card-meta">{N} units</div></a>
  </div>
</div>
```

**`<!-- SLOT:MODULE_CARDS -->`:**
```html
<div class="section">
  <div class="section-title">Module Deep Dives</div>
  <div class="card-grid">
    <a class="card" href="module-{NAME}.html"><span class="card-type">module</span><h3>{TITLE}</h3><p>{DESCRIPTION}</p><div class="card-meta">{N} units</div></a>
  </div>
</div>
```

## Design System

Built-in Raycast-inspired dark theme. The full design system lives in `assets/style.css` — CSS variables, typography, shadows, colors, spacing. Read `references/design-system.md` and `references/DESIGN.md` for rationale.

## Important Rules

1. **Real code only** — never invent, simplify, or modify code snippets.
2. **Cover every module** — every module discovered in Phase 1 must appear in at least one perspective page AND have its own `module-<name>.html`.
3. **Self-contained output** — each emitted HTML has all CSS and JS inlined. No external stylesheets or JS libraries.
4. **Vanilla JS only** — no React, no build tools.
5. **No external JS libraries** — no mermaid.js, no React. All diagrams are raw SVG.
6. **Pre whitespace rule** — inside `<pre class="code-block">`, `.line` spans must be adjacent with NO whitespace between them.
7. **Quiz correctness** — every quiz must have exactly 1 option with `data-correct="true"`.
8. **Consistent node IDs** — same module = same node ID across all pages.
9. **User perspective overrides** — user-specified perspectives are mandatory; auto-inferred are supplementary.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Blank lines between code lines | `.line` spans inside `<pre>` must be adjacent — no newlines or spaces between them. |
| Highlight points to wrong line | Count lines within the extracted snippet, not the original source file. |
| Code snippet has invented lines | Paste the snippet back into a temp file and run the type checker. |
| `href="#"` in links | Replace with actual relative paths. Never leave placeholder links. |
| SVG node text overflows rect | Ensure rect width accommodates text length + 24px padding per side. |
| Side-by-side code looks cramped | Ensure `grid-template-columns: minmax(0, 1fr) 300px` is applied. |
| Quiz has no correct answer | Exactly 1 option must have `data-correct="true"`. |
| Zoomed SVG looks blurry | Keep `shape-rendering: geometricPrecision` on root `<svg>`. |

## File Organization

```
skills/codemermaid/
  SKILL.md                            # This file (6-phase workflow)
  references/
    design-system.md                  # CSS/typography/shadow reference
    DESIGN.md                         # Design rationale
    svg-patterns.md                   # SVG diagram patterns and node/edge templates
    subagent-generation.md            # Optional parallel generation protocol
    units-examples.md                 # 2-3 examples per unit kind
    voice-examples.md                 # Flat-vs-pointed prose pairs
  assets/
    skeleton-essay.html               # Minimal shell for essay pages (HTML comment slots)
    skeleton-index.html               # Minimal shell for index page
    style.css                         # Full design system CSS (inlined per page)
    runtime.js                        # Minimal runtime: TOC, quiz, annotations, zoom
  tests/
    fixtures/
      test-page-v2.html               # Visual test page exercising all unit types
```

## Relationship to Other Skills

- **presentation** — Slidev-based slides (slide deck). Use `codemermaid` for interactive exploration, `presentation` for linear slide-based talks.
- **codebase-to-course** — single-page HTML course. Use `codemermaid` for multi-page interactive sites, `codebase-to-course` for single-page courses.
