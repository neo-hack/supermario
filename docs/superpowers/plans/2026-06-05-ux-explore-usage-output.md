# UX Explore Usage Output Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `ux-explore` free mode output into `ux-report.md/html` and `usage.md/html`, while giving UX steps the same before/target/after screenshot evidence model as QA.

**Architecture:** Keep this documentation-only, following the existing Agent Skill pattern. Keep `skills/ux-explore/SKILL.md` as the route and mode-selection entrypoint, move free-mode execution details and usage/output rules into references, add two HTML templates under `skills/ux-explore/templates/`, and enforce the contracts with structure tests in `tests/ux-explore/structure.test.js`.

**Tech Stack:** Markdown Agent Skill documentation, HTML templates, Node.js `node:test`, `assert`, `agent-browser` CLI guidance.

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `skills/ux-explore/SKILL.md` | Route and mode-selection entrypoint. It points workers to the free-mode and usage-output references. |
| `skills/ux-explore/references/free-mode.md` | Free-mode traversal, per-step evidence, action strategy, skip rules, and screenshot naming. |
| `skills/ux-explore/references/usage-output.md` | UX report, usage guide, Markdown/HTML output rules, usage drafting, and cleanup behavior. |
| `skills/ux-explore/templates/ux-report-template.html` | HTML template for the UX critique report, including a three-column step evidence grid. |
| `skills/ux-explore/templates/usage-template.html` | HTML template for discovered product usage documentation. |
| `tests/ux-explore/structure.test.js` | Structure tests that enforce evidence, artifact, template, usage guide, and English-only contracts. |
| `docs/superpowers/specs/2026-06-05-ux-explore-usage-output-design.md` | Approved design source. Read-only during implementation. |

## Scope Check

This plan covers one subsystem: `ux-explore` skill instructions, templates, and structure tests. It does not add a runtime Markdown renderer, automatic replay of `usage.md`, a separate `usage.html` CLI, coverage ledger behavior, or QA skill changes.

## Task 1: Add Before/Target/After Evidence To UX Steps

**Files:**
- Modify: `tests/ux-explore/structure.test.js`
- Modify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Write the failing evidence test**

Append this test to `tests/ux-explore/structure.test.js` before the English-only test:

```js
test('ux-explore captures before, target, and after screenshots per step', () => {
  const skill = readSkill();

  assert.match(skill, /screenshots\/step-\{NNN\}\.png/);
  assert.match(skill, /screenshots\/step-\{NNN\}-target\.png/);
  assert.match(skill, /screenshots\/step-\{NNN\}-after\.png/);
  assert.match(skill, /agent-browser highlight @eN/);
  assert.match(skill, /Before.*Target.*After/s);
  assert.match(skill, /\*\*Target\*\*: \!\[step-001-target\]\(screenshots\/step-001-target\.png\)/);
  assert.match(skill, /A step without before, target, and after screenshots is incomplete/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because the current UX workflow captures only before and after screenshots.

- [ ] **Step 3: Update per-element workflow**

In `skills/ux-explore/SKILL.md`, replace the current `### Per-Element Workflow` numbered list with:

````markdown
1. **Screenshot before** the interaction:

```bash
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}.png
```

2. **Capture the baseline snapshot**:

```bash
agent-browser snapshot > {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt
```

3. **Highlight the target element and screenshot the target**:

```bash
agent-browser highlight @eN
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-target.png
```

4. **Execute the operation** based on the element's ARIA role (see Action Strategy below).
5. **Wait** for the page to settle: `agent-browser wait 1000`.
6. **Screenshot after** the interaction:

```bash
agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-after.png
```

7. **Diff the snapshot**:

```bash
agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt
```

8. Use `agent-browser snapshot` only when the diff needs more page context.
9. **Check console** for errors triggered by the interaction: `agent-browser console`.
10. **Judge** the interaction against the Intuition Criteria, the Interaction States Checklist, and evaluate interaction feel:
   - **Response feel**: Does clicking feel responsive? Any delays or missing loading states?
   - **Transition quality**: Are transitions intentional or generic/absent?
   - **Feedback clarity**: Did the action clearly succeed or fail? Is the feedback immediate?
   - **Form polish**: Focus states visible? Validation timing correct? Errors near the source?
