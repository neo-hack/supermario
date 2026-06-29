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

test('inline exec requires module gates during annotation', () => {
  const skill = readSkill();
  const inlineSection = sectionBetween(
    skill,
    'For `inline exec` mode:',
    'Inline exec preview format:',
  );

  assertIncludesAll(inlineSection, [
    'Process Phase 2 module by module.',
    'Before starting each module, show the module annotation plan and wait for user confirmation.',
    'After finishing each module, show changed files, annotation types, and an ASCII flow explaining the module flow and comment coverage.',
    'Wait for user confirmation before continuing to the next module.',
  ]);
});

test('subagent driven mode does not pause per module and returns module summaries', () => {
  const skill = readSkill();
  const subagentSection = sectionBetween(
    skill,
    'For `subagent driven` mode:',
    'For `inline exec` mode:',
  );

  assertIncludesAll(subagentSection, [
    'Do not pause after each module during Phase 2.',
    'Require each annotation subagent to return changed files, annotation types, and an ASCII flow for its owned module.',
    'Consolidate post-confirmation annotation results into the final annotation summary without per-module user gates.',
  ]);
});

test('module flow summaries use terminal-friendly ASCII instead of Mermaid checkpoints', () => {
  const skill = readSkill();

  assertIncludesAll(skill, [
    '### ASCII Flow Summaries',
    'Module flow summaries use terminal-friendly ASCII.',
    'Use Mermaid only in separate written documentation when explicitly useful.',
    'Module: parser',
    '[API] parse(input)',
    '[Boundary] resolve grammar',
  ]);
});

test('phase 3 verification is required before the final report', () => {
  const skill = readSkill();
  const verifySection = sectionBetween(
    skill,
    '## Phase 3: Verify',
    '## Final Report',
  );

  assertIncludesAll(verifySection, [
    'Run verification after Phase 2 and before the final report.',
    'The main thread owns verification in both execution modes.',
    'Detect the project validation commands from package scripts, build files, CI config, or existing docs.',
    'If verification fails, inspect whether the failure is caused by the annotation changes.',
    'Fix comment-related failures when possible and rerun the failing verification command.',
    'Do not present the task as complete until verification passes or the remaining failure is clearly reported as unrelated or blocked.',
  ]);
});

test('final report includes module summaries and verification results', () => {
  const skill = readSkill();
  const finalReport = sectionBetween(
    skill,
    '## Final Report',
    '## Common Mistakes',
  );

  assertIncludesAll(finalReport, [
    'The final report comes after Phase 3 verification.',
    'Changed files by module.',
    'Annotation types added by module.',
    'ASCII flow summaries by module.',
    'Verification commands and outcomes.',
    'Skipped verification with reasons.',
    'Remaining risk, especially if a verification failure is unrelated or blocked.',
  ]);
});
