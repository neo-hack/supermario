# QA Aggressive Free Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `skills/qa` free exploration behave as aggressive fault-seeking QA while preserving `qa.md` as deterministic checklist-style scenario verification.

**Architecture:** Keep the existing skill structure and references. Update the mode contract in `SKILL.md`, make `free-exploration.md` generate fault-seeking behavior variants, keep `behavior-testing.md` product-agnostic, and update case verification, stopping, reporting, and templates so reports clearly separate checklist scenarios from aggressive supplemental exploration.

**Tech Stack:** Markdown skill instructions, Mermaid diagrams, agent-browser CLI, JSON ledger conventions, HTML/CSS report template.

---

## File Structure

```text
skills/qa/
  SKILL.md
    Main mode contract, routing, setup, cleanup, and mode applicability.

  references/
    free-exploration.md
      Aggressive free-mode loop, coverage ledger fields, variant queueing, convergence rules.

    behavior-testing.md
      Product-agnostic behavior models and fault-seeking dimensions used by every QA mode.

    case-verification.md
      qa.md checklist execution contract and supplemental exploration boundary.

    stopping-criteria.md
      Stop rules for aggressive free mode and checklist case verification.

    evidence-and-reporting.md
      Report language, coverage status, behavior status, and log tag expectations.

  templates/
    qa-report-template.md
      Markdown report shape, including distinct scenario and aggressive exploration sections.

    qa-report-template.html
      HTML report log tags/filter/search; add compact intent, variant, and risk display while keeping the existing result filters.
```

---

### Task 1: Lock the Mode Contract in `SKILL.md`

**Files:**
- Modify: `skills/qa/SKILL.md`

- [ ] **Step 1: Update the overview language**

Change the first paragraph under `# QA` so it says free mode is aggressive fault-seeking, not passive coverage:

```markdown
Systematically test a web page as a user, record evidence for every action, and produce Markdown and HTML QA reports. Free exploration is aggressive fault-seeking QA: it actively tries boundary inputs, interruption paths, sequence abuse, and recovery behavior. qa.md case verification remains deterministic checklist-style execution. This skill discovers and reports issues only. It does not fix the target app.
```

- [ ] **Step 2: Add a mode contract after Mode Routing**

Add this section immediately after the Mermaid `## Mode Routing` block:

```markdown
## Mode Contract

- Free exploration is aggressive fault-seeking QA by default.
- Case verification is checklist-style and must execute qa.md exactly as written.
- Do not inject boundary inputs, interruption paths, or sequence-abuse actions into qa.md scenarios.
- Aggressive exploration applies to:
  - pure free mode when no qa.md exists;
  - uncovered behavior and elements after qa.md scenario verification;
  - uncovered behavior and elements after init QA self-verification.
- If the user requests `qa.md only`, `scenario only`, `strict verification`, or equivalent language, skip aggressive supplemental exploration and report that uncovered behavior was intentionally not explored.
- Report checklist scenario results separately from aggressive exploration findings.
```

- [ ] **Step 3: Update Coverage Applicability**

Replace the `Coverage Applicability` bullets with this exact wording:

```markdown
Coverage applies by mode:

- Free exploration: required and aggressive. Maintain `coverage.json` and run the convergence loop for fault-seeking behavior variants plus element coverage.
- Scoped free exploration: required and aggressive, but only inside the resolved scope and overlays triggered by that scope.
- Case verification: checklist first. Execute qa.md exactly as written, then run aggressive supplemental exploration for uncovered in-scope behavior and elements unless the user requested strict qa.md-only verification.
- Scoped case verification: checklist first. Supplemental aggressive exploration is limited to uncovered in-scope behavior, in-scope elements, and overlays triggered by that scope.
- Init QA: generate qa.md, verify generated scenarios exactly, then run aggressive supplemental exploration for uncovered behavior and elements unless the user requested strict generated-scenario verification only.
- Multi-page: disabled unless the user explicitly requests multi-page or same-origin following.
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "Mode Contract|aggressive|qa.md exactly|strict qa.md-only|Coverage applies" skills/qa/SKILL.md
```

