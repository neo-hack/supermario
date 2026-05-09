---
name: mockup-screenshot
description: Create framed PNG screenshot mockups from image files, URLs, or local HTML. Use when asked to wrap screenshots or webpages in Chrome, Safari, iPhone 17 series, or iPad frames; generate polished, tight, or transparent mockup assets; or prepare product screenshots for docs, landing pages, READMEs, and social posts.
---

# Mockup Screenshot

Generate framed PNG screenshot mockups from image files, webpages, or local HTML files.

## Output

Default output is a `polished` PNG: a presentation canvas with background, centered frame, and shadow. Use `tight` to crop to the frame. Use `transparent` for a transparent background.

## Supported Frames

Browser frames:
- `chrome` with `--theme light|dark`
- `safari` with `--theme light|dark`

Device frames:
- `iphone` with `--theme light|dark` for the default iPhone 17 series frame
- `ipad` with `--theme light|dark`

## Workflow

1. Identify the input: pass an existing image path, URL, or local HTML file.
2. Choose a frame: `chrome`, `safari`, `iphone`, or `ipad`.
3. Choose `--theme light|dark` and `--mode polished|tight|transparent`.
4. Run `scripts/render-mockup.mjs` from the repository root:

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
  --frame chrome \
  --mode polished \
  --out ./mockup.png
```

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

- `scripts/render-mockup.mjs` validates CLI options, captures URL/local HTML inputs with Playwright, renders `assets/render.html`, and exports PNG output.
- `assets/browser.css` owns browser chrome.
- `assets/device.css` owns physical device shells.
- `assets/studio.css` owns shared canvas modes.
- `assets/frames.json` is the frame registry.
- `assets/render.html` is the only HTML shell the script screenshots.
