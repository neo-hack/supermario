# Operation Guidance Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach the QA and UX Explore skills to treat product-authored operation guidance from ARIA descriptions, visible helper text, tooltips, placeholders, and snapshots as actionable exploration work.

**Architecture:** Add one product-agnostic concept, **Operation Guidance Extraction**, to the existing QA and UX skill references. QA will store operation guidance in `coverage.json` and surface it in reports. UX Explore will maintain a lighter in-report guidance log because it has no `coverage.json` ledger today. Both skills will require in-scope guidance to be exercised with normal evidence or skipped with a reason.

**Tech Stack:** Markdown skill files, HTML report templates, `agent-browser` evidence commands, shell verification with `rg`, `sed`, and generated local HTML checks.

---

## File Structure

- Modify `skills/qa/SKILL.md`
  - Add initial ARIA description capture to setup evidence.
  - Add a hard rule that operation guidance is actionable input, not passive documentation.

- Modify `skills/qa/references/behavior-testing.md`
  - Define Operation Guidance Extraction for QA.
  - Add guidance-derived behavior cases to `coverage.json`.
  - Keep the wording product-agnostic.

- Modify `skills/qa/references/free-exploration.md`
  - Add `operationGuidance` to the coverage ledger shape.
  - Add queue steps that extract guidance after snapshots/opened surfaces.
  - Require covered/skipped status before convergence.

- Modify `skills/qa/references/case-verification.md`
  - Preserve strict qa.md execution.
  - Record operation guidance during scenario execution but do not add extra actions until supplemental exploration.

- Modify `skills/qa/references/evidence-and-reporting.md`
  - Add an Operation Guidance section to final reports.
  - Require final consistency checks for covered/skipped guidance.
  - Update HTML template marker checks only if the template receives a stable marker.

- Modify `skills/qa/templates/qa-report-template.html`
  - Add a compact Operation Guidance section and example row/card that generated reports can fill.

- Modify `skills/ux-explore/SKILL.md`
  - Add Operation Guidance Extraction next to the existing ARIA description guidance.
  - Keep the existing ARIA description scan command, including any uncommitted local changes.

- Modify `skills/ux-explore/references/free-mode.md`
  - Add extraction and execution steps after baseline snapshot/diff context.
  - Require skipped reasons for unsafe or out-of-scope guidance.

- Modify `skills/ux-explore/references/journey-mode.md`
  - Apply guidance only when it is attached to the journey path or surfaces revealed by the journey.

- Modify `skills/ux-explore/references/reporting.md`
  - Add a compact Operation Guidance Coverage section to `ux-report.md`.
  - Keep `usage.md` descriptive and free of recommendations.
  - Preserve existing uncommitted zoom and suggested-improvement changes.

- Modify `skills/ux-explore/templates/ux-report-template.html`
  - Add a compact Operation Guidance section.
  - Preserve existing uncommitted image zoom and suggested-improvement changes.

- Do not modify `skills/ux-explore/templates/usage-template.html` for operation guidance.
  - Usage output remains descriptive product behavior.
  - Preserve existing uncommitted image zoom changes if committing later.

## Important Pre-Execution Note

The current working tree already has uncommitted `skills/ux-explore/*` changes for ARIA description capture, image zoom, and suggested improvements. Do not revert or overwrite them. When applying this plan, edit around those changes and verify with `git diff` before committing each task.

---

### Task 1: Add QA Operation Guidance Extraction Model

**Files:**
- Modify: `/Users/bytedance/Projects/supermario/skills/qa/SKILL.md`
- Modify: `/Users/bytedance/Projects/supermario/skills/qa/references/behavior-testing.md`

