# DESIGN.md Reference

<required_reading>
Before drafting, editing, or auditing `DESIGN.md`, fetch the current spec:
- https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
- https://github.com/google-labs-code/design.md/blob/main/README.md

`DESIGN.md` is an `alpha`-status format from Google Labs. Its section order, token
schema, and lint rules are still evolving. Do not rely on memory or on this
reference's summary tables as the source of truth — fetch the live spec every
session. If the live spec conflicts with anything in this reference, the spec
wins; tell the user the reference is stale and proceed with the spec's rules.
</required_reading>

`DESIGN.md` is a format specification, not a generic design document. It pairs
machine-readable design tokens (YAML front matter) with human-readable design
rationale (Markdown body), so coding agents have a persistent, structured
understanding of a visual identity. It plays the same role for design context
that `CLAUDE.md` or `AGENTS.md` plays for engineering context.

## Position

**Use this reference when** the user asks to write, update, or audit a
`DESIGN.md`, supplies visual facts directly (a Figma file, a token file, a
brand brief, a screenshot named as the source), or wants a targeted edit to
an existing `DESIGN.md`.

**Do not use this reference when** the user wants design exploration from a
blank slate — competitive research, mood boards, AI-generated mockups, or a
taste profile built through iteration. That is a design-consultation workflow
(for example `gstack /design-consultation`), not a writing task. Point the
user there, or to a human designer, and stop.

This boundary is hard. Do not invent a design system from nothing because the
user asked for `DESIGN.md` and no visual facts exist yet.

<designmd_facts_source>
Before drafting any token or color, identify where the visual facts come
from. Acceptable sources:

- An existing Figma file (variables, styles, frames), read via a Figma MCP
  tool or export the user points to.
- An existing token file in the repository (CSS custom properties, a
  Tailwind config, `tokens.json`, a Style Dictionary config).
- A brand specification the user provides directly in the conversation.
- A screenshot or image the user explicitly names as the visual source.

Never invent color hex codes, font families, font sizes, font weights,
spacing values, or corner radii. If no source can be identified, stop and
report the missing source instead of fabricating values.

Name the chosen source at the top of the `## Overview` section so a reviewer
can verify where the tokens came from without re-deriving them.
</designmd_facts_source>

## Reader Questions

1. Is this a write/edit/audit task, or does the user need design exploration
   instead? If exploration, stop and redirect (see Position).
2. Where do the visual facts come from — Figma, a token file, a brand brief,
   a screenshot? (See `<designmd_facts_source>`.)
3. What is the brand's intended personality, and does the existing evidence
   support that description?
4. What color roles exist (primary, secondary, tertiary, neutral, semantic
   colors like error/success), and what are their verified values?
5. What typography levels are needed (headline, display, body, label,
   caption), and what font families, sizes, and weights back them?
6. What spacing scale does the project already use?
7. What corner-radius (`rounded`) scale does the project already use?
8. Does the project use elevation or depth (shadows, layering), and is there
   evidence for specific values?
9. What shapes or shape rules matter beyond corner radius?
10. Which components need token mappings, and which token properties do they
    actually use?
11. What guardrails (Do's and Don'ts) does the existing design communicate,
    and are they backed by real examples rather than generic advice?
12. Does `npx @google/design.md lint` pass on the drafted file?

If a fact cannot be verified, mark it as unknown instead of filling the gap
from convention.

## Recommended Shape

The Markdown body follows a fixed section order (sections may be omitted,
but present sections must appear in this sequence):

| Section | Purpose |
| --- | --- |
| Overview | Brand personality, intended feel, and the visual-facts source. |
| Colors | Rationale behind the color palette and role assignments. |
| Typography | Rationale behind font choices and the type scale. |
| Layout | Spacing rationale and layout principles. |
| Elevation & Depth | Shadow, layering, and depth rationale, when the project uses it. |
| Shapes | Corner radius and shape rationale. |
| Components | How tokens apply to real UI components. |
| Do's and Don'ts | Concrete guardrails, ideally paired with examples. |

