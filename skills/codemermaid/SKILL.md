---
name: codemermaid
description: Generates interactive multi-page HTML codebase courses with Mermaid.js diagrams, architecture walkthroughs, module dependency tutorials, data-flow views, and per-module deep dives. Use when asked to teach, map, explain, or visually tour a repository.
compatibility: "Generated HTML uses Google Fonts CDN (Inter + Geist Mono) and the bundled beautiful-mermaid browser renderer. Zero npm, zero build tools. CSS, runtime JS, and diagram bundle are linked (not inlined)."
---

# CodeMermaid

Generate a multi-page interactive HTML site that teaches a codebase as scrollable essays — architecture views, default Build-Up walkthroughs, beautiful-mermaid diagrams, typed pedagogical units (concept, quiz, takeaway, diagram, code-walk, code-graph, whoa) carrying the lesson. Zero build tools, zero npm. Each output page links shared CSS, runtime JS, and the beautiful-mermaid browser bundle; diagrams render client-side with Raycast dark theming.

## When to Use

- "Generate an interactive course for this codebase"
- "Create a visual walkthrough of this project's architecture"
- "Make an interactive module dependency diagram"
- "Build a tutorial page from this codebase"

## Output

Directory: `docs/codemermaid/`

```
style.css                     <- Copied from assets/style.css
runtime.js                    <- Copied from assets/runtime.js
index.html                    <- Entry page (perspective + module cards)
architecture.html             <- Architecture perspective (essay, always generated)
build-up.html                 <- Build-Up Walkthrough perspective (essay, always generated)
<perspective>.html            <- Other user-requested or auto-inferred perspectives (essays)
module-<name>.html            <- Per-module deep dives (essays, optional module-level Build-Up when useful)
```

Each HTML page links `style.css`, `runtime.js`, `beautiful-mermaid.bundle.js`, and `mermaid-bridge.js` via `<link>` and `<script src>`. Diagrams use Mermaid.js syntax rendered via the beautiful-mermaid browser bundle. The assembly process copies these assets from `assets/` to the output directory alongside the HTML files.

## Parallel Generation Mode

If subagents are available and the repo has enough independent modules, read `references/subagent-generation.md` before dispatching work.

The main agent remains coordinator and owns the module registry, filename registry, perspective list, index page, link graph, and final validation. Subagents may only work inside assigned scopes.

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

This becomes the edge list for Mermaid diagrams. Use Glob and Grep extensively. Read actual code. Do NOT guess.

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

6. **Default perspective requirements** — Architecture and Build-Up are always included. `architecture.html` gives the finished-system map; `build-up.html` gives the gradual learning route from smallest useful capability to complete system.
7. **User perspective requirements** — parse user prompt for explicit perspective requests. User-requested perspectives are mandatory.
8. **Auto-infer perspectives** — from project characteristics:
   - Has HTTP handlers, WebSocket, or event streams → Data Flow perspective
   - Has database/ORM → Data Model perspective
   - Has state management → State Machine perspective
   - 10+ modules → Module Dependency perspective
   - Has CI/CD config → Build Pipeline perspective
9. **Merge perspective list** — default + user-specified + auto-inferred, deduplicated. Recommended index order: Architecture Overview, Build-Up Walkthrough, then user-requested and auto-inferred perspectives. Every discovered module must be reachable from at least one perspective page.
10. **Derive Build-Up route** — before drafting `build-up.html`, read `references/build-up.md` and choose a reader-comprehension order from discovered modules and dependency evidence.

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

Module pages may include a module-level Build-Up section when the module has a natural internal progression. This section is optional; read `references/build-up.md` before adding one.

### PERSPECTIVE (per-perspective page, e.g. `architecture.html`)

```javascript
const PERSPECTIVE = {
  perspective: "architecture",
  learningPromise: "...",
  prereqs: ["..."],
  units: []
};
```

### BUILD_UP (default perspective page, `build-up.html`)

Build-Up is a required perspective. Before drafting it, read `references/build-up.md` for route design, capability increments, examples, module-level Build-Up criteria, and Mermaid/code pairing rules.

### INDEX (entry page, `index.html`)

```javascript
const INDEX = {
  project: { name, description, language, framework },
  perspectives: [{ title, description, page, unitCount }],
  modules:      [{ title, description, page, unitCount }]
};
```

### Unit kinds (7 types)

