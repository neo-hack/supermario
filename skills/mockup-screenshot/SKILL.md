---
name: mockup-screenshot
description: Use when asked to create product screenshot mockups, wrap an image or webpage in a browser/device frame, generate Chrome/Safari/iPhone 17 series/iPad framed PNGs, or produce polished/tight/transparent screenshot assets for docs, landing pages, READMEs, or social posts.
---

# Mockup Screenshot

Generate framed screenshot mockups from either an image file or a webpage/local HTML input.

## When to Use

- "Put this screenshot in a Safari frame"
- "Generate a product mockup PNG from this URL"
- "Make a README-ready browser screenshot"
- "Wrap this image in an iPhone 17 series or iPad frame"
- "Export a transparent device mockup"

## Output

Default output is a polished PNG: a full presentation canvas with background, centered frame, and shadow. Use `--mode tight` to crop to the frame itself. Use `--mode transparent` for a transparent background.

## Supported Frames

Browser frames:
- `chrome` with `--theme light|dark`
- `safari` with `--theme light|dark`

Device frames:
- `iphone` with `--theme light|dark` for the default iPhone 17 series frame
- `ipad` with `--theme light|dark`

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

- `assets/browser.css` owns browser chrome.
- `assets/device.css` owns physical device shells.
- `assets/studio.css` owns shared canvas modes.
- `templates/frames.json` is the frame registry.
- `templates/render.html` is the only HTML shell the script screenshots.
