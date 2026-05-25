# CodeMermaid Skill Slimming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slim `skills/codemermaid/SKILL.md` by delegating duplicated details to existing reference files while keeping hard generation rules visible.

**Architecture:** Treat `SKILL.md` as the execution contract and `skills/codemermaid/references/*.md` as detail sources. Add contract tests first, migrate unit-specific details into references, then replace duplicated voice, unit examples, diagram, subagent, design-system, and file-organization sections with reference handoffs plus short trap reminders.

**Tech Stack:** Markdown skill files, Node.js built-in `node:test`, `node:assert/strict`, `fs`, and `path`; no runtime asset changes.

---

## File Structure

- Modify: `tests/codemermaid/assets.test.js`
  - Add tests that lock the intended reference handoffs and prevent misleading paths from returning.
- Modify: `skills/codemermaid/SKILL.md`
  - Shorten duplicated guidance, remove runtime-irrelevant vendor path, and preserve hard quality gates.
- Modify: `skills/codemermaid/references/units-examples.md`
  - Add the unit-specific rules that are currently only explicit in `SKILL.md`.
- Modify: `skills/codemermaid/references/svg-patterns.md`
  - Ensure raw SVG and `data-node-id` code-graph binding rules cover what `SKILL.md` used to spell out.
- Do not modify: `skills/codemermaid/assets/*`
  - Generated HTML behavior is unchanged.
- Do not modify: `.agents/skills/codemermaid/*`
  - The spec explicitly leaves the duplicate copy lifecycle undecided.

## Task 1: Add Failing Slimming Contract Tests

**Files:**
- Modify: `tests/codemermaid/assets.test.js`

- [ ] **Step 1: Add tests for reference handoffs and removed paths**

Append this code to the end of `tests/codemermaid/assets.test.js`:

```javascript
test('SKILL.md delegates detailed guidance to codemermaid references', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

  assert.match(skill, /Before writing generated prose, read `references\/voice-examples\.md`/);
  assert.match(skill, /Before drafting unit data, read `references\/units-examples\.md`/);
  assert.match(skill, /Before writing diagrams, read `references\/svg-patterns\.md`/);
  assert.match(skill, /read `references\/subagent-generation\.md` before dispatching work/);
  assert.match(skill, /read `DESIGN\.md` and `references\/design-system\.md`/);
});

test('SKILL.md avoids maintenance-only or incorrect codemermaid paths', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

  assert.doesNotMatch(skill, /references\/DESIGN\.md/);
  assert.doesNotMatch(skill, /vendor\/beautiful-mermaid\//);
});

test('SKILL.md keeps hard quality gates after slimming', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

  assert.match(skill, /Code explanation depth/);
  assert.match(skill, /Pedagogy enforcement/);
  assert.match(skill, /Real code only/);
  assert.match(skill, /Code presentation rules/);
  assert.match(skill, /Pre-flight verification/);
  assert.match(skill, /Phase 6: Write HTML Pages/);
});

test('codemermaid references preserve unit-specific rules moved out of SKILL.md', () => {
  const units = fs.readFileSync(path.join(root, 'references/units-examples.md'), 'utf8');
  const svg = fs.readFileSync(path.join(root, 'references/svg-patterns.md'), 'utf8');

  assert.match(units, /style: "callout"/);
  assert.match(units, /unit-surprise/);
  assert.match(units, /Exactly 4 options/);
  assert.match(units, /letters A-D/);
  assert.match(units, /Exactly 1 option has `correct: true`/);
  assert.match(units, /layout.*defaults to `split`/);
  assert.match(units, /`stacked`/);
  assert.match(units, /snippet-local/);
  assert.match(units, /highlights\[\]\.graphNode/);
  assert.match(units, /data-node-id/);
  assert.match(svg, /code-graph/);
  assert.match(svg, /data-node-id/);
  assert.match(svg, /4-6 nodes/);
});

test('SKILL.md no longer carries long per-unit example sections', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

  assert.doesNotMatch(skill, /^### Concept units$/m);
  assert.doesNotMatch(skill, /^### Quiz units$/m);
  assert.doesNotMatch(skill, /^### Diagram units$/m);
  assert.doesNotMatch(skill, /^### Code-walk units$/m);
  assert.doesNotMatch(skill, /^### Code-graph units$/m);
});
```