Expected: Output includes the new `Mode Contract`, exact qa.md execution rule, and aggressive coverage applicability.

- [ ] **Step 5: Commit**

```bash
git add skills/qa/SKILL.md
git commit -m "docs(qa): define aggressive free mode contract"
```

---

### Task 2: Add Fault-Seeking Fields to the Free Exploration Ledger

**Files:**
- Modify: `skills/qa/references/free-exploration.md`

- [ ] **Step 1: Update the free mode opening**

Replace the opening sentence under `# Free Exploration` with:

```markdown
Use this mode when no qa.md exists, or after case verification to cover behavior and interactive elements that scenarios did not exercise. Free exploration is aggressive exploratory QA: it seeks bugs by exercising normal workflows plus boundary inputs, interruption paths, sequence abuse, recovery behavior, state consistency, and console/error risk.
```

- [ ] **Step 2: Expand the coverage ledger JSON**

Replace the `behaviorCases` object in the sample `coverage.json` with this exact shape:

```json
"behaviorCases": {
  "planned": [],
  "pending": [],
  "tested": [],
  "skipped": [],
  "variants": {
    "normal": 0,
    "boundary": 0,
    "interruption": 0,
    "sequence": 0,
    "recovery": 0,
    "state": 0,
    "console-risk": 0
  }
}
```

Then add this example immediately after the ledger shape:

```json
{
  "key": "scope|composer|trigger sequence|at|interruption",
  "model": "composer",
  "behaviorName": "trigger sequence",
  "variant": "interruption",
  "intent": "fault-seeking",
  "riskLevel": "high",
  "status": "pending",
  "reason": "Popover cancellation can leave stale query text, broken focus, or inconsistent editor state."
}
```

- [ ] **Step 3: Define variant semantics**

Add this section after the stable key rules:

```markdown
## Fault-Seeking Variants

Every behavior case should record one `variant`. Use these product-agnostic variants:

| Variant | Meaning |
|---------|---------|
| `normal` | Prove the basic happy path still works. |
| `boundary` | Try edge input or limits: empty, whitespace, long text, non-ASCII, emoji, special characters, multiline, invalid value, or no-match query. |
| `interruption` | Interrupt an in-progress workflow with Escape, outside click, focus change, close control, cancel control, or route-safe dismissal. |
| `sequence` | Combine or repeat actions: open-close-reopen, trigger A then trigger B after cleanup, select then continue typing, delete then retry. |
| `recovery` | Verify the UI remains usable after cancel, failed validation, no-match state, dismissed overlay, or skipped unsafe action. |
| `state` | Check visible state consistency: focus, selected, expanded, disabled, busy, checked, pressed, invalid, counters, badges, chips, or placeholder state. |
| `console-risk` | Treat the interaction as likely to expose console errors, warnings, rejected promises, or failed critical requests. |

Use `intent: "fault-seeking"` for behavior cases generated to find bugs. Use `intent: "coverage"` only for mechanical element actions that do not represent a user-facing behavior.
```

- [ ] **Step 4: Update queue priority**

Replace Queue steps 3-5 with:

```markdown
3. Infer feature models and add behavior cases from `references/behavior-testing.md` to `behaviorCases.planned` and `behaviorCases.pending`.
4. Expand each high-risk behavior model into fault-seeking variants before adding mechanical element actions.
5. Add unseen in-scope elements to `discovered` and `pending` only after behavior case generation.
6. Sort `behaviorCases.pending` by risk first (`high`, `medium`, `low`), then by user workflow order, then sort `pending` top-to-bottom, left-to-right when position is known; otherwise keep snapshot order.
```

- [ ] **Step 5: Update the convergence rule**

Replace the final convergence sentence with:

```markdown
The loop may execute element actions, but fault-seeking behavior cases remain first-class work. Do not report free exploration as complete while `behaviorCases.pending` contains untested high-risk or medium-risk cases. Low-risk cases may be skipped only with a clear reason in `behaviorCases.skipped`.
```

