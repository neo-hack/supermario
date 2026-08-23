# Gradient Flat Shapes

Use this reference for a minimal abstract shape mascot built from clean flat silhouettes, simple color gradients, and sparse anthropomorphic marks. Do not use it to depict a recognizable object, animal, person, device, or scene.

## Style DNA

- **Structure:** one dominant shape or two interacting macro-shapes; never use more than two primary shapes.
- **Default shape vocabulary:** circles, ellipses, capsules, soft squares, rounded rectangles, rounded polygons with four or more sides, arches, and rings.
- **Optional irregular vocabulary:** asymmetric blobs, wobbly forms, and other simple irregular closed silhouettes; use only when the user explicitly requests irregularity, organic shape, blob, or hand-drawn character.
- **Edge:** crisp, smooth, and outline-free. Every silhouette has a clear closed boundary without blur or feathering.
- **Fill:** exactly one broad two-color gradient per shape.
- **Depth:** flat. Overlap uses clean occlusion only, without shadows, highlights, bevels, or simulated thickness.
- **Color:** select from one compact palette of three to five colors. Use monochrome, analogous, or restrained complementary relationships with clear value separation.
- **Composition:** the shape group stays near the optical center and occupies a balanced portion of the canvas according to the proportion contract below.

## Prompt Keywords

`abstract shape mascot`, `gradient flat design`, `one or two regular shapes`, `simple geometric silhouette`, `minimal anthropomorphic marks`, `clean closed silhouette`, `crisp outline-free edge`, `broad two-color gradient`, `flat color transition`, `small-size clarity`

## Subject Contract

Name one or two regular shapes by default and, when using two, their geometric relationship, for example:

- one capsule nested inside a circle;
- two offset capsules crossing at a gentle angle;
- one large blob embracing a smaller ellipse;
- two ellipses leaning gently toward each other.

Identity comes from silhouette, proportion, overlap, spacing, color rhythm, and a tiny expression. Do not introduce an irregular silhouette merely to make the result feel friendlier; use face placement, rotation, proportion, and spacing first. When irregularity is explicitly selected, use one or two broad asymmetries rather than a noisy contour.

## Anthropomorphic Contract

- Add two simple eyes by default; they may be dots, short capsules, or small flat ovals.
- Optionally add one short curved or pill-shaped mouth. Do not add limbs.
- Use one solid color for all facial marks, without gradients, highlights, outlines, or shadows.
- Choose the darkest or lightest palette color for the face according to contrast with the local fill; do not introduce a weak midtone.
- Keep marks large, rounded, widely spaced, and readable at `32 × 32`.
- Expression stays calm, curious, cheerful, sleepy, or gently mischievous.
- The face group may shift or rotate slightly independently from the main shape, but stays comfortably inside it.
- The result remains an abstract shape mascot, not a disguised real-world object or anatomically complete character.

## Gradient Contract

- Treat the gradient as a flat color field, not as lighting or material rendering.
- Use a broad linear, diagonal, or restrained radial transition with no visible banding.
- Keep stops within a compact palette and avoid extreme light-to-dark jumps that imply a rounded surface.
- Do not place bright hotspots, edge highlights, dark contact zones, or reflected color around overlaps.
- A shape must read identically in silhouette if its gradient is replaced by one solid midtone.

## Controlled Variation

Create variety from a small parameter set instead of adding features:

- choose one or two shapes from the default vocabulary unless the brief explicitly activates the irregular vocabulary;
- vary broad asymmetry, scale, overlap, and whole-shape rotation;
- vary eye spacing, mouth state, and a slight face offset or rotation;
- choose colors only from the selected compact palette.

For a family, keep the rendering rules fixed and change only these parameters. The same named or seeded variant should preserve the same choices when deterministic output is required.

## Background Contract

- Default to an isolated mascot on one plain solid canvas: white, off-white, neutral, or a contrasting chromatic color.
- When the user asks for an avatar rather than an icon mark, a circle or rounded-square mask may contain a full-bleed solid field.
- Keep the background flat and complete to all four edges.
- Add no haze, aura, vignette, ambient patch, particle, scenery, or secondary gradient unless the user explicitly asks for it.

## Proportion Contract

- Measure the complete primary-shape group by its bounding box, excluding facial marks.
- Default bounding-box width is `50–66%` of the canvas; default height is `48–64%`.
- Keep the primary group aspect ratio between `0.88:1` and `1.18:1`. Do not create a tall narrow oval or a stretched horizontal lozenge by default.
- A deliberately capsule-like brief may extend the aspect ratio to `0.72:1` or `1.38:1`; other shapes require an explicit proportion request to exceed the default range.
- Keep at least `16%` clear canvas on every side and place the visual center within `5%` of the canvas center.
- When using two shapes, measure their combined silhouette against the same limits; do not size each shape independently to the maximum.
- Place facial marks inside the central `50%` of the primary shape unless an intentional expression requires a small offset.

## Adjustable Axes

- Geometry: circular, capsule-based, rectangular, arched, ring-shaped, or polygonal with four or more sides by default; organic or broadly irregular only on request.
- Relationship: nested, overlapping, interlocking, orbiting, or gently stacked.
- Gradient direction: horizontal, vertical, diagonal, or restrained radial.
- Proportion: balanced by default; compact, top-heavy, bottom-heavy, or asymmetrically offset only when requested.
- Canvas: white, warm neutral, cool neutral, dark, or chromatic.

## Keep Out

Avoid triangles and triangular silhouettes by default, more than two primary shapes, limbs, detailed anatomy, realistic eyes, noses, ears, fingers, clothing, accessories, 3D volume, inflated forms, gel, clay, glossy plastic, glass, lighting effects, glow, bloom, inner luminosity, rim light, ambient occlusion, shading, blur, feathered edges, outlines, sticker borders, bevels, extrusion, highlights, reflections, cast shadows, grounding shadows, transparency, grain, texture, recognizable objects, scenery, letters, logos, and text.

## Combine With

- With `ip-as-logo`: preserve its severe shape budget, palette discipline, and small-size silhouette test, but replace any concrete subject with an abstract geometric composition.
- With `pebble-logo`: borrow organic asymmetry, friendly proportions, and restrained expression; do not carry over tactile material, relief, texture, or shadows.
