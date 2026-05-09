# Mermaid Course — Storyboard Follow-up Design

**Date:** 2026-05-05
**Skill:** `skills/codemermaid/`
**Status:** Draft for planning
**Context:** Findings from reviewing `/Volumes/ORICO/Users/jiangwei/projects/claudeui/docs/codebase-course/` and the experimental storyboard replacement page `/Volumes/ORICO/Users/jiangwei/projects/claudeui/docs/codebase-course/plugin-lifecycle-storyboard.html`.

## Problem

The first generated `claudeui` course exposed three storyboard/code presentation issues:

1. Generated pages can contain storyboard-capable runtime and CSS while the page data still contains no `storyboard` units. The reader then never sees the approved Cinema Strip UI.
2. Storyboard code drawers and normal code-walk blocks do not show visible line numbers, even though highlight metadata is line-based.
3. Generated code excerpts preserve too many blank rows, making short teaching snippets feel loose and harder to scan.
4. Zoom overlay controls mix text glyphs and SVG icons, causing reset, close, zoom-in, and zoom-out to render at inconsistent visual sizes.

The approved storyboard direction remains **Variant B · Cinema Strip** with **P3 aside-panel annotations**, matching:

- `/Volumes/ORICO/Users/jiangwei/.gstack/projects/supermario/designs/mermaid-storyboard-wireframe-v2-20260504/variant-B-cinema-strip.html`
- `file:///Volumes/ORICO/Users/jiangwei/.gstack/projects/supermario/designs/mermaid-storyboard-wireframe-v2-20260504/variant-B-states.html`

## Goal

Make generated courses visually prove that storyboard replaced code-walk where appropriate:

- Use `storyboard` instead of `code-walk` for multi-step lifecycles, state transitions, generation pipelines, and other sequence-heavy explanations.
- Render the Cinema Strip whenever the page data contains storyboard units.
- Show visible line numbers in all code teaching surfaces, including storyboard drawers and existing code-walk variants.
- Keep code excerpts compact by removing leading/trailing blank lines and limiting interior blank rows.

## Non-Goals

- No new page template system.
- No React, canvas timeline library, or build step.
- No migration for already-generated courses beyond regenerating them or manually patching experimental files.
- No replacement of all `code-walk` units. Static source explanation can remain `code-walk`; sequence explanation should become `storyboard`.

## Requirements

### Storyboard Data Presence

The generator must not treat storyboard support as a styling-only feature. For any module whose main lesson is a sequence of changes, the generated `units[]` should include a `storyboard` unit rather than an equivalent `code-walk`.

Good storyboard candidates:

- Plugin lifecycle.
- Template assembly.
- Subagent page generation.
- Request/response pipelines.
- State machines.
- Parser/build phases.

Bad storyboard candidates:

- One static architecture overview.
- A short function where the teaching value is one conditional or return value.
- Long prose explanation with no meaningful scene-to-scene change.

### Code Line Numbers

Every rendered code block used for teaching must display stable, visible, 1-based line numbers:

- `code-walk` stacked, split, and stepped layouts.
- `compare` left/right code blocks.
- `guess-first.reveal.code`.
- Storyboard `scene.code.source` inside the collapsible drawer.

Line numbers are visual affordances, not only `data-line` attributes. Highlight metadata must continue to use the same 1-based numbering that the reader sees.

The line-number gutter should:

- Use tabular numerals.
- Stay visually separate from code text.
- Not wrap or shift when highlights activate.
- Remain readable on mobile layouts.

### Blank-Line Control

Generated snippets should preserve semantic spacing but avoid airy output:

- Trim leading and trailing blank lines from every code excerpt before rendering.
- Collapse runs of 2+ blank lines inside teaching snippets to a single blank line.
- Prefer elision comments such as `// ...` or `# ...` over multiple blank rows when a source slice skips irrelevant code.
- Keep normal indentation intact.

Renderer behavior should be defensive even if a generator emits messy snippets. Skill guidance should also instruct agents to select tighter code slices.

### Storyboard Scene Data Transport

Storyboard scene JSON must be readable by the browser runtime after HTML generation. If scene data is stored in a `<template>` element, runtime code must read from `template.content.textContent`; if stored in a script JSON tag, `textContent` is sufficient.

This requirement exists because the experimental page had complete `PAGE.units[].scenes` data but the browser scene loader initially saw an empty string.

### Zoom Overlay Controls

Zoom overlay controls should use compact icon buttons for all commands:

- Zoom in uses a plus icon.
- Zoom out uses a minus icon.
- Reset zoom uses a reset/rotate icon.
- Close zoom uses an X icon.
- Button text should live in `aria-label` and `title`, not visible button copy.
- Icon buttons must remain 36px square, centered, and keyboard accessible.
- All command icons should share the same SVG viewport, rendered size, stroke width, and centering rules.

## Validation

Add or update checks so regressions are visible before a course is handed to the user:

- Unit validation should accept storyboard scene code with highlights and reject malformed highlight line numbers.
- A renderer smoke test should assert that storyboard scene data can be parsed from the generated HTML container.
- A DOM/string smoke test should assert that code rendering emits visible line-number elements, not just `data-line` attributes.
- A snippet normalization test should cover leading blank lines, trailing blank lines, and repeated interior blank lines.
- A DOM/string smoke test should assert zoom in, zoom out, reset, and close controls render SVG icons with accessible labels instead of visible text labels.
- Manual visual QA should compare a generated storyboard page against the approved Variant B Cinema Strip and states references.

## Success Criteria

- The `plugin-lifecycle` lesson can be represented as a storyboard page with no `code-walk` unit.
- The Cinema Strip is visible when the page contains storyboard data.
- Storyboard code drawers show line numbers aligned with annotation notes.
- Existing code-walk blocks also show visible line numbers.
- Short generated code excerpts no longer contain distracting leading/trailing blank rows or repeated blank rows.
- Zoom in, zoom out, reset, and close appear as consistently sized centered icon buttons, with accessible labels preserved for screen readers and tooltips.
