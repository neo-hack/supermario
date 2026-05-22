# CodeMermaid Build-Up Perspective Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CodeMermaid always generate a project-level `build-up.html` perspective and optionally include module-level Build-Up sections when they improve code understanding.

**Architecture:** Keep `skills/codemermaid/SKILL.md` slim. It should name Build-Up as a required output, point agents to `references/build-up.md`, and preserve hard generation checks. Put Build-Up route design, capability-increment examples, diagram guidance, and module-level decision rules in `skills/codemermaid/references/build-up.md`.

**Tech Stack:** Markdown skill docs, vanilla HTML/CSS/JS assets already present in `skills/codemermaid/assets/`, Node.js built-in `node:test`, `node:assert/strict`, `fs`, and `path`.

---

## File Structure

- Modify: `tests/codemermaid/assets.test.js`
  - Add contract tests for the default `build-up.html` perspective, the `SKILL.md` handoff to `references/build-up.md`, reference-level Build-Up rules, optional module-level Build-Up, and subagent ownership.
- Modify: `skills/codemermaid/SKILL.md`
  - Add only the Build-Up execution contract: output tree, perspective selection, page data handoff, page list, index ordering, pre-flight checks, important rules, and common mistakes.
- Create: `skills/codemermaid/references/build-up.md`
  - Hold the detailed Build-Up route rules, examples, module-level guidance, Mermaid/code pairing rules, and anti-patterns.
- Modify: `skills/codemermaid/references/subagent-generation.md`
  - Clarify that the coordinator owns the Build-Up route and `build-up.html`; workers may draft assigned fragments only when given exact scope.
- No changes: `skills/codemermaid/assets/*`
  - This feature uses existing `concept`, `diagram`, `code-walk`, `code-graph`, `quiz`, and `takeaway` units. No runtime or CSS work is needed.

## Task 1: Add Failing Contract Tests

**Files:**
- Modify: `tests/codemermaid/assets.test.js`

- [ ] **Step 1: Add tests for Build-Up contract and reference handoff**

Append this code to the end of `tests/codemermaid/assets.test.js`:

