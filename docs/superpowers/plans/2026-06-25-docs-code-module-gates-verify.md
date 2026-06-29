# Docs Code Module Gates And Verify Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `docs-code` so `inline exec` has mandatory module checkpoints, both modes produce ASCII module flow summaries, and both modes run a required verification phase before the final report.

**Architecture:** This is a skill-instruction change backed by text regression tests. Add a focused Node test that reads `skills/docs-code/SKILL.md` and asserts the required workflow language exists, then update the skill markdown to satisfy those assertions without changing unrelated skill behavior.

**Tech Stack:** Markdown Agent Skill docs, Node.js built-in `node:test`, `node:assert/strict`, existing `pnpm test` script.

---

## File Structure

- Create `tests/skills/docs-code-workflow.test.js`
  - Owns regression coverage for `docs-code` workflow requirements that metadata tests cannot catch.
  - Reads `skills/docs-code/SKILL.md` as plain text and checks for mode-specific gates, ASCII flow summaries, verification requirements, and final-report requirements.
- Modify `skills/docs-code/SKILL.md`
  - Updates the existing skill instructions only.
  - Keeps the current two execution modes.
  - Adds Phase 2 module checkpoint rules, ASCII flow guidance, Phase 3 verification, and verification-aware final report instructions.
- No changes to `skills/docs-code/agents/openai.yaml`
  - The skill name, invocation prompt, and OpenAI metadata do not change.

## Task 1: Add Failing Workflow Tests

**Files:**
- Create: `tests/skills/docs-code-workflow.test.js`
- Read: `skills/docs-code/SKILL.md`

- [ ] **Step 1: Create the workflow regression test**

Create `tests/skills/docs-code-workflow.test.js` with this complete content:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const skillPath = path.join(root, 'skills/docs-code/SKILL.md');

function readSkill() {
  return fs.readFileSync(skillPath, 'utf8');
}

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `missing start marker: ${startMarker}`);

  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `missing end marker after ${startMarker}: ${endMarker}`);

  return source.slice(start, end);
}

function assertIncludesAll(source, expectedLines) {
  for (const line of expectedLines) {
    assert.ok(source.includes(line), `expected SKILL.md to include: ${line}`);
  }
}

test('inline exec requires module gates during annotation', () => {
  const skill = readSkill();
  const inlineSection = sectionBetween(
    skill,
    'For `inline exec` mode:',
    'Inline exec preview format:',
  );

  assertIncludesAll(inlineSection, [
    'Process Phase 2 module by module.',
    'Before starting each module, show the module annotation plan and wait for user confirmation.',
    'After finishing each module, show changed files, annotation types, and an ASCII flow explaining the module flow and comment coverage.',
    'Wait for user confirmation before continuing to the next module.',
  ]);
});

test('subagent driven mode does not pause per module and returns module summaries', () => {
  const skill = readSkill();
  const subagentSection = sectionBetween(
    skill,
    'For `subagent driven` mode:',
    'For `inline exec` mode:',
  );

  assertIncludesAll(subagentSection, [
    'Do not pause after each module during Phase 2.',
    'Require each annotation subagent to return changed files, annotation types, and an ASCII flow for its owned module.',
    'Consolidate post-confirmation annotation results into the final annotation summary without per-module user gates.',
  ]);
});

test('module flow summaries use terminal-friendly ASCII instead of Mermaid checkpoints', () => {
  const skill = readSkill();

  assertIncludesAll(skill, [
    '### ASCII Flow Summaries',
    'Module flow summaries use terminal-friendly ASCII.',
    'Use Mermaid only in separate written documentation when explicitly useful.',
    'Module: parser',
    '[API] parse(input)',
    '[Boundary] resolve grammar',
  ]);
});

test('phase 3 verification is required before the final report', () => {
  const skill = readSkill();
  const verifySection = sectionBetween(
    skill,
    '## Phase 3: Verify',
    '## Final Report',
  );

  assertIncludesAll(verifySection, [
    'Run verification after Phase 2 and before the final report.',
    'The main thread owns verification in both execution modes.',
    'Detect the project validation commands from package scripts, build files, CI config, or existing docs.',
    'If verification fails, inspect whether the failure is caused by the annotation changes.',
    'Fix comment-related failures when possible and rerun the failing verification command.',
    'Do not present the task as complete until verification passes or the remaining failure is clearly reported as unrelated or blocked.',
  ]);
});

