const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const skillPath = path.join(root, 'skills/ux-explore/SKILL.md');

function readSkill() {
  return fs.readFileSync(skillPath, 'utf8');
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

test('ux-explore skill body stays English-only', () => {
  const skill = readSkill();

  assert.doesNotMatch(skill, /[\p{Script=Han}]/u);
});