```javascript
test('SKILL.md defines build-up.html as a default perspective with reference handoff', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

  assert.match(skill, /build-up\.html/);
  assert.match(skill, /Build-Up Walkthrough/);
  assert.match(skill, /Architecture[^\\n]+Build-Up|Build-Up[^\\n]+Architecture/);
  assert.match(skill, /Architecture and Build-Up are always included|Architecture.*Build-Up.*always included/);
  assert.match(skill, /read `references\/build-up\.md`/);
});

test('build-up reference preserves detailed route rules', () => {
  const buildUp = fs.readFileSync(path.join(root, 'references/build-up.md'), 'utf8');

  assert.match(buildUp, /capability increment/);
  assert.match(buildUp, /learning order/);
  assert.match(buildUp, /not the actual development order|not a historical commit/);
  assert.match(buildUp, /smallest useful behavior/);
  assert.match(buildUp, /as many units as needed|no fixed number/);
  assert.match(buildUp, /exact real source|exact real code/);
  assert.match(buildUp, /diagram/);
  assert.match(buildUp, /code-walk/);
  assert.match(buildUp, /code-graph/);
});

test('Build-Up guidance allows optional module-level sections without forcing every module', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
  const buildUp = fs.readFileSync(path.join(root, 'references/build-up.md'), 'utf8');

  assert.match(skill, /module-level Build-Up/i);
  assert.match(buildUp, /module-level Build-Up/i);
  assert.match(buildUp, /optional/i);
  assert.match(buildUp, /do not force|not every module/i);
  assert.match(buildUp, /natural internal progression|natural build-up path/i);
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

Expected: FAIL. The new tests should fail because `references/build-up.md` does not exist and `SKILL.md` does not yet mention the default Build-Up perspective.

- [ ] **Step 3: Commit the failing tests**

Run:

```bash
git add tests/codemermaid/assets.test.js
git commit -m "test(codemermaid): capture build-up perspective contract"
```

Expected: commit succeeds with only `tests/codemermaid/assets.test.js` staged.

## Task 2: Add the Build-Up Reference

**Files:**
- Create: `skills/codemermaid/references/build-up.md`

- [ ] **Step 1: Create the reference file**

Create `skills/codemermaid/references/build-up.md` with this content:

````markdown
# Build-Up Perspective

Use this reference when generating `build-up.html` or deciding whether a module page needs a module-level Build-Up section.

## Purpose

Build-Up teaches the project as a learning order: start with the smallest useful behavior, then add one capability at a time until the reader can understand the complete system. It is not the actual development order and not a historical commit sequence unless git history is explicitly cited.

## Project-Level Build-Up

`build-up.html` is a required perspective page. It should answer:

- What can the system do at the smallest useful point?
- What capability appears at each step?
- Which real modules and source files make that capability possible?
- What gap remains for the next step?
- How does the final step connect back to the full architecture?

### Route Shape

```javascript
const BUILD_UP = {
  perspective: "build-up",
  learningPromise: "Learn how the project grows from its smallest useful behavior into the complete system.",
  prereqs: ["Architecture Overview"],
  route: [
    {
      capability: "Render the smallest useful output",
      modules: ["messages"],
      sourceFiles: ["src/messages.ts"],
      whyNow: "Readers need to see the final product at its smallest scale before routing, state, or transport matter."
    }
  ],
  units: []
};
```

## Capability Increment Rules

A capability increment is a focused learning step. It explains what the reader understands before the step, what new capability appears after it, why the code or module is needed now, and what remains unresolved.

- Start from the smallest useful behavior the project can show.
- Add one primary capability at a time, such as routing, persistence, streaming, rendering, validation, composition, or deployment.
- Use as many units as needed to explain the step clearly. There is no fixed number of steps or units.
- Use exact real source excerpts under the existing Real code only rules.
- Use diagrams when they clarify structure, data flow, sequence, state, or before/after shape. Skip decorative diagrams.
- End the page with a `takeaway` that summarizes how the smallest capability grew into the complete system.

## Unit Mix

Use existing unit kinds:

- `concept` to explain the capability and why it comes now.
- `diagram` for the shape of the capability, using `references/svg-patterns.md`.
- `code-walk` for exact source excerpts that implement the step.
- `code-graph` only when code lines need click-sync to a 4-6 node call graph.
- `quiz` to check whether the reader understood the design choice.
- `takeaway` to close the step or the whole page.

If a graph does not need code-line click-sync, use a Mermaid `diagram` instead of `code-graph`.

## Example Routes

For a React chat UI, a good route might be:

1. Render one message.
2. Route message types to renderers.
3. Render tool calls.
4. Add hooks or stores for state.
5. Add streaming transport.
6. Compose the panel and composer.

For a CLI transform tool, a good route might be:

1. CLI entry.
2. Argument parsing.
3. Core transform.
4. Output writer.
5. Error handling.

## Module-Level Build-Up

Module pages may include a module-level Build-Up section when the module has a natural internal progression. This section is optional.

Use module-level Build-Up when the module becomes clearer as capability increments, such as:

- Text input -> submit handling -> controls -> attachments.
- One message type -> type dispatch -> fallback.
- Raw config -> validation -> normalized runtime config.

Do not force module-level Build-Up into thin wrappers, primitive collections, or modules where a normal code-walk is clearer. Not every module needs one.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Build-Up reads like git history | Reword as a learning order: "To understand this, start with the smallest useful behavior." |
| Build-Up is just a module list | Rewrite each step around a capability change: what exists before, what appears after, and what code makes that possible. |
| Decorative diagram | Remove it or replace it with a code-walk. |
| Forced module Build-Up | Remove the section and use a normal module deep dive. |
| `code-graph` used without click-sync | Use a Mermaid `diagram` instead. |
````

- [ ] **Step 2: Run targeted tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: FAIL remains possible because `SKILL.md` and `subagent-generation.md` are not updated yet. The `build-up reference preserves detailed route rules` test should pass.

- [ ] **Step 3: Commit the reference file**

Run:

```bash
git add skills/codemermaid/references/build-up.md
git commit -m "docs(codemermaid): add build-up reference"
```

Expected: commit succeeds with only `skills/codemermaid/references/build-up.md` staged.

## Task 3: Add Build-Up Entry Points to SKILL.md

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Update the opening description**

Replace the first paragraph under `# CodeMermaid` with:

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
build-up.html                 <- Build-Up Walkthrough perspective (essay, always generated)
<perspective>.html            <- Other user-requested or auto-inferred perspectives (essays)
module-<name>.html            <- Per-module deep dives (essays, optional module-level Build-Up when useful)
```

- [ ] **Step 3: Replace perspective selection rules**

Replace items 6-8 under `## Phase 2: Analyze` with:

