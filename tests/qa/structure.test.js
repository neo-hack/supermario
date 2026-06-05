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
    'references/behavior-testing.md',
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

test('QA HTML report template supports click-to-zoom screenshots', () => {
  const htmlTemplate = read('templates/qa-report-template.html');

  assert.match(htmlTemplate, /https:\/\/esm\.sh\/medium-zoom@1\.1\.0/);
  assert.match(htmlTemplate, /const zoomSelector = '\.step-photos img, \.issue-card img'/);
  assert.match(htmlTemplate, /cursor: zoom-in/);
  assert.match(htmlTemplate, /window\.qaImageZoom = zoom/);
  assert.match(htmlTemplate, /cleanupZoomArtifacts/);
  assert.match(htmlTemplate, /medium-zoom-image--hidden/);
  assert.doesNotMatch(htmlTemplate, /image-lightbox/);
  assert.doesNotMatch(htmlTemplate, /image-trigger/);
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

test('QA reports new console output as issue candidates', () => {
  const freeExploration = read('references/free-exploration.md');
  const evidence = read('references/evidence-and-reporting.md');

  assert.match(freeExploration, /console-step-\{NNN\}\.txt/);
  assert.match(freeExploration, /console delta/i);
  assert.match(freeExploration, /React duplicate key warning/i);
  assert.match(freeExploration, /issue candidate/i);

  assert.match(evidence, /Console Delta/);
  assert.match(evidence, /new console output/i);
  assert.match(evidence, /pre-existing console output/i);
  assert.match(evidence, /Warning: Encountered two children with the same key/);
});

test('QA coverage reporting distinguishes raw elements from coverage actions', () => {
  const freeExploration = read('references/free-exploration.md');
  const evidence = read('references/evidence-and-reporting.md');
  const markdownTemplate = read('templates/qa-report-template.md');
  const htmlTemplate = read('templates/qa-report-template.html');

  assert.match(freeExploration, /rawInteractiveElements/);
  assert.match(freeExploration, /coverageActions/);
  assert.match(freeExploration, /Do not label coverage action counts as element counts/);

  assert.match(evidence, /Raw interactive elements/);
  assert.match(evidence, /Coverage actions discovered/);
  assert.match(evidence, /Coverage actions visited/);

  assert.match(markdownTemplate, /Raw interactive elements/);
  assert.match(markdownTemplate, /Coverage actions discovered/);
  assert.match(markdownTemplate, /Coverage actions visited/);

  assert.match(htmlTemplate, /Raw interactive elements/);
  assert.match(htmlTemplate, /Coverage actions discovered/);
  assert.match(htmlTemplate, /Coverage actions visited/);
});

test('QA skill reads behavior testing separately from coverage mechanics', () => {
  const skill = read('SKILL.md');
  const behavior = read('references/behavior-testing.md');
  const freeExploration = read('references/free-exploration.md');
  const caseVerification = read('references/case-verification.md');
  const evidence = read('references/evidence-and-reporting.md');
  const markdownTemplate = read('templates/qa-report-template.md');
  const htmlTemplate = read('templates/qa-report-template.html');

  assert.match(skill, /references\/behavior-testing\.md/);
  assert.match(skill, /behavior testing/i);
  assert.doesNotMatch(skill, /references\/behavior-coverage\.md/);

  assert.match(behavior, /Feature Model Inference/);
  assert.match(behavior, /behaviorCases/);
  assert.match(behavior, /Use this reference in every QA mode/);
  assert.match(behavior, /Element coverage answers/);
  assert.match(behavior, /behavior testing answers/);
  assert.match(behavior, /baseline seed set/);
  assert.match(behavior, /not an exhaustive list/);
  assert.match(behavior, /Snapshot-Derived Behavior/);
  assert.match(behavior, /ARIA state transitions/);
  assert.match(behavior, /newly revealed controls/i);
  assert.match(behavior, /Do not limit testing to the common models list/);
  assert.match(behavior, /text-input|editor|composer/);
  assert.match(behavior, /form/);
  assert.match(behavior, /combobox|select|picker/);
  assert.match(behavior, /menu|popover|dialog/);
  assert.match(behavior, /table|list/);
  assert.match(behavior, /file|upload/);
  assert.match(behavior, /trigger sequence/i);
  assert.match(behavior, /continue typing/i);
  assert.match(behavior, /Do not mark a feature complete after only opening/);

  assert.match(freeExploration, /behaviorCases/);
  assert.match(freeExploration, /pending behavior cases/i);
  assert.match(freeExploration, /references\/behavior-testing\.md/);

  assert.match(caseVerification, /behavior testing/i);
  assert.match(caseVerification, /behaviorCases/);

  assert.match(evidence, /Behavior Testing/);
  assert.match(markdownTemplate, /## Behavior Testing/);
  assert.match(markdownTemplate, /Planned cases/);
  assert.match(markdownTemplate, /Tested cases/);
  assert.match(htmlTemplate, /<h2>Behavior Testing<\/h2>/);
  assert.doesNotMatch(htmlTemplate, /Behavior cases discovered/);
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

test('QA report templates include coverage status', () => {
  const markdownTemplate = read('templates/qa-report-template.md');
  const htmlTemplate = read('templates/qa-report-template.html');
  const evidence = read('references/evidence-and-reporting.md');

  assert.match(markdownTemplate, /## Coverage Status/);
  assert.match(markdownTemplate, /Status \| completed \/ halted/);
  assert.match(markdownTemplate, /Pending \| \{count\}/);
  assert.match(markdownTemplate, /Stable pass threshold \| \{count\}/);
  assert.match(markdownTemplate, /Halt reason \| none \/ ISSUE-\{NNN\}/);

  assert.match(htmlTemplate, /<h2>Coverage Status<\/h2>/);
  assert.match(htmlTemplate, /coverage-grid/);
  assert.match(htmlTemplate, /\{coverageStatus\}/);
  assert.match(htmlTemplate, /\{pendingCount\}/);
  assert.match(htmlTemplate, /\{stablePassThreshold\}/);
  assert.match(htmlTemplate, /\{haltReason\}/);

  assert.match(evidence, /Coverage Status/);
  assert.match(evidence, /completed \/ halted/);
});

test('QA skill stores reports under the supermario qa config directory', () => {
  const skill = read('SKILL.md');

  assert.match(skill, /~\/\.config\/supermario\/qa\/YYYY-MM-DD-<qa-name>\//);
  assert.match(skill, /qa-name/);
  assert.match(skill, /Resolve \{OUTPUT_DIR\}/);
  assert.doesNotMatch(skill, /Output directory \| No \| `\.\/qa-output\/`/);
});
