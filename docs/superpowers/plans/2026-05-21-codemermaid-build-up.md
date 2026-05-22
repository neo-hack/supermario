# CodeMermaid Build-Up Perspective Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CodeMermaid always generate a project-level `build-up.html` perspective and optionally include build-up sections in module pages when they improve code understanding.

**Architecture:** This repository does not contain a standalone CodeMermaid generator implementation; the skill itself is the generator contract. The implementation updates `skills/codemermaid/SKILL.md` and `skills/codemermaid/references/subagent-generation.md` so agents consistently produce Build-Up pages, then locks that guidance with Node tests in `tests/codemermaid/assets.test.js`.

**Tech Stack:** Markdown skill docs, vanilla HTML/CSS/JS assets already present in `skills/codemermaid/assets/`, Node.js built-in `node:test`, `node:assert/strict`, `fs`, and `path`.

---

## File Structure

- Modify: `tests/codemermaid/assets.test.js`
  - Add documentation contract tests for the new default `build-up.html` perspective, Build-Up page rules, optional module sections, and subagent ownership constraints.
- Modify: `skills/codemermaid/SKILL.md`
  - Update the overview, output list, perspective inference rules, page data section, page list, index card ordering, important rules, and common mistakes with Build-Up guidance.
- Modify: `skills/codemermaid/references/subagent-generation.md`
  - Clarify that the coordinator owns the Build-Up route and page; workers may draft assigned fragments only when given explicit scope.
- No changes: `skills/codemermaid/assets/*`
  - First implementation uses existing `concept`, `diagram`, `code-walk`, `code-graph`, `quiz`, and `takeaway` units. No runtime or CSS work is needed.

## Task 1: Add Failing Contract Tests

**Files:**
- Modify: `tests/codemermaid/assets.test.js`

- [ ] **Step 1: Add tests that describe Build-Up behavior**

Append this code to the end of `tests/codemermaid/assets.test.js`:

```javascript
test('SKILL.md defines build-up.html as a default perspective', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

  assert.match(skill, /build-up\.html/);
  assert.match(skill, /Build-Up Walkthrough/);
  assert.match(skill, /Architecture[^\\n]+Build-Up|Build-Up[^\\n]+Architecture/);
  assert.match(skill, /Architecture and Build-Up are always included|Architecture.*Build-Up.*always included/);
});

test('SKILL.md documents Build-Up page structure and source integrity', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

  assert.match(skill, /Build-Up Page Data/);
  assert.match(skill, /capability increment/);
  assert.match(skill, /learning order/);
  assert.match(skill, /not a historical commit|not the actual development order/);
  assert.match(skill, /real source|real code/);
  assert.match(skill, /no fixed count|as many units as needed/);
});

test('SKILL.md allows optional module-level Build-Up sections without forcing every module', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

  assert.match(skill, /module-level Build-Up/i);
  assert.match(skill, /optional/i);
  assert.match(skill, /do not force|must not force|not every module/);
  assert.match(skill, /natural internal progression|natural build-up path/);
});

test('subagent generation keeps Build-Up routing coordinator-owned', () => {
  const subagent = fs.readFileSync(path.join(root, 'references/subagent-generation.md'), 'utf8');

  assert.match(subagent, /Build-Up route/);
  assert.match(subagent, /build-up\.html/);
  assert.match(subagent, /Coordinator Owns/);
  assert.match(subagent, /must not.*build-up\.html|Do not write.*build-up\.html/i);
});
```

- [ ] **Step 2: Run the targeted test file and confirm it fails**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: FAIL. At least one new assertion should fail because `SKILL.md` and `subagent-generation.md` do not yet mention the default Build-Up perspective.

- [ ] **Step 3: Commit the failing tests**

Run:

```bash
git add tests/codemermaid/assets.test.js
git commit -m "test(codemermaid): capture build-up perspective contract"
```

Expected: commit succeeds with only `tests/codemermaid/assets.test.js` staged.

## Task 2: Update the Skill Overview and Output Contract

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Update the opening description**

In `skills/codemermaid/SKILL.md`, replace the first paragraph under `# CodeMermaid` with:

```markdown
Generate a multi-page interactive HTML site that teaches a codebase as scrollable essays — architecture views, default Build-Up walkthroughs, beautiful-mermaid diagrams, typed pedagogical units (concept, quiz, takeaway, diagram, code-walk, code-graph) carrying the lesson. Zero build tools, zero npm. Each output page links shared CSS, runtime JS, and the beautiful-mermaid browser bundle; diagrams render client-side with Raycast dark theming.
```