An `<h1>` document title may appear but is not itself a parsed section.

## Front Matter

The YAML front matter holds the normative token values; the Markdown body
explains them. Do not restate the full schema here — fetch it — but at a
glance:

| Field | Holds |
| --- | --- |
| `version` | Currently `"alpha"`. Set it; note in Self-Check that the file was authored against the live spec. |
| `name`, `description` | Optional identifying metadata. |
| `omitted` | Declares sections intentionally left out, so the linter does not warn about them. Prefer the object form with a `reason` over a bare section name. |
| `colors` | Token name → color value (hex recommended for tooling compatibility). |
| `typography` | Token name → font family, size, weight, line height, letter spacing. |
| `rounded`, `spacing` | Scale-level (`xs`/`sm`/`md`/`lg`/`xl` or similar) → dimension. |
| `components` | Component name → token property mapping, which may reference other tokens (for example `{colors.primary}`). |

Do not infer a token's type from a value the user mentions in passing. If the
value's format is ambiguous (a bare number that could be a dimension or a
unitless line-height multiplier), ask or mark it unknown.

## Sections in Detail

Only notes the spec does not make obvious on its own:

- **Overview**: name the visual-facts source here (see `<designmd_facts_source>`), not buried later in the file.
- **Colors**: explain the *role* each color plays (primary action, secondary surface, tertiary accent), not just the hex value — the hex already lives in front matter.
- **Typography**: explain which levels map to which semantic use (headline vs. body vs. label), since most systems have far more type levels than obvious names.
- **Components**: describe intent and usage, not a restatement of the front-matter token mapping.
- **Do's and Don'ts**: prefer a concrete before/after or named example over generic advice like "keep it clean."

## Components and Variants

A component's token mapping may only set these properties: `backgroundColor`,
`textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`.
Fetch the live spec if a project needs a property outside this list — do not
silently add one.

When a component has variants (primary/secondary button, small/large card),
give each variant its own component key rather than overloading one entry
with conditional logic the format cannot express.

## Unknown Content

The spec defines fallback behavior for content it does not recognize:

| Scenario | Behavior |
| --- | --- |
| Unknown section heading | Preserved, not an error. |
| Unknown color or typography token name | Accepted if the value is valid. |
| Unknown spacing value | Accepted; stored as a string if not a valid dimension. |
| Unknown component property | Accepted with a warning — prefer the whitelist above instead. |
| Duplicate section heading | Error; the file is rejected. |

Do not treat "unknown content is tolerated" as license to freelance the
schema. Prefer the documented fields; use fallback tolerance only when the
live spec confirms it still applies.

## Lint Gate

<boundary>
Run `npx @google/design.md lint DESIGN.md` before reporting the file done.
Exit code `1` means the file is not finished — fix the reported rules and
lint again. Do not claim success while lint errors remain.
</boundary>

Common rules and first-pass fixes:

| Rule | Fixes |
| --- | --- |
| `missing-primary` | Add a `primary` color token; every palette needs one. |
| `missing-typography` | Add typography tokens if any color tokens exist. |
| `section-order` | Reorder `##` sections to match the canonical sequence in Recommended Shape. |
| `unknown-key` | Check for a typo'd top-level key (for example `colours` instead of `colors`). |
| `broken-ref` | Fix a token reference (`{colors.primary}`-style) that does not resolve to a defined token. |
| `contrast-ratio` | Adjust a component's color pair to meet WCAG AA contrast (4.5:1). |
| `missing-sections` | Add the section, or declare it in `omitted` with a reason if it's intentionally absent. |
| `orphaned-tokens` | Remove or reference a color token no component uses. |
| `token-like-ignored` | An unknown key holds a token-shaped value (a color, font, or dimension) — move it under the correct schema field. |

