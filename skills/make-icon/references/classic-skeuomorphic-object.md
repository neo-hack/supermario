# Classic Skeuomorphic Object

Use this reference for a polished app icon whose identity comes from a recognizable physical object rendered with convincing material, construction, and shallow spatial depth. Extract the visual language from references without copying their object, branding, labels, or composition.

## Style DNA

- **Metaphor:** one familiar physical object communicates the function directly. The icon should feel designed and manufactured, not illustrated as a flat symbol.
- **Structure:** one dominant object, an optional supporting enclosure or holder, and at most one small functional accent.
- **Silhouette:** compact and iconic, usually contained by a rounded-square plate or forming its own rounded app-icon boundary.
- **Viewpoint:** near-frontal or slightly elevated three-quarter view with shallow perspective. Keep the complete physical object upright and aligned to the square canvas.
- **Depth:** use real overlap, recess, rim thickness, bevel, and contact occlusion. Keep the construction shallow enough to read at small sizes.
- **Finish:** precise high-resolution 3D rendering with restrained realism rather than photography, clay, or cartoon volume.

## Prompt Keywords

`classic skeuomorphic app icon`, `recognizable physical metaphor`, `polished manufactured object`, `rounded icon silhouette`, `near-frontal shallow perspective`, `realistic material contrast`, `localized frosted glass`, `foreground frosted overlay`, `subtle bevel`, `recessed detail`, `controlled studio reflection`, `local contact occlusion`, `small-size readability`

## Material Contract

- Use two or three clearly different materials, selected for the subject: matte polymer, glossy coated surface, brushed metal, polished metal, clear or frosted glass, translucent polymer, rubber, ceramic, paper, or fabric.
- Give each material one decisive cue: broad soft highlight for polymer, narrow reflection for metal, restrained transmission for glass, or fine directional texture for brushed surfaces.
- Keep surfaces clean and idealized. Use microtexture only where it explains material; never apply uniform noise.
- Reflections follow one coherent environment and must not obscure the object.

### Frosted Glass Variants

Select exactly one mode. Frosted glass or translucent polymer still counts toward the two-or-three-material limit.

**Integrated region:**

- Use one window, inset, side shell, cover, or control surface that belongs to the object's construction.
- Keep it subordinate, normally covering `12–38%` of the visible object. A subject whose real construction is translucent may use more, but must retain an opaque structural frame.

**Foreground overlay mask:**

- Place one broad frosted panel in front of the dominant object, anchored to the lower or side edge of the icon like a physical shield, sleeve, pocket, or protective cover.
- Let it occupy roughly `22–42%` of the icon and overlap `15–34%` of the dominant object. Keep the strongest identity feature clearly visible above or through it.
- Use one simple outer contour and, when useful, one broad curved reveal or shallow notch. Do not reproduce a reference's exact holder shape.
- Give the overlay a believable rim, shallow thickness, and one close occlusion line where it passes in front. It must feel attached or supported, never like a floating UI card.
- Do not place labels, signatures, decorative text, or controls on the overlay unless the user explicitly requests them.

**Shared rendering:**

- Preserve a crisp physical rim. Diffuse only what lies behind the frosted region; do not blur its silhouette or the entire icon.
- Use lightly tinted milky transmission, low-contrast obscured shapes, and one broad restrained reflection. It should feel roughened or etched, not luminous.
- Avoid combining both modes, stacked glass cards, floating panes, rainbow refraction, glowing edges, heavy background blur, or transparent UI effects.

## Construction Contract

- Show only the strongest two or three physical affordances or construction cues.
- Use seams, rims, grooves, apertures, fasteners, or embossed regions only when they explain how the object is built or used.
- Simplify repeated detail into a few broad marks that survive at `32 × 32`.
- Preserve believable thickness and attachment. Nothing should float without a physical reason.

## Lighting and Shadow Contract

- Use one large soft key light from above-left or above-center, gentle fill, and restrained rim separation.
- Keep specular highlights broad and material-specific; avoid sparkles and clipped white hotspots.
- Use tight ambient occlusion in recesses and one soft local contact shadow between touching parts.
- Avoid long cast shadows, dramatic spotlights, colored glow, bloom, or a halo around the icon.

## Composition Contract

- Let the complete icon occupy `78–92%` of the square while preserving a clean outer silhouette.
- Place the main functional feature near the optical center and allow a supporting enclosure to crop or overlap it.
- Prefer a three-layer hierarchy: base or enclosure, dominant object, then compact accent or foreground overlay.
- Keep the palette compact: one dominant neutral or material color, one contrasting material, and one optional accent.

## Handwritten Signature Variant

Signatures are optional and must be explicitly requested. Never invent signature text. If the user asks for a signature without supplying the words, ask once:

> 签名文字写什么？可以选择创作者名、产品／App 名、工作室名、首字母组合，或自定义文字。手写风格想要流畅签名、随性手写、马克笔、干笔刷，还是工整斜体？

If the user supplies the exact text, preserve it verbatim and do not ask again unless the handwriting style materially affects the result.

### Handwriting Menu

| Choice | Visual language |
|---|---|
| Fluid cursive signature | Connected, elegant, thin-to-medium strokes, restrained terminal flourish |
| Casual handwritten | Relaxed print-cursive hybrid, uneven rhythm, friendly and readable |
| Felt-tip marker | Rounded monoline strokes, compact spacing, confident contemporary mark |
| Dry brush script | Controlled thick-thin variation and sparse dry texture, expressive but legible |
| Neat slanted hand | Clean separated or lightly joined letters, modest right slant, archival or technical mood |

### Signature Contract

- Place one signature on a quiet lower enclosure, foreground overlay, label region, or other physically plausible printable surface.
- Let it span roughly `26–48%` of that surface width without covering the main affordance, rim, or compact accent.
- Keep the object, enclosure, overlay, controls, shadows, and canvas upright. Rotate only the complete signature block `3–8°`, or use a baseline that rises or falls `3–10°`.
- Align the signature to its physical surface even when the letters or baseline are angled; it must not change the orientation of the underlying object.
- Render it as ink, paint, engraving, embossing, or print according to the material; do not make it hover above the surface.
- Quote exact text in the generation prompt and spell it character by character when necessary. Add no second label, slogan, serial number, or pseudo-text.

Outside this optional variant, do not invent logos, signatures, serial numbers, or decorative text. When a label is structurally useful, render it as a blank plaque or simple nonverbal mark unless the user supplies exact text.

## Keep Out

Avoid flat vector treatment, gradient-only silhouettes, cute facial features, clay or plush rendering, low-poly facets, exaggerated toy proportions, full-icon glassmorphism, stacked transparent cards, cinematic scenes, excessive grime, photoreal background environments, dense mechanical detail, floating parts, illegible pseudo-text, watermarks, and copied brand identity.

## Combine With

- With `ip-as-logo`: preserve the dominant silhouette, compact palette, and small-size recognition; this reference explicitly replaces flat-color rendering with controlled physical materials.
- With `pebble-logo`: borrow compact proportion and approachable rounding only; replace paper-clay tactility and mascot anatomy with manufactured construction and realistic surfaces.
