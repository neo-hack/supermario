const assert = require('node:assert/strict');
const fs = require('node:fs');
const yaml = require('js-yaml');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const skillsRoot = path.join(root, 'skills');
const skillNamePattern = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

function getSkillFiles() {
  return fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(skillsRoot, entry.name, 'SKILL.md'))
    .filter((file) => fs.existsSync(file))
    .sort();
}

function parseYaml(frontmatter, file) {
  try {
    return yaml.load(frontmatter);
  } catch (error) {
    assert.fail(`${file}\n${error.message}`);
  }
}

test('all skills have valid frontmatter metadata', () => {
  const files = getSkillFiles();

  assert.ok(files.length > 0, 'expected at least one skill');

  for (const file of files) {
    const skill = fs.readFileSync(file, 'utf8');
    const match = skill.match(/^---\n([\s\S]*?)\n---/);

    assert.ok(match, `${file} must start with YAML frontmatter`);

    const metadata = parseYaml(match[1], file);
    const expectedName = path.basename(path.dirname(file));

    assert.equal(metadata.name, expectedName, `${file} name must match directory`);
    assert.match(metadata.name, skillNamePattern, `${file} name must follow Agent Skills naming`);
    assert.doesNotMatch(metadata.name, /--/, `${file} name must not contain consecutive hyphens`);
    assert.equal(typeof metadata.description, 'string', `${file} description must be a string`);
    assert.ok(metadata.description.length > 0, `${file} description must not be empty`);
    assert.ok(metadata.description.length <= 1024, `${file} description must be 1024 characters or less`);
  }
});