test('final report includes module summaries and verification results', () => {
  const skill = readSkill();
  const finalReport = sectionBetween(
    skill,
    '## Final Report',
    '## Common Mistakes',
  );

  assertIncludesAll(finalReport, [
    'The final report comes after Phase 3 verification.',
    'Changed files by module.',
    'Annotation types added by module.',
    'ASCII flow summaries by module.',
    'Verification commands and outcomes.',
    'Skipped verification with reasons.',
    'Remaining risk, especially if a verification failure is unrelated or blocked.',
  ]);
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
node --test tests/skills/docs-code-workflow.test.js
```

Expected: FAIL. At least one assertion should report missing text such as:

```text
expected SKILL.md to include: Process Phase 2 module by module.
```

Do not commit this failing test by itself.

## Task 2: Update Docs Code Skill Workflow

**Files:**
- Modify: `skills/docs-code/SKILL.md`
- Test: `tests/skills/docs-code-workflow.test.js`

- [ ] **Step 1: Patch the execution mode instructions**

Apply this patch to `skills/docs-code/SKILL.md`:

```diff
*** Begin Patch
*** Update File: skills/docs-code/SKILL.md
@@
-1. `subagent driven`: use concurrent subagents for both Phase 1 exploration and Phase 2 annotation when scopes can be kept independent.
-2. `inline exec`: use concurrent subagents for Phase 1 exploration when useful, but do Phase 2 edits in the current thread; before each docs-code edit, briefly explain why that annotation is worth adding.
+1. `subagent driven`: use concurrent subagents for both Phase 1 exploration and Phase 2 annotation when scopes can be kept independent; do not pause after each module during Phase 2.
+2. `inline exec`: use concurrent subagents for Phase 1 exploration when useful, but do Phase 2 edits in the current thread with mandatory module gates; before each docs-code edit, briefly explain why that annotation is worth adding.
@@
 For `subagent driven` mode:
 
 - During Phase 2, use concurrent annotation subagents only after Phase 1 confirmation.
 - Each annotation subagent must read the Phase 1 report, its owned files, and any immediately relevant local imports or importers before editing.
 - Require each annotation subagent to add comments only within its owned files and to preserve code behavior.
- Consolidate post-confirmation annotation results into the final annotation summary.
+- Do not pause after each module during Phase 2.
+- Require each annotation subagent to return changed files, annotation types, and an ASCII flow for its owned module.
+- Consolidate post-confirmation annotation results into the final annotation summary without per-module user gates.
 
 For `inline exec` mode:
 
 - Work directly in the current thread.
 - During Phase 2, re-read the Phase 1 report, the target files, and any immediately relevant local imports or importers before editing.
+- Process Phase 2 module by module.
+- Before starting each module, show the module annotation plan and wait for user confirmation.
 - Before adding each file header, doc comment, or inline comment, state the reason it helps future readers.
 - When practical, show the reason together with the planned comment and a short code snippet or pseudocode sketch so the user can see where the comment will land.
 - Pseudocode is allowed for readability, but it must reflect code that was actually re-read and must not replace checking the real target code before editing.
 - Keep each reason brief and tied to intent, dependency boundaries, invariants, or non-obvious control flow.
+- After finishing each module, show changed files, annotation types, and an ASCII flow explaining the module flow and comment coverage.
+- Wait for user confirmation before continuing to the next module.
*** End Patch
```

- [ ] **Step 2: Add ASCII flow guidance**

Apply this patch to `skills/docs-code/SKILL.md` after the `Inline exec preview format` code block:

```diff
*** Begin Patch
*** Update File: skills/docs-code/SKILL.md
@@
 ````
+
+### ASCII Flow Summaries
+
+Module flow summaries use terminal-friendly ASCII. Explain the module's key flow and where the new comments help future readers understand API boundaries, invariants, state transitions, data flow, or non-obvious branches.
+
+Use descriptive labels such as `[API]`, `[Boundary]`, `[Invariant]`, `[Flow]`, `[State]`, or `[Compatibility]`. The labels are examples, not a fixed taxonomy.
+
+Example:
+
+```text
+Module: parser
+
+[API] parse(input)
+   |
+   v
+[Invariant] normalize tokens
+   |
+   v
+{ cached? }
+   | yes              | no
+   v                  v
+[Flow] return hit   [Boundary] resolve grammar
+```
+
+Use Mermaid only in separate written documentation when explicitly useful.
 
 ## Argument Handling
*** End Patch
```

- [ ] **Step 3: Add Phase 3 verification**

Apply this patch to `skills/docs-code/SKILL.md` before `## Final Report`:

```diff
*** Begin Patch
*** Update File: skills/docs-code/SKILL.md
@@
 Example section banner:
 
 ```javascript
 // ═══════════ Parsing ═══════════
 ```
+
+## Phase 3: Verify
+
+Run verification after Phase 2 and before the final report.
+
+The main thread owns verification in both execution modes. Subagents can report local observations, but they do not decide that the full task is verified.
+
+Verification steps:
+
+1. Detect the project validation commands from package scripts, build files, CI config, or existing docs.
+2. Run the relevant commands for the changed scope, such as tests, type checks, lint, formatting checks, and builds.
+3. Report commands that were skipped and why, such as missing scripts or unavailable tooling.
+4. If verification fails, inspect whether the failure is caused by the annotation changes.
+5. Fix comment-related failures when possible and rerun the failing verification command.
+6. Do not present the task as complete until verification passes or the remaining failure is clearly reported as unrelated or blocked.
 
 ## Final Report
*** End Patch
```

- [ ] **Step 4: Update the final report requirements**

Replace the current `## Final Report` section in `skills/docs-code/SKILL.md` with this text, keeping the existing `## Common Mistakes` section immediately after it:

`````markdown
## Final Report

The final report comes after Phase 3 verification.

Process files module by module. For each module, list changed files, annotation types, and the ASCII flow summary:

````markdown
## Annotation Summary

### parser

- `src/parser.ts` — file header and exported function docs
- `src/render.tsx` — JSX-safe inline comments for non-obvious branches

```text
Module: parser

[API] parse(input)
   |
   v
[Invariant] normalize tokens
   |
   v
[Flow] return parsed document
```
````

Also report:

- Changed files by module.
- Annotation types added by module.
- ASCII flow summaries by module.
- Verification commands and outcomes.
- Skipped verification with reasons.
- Remaining risk, especially if a verification failure is unrelated or blocked.
`````

- [ ] **Step 5: Run the focused workflow test and verify it passes**

Run:

```bash
node --test tests/skills/docs-code-workflow.test.js
```

Expected: PASS with output ending in:

```text
# fail 0
```

- [ ] **Step 6: Commit the skill workflow update**

Run:

```bash
git add skills/docs-code/SKILL.md tests/skills/docs-code-workflow.test.js
git commit -m "docs(docs-code): add module gates and verification"
```

Expected: commit succeeds and includes exactly these two files:

```text
skills/docs-code/SKILL.md
tests/skills/docs-code-workflow.test.js
```

## Task 3: Run Full Verification

**Files:**
- Verify: `package.json`
- Verify: `tests/skills/docs-code-workflow.test.js`
- Verify: `skills/docs-code/SKILL.md`

- [ ] **Step 1: Run the full repository test command**

Run:

```bash
pnpm test
```

Expected: PASS. The output should include a summary with:

```text
# fail 0
```

- [ ] **Step 2: If full verification fails, isolate whether the docs-code changes caused it**

Run the focused test again:

```bash
node --test tests/skills/docs-code-workflow.test.js
```

Expected when the new change is healthy:

```text
# fail 0
```

If this focused test passes but `pnpm test` fails elsewhere, inspect the failing test path printed by `pnpm test` and report it as unrelated unless the failure references `skills/docs-code/SKILL.md` or `tests/skills/docs-code-workflow.test.js`.

- [ ] **Step 3: Confirm the worktree state**

Run:

```bash
git status --short
```

Expected after Task 2 commit:

```text
```

If `git status --short` lists only files changed by fixing verification failures from this plan, commit them:

```bash
git add skills/docs-code/SKILL.md tests/skills/docs-code-workflow.test.js
git commit -m "test(docs-code): verify workflow instructions"
```

Expected: commit succeeds if there were verification-fix changes. If the worktree was clean, do not create an empty commit.

## Self-Review

- Spec coverage: Task 2 implements inline mandatory module gates, subagent non-gated summaries, ASCII flow guidance, Phase 3 verification, and verification-aware final report requirements. Task 1 covers those requirements with regression tests. Task 3 covers full repository verification.
- Red-flag scan: The plan has no vague filler wording, omitted code blocks, or unspecified test commands.
- Type and name consistency: The test file name is consistently `tests/skills/docs-code-workflow.test.js`; the skill path is consistently `skills/docs-code/SKILL.md`; the verification section is consistently named `Phase 3: Verify`.
