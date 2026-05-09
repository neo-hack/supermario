# Mockup Screenshot Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable `mockup-screenshot` skill that turns image files or webpages into polished framed PNG mockups.

**Architecture:** Add a new repository skill under `skills/mockup-screenshot/`. The skill is script-backed: `render-mockup.mjs` validates CLI options, captures URL/local HTML inputs when needed, renders a frame template, and exports a PNG through Playwright. Visual frame code is split into `studio.css`, `browser.css`, and `device.css` so browser chrome and physical device frames evolve independently.

**Tech Stack:** Node.js ESM, `node:test`, Playwright via dynamic import, vanilla HTML/CSS templates, repository skill conventions.

---

## File Structure

Create this new tree:

```text
skills/mockup-screenshot/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── assets/
│   ├── browser.css
│   ├── device.css
│   └── studio.css
├── scripts/
│   └── render-mockup.mjs
├── templates/
│   ├── frames.json
│   └── render.html
└── tests/
    └── render-mockup.test.mjs
```

Responsibilities:

- `SKILL.md`: concise usage workflow, supported inputs, frame names, output modes, and verification commands.
- `agents/openai.yaml`: UI metadata for the skill list.
- `assets/studio.css`: shared canvas, polished/tight/transparent modes, backgrounds, sizing, centering, shadows.
- `assets/browser.css`: Chrome and Safari browser frame styles.
- `assets/device.css`: iPhone 17 series, iPad, and Mac Pro frame styles.
- `templates/frames.json`: frame registry, themes, viewport defaults, frame sizing, screenshot slot metadata.
- `templates/render.html`: one renderer shell; the script injects config and screenshot URL.
- `scripts/render-mockup.mjs`: CLI, input capture, HTML generation, Playwright screenshot export, validation helpers.
- `tests/render-mockup.test.mjs`: fast tests for option parsing, registry validation, HTML rendering, input classification, and CSS routing.

The script should export helper functions so tests can run without launching a browser unless explicitly testing the end-to-end path.

## Task 1: Scaffold Skill Files and Metadata

**Files:**
- Create: `skills/mockup-screenshot/SKILL.md`
- Create: `skills/mockup-screenshot/agents/openai.yaml`
- Create: `skills/mockup-screenshot/assets/studio.css`
- Create: `skills/mockup-screenshot/assets/browser.css`
- Create: `skills/mockup-screenshot/assets/device.css`
- Create: `skills/mockup-screenshot/templates/render.html`
- Create: `skills/mockup-screenshot/templates/frames.json`
- Create: `skills/mockup-screenshot/scripts/render-mockup.mjs`
- Create: `skills/mockup-screenshot/tests/render-mockup.test.mjs`

- [ ] **Step 1: Create directories and empty files**

Run:

```bash
mkdir -p skills/mockup-screenshot/{agents,assets,scripts,templates,tests}
touch skills/mockup-screenshot/SKILL.md
touch skills/mockup-screenshot/agents/openai.yaml
touch skills/mockup-screenshot/assets/studio.css
touch skills/mockup-screenshot/assets/browser.css
touch skills/mockup-screenshot/assets/device.css
touch skills/mockup-screenshot/templates/render.html
touch skills/mockup-screenshot/templates/frames.json
touch skills/mockup-screenshot/scripts/render-mockup.mjs
touch skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: directories and files exist.

- [ ] **Step 2: Write initial failing metadata test**

Replace `skills/mockup-screenshot/tests/render-mockup.test.mjs` with:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const skillRoot = path.resolve('skills/mockup-screenshot');

test('skill metadata files exist and name the mockup-screenshot skill', () => {
  const skill = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const openai = fs.readFileSync(path.join(skillRoot, 'agents/openai.yaml'), 'utf8');

  assert.match(skill, /^name: mockup-screenshot/m);
  assert.match(skill, /render-mockup\.mjs/);
  assert.match(openai, /display_name: Mockup Screenshot/);
  assert.match(openai, /default_prompt:/);
});
```

- [ ] **Step 3: Run metadata test and verify it fails**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: FAIL with an assertion that `name: mockup-screenshot` is missing.

- [ ] **Step 4: Write `SKILL.md`**

Replace `skills/mockup-screenshot/SKILL.md` with:

