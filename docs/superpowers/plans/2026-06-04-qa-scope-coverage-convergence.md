# QA Scope Coverage Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the QA skill reliably focus on a requested component, track explored elements with a coverage ledger, converge deterministically, and halt safely on confirmed P0 bugs.

**Architecture:** Add scope resolution as a shared pre-execution reference, not as a free-exploration detail. Add coverage/convergence rules to free exploration and stopping criteria, then thread scoped coverage through case verification and init QA. Keep the implementation documentation-only, enforced by structure tests in `tests/qa/structure.test.js`.

**Tech Stack:** Markdown skill references, Agent Skills metadata, Node.js `node:test`, `assert`, `agent-browser` CLI guidance.

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `skills/qa/SKILL.md` | Main router. Adds scope-trigger routing and mode applicability for coverage. |
| `skills/qa/references/scope-resolution.md` | New shared reference that resolves natural-language component scope before free/case/init execution. |
| `skills/qa/references/free-exploration.md` | Adds scoped queue building, `coverage.json`, convergence loop, and P0 halt behavior for free mode. |
| `skills/qa/references/case-verification.md` | Applies resolved scope to scenario execution and uncovered-element coverage. |
| `skills/qa/references/init-qa.md` | Documents how init mode uses scope and coverage after generated scenario verification. |
| `skills/qa/references/stopping-criteria.md` | Defines deterministic convergence and halt conditions. |
| `skills/qa/references/evidence-and-reporting.md` | Adds `coverage.json`, coverage status, halted coverage reporting, and remaining pending counts. |
| `skills/qa/references/issue-taxonomy.md` | Clarifies P0/Critical triggers that halt coverage after confirmation. |
| `skills/qa/templates/qa-report-template.md` | Adds a Coverage Status section to the Markdown report shape. |
| `skills/qa/templates/qa-report-template.html` | Adds a Coverage Status section to the HTML report shape. |
| `tests/qa/structure.test.js` | Adds structure tests that enforce scope resolution, coverage convergence, and P0 halt rules. |

## Scope Check

This plan covers one subsystem: the QA skill process documentation and its structure tests. It does not implement a runtime runner, a parser, or a separate CLI wrapper. The actual behavior is encoded as skill instructions and enforced by tests that inspect the skill files.

## Task 1: Add Scope Resolution Reference And Routing

**Files:**
- Modify: `tests/qa/structure.test.js`
- Modify: `skills/qa/SKILL.md`
- Create: `skills/qa/references/scope-resolution.md`

- [ ] **Step 1: Write the failing scope routing test**

Append this test to `tests/qa/structure.test.js`:

```js
test('QA skill routes natural-language component focus through scope resolution', () => {
  const skill = read('SKILL.md');
  const scope = read('references/scope-resolution.md');

  assert.match(skill, /references\/scope-resolution\.md/);
  assert.match(skill, /only|focus|scope|component|section|panel|modal|dialog|card|form/);
  assert.match(skill, /detect scope/i);
  assert.match(skill, /resolved scope/i);

  assert.match(scope, /Scope Resolution/);
  assert.match(scope, /Natural-language triggers/);
  assert.match(scope, /agent-browser snapshot -i --json/);
  assert.match(scope, /agent-browser screenshot --annotate/);
  assert.match(scope, /agent-browser highlight/);
  assert.match(scope, /ask the user to confirm/);
  assert.match(scope, /scopeKey/);
  assert.match(scope, /out-of-scope/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: FAIL because `references/scope-resolution.md` does not exist and `SKILL.md` does not route through it.

- [ ] **Step 3: Update QA router**

In `skills/qa/SKILL.md`, update the required references list from:

```markdown
- `references/evidence-and-reporting.md`
- `references/issue-taxonomy.md`
- `references/stopping-criteria.md`
```

to:

```markdown
- `references/evidence-and-reporting.md`
- `references/issue-taxonomy.md`
- `references/stopping-criteria.md`
- `references/scope-resolution.md` when the user asks to focus on part of the page
```

Then add this section after the mode-specific reference table:

```markdown
## Scope Detection