- [ ] **Step 1: Write the failing documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "Operation Guidance Extraction|operationGuidance|aria-describedby.*operation guidance|Product-authored operation guidance" skills/qa/SKILL.md skills/qa/references/behavior-testing.md
```

Expected: no matches for `Operation Guidance Extraction`, `operationGuidance`, or `Product-authored operation guidance`.

- [ ] **Step 2: Add initial ARIA description capture to QA setup**

In `/Users/bytedance/Projects/supermario/skills/qa/SKILL.md`, replace setup step 6:

```markdown
6. Capture initial evidence: `agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/initial.png`, `agent-browser snapshot -i`, `agent-browser console`, and `agent-browser errors`.
```

with:

````markdown
6. Capture initial evidence: `agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/initial.png`, `agent-browser snapshot -i`, the ARIA description scan below, `agent-browser console`, and `agent-browser errors`.

```bash
agent-browser eval '(() => Array.from(document.querySelectorAll("[aria-describedby], [aria-description]")).map(el => { const ids = (el.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean); const text = node => (node?.textContent || "").replace(/\s+/g, " ").trim(); const selector = el.getAttribute("data-testid") ? `[data-testid=${JSON.stringify(el.getAttribute("data-testid"))}]` : el.id ? `#${CSS.escape(el.id)}` : el.tagName.toLowerCase(); return { selector, tag: el.tagName.toLowerCase(), role: el.getAttribute("role") || "", ariaLabel: el.getAttribute("aria-label") || "", text: text(el).slice(0, 160), ariaDescription: el.getAttribute("aria-description") || null, ariaDescribedBy: ids.map(id => { const target = document.getElementById(id); return { id, found: !!target, tag: target?.tagName.toLowerCase() || null, text: text(target) }; }) }; }))()' > {OUTPUT_DIR}/snapshots/initial-aria-descriptions.json
```
````

- [ ] **Step 3: Add QA hard rule**

In `/Users/bytedance/Projects/supermario/skills/qa/SKILL.md`, add this bullet under `## Hard Rules` after `Capture evidence for every action before judging it.`:

```markdown
- Treat product-authored operation guidance as actionable exploration input. Guidance from `aria-describedby`, `aria-description`, visible helper text, tooltips, placeholders, and snapshot text must be exercised when in scope, or explicitly skipped with a reason. Do not treat guidance as documentation-only evidence.
```

- [ ] **Step 4: Add Operation Guidance Extraction to behavior testing**

In `/Users/bytedance/Projects/supermario/skills/qa/references/behavior-testing.md`, add this section after `## Snapshot-Derived Behavior`:

```markdown
## Operation Guidance Extraction

Product-authored operation guidance is actionable exploration input. Treat `aria-describedby`, `aria-description`, visible helper text, tooltip copy, placeholder text, and snapshot text as guidance when they describe how a user can operate the current control, panel, dialog, menu, picker, form, editor, or page region.

Operation guidance sources include:

- ARIA descriptions and `aria-describedby` targets.
- Visible helper text near controls.
- Tooltips and popovers that explain how to use a control.
- Placeholder text that describes an allowed operation or format.
- Snapshot text that describes keyboard, pointer, selection, filtering, drag, upload, command, or recovery behavior.
- Labels that imply a non-obvious workflow, such as multi-select, apply, clear, retry, manage, expand, choose, or request access.

When guidance is in scope, convert it into behavior cases using the product's own language. Each extracted instruction must become one of:

- `behaviorCases.pending` when it should be exercised.
- `behaviorCases.tested` when an existing or new step covers it.
- `behaviorCases.skipped` when it is unsafe, out of scope, redundant, impossible, or would navigate away.

Do not add a keyboard-specific checklist. Keyboard behavior is tested when the product describes it or when a feature model normally requires it. The general rule is that described operation contracts must be verified from the live browser with screenshots, snapshot diffs, console, and errors.
```

- [ ] **Step 5: Extend the QA coverage ledger shape**

In `/Users/bytedance/Projects/supermario/skills/qa/references/behavior-testing.md`, replace the `Ledger Shape` JSON with:

```json
{
  "behaviorCases": {
    "planned": [],
    "pending": [],
    "tested": [],
    "skipped": []
  },
  "operationGuidance": {
    "discovered": [],
    "pending": [],
    "covered": [],
    "skipped": []
  }
}
```

Then add this example after the stable behavior key example:

````markdown
Operation guidance entries use this shape:

```json
{
  "key": "scope|source|selector-or-label|instruction",
  "source": "aria-describedby",
  "instruction": "Use ArrowDown to enter the list",
  "scopeKey": "current-picker",
  "status": "pending",
  "behaviorCaseKey": "current-picker|picker|keyboard navigation|normal",
  "evidenceStep": null,
  "skipReason": null
}
```
````

- [ ] **Step 6: Run the documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "Operation Guidance Extraction|operationGuidance|Product-authored operation guidance|aria-describedby.*aria-description" skills/qa/SKILL.md skills/qa/references/behavior-testing.md
```

Expected: matches in both files, including `Operation Guidance Extraction`, `operationGuidance`, and `Product-authored operation guidance`.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
cd /Users/bytedance/Projects/supermario
git diff -- skills/qa/SKILL.md skills/qa/references/behavior-testing.md
git add skills/qa/SKILL.md skills/qa/references/behavior-testing.md
git commit -m ":memo: docs(qa): add operation guidance model"
```

Expected: commit succeeds and only the two QA files are included.

---

### Task 2: Wire QA Guidance Into Free Exploration And Case Verification

**Files:**
- Modify: `/Users/bytedance/Projects/supermario/skills/qa/references/free-exploration.md`
- Modify: `/Users/bytedance/Projects/supermario/skills/qa/references/case-verification.md`

- [ ] **Step 1: Write the failing documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "operationGuidance|Operation guidance|guidance-derived|strict qa.md" skills/qa/references/free-exploration.md skills/qa/references/case-verification.md
```

Expected: no operation-guidance-specific queue or strict-case-verification language.

- [ ] **Step 2: Extend free exploration `coverage.json` shape**

In `/Users/bytedance/Projects/supermario/skills/qa/references/free-exploration.md`, add this object after the existing `behaviorCases` object in the `Coverage Ledger` JSON:

```json
  "operationGuidance": {
    "discovered": [],
    "pending": [],
    "covered": [],
    "skipped": []
  },
```

The resulting excerpt must include both `behaviorCases` and `operationGuidance` as top-level keys in the example ledger.

- [ ] **Step 3: Add guidance extraction to the free exploration queue**

In `/Users/bytedance/Projects/supermario/skills/qa/references/free-exploration.md`, in `## Queue`, replace steps 1-5 with:

```markdown
1. Run `agent-browser snapshot -i --json`.
2. Run or refresh the ARIA description scan when controls, menus, panels, dialogs, form fields, or overlays are visible.
3. Normalize each visible enabled interactive element into a stable key.
4. Infer feature models and add behavior cases from `references/behavior-testing.md` to `behaviorCases.planned` and `behaviorCases.pending`.
5. Extract operation guidance from ARIA descriptions, visible helper text, tooltip text, placeholders, and snapshot text. Add in-scope guidance to `operationGuidance.discovered` and `operationGuidance.pending`, and create or link a behavior case for each instruction.
6. Expand each high-risk behavior model into fault-seeking variants before adding mechanical element actions.
7. Add unseen in-scope elements to `discovered` and `pending` only after behavior case and operation guidance generation.
8. Sort `operationGuidance.pending` and `behaviorCases.pending` by risk first (`high`, `medium`, `low`), then by user workflow order. Sort `pending` top-to-bottom, left-to-right when position is known; otherwise keep snapshot order.
9. Before each action, rematch the stable key to the current `@eN`.
10. Move completed guidance from `operationGuidance.pending` to `operationGuidance.covered` or `operationGuidance.skipped`. Move completed behavior from `behaviorCases.pending` to `behaviorCases.tested` or `behaviorCases.skipped`, and from `pending` to `visited`, `skipped`, or `outOfScope`.
11. After every interaction, run `agent-browser snapshot -i --json` again, refresh operation guidance when a meaningful surface changed, and add newly revealed in-scope guidance, behavior cases, or elements to the queues.
```