- [ ] **Step 6: Verify**

Run:

```bash
rg -n "aggressive exploratory QA|Fault-Seeking Variants|intent|riskLevel|console-risk|high-risk|medium-risk" skills/qa/references/free-exploration.md
```

Expected: Output includes the new opening, variant table, ledger fields, and risk-aware convergence language.

- [ ] **Step 7: Commit**

```bash
git add skills/qa/references/free-exploration.md
git commit -m "docs(qa): make free exploration fault seeking"
```

---

### Task 3: Keep Behavior Testing Product-Agnostic but More Aggressive

**Files:**
- Modify: `skills/qa/references/behavior-testing.md`

- [ ] **Step 1: Add a product-agnostic principle**

Add this paragraph after the opening baseline paragraph:

```markdown
Keep this reference product-agnostic. It should describe behavior shapes and stress dimensions, not product-specific objects, labels, commands, repositories, projects, people, or business workflows. Product-specific behavior comes from the current snapshot, screenshot, visible copy, ARIA roles/states, qa.md, init QA inputs, and overlays revealed during testing.
```

- [ ] **Step 2: Add general fault-seeking dimensions**

Add this section before `## Behavior Profiles`:

```markdown
## General Fault-Seeking Dimensions

For every inferred feature model, generate behavior cases from these dimensions when applicable:

- Normal: prove the basic workflow works before stressing it.
- Boundary: use empty values, whitespace, long values, non-ASCII text, emoji, special characters, multiline input, invalid values, unavailable values, or no-match values.
- Interruption: stop a workflow midway with Escape, outside click, blur/focus change, cancel, close, or route-safe dismissal.
- Sequence: repeat or combine operations after cleanup, such as open-close-reopen, select-then-edit, delete-then-retry, or switch mode then return.
- Recovery: verify the surface remains usable after cancellation, validation errors, no-match states, failed safe actions, or dismissed overlays.
- State consistency: verify role/name/state, focus, selected/expanded/disabled/busy/invalid states, counters, badges, placeholders, chips, and visible copy remain coherent.
- Console risk: treat any new error, warning, unhandled rejection, or failed critical request as an issue candidate unless explicitly benign.

Do not test every dimension blindly for every element. Apply the dimensions that match the feature model and visible UI, then record skipped dimensions with clear reasons when they are unsafe, impossible, or out of scope.
```

- [ ] **Step 3: Tighten behavior case generation**

Replace this sentence:

```markdown
Behavior cases have priority over mechanical element clicks. If a behavior case covers an element, do not repeat that element only to satisfy element coverage.
```

With:

```markdown
Behavior cases have priority over mechanical element clicks. Generate normal behavior first when needed to understand the workflow, then generate boundary, interruption, sequence, recovery, state, and console-risk variants for high-risk models such as editors, forms, pickers, uploads, dialogs, search, and destructive actions. If a behavior case covers an element, do not repeat that element only to satisfy element coverage.
```

- [ ] **Step 4: Remove product-specific examples if they were reintroduced**

Run:

```bash
rg -n "repository|project|issue type|assignee|ChatComposer|Notion command|Slack channel|Linear issue" skills/qa/references/behavior-testing.md
```

Expected: No output. If output appears, replace the product term with a generic behavior shape such as `item`, `candidate`, `option`, `command`, `reference`, `structured object`, or `visible result`.

- [ ] **Step 5: Verify**

Run:

```bash
rg -n "product-agnostic|General Fault-Seeking Dimensions|Boundary|Interruption|Sequence|Recovery|State consistency|Console risk" skills/qa/references/behavior-testing.md
```

Expected: Output includes the new general dimensions and product-agnostic principle.

- [ ] **Step 6: Commit**

```bash
git add skills/qa/references/behavior-testing.md
git commit -m "docs(qa): add product-agnostic fault seeking behavior"
```

---

### Task 4: Preserve qa.md as Checklist-Style Verification

**Files:**
- Modify: `skills/qa/references/case-verification.md`

