---
name: qa
description: >-
  Systematically test a web page using agent-browser. Two modes: free exploration
  (no qa.md) discovers bugs via 7-item checklist, case verification (with qa.md)
  validates expected behaviors. Produces Markdown report, Apple-style HTML report,
  and 8-dimension health score. Use when asked to "qa", "QA", "test this page",
  "find bugs", "bug hunt", "quality check", or "test this site".
argument-hint: "[--init] <url> [output-dir]"
arguments:
  - url
  - output-dir
---

# QA

Systematically test a web page by exploring every interactive element, recording evidence, and producing a health score. Two modes:

- **Free exploration** (no qa.md): exhaustively test all interactive elements against a 7-item checklist
- **Case verification** (with qa.md): execute user-defined scenarios with action/expect pairs, then free-explore uncovered elements

Does NOT fix bugs. Discovery and reporting only.

## Inputs

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| URL | Yes | - | Target page URL |
| qa.md | No | - | Test case file with `<scenario>` blocks |
| `--init` | No | false | Generate qa.md from existing e2e tests before verification |
| Output directory | No | `./qa-output/` | Where to save artifacts |

If the user says something like "qa example.com", start immediately. Do not ask clarifying questions unless the URL is missing.

Always use `agent-browser` directly -- never `npx agent-browser`. The direct binary is faster.

`--profile Default` must come BEFORE the `open` subcommand: `agent-browser --profile Default open URL`.

## Setup

1. Create output directories:

```bash
mkdir -p {OUTPUT_DIR}/screenshots {OUTPUT_DIR}/diffs {OUTPUT_DIR}/snapshots
```

2. Detect mode: check if a `qa.md` file was provided or exists in the current directory.

If `--init` flag is provided:

1. Detect e2e test directory (see --init Mode section below)
2. Parse test files and generate qa.md
3. Continue to Execute Scenarios with the generated qa.md
4. After self-verification, ask the user if they want to keep/edit the generated qa.md

3. Launch the browser and wait for the page to fully load:

```bash
agent-browser --profile Default open {URL}
agent-browser wait --load networkidle
```

4. Capture the initial annotated screenshot and discover interactive elements:

```bash
agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/initial.png
agent-browser snapshot -i
agent-browser console
agent-browser errors
```

5. Count the interactive elements and classify them by role. Note the distribution in the report header (e.g., "5 buttons, 3 textboxes, 2 selects, 1 checkbox").

6. If qa.md exists, parse all `<scenario>` blocks. Proceed to Execute Scenarios. Otherwise, proceed directly to Free Explore.

## qa.md Format

The user provides a qa.md file with test scenarios in this format:

```xml
<scenario name="登录流程" url="/login">
  <action>填写 Email 为 test@example.com</action>
  <expect>无报错</expect>

  <action>填写 Password 为 wrong-password</action>
  <expect>无报错</expect>

  <action>点击 "Sign In" 按钮</action>
  <expect>出现错误提示 "邮箱或密码不正确"</expect>
</scenario>
```

### Parsing Rules

- Each `<scenario>` has a `name` attribute and optional `url` attribute
- Relative scenario URLs resolve against the original target URL origin
- Each scenario contains sequential `<action>` / `<expect>` pairs
- Action text is natural language -- match to agent-browser `@eN` elements by semantic similarity (role + label)
- Expect text is natural language -- judge PASS or FAIL based on post-action diff + screenshot

### Processing