- [ ] **Step 2: Add Build-Up to the output tree**

In the `## Output` code block, replace:

```markdown
architecture.html             <- Architecture perspective (essay)
<perspective>.html            <- Other perspectives (essays)
module-<name>.html            <- Per-module deep dives (essays)
```

with:

```markdown
architecture.html             <- Architecture perspective (essay, always generated)
build-up.html                 <- Build-Up perspective (essay, always generated)
<perspective>.html            <- Other user-requested or auto-inferred perspectives (essays)
module-<name>.html            <- Per-module deep dives (essays, optional build-up sections when useful)
```

- [ ] **Step 3: Run metadata and asset tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js tests/skills/metadata.test.js
```

Expected: FAIL remains possible because the full Build-Up guidance is not implemented yet. Metadata should not fail due to description length or YAML frontmatter.

## Task 3: Update Perspective Selection Rules

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Replace the perspective merge rules**

Replace lines in `Phase 2: Analyze` that currently read like:

```markdown
6. **User perspective requirements** — parse user prompt for explicit perspective requests
7. **Auto-infer perspectives** — from project characteristics:
   - Has HTTP handlers → Data Flow perspective
   - Has database/ORM → Data Model perspective
   - Has state management → State Machine perspective
   - 10+ modules → Module Dependency perspective
   - Has CI/CD config → Build Pipeline perspective
8. **Merge perspective list** — user-specified (mandatory) + auto-inferred (supplementary), deduplicated. Architecture is always included. Every discovered module must be reachable from at least one perspective page
```

with:

```markdown
6. **Default perspective requirements** — Architecture and Build-Up are always included. `architecture.html` gives the finished-system map; `build-up.html` gives the gradual learning route from smallest useful capability to complete system.
7. **User perspective requirements** — parse user prompt for explicit perspective requests. User-requested perspectives are mandatory.
8. **Auto-infer perspectives** — from project characteristics:
   - Has HTTP handlers, WebSocket, or event streams → Data Flow perspective
   - Has database/ORM → Data Model perspective
   - Has state management → State Machine perspective
   - 10+ modules → Module Dependency perspective
   - Has CI/CD config → Build Pipeline perspective
9. **Merge perspective list** — default + user-specified + auto-inferred, deduplicated. Recommended index order: Architecture Overview, Build-Up Walkthrough, then user-requested and auto-inferred perspectives. Every discovered module must be reachable from at least one perspective page.
10. **Derive Build-Up route** — choose a reader-comprehension order from discovered modules and dependency evidence. Prefer the smallest useful capability first, then add one capability at a time. This is a learning order, not a claim about actual development history.
```

- [ ] **Step 2: Run the targeted tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: Some Build-Up assertions may still fail until page data and subagent guidance are added.

## Task 4: Add Build-Up Page Data Guidance

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Add a Build-Up data section after the PERSPECTIVE example**

After the existing `### PERSPECTIVE (per-perspective page, e.g. architecture.html)` section, insert:

````markdown
### BUILD_UP (default perspective page, `build-up.html`)

Build-Up is a required perspective. It teaches the project as a sequence of capability increments. A capability increment is a focused learning step: what the reader can understand before this step, what new capability appears after it, why the code or module is needed, and what gap remains for the next step.

```javascript
const BUILD_UP = {
  perspective: "build-up",
  learningPromise: "Learn how the project grows from its smallest useful behavior into the complete system.",
  prereqs: ["Architecture Overview"],
  route: [
    {
      capability: "Render the smallest useful output",
      modules: ["messages"],
      whyNow: "Readers need to see the final product at its smallest scale before routing, state, or transport matter."
    }
  ],
  units: []
};
```

Build-Up route rules:

- It is a learning order, not the actual development order. Do not write "first we implemented this code" unless git history proves it.
- Start from the smallest useful behavior the project can show.
- Add one primary capability at a time, such as routing, persistence, streaming, rendering, validation, or composition.
- Use as many units as needed to explain the step clearly. Do not set a fixed number of steps or units.
- Use existing unit kinds: `concept`, `diagram`, `code-walk`, `code-graph`, `quiz`, and `takeaway`.
- Use diagrams when they clarify structure, flow, sequence, or before/after shape. Skip decorative diagrams.
- Code snippets must be exact real source excerpts under the existing Real code only rules.
- End the page with a `takeaway` that summarizes how the smallest capability grew into the complete system.

