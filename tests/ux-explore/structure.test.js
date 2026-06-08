const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const skillPath = path.join(root, 'skills/ux-explore/SKILL.md');

function readSkill() {
  return fs.readFileSync(skillPath, 'utf8');
}

function readReference(relativePath) {
  return fs.readFileSync(path.join(root, 'skills/ux-explore/references', relativePath), 'utf8');
}

function readTemplate(relativePath) {
  return fs.readFileSync(path.join(root, 'skills/ux-explore', relativePath), 'utf8');
}

test('ux-explore frontmatter uses trigger-only description', () => {
  const skill = readSkill();
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1] ?? '';

  assert.match(description, /^Use when /);
  assert.doesNotMatch(description, /produce|record every interaction|structured report/i);
});

test('ux-explore preserves snapshot diff artifacts per step', () => {
  const freeMode = readReference('free-mode.md');

  assert.match(freeMode, /agent-browser snapshot > \{OUTPUT_DIR\}\/snapshots\/step-\{NNN\}-before\.txt/);
  assert.match(freeMode, /agent-browser diff snapshot --baseline \{OUTPUT_DIR\}\/snapshots\/step-\{NNN\}-before\.txt > \{OUTPUT_DIR\}\/diffs\/step-\{NNN\}\.txt/);
  assert.match(freeMode, /\*\*Diff\*\*: \[step-001 diff\]\(diffs\/step-001\.txt\)/);
  assert.match(freeMode, /Snapshot diffs: diffs\//);
});

test('ux-explore captures before, target, and after screenshots per step', () => {
  const freeMode = readReference('free-mode.md');

  assert.match(freeMode, /agent-browser screenshot \{OUTPUT_DIR\}\/screenshots\/step-\{NNN\}\.png/);
  assert.match(freeMode, /agent-browser highlight @eN/);
  assert.match(freeMode, /agent-browser screenshot \{OUTPUT_DIR\}\/screenshots\/step-\{NNN\}-target\.png/);
  assert.match(freeMode, /agent-browser screenshot \{OUTPUT_DIR\}\/screenshots\/step-\{NNN\}-after\.png/);
  assert.match(freeMode, /\{OUTPUT_DIR\}\/screenshots\/step-\{NNN\}-target\.png\s+# highlighted target/);
  assert.match(freeMode, /\*\*Target\*\*: !\[step-001-target\]\(screenshots\/step-001-target\.png\)/);
  assert.match(freeMode, /A step without before, target, and after screenshots is incomplete/);
});

test('ux-explore routes execution modes and reporting to references', () => {
  const skill = readSkill();

  assert.match(skill, /\[--journey "<goal>"\]/);
  assert.match(skill, /Mode Selection/);
  assert.match(skill, /Free mode/);
  assert.match(skill, /Journey mode/);
  assert.match(skill, /For free mode, follow `references\/free-mode\.md`/);
  assert.match(skill, /For journey mode, follow `references\/journey-mode\.md`/);
  assert.match(skill, /For all Markdown and HTML artifacts, follow `references\/reporting\.md`/);
  assert.doesNotMatch(skill, /references\/usage-output\.md/);
  assert.doesNotMatch(skill, /## Usage Guide Format/);
  assert.doesNotMatch(skill, /### Per-Element Workflow/);
});

test('ux-explore journey mode reference owns goal-driven flow', () => {
  const journeyMode = readReference('journey-mode.md');

  assert.match(journeyMode, /^# Journey Mode/m);
  assert.match(journeyMode, /Journey Brief/);
  assert.match(journeyMode, /Journey Planning/);
  assert.match(journeyMode, /Journey Execution/);
  assert.match(journeyMode, /Journey Stopping/);
  assert.match(journeyMode, /Journey Results/);
  assert.match(journeyMode, /complete feature flow/);
  assert.match(journeyMode, /Do not convert journey mode into full-page traversal unless the user explicitly asks/i);
  assert.match(journeyMode, /references\/free-mode\.md/);
  assert.match(journeyMode, /references\/reporting\.md/);
});

test('ux-explore writes separate UX report and usage guide markdown', () => {
  const skill = readSkill();
  const reporting = readReference('reporting.md');

  assert.match(skill, /~\/\.config\/supermario\/ux\/YYYY-MM-DD-<ux-name>\//);
  assert.match(skill, /derive `ux-name` from the target host, route, journey goal, or requested scope/);
  assert.match(skill, /Resolve `\{OUTPUT_DIR\}` to `~\/\.config\/supermario\/ux\/YYYY-MM-DD-<ux-name>\/`/);
  assert.match(reporting, /ux-report\.md/);
  assert.match(reporting, /usage\.md/);
  assert.match(reporting, /The final UX report goes to `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(reporting, /Both free mode and journey mode write `\{OUTPUT_DIR\}\/usage\.md`/);
  assert.match(reporting, /Usage Guide Format/);
  assert.match(reporting, /Purpose: Subscribe to a new RSS source\./);
  assert.match(reporting, /Entry point: "Add feed" button in the sidebar\./);
  assert.match(reporting, /Steps:/);
  assert.match(reporting, /Result:/);
  assert.match(reporting, /Related controls:/);
  assert.match(reporting, /Evidence:/);
  assert.match(reporting, /Evidence screenshots:/);
  assert.match(reporting, /\!\[Before\]\(screenshots\/step-003\.png\)/);
  assert.match(reporting, /\!\[Target\]\(screenshots\/step-003-target\.png\)/);
  assert.match(reporting, /\!\[After\]\(screenshots\/step-003-after\.png\)/);
  assert.match(reporting, /Limitations:/);
  assert.match(reporting, /UX report: ux-report\.md/);
  assert.match(reporting, /Usage guide: usage\.md/);
  assert.doesNotMatch(skill, /The final report goes to `\{OUTPUT_DIR\}\/report\.md`/);
});

test('ux-explore free mode maintains a usage draft from observed capabilities', () => {
  const reporting = readReference('reporting.md');

  assert.match(reporting, /maintain a usage draft/i);
  assert.match(reporting, /coherent capability/i);
  assert.match(reporting, /Group adjacent steps that belong to the same user goal/);
  assert.match(reporting, /Record only observable behavior/);
  assert.match(reporting, /Do not speculate about backend behavior or hidden implementation/);
  assert.match(reporting, /If a path is incomplete, include it with `Limitations`/);
  assert.match(reporting, /not exercised/);
  assert.match(reporting, /If no coherent capability is discovered/);
});

test('ux-explore reporting reference owns all output artifact contracts', () => {
  const reporting = readReference('reporting.md');

  assert.match(reporting, /^# Reporting/m);
  assert.match(reporting, /\{OUTPUT_DIR\}\/ux-report\.md/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/ux-report\.html/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/usage\.md/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/usage\.html/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/explore-video\.webm/);
  assert.match(reporting, /\{OUTPUT_DIR\}\/screenshots\//);
  assert.match(reporting, /\{OUTPUT_DIR\}\/snapshots\//);
  assert.match(reporting, /\{OUTPUT_DIR\}\/diffs\//);
  assert.match(reporting, /## UX Report Format/);
  assert.match(reporting, /## Usage Guide Format/);
  assert.match(reporting, /## Mode-Specific Usage Rules/);
  assert.match(reporting, /## Boundary Rules/);
  assert.match(reporting, /## HTML Generation/);
  assert.match(reporting, /## Cleanup Checklist/);
  assert.match(reporting, /Before writing or generating any output artifact, read this reference end-to-end/);
});

test('ux-explore provides HTML templates for UX report and usage guide', () => {
  const skill = readSkill();
  const reporting = readReference('reporting.md');
  const uxTemplate = readTemplate('templates/ux-report-template.html');
  const usageTemplate = readTemplate('templates/usage-template.html');

  assert.match(reporting, /templates\/ux-report-template\.html/);
  assert.match(reporting, /templates\/usage-template\.html/);
  assert.match(reporting, /ux-report\.html/);
  assert.match(reporting, /usage\.html/);
  assert.match(skill, /references\/reporting\.md/);

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

test('ux-explore cleanup generates and verifies markdown and html artifacts', () => {
  const reporting = readReference('reporting.md');

  assert.match(reporting, /Generate `\{OUTPUT_DIR\}\/ux-report\.html` from `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(reporting, /Generate `\{OUTPUT_DIR\}\/usage\.html` from `\{OUTPUT_DIR\}\/usage\.md`/);
  assert.match(reporting, /Re-read `ux-report\.md` and update the summary counts/);
  assert.match(reporting, /Re-read `usage\.md` and make sure every usage entry has evidence/);
  assert.match(reporting, /usage entry has before, target, and after screenshot references/);
  assert.match(reporting, /Open both HTML files and verify relative links and image references/);
  assert.match(reporting, /Tell the user both Markdown and HTML artifacts are ready/);
  assert.match(reporting, /Journey mode can use `usage\.md` as source material/);
  assert.match(reporting, /does not parse or replay `usage\.md` automatically/);
});

test('ux-explore observation style is shared by execution modes', () => {
  const skill = readSkill();

  assert.match(skill, /## Observation Style/);
  assert.match(skill, /Explore in first person/);
  assert.match(skill, /applies to both free mode and journey mode/i);
  assert.doesNotMatch(skill, /## Narration Mode/);
});

test('ux-explore skill body stays English-only', () => {
  const skill = readSkill();

  assert.doesNotMatch(skill, /[\p{Script=Han}]/u);
});
