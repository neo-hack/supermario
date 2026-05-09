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
    return [1200, frame.label === 'Safari' ? 773 : 799];
  }
  if (frame.label === 'iPhone 17 series') return [428, 868];
  if (frame.label === 'iPad') return [560, 778];
  throw new Error(`Cannot resolve tight viewport for ${frame.label}`);
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

export function loadFrames(framesPath = path.join(skillRoot, 'assets/frames.json')) {
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
  const templatePath = path.join(root, 'assets/render.html');
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
  const isDevice = frame.type === 'device';
  const deviceAccessories = [
    '<div class="device-stripe" aria-hidden="true"></div>',
    '<div class="device-header" aria-hidden="true"></div>',
    '<div class="device-sensors" aria-hidden="true"></div>',
    '<div class="device-btns" aria-hidden="true"></div>',
    '<div class="device-power" aria-hidden="true"></div>',
    '<div class="device-home" aria-hidden="true"></div>',
  ].join('\n          ');

  return template
    .replace('__CSS_LINKS__', cssLinks)
    .replace('__CONFIG_JSON__', escapeHtml(JSON.stringify(config)))
    .replaceAll('__MODE__', mode)
    .replaceAll('__THEME__', theme)
    .replace('__FRAME_CLASS__', `${frame.frameClass} theme-${theme}`)
    .replace('__DEVICE_FRAME_OPEN__', isDevice ? '<div class="device-frame">' : '')
    .replace('__DEVICE_ACCESSORIES__', isDevice ? deviceAccessories : '')
    .replace('__DEVICE_FRAME_CLOSE__', isDevice ? '</div>' : '')
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
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: viewport[0], height: viewport[1] },
    deviceScaleFactor: 1,
  });
  try {
    await page.goto(toFileUrl(htmlPath), { waitUntil: 'load' });
    await page.waitForSelector('[data-role="mockup-screen"] img');
    await page.locator('[data-role="mockup-screen"] img').evaluate((img) => {
      if (img.complete) return undefined;
      return new Promise((resolve, reject) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', reject, { once: true });
      });
    });
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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
