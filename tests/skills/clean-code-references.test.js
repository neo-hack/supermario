const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const skillDir = path.resolve(__dirname, '../../skills/clean-code');

test('clean-code declared reference files exist', () => {
  const skill = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
  const references = [...new Set(skill.match(/\breferences\/[a-z0-9-]+\.md\b/g) || [])];

  assert.ok(references.length > 0, 'expected local references in the skill entrypoint');
  for (const reference of references) {
    assert.ok(fs.statSync(path.join(skillDir, reference)).isFile(), `${reference} must be a file`);
  }
});