```markdown
6. **Default perspective requirements** — Architecture and Build-Up are always included. `architecture.html` gives the finished-system map; `build-up.html` gives the gradual learning route from smallest useful capability to complete system.
7. **User perspective requirements** — parse user prompt for explicit perspective requests. User-requested perspectives are mandatory.
8. **Auto-infer perspectives** — from project characteristics:
   - Has HTTP handlers, WebSocket, or event streams -> Data Flow perspective
   - Has database/ORM -> Data Model perspective
   - Has state management -> State Machine perspective
   - 10+ modules -> Module Dependency perspective
   - Has CI/CD config -> Build Pipeline perspective
9. **Merge perspective list** — default + user-specified + auto-inferred, deduplicated. Recommended index order: Architecture Overview, Build-Up Walkthrough, then user-requested and auto-inferred perspectives. Every discovered module must be reachable from at least one perspective page.
10. **Derive Build-Up route** — before drafting `build-up.html`, read `references/build-up.md` and choose a reader-comprehension order from discovered modules and dependency evidence.
```

- [ ] **Step 4: Add a slim Build-Up page data handoff**

After the existing `### PERSPECTIVE (per-perspective page, e.g. architecture.html)` section and before `### INDEX`, insert:

```markdown
### BUILD_UP (default perspective page, `build-up.html`)

Build-Up is a required perspective. Before drafting it, read `references/build-up.md` for route design, capability increments, examples, module-level Build-Up criteria, and Mermaid/code pairing rules.
```

- [ ] **Step 5: Add module-level Build-Up handoff**

After the existing `### COURSE (per-module page, module-<name>.html)` example, insert:

```markdown
Module pages may include a module-level Build-Up section when the module has a natural internal progression. This section is optional; read `references/build-up.md` before adding one.
```

- [ ] **Step 6: Run metadata and asset tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js tests/skills/metadata.test.js
```

Expected: FAIL remains possible until page list, quality checks, and subagent guidance are updated. Metadata should pass.

- [ ] **Step 7: Commit the SKILL entry points**

Run:

```bash
git add skills/codemermaid/SKILL.md
git commit -m "docs(codemermaid): add build-up skill entry points"
```

Expected: commit succeeds with only `skills/codemermaid/SKILL.md` staged.

## Task 4: Update Page List, Index, and Quality Gates

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

- [ ] **Step 2: Add Build-Up to index card instructions**

In the `### Index page slots` section, under `<!-- SLOT:PERSPECTIVE_CARDS -->`, add this paragraph after the HTML example:

```markdown
Perspective cards should list default perspectives first: Architecture Overview, then Build-Up Walkthrough, followed by user-requested and auto-inferred perspectives. The Build-Up card must link to `build-up.html` and describe the gradual route from smallest useful capability to complete system.
```

- [ ] **Step 3: Expand pre-flight verification**

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
3. **Build-Up reference first** — read `references/build-up.md` before drafting `build-up.html` or a module-level Build-Up section.
4. **Build-Up is learning order** — teach gradual capability growth without claiming it was the real implementation order unless source history proves it.
5. **Cover every module** — every module discovered in Phase 1 must appear in at least one perspective page AND have its own `module-<name>.html`.
6. **Module Build-Up is optional** — include module-level Build-Up only when it clarifies a natural internal progression. Do not force it into every module.
7. **Linked shared assets** — copy `style.css`, `runtime.js`, `beautiful-mermaid.bundle.js`, and `mermaid-bridge.js` to the output directory. Each HTML links them via `<link>` and `<script src>`.
8. **Vanilla JS only** — no React, no build tools.
9. **beautiful-mermaid via browser bundle** — all `diagram` units use Mermaid syntax rendered by the beautiful-mermaid browser bundle + `mermaid-bridge.js`. `code-graph` mini-graphs use raw SVG (for `data-node-id` click-sync).
10. **Pre whitespace rule** — inside `<pre class="code-block">`, `.line` spans must be adjacent with NO whitespace between them.
11. **Quiz correctness** — every quiz must have exactly 1 option with `data-correct="true"`.
12. **Consistent node IDs** — same module = same node ID across all pages.
13. **User perspective overrides** — user-specified perspectives are mandatory; auto-inferred are supplementary.
14. **Annotation alignment** — the runtime's `alignAnnotations()` handles vertical positioning. CSS `gap` on `.codewalk-annotations` must be `0`.
```

- [ ] **Step 5: Add Build-Up mistakes**

In the `## Common Mistakes` table, add:

