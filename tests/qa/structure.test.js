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