- [ ] **Step 1: Update the opening contract**

Replace the opening sentence with:

```markdown
Use this mode when qa.md exists or was generated from init QA. Execute the user-defined scenarios exactly as written first. qa.md is checklist-style scenario verification, not aggressive fault-seeking. After scenario verification, use `references/free-exploration.md` only for uncovered interactive elements and behavior testing cases unless the user requested strict qa.md-only verification.
```

- [ ] **Step 2: Add a strict execution rule**

Add this section after `## Scenario Execution`:

```markdown
## Strict Scenario Contract

During qa.md scenario execution:

- Do not add extra actions that are not in qa.md.
- Do not replace qa.md input values with boundary, stress, or adversarial values.
- Do not add Escape, outside click, repeated open/close, long text, emoji, no-match, or recovery actions unless qa.md explicitly asks for them.
- Judge PASS, FAIL, or BLOCKED only against the written `<expect>` and browser evidence.
- If a written action is unsafe, impossible, or ambiguous, report that action result directly instead of inventing a safer substitute.

Aggressive fault-seeking starts only after all executable qa.md scenarios are complete.
```

- [ ] **Step 3: Update Coverage Tracking**

Replace the final sentence of `Coverage Tracking` with:

```markdown
After all scenarios finish, compare covered traits against the current interactive element inventory and inferred behaviorCases from `references/behavior-testing.md`. If strict qa.md-only verification was requested, report uncovered behavior as intentionally not explored. Otherwise, use `references/free-exploration.md` for aggressive supplemental exploration of all uncovered in-scope elements and behavior cases.
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "checklist-style|Strict Scenario Contract|Do not add extra actions|strict qa.md-only|Aggressive fault-seeking starts" skills/qa/references/case-verification.md
```

Expected: Output includes the strict scenario boundary and supplemental exploration opt-out.

- [ ] **Step 5: Commit**

```bash
git add skills/qa/references/case-verification.md
git commit -m "docs(qa): keep qa scenarios deterministic"
```

---

### Task 5: Update Stopping Criteria for Aggressive Free Mode

**Files:**
- Modify: `skills/qa/references/stopping-criteria.md`

- [ ] **Step 1: Replace free exploration stopping bullets**

Replace the `### Free Exploration Mode` bullet list with:

```markdown
The exploration ends only when aggressive coverage converges:

- `{OUTPUT_DIR}/coverage.json` exists and is current.
- `pending` element actions are empty.
- `behaviorCases.pending` has no untested high-risk or medium-risk behavior variants.
- Any remaining low-risk behavior variants are in `behaviorCases.skipped` with clear reasons.
- `stablePasses >= coverageThresholds.stablePassesRequired`.
- The scope container or page has reached its scroll boundary.
- No open menu, popover, dialog, tooltip, or dynamically revealed panel remains unexplored.
- Every discovered in-scope stable key is in `visited`, `skipped`, `outOfScope`, or `halted`.
- No confirmed P0 halt is active.
- Stop immediately after evidence and one minimal reproduction confirm a P0 halt.
```

- [ ] **Step 2: Replace case verification stopping rules**

Replace `### Case Verification Mode` with:

```markdown
### Case Verification Mode

1. Execute all `<scenario>` blocks from qa.md exactly as written until all scenarios are complete, failed, or blocked.
2. If the user requested strict qa.md-only verification, stop after scenario reporting and mark uncovered behavior as intentionally not explored.
3. Otherwise, identify elements and behavior cases not exercised by any scenario action.
4. Run aggressive supplemental exploration for uncovered in-scope behavior and elements.
5. Stop only when scenario execution and supplemental aggressive coverage are both complete, or when a confirmed P0 halt stops exploration.
```

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "aggressive coverage converges|behaviorCases.pending|strict qa.md-only|supplemental aggressive coverage|confirmed P0" skills/qa/references/stopping-criteria.md
```

Expected: Output includes aggressive stopping rules and strict qa.md-only handling.

- [ ] **Step 4: Commit**

```bash
git add skills/qa/references/stopping-criteria.md
git commit -m "docs(qa): update stopping rules for aggressive coverage"
```

---

### Task 6: Update Reporting and HTML Tags

**Files:**
- Modify: `skills/qa/references/evidence-and-reporting.md`
- Modify: `skills/qa/templates/qa-report-template.md`
- Modify: `skills/qa/templates/qa-report-template.html`

- [ ] **Step 1: Add behavior variant reporting requirements**

Add this paragraph after `## Coverage Status` in `evidence-and-reporting.md`:

```markdown
For aggressive free exploration and aggressive supplemental exploration, every behavior step must identify its `intent`, `variant`, and `riskLevel` when those fields exist in `coverage.json`. Report these as compact tags, for example: `fault-seeking`, `boundary`, `high risk`. Scenario verification steps should use `checklist` intent and should not be labeled as aggressive unless qa.md explicitly asked for adversarial input.

Do not add a new complex filter system for the first version. Preserve the existing result filters (`All`, `Pass`, `Issues`, `Excluded`, `Inconclusive`) and search behavior. Intent, variant, and risk are displayed as compact tags so the reader can understand why each action was performed.
```

- [ ] **Step 2: Add required report separation**

Add this paragraph under `Required top-level sections`:

```markdown
When qa.md exists, keep `Scenario Results` separate from `Aggressive Supplemental Exploration`. Scenario failures represent checklist expectation drift. Supplemental findings represent uncovered behavior discovered after scenario verification.
```

- [ ] **Step 3: Add Markdown report tag shape**

Add this example under the `## Exploration Log` placeholder area in `qa-report-template.md`:

```markdown
<!-- Example aggressive exploration step shape:
### Step {NNN}: {action title}

Tags: `{result}` `{intent}` `{variant}` `{risk}`

- Intent: `{checklist | fault-seeking | coverage}`
- Variant: `{normal | boundary | interruption | sequence | recovery | state | console-risk}`
- Risk: `{high | medium | low}`
- Action: {action}
- Expected: {expected observable behavior}
- Actual: {actual observable behavior}
- Snapshot diff: [Snapshot diff](diffs/step-{NNN}.txt)

![Before](screenshots/step-{NNN}.png) ![Target](screenshots/step-{NNN}-target.png) ![After](screenshots/step-{NNN}-after.png)
-->
```

- [ ] **Step 4: Update Markdown template comments**

In `qa-report-template.md`, replace:

```markdown
<!-- Free exploration mode: skip directly to Exploration Log -->
```

With:

```markdown
<!-- Free exploration mode: Exploration Log entries should include intent/variant/risk tags when available. -->
<!-- Case verification mode: keep Scenario Results separate from Aggressive Supplemental Exploration entries. -->
```

- [ ] **Step 5: Update HTML step entry placeholder**

In `qa-report-template.html`, change the sample step entry opening from:

```html
<div class="step-entry" data-result="{resultSlug}">
```

To:

```html
<div class="step-entry" data-result="{resultSlug}" data-intent="{intentSlug}" data-variant="{variantSlug}" data-risk="{riskSlug}">
```

Then change the tag row inside the step header from:

```html
<span class="step-tag {resultSlug}">{result}</span>
```

To:

```html
<span class="step-tag {resultSlug}">{result}</span>
<span class="step-tag">{intent}</span>
<span class="step-tag">{variant}</span>
<span class="step-tag">{risk}</span>
```

- [ ] **Step 6: Preserve existing HTML filters**

In `qa-report-template.html`, keep the existing result filter buttons unchanged:

```html
<button class="filter-button active" type="button" data-log-filter="all">All</button>
<button class="filter-button" type="button" data-log-filter="pass">Pass</button>
<button class="filter-button" type="button" data-log-filter="issues">Issues</button>
<button class="filter-button" type="button" data-log-filter="excluded">Excluded</button>
<button class="filter-button" type="button" data-log-filter="inconclusive">Inconclusive</button>
```