```markdown
| Missing `build-up.html` | Build-Up is a default perspective, like Architecture. Add it to the page list and index Perspectives section. |
| Build-Up reads like git history | Reword as a learning order: "To understand this, start with the smallest useful behavior." instead of "First we implemented this code." unless commit history is cited. |
| Build-Up is just a module list | Rewrite each step around a capability change: what the system could do before, what it can do after, and what code makes that possible. |
| Forced module Build-Up | Remove the module-level Build-Up section when the module has no natural internal progression. Use a normal module deep dive instead. |
```

- [ ] **Step 6: Run targeted tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: SKILL-related Build-Up assertions should pass. The subagent reference test may still fail.

- [ ] **Step 7: Commit the quality gates**

Run:

```bash
git add skills/codemermaid/SKILL.md
git commit -m "docs(codemermaid): require build-up page generation"
```

Expected: commit succeeds with only `skills/codemermaid/SKILL.md` staged.

## Task 5: Update Subagent Generation Guidance

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
- Read references/build-up.md before drafting.
- Treat the route as a learning order, not a historical implementation order.
- Explain what capability exists before this step, what capability appears after it, and why this code is needed now.
- Use exact real code snippets.
- Use Mermaid diagrams only when they clarify structure, flow, sequence, state, or before/after shape.
- Use code-graph only when code lines need click-sync to a small SVG graph.
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

- [ ] **Step 6: Commit the subagent guidance**

Run:

```bash
git add skills/codemermaid/references/subagent-generation.md
git commit -m "docs(codemermaid): scope build-up subagent work"
```

Expected: commit succeeds with only `skills/codemermaid/references/subagent-generation.md` staged.

## Task 6: Final Verification and Commit

**Files:**
- Verify: `tests/codemermaid/assets.test.js`
- Verify: `tests/skills/metadata.test.js`
- Verify: `skills/codemermaid/SKILL.md`
- Verify: `skills/codemermaid/references/build-up.md`
- Verify: `skills/codemermaid/references/subagent-generation.md`
- Verify: `skills/codemermaid/assets/`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
pnpm test
```

Expected: PASS for all Node tests.

- [ ] **Step 2: Search for accidental banned planning markers in edited docs**

Run:

```bash
rg -n "T""BD|TO""DO|FI""XME|fill in de""tails|implement la""ter" skills/codemermaid/SKILL.md skills/codemermaid/references/build-up.md skills/codemermaid/references/subagent-generation.md tests/codemermaid/assets.test.js
```

Expected: no matches.

- [ ] **Step 3: Confirm assets did not change**

Run:

```bash
git diff --stat HEAD -- skills/codemermaid/assets
```

Expected: no output.

- [ ] **Step 4: Review the implementation diff**

Run:

```bash
git diff --stat origin/main..HEAD -- tests/codemermaid/assets.test.js skills/codemermaid/SKILL.md skills/codemermaid/references/build-up.md skills/codemermaid/references/subagent-generation.md
```

Expected: diff includes only Build-Up tests, slim `SKILL.md` entry points, the new Build-Up reference, and subagent ownership guidance.

- [ ] **Step 5: Confirm no uncommitted implementation files remain**

Run:

```bash
git status --short
```

Expected: no modified implementation files.

## Spec Coverage Checklist

- Always generate `build-up.html`: Tasks 1, 3, and 4.
- Keep `SKILL.md` slim after the earlier slimming work: Tasks 2, 3, and 4.
- Store detailed Build-Up rules in references: Task 2.
- Make agents read the Build-Up reference: Tasks 1, 3, 4, and 5.
- Use diagrams and real source snippets together: Task 2.
- Keep `code-graph` only for click-sync code graphs: Task 2 and Task 5.
- Allow optional module-level Build-Up sections: Tasks 1, 2, and 3.
- Avoid fake code and fake history: Tasks 2, 4, and 6.
- Avoid fixed counts for Build-Up steps or units: Task 2.
- Index links and page quality checks: Task 4.
- Subagent-safe ownership: Task 5.
