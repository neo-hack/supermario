const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const skillDir = path.join(root, 'skills/clean-code');
const skillPath = path.join(skillDir, 'SKILL.md');

function readSkill() {
  return fs.readFileSync(skillPath, 'utf8');
}

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `missing start marker: ${startMarker}`);

  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `missing end marker after ${startMarker}: ${endMarker}`);

  return source.slice(start, end);
}

function assertIncludesAll(source, expectedLines) {
  for (const line of expectedLines) {
    assert.ok(source.includes(line), `expected SKILL.md to include: ${line}`);
  }
}

test('clean-code skill exists and is trigger-only in description', () => {
  const skill = readSkill();
  const match = skill.match(/^---\n([\s\S]*?)\n---/);

  assert.ok(match, 'SKILL.md must start with YAML frontmatter');
  assert.match(match[1], /^name: clean-code$/m);
  assert.match(match[1], /^description: Use when /m);
  assert.doesNotMatch(
    match[1],
    /for pass|iteration loop|revert this pass/i,
    'description must not summarize the loop workflow',
  );
});

test('iteration loop takes a count, re-reads, verifies, and can stop early', () => {
  const skill = readSkill();
  const loop = sectionBetween(
    skill,
    '## Iteration Loop',
    '## Guardrails',
  );

  assertIncludesAll(loop, [
    'Parse `$iterations` as a positive integer.',
    'If `$iterations` is missing, ask for a count. If the user does not provide one, use 3.',
    'Re-read the target files and the current diff.',
    'If no remaining simplifications: stop and report early exit.',
    'Apply the smallest behavior-preserving simplifications found in this pass.',
    'Run verification for the changed scope.',
    'If verification fails: revert this pass, keep earlier passes, stop.',
    'Do not repeat the same rewrite across passes.',
  ]);
});

test('clean-code loads book principles from references instead of inlining the book', () => {
  const skill = readSkill();

  assertIncludesAll(skill, [
    'Read the matching Clean Code reference before applying that class of change.',
    'references/naming.md',
    'references/functions.md',
    'references/comments.md',
    'references/error-handling.md',
    'references/successive-refinement.md',
  ]);

  for (const name of [
    'naming.md',
    'functions.md',
    'comments.md',
    'error-handling.md',
    'successive-refinement.md',
  ]) {
    const file = path.join(skillDir, 'references', name);
    assert.ok(fs.existsSync(file), `missing reference: ${name}`);
  }
});

test('clean-code simplifies live code without stealing docs-code or fire work', () => {
  const skill = readSkill();

  assertIncludesAll(skill, [
    'Preserve observable behavior.',
    'Do not run a comment-only campaign.',
    'Do not delete unused code as the primary goal.',
    'use docs-code',
    'use fire',
  ]);
});

test('passes start with local readability and keep DRY KISS YAGNI in the checklist', () => {
  const skill = readSkill();
  const refinement = fs.readFileSync(
    path.join(skillDir, 'references/successive-refinement.md'),
    'utf8',
  );

  assertIncludesAll(skill, [
    'Local readability first, architecture later.',
  ]);

  assertIncludesAll(refinement, [
    'DRY',
    'KISS',
    'YAGNI',
    'Start with names and local structure.',
  ]);
});
