const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const skillDir = path.join(root, 'skills/codemermaid');
const skillPath = path.join(skillDir, 'SKILL.md');

function readSkill() {
  return fs.readFileSync(skillPath, 'utf8');
}

function readAsset(name) {
  return fs.readFileSync(path.join(skillDir, 'assets', name), 'utf8');
}

function assertIncludesAll(source, expectedLines) {
  for (const line of expectedLines) {
    assert.ok(source.includes(line), `expected content to include: ${line}`);
  }
}

test('codemermaid targets maintainers, not students', () => {
  const skill = readSkill();
  const match = skill.match(/^---\n([\s\S]*?)\n---/);

  assert.ok(match, 'SKILL.md must start with YAML frontmatter');
  assert.match(match[1], /^name: codemermaid$/m);
  assert.match(match[1], /onboarding|maintainer/i, 'description must state the maintainer-onboarding purpose');
  assert.ok(skill.includes('## Audience'), 'must declare the audience');
  assert.ok(/will MODIFY this code/.test(skill), 'audience must be a developer who will modify the code');
});

test('module coverage contract defines nine mandatory questions', () => {
  const skill = readSkill();
  assert.ok(skill.includes('### Module Coverage Contract (mandatory)'));
  const rows = skill.match(/^\| [1-9] \|/gm);
  assert.ok(rows && rows.length === 9, `expected 9 coverage questions, found ${rows ? rows.length : 0}`);
});

test('unit kinds include maintainer units and page-end self-check, no standalone quiz', () => {
  const skill = readSkill();
  assertIncludesAll(skill, [
    '{ kind: "contract"',
    '{ kind: "gotcha"',
    '{ kind: "trace"',
    '{ kind: "self-check"',
  ]);
  assert.doesNotMatch(skill, /\{ kind: "quiz"/, 'standalone quiz unit must be gone');
  assert.ok(skill.includes('positioned second-to-last'), 'self-check must be pinned to page end');
  assert.ok(/gotcha[\s\S]*?empty state/i.test(skill), 'gotcha must allow an explicit empty state');
});

test('coverage enforcement replaces pedagogy enforcement', () => {
  const skill = readSkill();
  assert.ok(skill.includes('### Coverage enforcement (mandatory)'));
  assert.ok(!skill.includes('### Pedagogy enforcement'), 'pedagogy enforcement section must be renamed');
  assert.ok(/MUST contain exactly 1 `contract` unit/.test(skill));
  assert.ok(/`change-scenarios\.html` MUST contain ≥ 2 `trace` units/.test(skill));
});

test('module tiering bounds page count while covering every module', () => {
  const skill = readSkill();
  assert.ok(skill.includes('**Module tiering (core / supporting)**'));
  assert.ok(/≤ 12 core module pages/.test(skill), 'core page budget must be stated');
  assert.ok(skill.includes('supporting-modules.html'), 'supporting tier must share one page');
  assert.ok(skill.includes('Cover every module, page only the core'));
});

test('change-scenarios is a default perspective', () => {
  const skill = readSkill();
  assert.ok(/`architecture\.html`, `build-up\.html`, and `change-scenarios\.html`/.test(skill));
  assert.ok(/\| `change-scenarios\.html`\s+\| `skeleton-essay\.html` \| Always \|/.test(skill));
});

test('interactivity is declarative and runtime supports the trace stepper', () => {
  const skill = readSkill();
  assert.ok(skill.includes('**Declarative interactivity only**'));

  const runtime = readAsset('runtime.js');
  assertIncludesAll(runtime, ['function initTrace()', 'data-trace-step', 'data-trace-panel', 'initTrace();']);

  const css = readAsset('style.css');
  assertIncludesAll(css, ['.contract-table', '.gotcha-item', '.trace-step', '.trace-panel[hidden]']);
});

test('voice is layered: reference units use neutral documentation tone', () => {
  const voice = fs.readFileSync(path.join(skillDir, 'references/voice-examples.md'), 'utf8');
  assert.ok(voice.includes('Reference layer'), 'voice reference must define the reference layer');
  assert.ok(/contract.*gotcha/.test(voice), 'reference layer must name contract and gotcha');

  const skill = readSkill();
  assert.ok(skill.includes('Voice is LAYERED by unit kind'));
});

test('unit examples document the new kinds and drop storyboard', () => {
  const units = fs.readFileSync(path.join(skillDir, 'references/units-examples.md'), 'utf8');
  assertIncludesAll(units, ['## contract', '## gotcha', '## trace', '## self-check']);
  assert.ok(!units.includes('## storyboard'), 'storyboard (never implemented) must be replaced by trace');
  assert.ok(!units.includes('## quiz'), 'standalone quiz section must be replaced by self-check');
});