```javascript
{ kind: "concept",     title, body, style? }                          // style: "callout" for surprise-style red border
{ kind: "quiz",        question, options: [{letter, text, correct}], explanation }
{ kind: "takeaway",    body }
{ kind: "diagram",     title, mermaid, caption, zoomable? }               // Mermaid syntax, zoomable defaults true
{ kind: "code-walk",   title, file, startLine?, code, highlights: [{line, note}], layout? }  // layout defaults "split"
{ kind: "code-graph",  title, file, startLine?, code, highlights: [{line, note, graphNode?}], svg }  // left code, right mini graph
{ kind: "whoa",        angle, title, body, evidence? }                    // angle: "code" | "product" | "ux" | "architecture"
```

### Whoa unit rules

Use `whoa` only for rare design moments with strong evidence that explains why the project is unusually well-designed. Use zero `whoa` units when there is no strong evidence. When evidence exists, a normal course should stay around 3-5 `whoa` units total across all pages.

Required fields:

- `angle`: one of `code`, `product`, `ux`, or `architecture`.
- `title`: a concrete statement of the design win.
- `body`: explains the constraint, why the design is strong, and what would be worse without it.

Optional `evidence` fields:

```javascript
{
  files?: string[],
  modules?: string[],
  interactions?: string[],
  constraints?: string[]
}
```

Use one visual treatment for every angle. `angle` changes the label and placement, not the color palette.

### Voice rules

Before writing generated prose, read `references/voice-examples.md`. Follow that file for voice, signposts, anti-patterns, and rewrite recipes.

### Code explanation depth (mandatory — do not skimp)

Every piece of code shown to the reader MUST be thoroughly explained. This is the core value of the course — the reader is here to understand code they couldn't read on their own.

**concept units** before a code-walk must explain:
- What the module/function does and why it exists (its role in the system)
- What pattern or tradeoff is at play (why this approach over alternatives)
- Any non-obvious context the reader needs before seeing the code

**code-walk highlights[].note** must explain:
- What the highlighted line does (not just restate the code — explain the *why*)
- How it connects to the surrounding logic (data flow, control flow, side effects)
- Any implicit behavior not visible in the code (e.g., "this returns null because the upstream function hasn't resolved yet")
- Non-trivial API usage (e.g., "Array.from creates a shallow copy — we do this because the NodeList returned by querySelectorAll is live, meaning it updates when the DOM changes")

**diagram captions** must explain:
- What the diagram shows and why that flow/structure matters
- Where the interesting part is (not just "this is the architecture")

**quiz explanations** must explain:
- Why the correct answer is correct (with specific code evidence)
- Why each wrong answer is wrong (briefly)

**ANTI-PATTERN: Lazy notes.** The following are banned:
- Notes that restate the code: `note: "Calls verify() on line 3"` when the code says `const user = await verify(token)`
- Notes that say "see above" or "as mentioned earlier" without re-explaining
- Concept bodies that say "this module handles X" without explaining *how* or *why*
- Captions that say "Module dependency diagram" without saying what's interesting about the dependencies

**GOOD example:**
```
{ line: 5, note: "verify() is async because it makes a network call to the JWT issuer's .well-known/jwks.json endpoint. The await here means the middleware pauses — no downstream handler runs until this resolves. That's fine for auth, but it means every request pays this latency cost, even for public endpoints that don't need auth." }
```

**BAD example:**
```
{ line: 5, note: "Calls verify() to validate the JWT token." }
```

### Unit quality guidelines (soft limits)

Prefer depth over brevity. These are upper bounds, not targets — write as much as needed to truly explain the code.

| Unit | Suggested scope |
|------|-----------------|
| `concept` | 80–200 words — must explain *why*, not just *what* |
| `quiz` | question ≤ 2 sentences, 4 options, explanation ≤ 100 words — must reference specific code |
| `takeaway` | 3–5 sentences — must synthesize, not just repeat |
| `diagram` | ≤ 8 nodes, caption 20–50 words — must say what's interesting, not just what it shows |
| `code-walk` | 8–20 lines code + 3–6 annotations — each note must explain the reasoning, not just restate what the code says |
| `code-graph` | 8–15 lines code + mini SVG (4–6 nodes) — same depth as code-walk for annotations |

**Rule of thumb:** If you can remove an annotation note and the reader loses no understanding, the note wasn't detailed enough — rewrite it, don't remove it.

There is **no fixed unit budget**. A module page should include as many units as needed to teach its content thoroughly. If a page exceeds ~15 units, consider splitting into sub-modules.

### Code-walk density (mandatory)

Code-walk is the primary teaching unit — it shows real code with line-by-line explanation. A module page exists to teach the reader the module's code. If the reader finishes a module page without seeing most of its core source code, the page has failed.

**Rules:**