For a React chat UI, a good route might be: message rendering → message routing → tool rendering → hooks/stores → streaming transport → panel/composer composition.
For a CLI transform tool, a good route might be: CLI entry → argument parsing → core transform → output writer → error handling.
````

When inserting this section, keep the existing `### INDEX` section below it.

- [ ] **Step 2: Add module-level Build-Up guidance after the COURSE example**

After the existing `### COURSE (per-module page, module-<name>.html)` example, insert:

```markdown
Module pages may include a module-level Build-Up section when the module has a natural internal progression. This section is optional. Use it when the module becomes clearer if taught as capability increments, such as text input → submit handling → controls → attachments, or one message type → type dispatch → fallback.

Do not force module-level Build-Up into thin wrappers, primitive collections, or modules where a normal code-walk is clearer. Not every module needs one.
```

- [ ] **Step 3: Run the targeted tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: Tests related to SKILL page data should pass. Subagent ownership may still fail until the reference file is updated.

## Task 5: Update Page List, Assembly, and Quality Rules

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Update Phase 5 page list**

In `## Phase 5: Generate Page List`, replace the table with:

```markdown
| File | Skeleton | Condition |
|------|----------|-----------|
| `index.html`            | `skeleton-index.html` | Always |
| `architecture.html`     | `skeleton-essay.html` | Always |
| `build-up.html`         | `skeleton-essay.html` | Always |
| `<perspective>.html`    | `skeleton-essay.html` | One per non-default user-requested or auto-inferred perspective |
| `module-<name>.html`    | `skeleton-essay.html` | One per discovered module |
```

- [ ] **Step 2: Add Build-Up to the index card instructions**

In the `### Index page slots` section, under `<!-- SLOT:PERSPECTIVE_CARDS -->`, add this paragraph after the HTML example:

```markdown
Perspective cards should list default perspectives first: Architecture Overview, then Build-Up Walkthrough, followed by user-requested and auto-inferred perspectives. The Build-Up card should link to `build-up.html` and describe the gradual route from smallest useful capability to complete system.
```

- [ ] **Step 3: Expand the pre-flight verification checklist**

In the `Pre-flight verification` checklist, add these bullets:

```markdown
   - [ ] `index.html` links to `build-up.html` in the Perspectives section
   - [ ] `build-up.html` exists, starts with a `concept`, contains at least one `quiz`, and ends with a `takeaway`
   - [ ] Build-Up copy describes a learning order, not an unverified implementation chronology
   - [ ] Every Build-Up step explains a capability change; it is not only a module inventory
```

- [ ] **Step 4: Expand Important Rules**

In `## Important Rules`, replace the current list with:

```markdown
1. **Real code only** — never invent, simplify, or modify code snippets.
2. **Default perspectives** — always generate both `architecture.html` and `build-up.html`.
3. **Build-Up is learning order** — teach gradual capability growth without claiming it was the real implementation order unless source history proves it.
4. **Cover every module** — every module discovered in Phase 1 must appear in at least one perspective page AND have its own `module-<name>.html`.
5. **Module Build-Up is optional** — include module-level Build-Up only when it clarifies a natural internal progression. Do not force it into every module.
6. **Linked shared assets** — copy `style.css`, `runtime.js`, `beautiful-mermaid.bundle.js`, and `mermaid-bridge.js` to the output directory. Each HTML links them via `<link>` and `<script src>`.
7. **Vanilla JS only** — no React, no build tools.
8. **beautiful-mermaid via browser bundle** — all `diagram` units use Mermaid syntax rendered by the beautiful-mermaid browser bundle + `mermaid-bridge.js`. `code-graph` mini-graphs use raw SVG (for `data-node-id` click-sync).
9. **Pre whitespace rule** — inside `<pre class="code-block">`, `.line` spans must be adjacent with NO whitespace between them.
10. **Quiz correctness** — every quiz must have exactly 1 option with `data-correct="true"`.
11. **Consistent node IDs** — same module = same node ID across all pages.
12. **User perspective overrides** — user-specified perspectives are mandatory; auto-inferred are supplementary.
13. **Annotation alignment** — the runtime's `alignAnnotations()` handles vertical positioning. CSS `gap` on `.codewalk-annotations` must be `0`.
```

- [ ] **Step 5: Add Build-Up mistakes to Common Mistakes**

In the `## Common Mistakes` table, add:

```markdown
| Missing `build-up.html` | Build-Up is a default perspective, like Architecture. Add it to the page list and index Perspectives section. |
| Build-Up reads like git history | Reword as a learning order: "To understand this, start with the smallest useful behavior." instead of "First we implemented this code." unless commit history is cited. |
| Build-Up is just a module list | Rewrite each step around a capability change: what the system could do before, what it can do after, and what code makes that possible. |
| Forced module Build-Up | Remove the module-level Build-Up section when the module has no natural internal progression. Use a normal module deep dive instead. |
```

- [ ] **Step 6: Run tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: SKILL-related Build-Up assertions pass except the subagent reference test, if that file is still unchanged.

## Task 6: Update Subagent Generation Guidance

**Files:**
- Modify: `skills/codemermaid/references/subagent-generation.md`

- [ ] **Step 1: Add Build-Up ownership to Coordinator Owns**

In `## Coordinator Owns`, add these bullets:

```markdown
- Build-Up route.
- `build-up.html`.
```

- [ ] **Step 2: Add Build-Up limits to Worker Limits**

Under `Workers may:`, add:

```markdown
- Draft assigned Build-Up step fragments only when the coordinator provides exact capability, source files, node ids, and link targets.
```

Under `Workers must not:`, add:

```markdown
- Decide the Build-Up route.
- Write `build-up.html` unless explicitly assigned that exact file by the coordinator.
```

- [ ] **Step 3: Add Build-Up coordinator checklist items**

In `## Coordinator Checklist`, add:

```markdown
- Default perspective list with `architecture.html` and `build-up.html`.
- Build-Up route with capability increments, covered modules, source files, and expected diagrams.
```

- [ ] **Step 4: Add a Build-Up worker prompt**

After the `Perspective Worker Prompt`, add:

````markdown
## Build-Up Fragment Worker Prompt

```markdown
You are drafting one assigned Build-Up fragment for codemermaid.

Scope:
- Capability increment: the coordinator-provided capability name
- Source files: the exact assigned source paths
- Covered modules: the exact assigned module names
- Registered page: build-up.html
- Registry: the coordinator-provided filenames and node ids

Rules:
- Treat the route as a learning order, not a historical implementation order.
- Explain what capability exists before this step, what capability appears after it, and why this code is needed now.
- Use exact real code snippets.
- Use diagrams only when they clarify structure, flow, sequence, or before/after shape.
- Do not change the Build-Up route.
- Do not write build-up.html unless the coordinator explicitly assigns final assembly.
- Return page data draft only.
```
````

- [ ] **Step 5: Run the subagent reference test**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: all tests in `tests/codemermaid/assets.test.js` pass.

## Task 7: Final Verification and Commit

**Files:**
- Verify: `tests/codemermaid/assets.test.js`
- Verify: `tests/skills/metadata.test.js`
- Verify: `skills/codemermaid/SKILL.md`
- Verify: `skills/codemermaid/references/subagent-generation.md`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
pnpm test
```

Expected: PASS for all Node tests.

- [ ] **Step 2: Search for accidental banned planning markers in edited docs**

Run:

```bash
rg -n "T""BD|TO""DO|FI""XME|fill in de""tails|implement la""ter" skills/codemermaid/SKILL.md skills/codemermaid/references/subagent-generation.md tests/codemermaid/assets.test.js
```

Expected: no matches.

- [ ] **Step 3: Review the diff**

Run:

```bash
git diff -- skills/codemermaid/SKILL.md skills/codemermaid/references/subagent-generation.md tests/codemermaid/assets.test.js
```

Expected: diff only changes Build-Up guidance and tests. No asset, generated HTML, or unrelated skill files are changed.

- [ ] **Step 4: Commit the implementation**

Run:

```bash
git add skills/codemermaid/SKILL.md skills/codemermaid/references/subagent-generation.md tests/codemermaid/assets.test.js
git commit -m "feat(codemermaid): add build-up perspective guidance"
```

Expected: commit succeeds.

## Spec Coverage Checklist

- Always generate `build-up.html`: Tasks 1, 3, and 5.
- Use diagrams and real source snippets together: Tasks 4 and 5.
- Allow optional module-level build-up sections: Tasks 1 and 4.
- Avoid fake code and fake history: Tasks 4, 5, and 7.
- No fixed count for build steps or units: Task 4.
- Conservative fallback via learning order: Task 4, with route examples for different project shapes.
- Index links and page quality checks: Tasks 1 and 5.
- Subagent-safe ownership: Task 6.
