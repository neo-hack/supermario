import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const skillRoot = path.resolve('skills/mockup');

test('skill metadata files exist and name the mockup skill', () => {
  const skill = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const openai = fs.readFileSync(path.join(skillRoot, 'agents/openai.yaml'), 'utf8');

  assert.match(skill, /^name: mockup/m);
  assert.match(skill, /render-mockup\.mjs/);
  assert.match(openai, /display_name: Mockup/);
  assert.match(openai, /default_prompt:/);
});

test('skill follows Agent Skills directory and frontmatter constraints', () => {
  const skill = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(skill)?.[1] ?? '';
  const description = /^description:\s*(.+)$/m.exec(frontmatter)?.[1] ?? '';

  assert.equal(path.basename(skillRoot), 'mockup');
  assert.match(frontmatter, /^name: mockup$/m);
  assert.ok(description.length > 0);
  assert.ok(description.length <= 1024);
  assert.ok(fs.existsSync(path.join(skillRoot, 'scripts/render-mockup.mjs')));
  assert.ok(fs.existsSync(path.join(skillRoot, 'assets/render.html')));
  assert.ok(fs.existsSync(path.join(skillRoot, 'assets/frames.json')));
  assert.ok(!fs.existsSync(path.join(skillRoot, 'templates')));
});

test('frame registry includes browser and device frames with separated CSS', () => {
  const frames = JSON.parse(fs.readFileSync(path.join(skillRoot, 'assets/frames.json'), 'utf8'));

  assert.deepEqual(Object.keys(frames).sort(), ['chrome', 'ipad', 'iphone', 'safari']);
  assert.equal(frames.chrome.type, 'browser');
  assert.equal(frames.safari.type, 'browser');
  assert.equal(frames.iphone.type, 'device');
  assert.equal(frames.ipad.type, 'device');

  assert.deepEqual(frames.chrome.css, ['studio.css', 'browser.css']);
  assert.deepEqual(frames.safari.css, ['studio.css', 'browser.css']);
  assert.deepEqual(frames.iphone.css, ['studio.css', 'device.css']);
  assert.deepEqual(frames.ipad.css, ['studio.css', 'device.css']);

  for (const [name, frame] of Object.entries(frames)) {
    assert.ok(frame.themes.includes('light'), `${name} supports light`);
    assert.ok(frame.themes.includes('dark'), `${name} supports dark`);
    assert.equal(frame.defaultViewport.length, 2);
    assert.equal(frame.polishedCanvas.length, 2);
    assert.match(frame.screenClass, /^mockup-screen/);
  }
});

test('renderer template exposes config mount and screenshot slot', () => {
  const template = fs.readFileSync(path.join(skillRoot, 'assets/render.html'), 'utf8');

  assert.match(template, /<script type="application\/json" id="mockup-config">/);
  assert.match(template, /data-role="mockup-frame"/);
  assert.match(template, /data-role="mockup-screen"/);
  assert.match(template, /__CSS_LINKS__/);
  assert.match(template, /__CONFIG_JSON__/);
});

test('CSS files keep studio, browser, and device responsibilities separate', () => {
  const studio = fs.readFileSync(path.join(skillRoot, 'assets/studio.css'), 'utf8');
  const browser = fs.readFileSync(path.join(skillRoot, 'assets/browser.css'), 'utf8');
  const device = fs.readFileSync(path.join(skillRoot, 'assets/device.css'), 'utf8');

  assert.match(studio, /\.mockup-stage/);
  assert.match(studio, /\.mode-polished/);
  assert.match(studio, /\.mode-tight/);
  assert.match(studio, /\.mode-transparent/);
  assert.doesNotMatch(studio, /\.browser-/);
  assert.doesNotMatch(studio, /\.device-/);

  assert.match(browser, /\.browser-frame/);
  assert.match(browser, /\.browser-chrome/);
  assert.match(browser, /\.browser-safari/);
  assert.doesNotMatch(browser, /\.device-/);

  assert.match(device, /\.device-frame/);
  assert.match(device, /\.device-iphone-17-series/);
  assert.match(device, /\.device-ipad/);
  assert.doesNotMatch(device, /\.browser-/);
});