- [ ] **Step 4: Update free exploration convergence**

In `/Users/bytedance/Projects/supermario/skills/qa/references/free-exploration.md`, replace `## Completion Rule` with:

```markdown
## Completion Rule

Behavior testing is complete only when `behaviorCases.pending` is empty or every remaining case is skipped with a clear reason. Operation guidance coverage is complete only when `operationGuidance.pending` is empty or every remaining instruction is skipped with a clear reason. The convergence loop must consider pending operation guidance and behavior cases in addition to pending element actions.
```

In `## Convergence Loop`, replace steps 1-4 with:

```markdown
1. If `operationGuidance.pending` has an item, process exactly one in-scope guidance instruction by running or linking the corresponding behavior case with the normal evidence workflow.
2. If `behaviorCases.pending` has an item, process exactly one behavior case using the same evidence workflow.
3. If `pending` has an item, process exactly one item through the per-element workflow.
4. After the action, discover again with `agent-browser snapshot -i --json` and refresh operation guidance if a meaningful surface changed.
5. If new in-scope operation guidance, stable keys, or behavior cases appear, add them to the appropriate pending queue and set `stablePasses` to 0.
```

Then update the final stop condition in the same list to:

```markdown
9. Stop only when `operationGuidance.pending` is empty, `pending` is empty, `behaviorCases.pending` is empty, `stablePasses >= coverageThresholds.stablePassesRequired`, the scroll boundary is reached, and no open menu, popover, or dialog remains unexplored.
```

- [ ] **Step 5: Preserve strict qa.md case verification**

In `/Users/bytedance/Projects/supermario/skills/qa/references/case-verification.md`, add this subsection after `## Strict Scenario Contract`:

```markdown
## Operation Guidance During Scenario Verification

During strict qa.md scenario execution, operation guidance is recorded but does not create extra actions inside the scenario. If a snapshot, ARIA description, visible helper text, tooltip, placeholder, or opened surface exposes in-scope guidance, record it as uncovered guidance for the supplemental exploration phase.

After all executable qa.md scenarios finish:

- If strict qa.md-only verification was requested, report uncovered operation guidance as intentionally not explored.
- Otherwise, convert uncovered in-scope guidance into supplemental behavior cases and run them through `references/free-exploration.md`.
- If guidance is unsafe, impossible, out of scope, redundant with a scenario step, or would navigate away, record it as skipped with the reason.
```

- [ ] **Step 6: Run the documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "operationGuidance|Operation Guidance During Scenario Verification|uncovered operation guidance|pending operation guidance" skills/qa/references/free-exploration.md skills/qa/references/case-verification.md
```

Expected: matches in both files, including the new case-verification subsection.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
cd /Users/bytedance/Projects/supermario
git diff -- skills/qa/references/free-exploration.md skills/qa/references/case-verification.md
git add skills/qa/references/free-exploration.md skills/qa/references/case-verification.md
git commit -m ":memo: docs(qa): wire operation guidance coverage"
```

Expected: commit succeeds and only the two QA reference files are included.

---

### Task 3: Add QA Operation Guidance Reporting

**Files:**
- Modify: `/Users/bytedance/Projects/supermario/skills/qa/references/evidence-and-reporting.md`
- Modify: `/Users/bytedance/Projects/supermario/skills/qa/templates/qa-report-template.html`

- [ ] **Step 1: Write the failing documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "Operation Guidance|operation-guidance|operationGuidance" skills/qa/references/evidence-and-reporting.md skills/qa/templates/qa-report-template.html
```

Expected: no matches for a QA report Operation Guidance section.

- [ ] **Step 2: Add report section requirements**

In `/Users/bytedance/Projects/supermario/skills/qa/references/evidence-and-reporting.md`, add `Operation Guidance` to the required top-level sections list immediately after `Behavior Testing`:

```markdown
- Operation Guidance: product-authored instructions discovered from ARIA descriptions, visible helper text, tooltips, placeholders, and snapshots; each listed as covered, skipped, inconclusive, or linked to a behavior step.
```

Then add this section after `## Coverage Status`:

