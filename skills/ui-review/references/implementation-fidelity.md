# Implementation Fidelity Review

Use this reference when a design reference and a live product are both available. The goal is to decide whether the live product faithfully implements the design reference.

Design reference can mean Figma, screenshots, Storybook, design-system docs, annotated mockups, product specs, brand guidelines, or an existing product baseline.

## Fidelity Principles

- Judge against the design reference first, not generic taste.
- Differences matter when they change visual hierarchy, rhythm, density, brand quality, readability, accessibility basics, responsive composition, or component behavior.
- Do not require pixel parity for its own sake. A 1-2px difference is usually noise unless it compounds across the page or breaks alignment.
- If the design reference conflicts with the project design system, classify it as a `Design-system mismatch` or `Design-source concern`, not an implementation bug.
- If the design reference omits a state, judge the live state against nearby component conventions and the design system.

## Extract Intent From The Design Reference

Record the intended UI system before inspecting live differences:

- Page structure and content hierarchy
- Layout grid, columns, max widths, section rhythm
- Typography: families, scale, weights, line-height, letter spacing
- Color: palette, semantic colors, opacity, gradients, contrast intent
- Spacing: padding, margin, gaps, container offsets
- Components: buttons, inputs, nav, cards, menus, dialogs, tables, tags, alerts
- Surfaces: background, elevation, borders, shadows, radii
- Assets: icons, logos, photos, illustrations, crops, aspect ratios
- Responsive frames or breakpoints
- Visible states: hover, focus, active, disabled, loading, empty, success, error
- Motion or prototype behavior, if specified
- Copy, labels, helper text, error text, and button text

If multiple design frames exist, map each frame to the live route, viewport, and state it should match.

## Inspect The Live Product

Capture evidence for each reviewed surface:

- Desktop screenshot
- Mobile screenshot
- Tablet screenshot when relevant
- Full-page screenshot for page rhythm
- State screenshots for hover, focus, active, disabled, loading, empty, success, error, modal, drawer, menu, popover, and toast states when relevant
- Console or runtime observations only when they produce visible UI issues

Review the rendered product first. Read code only when needed to explain or fix a finding.

## Fidelity Checklist

### 1. Layout And Composition

- Page sections appear in the intended order.
- Container widths match the reference or project layout system.
- Grid columns and alignment match the reference.
- Hero, header, sidebar, content, and footer proportions match intent.
- Primary content and secondary content occupy the intended visual weight.
- Floating, sticky, fixed, and overlay elements sit in the intended positions.
- No unexpected overlap, clipping, wrap, or z-index conflict.
- Empty space matches the intended rhythm rather than looking compressed or loose.

### 2. Typography Fidelity

- Font family matches the reference or approved fallback.
- Font weight matches intended hierarchy.
- Font size and line-height match the reference or token.
- Heading levels visually match the reference.
- Text alignment, width, wrapping, and truncation match intent.
- Letter spacing, text transform, and numeric formatting match intent.
- Copy matches the reference unless the product intentionally changed it.
- Special punctuation and loading ellipses match the product copy style.

Use generic readability heuristics only when the reference lacks a type system or the chosen type creates a quality issue.

### 3. Color, Contrast, And Surface Fidelity

- Primary, secondary, accent, semantic, and neutral colors match the reference or tokens.
- Text colors and opacity levels match intended emphasis.
- Backgrounds, surfaces, borders, dividers, shadows, and elevation match intent.
- Gradients, image overlays, and transparency effects match the reference.
- Dark-mode surfaces and text match the reference, if provided.
- Disabled, selected, active, success, warning, and error colors match state intent.

If the implementation changes a color for accessibility, classify it as intentional only when the result still fits the design system.

### 4. Spacing And Sizing Fidelity

- Section spacing, card padding, row height, column gaps, and control gaps match the reference or spacing tokens.
- Buttons, inputs, tabs, chips, icons, avatars, thumbnails, and cards match intended sizes.
- Border radius and inner radius relationships match the reference.
- Icon size and icon-text gap match the reference.
- Form labels, helper text, errors, and controls align with intended spacing.
- Tables and lists match intended density.

Flag repeated small spacing errors when they change the page rhythm, even if each single value looks minor.

### 5. Component Fidelity

- Component variants match: primary, secondary, tertiary, destructive, ghost, link, compact, large.
- Component anatomy matches: icon placement, label placement, helper text, counters, badges, shortcuts.
- Navigation, tabs, breadcrumbs, pagination, filters, and sort controls match the reference.
- Cards and panels use the intended surface, border, radius, shadow, and padding.
- Modals, drawers, menus, tooltips, and popovers use the intended placement and chrome.
- Tables, charts, lists, and data cells preserve intended hierarchy and density.

### 6. Visible UI States

Check visible states rather than long UX journeys:

- Default
- Hover
- Focus-visible
- Active or pressed
- Selected
- Disabled
- Loading
- Empty
- Success
- Error or invalid
- Open and closed overlay states
- Sticky or scrolled states
- Mobile navigation states

For each state, report whether it is:

- Present
- Missing
- Visually inconsistent
- Layout-breaking
- Not covered by the design reference

When a state is not covered by the reference, compare it to the project design system and adjacent shipped components.

### 7. Responsive Fidelity

- Each design breakpoint maps to the correct live viewport.
- Mobile is composed like the reference, not merely stacked.
- Navigation adapts as intended.
- Content priority changes match the reference.
- Text, buttons, and media remain within bounds.
- Images crop or scale according to the reference.
- Tables, charts, and dense panels use the intended small-screen treatment.
- No horizontal overflow appears unless explicitly designed.
- Safe areas and sticky elements do not cover content.

### 8. Asset Fidelity

- Logos, icons, images, illustrations, and video posters match the reference.
- Aspect ratios and crops match the reference.
- Image resolution is sufficient at target sizes.
- Icon style is consistent with the design system.
- Placeholder or fallback assets are not visible in production.

### 9. Motion Fidelity

- Animations, if specified, use the intended trigger, direction, duration, and easing.
- Enter, exit, hover, selection, and loading motion match the reference or product conventions.
- Motion does not introduce layout shift or delayed feedback.
- Reduced-motion behavior is acceptable when relevant.

### 10. Runtime-Only UI Issues

Classify as `Runtime UI issue` when the design reference cannot show the problem:

- Layout shift during load
- Font swap or late-loading visual jump
- Button width jump during loading
- Toasts overlapping modals
- Sticky headers covering anchors
- Mobile horizontal overflow
- Hover or focus causing layout shift
- Error text pushing critical controls out of view
- Skeletons that do not match final content
- Missing cursor, focus ring, or disabled affordance

## Finding Classification

Use these types:

- **Implementation mismatch**: product differs from the reference.
- **Design-system mismatch**: product or reference conflicts with established tokens/components.
- **Runtime UI issue**: live-only visual issue.
- **Design-source concern**: reference itself has a quality problem.

Do not mix responsibility. If the reference is weak and the product implemented it correctly, mark it as `Design-source concern`, not `Implementation mismatch`.

## Fidelity Score

Return a fidelity score only when a design reference exists:

- **A**: live product preserves the design intent with only tiny non-material differences.
- **B**: mostly faithful; minor visible deviations remain.
- **C**: recognizable, but multiple mismatches affect rhythm, hierarchy, or component polish.
- **D**: design intent is weakened by major layout, typography, component, or responsive mismatches.
- **F**: live product no longer represents the design reference.

Prioritize fidelity findings that affect hierarchy, component identity, responsive composition, or user trust.