- [ ] **Step 2: Run the targeted test file and confirm it fails**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: FAIL. The new tests should fail because `SKILL.md` still has the long voice paragraph, per-unit example sections, `references/DESIGN.md`, and `vendor/beautiful-mermaid/`; the reference test should also fail until unit-specific rules are migrated.

- [ ] **Step 3: Commit the failing tests**

Run:

```bash
git add tests/codemermaid/assets.test.js
git commit -m "test(codemermaid): capture slimming contract"
```

Expected: commit succeeds with only `tests/codemermaid/assets.test.js` staged.

## Task 2: Slim Metadata, Parallel Mode, and Voice Rules

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Replace the compatibility metadata**

Replace the current `compatibility:` frontmatter line with:

```yaml
compatibility: "Generated HTML uses Google Fonts CDN (Inter + Geist Mono) and the bundled beautiful-mermaid browser renderer. Zero npm, zero build tools. CSS, runtime JS, and diagram bundle are linked (not inlined)."
```

- [ ] **Step 2: Replace the Parallel Generation Mode body**

Replace the body under `## Parallel Generation Mode` with:

```markdown
If subagents are available and the repo has enough independent modules, read `references/subagent-generation.md` before dispatching work.

The main agent remains coordinator and owns the module registry, filename registry, perspective list, index page, link graph, and final validation. Subagents may only work inside assigned scopes.
```

Keep the `## Parallel Generation Mode` heading.

- [ ] **Step 3: Replace the Voice rules body**

Replace the body under `### Voice rules` with:

```markdown
Before writing generated prose, read `references/voice-examples.md`. Follow that file for voice, signposts, anti-patterns, and rewrite recipes.
```

Keep the `### Voice rules` heading.

- [ ] **Step 4: Run targeted tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: FAIL. Voice, subagent, and vendor-path assertions should now pass, but unit-example, diagram, and design-system assertions should still fail.

- [ ] **Step 5: Commit this slice**

Run:

```bash
git add skills/codemermaid/SKILL.md
git commit -m "docs(codemermaid): slim voice and parallel guidance"
```

Expected: commit succeeds with only `skills/codemermaid/SKILL.md` staged.

## Task 3: Migrate Unit-Specific Rules Into References

**Files:**
- Modify: `skills/codemermaid/references/units-examples.md`
- Modify: `skills/codemermaid/references/svg-patterns.md`

- [ ] **Step 1: Add concept callout rules to units reference**

In `skills/codemermaid/references/units-examples.md`, after the two `concept` examples and before the horizontal rule that precedes `## code-walk (split)`, add:

```markdown
### Concept rules

- Use `style: "callout"` for surprising or counter-intuitive content.
- Callout concepts render with the red `unit-surprise` treatment.
- Normal concept units should prepare the reader before code by explaining role, reasoning, and tradeoff.
```

- [ ] **Step 2: Add quiz rules to units reference**

In `skills/codemermaid/references/units-examples.md`, after the takeaway examples and before the horizontal rule that precedes `## diagram`, add:

```markdown
## quiz

Checks whether the reader understood a design choice, not trivia.

### Quiz rules

- Exactly 4 options.
- Option letters A-D.
- Exactly 1 option has `correct: true`.
- `explanation` is shown after answering, regardless of correctness.
- The explanation must cite specific code evidence and briefly rule out the wrong answers.
```

- [ ] **Step 3: Add code-walk rules to units reference**

In `skills/codemermaid/references/units-examples.md`, after the three `code-walk` examples and before the horizontal rule that precedes `## takeaway`, add:

```markdown
### Code-walk rules

- `layout` defaults to `split`, with code on the left and annotations on the right.
- `stacked` is the alternative layout when horizontal space is too tight or the explanation reads better top-to-bottom.
- `highlights` is an array of `{ line, note }` objects.
- Highlight lines are snippet-local, 1-based line numbers after trimming the snippet.
- `code` must be the exact, unmodified source snippet.
```

- [ ] **Step 4: Add code-graph rules to units reference**

In `skills/codemermaid/references/units-examples.md`, after the `storyboard` examples, add:

```markdown
---

## code-graph

Use `code-graph` when a code snippet is easier to understand with a small call graph beside it.

### Code-graph rules

- Same source and highlight rules as `code-walk`.
- Add an `svg` field containing the mini call graph.
- `highlights[].graphNode` must match an SVG node `data-node-id`.
- The runtime syncs highlights by that id: clicking a code line highlights the SVG node, and clicking a SVG node highlights the matching code line.
```

- [ ] **Step 5: Strengthen SVG code-graph rules**

In `skills/codemermaid/references/svg-patterns.md`, replace the paragraph under `## Minimal SVG Reference (for code-graph units only)` with:

```markdown
`code-graph` units use raw SVG because the runtime needs `data-node-id` attributes for click-sync between code lines and graph nodes. beautiful-mermaid cannot produce these attributes.

Keep code-graph mini graphs small: 4-6 nodes is the usual range. Every clickable SVG node must include `data-node-id`, and every `highlights[].graphNode` in the paired code snippet must match one of those ids.
```

- [ ] **Step 6: Run targeted tests and confirm reference assertions pass**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: FAIL remains possible because `SKILL.md` is not slimmed yet. The reference preservation assertions for `units-examples.md` and `svg-patterns.md` should pass.

- [ ] **Step 7: Commit the reference migration**

Run:

```bash
git add skills/codemermaid/references/units-examples.md skills/codemermaid/references/svg-patterns.md
git commit -m "docs(codemermaid): preserve unit rules in references"
```

Expected: commit succeeds with only the two reference files staged.

## Task 4: Replace Per-Unit Examples With Reference Handoff

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Replace long per-unit sections**

In `skills/codemermaid/SKILL.md`, replace everything from the `### Concept units` heading through the end of the `### Code-graph units` section, immediately before `## Phase 4: Build Mermaid Diagrams`, with:

```markdown
### Unit examples

Before drafting unit data, read `references/units-examples.md` for concrete object shapes, unit-specific options, defaults, and interaction bindings.

Keep the unit-level traps in mind: callout concepts use `style: "callout"`, quizzes need exactly one correct answer, code-walk line numbers are snippet-local, and code-graph bindings must match SVG `data-node-id` values.
```

- [ ] **Step 2: Confirm hard quality sections remain**

Run:

```bash
rg -n "Code explanation depth|Pedagogy enforcement|Real code only|Code presentation rules|Unit examples|references/units-examples.md" skills/codemermaid/SKILL.md
```

Expected: output includes all six searched items.

- [ ] **Step 3: Run targeted tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: FAIL remains possible until Phase 4 and Design System are slimmed. The per-unit section removal assertions and reference preservation assertions should pass.

- [ ] **Step 4: Commit this slice**

Run:

```bash
git add skills/codemermaid/SKILL.md
git commit -m "docs(codemermaid): delegate unit examples to references"
```

Expected: commit succeeds.

## Task 5: Slim Diagram Guidance

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Replace Phase 4 content**

Replace the body under `## Phase 4: Build Mermaid Diagrams` with:

```markdown
Before writing diagrams, read `references/svg-patterns.md`.

Use Mermaid for `diagram` units and raw inline SVG only for `code-graph` mini-graphs that need `data-node-id` click-sync. Keep node IDs consistent across pages, use descriptive labels, and do not inline theme overrides; the Raycast dark theme is configured in `mermaid-bridge.js`.
```

Keep the `## Phase 4: Build Mermaid Diagrams` heading.

- [ ] **Step 2: Run targeted tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: FAIL remains possible until Design System and File Organization are fixed. The `references/svg-patterns.md` handoff assertion should pass.

