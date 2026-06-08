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

test('ux-explore supports journey mode for complete feature flows', () => {
  const skill = readSkill();

  assert.match(skill, /\[--journey "<goal>"\]/);
  assert.match(skill, /Mode Selection/);
  assert.match(skill, /Free mode/);
  assert.match(skill, /Journey mode/);
  assert.match(skill, /Journey Brief/);
  assert.match(skill, /success criteria/);
  assert.match(skill, /complete feature flow/);
  assert.match(skill, /Do not traverse unrelated elements before the journey/i);
  assert.match(skill, /agent-browser snapshot -i/);
  assert.match(skill, /Journey Results/);
  assert.match(skill, /Outcome \| completed \/ partial \/ blocked/);
  assert.match(skill, /RSS subscription journey/);
});

test('ux-explore writes separate UX report and usage guide markdown', () => {
  const skill = readSkill();
  const usageOutput = readReference('usage-output.md');

  assert.match(skill, /~\/\.config\/supermario\/ux\/YYYY-MM-DD-<ux-name>\//);
  assert.match(skill, /derive `ux-name` from the target host, route, journey goal, or requested scope/);
  assert.match(skill, /Resolve `\{OUTPUT_DIR\}` to `~\/\.config\/supermario\/ux\/YYYY-MM-DD-<ux-name>\/`/);
  assert.match(usageOutput, /ux-report\.md/);
  assert.match(usageOutput, /usage\.md/);
  assert.match(usageOutput, /The final UX report goes to `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(usageOutput, /Free mode also writes `\{OUTPUT_DIR\}\/usage\.md`/);
  assert.match(usageOutput, /Usage Guide/);
  assert.match(usageOutput, /Purpose: Subscribe to a new RSS source\./);
  assert.match(usageOutput, /Entry point: "Add feed" button in the sidebar\./);
  assert.match(usageOutput, /Steps:/);
  assert.match(usageOutput, /Result:/);
  assert.match(usageOutput, /Related controls:/);
  assert.match(usageOutput, /Evidence:/);
  assert.match(usageOutput, /Evidence screenshots:/);
  assert.match(usageOutput, /\!\[Before\]\(screenshots\/step-003\.png\)/);
  assert.match(usageOutput, /\!\[Target\]\(screenshots\/step-003-target\.png\)/);
  assert.match(usageOutput, /\!\[After\]\(screenshots\/step-003-after\.png\)/);
  assert.match(usageOutput, /Limitations:/);
  assert.match(usageOutput, /UX report: ux-report\.md/);
  assert.match(usageOutput, /Usage guide: usage\.md/);
  assert.doesNotMatch(skill, /The final report goes to `\{OUTPUT_DIR\}\/report\.md`/);
});

test('ux-explore free mode maintains a usage draft from observed capabilities', () => {
  const usageOutput = readReference('usage-output.md');

  assert.match(usageOutput, /maintain a usage draft/i);
  assert.match(usageOutput, /coherent capability/i);
  assert.match(usageOutput, /Group adjacent steps that belong to the same user goal/);
  assert.match(usageOutput, /Record only observable behavior/);
  assert.match(usageOutput, /Do not speculate about backend behavior or hidden implementation/);
  assert.match(usageOutput, /If a path is incomplete, include it with `Limitations`/);
  assert.match(usageOutput, /not exercised/);
  assert.match(usageOutput, /If no coherent capability is discovered/);
});

test('ux-explore provides HTML templates for UX report and usage guide', () => {
  const skill = readSkill();
  const usageOutput = readReference('usage-output.md');
  const uxTemplate = readTemplate('templates/ux-report-template.html');
  const usageTemplate = readTemplate('templates/usage-template.html');

  assert.match(usageOutput, /templates\/ux-report-template\.html/);
  assert.match(usageOutput, /templates\/usage-template\.html/);
  assert.match(usageOutput, /ux-report\.html/);
  assert.match(usageOutput, /usage\.html/);
  assert.match(skill, /references\/usage-output\.md/);

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
  const usageOutput = readReference('usage-output.md');

  assert.match(usageOutput, /Generate `\{OUTPUT_DIR\}\/ux-report\.html` from `\{OUTPUT_DIR\}\/ux-report\.md`/);
  assert.match(usageOutput, /Generate `\{OUTPUT_DIR\}\/usage\.html` from `\{OUTPUT_DIR\}\/usage\.md`/);
  assert.match(usageOutput, /Re-read `ux-report\.md` and update the summary counts/);
  assert.match(usageOutput, /Re-read `usage\.md` and make sure every usage entry has evidence/);
  assert.match(usageOutput, /usage entry has before, target, and after screenshot references/);
  assert.match(usageOutput, /Open both HTML files and verify relative links and image references/);
  assert.match(usageOutput, /Tell the user both Markdown and HTML artifacts are ready/);
  assert.match(usageOutput, /Journey mode can use `usage\.md` as source material/);
  assert.match(usageOutput, /does not parse or replay `usage\.md` automatically/);
});

test('ux-explore routes free mode and usage output to references', () => {
  const skill = readSkill();

  assert.match(skill, /references\/free-mode\.md/);
  assert.match(skill, /references\/usage-output\.md/);
  assert.match(skill, /For free mode, follow `references\/free-mode\.md`/);
  assert.match(skill, /For Markdown and HTML outputs, follow `references\/usage-output\.md`/);
  assert.doesNotMatch(skill, /## Usage Guide Format/);
  assert.doesNotMatch(skill, /### Per-Element Workflow/);
});

test('ux-explore skill body stays English-only', () => {
  const skill = readSkill();

  assert.doesNotMatch(skill, /[\p{Script=Han}]/u);
});