Detect scope before executing any mode. Read `references/scope-resolution.md` when the request describes a component, section, panel, modal, dialog, card, form, chart, table, or uses language such as `only`, `focus`, `scope`, `component`, `section`, `panel`, `modal`, `dialog`, `card`, or `form`.

If a scope is resolved, execute the selected mode inside that resolved scope. Scope changes where QA explores; it does not change whether the mode is free exploration, case verification, or init QA.
```

- [ ] **Step 4: Create scope resolution reference**

Create `skills/qa/references/scope-resolution.md` with this content:

```markdown
# Scope Resolution

Use this reference before free exploration, case verification, or init QA when the user asks to focus on part of the current page.

## Natural-Language Triggers

Enable scope resolution when the request names a component or region, including:

- English: `only`, `focus`, `scope`, `component`, `section`, `panel`, `modal`, `dialog`, `card`, `form`, `table`, `chart`, `sidebar`, `filters`, `pricing`, `checkout`, `login`.
- Non-English equivalent phrases are valid user intent, but keep examples in this skill file English-only.

Do not enable scope resolution for a plain page QA request such as `qa https://example.com`. Do not enable it when the user explicitly asks for full-page or exhaustive QA.

## Resolution Flow

1. Open the page normally.
2. Run `agent-browser snapshot` for page structure.
3. Run `agent-browser snapshot -i --json` for structured interactive refs.
4. Run `agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/scope-candidates.png`.
5. Identify one to three candidate scopes from headings, forms, regions, dialogs, cards, panels, nearby text, and contained interactive elements.
6. Highlight the best candidate anchor:

```bash
agent-browser highlight @eN
agent-browser screenshot {OUTPUT_DIR}/screenshots/scope-target.png
```

7. If one candidate is clearly dominant, record it and continue.
8. If multiple candidates match, ask the user to confirm before exploration.

## Candidate Evidence Format

Record the chosen scope in `{OUTPUT_DIR}/coverage.json`:

```json
{
  "scope": {
    "mode": "natural-language",
    "query": "login form",
    "scopeKey": "/login|form|Sign in",
    "anchor": {
      "role": "form",
      "name": "Sign in",
      "ref": "e12"
    },
    "evidence": {
      "annotatedScreenshot": "screenshots/scope-candidates.png",
      "targetScreenshot": "screenshots/scope-target.png"
    }
  }
}
```

## Confirmation Rules

Continue without asking only when all of these are true:

- Exactly one candidate strongly matches the user phrase.
- The candidate contains at least one interactive element.
- The candidate is not global navigation, footer, or unrelated page chrome.

Ask the user to confirm when:

- Multiple similar candidates exist.
- The best candidate is only a child control, not the whole component.
- The requested scope is visible in the screenshot but absent from the accessibility tree.

## Scoped Exploration Rules

- Build queues only from elements inside the resolved scope.
- Include popovers, menus, dialogs, and tooltips triggered by in-scope elements.
- Mark navigation, header, footer, and unrelated page controls as out-of-scope.
- If an in-scope action causes full-page navigation, stop that step and record out-of-scope navigation unless the user explicitly allows navigation.
- Scroll the scoped container first. Scroll the page only when the scope itself cannot scroll.

## Stable Scope Key

Use this shape for stable scope keys:

```text
path + "|" + scopeRole + "|" + scopeNameOrNearbyHeading
```

Examples:

```text
/login|form|Sign in
/pricing|section|Pricing
/dashboard|panel|Filters
```
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: PASS for the new scope routing test.

- [ ] **Step 6: Commit scope routing**

```bash
git add skills/qa/SKILL.md skills/qa/references/scope-resolution.md tests/qa/structure.test.js
git commit -m "feat(qa): add scope resolution guidance"
```

