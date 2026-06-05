const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const skillRoot = path.join(root, 'skills/qa');

function read(relativePath) {
  return fs.readFileSync(path.join(skillRoot, relativePath), 'utf8');
}

test('QA skill delegates mode details to references', () => {
  const skill = read('SKILL.md');

  for (const reference of [
    'references/free-exploration.md',
    'references/case-verification.md',
    'references/init-qa.md',
    'references/evidence-and-reporting.md',
    'references/issue-taxonomy.md',
    'references/stopping-criteria.md',
  ]) {
    assert.match(skill, new RegExp(reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.doesNotMatch(skill, /^## qa\.md Format$/m);
  assert.doesNotMatch(skill, /^## --init Mode/m);
  assert.doesNotMatch(skill, /^## Free Explore$/m);
  assert.doesNotMatch(skill, /^## Report Format$/m);
  assert.ok(skill.length < 10000, 'SKILL.md should stay compact after delegation');
});

test('QA references preserve executable browser and reporting rules', () => {
  const freeExploration = read('references/free-exploration.md');
  const caseVerification = read('references/case-verification.md');
  const initFromE2e = read('references/init-qa.md');
  const evidence = read('references/evidence-and-reporting.md');

  assert.match(freeExploration, /agent-browser diff snapshot --baseline/);
  assert.match(freeExploration, /Action Strategy/);
  assert.match(freeExploration, /Do NOT interact with/);

  assert.match(caseVerification, /<scenario name=/);
  assert.match(caseVerification, /stable traits/);
  assert.match(caseVerification, /semantic similarity/);

  assert.match(initFromE2e, /cypress\/e2e/);
  assert.match(initFromE2e, /page\.fill\(\)/);
  assert.match(initFromE2e, /Self-Verify/);

  assert.match(evidence, /8-Dimension Health Score/);
  assert.match(evidence, /templates\/qa-report-template\.html/);
  assert.match(evidence, /baseline\.json/);
});

test('QA reports show before, target, and after screenshots', () => {
  const freeExploration = read('references/free-exploration.md');
  const caseVerification = read('references/case-verification.md');
  const evidence = read('references/evidence-and-reporting.md');
  const markdownTemplate = read('templates/qa-report-template.md');
  const htmlTemplate = read('templates/qa-report-template.html');

  assert.match(freeExploration, /agent-browser highlight @eN/);
  assert.match(freeExploration, /screenshots\/step-\{NNN\}-target\.png/);
  assert.match(caseVerification, /screenshots\/step-\{NNN\}-target\.png/);
  assert.match(evidence, /step-001-target\.png/);
  assert.match(evidence, /before, target, and after/);

  assert.match(markdownTemplate, /\*\*Before\*\*: !\[step-\{NNN\}\]/);
  assert.match(markdownTemplate, /\*\*Target\*\*: !\[step-\{NNN\}-target\]/);
  assert.match(markdownTemplate, /\*\*After\*\*: !\[step-\{NNN\}-after\]/);

  assert.match(htmlTemplate, /grid-template-columns: repeat\(3, 1fr\)/);
  assert.match(htmlTemplate, /screenshots\/step-\{NNN\}\.png[^]*<figcaption>Before<\/figcaption>/);
  assert.match(htmlTemplate, /screenshots\/step-\{NNN\}-target\.png[^]*<figcaption>Target<\/figcaption>/);
  assert.match(htmlTemplate, /screenshots\/step-\{NNN\}-after\.png[^]*<figcaption>After<\/figcaption>/);
});

test('QA skill routes natural-language component focus through scope resolution', () => {
  const skill = read('SKILL.md');
  const scope = read('references/scope-resolution.md');

  assert.match(skill, /references\/scope-resolution\.md/);
  assert.match(skill, /only|focus|scope|component|section|panel|modal|dialog|card|form/);
  assert.match(skill, /detect scope/i);
  assert.match(skill, /resolved scope/i);

  assert.match(scope, /Scope Resolution/);
  assert.match(scope, /Natural-language triggers/);
  assert.match(scope, /agent-browser snapshot -i --json/);
  assert.match(scope, /agent-browser screenshot --annotate/);
  assert.match(scope, /agent-browser highlight/);
  assert.match(scope, /ask the user to confirm/);
  assert.match(scope, /scopeKey/);
  assert.match(scope, /out-of-scope/);
});

test('QA free exploration uses a coverage ledger and convergence loop', () => {
  const skill = read('SKILL.md');
  const freeExploration = read('references/free-exploration.md');
  const stopping = read('references/stopping-criteria.md');
  const evidence = read('references/evidence-and-reporting.md');

  assert.match(skill, /convergence threshold/i);
  assert.match(skill, /--converge-stable-passes/);
  assert.match(skill, /stablePassesRequired/);

  assert.match(freeExploration, /coverage\.json/);
  assert.match(freeExploration, /coverageThresholds/);
  assert.match(freeExploration, /stablePassesRequired/);
  assert.match(freeExploration, /discovered/);
  assert.match(freeExploration, /pending/);
  assert.match(freeExploration, /visited/);
  assert.match(freeExploration, /skipped/);
  assert.match(freeExploration, /outOfScope/);
  assert.match(freeExploration, /halted/);
  assert.match(freeExploration, /agent-browser snapshot -i --json/);
  assert.match(freeExploration, /stable key/);
  assert.match(freeExploration, /stablePasses/);

  assert.match(stopping, /pending is empty/);
  assert.match(stopping, /stablePasses >= coverageThresholds\.stablePassesRequired/);
  assert.match(stopping, /scroll boundary/);
  assert.match(stopping, /popover|dialog|menu/);

  assert.match(evidence, /coverage\.json/);
  assert.match(evidence, /Coverage Status/);
  assert.match(evidence, /Stable pass threshold/);
});

test('QA coverage halts after confirmed P0 bugs with evidence', () => {
  const taxonomy = read('references/issue-taxonomy.md');
  const freeExploration = read('references/free-exploration.md');
  const stopping = read('references/stopping-criteria.md');
  const evidence = read('references/evidence-and-reporting.md');

  assert.match(taxonomy, /P0/);
  assert.match(taxonomy, /data loss|blank screen|core workflow|security/i);
  assert.match(freeExploration, /confirmed P0/);
  assert.match(freeExploration, /halted/);
  assert.match(freeExploration, /remainingPending/);
  assert.match(freeExploration, /minimal reproduction/i);
  assert.match(stopping, /confirmed P0 halt/);
  assert.match(evidence, /Halted after ISSUE-/);
  assert.match(evidence, /pending elements were not explored/);
});

test('QA applies coverage by mode with scoped boundaries', () => {
  const skill = read('SKILL.md');
  const caseVerification = read('references/case-verification.md');
  const initQa = read('references/init-qa.md');

  assert.match(skill, /Coverage applies/i);
  assert.match(skill, /free exploration.*required/i);
  assert.match(skill, /case verification.*uncovered/i);
  assert.match(skill, /multi-page.*explicit/i);

  assert.match(caseVerification, /resolved scope/);
  assert.match(caseVerification, /outside the resolved scope/);
  assert.match(caseVerification, /uncovered in-scope elements/);

  assert.match(initQa, /resolved scope/);
  assert.match(initQa, /generated qa\.md/);
  assert.match(initQa, /coverage for uncovered elements/);
});