````markdown
## Operation Guidance Reporting

When operation guidance materially shaped exploration, the final report must include an `Operation Guidance` section:

```markdown
## Operation Guidance

| Source | Extracted operation | Status | Evidence |
|--------|---------------------|--------|----------|
| aria-describedby | Use ArrowDown to enter the list | covered | step-008 |
| tooltip | Click to request access | skipped | external navigation not allowed |
```

Use product language for the extracted operation. Do not dump full ARIA payloads into the report. If guidance was discovered but not exercised, the `Evidence` column must contain the skip reason. If guidance is covered by an existing scenario or behavior step, link that step instead of duplicating the action.
````

- [ ] **Step 3: Update final consistency checks**

In `/Users/bytedance/Projects/supermario/skills/qa/references/evidence-and-reporting.md`, add this bullet to `## Final Consistency Check`:

```markdown
- Ensure operation guidance discovered during the run is listed as covered, skipped with a reason, inconclusive, or intentionally out of scope.
```

- [ ] **Step 4: Add HTML template section**

In `/Users/bytedance/Projects/supermario/skills/qa/templates/qa-report-template.html`, insert this section after the Behavior Testing section or after the closest existing coverage/behavior section:

```html
<section class="section" id="operation-guidance">
  <h2>Operation Guidance</h2>
  <table class="scenario-table">
    <thead>
      <tr>
        <th>Source</th>
        <th>Extracted operation</th>
        <th>Status</th>
        <th>Evidence</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{source}</td>
        <td>{extractedOperation}</td>
        <td>{status}</td>
        <td>{evidenceOrSkipReason}</td>
      </tr>
    </tbody>
  </table>
</section>
```

If the template has no Behavior Testing section, place the new section before `Exploration Log` or the closest step log section. Keep existing classes such as `.hero`, `.tldr`, `.score-grid`, `.log-filter`, `.step-photos`, `[data-log-filter]`, `[data-log-search]`, `mediumZoom`, and `window.qaImageZoom` intact.

- [ ] **Step 5: Update template marker requirements**

In `/Users/bytedance/Projects/supermario/skills/qa/references/evidence-and-reporting.md`, update the template marker sentence to include `#operation-guidance`:

```markdown
The generated `report.html` must preserve template markers and behavior hooks: `.hero`, `.tldr`, `.score-grid`, `.log-filter`, `.step-photos`, `#operation-guidance`, `[data-log-filter]`, `[data-log-search]`, `mediumZoom` or `window.qaImageZoom`, and the `session.webm` video/link when recording is enabled.
```

- [ ] **Step 6: Run the documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "Operation Guidance|operation-guidance|operationGuidance|#operation-guidance" skills/qa/references/evidence-and-reporting.md skills/qa/templates/qa-report-template.html
```

Expected: matches in both files, including `#operation-guidance`.

- [ ] **Step 7: Commit Task 3**

Run:

```bash
cd /Users/bytedance/Projects/supermario
git diff -- skills/qa/references/evidence-and-reporting.md skills/qa/templates/qa-report-template.html
git add skills/qa/references/evidence-and-reporting.md skills/qa/templates/qa-report-template.html
git commit -m ":memo: docs(qa): report operation guidance coverage"
```

Expected: commit succeeds and only the QA reporting files are included.

---

### Task 4: Add UX Explore Operation Guidance Extraction

**Files:**
- Modify: `/Users/bytedance/Projects/supermario/skills/ux-explore/SKILL.md`
- Modify: `/Users/bytedance/Projects/supermario/skills/ux-explore/references/free-mode.md`
- Modify: `/Users/bytedance/Projects/supermario/skills/ux-explore/references/journey-mode.md`