## Task 2: Add Coverage Ledger And Convergence Loop

**Files:**
- Modify: `tests/qa/structure.test.js`
- Modify: `skills/qa/references/free-exploration.md`
- Modify: `skills/qa/references/stopping-criteria.md`
- Modify: `skills/qa/references/evidence-and-reporting.md`

- [ ] **Step 1: Write the failing coverage convergence test**

Append this test to `tests/qa/structure.test.js`:

```js
test('QA free exploration uses a coverage ledger and convergence loop', () => {
  const freeExploration = read('references/free-exploration.md');
  const stopping = read('references/stopping-criteria.md');
  const evidence = read('references/evidence-and-reporting.md');

  assert.match(freeExploration, /coverage\.json/);
  assert.match(freeExploration, /discovered/);
  assert.match(freeExploration, /pending/);
  assert.match(freeExploration, /visited/);
  assert.match(freeExploration, /skipped/);
  assert.match(freeExploration, /outOfScope/);
  assert.match(freeExploration, /halted/);
  assert.match(freeExploration, /agent-browser snapshot -i --json/);
  assert.match(freeExploration, /stable key/);
  assert.match(freeExploration, /stablePasses/);

  assert.match(stopping, /pending is empty/);
  assert.match(stopping, /stablePasses >= 2/);
  assert.match(stopping, /scroll boundary/);
  assert.match(stopping, /popover|dialog|menu/);

  assert.match(evidence, /coverage\.json/);
  assert.match(evidence, /Coverage Status/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: FAIL because the free exploration reference does not define a ledger or convergence loop.

- [ ] **Step 3: Update free exploration queue section**

Replace the `## Queue` section in `skills/qa/references/free-exploration.md` with:

```markdown
## Coverage Ledger

Free exploration must maintain `{OUTPUT_DIR}/coverage.json`. Do not rely on conversation memory to decide what remains.

Use this shape:

```json
{
  "scope": null,
  "status": "running",
  "stablePasses": 0,
  "discovered": [],
  "pending": [],
  "visited": [],
  "skipped": [],
  "outOfScope": [],
  "halted": null
}
```

Each element uses a stable key:

```text
scopeKey + "|" + path + "|" + role + "|" + accessibleName + "|" + nearbyText + "|" + actionKind
```

Do not use `@eN` as the stable key. Refs are only valid for the current snapshot.

## Queue

1. Run `agent-browser snapshot -i --json`.
2. Normalize each visible enabled interactive element into a stable key.
3. Add unseen in-scope elements to `discovered` and `pending`.
4. Sort `pending` top-to-bottom, left-to-right when position is known; otherwise keep snapshot order.
5. Before each action, rematch the stable key to the current `@eN`.
6. Move completed elements from `pending` to `visited`, `skipped`, or `outOfScope`.
7. After every interaction, run `agent-browser snapshot -i --json` again and add newly revealed in-scope elements to `pending`.
```

- [ ] **Step 4: Add convergence loop to free exploration**

Add this section before `## Action Strategy` in `skills/qa/references/free-exploration.md`:

```markdown
## Convergence Loop

Continue until the queue converges:

1. If `pending` has an item, process exactly one item through the per-element workflow.
2. After the action, discover again with `agent-browser snapshot -i --json`.
3. If new in-scope stable keys appear, add them to `pending` and set `stablePasses` to 0.
4. If `pending` is empty, scroll the scope container. If no scope exists, scroll the page.
5. Discover again with `agent-browser snapshot -i --json`.
6. If no new stable keys appear, increment `stablePasses`.
7. If new stable keys appear, add them to `pending` and set `stablePasses` to 0.
8. Stop only when `pending` is empty, `stablePasses >= 2`, the scroll boundary is reached, and no open menu, popover, or dialog remains unexplored.

For scoped exploration, apply every convergence check only to the resolved scope and to overlays triggered by that scope.
```

