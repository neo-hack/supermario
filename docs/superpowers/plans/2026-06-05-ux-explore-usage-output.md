# UX Explore Usage Output Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `ux-explore` free mode output into a UX critique report (`ux-report.md`) and a discovered product usage guide (`usage.md`).

**Architecture:** Keep this documentation-only, following the existing Agent Skill pattern. Update `skills/ux-explore/SKILL.md` to describe the two artifacts and add structure tests in `tests/ux-explore/structure.test.js` so the skill keeps the split output contract.

**Tech Stack:** Markdown Agent Skill documentation, Node.js `node:test`, `assert`, `agent-browser` CLI guidance.

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `skills/ux-explore/SKILL.md` | Main skill instructions. Rename the UX report artifact, add `usage.md`, describe free-mode usage drafting, and link the two outputs. |
| `tests/ux-explore/structure.test.js` | Structure tests that enforce the artifact split, usage guide schema, free-mode drafting rules, and English-only body. |
| `docs/superpowers/specs/2026-06-05-ux-explore-usage-output-design.md` | Approved design source. Read-only during implementation. |

## Scope Check

This plan covers one subsystem: `ux-explore` skill instructions and structure tests. It does not add a runtime runner, parser, HTML renderer, automatic journey replay, QA skill changes, or coverage ledger behavior.

## Task 1: Rename The Primary UX Report Artifact

**Files:**
- Modify: `tests/ux-explore/structure.test.js`
- Modify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Write the failing report artifact test**

Append this test to `tests/ux-explore/structure.test.js` before the English-only test:

```js
test('ux-explore writes UX findings to ux-report.md', () => {
  const skill = readSkill();

  assert.match(skill, /ux-report\.md/);
  assert.match(skill, /The final UX report goes to `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(skill, /Append each step and each UX issue to `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(skill, /UX report: ux-report\.md/);
  assert.doesNotMatch(skill, /The final report goes to `\{OUTPUT_DIR\}\/report\.md`/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because the skill still says the final report goes to `{OUTPUT_DIR}/report.md` and does not define `ux-report.md` as the UX report artifact.

- [ ] **Step 3: Update setup wording**

In `skills/ux-explore/SKILL.md`, replace:

```markdown
1. Create output directories and start the report file:
```

with:

```markdown
1. Create output directories and start the UX report file:
```

Then add this paragraph after the setup command block:

```markdown
Write UX findings to `{OUTPUT_DIR}/ux-report.md`. This file is the UX critique artifact: interaction evidence, goodwill score, UX issues, summary, and links to artifacts.
```

- [ ] **Step 4: Update report writing language**

In `skills/ux-explore/SKILL.md`, replace this paragraph:

```markdown
Write the report incrementally as you explore. Append each step and each issue as you find them so nothing is lost if the session is interrupted. Do not batch all writing for the end.

The final report goes to `{OUTPUT_DIR}/report.md`:
```

with:

```markdown
Write the UX report incrementally as you explore. Append each step and each UX issue to `{OUTPUT_DIR}/ux-report.md` as you find them so nothing is lost if the session is interrupted. Do not batch all writing for the end.

The final UX report goes to `{OUTPUT_DIR}/ux-report.md`:
```

- [ ] **Step 5: Update the artifacts list**

In the report template block near the end of `skills/ux-explore/SKILL.md`, replace:

```markdown
## Artifacts
- Full video: explore-video.webm
- Screenshots: screenshots/
- Snapshot diffs: diffs/
```

with:

```markdown
## Artifacts
- UX report: ux-report.md
- Full video: explore-video.webm
- Screenshots: screenshots/
- Snapshot diffs: diffs/
```

- [ ] **Step 6: Run the test to verify it passes**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS for `ux-explore writes UX findings to ux-report.md`.

- [ ] **Step 7: Commit the artifact rename**

Run:

```bash
git add skills/ux-explore/SKILL.md tests/ux-explore/structure.test.js
git commit -m "docs(ux-explore): rename UX report artifact"
```

## Task 2: Add The `usage.md` Output Contract

**Files:**
- Modify: `tests/ux-explore/structure.test.js`
- Modify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Write the failing usage guide structure test**

Append this test to `tests/ux-explore/structure.test.js` before the English-only test:

```js
test('ux-explore writes discovered product usage to usage.md', () => {
  const skill = readSkill();

  assert.match(skill, /usage\.md/);
  assert.match(skill, /Usage Guide/);
  assert.match(skill, /Purpose: Subscribe to a new RSS source\./);
  assert.match(skill, /Entry point: "Add feed" button in the sidebar\./);
  assert.match(skill, /Steps:/);
  assert.match(skill, /Result:/);
  assert.match(skill, /Related controls:/);
  assert.match(skill, /Evidence:/);
  assert.match(skill, /Limitations:/);
  assert.match(skill, /Usage guide: usage\.md/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because `usage.md` and the usage guide schema are not documented yet.

- [ ] **Step 3: Add setup wording for `usage.md`**

In `skills/ux-explore/SKILL.md`, after the paragraph added in Task 1:

```markdown
Write UX findings to `{OUTPUT_DIR}/ux-report.md`. This file is the UX critique artifact: interaction evidence, goodwill score, UX issues, summary, and links to artifacts.
```

add:

```markdown
Write discovered product usage to `{OUTPUT_DIR}/usage.md`. This file is descriptive, not evaluative: what users can do, where the entry point is, the steps, the visible result, related controls, and evidence.
```

- [ ] **Step 4: Add the usage guide format section**

In `skills/ux-explore/SKILL.md`, add this section immediately before `## Report Format`:

````markdown
## Usage Guide Format

Free mode also writes `{OUTPUT_DIR}/usage.md`:

```markdown
# Usage Guide

## Add an RSS feed

Purpose: Subscribe to a new RSS source.

Entry point: "Add feed" button in the sidebar.

Steps:
1. Click "Add feed".
2. Paste an RSS URL into the feed URL field.
3. Click "Add".
4. Confirm the feed appears in the feed list.

Result:
The app subscribes to the feed and starts fetching items.

Related controls:
- Refresh feed
- Open item
- Remove feed

Evidence:
- steps 003-006

Limitations:
- None observed.
```

Every usage entry must include: title, Purpose, Entry point, Steps, Result, Related controls, Evidence, and Limitations.
````

- [ ] **Step 5: Link `usage.md` from the artifacts list**

In the artifacts list updated in Task 1, replace:

```markdown
- UX report: ux-report.md
- Full video: explore-video.webm
- Screenshots: screenshots/
- Snapshot diffs: diffs/
```

with:

```markdown
- UX report: ux-report.md
- Usage guide: usage.md
- Full video: explore-video.webm
- Screenshots: screenshots/
- Snapshot diffs: diffs/
```

- [ ] **Step 6: Run the test to verify it passes**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS for `ux-explore writes discovered product usage to usage.md`.

- [ ] **Step 7: Commit the usage output contract**

Run:

```bash
git add skills/ux-explore/SKILL.md tests/ux-explore/structure.test.js
git commit -m "docs(ux-explore): add usage guide artifact"
```

## Task 3: Teach Free Mode To Maintain A Usage Draft

**Files:**
- Modify: `tests/ux-explore/structure.test.js`
- Modify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Write the failing free-mode drafting test**

Append this test to `tests/ux-explore/structure.test.js` before the English-only test:

```js
test('ux-explore free mode maintains a usage draft from observed capabilities', () => {
  const skill = readSkill();

  assert.match(skill, /maintain a usage draft/i);
  assert.match(skill, /coherent capability/i);
  assert.match(skill, /Group adjacent steps that belong to the same user goal/);
  assert.match(skill, /Record only observable behavior/);
  assert.match(skill, /Do not speculate about backend behavior or hidden implementation/);
  assert.match(skill, /If a path is incomplete, include it with `Limitations`/);
  assert.match(skill, /not exercised/);
  assert.match(skill, /If no coherent capability is discovered/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because free mode does not yet describe usage draft maintenance.

- [ ] **Step 3: Add free-mode usage drafting rules**

In `skills/ux-explore/SKILL.md`, add this section after `### Stopping Condition` and before `## Narration Mode`:

````markdown
### Usage Drafting

During free mode, maintain a usage draft alongside the UX report.

1. When an interaction reveals a coherent capability, name the capability.
2. Group adjacent steps that belong to the same user goal.
3. Record only observable behavior.
4. Do not speculate about backend behavior or hidden implementation.
5. If a path is incomplete, include it with `Limitations` rather than presenting it as complete.
6. If a related control was skipped, mention it only with a clear note that it was not exercised.
7. At cleanup, rewrite `usage.md` into a clean guide ordered by likely user tasks, not raw exploration order.

If no coherent capability is discovered, still create `usage.md` with this content:

```markdown
# Usage Guide

No complete usage path was observed during this exploration.
```
````

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS for `ux-explore free mode maintains a usage draft from observed capabilities`.

- [ ] **Step 5: Commit free-mode usage drafting**

Run:

```bash
git add skills/ux-explore/SKILL.md tests/ux-explore/structure.test.js
git commit -m "docs(ux-explore): capture usage paths in free mode"
```

## Task 4: Wire Cleanup And Journey Mode Relationship

**Files:**
- Modify: `tests/ux-explore/structure.test.js`
- Modify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Write the failing cleanup and relationship test**

Append this test to `tests/ux-explore/structure.test.js` before the English-only test:

```js
test('ux-explore links usage output without adding replay behavior', () => {
  const skill = readSkill();

  assert.match(skill, /UX problems discovered while using a capability still belong in `ux-report\.md`/);
  assert.match(skill, /Journey mode can use `usage\.md` as source material/);
  assert.match(skill, /does not parse or replay `usage\.md` automatically/);
  assert.match(skill, /Re-read `ux-report\.md` and update the summary counts/);
  assert.match(skill, /Re-read `usage\.md` and make sure every usage entry has evidence/);
  assert.match(skill, /Tell the user both artifacts are ready/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because cleanup still references only the old report behavior and does not define the journey-mode relationship to `usage.md`.

- [ ] **Step 3: Add reporting boundary rules**

In `skills/ux-explore/SKILL.md`, add this paragraph after the `Usage Guide Format` section:

```markdown
UX problems discovered while using a capability still belong in `ux-report.md`. `usage.md` should avoid severity labels and recommendations unless they are necessary to explain a limitation. Journey mode can use `usage.md` as source material for future goals, but this skill does not parse or replay `usage.md` automatically.
```

- [ ] **Step 4: Update cleanup**

In `skills/ux-explore/SKILL.md`, replace the current cleanup steps:

```markdown
3. Re-read the report and update the summary counts to match actual issues found.

4. Tell the user the report is ready and summarize: goodwill score with verdict, total issues, breakdown by severity, and the most critical items.
```

with:

```markdown
3. Re-read `ux-report.md` and update the summary counts to match actual issues found.

4. Re-read `usage.md` and make sure every usage entry has evidence. If no coherent capability was discovered, confirm the file says no complete usage path was observed.

5. Tell the user both artifacts are ready and summarize: goodwill score with verdict, total issues, breakdown by severity, most critical UX items, and the number of usage entries documented.
```

- [ ] **Step 5: Run the test to verify it passes**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS for `ux-explore links usage output without adding replay behavior`.

- [ ] **Step 6: Commit cleanup wiring**

Run:

```bash
git add skills/ux-explore/SKILL.md tests/ux-explore/structure.test.js
git commit -m "docs(ux-explore): link usage output in cleanup"
```

## Task 5: Final Validation

**Files:**
- Read: `skills/ux-explore/SKILL.md`
- Read: `tests/ux-explore/structure.test.js`

- [ ] **Step 1: Run full test suite**

Run:

```bash
pnpm test
```

Expected: all tests pass with `fail 0`.

- [ ] **Step 2: Run whitespace check**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 3: Run English-only scan**

Run:

```bash
rg -n "[\p{Han}]" skills/ux-explore tests/ux-explore docs/superpowers/plans/2026-06-05-ux-explore-usage-output.md docs/superpowers/specs/2026-06-05-ux-explore-usage-output-design.md
```

Expected: no output and exit code 1.

- [ ] **Step 4: Inspect final diff**

Run:

```bash
git diff --stat HEAD~4..HEAD
git log --oneline -8
git status --short --branch
```

Expected: recent commits include the four implementation commits, worktree is clean, and the diff is limited to `skills/ux-explore/SKILL.md` and `tests/ux-explore/structure.test.js` plus this plan if it was committed separately.

## Self-Review

Spec coverage:

- `ux-report.md` replaces `report.md`: Task 1.
- `usage.md` is produced as a discovered usage guide: Task 2.
- `usage.md` schema includes Purpose, Entry point, Steps, Result, Related controls, Evidence, and Limitations: Task 2.
- Free mode maintains a usage draft and rewrites it at cleanup: Task 3.
- Free mode records only observed capabilities and avoids speculation: Task 3.
- `ux-report.md` links to `usage.md`: Task 2.
- UX problems stay in `ux-report.md`: Task 4.
- Journey mode can use `usage.md` as source material but no automatic parser or replay is added: Task 4.
- No runtime runner, HTML renderer, QA changes, coverage ledger, or replay behavior is added: all tasks are documentation and structure tests only.

Placeholder scan:

- The plan contains no deferred implementation placeholders.
- Every test step includes concrete code.
- Every documentation update step includes exact text to insert or replace.

Type and naming consistency:

- `ux-report.md` is used consistently for the UX critique artifact.
- `usage.md` is used consistently for the usage guide artifact.
- `Usage Guide`, `Purpose`, `Entry point`, `Steps`, `Result`, `Related controls`, `Evidence`, and `Limitations` are named consistently across tests and skill text.