11. **Content & microcopy check** on labels, errors, and feedback:
   - Button labels specific ("Save API Key" not "Submit")?
   - Error messages say what happened + why + what to do?
   - No happy talk (welcome paragraphs, self-congratulatory text)?
   - Loading states end with `…` ("Saving…" not "Saving...")?
   - Destructive actions have confirmation?
12. **Update the goodwill meter** based on drains and fills from this step.
13. **Log** the observation in first person. If an issue is found, assign a UX-NNN ID and record it.
````

- [ ] **Step 4: Update screenshot naming**

Replace the current screenshot naming block with:

````markdown
```text
{OUTPUT_DIR}/screenshots/step-{NNN}.png          # before action
{OUTPUT_DIR}/screenshots/step-{NNN}-target.png   # highlighted target
{OUTPUT_DIR}/screenshots/step-{NNN}-after.png    # after action
```

Increment `{NNN}` for each element explored (001, 002, 003...). A step without before, target, and after screenshots is incomplete.
````

- [ ] **Step 5: Update report step example**

In the report template block inside `skills/ux-explore/SKILL.md`, replace the current step example:

```markdown
- **Before**: ![step-001](screenshots/step-001.png)
- **Action**: click @e3
- **After**: ![step-001-after](screenshots/step-001-after.png)
```

with:

```markdown
- **Before**: ![step-001](screenshots/step-001.png)
- **Target**: ![step-001-target](screenshots/step-001-target.png)
- **Action**: click @e3
- **After**: ![step-001-after](screenshots/step-001-after.png)
```

- [ ] **Step 6: Run the test to verify it passes**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS for `ux-explore captures before, target, and after screenshots per step`.

- [ ] **Step 7: Commit evidence update**

Run:

```bash
git add skills/ux-explore/SKILL.md tests/ux-explore/structure.test.js
git commit -m "docs(ux-explore): capture target screenshots"
```

## Task 2: Split Markdown Outputs Into `ux-report.md` And `usage.md`

**Files:**
- Modify: `tests/ux-explore/structure.test.js`
- Modify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Write the failing artifact split test**

Append this test to `tests/ux-explore/structure.test.js` before the English-only test:

```js
test('ux-explore writes separate UX report and usage guide markdown', () => {
  const skill = readSkill();

  assert.match(skill, /~\/\.config\/supermario\/ux\/YYYY-MM-DD-<ux-name>\//);
  assert.match(skill, /derive `ux-name` from the target host, route, journey goal, or requested scope/);
  assert.match(skill, /Resolve `\{OUTPUT_DIR\}` to `~\/\.config\/supermario\/ux\/YYYY-MM-DD-<ux-name>\/`/);
  assert.match(skill, /ux-report\.md/);
  assert.match(skill, /usage\.md/);
  assert.match(skill, /The final UX report goes to `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(skill, /Free mode also writes `\{OUTPUT_DIR\}\/usage\.md`/);
  assert.match(skill, /Usage Guide/);
  assert.match(skill, /Purpose: Subscribe to a new RSS source\./);
  assert.match(skill, /Entry point: "Add feed" button in the sidebar\./);
  assert.match(skill, /Steps:/);
  assert.match(skill, /Result:/);
  assert.match(skill, /Related controls:/);
  assert.match(skill, /Evidence:/);
  assert.match(skill, /Evidence screenshots:/);
  assert.match(skill, /\!\[Before\]\(screenshots\/step-003\.png\)/);
  assert.match(skill, /\!\[Target\]\(screenshots\/step-003-target\.png\)/);
  assert.match(skill, /\!\[After\]\(screenshots\/step-003-after\.png\)/);
  assert.match(skill, /Limitations:/);
  assert.match(skill, /UX report: ux-report\.md/);
  assert.match(skill, /Usage guide: usage\.md/);
  assert.doesNotMatch(skill, /The final report goes to `\{OUTPUT_DIR\}\/report\.md`/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because the skill still describes `report.md` and does not define `usage.md`.

- [ ] **Step 3: Update setup artifact wording**

In `skills/ux-explore/SKILL.md`, replace:

```markdown
1. Create output directories and start the report file:
```

with:

```markdown
1. Create output directories and start the Markdown artifacts:
```

Then add this text after the setup command block:

```markdown
When no output directory is provided, derive `ux-name` from the target host, route, journey goal, or requested scope. Resolve `{OUTPUT_DIR}` to `~/.config/supermario/ux/YYYY-MM-DD-<ux-name>/`, using a short lowercase slug such as `vercel-home`, `rss-subscription-journey`, or `settings-panel`.

Write UX findings to `{OUTPUT_DIR}/ux-report.md`. This file is the UX critique artifact: interaction evidence, goodwill score, UX issues, summary, and links to artifacts.

Write discovered product usage to `{OUTPUT_DIR}/usage.md`. This file is descriptive, not evaluative: what users can do, where the entry point is, the steps, the visible result, related controls, and evidence.
```

- [ ] **Step 4: Add the usage guide format section**

Add this section immediately before `## Report Format` in `skills/ux-explore/SKILL.md`:

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

Evidence screenshots:
![Before](screenshots/step-003.png) ![Target](screenshots/step-003-target.png) ![After](screenshots/step-003-after.png)

Limitations:
- None observed.
```

Every usage entry must include: title, Purpose, Entry point, Steps, Result, Related controls, Evidence, Evidence screenshots, and Limitations.
````

- [ ] **Step 5: Rename the report format wording**

Replace:

```markdown
Write the report incrementally as you explore. Append each step and each issue as you find them so nothing is lost if the session is interrupted. Do not batch all writing for the end.

The final report goes to `{OUTPUT_DIR}/report.md`:
```

with:

```markdown
Write the UX report incrementally as you explore. Append each step and each UX issue to `{OUTPUT_DIR}/ux-report.md` as you find them so nothing is lost if the session is interrupted. Do not batch all writing for the end.

The final UX report goes to `{OUTPUT_DIR}/ux-report.md`:
```

- [ ] **Step 6: Update the artifacts list**

In the report template block, replace:

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
- Usage guide: usage.md
- Full video: explore-video.webm
- Screenshots: screenshots/
- Snapshot diffs: diffs/
```

- [ ] **Step 7: Run the test to verify it passes**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS for `ux-explore writes separate UX report and usage guide markdown`.

- [ ] **Step 8: Commit markdown split**

Run:

```bash
git add skills/ux-explore/SKILL.md tests/ux-explore/structure.test.js
git commit -m "docs(ux-explore): split report and usage markdown"
```

## Task 3: Teach Free Mode To Maintain A Usage Draft

**Files:**
- Modify: `tests/ux-explore/structure.test.js`
- Modify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Write the failing usage draft test**

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

Add this section after `### Stopping Condition` and before `## Narration Mode` in `skills/ux-explore/SKILL.md`:

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

- [ ] **Step 5: Commit usage drafting**

Run:

```bash
git add skills/ux-explore/SKILL.md tests/ux-explore/structure.test.js
git commit -m "docs(ux-explore): capture usage paths in free mode"
```

## Task 4: Add HTML Templates For Both Outputs

**Files:**
- Modify: `tests/ux-explore/structure.test.js`
- Create: `skills/ux-explore/templates/ux-report-template.html`
- Create: `skills/ux-explore/templates/usage-template.html`
- Modify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Write the failing template test**

Append this helper and test to `tests/ux-explore/structure.test.js` before the English-only test. If a `readSkill()` helper already exists, add only the `readTemplate()` helper and test:

```js
function readTemplate(relativePath) {
  return fs.readFileSync(path.join(root, 'skills/ux-explore', relativePath), 'utf8');
}

test('ux-explore provides HTML templates for UX report and usage guide', () => {
  const skill = readSkill();
  const uxTemplate = readTemplate('templates/ux-report-template.html');
  const usageTemplate = readTemplate('templates/usage-template.html');

  assert.match(skill, /templates\/ux-report-template\.html/);
  assert.match(skill, /templates\/usage-template\.html/);
  assert.match(skill, /ux-report\.html/);
  assert.match(skill, /usage\.html/);

  assert.match(uxTemplate, /<title>UX Explore Report - \{DOMAIN\}<\/title>/);
  assert.match(uxTemplate, /<h2>Exploration Log<\/h2>/);
  assert.match(uxTemplate, /class="step-photos"/);
  assert.match(uxTemplate, /grid-template-columns: repeat\(3, 1fr\)/);
  assert.match(uxTemplate, /screenshots\/step-\{NNN\}\.png[^]*<figcaption>Before<\/figcaption>/);
  assert.match(uxTemplate, /screenshots\/step-\{NNN\}-target\.png[^]*<figcaption>Target<\/figcaption>/);
  assert.match(uxTemplate, /screenshots\/step-\{NNN\}-after\.png[^]*<figcaption>After<\/figcaption>/);
  assert.match(uxTemplate, /href="usage\.html"/);

  assert.match(usageTemplate, /<title>Usage Guide - \{DOMAIN\}<\/title>/);
  assert.match(usageTemplate, /<h1>Usage Guide<\/h1>/);
  assert.match(usageTemplate, /class="capability"/);
  assert.match(usageTemplate, /Purpose/);
  assert.match(usageTemplate, /Entry point/);
  assert.match(usageTemplate, /Related controls/);
  assert.match(usageTemplate, /Evidence/);
  assert.match(usageTemplate, /Limitations/);
  assert.match(usageTemplate, /class="usage-photos"/);
  assert.match(usageTemplate, /grid-template-columns: repeat\(3, 1fr\)/);
  assert.match(usageTemplate, /screenshots\/step-\{NNN\}\.png[^]*<figcaption>Before<\/figcaption>/);
  assert.match(usageTemplate, /screenshots\/step-\{NNN\}-target\.png[^]*<figcaption>Target<\/figcaption>/);
  assert.match(usageTemplate, /screenshots\/step-\{NNN\}-after\.png[^]*<figcaption>After<\/figcaption>/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because the template files do not exist and the skill does not mention HTML output.

- [ ] **Step 3: Add template references to the skill**

Add this paragraph after the `Usage Guide Format` section in `skills/ux-explore/SKILL.md`:

```markdown
Use `templates/ux-report-template.html` to generate `{OUTPUT_DIR}/ux-report.html` from `ux-report.md`. Use `templates/usage-template.html` to generate `{OUTPUT_DIR}/usage.html` from `usage.md`. The UX report HTML must render every step with Before, Target, and After screenshots. The usage HTML must render each discovered capability as a readable section with purpose, entry point, steps, result, related controls, evidence, limitations, and Before, Target, and After screenshots for the evidence step.
```

- [ ] **Step 4: Create `ux-report-template.html`**

Create `skills/ux-explore/templates/ux-report-template.html` with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UX Explore Report - {DOMAIN}</title>
<style>
:root {
  --ink: #1d1d1f;
  --muted: #6e6e73;
  --canvas: #ffffff;
  --surface: #f5f5f7;
  --line: #d2d2d7;
  --accent: #0071e3;
  --high: #ff3b30;
  --medium: #ff9500;
  --low: #34c759;
}
* { box-sizing: border-box; }
body {
  margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  color: var(--ink); background: var(--canvas); line-height: 1.5;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.hero { padding: 64px 72px; background: #000; color: #fff; }
.hero h1 { margin: 0 0 12px; font-size: 48px; line-height: 1.05; }
.hero p { margin: 0; color: #d2d2d7; font-size: 20px; }
.section { padding: 48px 72px; }
.section-alt { padding: 48px 72px; background: var(--surface); }
.meta-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; background: #fff; font-size: 13px; }
.goodwill { font-size: 32px; font-weight: 700; }
.step-entry { margin-bottom: 40px; }
.step-entry h3 { margin: 0 0 12px; }
.step-photos {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
}
.step-photos figure { margin: 0; }
.step-photos img { width: 100%; border-radius: 8px; border: 1px solid var(--line); }
.step-photos figcaption { margin-top: 8px; text-align: center; color: var(--muted); font-size: 13px; }
.issue { border: 1px solid var(--line); border-left: 4px solid var(--medium); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.issue.high { border-left-color: var(--high); }
.issue.low { border-left-color: var(--low); }
@media (max-width: 760px) {
  .hero, .section, .section-alt { padding: 32px 20px; }
  .hero h1 { font-size: 36px; }
  .step-photos { grid-template-columns: 1fr; }
}
</style>
</head>
<body>
<header class="hero">
  <h1>UX Explore Report</h1>
  <p>{URL} - {DATE}</p>
</header>

<section class="section">
  <h2>Summary</h2>
  <p class="goodwill">{goodwillScore}/100 {verdict}</p>
  <div class="meta-tags">
    <span class="tag">{mode}</span>
    <span class="tag">{issueCount} issues</span>
    <span class="tag">{elementCount} elements explored</span>
    <a class="tag" href="usage.html">Usage guide</a>
  </div>
</section>

<section class="section-alt">
  <h2>Exploration Log</h2>
  <article class="step-entry">
    <h3>Step {N}: {action description}</h3>
    <div class="step-photos">
      <figure><img src="screenshots/step-{NNN}.png" alt="Before"><figcaption>Before</figcaption></figure>
      <figure><img src="screenshots/step-{NNN}-target.png" alt="Target"><figcaption>Target</figcaption></figure>
      <figure><img src="screenshots/step-{NNN}-after.png" alt="After"><figcaption>After</figcaption></figure>
    </div>
    <p><a href="diffs/step-{NNN}.txt">Snapshot diff</a></p>
    <p>{observation}</p>
  </article>
</section>

<section class="section">
  <h2>Issues</h2>
  <article class="issue high">
    <h3>UX-{NNN}: {title}</h3>
    <p><strong>Severity:</strong> {severity}</p>
    <p>{description}</p>
  </article>
</section>
</body>
</html>
```

- [ ] **Step 5: Create `usage-template.html`**

Create `skills/ux-explore/templates/usage-template.html` with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Usage Guide - {DOMAIN}</title>
<style>
:root {
  --ink: #1d1d1f;
  --muted: #6e6e73;
  --canvas: #ffffff;
  --surface: #f5f5f7;
  --line: #d2d2d7;
  --accent: #0071e3;
}
* { box-sizing: border-box; }
body {
  margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  color: var(--ink); background: var(--canvas); line-height: 1.55;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.hero { padding: 64px 72px; background: var(--surface); }
.hero h1 { margin: 0 0 12px; font-size: 48px; line-height: 1.05; }
.hero p { margin: 0; color: var(--muted); font-size: 20px; }
.section { padding: 48px 72px; }
.capability {
  border: 1px solid var(--line); border-radius: 8px; padding: 24px; margin-bottom: 24px;
}
.capability h2 { margin-top: 0; }
.field { margin: 16px 0; }
.field .label { font-weight: 700; margin-bottom: 4px; }
.usage-photos {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 12px;
}
.usage-photos figure { margin: 0; }
.usage-photos img { width: 100%; border-radius: 8px; border: 1px solid var(--line); }
.usage-photos figcaption { margin-top: 8px; text-align: center; color: var(--muted); font-size: 13px; }
ol, ul { padding-left: 22px; }
@media (max-width: 760px) {
  .hero, .section { padding: 32px 20px; }
  .hero h1 { font-size: 36px; }
  .usage-photos { grid-template-columns: 1fr; }
}
</style>
</head>
<body>
<header class="hero">
  <h1>Usage Guide</h1>
  <p>{URL} - {DATE}</p>
</header>

<main class="section">
  <article class="capability">
    <h2>Add an RSS feed</h2>
    <div class="field"><div class="label">Purpose</div><div>Subscribe to a new RSS source.</div></div>
    <div class="field"><div class="label">Entry point</div><div>"Add feed" button in the sidebar.</div></div>
    <div class="field">
      <div class="label">Steps</div>
      <ol>
        <li>Click "Add feed".</li>
        <li>Paste an RSS URL into the feed URL field.</li>
        <li>Click "Add".</li>
        <li>Confirm the feed appears in the feed list.</li>
      </ol>
    </div>
    <div class="field"><div class="label">Result</div><div>The app subscribes to the feed and starts fetching items.</div></div>
    <div class="field"><div class="label">Related controls</div><div>Refresh feed, Open item, Remove feed.</div></div>
    <div class="field"><div class="label">Evidence</div><div><a href="ux-report.html#step-003">steps 003-006</a></div></div>
    <div class="usage-photos">
      <figure><img src="screenshots/step-{NNN}.png" alt="Before"><figcaption>Before</figcaption></figure>
      <figure><img src="screenshots/step-{NNN}-target.png" alt="Target"><figcaption>Target</figcaption></figure>
      <figure><img src="screenshots/step-{NNN}-after.png" alt="After"><figcaption>After</figcaption></figure>
    </div>
    <div class="field"><div class="label">Limitations</div><div>None observed.</div></div>
  </article>
</main>
</body>
</html>
```

- [ ] **Step 6: Run the test to verify it passes**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS for `ux-explore provides HTML templates for UX report and usage guide`.

- [ ] **Step 7: Commit templates**

Run:

```bash
git add skills/ux-explore/SKILL.md skills/ux-explore/templates/ux-report-template.html skills/ux-explore/templates/usage-template.html tests/ux-explore/structure.test.js
git commit -m "docs(ux-explore): add HTML report templates"
```

## Task 5: Wire Cleanup For Markdown And HTML Outputs

**Files:**
- Modify: `tests/ux-explore/structure.test.js`
- Modify: `skills/ux-explore/SKILL.md`

- [ ] **Step 1: Write the failing cleanup test**

Append this test to `tests/ux-explore/structure.test.js` before the English-only test:

```js
test('ux-explore cleanup generates and verifies markdown and html artifacts', () => {
  const skill = readSkill();

  assert.match(skill, /Generate `\{OUTPUT_DIR\}\/ux-report\.html` from `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(skill, /Generate `\{OUTPUT_DIR\}\/usage\.html` from `\{OUTPUT_DIR\}\/usage\.md`/);
  assert.match(skill, /Re-read `ux-report\.md` and update the summary counts/);
  assert.match(skill, /Re-read `usage\.md` and make sure every usage entry has evidence/);
  assert.match(skill, /usage entry has before, target, and after screenshot references/);
  assert.match(skill, /Open both HTML files and verify relative links and image references/);
  assert.match(skill, /Tell the user both Markdown and HTML artifacts are ready/);
  assert.match(skill, /Journey mode can use `usage\.md` as source material/);
  assert.match(skill, /does not parse or replay `usage\.md` automatically/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: FAIL because cleanup still references only the old Markdown report behavior.

- [ ] **Step 3: Add reporting boundary rules**

Add this paragraph after the template paragraph added in Task 4:

```markdown
UX problems discovered while using a capability still belong in `ux-report.md`. `usage.md` should avoid severity labels and recommendations unless they are necessary to explain a limitation. Journey mode can use `usage.md` as source material for future goals, but this skill does not parse or replay `usage.md` automatically.
```

- [ ] **Step 4: Update cleanup**

Replace the current cleanup steps:

```markdown
3. Re-read the report and update the summary counts to match actual issues found.

4. Tell the user the report is ready and summarize: goodwill score with verdict, total issues, breakdown by severity, and the most critical items.
```

with:

```markdown
3. Re-read `ux-report.md` and update the summary counts to match actual issues found.

4. Re-read `usage.md` and make sure every usage entry has evidence. Each usage entry has before, target, and after screenshot references. If no coherent capability was discovered, confirm the file says no complete usage path was observed.

5. Generate `{OUTPUT_DIR}/ux-report.html` from `{OUTPUT_DIR}/ux-report.md` using `templates/ux-report-template.html`.

6. Generate `{OUTPUT_DIR}/usage.html` from `{OUTPUT_DIR}/usage.md` using `templates/usage-template.html`.

7. Open both HTML files and verify relative links and image references. The UX report HTML must show before, target, and after screenshots for each step. The usage HTML must show before, target, and after screenshots for each documented capability.

8. Tell the user both Markdown and HTML artifacts are ready and summarize: goodwill score with verdict, total issues, breakdown by severity, most critical UX items, and the number of usage entries documented.
```

- [ ] **Step 5: Run the test to verify it passes**

Run:

```bash
pnpm test -- tests/ux-explore/structure.test.js
```

Expected: PASS for `ux-explore cleanup generates and verifies markdown and html artifacts`.

- [ ] **Step 6: Commit cleanup wiring**

Run:

```bash
git add skills/ux-explore/SKILL.md tests/ux-explore/structure.test.js
git commit -m "docs(ux-explore): generate markdown and html outputs"
```

## Task 6: Final Validation

**Files:**
- Read: `skills/ux-explore/SKILL.md`
- Read: `skills/ux-explore/templates/ux-report-template.html`
- Read: `skills/ux-explore/templates/usage-template.html`
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
git diff --stat HEAD~5..HEAD
git log --oneline -10
git status --short --branch
```

Expected: recent commits include the implementation commits, worktree is clean, and the diff is limited to `skills/ux-explore/SKILL.md`, `skills/ux-explore/references/`, `skills/ux-explore/templates/`, and `tests/ux-explore/structure.test.js` plus this plan/spec if they were committed separately.

## Self-Review

Spec coverage:

- `ux-report.md` replaces `report.md`: Task 2.
- `usage.md` is produced as a discovered usage guide: Tasks 2 and 3.
- `ux-report.html` and `usage.html` are generated from skill-owned templates: Tasks 4 and 5.
- `SKILL.md` routes to `references/free-mode.md` and `references/usage-output.md` instead of carrying those detailed workflows inline.
- The default UX output directory aligns with QA under `~/.config/supermario/ux/YYYY-MM-DD-<ux-name>/`: Task 2.
- UX steps use before, target, and after screenshots: Task 1.
- `usage.md` schema includes Purpose, Entry point, Steps, Result, Related controls, Evidence, Evidence screenshots, and Limitations: Task 2.
- Free mode maintains a usage draft and rewrites it at cleanup: Task 3.
- Free mode records only observed capabilities and avoids speculation: Task 3.
- `ux-report.md` links to usage artifacts: Tasks 2 and 5.
- UX problems stay in `ux-report.md`: Task 5.
- Journey mode can use `usage.md` as source material but no automatic parser or replay is added: Task 5.
- No runtime runner, standalone renderer, QA changes, coverage ledger, or replay behavior is added.

Deferred-work scan:

- The plan contains no deferred implementation gaps.
- Every test step includes concrete code.
- Every documentation and template update step includes exact text or file content.

Type and naming consistency:

- `ux-report.md` and `ux-report.html` are used consistently for the UX critique artifacts.
- `usage.md` and `usage.html` are used consistently for usage guide artifacts.
- `references/free-mode.md` and `references/usage-output.md` are named consistently in tests and skill text.
- `templates/ux-report-template.html` and `templates/usage-template.html` are named consistently in tests and skill text.
- `Before`, `Target`, and `After` screenshot labels are named consistently across tests, skill text, and both HTML templates.