test('renderer helpers parse options and classify inputs', async () => {
  const mod = await import('../../skills/mockup/scripts/render-mockup.mjs');

  const options = mod.parseArgs([
    '--input', './shot.png',
    '--frame', 'safari',
    '--theme', 'dark',
    '--mode', 'tight',
    '--out', './out.png',
    '--viewport', '1440x900'
  ]);

  assert.equal(options.input, './shot.png');
  assert.equal(options.frame, 'safari');
  assert.equal(options.theme, 'dark');
  assert.equal(options.mode, 'tight');
  assert.deepEqual(options.viewport, [1440, 900]);

  assert.equal(mod.classifyInput('https://example.com'), 'url');
  assert.equal(mod.classifyInput('http://example.com'), 'url');
  assert.equal(mod.classifyInput('file:///tmp/a.html'), 'url');
  assert.equal(mod.classifyInput('./page.html'), 'html');
  assert.equal(mod.classifyInput('./shot.png'), 'image');
});

test('renderer validates unsupported frame, theme, and output mode', async () => {
  const mod = await import('../../skills/mockup/scripts/render-mockup.mjs');
  const frames = mod.loadFrames(path.join(skillRoot, 'assets/frames.json'));

  assert.throws(() => mod.resolveFrame(frames, 'firefox', 'light'), /Unsupported frame/);
  assert.throws(() => mod.resolveFrame(frames, 'safari', 'sepia'), /Unsupported theme/);
  assert.throws(() => mod.validateMode('poster'), /Unsupported mode/);
});

test('renderer builds HTML with escaped config, CSS links, frame classes, and screenshot source', async () => {
  const mod = await import('../../skills/mockup/scripts/render-mockup.mjs');
  const frames = mod.loadFrames(path.join(skillRoot, 'assets/frames.json'));
  const frame = mod.resolveFrame(frames, 'safari', 'dark');
  const html = mod.renderHtml({
    skillRoot,
    frame,
    frameName: 'safari',
    theme: 'dark',
    mode: 'polished',
    screenshotSrc: 'file:///tmp/a%20b.png'
  });

  assert.match(html, /assets\/studio\.css/);
  assert.match(html, /assets\/browser\.css/);
  assert.match(html, /mode-polished/);
  assert.match(html, /theme-dark/);
  assert.match(html, /browser-frame browser-safari/);
  assert.match(html, /file:\/\/\/tmp\/a%20b\.png/);
  assert.doesNotMatch(html, /__CONFIG_JSON__/);
});

test('renderer exposes Playwright dependency guidance', async () => {
  const mod = await import('../../skills/mockup/scripts/render-mockup.mjs');
  assert.match(mod.playwrightInstallHelp(), /npm install playwright/);
  assert.match(mod.playwrightInstallHelp(), /npx playwright install chromium/);
});

test('capture plan uses frame defaults unless viewport is provided', async () => {
  const mod = await import('../../skills/mockup/scripts/render-mockup.mjs');
  const frames = mod.loadFrames(path.join(skillRoot, 'assets/frames.json'));
  const chrome = mod.resolveFrame(frames, 'chrome', 'light');

  assert.deepEqual(mod.resolveViewport(chrome, undefined), [1440, 900]);
  assert.deepEqual(mod.resolveViewport(chrome, [800, 600]), [800, 600]);
  assert.deepEqual(mod.resolveOutputViewport(chrome, 'polished'), [1600, 1000]);
  assert.deepEqual(mod.resolveOutputViewport(chrome, 'tight'), [1200, 799]);
});

test('skill docs mention every supported frame, mode, and CSS boundary', () => {
  const skill = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');

  for (const frame of ['chrome', 'safari', 'iphone', 'ipad']) {
    assert.match(skill, new RegExp(`\`${frame}\``), `${frame} documented`);
  }
  for (const mode of ['polished', 'tight', 'transparent']) {
    assert.match(skill, new RegExp(`\`${mode}\``), `${mode} documented`);
  }
  assert.match(skill, /browser\.css/);
  assert.match(skill, /device\.css/);
  assert.match(skill, /studio\.css/);
  assert.match(skill, /--keep-html/);
});
