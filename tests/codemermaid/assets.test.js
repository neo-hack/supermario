const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../../skills/codemermaid');
const assets = path.join(root, 'assets');

test('skill metadata follows Agent Skills spec constraints', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1].trim();
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1].trim();
  const compatibility = frontmatter.match(/^compatibility:\s*(.+)$/m)?.[1].trim();

  assert.equal(name, path.basename(root));
  assert.match(name, /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/);
  assert.doesNotMatch(name, /--/);
  assert.ok(description && description.length <= 1024);
  assert.match(description, /Mermaid|architecture|module dependency|repository/);
  assert.match(description, /Use when/);
  assert.ok(!compatibility || compatibility.length <= 500);
});

test('asset files exist: runtime.js, style.css, skeletons, and Mermaid bridge files', () => {
  const required = [
    'beautiful-mermaid.bundle.js',
    'mermaid-bridge.js',
    'runtime.js',
    'style.css',
    'skeleton-essay.html',
    'skeleton-index.html',
  ];
  for (const file of required) {
    assert.ok(fs.existsSync(path.join(assets, file)), 'missing asset: ' + file);
  }
  assert.ok(!fs.existsSync(path.join(assets, '_base.css')), 'stale _base.css should be deleted');
  assert.ok(!fs.existsSync(path.join(assets, '_essay.css')), 'stale _essay.css should be deleted');
  assert.ok(!fs.existsSync(path.join(assets, '_index.css')), 'stale _index.css should be deleted');
  assert.ok(!fs.existsSync(path.join(assets, '_runtime.js')), 'stale _runtime.js should be deleted');
  assert.ok(!fs.existsSync(path.join(assets, '_essay.js')), 'stale _essay.js should be deleted');
  assert.ok(!fs.existsSync(path.join(assets, 'template-essay.html')), 'stale template-essay.html renamed to skeleton');
  assert.ok(!fs.existsSync(path.join(assets, 'template-index.html')), 'stale template-index.html renamed to skeleton');
});

test('skeleton-essay.html links CSS and bundled JS, has zoom overlay', () => {
  const html = fs.readFileSync(path.join(assets, 'skeleton-essay.html'), 'utf8');

  assert.match(html, /<link rel="stylesheet" href="style\.css">/);
  assert.match(html, /<script src="beautiful-mermaid\.bundle\.js"><\/script>/);
  assert.match(html, /<script src="mermaid-bridge\.js"><\/script>/);
  assert.match(html, /<script src="runtime\.js"><\/script>/);
  assert.match(html, /<!-- SLOT:PAGE_TITLE -->/);
  assert.match(html, /<!-- SLOT:UNITS -->/);
  assert.match(html, /class="zoom-overlay"/);
  assert.match(html, /data-zoom-in/);
  assert.match(html, /data-zoom-out/);
  assert.match(html, /data-zoom-close/);
  assert.match(html, /data-zoom-reset/);
  assert.match(html, /data-zoom-level/);
});

test('skeleton-index.html links CSS and bundled JS', () => {
  const html = fs.readFileSync(path.join(assets, 'skeleton-index.html'), 'utf8');

  assert.match(html, /<link rel="stylesheet" href="style\.css">/);
  assert.match(html, /<script src="beautiful-mermaid\.bundle\.js"><\/script>/);
  assert.match(html, /<script src="mermaid-bridge\.js"><\/script>/);
  assert.match(html, /<script src="runtime\.js"><\/script>/);
  assert.match(html, /<!-- SLOT:INDEX_HEADER -->/);
  assert.match(html, /<!-- SLOT:PERSPECTIVE_CARDS -->/);
  assert.match(html, /<!-- SLOT:MODULE_CARDS -->/);
});

test('style.css contains key design tokens and component selectors', () => {
  const css = fs.readFileSync(path.join(assets, 'style.css'), 'utf8');

  assert.match(css, /--bg:/);
  assert.match(css, /--accent:/);
  assert.match(css, /--font-primary:/);
  assert.match(css, /--font-mono:/);
  assert.match(css, /\.codewalk-split/);
  assert.match(css, /\.codegraph-split/);
  assert.match(css, /\.codewalk-annotation/);
  assert.match(css, /\.code-block \.line/);
  assert.match(css, /\.quiz-option/);
  assert.match(css, /\.zoom-overlay/);
  assert.match(css, /\.unit-surprise/);
  assert.match(css, /\.unit-takeaway/);
  assert.match(css, /pre\.mermaid/);
  assert.match(css, /scrollbar-color:/);
  assert.match(css, /gap: 0/);
});

test('runtime.js defines all interactive boot functions', () => {
  const js = fs.readFileSync(path.join(assets, 'runtime.js'), 'utf8');

  assert.match(js, /function initTocScroll/);
  assert.match(js, /function initQuiz/);
  assert.match(js, /function bindAnnotationClicks/);
  assert.match(js, /function alignAnnotations/);
  assert.match(js, /function initCodeWalkAnnotations/);
  assert.match(js, /function initAnnotationResize/);
  assert.match(js, /function initCodeGraphSync/);
  assert.match(js, /function initZoomOverlay/);
  assert.match(js, /function bootPage/);
  assert.match(js, /DOMContentLoaded/);
});

test('runtime.js runs without error in a minimal DOM context', () => {
  const js = fs.readFileSync(path.join(assets, 'runtime.js'), 'utf8');
  const context = {
    document: {
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
    },
    window: {
      innerHeight: 800,
      addEventListener: () => {},
    },
    HTMLElement: class {},
  };
  context.self = context;

  assert.doesNotThrow(() => {
    vm.runInNewContext(js, context);
  });
});

test('SKILL.md documents all current unit types', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

  const requiredTypes = ['concept', 'diagram', 'code-walk', 'code-graph', 'quiz', 'takeaway'];
  for (const kind of requiredTypes) {
    const pattern = new RegExp('`' + kind + '`|kind.*' + kind);
    assert.match(skill, pattern, 'SKILL.md should document unit type: ' + kind);
  }
});