- [ ] **Step 1: Write the failing documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "Operation Guidance Extraction|operation guidance|Product-authored operation guidance" skills/ux-explore/SKILL.md skills/ux-explore/references/free-mode.md skills/ux-explore/references/journey-mode.md
```

Expected: no `Operation Guidance Extraction` section in UX Explore files. Existing ARIA description text may appear in `SKILL.md`; do not delete it.

- [ ] **Step 2: Add UX skill-level rule**

In `/Users/bytedance/Projects/supermario/skills/ux-explore/SKILL.md`, add this subsection after `## Snapshot Diff Technique` and before `## Guidance`:

```markdown
## Operation Guidance Extraction

Product-authored operation guidance is actionable exploration input. Treat `aria-describedby`, `aria-description`, visible helper text, tooltip copy, placeholder text, and snapshot text as guidance when they describe how a user can operate the current control, panel, dialog, menu, picker, form, editor, or page region.

For each in-scope instruction:

1. Convert it into an exploration step or link it to an existing step that already covered the same operation.
2. Exercise it with the normal before, target, after, snapshot diff, console, and error evidence model.
3. If the guidance is unsafe, impossible, out of scope, redundant, or would navigate away, record it as skipped with the reason.
4. Report the source, extracted operation, status, and evidence in `ux-report.md`.

Do not add a keyboard-specific checklist. Keyboard behavior is tested when the product describes it, when it is attached to the scoped control, or when the visible interaction model makes keyboard behavior part of the user-facing contract.
```

- [ ] **Step 3: Update UX free-mode workflow**

In `/Users/bytedance/Projects/supermario/skills/ux-explore/references/free-mode.md`, insert these steps after current step 2:

```markdown
3. **Scan for operation guidance** when controls, menus, panels, dialogs, form fields, or overlays are visible. Use the ARIA description scan from `SKILL.md` when relevant and inspect visible helper text, tooltips, placeholders, and snapshot text.

4. **Queue in-scope guidance** as exploration work. Each instruction must be covered by an upcoming step, linked to an already covered step, or skipped with a reason.
```

Then renumber the remaining workflow steps so the final step still ends with logging the observation and issue.

In the same file, add this subsection after `## Step Report Entry`:

````markdown
## Operation Guidance Entry

When operation guidance affects a step, include a compact note:

```markdown
- **Guidance source**: aria-describedby / visible helper text / tooltip / placeholder / snapshot text
- **Extracted operation**: {short product-language instruction}
- **Guidance result**: covered by this step / covered by step N / skipped because {reason}
```
````

- [ ] **Step 4: Update UX journey mode**

In `/Users/bytedance/Projects/supermario/skills/ux-explore/references/journey-mode.md`, add this subsection after `## Journey Planning`:

```markdown
## Operation Guidance In Journeys

During journey mode, operation guidance is followed only when it is attached to the journey path, the active scoped component, or a surface revealed by the journey. Do not traverse unrelated guidance before the journey is complete or blocked.

If in-scope guidance explains how to complete, recover, cancel, filter, select, or continue the journey, convert it into a journey step with normal evidence. If guidance would navigate away, perform an unsafe action, or leave the stated journey, record it as skipped with the reason.
```

- [ ] **Step 5: Run the documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "Operation Guidance Extraction|Operation Guidance Entry|Operation Guidance In Journeys|Product-authored operation guidance" skills/ux-explore/SKILL.md skills/ux-explore/references/free-mode.md skills/ux-explore/references/journey-mode.md
```

Expected: matches in all three UX files.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
cd /Users/bytedance/Projects/supermario
git diff -- skills/ux-explore/SKILL.md skills/ux-explore/references/free-mode.md skills/ux-explore/references/journey-mode.md
git add skills/ux-explore/SKILL.md skills/ux-explore/references/free-mode.md skills/ux-explore/references/journey-mode.md
git commit -m ":memo: docs(ux): add operation guidance extraction"
```