For each scenario:
1. If `url` attribute present: resolve it against the target URL origin, then `agent-browser goto <url>` + `agent-browser wait 1000`
2. For each action/expect pair:
   - Screenshot before: `{OUTPUT_DIR}/screenshots/step-{NNN}.png`
   - Capture baseline snapshot: `agent-browser snapshot > {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt`
   - Match action text to the closest current `@eN` element from `agent-browser snapshot -i`
   - Record coverage using stable traits: URL/path, role, accessible name/label, and nearby text. Do not rely on `@eN` across snapshots.
   - Execute the operation (click/fill/select based on matched element's role)
   - `agent-browser wait 1000`
   - Screenshot after: `{OUTPUT_DIR}/screenshots/step-{NNN}-after.png`
   - Diff the current state against the pre-action snapshot: `agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt`
   - `agent-browser snapshot` only if the full current accessibility tree is needed for judgment
   - `agent-browser console` to check for errors
   - Judge: do the observed result and `agent-browser diff snapshot` output match the `<expect>` text?
   - PASS -> continue. FAIL -> assign ISSUE-NNN, record evidence
3. Log result in report with PASS/FAIL status

### After All Scenarios

Track which stable element traits were exercised by scenarios. After scenarios complete, free-explore any elements not covered by any scenario action. Follow the Free Explore workflow below.

## --init Mode: Generate qa.md from E2E Tests

When the user passes `--init`, bootstrap qa.md from existing e2e test suites instead of starting from scratch.

### 1. Detect E2E Test Directory

Scan for common patterns in the project root:

| Path Pattern | Framework |
|-------------|-----------|
| `cypress/e2e/` | Cypress |
| `e2e/` | Playwright (default) |
| `tests/e2e/` | Playwright (alt) |
| `__tests__/` | Jest / Vitest |
| `playwright/` | Playwright (alt) |
| `spec/` | RSpec (Ruby) |

```bash
ls -d cypress/e2e e2e tests/e2e __tests__ playwright spec 2>/dev/null
```

If none found, ask the user for the test directory path. If user has no e2e tests, fall back to normal free exploration mode.

### 2. Parse Test Files -> Extract Scenarios

For each test file in the detected directory:

- Identify `describe` / `it` / `test` blocks -> use as `<scenario name>`
- Extract interaction calls as `<action>` text:
  - Cypress: `cy.get().click()` -> "点击 {element} 按钮"
  - Cypress: `cy.get().type()` -> "填写 {field} 为 {value}"
  - Playwright: `page.click()` -> "点击 {element}"
  - Playwright: `page.fill()` -> "填写 {field} 为 {value}"
  - Playwright: `page.goto()` -> scenario `url` attribute
  - Jest/Vitest: `fireEvent.click()` -> "点击 {element}"
  - RSpec: `click_button` / `fill_in` -> equivalent actions
- Extract assertion calls as `<expect>` text:
  - Cypress: `cy.contains('text')` -> "出现 'text'"
  - Cypress: `cy.get('.error').should('be.visible')` -> "错误提示可见"
  - Playwright: `expect(page.locator()).toContainText('text')` -> "包含文字 'text'"
  - Playwright: `expect(page).toHaveURL('/path')` -> "跳转到 /path"
  - Jest: `expect(element.textContent).toContain('text')` -> "包含文字 'text'"
  - RSpec: `expect(page).to have_text('text')` -> "包含文字 'text'"
- Convert selector-based code to natural language descriptions

Example transformation:

```javascript
// Original Playwright test
test('login with wrong password', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'wrong-password');
  await page.click('button[type="submit"]');
  await expect(page.locator('.error')).toContainText('邮箱或密码不正确');
});
```

```xml
<!-- Generated qa.md -->
<scenario name="login with wrong password" url="/login">
  <action>填写 email 为 test@example.com</action>
  <expect>无报错</expect>

  <action>填写 password 为 wrong-password</action>
  <expect>无报错</expect>

  <action>点击 submit 按钮</action>
  <expect>出现错误提示 "邮箱或密码不正确"</expect>
</scenario>
```

### 3. Self-Verify

After generating qa.md, automatically enter case verification mode:

- Run all generated scenarios against the live page
- Execute each `<action>` and verify each `<expect>`
- Report results: "Generated N scenarios from M test files. Self-verify: X PASS, Y FAIL"
- FAIL cases indicate test-code-to-browser drift -- the e2e test asserts one thing but the browser shows another

### 4. Output

- Write generated qa.md to the output directory
- Self-verification results included in the standard QA report
- User can review and edit qa.md before future runs

If `--init` is not specified, skip this entire section.

## Free Explore

If no qa.md: explore all interactive elements on the page.
If qa.md: after scenarios complete, explore elements not covered by any scenario action.

Work through interactive elements top-to-bottom, left-to-right.

### Per-Element Workflow

1. **Screenshot before**: `agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}.png`
2. **Baseline snapshot**: `agent-browser snapshot > {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt`
3. **Execute operation** based on the element's ARIA role (see Action Strategy below).
4. **Wait**: `agent-browser wait 1000`
5. **Screenshot after**: `agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-after.png`
6. **Snapshot diff**: `agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt`
7. **Current snapshot**: run `agent-browser snapshot` only if the diff needs more context
8. **Console**: `agent-browser console` + `agent-browser errors`
9. **Judge** the interaction against the 7-Item Checklist and Issue Taxonomy (see references/issue-taxonomy.md)
10. If issue found: assign ISSUE-NNN, write to report immediately
11. Continue to next element

### Action Strategy

| Role | Action | Details |
|------|--------|---------|
| button | `agent-browser click @eN` | Wait up to 2s, observe response |
| textbox / searchbox | `agent-browser fill @eN "content"` | Use meaningful test content: emails get `test@example.com`, search gets `test query` |
| combobox | `agent-browser click @eN` then select option | Open dropdown, screenshot options, pick first reasonable option |
| checkbox / switch | `agent-browser click @eN` | Toggle state, observe change |
| radio | `agent-browser click @eN` | Select first option in group |
| menuitem | `agent-browser click @eN` | Open menu, click item |
| slider | `agent-browser eval` or drag | Adjust to midpoint |
| tab | `agent-browser click @eN` | Switch tab panel, observe content change |
| dialog | Handle via `agent-browser dialog accept` or `dismiss` | Record dialog content |

### Skip Rules

Do NOT interact with:
- Links that navigate to external domains (would leave the page)
- Download links
- Elements already interacted with in a previous step
- Elements that are disabled or hidden

### Stopping Condition

The exploration ends when all interactive elements on the page have been explored. If scrolling reveals new elements, discover them with `agent-browser snapshot -i`, add to queue, and continue. No issue count limit.

## 8-Dimension Health Score

Weighted average. Each category starts at 100, deduct per finding:

| Category | Weight | Scoring |
|----------|--------|---------|
| Console | 15% | 0 errors=100, 1-3=70, 4-10=40, 10+=10 |
| Links | 10% | each broken link -15 (min 0) |
| Visual | 10% | critical -25, high -15, medium -8, low -3 |
| Functional | 20% | same scale |
| UX | 15% | same scale |
| Performance | 10% | same scale |
| Content | 5% | same scale |
| Accessibility | 15% | same scale |

Final score = sum(category_score * weight)

Save as `{OUTPUT_DIR}/baseline.json`:

```json
{
  "date": "YYYY-MM-DD",
  "url": "<target>",
  "healthScore": 0,
  "categoryScores": { "console": 0, "links": 0, "visual": 0, "functional": 0, "ux": 0, "performance": 0, "content": 0, "accessibility": 0 },
  "issues": [{ "id": "ISSUE-001", "title": "...", "severity": "...", "category": "..." }]
}
```

## Issue Severity

| Level | Definition |
|-------|------------|
| Critical | Blocks core workflow, causes data loss, or crashes |
| High | Major feature broken, no workaround |
| Medium | Feature works with noticeable problems, workaround exists |
| Low | Minor cosmetic or polish issue |

## Evidence & Screenshots

Both modes use the same screenshot protocol -- every action gets a before/after pair:

```text
screenshots/
  step-001.png          # before action
  step-001-after.png    # after action
  ...
diffs/
  step-001.txt          # agent-browser diff snapshot output
snapshots/
  step-001-before.txt   # optional baseline snapshot archive
```

- Every action gets before + after screenshots, regardless of PASS/FAIL
- Every action gets an `agent-browser diff snapshot` text artifact in `diffs/`
- PASS results still have full screenshot evidence (enables cross-run visual diff)
- FAIL results additionally get an annotated screenshot: `agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/issue-{NNN}-result.png`

### Evidence Tiers

- **Interactive bugs**: before screenshot -> baseline snapshot -> action -> after screenshot -> `agent-browser diff snapshot`
- **Static bugs**: single `agent-browser screenshot --annotate`

## Report Format

Write the report incrementally as you explore. Append each step and each issue as you find them so nothing is lost if the session is interrupted. Do not batch all writing for the end.

The final report goes to `{OUTPUT_DIR}/report.md`.

### Free Exploration Mode

```markdown
# QA Report: {URL}

## Session Info
| Field | Value |
|-------|-------|
| URL | {url} |
| Date | {date} |
| Mode | Free Exploration |
| Interactive elements found | {count} |
| Elements explored | {count} |
| Issues found | {count} |

## Health Score

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Console | {score} | 15% | {weighted} |
| Links | {score} | 10% | {weighted} |
| Visual | {score} | 10% | {weighted} |
| Functional | {score} | 20% | {weighted} |
| UX | {score} | 15% | {weighted} |
| Performance | {score} | 10% | {weighted} |
| Content | {score} | 5% | {weighted} |
| Accessibility | {score} | 15% | {weighted} |
| **Total** | | | **{final}** |

## Exploration Log

### Step 1: Click @e3 "Submit" button
- **Before**: ![step-001](screenshots/step-001.png)
- **Action**: click @e3
- **After**: ![step-001-after](screenshots/step-001-after.png)
- **Diff**: [step-001 diff](diffs/step-001.txt)
- **Observation**: [what happened, what changed]
- **Issue**: None / ISSUE-NNN

[... one entry per element explored ...]

## Issues

### ISSUE-001: [Short title]
| Field | Value |
|-------|-------|
| Severity | critical / high / medium / low |
| Category | visual / functional / ux / content / performance / console / accessibility |
| Element | @eN role "label" |
| Evidence | step-NNN screenshots, diffs/step-NNN.txt |
| Description | [what is wrong, what was expected, what actually happened] |
| Recommendation | [how to fix it] |

[... one block per issue ...]

## Summary
| Severity | Count |
|----------|-------|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |
| **Total** | **T** |
```

### Case Verification Mode

```markdown
# QA Report: {URL}

## Session Info
| Field | Value |
|-------|-------|
| URL | {url} |
| Date | {date} |
| Mode | Case Verification |
| qa.md | [filename or "inline"] |
| Scenarios | {count} |
| Total actions | {count} |
| PASS | {count} |
| FAIL | {count} |
| Issues found | {count} |

## Health Score

[Same 8-dimension table as above]

## Scenario Results

| Scenario | Total | PASS | FAIL |
|----------|-------|------|------|
| {name} | {total} | {pass} | {fail} |

## Scenario Details

### Scenario: {name}
- <action>{action text}</action>  PASS
- <action>{action text}</action>  FAIL -- 期望 "{expect text}"，实际 {what happened}

[... one section per scenario ...]

## Uncovered Elements

### Step N: Click @e7 "Remember me" checkbox
- **Before**: ![step-NNN](screenshots/step-NNN.png)
- **Action**: click @e7
- **After**: ![step-NNN-after](screenshots/step-NNN-after.png)
- **Diff**: [step-NNN diff](diffs/step-NNN.txt)
- **Observation**: [what happened]
- **Issue**: None / ISSUE-NNN

[... free exploration of elements not covered by scenarios ...]

## Issues

[Same format as free exploration mode]

## Summary

| Severity | Count |
|----------|-------|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |
| **Total** | **T** |
```

## Cleanup

After exploring all elements:

1. Compute the final 8-dimension health score
2. Re-read the report and update summary counts to match actual issues found
3. Generate the HTML report from the Markdown report using the template at `templates/qa-report-template.html` and the Apple DESIGN.md style guide
4. Save `baseline.json`
5. Close the browser:

```bash
agent-browser close
```

6. Ask the user:

> "是否将本次探索结果更新到 qa.md？"

Options:
- **Create qa.md**: scaffold all discovered interactive elements as `<action>` tags with actual observed behavior written into `<expect>`. Example:

```xml
<scenario name="{page name}" url="{url}">
  <action>点击 "Submit" 按钮</action>
  <expect>出现 "保存成功" 提示，按钮变灰</expect>

  <action>填写 Email 为 test@example.com</action>
  <expect>无报错，输入框显示填入内容</expect>
</scenario>
```

- **Update qa.md** (if one was provided): append newly discovered elements that weren't in the original qa.md as new action/expect pairs in the existing scenario or a new scenario
- **Skip**: user declines, no qa.md changes

## Artifacts

- `{OUTPUT_DIR}/report.md` -- Markdown report
- `{OUTPUT_DIR}/report.html` -- Apple-style HTML report
- `{OUTPUT_DIR}/baseline.json` -- Health score baseline for cross-run comparison
- `{OUTPUT_DIR}/screenshots/` -- All before/after screenshots
- `{OUTPUT_DIR}/diffs/` -- `agent-browser diff snapshot` output for each interaction
- `{OUTPUT_DIR}/snapshots/` -- Optional pre-action snapshot baselines used for diffing

## Guidance

- **Read references first.** Before judging issues or computing scores, read `references/issue-taxonomy.md` and `references/stopping-criteria.md`.
- **Judge as a user, not a tester.** You are exploring like a real person. If something feels wrong, investigate.
- **Write findings incrementally.** Append each issue to the report as you discover it. If the session is interrupted, findings are preserved. Never batch all issues for the end.
- **Use the right snapshot commands.** `snapshot -i` finds clickable/fillable elements. `agent-browser diff snapshot` is the primary way to understand what changed after an action. `snapshot` (no flag) is for reading full page context when the diff is not enough.
- **Screenshot every step.** Capture before and after for every action so someone reading the report can follow along visually.
- **Check console after every interaction.** Many bugs are invisible in the UI but show up as JS errors or failed requests. Console is the most objective discovery channel.
- **Verify before documenting.** Retry the issue once to confirm it is reproducible. If it cannot be reproduced consistently, note it as intermittent rather than a confirmed issue.
- **Never read the target app's source code.** You are testing as a user. All findings must come from what you observe in the browser.
- **Never delete output files.** Do not `rm` screenshots, videos, or the report mid-session. Work forward, not backward.
- **Pace the exploration.** Use `agent-browser wait 1000` between actions to let the page settle.
- **Be thorough but use judgment.** Spend more time on complex interactions (forms, modals, multi-state controls) and less on simple static buttons.
- **Skip navigation links.** This is single-page exploration in free mode. Do not follow links that would navigate away from the current URL. Note their existence but do not click them.
- **Only use `agent-browser` directly.** Never use `npx agent-browser` or any other browser automation tool.
- **Match qa.md actions to elements by semantic similarity.** When executing qa.md scenarios, match the natural language action text to the closest interactive element by role and label. If no match is found, report a FAIL for that action.