- Every core source file in a module MUST have at least one `code-walk`. A core file is one that defines the module's primary export, public interface, or contains non-trivial logic (not just re-exports or type definitions).
- Every `diagram` unit on any page (perspective or module) shows edges/arrows representing real data flow or calls. The code that implements each edge MUST appear in a `code-walk` on the SAME page or on the target module's page. If a diagram shows "Hooks → Store", either that page or the hooks module page must have a code-walk showing the hook writing to the store.
- For every 1 `concept` unit, there should be at least 1 `code-walk` unit. Concepts explain *why*; code-walks prove it with real code. A concept without a following code-walk is an unfulfilled promise to the reader.
- The target ratio is `code-walk` ≥ `concept`. A module page with 3 concepts and 1 code-walk needs more code-walks.
- `code-walk` count is NOT capped. A module with 5 core files should have roughly 5 code-walks — one per core file, covering its primary function or class.

**ANTI-PATTERN: Concept-heavy pages.** A module page with 3+ concept units but only 1 code-walk means the reader is reading descriptions of code they never see. Every concept that mentions a specific function, class, pattern, or data structure MUST be followed by a code-walk that shows the relevant source.

**ANTI-PATTERN: Diagram-only coverage.** A page contains a `diagram` unit showing edges between modules, but no code-walk on that page or the referenced module pages shows the code behind those edges. Every edge in a diagram represents real code — show it.

### Pedagogy enforcement (mandatory)

Every generated page MUST satisfy these rules:

- Every module MUST have a non-empty `learningPromise`.
- Every module's `units[]` MUST contain ≥ 1 `quiz`.
- Every module's `units[]` MUST end with a `takeaway`.
- Every module's `units[]` MUST contain enough `code-walk` units to cover its core source files (see "Code-walk density" above).
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
- `startLine` is the original source file line used for editor/file actions only; `highlights[].line` remains snippet-local after trimming.
- Highlight numbers are 1-based and must match the visible line numbers **within the extracted snippet** after trimming.
- **Verification rule:** Before finalizing a page, manually count lines in every `code` value. Ensure every `highlights[].line` points to a line that actually exists in that snippet and contains meaningful code.
- **Common pitfall:** When extracting a 15-line function from a 200-line file, the highlights must reference line numbers 1–15 (the snippet), NOT the original file's line numbers 186–200.
- Do not highlight blank separator lines; move highlights to the nearest meaningful source line.
- **Annotation-note alignment:** The note text must describe what happens on the highlighted line(s). If the note says "mergeMessage dedupes by id" but the highlighted line is `...state,`, the highlight is on the wrong line.

### Code file action controls

When a `code-walk` or `code-graph` unit has a real source file path, render file actions in the `.codewalk-head` next to the file label.

Use an absolute file path in `data-copy-path` when the source repository path is known. Append `:{startLine}` when the unit provides `startLine`; otherwise append `:1`.

Required HTML shape:

```html
<div class="codewalk-head">
  <span class="codewalk-file">{FILE}</span>
  <span class="file-actions">
    <span class="editor-menu" data-editor-menu data-editor="cursor">
      <button class="file-action-select editor-menu-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" data-editor-trigger>
        <span data-editor-current>Cursor</span>
        <span class="gg-chevron-down" aria-hidden="true"></span>
      </button>
      <span class="editor-menu-list" role="listbox" hidden data-editor-list>
        <button class="editor-menu-item" type="button" role="option" aria-selected="true" data-editor-option="cursor">Cursor</button>
        <button class="editor-menu-item" type="button" role="option" aria-selected="false" data-editor-option="vscode">VS Code</button>
      </span>
    </span>
    <button class="file-action" type="button" data-copy-path="{ABSOLUTE_FILE_PATH}:{START_LINE}">Copy path</button>
  </span>
</div>
```

The selected editor option opens immediately. Selecting the already-active option still opens the file, because the menu uses buttons instead of a native `<select>`.

### Unit examples

Before drafting unit data, read `references/units-examples.md` for concrete object shapes, unit-specific options, defaults, and interaction bindings.

Keep the unit-level traps in mind: callout concepts use `style: "callout"`, quizzes need exactly one correct answer, code-walk line numbers are snippet-local, and code-graph bindings must match SVG `data-node-id` values.

## Phase 4: Build Mermaid Diagrams

Before writing diagrams, read `references/svg-patterns.md`.

Use Mermaid for `diagram` units and raw inline SVG only for `code-graph` mini-graphs that need `data-node-id` click-sync. Keep node IDs consistent across pages, use descriptive labels, and do not inline theme overrides; the Raycast dark theme is configured in `mermaid-bridge.js`.

## Phase 5: Generate Page List