Do not add `data-log-filter="boundary"`, `data-log-filter="interruption"`, or other variant-specific filters in this plan. Variant filtering can be added later if report usage shows it is worth the UI cost.

- [ ] **Step 7: Verify**

Run:

```bash
rg -n "intent|variant|riskLevel|Aggressive Supplemental Exploration|data-intent|data-variant|data-risk|Do not add a new complex filter system|data-log-filter=\\\"issues\\\"" skills/qa/references/evidence-and-reporting.md skills/qa/templates/qa-report-template.md skills/qa/templates/qa-report-template.html
```

Expected: Output includes reporting requirements, Markdown tag shape, HTML data attributes, and existing result filters.

- [ ] **Step 8: Commit**

```bash
git add skills/qa/references/evidence-and-reporting.md skills/qa/templates/qa-report-template.md skills/qa/templates/qa-report-template.html
git commit -m "docs(qa): report aggressive exploration intent tags"
```

---

### Task 7: Run Cross-Reference Verification

**Files:**
- Read: `skills/qa/SKILL.md`
- Read: `skills/qa/references/free-exploration.md`
- Read: `skills/qa/references/behavior-testing.md`
- Read: `skills/qa/references/case-verification.md`
- Read: `skills/qa/references/stopping-criteria.md`
- Read: `skills/qa/references/evidence-and-reporting.md`
- Read: `skills/qa/templates/qa-report-template.md`
- Read: `skills/qa/templates/qa-report-template.html`

- [ ] **Step 1: Verify mode wording is consistent**

Run:

```bash
rg -n "aggressive|fault-seeking|checklist|qa.md exactly|strict qa.md-only|supplemental" skills/qa
```

Expected:

- Free exploration references aggressive fault-seeking.
- Case verification references checklist-style exact execution.
- Supplemental exploration is clearly after scenario execution.
- Strict qa.md-only is recognized.

- [ ] **Step 2: Verify no product-specific behavior leaked into baseline**

Run:

```bash
rg -n "ChatComposer|repository|project|assignee|issue type|workspace|Notion command|Slack channel|Linear issue" skills/qa/references/behavior-testing.md
```

Expected: No output.

- [ ] **Step 3: Verify templates still include existing required report features**

Run:

```bash
rg -n "\\[data-log-filter\\]|\\[data-log-search\\]|mediumZoom|window\\.qaImageZoom|session\\.webm|step-photos|Snapshot diff" skills/qa/templates/qa-report-template.html skills/qa/SKILL.md skills/qa/references/evidence-and-reporting.md
```

Expected: Output includes log filtering/search, screenshot zoom, session recording, step photos, and snapshot diff links.

- [ ] **Step 4: Verify git diff is docs-only**

Run:

```bash
git diff --stat -- skills/qa docs/superpowers/plans/2026-06-12-qa-aggressive-free-mode.md
```

Expected: Only QA skill Markdown/template files and this plan file are listed.

- [ ] **Step 5: Commit**

```bash
git add skills/qa docs/superpowers/plans/2026-06-12-qa-aggressive-free-mode.md
git commit -m "docs(qa): plan aggressive free exploration mode"
```

---

## Self-Review Checklist

- Spec coverage: This plan covers the requested semantic split: free mode becomes aggressive fault-seeking; qa.md remains checklist-style; supplemental exploration after qa.md is aggressive but optional.
- Product specificity: The behavior baseline stays product-agnostic. Product-specific behavior must come from snapshot, visible UI, qa.md, init QA inputs, and revealed overlays.
- Report clarity: Reports distinguish `Scenario Results` from `Aggressive Supplemental Exploration` and tag behavior steps by intent, variant, and risk.
- Report scope: The first version only displays intent, variant, and risk tags. It keeps the existing result filters and search instead of adding variant-specific filters.
- Stop criteria: Free mode cannot converge while high-risk or medium-risk behavior variants remain pending.
- Backward compatibility: Existing report template features stay required: filters, search, medium-zoom, session recording, screenshots, and snapshot diff links.
