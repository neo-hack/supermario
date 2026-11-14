const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const skillPath = path.join(root, 'skills/docs-code/SKILL.md');

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

test('phase 3 verification is required before the final report', () => {
  const skill = readSkill();
  const verifySection = sectionBetween(
    skill,
    '## Phase 3: Verify',
    '## Final Report',
  );

  assertIncludesAll(verifySection, [
    'Run verification after Phase 2 and before the final report.',
    'The main thread owns final verification.',
    'Detect the project validation commands from package scripts, build files, CI config, or existing docs.',
    'If verification fails, inspect whether the failure is caused by the code or comment changes.',
    'Fix failures caused by this pass and rerun the failing verification command.',
    'Do not present the task as complete until verification passes or the remaining failure is clearly reported as unrelated or blocked.',
  ]);
});

test('final report includes maintenance changes and verification results', () => {
  const skill = readSkill();
  const finalReport = sectionBetween(
    skill,
    '## Final Report',
    '## Common Mistakes',
  );

  assertIncludesAll(finalReport, [
    'The final report comes after Phase 3 verification.',
    'Changed files by module.',
    'Comments added, rewritten, or removed.',
    'Verification commands and outcomes.',
    'Skipped verification with reasons.',
    'Remaining risk, especially if a verification failure is unrelated or blocked.',
  ]);
});

test('phase 1 inventories experimental comments before edits', () => {
  const skill = readSkill();
  const phase1 = sectionBetween(
    skill,
    '## Phase 1: Module Analysis',
    '## Phase 2:',
  );

  assertIncludesAll(phase1, [
    'Scan existing comments in the target files for experimental data.',
  ]);
});

test('experimental comments are cleaned, not preserved', () => {
  const skill = readSkill();
  const qualitySection = sectionBetween(
    skill,
    '## Comment Quality Rules',
    '## Large File Rules',
  );

  assertIncludesAll(qualitySection, [
    'Do not add, and do not preserve, experimental comments.',
    'One-off benchmark or timing measurements',
    'One-time investigation conclusions',
    'Keep only the durable constraint reason.',
    'Do not skip a comment because it already exists.',
  ]);

  assertIncludesAll(skill, [
    'If the user explicitly requests comments only, change only comments (add, rewrite, or delete)',
    'Review feedback about comments is in scope.',
    'Leaving experimental comments',
  ]);
});

test('both trigger paths check structure before writing comments', () => {
  const skill = readSkill();
  const trigger = sectionBetween(skill, '## Trigger Scope', '## Execution');
  const phase2 = sectionBetween(skill, '## Phase 2:', '### Comment Style');

  assert.match(trigger, /inline annotation[\s\S]*Structure Before Comments/);
  assertIncludesAll(phase2, [
    'Apply Structure Before Comments before adding or rewriting an annotation.',
    'use `clean-code` for one pass on the exact accepted scope',
    'Re-read the resulting code before deciding which comments remain necessary.',
  ]);
});

test('structure changes respect behavior, explicit comment-only requests, and proactive scope', () => {
  const skill = readSkill();
  const structure = sectionBetween(skill, '## Structure Before Comments', '## Trigger Scope');

  assertIncludesAll(structure, [
    'Preserve observable behavior, public contracts, side-effect ordering, and compatibility.',
    'If the user explicitly requests comments only, change only comments (add, rewrite, or delete)',
    'A proactive trigger does not expand the current task',
    'Reproduce a suspected logic bug and handle it through the bug-fix workflow with a regression test',
  ]);
});

test('durable comments survive until their constraint is understood and represented', () => {
  const skill = readSkill();
  const structure = sectionBetween(skill, '## Structure Before Comments', '## Trigger Scope');

  assertIncludesAll(structure, [
    'Keep legal and license notices, public API contracts, external constraints and source links',
    'A useful comment may remain beside a type or test',
    'When a constraint is uncertain, inspect callers, tests, and relevant history before deleting it.',
    'If evidence is still missing, keep it and report the uncertainty.',
  ]);
});

test('large-file thresholds prompt structural inspection instead of automatic annotations', () => {
  const skill = readSkill();
  const largeFiles = sectionBetween(skill, '## Large File Rules', '## Phase 3:');

  assertIncludesAll(largeFiles, [
    'Treat size and complexity thresholds as investigation signals, not comment quotas.',
    'Do not add section banners or split files solely because a line threshold was crossed.',
  ]);
  assert.doesNotMatch(largeFiles, /add intent comments before major branches|add section banners between/);
});

test('structural simplification requires behavior evidence before explanatory comments are removed', () => {
  const skill = readSkill();
  const phase2 = sectionBetween(skill, '## Phase 2:', '### Comment Style');
  const verification = sectionBetween(skill, '## Phase 3:', '## Final Report');

  assertIncludesAll(phase2, [
    'Verify each structural change before removing the explanation it replaces.',
  ]);
  assertIncludesAll(verification, [
    'For code changes, run the focused behavior tests before and after the refactor.',
    'Do not weaken assertions to make a refactor pass.',
  ]);
});