| File | Skeleton | Condition |
|------|----------|-----------|
| `index.html`            | `skeleton-index.html` | Always |
| `architecture.html`     | `skeleton-essay.html` | Always |
| `build-up.html`         | `skeleton-essay.html` | Always |
| `<perspective>.html`    | `skeleton-essay.html` | One per non-default perspective |
| `module-<name>.html`    | `skeleton-essay.html` | One per discovered module |

All generated course files go in `docs/codemermaid/`. Filenames are kebab-case except the fixed `index.html`.

Before generating HTML pages, copy shared assets to the output directory:
1. Copy `assets/style.css` → `docs/codemermaid/style.css`
2. Copy `assets/runtime.js` → `docs/codemermaid/runtime.js`
3. Copy `assets/beautiful-mermaid.bundle.js` → `docs/codemermaid/beautiful-mermaid.bundle.js`
4. Copy `assets/mermaid-bridge.js` → `docs/codemermaid/mermaid-bridge.js`

These are linked by every generated HTML page.

## Phase 6: Write HTML Pages

For each page in the file list (Phase 5):

### Assembly process

1. **Read the skeleton template**: `assets/skeleton-essay.html` or `assets/skeleton-index.html`
2. **Generate content HTML** for each `<!-- SLOT:... -->` marker (see below)
3. **Replace all slots** with their content HTML
4. **Pre-flight verification** (mandatory — do not skip):
   - [ ] Every `highlights[].line` points to an existing, non-blank line in its snippet
   - [ ] Every code snippet is an exact copy from source (no invented lines, no reordered statements)
   - [ ] No `href="#"` placeholders — all back/next links point to real files
   - [ ] No `**bold**` markdown — use `<strong></strong>` instead
   - [ ] Inside `<pre class="code-block">`, `.line` spans are adjacent with NO whitespace between them
   - [ ] Quiz has exactly 1 option with `data-correct="true"`
   - [ ] No double HTML entity escaping — scan for `&amp;#` or `&amp;lt;` or `&amp;gt;` patterns and fix them
   - [ ] Mermaid syntax is valid — no unclosed brackets, no missing quotes in edge labels
   - [ ] `index.html` links to `build-up.html` in the Perspectives section
   - [ ] `build-up.html` exists, starts with a `concept`, contains at least one `quiz`, and ends with a `takeaway`
   - [ ] Build-Up copy describes a learning order, not an unverified implementation chronology
   - [ ] Every Build-Up step explains a capability change; it is not only a module inventory
   - [ ] Every `whoa` unit has `angle`, `title`, and `body`
   - [ ] Every `whoa.angle` is `code`, `product`, `ux`, or `architecture`
   - [ ] `whoa` units use one visual treatment; no angle-specific color classes
   - [ ] Every rendered file action with `data-copy-path` points to a real source file path and includes a line number
5. **Dispatch a subagent reviewer** to validate the generated HTML
6. **Write** the completed HTML to `docs/codemermaid/<filename>.html`

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

For `whoa` units, render:

```html
<section class="unit unit-whoa" id="unit-{INDEX}" data-angle="{ANGLE}">
  <div class="whoa-label">whoa · {ANGLE}</div>
  <h2>{TITLE}</h2>
  <p>{BODY}</p>
  <div class="whoa-evidence">
    <span>{EVIDENCE_ITEM}</span>
  </div>
</section>
```

Render `.whoa-evidence` only when evidence exists. Flatten evidence in this order: files, modules, interactions, constraints. Keep evidence text short enough to fit in a pill; use file basenames or repo-relative paths rather than long absolute paths inside evidence chips.
For evidence chips, repeat one `<span>{EVIDENCE_ITEM}</span>` per flattened evidence item.

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
  <div class="figure-diagram"><pre class="mermaid">{MERMAID_CODE}</pre></div>
  <figcaption>{CAPTION}</figcaption>
</figure>
```

**code-walk (split layout):**
```html
<div class="codewalk-split">
  <!-- Use the Code file action controls header from above when a real source path exists. Otherwise render a simple header with <span class="codewalk-file">{FILE}</span>. -->
  <div class="codewalk-head"><span class="codewalk-file">{FILE}</span><span>{LANG}</span></div>
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
  <!-- Use the Code file action controls header from above when a real source path exists. Otherwise render a simple header with <span class="codewalk-file">{FILE}</span>. -->
  <div class="codewalk-head"><span class="codewalk-file">{FILE}</span><span>{LANG}</span></div>
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

