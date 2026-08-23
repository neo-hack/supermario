---
name: make-icon
description: Use when an app icon request is visually ambiguous or combines minimalist symbols, tactile mascots, flat geometric avatars, translucent layers, or classic skeuomorphic objects.
---

# Make Icon

Route each request to exactly one downstream skill. Do not blend their full rule sets.

**DOWNSTREAM SKILLS:**

- `ip-as-logo` — [s1dashu/ip-as-logo-skill](https://github.com/s1dashu/ip-as-logo-skill)
- `pebble-logo` — [war3shenzuo/pebble-mascot](https://github.com/war3shenzuo/pebble-mascot)

If the selected skill is unavailable, tell the user which repository is required and ask them to install or enable it. Do not imitate an unavailable skill from this routing summary.

## Route

| Observable request signal | Select |
|---|---|
| Paper clay, cut paper, paper fiber, handmade tactility, shallow relief, soft contact shadows | `pebble-logo` |
| App-icon family, pose-aware face, side/profile crop, several crop modes | `pebble-logo` |
| Brand IP, logo-like symbol, extreme simplification, geometric compression, two subject colors, 32 px recognition | `ip-as-logo` |
| Dominant character filling the square and emerging from the lower-left or lower-right | `ip-as-logo` |

Generic words such as *cute*, *rounded*, *mascot*, *avatar*, and *app icon* do not distinguish the styles.

When signals conflict, identify which requested property defines the visual identity:

- Explicit tactile material usually selects `pebble-logo`; pass simplicity and small-size legibility as constraints.
- Explicit near-flat brand-symbol treatment usually selects `ip-as-logo`; do not add a clay rendering merely because the user also says “soft.”
- If both are explicit and neither is clearly secondary, ask the choice question below.

Load and follow only the selected skill. Preserve the user's subject, palette, quantity, crop, and platform requirements.

## Optional Style References

After selecting one downstream skill, read at most one reference when the user requests that material language:

- [Outlined sticker with soft shadow](references/outlined-sticker-with-soft-shadow.md) — nested keyline, flat graphic foreground, shallow separation shadow, optional quiet base.
- [Gradient flat shapes](references/gradient-flat-shapes.md) — one or two regular gradient shapes by default, with sparse anthropomorphic marks; irregular forms require an explicit cue.
- [Layered translucent cards](references/layered-translucent-cards.md) — a small hierarchy of offset glass and opaque planes.
- [Classic skeuomorphic object](references/classic-skeuomorphic-object.md) — a recognizable physical object compressed into a polished icon with realistic material, shallow depth, and studio lighting.

The selected downstream skill remains the structural base. The reference changes only shape finish, material, depth, and composition where it explicitly says so. Never combine multiple references unless the user asks for a hybrid.

## Ask Once When Ambiguous

If no decisive signal exists, ask one question in the user's language:

> 你更想要哪种方向：极简、接近品牌符号的图形，还是带纸黏土／剪纸触感的 App icon？

Map the first choice to `ip-as-logo` and the second to `pebble-logo`. Do not start a broader branding questionnaire at the routing stage. After the answer, route immediately; let the selected skill perform any discovery it requires.

## When the User Forbids Questions

If the request concerns the current product, inspect read-only product context first: README, product docs, manifests, design tokens, existing icons, and screenshots.

- Choose `ip-as-logo` for a minimal, utility-like, brand-system direction.
- Choose `pebble-logo` for a warm, lifestyle, companion-like, editorial, or handmade direction.
- If context remains neutral, default to `ip-as-logo` as the less material-specific treatment and briefly disclose the assumption.

## Handoff Contract

State the selected direction in one short sentence, then execute it. If the user names either downstream skill, route there without asking unless the request is internally contradictory.

## Common Mistakes

- Loading both downstream skills and negotiating between incompatible color, composition, batch, or retry rules.
- Asking the user to choose when “paper clay” or “extreme brand-symbol simplicity” already answers the question.
- Treating “App icon” as automatic evidence for `pebble-logo`.
- Silently discarding an explicit material request to satisfy generic words such as “minimal.”
- Asking multiple rounds of style questions before routing.
