const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const readSkill = () => fs.readFileSync(path.join(root, 'skills/what-have-done/SKILL.md'), 'utf8')
  .replace(/\s+/g, ' ');

function section(source, start, end) {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `missing section: ${start}`);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(to, -1, `missing following section: ${end}`);
  return source.slice(from, to);
}

test('flow explanations use a suitable diagram without forcing one on trivial changes', () => {
  const skill = readSkill();
  const flow = section(skill, '### 3. Explain the Flow', '### 4. Separate Verification');
  assert.match(flow, /user asks for a diagram/);
  assert.match(flow, /flowchart/);
  assert.match(flow, /sequenceDiagram/);
  assert.match(flow, /stateDiagram-v2/);
  assert.match(flow, /Skip diagrams for trivial changes/);
});

test('before and after diagrams compare actual revisions under the same conditions', () => {
  const skill = readSkill();
  assert.match(skill, /Read both the baseline and current implementation/);
  assert.match(skill, /same triggering input, labels, and level of detail/);
  assert.match(skill, /If the baseline cannot be established, show only the current flow/);
  assert.match(skill, /Do not invent a previous flow/);
});

test('the explanation connects a changed decision to its result and evidence', () => {
  const flow = section(readSkill(), '### 3. Explain the Flow', '### 4. Separate Verification');
  assert.match(flow, /original trigger and failure or limitation/);
  assert.match(flow, /specific changed decision, ordering, ownership, or state transition/);
  assert.match(flow, /why that change prevents the failure or enables the intended outcome/);
  assert.match(flow, /code reasoning, tests, or a live observation/);
  assert.match(flow, /assumptions and unverified paths/);
});

test('diagrams stay grounded in implementation and do not imply formal or runtime verification', () => {
  const flow = section(readSkill(), '### 3. Explain the Flow', '### 4. Separate Verification');
  assert.match(flow, /Link the key transitions to the relevant files and revisions/);
  assert.match(flow, /explanatory diagrams, not formal verification/);
  assert.match(flow, /Do not claim a diagram was rendered or a model checked unless that actually ran/);
  assert.match(flow, /Label an untested mechanism as code reasoning/);
});

test('the completion template includes conditional flow explanations and skipped verification', () => {
  const output = section(readSkill(), '## Output Shape', '## Common Mistakes');
  assert.match(output, /\*\*Flow and Why It Works\*\*/);
  assert.match(output, /before\/after diagrams when needed/);
  assert.match(output, /\*\*Not Verified\*\*/);
  assert.match(output, /Omit the flow section when it adds no explanatory value/);
});