**`<!-- SLOT:ARCHITECTURE_DIAGRAM -->`:**
```html
<div class="section">
  <div class="section-title">Architecture</div>
  <figure class="figure">
    <div class="figure-diagram"><pre class="mermaid">{MERMAID_CODE}</pre></div>
    <figcaption>{CAPTION}</figcaption>
  </figure>
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

Perspective cards should list default perspectives first: Architecture Overview, then Build-Up Walkthrough, followed by user-requested and auto-inferred perspectives. The Build-Up card must link to `build-up.html` and describe the gradual route from smallest useful capability to complete system.

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

Use the bundled Raycast-inspired dark theme in `assets/style.css`. For visual rationale and token guidance, read `DESIGN.md` and `references/design-system.md`.

## Important Rules

1. **Read Build-Up reference** — before creating `build-up.html` or a module-level Build-Up section, read `references/build-up.md`.
2. **Default perspectives** — always generate `architecture.html` and `build-up.html`.
3. **Real code only** — never invent, simplify, or modify code snippets.
4. **Cover every module** — every module discovered in Phase 1 must appear in at least one perspective page AND have its own `module-<name>.html`.
5. **Linked shared assets** — copy `style.css`, `runtime.js`, `beautiful-mermaid.bundle.js`, and `mermaid-bridge.js` to the output directory. Each HTML links them via `<link>` and `<script src>`.
6. **Vanilla JS only** — no React, no build tools.
7. **beautiful-mermaid via browser bundle** — all `diagram` units use Mermaid syntax rendered by the beautiful-mermaid browser bundle + `mermaid-bridge.js`. `code-graph` mini-graphs use raw SVG for `data-node-id` click-sync.
8. **Build-Up is learning order** — describe capability increments in the order that teaches the system, not unverified git or implementation history.
9. **Module-level Build-Up is optional** — include it only when the module has a natural internal progression. Do not force it into every module page.
10. **Pre whitespace rule** — inside `<pre class="code-block">`, `.line` spans must be adjacent with NO whitespace between them.
11. **Quiz correctness** — every quiz must have exactly 1 option with `data-correct="true"`.
12. **Consistent node IDs** — same module = same node ID across all pages.
13. **User perspective overrides** — user-specified perspectives are mandatory; auto-inferred are supplementary.
14. **Annotation alignment** — the runtime's `alignAnnotations()` handles vertical positioning. CSS `gap` on `.codewalk-annotations` must be `0`.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing `build-up.html` | Always generate the required Build-Up Walkthrough perspective and link it from `index.html`. |
| Build-Up reads like git history | Reframe it as reader learning order unless git history was explicitly inspected and cited. |
| Build-Up is just a module list | Rewrite each step around a capability change and name the code that makes the change possible. |
| Forced module-level Build-Up | Remove it when a normal code-walk teaches the module more clearly. |
| Blank lines between code lines | `.line` spans inside `<pre>` must be adjacent — no newlines or spaces between them. |
| Highlight points to wrong line | Count lines within the extracted snippet, not the original source file. |
| Code snippet has invented lines | Paste the snippet back into a temp file and run the type checker. |
| `href="#"` in links | Replace with actual relative paths. Never leave placeholder links. |
| Side-by-side code looks cramped | Ensure `grid-template-columns: minmax(0, 1fr) 300px` is applied. |
| Quiz has no correct answer | Exactly 1 option must have `data-correct="true"`. |
| Double HTML entity escaping | Scan output for `&amp;#`, `&amp;lt;`, `&amp;gt;` — these are wrong. The correct forms are `&#39;`, `&lt;`, `&gt;`. |
| Mermaid edge label missing quotes | Use pipe syntax: `A -->|"label text"| B` not `A -->|label text| B`. |
| Annotations not aligned with code | Confirm CSS `.codewalk-annotations { gap: 0 }` and runtime.js `alignAnnotations()` runs on DOMContentLoaded. |
| beautiful-mermaid not rendering | Ensure `beautiful-mermaid.bundle.js` and `mermaid-bridge.js` are copied to output dir and linked in correct order (bundle in `<head>`, bridge before `runtime.js`). |

## File Organization

```
skills/codemermaid/
  SKILL.md
  DESIGN.md
  references/
    design-system.md
    svg-patterns.md
    subagent-generation.md
    units-examples.md
    voice-examples.md
  assets/
    skeleton-essay.html
    skeleton-index.html
    style.css
    runtime.js
    beautiful-mermaid.bundle.js
    mermaid-bridge.js
```

## Relationship to Other Skills

- **presentation** — Slidev-based slides (slide deck). Use `codemermaid` for interactive exploration, `presentation` for linear slide-based talks.
- **codebase-to-course** — single-page HTML course. Use `codemermaid` for multi-page interactive sites, `codebase-to-course` for single-page courses.