- [ ] **Step 3: Commit this slice**

Run:

```bash
git add skills/codemermaid/SKILL.md
git commit -m "docs(codemermaid): delegate diagram patterns to references"
```

Expected: commit succeeds.

## Task 6: Fix Design System and File Organization

**Files:**
- Modify: `skills/codemermaid/SKILL.md`

- [ ] **Step 1: Replace the Design System paragraph**

Replace the paragraph under `## Design System` with:

```markdown
Use the bundled Raycast-inspired dark theme in `assets/style.css`. For visual rationale and token guidance, read `DESIGN.md` and `references/design-system.md`.
```

- [ ] **Step 2: Replace the File Organization tree**

Replace the fenced code block under `## File Organization` with:

````markdown
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
````

This removes `vendor/beautiful-mermaid/` and the incorrect `references/DESIGN.md` entry.

- [ ] **Step 3: Run targeted tests**

Run:

```bash
pnpm test -- tests/codemermaid/assets.test.js
```

Expected: PASS for `tests/codemermaid/assets.test.js`.

- [ ] **Step 4: Commit this slice**

Run:

```bash
git add skills/codemermaid/SKILL.md
git commit -m "docs(codemermaid): fix skill-facing file organization"
```

Expected: commit succeeds.

## Task 7: Final Verification

**Files:**
- Verify: `skills/codemermaid/SKILL.md`
- Verify: `tests/codemermaid/assets.test.js`
- Verify: `skills/codemermaid/references/units-examples.md`
- Verify: `skills/codemermaid/references/svg-patterns.md`
- Verify: `skills/codemermaid/assets/`

- [ ] **Step 1: Confirm only intended references changed and assets did not change**

Run:

```bash
git diff --stat HEAD -- skills/codemermaid/assets
```

Expected: no output.

Run:

```bash
git diff --name-only origin/main..HEAD -- skills/codemermaid/references
```

Expected: only these reference files are listed:

```text
skills/codemermaid/references/units-examples.md
skills/codemermaid/references/svg-patterns.md
```

- [ ] **Step 2: Confirm the misleading paths are gone**

Run:

```bash
rg -n 'references/DESIGN.md|vendor/beautiful-mermaid/' skills/codemermaid/SKILL.md
```

Expected: no matches.

- [ ] **Step 3: Confirm required reference handoffs are present**

Run:

```bash
rg -n 'references/voice-examples.md|references/units-examples.md|references/svg-patterns.md|references/subagent-generation.md|references/design-system.md|DESIGN.md' skills/codemermaid/SKILL.md
```

Expected: output includes all six reference targets.

- [ ] **Step 4: Run full test suite**

Run:

```bash
pnpm test
```

Expected: PASS for all Node tests.

- [ ] **Step 5: Review the implementation diff**

Run:

```bash
git diff --stat origin/main..HEAD -- tests/codemermaid/assets.test.js skills/codemermaid/SKILL.md skills/codemermaid/references/units-examples.md skills/codemermaid/references/svg-patterns.md
```

Expected: diff includes only the slimming tests, `SKILL.md` documentation edits, and the two reference files that preserve migrated unit rules.

- [ ] **Step 6: Confirm no uncommitted implementation files remain**

Run:

```bash
git status --short
```

Expected: no modified implementation files. It is acceptable for unrelated pre-existing untracked files, such as an earlier plan draft, to remain outside this implementation.

## Spec Coverage Checklist

- Slim `SKILL.md`: Tasks 2, 4, 5, and 6.
- Keep references as detail sources: Task 3 and Task 7 Step 1.
- Make agents read reference files: Tasks 2, 4, 5, and 6.
- Keep hard rules visible: Task 1 and Task 4.
- Preserve unit-specific rules outside `SKILL.md`: Task 3.
- Remove `vendor/beautiful-mermaid/`: Task 2 and Task 6.
- Fix `references/DESIGN.md`: Task 6.
- Do not change Phase 6 HTML templates: no task modifies that section.
- Add tests: Task 1 and all verification tasks.