Expected: commit succeeds. If `skills/ux-explore/SKILL.md` already contains uncommitted ARIA scan changes, include them only if they are part of the intended UX evidence flow and still pass review.

---

### Task 5: Add UX Operation Guidance Reporting

**Files:**
- Modify: `/Users/bytedance/Projects/supermario/skills/ux-explore/references/reporting.md`
- Modify: `/Users/bytedance/Projects/supermario/skills/ux-explore/templates/ux-report-template.html`

- [ ] **Step 1: Write the failing documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "Operation Guidance|operation-guidance|Guidance source|Extracted operation" skills/ux-explore/references/reporting.md skills/ux-explore/templates/ux-report-template.html
```

Expected: no UX Operation Guidance section. Existing image zoom or suggested-improvement text may appear; do not remove it.

- [ ] **Step 2: Add UX report format section**

In `/Users/bytedance/Projects/supermario/skills/ux-explore/references/reporting.md`, add this section to the `UX Report Format` block after `## Exploration Or Journey Log`:

```markdown
## Operation Guidance

| Source | Extracted operation | Status | Evidence |
|--------|---------------------|--------|----------|
| aria-describedby | Use ArrowDown to enter the list | covered | step-008 |
| tooltip | Click to request access | skipped | external navigation not allowed |
```

Below the block, add this explanatory text:

```markdown
Include `Operation Guidance` when ARIA descriptions, visible helper text, tooltips, placeholders, or snapshot text materially shaped the exploration. Keep entries compact. Do not dump raw ARIA JSON. If no operation guidance was found, omit the section.
```

- [ ] **Step 3: Update UX cleanup checklist**

In `/Users/bytedance/Projects/supermario/skills/ux-explore/references/reporting.md`, add this cleanup item after the current `ux-report.md` count check:

```markdown
2. If operation guidance shaped the run, confirm `ux-report.md` lists each extracted instruction as covered, skipped with a reason, inconclusive, or linked to an evidence step.
```

Then renumber the remaining cleanup checklist items.

- [ ] **Step 4: Add UX HTML template section**

In `/Users/bytedance/Projects/supermario/skills/ux-explore/templates/ux-report-template.html`, insert this section after the Exploration Log section and before Issues:

```html
<section class="section" id="operation-guidance">
  <h2>Operation Guidance</h2>
  <table class="guidance-table">
    <thead>
      <tr>
        <th>Source</th>
        <th>Extracted operation</th>
        <th>Status</th>
        <th>Evidence</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{source}</td>
        <td>{extracted operation}</td>
        <td>{status}</td>
        <td>{evidence or skip reason}</td>
      </tr>
    </tbody>
  </table>
</section>
```

Add this CSS before the media query:

```css
.guidance-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}
.guidance-table th,
.guidance-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
  font-size: 14px;
}
.guidance-table th {
  color: var(--muted);
  background: var(--surface);
}
```

Keep existing `mediumZoom`, `window.uxImageZoom`, issue suggested improvement markup, and `.step-photos` behavior intact.