This list is not exhaustive and the rule set is under active development.
For the complete, current list, run `npx @google/design.md spec --rules` or
fetch the live spec instead of trusting this table alone.

On Windows, the `.md` suffix in the package name can collide with Markdown
file associations; use `npx -p @google/design.md designmd lint DESIGN.md`.

## Exports and Tooling

`DESIGN.md` is meant to feed downstream tooling, not just sit as prose:

- `npx @google/design.md diff DESIGN.md DESIGN-v2.md` — compare two versions and report token-level regressions.
- `npx @google/design.md export --format css-tailwind DESIGN.md` — emit a Tailwind v4 `@theme` block.
- `npx @google/design.md export --format json-tailwind DESIGN.md` — emit a Tailwind v3 config.
- `npx @google/design.md export --format dtcg DESIGN.md` — emit W3C Design Tokens Format Module JSON.

Mention these commands in the final report when the user's `DESIGN.md` is
meant to drive an existing Tailwind or token pipeline — do not run export
commands unasked, since they write files.

## Existing DESIGN.md Handling

If `DESIGN.md` already exists, do not overwrite it silently. Ask whether the
user wants to:

- Update it — preserve accurate tokens and rationale, revise what changed.
- Start fresh — replace it, after confirming the reason (rebrand, wrong
  facts source, structural cleanup).
- Cancel — leave it as-is.

Preserve tokens and prose that still match the verified facts source; do not
rewrite sections that were not asked about.

## Document Relationships

```text
PRODUCT.md   -> intent, users, scope boundaries, why
FEATURES.md  -> functional specs, user behavior, states, acceptance
DESIGN.md    -> design tokens and rationale for a visual identity (this reference)
ARCHITECTURE.md -> implementation structure, modules, data flow
```

`DESIGN.md` documents token *values and rationale*, not page-level behavior
(`FEATURES.md`'s job) or cross-feature navigation (`PRODUCT.md`'s Structure
layer, see `structure.md`). Cross-link rather than duplicate:

```markdown
Functional behavior for these components is defined in [FEATURES.md](./FEATURES.md).
```

<designmd_no_visual_surface>
If the project has no visual surface — a backend service, a CLI, a library
with no UI — a `DESIGN.md` does not apply. Report the mismatch and stop
instead of inventing a visual identity for a project that does not render
one. Do not write a placeholder file "in case it's needed later."
</designmd_no_visual_surface>

## DESIGN.md Self-Check

Before finishing, verify:

- The visual-facts source is named in `## Overview` and is a real source, not an assumption.
- No color, font, size, weight, or spacing value was invented without a source.
- Front matter section order matches Recommended Shape; omitted sections are declared in `omitted` with a reason where relevant.
- Component token mappings use only the documented property whitelist.
- `version: alpha` is set, and the file was authored against the spec fetched this session, not memory.
- `npx @google/design.md lint DESIGN.md` exits `0` before reporting done.
- The document does not duplicate `FEATURES.md` behavior or `PRODUCT.md` Structure content — it links to them instead.
- If the project has no visual surface, the agent reported that and stopped instead of drafting a placeholder.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Inventing hex codes or font sizes because none were provided | Stop and report the missing facts source instead of guessing. |
| Copying the spec's schema and rules verbatim into the project's `DESIGN.md` | Keep the file to tokens and project-specific rationale; the spec itself is not project content. |
| Treating `DESIGN.md` as a general design-review or RFC document | Keep it scoped to the visual-identity token format; general design discussion belongs elsewhere. |
| Skipping the lint gate before reporting done | Run `npx @google/design.md lint` and fix errors first. |
| Writing `DESIGN.md` for a project with no UI | Report the mismatch and stop instead of drafting a placeholder. |
| Reordering or renaming sections from the canonical sequence | Match Recommended Shape's order; the linter's `section-order` rule will otherwise fail. |
| Full design exploration requested but treated as a quick write task | Redirect to a design-consultation workflow or a human designer; this reference does not build a design system from nothing. |