- [ ] **Step 5: Update stopping criteria**

Replace the Free Exploration Mode bullets in `skills/qa/references/stopping-criteria.md` with:

```markdown
The exploration ends only when coverage converges:

- `{OUTPUT_DIR}/coverage.json` exists and is current.
- `pending` is empty.
- `stablePasses >= 2`.
- The scope container or page has reached its scroll boundary.
- No open menu, popover, dialog, tooltip, or dynamically revealed panel remains unexplored.
- Every discovered in-scope stable key is in `visited`, `skipped`, `outOfScope`, or `halted`.
- No confirmed P0 halt is active.

No issue count limit exists. Keep going until coverage converges or a confirmed P0 halt stops exploration.
```

- [ ] **Step 6: Update evidence reference artifacts**

In `skills/qa/references/evidence-and-reporting.md`, add `coverage.json` to the artifact layout:

```text
coverage.json
```

Then add this required section after `## Incremental Report Writing`:

```markdown
## Coverage Status

Every final report must include coverage status:

```markdown
## Coverage Status

| Field | Value |
|-------|-------|
| Status | completed / halted |
| Scope | full page / {scopeKey} |
| Discovered | {count} |
| Visited | {count} |
| Skipped | {count} |
| Out of scope | {count} |
| Pending | {count} |
| Stable passes | {count} |
| Halt reason | none / {ISSUE-NNN title} |
```
```

- [ ] **Step 7: Run tests to verify pass**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: PASS for the coverage convergence test.

- [ ] **Step 8: Commit coverage convergence**

```bash
git add skills/qa/references/free-exploration.md skills/qa/references/stopping-criteria.md skills/qa/references/evidence-and-reporting.md tests/qa/structure.test.js
git commit -m "feat(qa): add coverage convergence rules"
```

## Task 3: Add P0 Halt Rules

**Files:**
- Modify: `tests/qa/structure.test.js`
- Modify: `skills/qa/references/issue-taxonomy.md`
- Modify: `skills/qa/references/free-exploration.md`
- Modify: `skills/qa/references/stopping-criteria.md`
- Modify: `skills/qa/references/evidence-and-reporting.md`

- [ ] **Step 1: Write the failing P0 halt test**

Append this test to `tests/qa/structure.test.js`:

```js
test('QA coverage halts after confirmed P0 bugs with evidence', () => {
  const taxonomy = read('references/issue-taxonomy.md');
  const freeExploration = read('references/free-exploration.md');
  const stopping = read('references/stopping-criteria.md');
  const evidence = read('references/evidence-and-reporting.md');

  assert.match(taxonomy, /P0/);
  assert.match(taxonomy, /data loss|blank screen|core workflow|security/i);
  assert.match(freeExploration, /confirmed P0/);
  assert.match(freeExploration, /halted/);
  assert.match(freeExploration, /remainingPending/);
  assert.match(freeExploration, /minimal reproduction/i);
  assert.match(stopping, /confirmed P0 halt/);
  assert.match(evidence, /Halted after ISSUE-/);
  assert.match(evidence, /pending elements were not explored/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: FAIL because P0 halt language is not defined.

- [ ] **Step 3: Update issue taxonomy**

In `skills/qa/references/issue-taxonomy.md`, add this section near severity definitions:

```markdown
## P0 / Critical Halt Triggers

P0 is the subset of Critical issues that should halt coverage after confirmation:

- Blank screen, crash, or unrecoverable page state.
- Core workflow is blocked, such as login, submit, save, checkout, payment, or deploy.
- User data is lost or overwritten.
- Security or permission boundary is visibly broken.
- Infinite loading prevents further trustworthy exploration.
- The resolved scope root disappears or becomes unusable.

P0 requires evidence and one minimal reproduction attempt before halting.
```

- [ ] **Step 4: Add P0 halt workflow**

Add this section to `skills/qa/references/free-exploration.md` after `## Convergence Loop`:

```markdown
## P0 Halt

If an interaction appears to trigger a P0 bug:

1. Mark the issue as `critical` and `P0 candidate`.
2. Capture after screenshot, target screenshot, snapshot diff, console, and errors.
3. Attempt one minimal reproduction from a clean page state:

```bash
agent-browser reload
agent-browser wait 1000
```

4. Repeat only the shortest action sequence that caused the P0.
5. If reproduced, mark the issue as `confirmed P0`.
6. Set `coverage.json.status` to `halted`.
7. Set `coverage.json.halted`:

```json
{
  "issueId": "ISSUE-001",
  "reason": "confirmed P0: submit causes unrecoverable blank screen",
  "lastStep": "step-007",
  "remainingPending": 12
}
```

8. Stop coverage. Do not continue exploring polluted state.

If the issue does not reproduce, mark it intermittent and continue only if the page returns to a trustworthy state.
```

- [ ] **Step 5: Update stopping criteria**

Add this bullet to Free Exploration Mode stopping conditions in `skills/qa/references/stopping-criteria.md`:

```markdown
- Stop immediately after evidence and one minimal reproduction confirm a P0 halt.
```

- [ ] **Step 6: Update reporting evidence**

Add this block to `skills/qa/references/evidence-and-reporting.md` under Coverage Status:

```markdown
When coverage halts, include this sentence directly under the Coverage Status table:

```markdown
Halted after ISSUE-001 (P0). 7/19 elements explored. 12 pending elements were not explored because the page entered an unrecoverable state.
```

Do not count pending elements as passed.
```

- [ ] **Step 7: Run tests to verify pass**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: PASS for the P0 halt test.

- [ ] **Step 8: Commit P0 halt**

```bash
git add skills/qa/references/issue-taxonomy.md skills/qa/references/free-exploration.md skills/qa/references/stopping-criteria.md skills/qa/references/evidence-and-reporting.md tests/qa/structure.test.js
git commit -m "feat(qa): halt coverage on confirmed P0 bugs"
```

## Task 4: Apply Scope And Coverage Across Modes

**Files:**
- Modify: `tests/qa/structure.test.js`
- Modify: `skills/qa/SKILL.md`
- Modify: `skills/qa/references/case-verification.md`
- Modify: `skills/qa/references/init-qa.md`

- [ ] **Step 1: Write the failing mode applicability test**

Append this test to `tests/qa/structure.test.js`:

```js
test('QA applies coverage by mode with scoped boundaries', () => {
  const skill = read('SKILL.md');
  const caseVerification = read('references/case-verification.md');
  const initQa = read('references/init-qa.md');

  assert.match(skill, /Coverage applies/i);
  assert.match(skill, /free exploration.*required/i);
  assert.match(skill, /case verification.*uncovered/i);
  assert.match(skill, /multi-page.*explicit/i);

  assert.match(caseVerification, /resolved scope/);
  assert.match(caseVerification, /outside the resolved scope/);
  assert.match(caseVerification, /uncovered in-scope elements/);

  assert.match(initQa, /resolved scope/);
  assert.match(initQa, /generated qa\.md/);
  assert.match(initQa, /coverage for uncovered elements/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: FAIL because mode applicability is not spelled out.

- [ ] **Step 3: Update SKILL mode rules**

Add this section to `skills/qa/SKILL.md` after `## Execution`:

```markdown
## Coverage Applicability

Coverage applies by mode:

- Free exploration: required. Maintain `coverage.json` and run the convergence loop.
- Scoped free exploration: required, but only inside the resolved scope and overlays triggered by that scope.
- Case verification: partial. Execute scenarios first, then run coverage for uncovered elements.
- Scoped case verification: partial, only for uncovered in-scope elements.
- Init QA: generate qa.md, verify generated scenarios, then run coverage for uncovered elements.
- Multi-page: disabled unless the user explicitly requests multi-page or same-origin following.
```