- [ ] **Step 5: Run the documentation checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "Operation Guidance|operation-guidance|guidance-table|Extracted operation|window\\.uxImageZoom|Suggested improvement" skills/ux-explore/references/reporting.md skills/ux-explore/templates/ux-report-template.html
```

Expected: matches for Operation Guidance, guidance table, zoom hook, and suggested improvement.

- [ ] **Step 6: Commit Task 5**

Run:

```bash
cd /Users/bytedance/Projects/supermario
git diff -- skills/ux-explore/references/reporting.md skills/ux-explore/templates/ux-report-template.html
git add skills/ux-explore/references/reporting.md skills/ux-explore/templates/ux-report-template.html
git commit -m ":memo: docs(ux): report operation guidance coverage"
```

Expected: commit succeeds. If these files already contain uncommitted image zoom or suggested-improvement changes, include them only after confirming they are intended to ship with this documentation update.

---

### Task 6: Final Cross-Skill Verification

**Files:**
- Verify only: `/Users/bytedance/Projects/supermario/skills/qa/**`
- Verify only: `/Users/bytedance/Projects/supermario/skills/ux-explore/**`

- [ ] **Step 1: Run keyword coverage checks**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "Operation Guidance Extraction|operationGuidance|Operation Guidance|Product-authored operation guidance|aria-describedby|aria-description" skills/qa skills/ux-explore
```

Expected:

- `Operation Guidance Extraction` appears in QA behavior testing and UX skill docs.
- `operationGuidance` appears in QA behavior/free-exploration docs.
- `Operation Guidance` appears in QA and UX reporting docs/templates.
- `aria-describedby` and `aria-description` appear in both QA and UX setup/guidance docs.

- [ ] **Step 2: Run product-agnostic wording check**

Run:

```bash
cd /Users/bytedance/Projects/supermario
rg -n "repo-branch|ies/|billing-core|api-server|AIDEN|ChatComposer|Notion|Slack|Linear|Google Docs" skills/qa skills/ux-explore
```

Expected:

- No new product-specific examples such as `repo-branch`, `ies/`, `billing-core`, `api-server`, `AIDEN`, or `ChatComposer`.
- Existing generic mature-editor examples in QA behavior docs may still mention Notion, Slack, Linear, GitHub comments, and Google Docs smart chips.

- [ ] **Step 3: Run placeholder scan**

Run:

```bash
cd /Users/bytedance/Projects/supermario
pattern='TB''D|TO''DO|fi''ll in|implement la''ter|\\{source\\}.*\\{source\\}'
rg -n "$pattern" skills/qa skills/ux-explore docs/superpowers/plans/2026-06-18-operation-guidance-extraction.md
```

Expected:

- No placeholder markers from the no-placeholders rule.
- Template placeholders such as `{source}` are allowed only inside HTML templates and must appear as intentional template placeholders in example rows.

- [ ] **Step 4: Verify git state and commits**

Run:

```bash
cd /Users/bytedance/Projects/supermario
git status --short
git log --oneline -6
```

Expected:

- No unexpected modified files.
- Recent commits correspond to the tasks above.
- If pre-existing `ux-explore` changes remain uncommitted because the user wanted to keep them separate, list them explicitly before final handoff.

- [ ] **Step 5: Final handoff summary**

Write a concise final summary containing:

```markdown
Implemented Operation Guidance Extraction across QA and UX Explore.

Verification:
- QA guidance model and coverage ledger documented.
- QA free exploration and case verification wired.
- QA report includes Operation Guidance coverage.
- UX free and journey modes wired.
- UX report includes Operation Guidance coverage.
- Product-specific wording check passed.

Remaining:
- {state any intentionally uncommitted pre-existing changes, or "none"}
```

Do not claim browser-generated reports were updated unless a real report was regenerated or manually updated and verified.

---

## Self-Review

Spec coverage:

- Context and design goal are covered by Tasks 1 and 4 through the shared Operation Guidance Extraction rule.
- Sources of guidance are covered in Tasks 1 and 4.
- Exploration behavior is covered in Tasks 2 and 4.
- Scope rules are covered in Tasks 2 and 4.
- Reporting is covered in Tasks 3 and 5.
- Relationship to behavior testing and snapshot evidence is covered in Tasks 1, 2, and 3.
- Success criteria are verified in Task 6.
- Non-goals are protected by product-agnostic wording checks and strict qa.md handling.

Placeholder scan:

- The plan intentionally includes template placeholders such as `{source}` only where the implementation edits HTML templates.
- No task uses placeholder markers from the no-placeholders rule or an unspecified test instruction.

Type consistency:

- The QA ledger key is consistently named `operationGuidance`.
- The report section is consistently named `Operation Guidance`.
- The UX HTML marker is consistently named `#operation-guidance`.