```markdown
---
name: mockup-screenshot
description: Use when asked to create product screenshot mockups, wrap an image or webpage in a browser/device frame, generate Chrome/Safari/iPhone 17 series/iPad/Mac Pro framed PNGs, or produce polished/tight/transparent screenshot assets for docs, landing pages, READMEs, or social posts.
---

# Mockup Screenshot

Generate framed screenshot mockups from either an image file or a webpage/local HTML input.

## When to Use

- "Put this screenshot in a Safari frame"
- "Generate a product mockup PNG from this URL"
- "Make a README-ready browser screenshot"
- "Wrap this image in an iPhone 17 series or Mac Pro frame"
- "Export a transparent device mockup"

## Output

Default output is a polished PNG: a full presentation canvas with background, centered frame, and shadow. Use `--mode tight` to crop to the frame itself. Use `--mode transparent` for a transparent background.

## Supported Frames

Browser frames:
- `chrome` with `--theme light|dark`
- `safari` with `--theme light|dark`

Device frames:
- `iphone` with `--theme light|dark`
- `ipad` with `--theme light|dark`
- `mac-pro` with `--theme light|dark`

## Workflow

1. Identify the input:
   - Existing image: pass the file path directly.
   - URL or local HTML: pass the URL/path and let the renderer capture it.
2. Choose a frame and theme.
3. Choose output mode: `polished`, `tight`, or `transparent`.
4. Run the renderer from the repository root:

```bash
node skills/mockup-screenshot/scripts/render-mockup.mjs \
  --input ./screenshot.png \
  --frame safari \
  --theme dark \
  --mode polished \
  --out ./mockup.png
```

For webpages:

```bash
node skills/mockup-screenshot/scripts/render-mockup.mjs \
  --input https://example.com \
  --viewport 1440x900 \
  --frame mac-pro \
  --mode polished \
  --out ./mockup.png
```

## Verification

After generating an image, confirm the file exists and is non-empty:

```bash
test -s ./mockup.png
```

Run skill tests after changing renderer, CSS, or frame registry files:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

## Implementation Notes

- `assets/browser.css` owns browser chrome.
- `assets/device.css` owns physical device shells.
- `assets/studio.css` owns shared canvas modes.
- `templates/frames.json` is the frame registry.
- `templates/render.html` is the only HTML shell the script screenshots.
```

- [ ] **Step 5: Write `agents/openai.yaml`**

Replace `skills/mockup-screenshot/agents/openai.yaml` with:

```yaml
display_name: Mockup Screenshot
short_description: Wrap screenshots or webpages in browser and device frames.
default_prompt: Create a polished framed PNG mockup from an image, URL, or local HTML file.
```

- [ ] **Step 6: Run metadata test and verify it passes**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit scaffold**

Run:

```bash
git add skills/mockup-screenshot/SKILL.md skills/mockup-screenshot/agents/openai.yaml skills/mockup-screenshot/tests/render-mockup.test.mjs
git commit -m "feat: scaffold mockup screenshot skill"
```

## Task 2: Add Frame Registry and CSS Routing Tests

**Files:**
- Modify: `skills/mockup-screenshot/templates/frames.json`
- Modify: `skills/mockup-screenshot/tests/render-mockup.test.mjs`

- [ ] **Step 1: Add failing tests for frame registry**

Append this to `skills/mockup-screenshot/tests/render-mockup.test.mjs`:

```js
test('frame registry includes browser and device frames with separated CSS', () => {
  const frames = JSON.parse(fs.readFileSync(path.join(skillRoot, 'templates/frames.json'), 'utf8'));

  assert.deepEqual(Object.keys(frames).sort(), ['chrome', 'ipad', 'iphone', 'mac-pro', 'safari']);
  assert.equal(frames.chrome.type, 'browser');
  assert.equal(frames.safari.type, 'browser');
  assert.equal(frames.iphone.type, 'device');
  assert.equal(frames.ipad.type, 'device');
  assert.equal(frames['mac-pro'].type, 'device');

  assert.deepEqual(frames.chrome.css, ['studio.css', 'browser.css']);
  assert.deepEqual(frames.safari.css, ['studio.css', 'browser.css']);
  assert.deepEqual(frames.iphone.css, ['studio.css', 'device.css']);
  assert.deepEqual(frames.ipad.css, ['studio.css', 'device.css']);
  assert.deepEqual(frames['mac-pro'].css, ['studio.css', 'device.css']);

  for (const [name, frame] of Object.entries(frames)) {
    assert.ok(frame.themes.includes('light'), `${name} supports light`);
    assert.ok(frame.themes.includes('dark'), `${name} supports dark`);
    assert.equal(frame.defaultViewport.length, 2);
    assert.equal(frame.polishedCanvas.length, 2);
    assert.match(frame.screenClass, /^mockup-screen/);
  }
});
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: FAIL with JSON parse or missing frame registry.

- [ ] **Step 3: Write frame registry**

Replace `skills/mockup-screenshot/templates/frames.json` with:

```json
{
  "chrome": {
    "type": "browser",
    "label": "Chrome",
    "themes": ["light", "dark"],
    "defaultViewport": [1440, 900],
    "polishedCanvas": [1600, 1000],
    "frameClass": "browser-frame browser-chrome",
    "screenClass": "mockup-screen browser-screen",
    "css": ["studio.css", "browser.css"]
  },
  "safari": {
    "type": "browser",
    "label": "Safari",
    "themes": ["light", "dark"],
    "defaultViewport": [1440, 900],
    "polishedCanvas": [1600, 1000],
    "frameClass": "browser-frame browser-safari",
    "screenClass": "mockup-screen browser-screen",
    "css": ["studio.css", "browser.css"]
  },
  "iphone": {
    "type": "device",
    "label": "iPhone 17 series",
    "themes": ["light", "dark"],
    "defaultViewport": [390, 844],
    "polishedCanvas": [1200, 1200],
    "frameClass": "device-frame device-iphone-17-series",
    "screenClass": "mockup-screen device-screen",
    "css": ["studio.css", "device.css"]
  },
  "ipad": {
    "type": "device",
    "label": "iPad",
    "themes": ["light", "dark"],
    "defaultViewport": [820, 1180],
    "polishedCanvas": [1400, 1200],
    "frameClass": "device-frame device-ipad",
    "screenClass": "mockup-screen device-screen",
    "css": ["studio.css", "device.css"]
  },
  "mac-pro": {
    "type": "device",
    "label": "Mac Pro",
    "themes": ["light", "dark"],
    "defaultViewport": [1440, 900],
    "polishedCanvas": [1600, 1000],
    "frameClass": "device-frame device-mac-pro",
    "screenClass": "mockup-screen device-screen",
    "css": ["studio.css", "device.css"]
  }
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit registry**

Run:

```bash
git add skills/mockup-screenshot/templates/frames.json skills/mockup-screenshot/tests/render-mockup.test.mjs
git commit -m "feat: add mockup frame registry"
```

## Task 3: Implement Template and CSS Assets

**Files:**
- Modify: `skills/mockup-screenshot/templates/render.html`
- Modify: `skills/mockup-screenshot/assets/studio.css`
- Modify: `skills/mockup-screenshot/assets/browser.css`
- Modify: `skills/mockup-screenshot/assets/device.css`
- Modify: `skills/mockup-screenshot/tests/render-mockup.test.mjs`

- [ ] **Step 1: Add failing tests for template and CSS boundaries**

Append this to `skills/mockup-screenshot/tests/render-mockup.test.mjs`:

```js
test('renderer template exposes config mount and screenshot slot', () => {
  const template = fs.readFileSync(path.join(skillRoot, 'templates/render.html'), 'utf8');

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
  assert.match(device, /\.device-mac-pro/);
  assert.doesNotMatch(device, /\.browser-/);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: FAIL with missing template markers or CSS selectors.

- [ ] **Step 3: Write renderer template**

Replace `skills/mockup-screenshot/templates/render.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mockup Screenshot Render</title>
    __CSS_LINKS__
  </head>
  <body>
    <script type="application/json" id="mockup-config">__CONFIG_JSON__</script>
    <main class="mockup-stage mode-__MODE__ theme-__THEME__" data-mode="__MODE__">
      <section class="mockup-artboard" aria-label="Screenshot mockup">
        <div class="__FRAME_CLASS__" data-role="mockup-frame">
          <div class="frame-toolbar" aria-hidden="true"></div>
          <div class="__SCREEN_CLASS__" data-role="mockup-screen">
            <img class="mockup-image" src="__SCREENSHOT_SRC__" alt="" />
          </div>
        </div>
      </section>
    </main>
  </body>
</html>
```

- [ ] **Step 4: Write shared `studio.css`**

Replace `skills/mockup-screenshot/assets/studio.css` with:

```css
:root {
  color-scheme: light;
  --mockup-bg: #f5f5f7;
  --mockup-ink: #1d1d1f;
  --mockup-shadow: 0 38px 80px rgb(0 0 0 / 18%), 0 12px 28px rgb(0 0 0 / 10%);
  font-family: "SF Pro Text", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

body {
  overflow: hidden;
  background: transparent;
  color: var(--mockup-ink);
  -webkit-font-smoothing: antialiased;
}

.mockup-stage {
  display: grid;
  width: 100vw;
  height: 100vh;
  place-items: center;
}

.mode-polished {
  background:
    radial-gradient(circle at 50% 34%, rgb(255 255 255 / 95%), rgb(245 245 247 / 100%) 54%),
    var(--mockup-bg);
  padding: 56px;
}

.mode-tight {
  background: transparent;
  padding: 0;
}

.mode-transparent {
  background: transparent;
  padding: 56px;
}

.mockup-artboard {
  display: grid;
  place-items: center;
}

.mode-polished [data-role="mockup-frame"],
.mode-transparent [data-role="mockup-frame"] {
  box-shadow: var(--mockup-shadow);
}

.mockup-screen {
  position: relative;
  overflow: hidden;
  background: #ffffff;
}

.mockup-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top left;
}
```

- [ ] **Step 5: Write `browser.css`**

Replace `skills/mockup-screenshot/assets/browser.css` with:

```css
.browser-frame {
  position: relative;
  width: 1200px;
  overflow: hidden;
  border: 1px solid rgb(29 29 31 / 22%);
  border-radius: 14px;
  background: #ffffff;
}

.browser-frame.theme-dark,
.theme-dark .browser-frame {
  border-color: rgb(255 255 255 / 14%);
  background: #202124;
}

.browser-frame .frame-toolbar {
  position: relative;
  height: 78px;
  border-bottom: 1px solid rgb(29 29 31 / 12%);
  background: #f4f4f6;
}

.theme-dark .browser-frame .frame-toolbar {
  border-bottom-color: rgb(255 255 255 / 16%);
  background: #202124;
}

.browser-frame .frame-toolbar::before {
  content: "";
  position: absolute;
  top: 19px;
  left: 22px;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #ec6b5e;
  box-shadow: 20px 0 #f4bf4f, 40px 0 #61c453;
}

.browser-chrome .frame-toolbar::after {
  content: "khazifire.com";
  position: absolute;
  right: 108px;
  bottom: 8px;
  left: 108px;
  height: 28px;
  border-radius: 999px;
  background: #f1f3f5;
  color: #5f6368;
  font-size: 14px;
  line-height: 28px;
  text-align: center;
}

.theme-dark .browser-chrome .frame-toolbar::after {
  background: #303134;
  color: #ffffff;
}

.browser-safari .frame-toolbar {
  height: 52px;
  background: rgb(250 250 252 / 82%);
}

.theme-dark .browser-safari .frame-toolbar {
  background: #202124;
}

.browser-safari .frame-toolbar::after {
  content: "khazifire.com";
  position: absolute;
  top: 12px;
  right: 28%;
  left: 28%;
  height: 28px;
  border: 1px solid rgb(0 0 0 / 22%);
  border-radius: 8px;
  color: #999999;
  font-size: 14px;
  line-height: 26px;
  text-align: center;
}

.theme-dark .browser-safari .frame-toolbar::after {
  border-color: rgb(255 255 255 / 20%);
  color: #ffffff;
}

.browser-screen {
  width: 1200px;
  height: 720px;
}
```

- [ ] **Step 6: Write `device.css`**

Replace `skills/mockup-screenshot/assets/device.css` with:

```css
.device-frame {
  position: relative;
  overflow: hidden;
  background: #f7f7f8;
}

.theme-dark .device-frame {
  background: #1d1d1f;
}

.device-frame .frame-toolbar {
  display: none;
}

.device-screen {
  background: #ffffff;
}

.device-iphone-17-series {
  width: 430px;
  height: 884px;
  padding: 18px;
  border: 10px solid #1d1d1f;
  border-radius: 58px;
}

.device-iphone-17-series::before {
  content: "";
  position: absolute;
  z-index: 2;
  top: 18px;
  left: 50%;
  width: 126px;
  height: 34px;
  border-radius: 999px;
  background: #101014;
  transform: translateX(-50%);
}

.device-iphone-17-series .device-screen {
  width: 374px;
  height: 828px;
  border-radius: 40px;
}

.device-ipad {
  width: 860px;
  height: 1220px;
  padding: 24px;
  border: 12px solid #1d1d1f;
  border-radius: 42px;
}

.device-ipad .device-screen {
  width: 788px;
  height: 1148px;
  border-radius: 26px;
}

.device-mac-pro {
  width: 1240px;
  height: 930px;
  padding: 22px 22px 160px;
  border-radius: 26px;
  background: linear-gradient(#d8d9de, #bfc1c8);
}

.theme-dark .device-mac-pro {
  background: linear-gradient(#343437, #242426);
}

.device-mac-pro::before {
  content: "";
  position: absolute;
  bottom: 62px;
  left: 50%;
  width: 190px;
  height: 104px;
  border-radius: 0 0 18px 18px;
  background: linear-gradient(90deg, #b8bac1, #e3e4e8 48%, #aeb0b7);
  transform: translateX(-50%);
}

.device-mac-pro::after {
  content: "";
  position: absolute;
  bottom: 42px;
  left: 50%;
  width: 460px;
  height: 22px;
  border-radius: 999px;
  background: rgb(0 0 0 / 18%);
  transform: translateX(-50%);
}

.device-mac-pro .device-screen {
  width: 1196px;
  height: 748px;
  border-radius: 16px;
}
```

- [ ] **Step 7: Run tests and verify they pass**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit template and CSS**

Run:

```bash
git add skills/mockup-screenshot/templates/render.html skills/mockup-screenshot/assets/studio.css skills/mockup-screenshot/assets/browser.css skills/mockup-screenshot/assets/device.css skills/mockup-screenshot/tests/render-mockup.test.mjs
git commit -m "feat: add mockup render template and frame styles"
```

## Task 4: Implement Renderer Helpers Without Browser Launch

**Files:**
- Modify: `skills/mockup-screenshot/scripts/render-mockup.mjs`
- Modify: `skills/mockup-screenshot/tests/render-mockup.test.mjs`

- [ ] **Step 1: Add failing tests for helper functions**

Append this to `skills/mockup-screenshot/tests/render-mockup.test.mjs`:

```js
test('renderer helpers parse options and classify inputs', async () => {
  const mod = await import('../scripts/render-mockup.mjs');

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
  const mod = await import('../scripts/render-mockup.mjs');
  const frames = mod.loadFrames(path.join(skillRoot, 'templates/frames.json'));

  assert.throws(() => mod.resolveFrame(frames, 'firefox', 'light'), /Unsupported frame/);
  assert.throws(() => mod.resolveFrame(frames, 'safari', 'sepia'), /Unsupported theme/);
  assert.throws(() => mod.validateMode('poster'), /Unsupported mode/);
});

test('renderer builds HTML with escaped config, CSS links, frame classes, and screenshot source', async () => {
  const mod = await import('../scripts/render-mockup.mjs');
  const frames = mod.loadFrames(path.join(skillRoot, 'templates/frames.json'));
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
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: FAIL because `render-mockup.mjs` exports no helpers yet.

- [ ] **Step 3: Write renderer helper implementation**

Replace `skills/mockup-screenshot/scripts/render-mockup.mjs` with:

```js
#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillRoot = path.resolve(__dirname, '..');

const supportedModes = new Set(['polished', 'tight', 'transparent']);
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

export function parseArgs(argv) {
  const options = {
    theme: 'light',
    mode: 'polished',
    viewport: undefined,
    keepHtml: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--keep-html') {
      options.keepHtml = true;
      continue;
    }
    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    index += 1;

    if (key === 'viewport') {
      options.viewport = parseViewport(value);
    } else {
      options[key] = value;
    }
  }

  for (const required of ['input', 'frame', 'out']) {
    if (!options[required]) {
      throw new Error(`Missing required option --${required}`);
    }
  }

  validateMode(options.mode);
  return options;
}

export function parseViewport(value) {
  const match = /^(\d+)x(\d+)$/.exec(value);
  if (!match) {
    throw new Error(`Viewport must use WIDTHxHEIGHT format, received ${value}`);
  }
  return [Number(match[1]), Number(match[2])];
}

export function validateMode(mode) {
  if (!supportedModes.has(mode)) {
    throw new Error(`Unsupported mode "${mode}". Use polished, tight, or transparent.`);
  }
  return mode;
}

export function classifyInput(input) {
  if (/^https?:\/\//.test(input) || /^file:\/\//.test(input)) {
    return 'url';
  }
  const extension = path.extname(input).toLowerCase();
  if (extension === '.html' || extension === '.htm') {
    return 'html';
  }
  if (imageExtensions.has(extension)) {
    return 'image';
  }
  throw new Error(`Unsupported input type for ${input}`);
}

export function loadFrames(framesPath = path.join(skillRoot, 'templates/frames.json')) {
  return JSON.parse(fs.readFileSync(framesPath, 'utf8'));
}

export function resolveFrame(frames, frameName, theme) {
  const frame = frames[frameName];
  if (!frame) {
    throw new Error(`Unsupported frame "${frameName}". Available frames: ${Object.keys(frames).join(', ')}`);
  }
  if (!frame.themes.includes(theme)) {
    throw new Error(`Unsupported theme "${theme}" for frame "${frameName}". Available themes: ${frame.themes.join(', ')}`);
  }
  return frame;
}

export function toFileUrl(filePath) {
  return pathToFileURL(path.resolve(filePath)).href;
}

export function renderHtml({ skillRoot: root, frame, frameName, theme, mode, screenshotSrc }) {
  const templatePath = path.join(root, 'templates/render.html');
  const template = fs.readFileSync(templatePath, 'utf8');
  const cssLinks = frame.css
    .map((fileName) => `<link rel="stylesheet" href="${toFileUrl(path.join(root, 'assets', fileName))}" />`)
    .join('\n    ');
  const config = {
    frame: frameName,
    theme,
    mode,
    screenshotSrc,
    generatedAt: new Date(0).toISOString(),
  };

  return template
    .replace('__CSS_LINKS__', cssLinks)
    .replace('__CONFIG_JSON__', escapeHtml(JSON.stringify(config)))
    .replaceAll('__MODE__', mode)
    .replaceAll('__THEME__', theme)
    .replace('__FRAME_CLASS__', `${frame.frameClass} theme-${theme}`)
    .replace('__SCREEN_CLASS__', frame.screenClass)
    .replace('__SCREENSHOT_SRC__', screenshotSrc);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function writeTempHtml(html) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mockup-screenshot-'));
  const htmlPath = path.join(dir, 'render.html');
  fs.writeFileSync(htmlPath, html);
  return htmlPath;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const frames = loadFrames();
  const frame = resolveFrame(frames, options.frame, options.theme);
  const inputType = classifyInput(options.input);
  const screenshotSrc = inputType === 'image' ? toFileUrl(options.input) : toFileUrl(options.input);
  const html = renderHtml({
    skillRoot,
    frame,
    frameName: options.frame,
    theme: options.theme,
    mode: options.mode,
    screenshotSrc,
  });
  const htmlPath = writeTempHtml(html);
  console.log(`HTML written to ${htmlPath}`);
  console.log('Browser export is implemented in the next task.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit renderer helpers**

Run:

```bash
git add skills/mockup-screenshot/scripts/render-mockup.mjs skills/mockup-screenshot/tests/render-mockup.test.mjs
git commit -m "feat: add mockup renderer helpers"
```

## Task 5: Implement Playwright Capture and PNG Export

**Files:**
- Modify: `skills/mockup-screenshot/scripts/render-mockup.mjs`
- Modify: `skills/mockup-screenshot/tests/render-mockup.test.mjs`

- [ ] **Step 1: Add failing tests for browser dependency message and capture plan**

Append this to `skills/mockup-screenshot/tests/render-mockup.test.mjs`:

```js
test('renderer exposes Playwright dependency guidance', async () => {
  const mod = await import('../scripts/render-mockup.mjs');
  assert.match(mod.playwrightInstallHelp(), /npm install playwright/);
  assert.match(mod.playwrightInstallHelp(), /npx playwright install chromium/);
});

test('capture plan uses frame defaults unless viewport is provided', async () => {
  const mod = await import('../scripts/render-mockup.mjs');
  const frames = mod.loadFrames(path.join(skillRoot, 'templates/frames.json'));
  const chrome = mod.resolveFrame(frames, 'chrome', 'light');

  assert.deepEqual(mod.resolveViewport(chrome, undefined), [1440, 900]);
  assert.deepEqual(mod.resolveViewport(chrome, [800, 600]), [800, 600]);
  assert.deepEqual(mod.resolveOutputViewport(chrome, 'polished'), [1600, 1000]);
  assert.deepEqual(mod.resolveOutputViewport(chrome, 'tight'), [1200, 799]);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: FAIL because `playwrightInstallHelp`, `resolveViewport`, and `resolveOutputViewport` are missing.

- [ ] **Step 3: Patch renderer with Playwright capture/export functions**

Modify `skills/mockup-screenshot/scripts/render-mockup.mjs`:

1. Add these exports after `validateMode`:

```js
export function playwrightInstallHelp() {
  return [
    'Playwright is required for mockup rendering.',
    'Install it in the current project with:',
    '  npm install playwright',
    '  npx playwright install chromium',
  ].join('\n');
}

export function resolveViewport(frame, viewport) {
  return viewport || frame.defaultViewport;
}

export function resolveOutputViewport(frame, mode) {
  if (mode === 'polished' || mode === 'transparent') {
    return frame.polishedCanvas;
  }
  if (frame.type === 'browser') {
    return [1200, frame.defaultViewport[1] + (frame.label === 'Safari' ? 52 : 78)];
  }
  if (frame.label === 'iPhone 17 series') return [430, 884];
  if (frame.label === 'iPad') return [860, 1220];
  if (frame.label === 'Mac Pro') return [1240, 930];
  throw new Error(`Cannot resolve tight viewport for ${frame.label}`);
}
```

2. Add these functions after `writeTempHtml`:

```js
async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch (error) {
    throw new Error(playwrightInstallHelp());
  }
}

function normalizePageInput(input) {
  if (/^https?:\/\//.test(input) || /^file:\/\//.test(input)) {
    return input;
  }
  return toFileUrl(input);
}

export async function capturePageToImage({ input, viewport }) {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: viewport[0], height: viewport[1] } });
  const outputPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mockup-capture-')), 'capture.png');
  try {
    await page.goto(normalizePageInput(input), { waitUntil: 'networkidle' });
    await page.screenshot({ path: outputPath, fullPage: false });
  } finally {
    await browser.close();
  }
  return outputPath;
}

export async function exportHtmlToPng({ htmlPath, outputPath, viewport, transparent }) {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: viewport[0], height: viewport[1] },
    deviceScaleFactor: 1,
  });
  try {
    await page.goto(toFileUrl(htmlPath), { waitUntil: 'load' });
    await page.waitForSelector('[data-role="mockup-screen"] img');
    await page.screenshot({ path: outputPath, omitBackground: transparent });
  } finally {
    await browser.close();
  }
  const stats = fs.statSync(outputPath);
  if (stats.size === 0) {
    throw new Error(`Generated image is empty: ${outputPath}`);
  }
  return outputPath;
}
```

3. Replace the body of `main` with:

```js
export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const frames = loadFrames();
  const frame = resolveFrame(frames, options.frame, options.theme);
  const inputType = classifyInput(options.input);
  const captureViewport = resolveViewport(frame, options.viewport);
  const screenshotPath = inputType === 'image'
    ? path.resolve(options.input)
    : await capturePageToImage({ input: options.input, viewport: captureViewport });
  const screenshotSrc = toFileUrl(screenshotPath);
  const html = renderHtml({
    skillRoot,
    frame,
    frameName: options.frame,
    theme: options.theme,
    mode: options.mode,
    screenshotSrc,
  });
  const htmlPath = writeTempHtml(html);
  const outputViewport = resolveOutputViewport(frame, options.mode);

  await exportHtmlToPng({
    htmlPath,
    outputPath: path.resolve(options.out),
    viewport: outputViewport,
    transparent: options.mode === 'transparent',
  });

  if (options.keepHtml) {
    console.log(`HTML kept at ${htmlPath}`);
  }
  console.log(`Mockup written to ${path.resolve(options.out)}`);
}
```

- [ ] **Step 4: Run fast tests and verify they pass**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: PASS. These tests must not launch Playwright.

- [ ] **Step 5: Run image smoke test**

Create a tiny local image:

```bash
mkdir -p /tmp/mockup-screenshot-smoke
node -e "require('fs').writeFileSync('/tmp/mockup-screenshot-smoke/pixel.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', 'base64'))"
node skills/mockup-screenshot/scripts/render-mockup.mjs \
  --input /tmp/mockup-screenshot-smoke/pixel.png \
  --frame safari \
  --theme light \
  --mode polished \
  --out /tmp/mockup-screenshot-smoke/safari.png
test -s /tmp/mockup-screenshot-smoke/safari.png
```

Expected: command exits 0 and `/tmp/mockup-screenshot-smoke/safari.png` is non-empty. If Playwright is missing, expected output includes `npm install playwright` and `npx playwright install chromium`; install Playwright or use the repo’s existing Playwright environment before rerunning.

- [ ] **Step 6: Run local HTML smoke test**

Create a local page and render it through a device frame:

```bash
cat > /tmp/mockup-screenshot-smoke/page.html <<'HTML'
<!doctype html>
<html>
  <body style="margin:0;font-family:system-ui;background:#111;color:white">
    <main style="display:grid;place-items:center;width:100vw;height:100vh">
      <h1>Mockup Screenshot</h1>
    </main>
  </body>
</html>
HTML
node skills/mockup-screenshot/scripts/render-mockup.mjs \
  --input /tmp/mockup-screenshot-smoke/page.html \
  --frame iphone \
  --theme dark \
  --mode transparent \
  --out /tmp/mockup-screenshot-smoke/iphone-17-series.png
test -s /tmp/mockup-screenshot-smoke/iphone-17-series.png
```

Expected: command exits 0 and `/tmp/mockup-screenshot-smoke/iphone-17-series.png` is non-empty.

- [ ] **Step 7: Commit Playwright rendering**

Run:

```bash
git add skills/mockup-screenshot/scripts/render-mockup.mjs skills/mockup-screenshot/tests/render-mockup.test.mjs
git commit -m "feat: render mockup screenshots with playwright"
```

## Task 6: Add Final Skill Documentation Checks

**Files:**
- Modify: `skills/mockup-screenshot/SKILL.md`
- Modify: `skills/mockup-screenshot/tests/render-mockup.test.mjs`

- [ ] **Step 1: Add failing documentation coverage test**

Append this to `skills/mockup-screenshot/tests/render-mockup.test.mjs`:

```js
test('skill docs mention every supported frame, mode, and CSS boundary', () => {
  const skill = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');

  for (const frame of ['chrome', 'safari', 'iphone', 'ipad', 'mac-pro']) {
    assert.match(skill, new RegExp(`\\`${frame}\\``), `${frame} documented`);
  }
  for (const mode of ['polished', 'tight', 'transparent']) {
    assert.match(skill, new RegExp(`\\`${mode}\\``), `${mode} documented`);
  }
  assert.match(skill, /browser\.css/);
  assert.match(skill, /device\.css/);
  assert.match(skill, /studio\.css/);
  assert.match(skill, /--keep-html/);
});
```

- [ ] **Step 2: Run test and verify it fails if docs are incomplete**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: FAIL if `--keep-html` or any frame/mode is undocumented.

- [ ] **Step 3: Update `SKILL.md` with troubleshooting and debug HTML**

Add this section before `## Verification` in `skills/mockup-screenshot/SKILL.md`:

```markdown
## Debugging

Use `--keep-html` when the PNG looks wrong:

```bash
node skills/mockup-screenshot/scripts/render-mockup.mjs \
  --input ./screenshot.png \
  --frame chrome \
  --theme light \
  --mode tight \
  --out ./mockup.png \
  --keep-html
```

Open the printed HTML path in a browser to inspect layout, image fit, CSS loading, and frame sizing.

If Playwright is missing, install it in the current project:

```bash
npm install playwright
npx playwright install chromium
```
```

- [ ] **Step 4: Run all tests**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit docs coverage**

Run:

```bash
git add skills/mockup-screenshot/SKILL.md skills/mockup-screenshot/tests/render-mockup.test.mjs
git commit -m "docs: document mockup screenshot usage"
```

## Task 7: Final Verification and Repository Status

**Files:**
- Read: `skills/mockup-screenshot/SKILL.md`
- Read: `skills/mockup-screenshot/templates/frames.json`
- Read: `skills/mockup-screenshot/assets/browser.css`
- Read: `skills/mockup-screenshot/assets/device.css`
- Read: `skills/mockup-screenshot/assets/studio.css`
- Read: `skills/mockup-screenshot/scripts/render-mockup.mjs`
- Read: `skills/mockup-screenshot/tests/render-mockup.test.mjs`

- [ ] **Step 1: Run unit tests**

Run:

```bash
node --test skills/mockup-screenshot/tests/render-mockup.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Verify CSS split**

Run:

```bash
rg -n "\\.browser-" skills/mockup-screenshot/assets/browser.css
rg -n "\\.device-" skills/mockup-screenshot/assets/device.css
! rg -n "\\.device-" skills/mockup-screenshot/assets/browser.css
! rg -n "\\.browser-" skills/mockup-screenshot/assets/device.css
```

Expected: first two commands print matches; last two commands print no matches and exit 0 because of the leading `!`.

- [ ] **Step 3: Verify skill files exist**

Run:

```bash
find skills/mockup-screenshot -maxdepth 3 -type f | sort
```

Expected:

```text
skills/mockup-screenshot/SKILL.md
skills/mockup-screenshot/agents/openai.yaml
skills/mockup-screenshot/assets/browser.css
skills/mockup-screenshot/assets/device.css
skills/mockup-screenshot/assets/studio.css
skills/mockup-screenshot/scripts/render-mockup.mjs
skills/mockup-screenshot/templates/frames.json
skills/mockup-screenshot/templates/render.html
skills/mockup-screenshot/tests/render-mockup.test.mjs
```

- [ ] **Step 4: Run image smoke test**

Run:

```bash
mkdir -p /tmp/mockup-screenshot-smoke
node -e "require('fs').writeFileSync('/tmp/mockup-screenshot-smoke/pixel.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', 'base64'))"
node skills/mockup-screenshot/scripts/render-mockup.mjs \
  --input /tmp/mockup-screenshot-smoke/pixel.png \
  --frame safari \
  --theme light \
  --mode polished \
  --out /tmp/mockup-screenshot-smoke/final-safari.png
test -s /tmp/mockup-screenshot-smoke/final-safari.png
```

Expected: image exists and is non-empty. If Playwright is not installed, install it with the command printed by the script and rerun this step.

- [ ] **Step 5: Run local HTML smoke test**

Run:

```bash
cat > /tmp/mockup-screenshot-smoke/final-page.html <<'HTML'
<!doctype html>
<html>
  <body style="margin:0;background:#0066cc;color:white;font-family:system-ui">
    <main style="display:grid;place-items:center;width:100vw;height:100vh">
      <h1>Framed by mockup-screenshot</h1>
    </main>
  </body>
</html>
HTML
node skills/mockup-screenshot/scripts/render-mockup.mjs \
  --input /tmp/mockup-screenshot-smoke/final-page.html \
  --frame mac-pro \
  --theme light \
  --mode polished \
  --out /tmp/mockup-screenshot-smoke/final-mac-pro.png
test -s /tmp/mockup-screenshot-smoke/final-mac-pro.png
```

Expected: image exists and is non-empty. If Playwright is not installed, install it with the command printed by the script and rerun this step.

- [ ] **Step 6: Check git status**

Run:

```bash
git status --short
```

Expected: no unstaged changes for committed tasks, or only intentional uncommitted changes that the final commit will include.

- [ ] **Step 7: Final commit if previous tasks were implemented without per-task commits**

Run only if the task commits were skipped:

```bash
git add skills/mockup-screenshot
git commit -m "feat: add mockup screenshot skill"
```

Expected: commit succeeds.

## Self-Review

Spec coverage:

- Image input support: Task 4 helper classification, Task 5 image smoke test.
- URL/local HTML input support: Task 5 capture flow and local HTML smoke tests.
- Polished/tight/transparent modes: Task 2 registry, Task 3 `studio.css`, Task 4 mode validation.
- Browser/device frames: Task 2 registry and Task 3 CSS files.
- `browser.css` and `device.css` split: Task 3 CSS boundary tests and Task 7 split verification.
- Script-backed workflow: Task 4 and Task 5 renderer implementation.
- Verification command: Task 6 documentation and Task 7 final verification.

Placeholder scan:

- No step relies on an unnamed future function.
- Every code-changing step includes exact file content or exact patch content.
- Every test step includes the exact command and expected outcome.

Type consistency:

- Frame registry fields used by tests and script are `type`, `label`, `themes`, `defaultViewport`, `polishedCanvas`, `frameClass`, `screenClass`, and `css`.
- Renderer helper names used by tests are defined in Task 4 or Task 5: `parseArgs`, `classifyInput`, `loadFrames`, `resolveFrame`, `validateMode`, `renderHtml`, `playwrightInstallHelp`, `resolveViewport`, and `resolveOutputViewport`.