- [ ] **Step 4: Update case verification scope rules**

Add this section to `skills/qa/references/case-verification.md` before `## Coverage Tracking`:

```markdown
## Scoped Case Verification

If a resolved scope exists:

- Execute scenario actions that target elements inside the resolved scope.
- If an action targets an element outside the resolved scope, mark it out-of-scope unless the user explicitly allowed it.
- After scenarios complete, run coverage only for uncovered in-scope elements.
- Do not explore header, footer, global navigation, or unrelated page controls.
```

- [ ] **Step 5: Update init QA scope rules**

Add this section to `skills/qa/references/init-qa.md` before `## Self-Verify`:

```markdown
## Scope And Coverage

If a resolved scope exists before init QA:

- Generate qa.md only from E2E actions and assertions that apply to the resolved scope when that relationship can be determined.
- If E2E tests cannot be mapped to the resolved scope, keep the generated qa.md complete but mark out-of-scope scenarios before execution.
- After generated qa.md self-verification, run coverage for uncovered elements.
- In scoped init QA, uncovered coverage is limited to in-scope elements.
```

- [ ] **Step 6: Run tests to verify pass**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: PASS for the mode applicability test.

- [ ] **Step 7: Commit mode applicability**

```bash
git add skills/qa/SKILL.md skills/qa/references/case-verification.md skills/qa/references/init-qa.md tests/qa/structure.test.js
git commit -m "docs(qa): apply scoped coverage across modes"
```

## Task 5: Add Coverage Status To Report Templates

**Files:**
- Modify: `tests/qa/structure.test.js`
- Modify: `skills/qa/templates/qa-report-template.md`
- Modify: `skills/qa/templates/qa-report-template.html`
- Modify: `skills/qa/references/evidence-and-reporting.md`

- [ ] **Step 1: Write the failing report template test**

Append this test to `tests/qa/structure.test.js`:

```js
test('QA report templates include coverage status', () => {
  const markdownTemplate = read('templates/qa-report-template.md');
  const htmlTemplate = read('templates/qa-report-template.html');
  const evidence = read('references/evidence-and-reporting.md');

  assert.match(markdownTemplate, /## Coverage Status/);
  assert.match(markdownTemplate, /Status \| completed \/ halted/);
  assert.match(markdownTemplate, /Pending \| \{count\}/);
  assert.match(markdownTemplate, /Halt reason \| none \/ ISSUE-\{NNN\}/);

  assert.match(htmlTemplate, /<h2>Coverage Status<\/h2>/);
  assert.match(htmlTemplate, /coverage-grid/);
  assert.match(htmlTemplate, /\{coverageStatus\}/);
  assert.match(htmlTemplate, /\{pendingCount\}/);
  assert.match(htmlTemplate, /\{haltReason\}/);

  assert.match(evidence, /Coverage Status/);
  assert.match(evidence, /completed \/ halted/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: FAIL because templates do not include coverage status.

- [ ] **Step 3: Update Markdown template**

Add this section to `skills/qa/templates/qa-report-template.md` after `## Health Score`:

```markdown
## Coverage Status

| Field | Value |
|-------|-------|
| Status | completed / halted |
| Scope | full page / {scopeKey} |
| Discovered | {count} |
| Visited | {count} |
| Skipped | {count} |
| Out of scope | {count} |
| Pending | {count} |
| Stable passes | {count} |
| Halt reason | none / ISSUE-{NNN} |
```

- [ ] **Step 4: Update HTML template CSS**

Add this CSS to `skills/qa/templates/qa-report-template.html` after `.score-total .verdict`:

```css
.coverage-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;
}
.coverage-pill {
  border: 1px solid var(--hairline); border-radius: 8px;
  background: var(--surface-pearl); padding: 14px 16px;
}
.coverage-pill .label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--ink-muted-48); margin-bottom: 4px;
}
.coverage-pill .value { font-size: 17px; font-weight: 600; }
```

