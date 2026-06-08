const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const skillPath = path.join(root, 'skills/ux-explore/SKILL.md');

function readSkill() {
  return fs.readFileSync(skillPath, 'utf8');
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
  const skill = readSkill();

  assert.match(skill, /mkdir -p \{OUTPUT_DIR\}\/screenshots \{OUTPUT_DIR\}\/snapshots \{OUTPUT_DIR\}\/diffs/);
  assert.match(skill, /agent-browser snapshot > \{OUTPUT_DIR\}\/snapshots\/step-\{NNN\}-before\.txt/);
  assert.match(skill, /agent-browser diff snapshot --baseline \{OUTPUT_DIR\}\/snapshots\/step-\{NNN\}-before\.txt > \{OUTPUT_DIR\}\/diffs\/step-\{NNN\}\.txt/);
  assert.match(skill, /\*\*Diff\*\*: \[step-001 diff\]\(diffs\/step-001\.txt\)/);
  assert.match(skill, /- Snapshot diffs: diffs\//);
});

test('ux-explore captures before, target, and after screenshots per step', () => {
  const skill = readSkill();

  assert.match(skill, /agent-browser screenshot \{OUTPUT_DIR\}\/screenshots\/step-\{NNN\}\.png/);
  assert.match(skill, /agent-browser highlight @eN/);
  assert.match(skill, /agent-browser screenshot \{OUTPUT_DIR\}\/screenshots\/step-\{NNN\}-target\.png/);
  assert.match(skill, /agent-browser screenshot \{OUTPUT_DIR\}\/screenshots\/step-\{NNN\}-after\.png/);
  assert.match(skill, /\{OUTPUT_DIR\}\/screenshots\/step-\{NNN\}-target\.png\s+# highlighted target/);
  assert.match(skill, /\*\*Target\*\*: !\[step-001-target\]\(screenshots\/step-001-target\.png\)/);
  assert.match(skill, /A step without before, target, and after screenshots is incomplete/);
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

test('ux-explore skill body stays English-only', () => {
  const skill = readSkill();

  assert.doesNotMatch(skill, /[\p{Script=Han}]/u);
});