- [ ] **Step 5: Update HTML template body**

Add this section to `skills/qa/templates/qa-report-template.html` after the Health Score section:

```html
<div class="section">
  <h2>Coverage Status</h2>
  <div class="coverage-grid">
    <div class="coverage-pill"><div class="label">Status</div><div class="value">{coverageStatus}</div></div>
    <div class="coverage-pill"><div class="label">Scope</div><div class="value">{scope}</div></div>
    <div class="coverage-pill"><div class="label">Discovered</div><div class="value">{discoveredCount}</div></div>
    <div class="coverage-pill"><div class="label">Visited</div><div class="value">{visitedCount}</div></div>
    <div class="coverage-pill"><div class="label">Skipped</div><div class="value">{skippedCount}</div></div>
    <div class="coverage-pill"><div class="label">Out of scope</div><div class="value">{outOfScopeCount}</div></div>
    <div class="coverage-pill"><div class="label">Pending</div><div class="value">{pendingCount}</div></div>
    <div class="coverage-pill"><div class="label">Halt reason</div><div class="value">{haltReason}</div></div>
  </div>
</div>
```

- [ ] **Step 6: Run tests to verify pass**

Run:

```bash
pnpm test -- tests/qa/structure.test.js
```

Expected: PASS for report template coverage status.

- [ ] **Step 7: Commit report coverage status**

```bash
git add skills/qa/templates/qa-report-template.md skills/qa/templates/qa-report-template.html skills/qa/references/evidence-and-reporting.md tests/qa/structure.test.js
git commit -m "feat(qa): report coverage status"
```

## Task 6: Final Validation And PR Update

**Files:**
- Read: all modified files

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

- [ ] **Step 3: Run QA CJK check**

Run:

```bash
rg -n "[\\p{Han}]" skills/qa tests/qa docs/superpowers/plans/2026-06-01-qa.md docs/superpowers/specs/2026-06-01-qa-design.md
```

Expected: no matches and exit code 1.

- [ ] **Step 4: Inspect final diff**

Run:

```bash
git diff --stat main..HEAD
git log --oneline -10
```

Expected: diff includes the new scope reference, coverage reporting updates, and structure tests.

- [ ] **Step 5: Push branch**

Run:

```bash
git push
```

Expected: `hotfix/dogfood -> hotfix/dogfood`.

- [ ] **Step 6: Verify PR**

Run:

```bash
gh pr view 17 --json number,title,url,state,headRefName,baseRefName
```

Expected:

```json
{
  "baseRefName": "main",
  "headRefName": "hotfix/dogfood",
  "number": 17,
  "state": "OPEN",
  "title": "feat(skills): add QA and UX exploration workflows",
  "url": "https://github.com/neo-hack/supermario/pull/17"
}
```

## Self-Review

Spec coverage:

- Natural-language scope resolution is implemented by Task 1.
- Scoped queue rules and scope keys are implemented by Tasks 1 and 2.
- Coverage ledger and convergence loop are implemented by Task 2.
- P0 halt behavior is implemented by Task 3.
- Coverage applicability across free, scoped, case, init, and multi-page modes is implemented by Task 4.
- Report visibility for coverage status is implemented by Task 5.
- Final verification and PR update are implemented by Task 6.

Placeholder scan:

- The plan contains no deferred implementation placeholders.
- Every test step includes concrete code.
- Every implementation step includes exact file paths and inserted content.

Type consistency:

- `coverage.json` uses the same fields across tasks: `scope`, `status`, `stablePasses`, `discovered`, `pending`, `visited`, `skipped`, `outOfScope`, and `halted`.
- `scopeKey` is named consistently in scope resolution, coverage, and report sections.
- `pending`, `visited`, `skipped`, and `outOfScope` are named consistently across references and templates.
