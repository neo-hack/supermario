# PRD Reference

`PRD.md` is a self-contained specification for one initiative — a feature, a
behavior change, a fix to how something works. It is a different document
from `PRODUCT.md`: `PRODUCT.md` describes the whole product's UX intent
across five layers (Strategy, Scope, Structure, Skeleton, Surface) as a
living reference; `PRD.md` is bounded to one initiative, is often written
before the code exists, and is expected to stand entirely on its own.

```text
PRD.md       -> self-contained initiative spec: background, goals, principles, flows, interaction/display rules, states, acceptance (this reference)
PRODUCT.md   -> intent, users, scope boundaries, why
FEATURES.md  -> functional specs, user behavior, states, acceptance
DESIGN.md    -> UI system, visual treatment, components, interaction style
ARCHITECTURE.md -> implementation structure, modules, data flow
```

PRD.md often precedes `PRODUCT.md`/`FEATURES.md` for a given initiative, but
it does not depend on them existing and is not required reading before they
can be written. Some overlap with `FEATURES.md`-shaped content (flows,
states, acceptance checks) is expected and fine — they serve different
moments: PRD is a point-in-time spec for one initiative; `FEATURES.md` is
the living reference for the whole product once things ship.

## The One Rule: Self-Contained

**No section may require another document to exist or be opened to be
understood.** A stakeholder approving this initiative, or an engineer
building it, should be able to read this one file and have everything they
need. If `PRODUCT.md`/`FEATURES.md` already exist, read them for
consistency — do not require the reader to open them to understand this
PRD.

This is a deliberate difference from `structure.md` and `features.md`,
which weak-link to sibling docs instead of restating content. PRD.md does
the opposite on purpose: write each section in full.

<prdmd_facts_source>
Only quantified claims trigger this gate — qualitative goals and design
principles do not need a numeric source.

- Any quantified metric, percentage, revenue figure, or adoption target
  must name where it came from before being written. If no source states
  a number, write "Unknown — needs a target from `<role>`" instead of a
  plausible-sounding figure.
- Qualitative goals, principles, and flows do not require a numeric
  source — they need to trace to the user's stated requirements, an
  existing spec or plan document, or observed current behavior.
- Never draft competitive claims or market-size claims from general
  knowledge. Omit that content entirely rather than invent it.
</prdmd_facts_source>

## Reader Questions

1. What existed before this initiative, and what's changing?
2. What behavioral outcomes must this initiative produce? (Not necessarily
   numbers — see Success Determination.)
3. Who uses this, and in what concrete scenarios?
4. Are there recurring design tensions this initiative has to resolve
   consistently? (These become Product Principles.)
5. What's explicitly in scope, and what's explicitly out?
6. What are the named user flows, step by step, including branches and
   cancellation paths?
7. What triggers (keyboard, mouse, gesture) map to what actions?
8. What copy, truncation, or hover/tooltip behavior matters?
9. What loading, error, edge-case, or race-condition behavior must be
   handled?
10. What existing behavior, payload, or token format must keep working?
11. How will a reviewer check this is done? (Acceptance Criteria.)
12. How will anyone know this worked? Is that a behavioral check or a real
    metric with a source?

If a fact cannot be verified, mark it as unknown or an assumption instead
of filling the gap from convention.

## Recommended Shape

Choose sections by initiative need — a small fix does not need all
thirteen. Do not force a section that has nothing to say.

| Section | Purpose |
| --- | --- |
| Background | Narrative: what existed before, what's changing, why now |
| Product Goals | Qualitative behavioral outcomes this initiative must produce |
| Users & Scenarios | Who this serves, plus concrete usage scenarios (not abstract personas) |
| Product Principles | Numbered design axioms that resolve recurring ambiguity across the rest of the doc |
| Scope | In / Out, written in full |
| User Flows | Named scenarios, each a numbered step sequence, self-contained |
| Interaction Rules | Trigger → action mapping (keyboard, mouse, gestures) |
| Display Rules | Copy text, truncation, hover/tooltip behavior, label formatting |
| States & Exception Handling | Loading, error, edge-case, and race-condition behavior |
| Compatibility Requirements | What must keep working — existing payloads, tokens, other consumers |
| Acceptance Criteria | Checklist grouped by area, directly testable |
| Success Determination | Qualitative behavioral-correctness criteria by default |
| References | Optional — sibling design specs, implementation plans, or tickets for this initiative |

### Concrete template

No YAML front matter — `docs/product/repository-branch-mention-prd.md`, the
real example this reference is modeled on, opens directly with the title
and carries no Status/Owner/Date header. Do not add one by default; only
include a header block if the repository already uses that convention
elsewhere.

```markdown
# <Initiative Name> PRD

## Background

<What existed before, what's changing, why now. Narrative, not a bullet list.>

## Product Goals

- `<qualitative behavioral outcome this initiative must produce>`
- `<another outcome>`

## Users & Scenarios

Target users: `<who>`.

Typical scenarios:

- `<concrete scenario the user faces>`
- `<another scenario>`

## Product Principles

### `<N.1>` `<Short principle name>`

`<1-3 sentences stating a general rule that resolves a recurring tension in
the flows below — not a restatement of a single flow step.>`

## Scope

### In

- `<what this initiative includes, one line each>`

### Out

- `<what this initiative explicitly excludes, and why, one line each>`

## User Flows

### `<Scenario name>`

1. `<step>`
2. `<step, may depend on the previous one>`
3. `<branch: condition -> path>`

## Interaction Rules

| Trigger | Action |
| --- | --- |
| `<key, click, or gesture>` | `<what happens>` |

## Display Rules

- `<copy text, exact string, where it appears>`
- `<truncation rule, hover behavior, label format>`

## States & Exception Handling

### `<State name>`

- `<what the system does, what the user sees, what remains valid>`

## Compatibility Requirements

- `<existing payload, token format, or consumer that must keep working>`

## Acceptance Criteria

### `<Area>`

- `<testable, specific criterion>`

## Success Determination

This initiative treats behavioral correctness as its success criteria:

- `<qualitative, testable statement of correct behavior>`

`<State explicitly if this phase adds no new metrics or tracking, when
that's true — that is a valid, complete answer, not a gap.>`

## References

- `<link to a sibling design spec, implementation plan, or ticket, if any exist>`
```

## Evidence Rules

PRD content must come from at least one of these sources:

- User-provided requirements, goals, principles, flows, and constraints
  stated in the current conversation — the primary source for a net-new
  initiative with no repository footprint yet.
- Existing planning docs referenced or already in the repository: issues,
  briefs, design specs, implementation plans, roadmap notes. Link to these
  from References; do not require `PRODUCT.md`/`FEATURES.md` as a source.
- Existing UI or interaction conventions in the codebase — needed for
  Interaction Rules and Compatibility Requirements to be accurate (existing
  token formats, existing keyboard shortcuts other features already use).
- Existing `PRODUCT.md`/`FEATURES.md` content, read for consistency when
  present — not a required source.
- Repository facts (routes, code, tests), relevant when the PRD covers a
  change to something that already exists.
- Clearly marked assumptions, flagged "needs owner sign-off."

A repository-fact scan turning up nothing is expected for a greenfield
initiative — report that plainly, it is not a blocker. For an initiative
that changes existing behavior, ground Compatibility Requirements and
Interaction Rules in the actual current behavior, not an assumption of what
it probably does.

## What Belongs Here

- Full user flows, including branches, cancellation, and recovery paths,
  written out completely — do not defer this to `FEATURES.md`.
- Interaction and display detail specific to this initiative (trigger
  mappings, copy, truncation, hover behavior).
- States and exception handling for this initiative's behavior.
- Compatibility constraints this initiative must not break.
- Design principles that resolve a real, recurring tension — not filler.
- Qualitative success criteria; a quantified metric only when a real source
  supplies the number.

## What Does Not Belong Here

- Market sizing, competitive analysis, or ROI projections drafted from
  general knowledge — include a number only if the user or an existing doc
  supplies it, and name the source.
- Delivery date or release sequencing ownership — a milestone label is
  fine ("targets the Q3 release"), sequencing across multiple initiatives
  is not; that belongs in `MILESTONES.md`/`ROADMAP.md`.
- Architecture or module implementation decisions — `ARCHITECTURE.md`.
- A standalone visual token system (full color/typography/spacing scale) —
  `DESIGN.md`. Inline display rules specific to this initiative's copy or
  layout stay here; a reusable token system does not.

## Relationship to PRODUCT.md and FEATURES.md

PRD.md does not require these documents and does not weak-link to them the
way `structure.md` weak-links to `PRODUCT.md`'s Scope. If they exist, read
them for consistency; if this PRD's Background or Scope conflicts with
`PRODUCT.md`'s Scope table, say so explicitly rather than silently
overriding it.

Prefer:

```markdown
## Background

Repository and Branch mentions previously required the user to pick a
mention granularity before opening the picker...
```

Avoid:

```markdown
## Background

See PRODUCT.md for context on why this matters.
```

## PRD Self-Check

Before finishing `PRD.md`, verify:

- Every section is understandable without opening `PRODUCT.md` or
  `FEATURES.md`.
- Every quantified claim traces to a source, or is written as
  "Unknown — needs a target from `<role>`."
- Product Principles state general rules, not a restatement of a single
  flow step — each principle should resolve more than one place in the
  document.
- User Flows include branch points and cancellation/recovery paths, not
  just the happy path.
- Interaction Rules cover both keyboard and mouse when both apply.
- Compatibility Requirements are grounded in actual current behavior for
  initiatives that change something that already exists.
- Success Determination is qualitative and behavioral by default; a
  metrics table appears only when the user supplied real numbers.
- References links to sibling planning docs, if any exist — not to
  `PRODUCT.md`/`FEATURES.md` as a substitute for writing this PRD in full.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Inventing a quantified metric because a PRD "should have numbers" | Write "Unknown — needs a target from `<role>`" instead. |
| PRD written as a stub that only links to `PRODUCT.md`/`FEATURES.md` | Write each section in full; PRD.md must stand on its own. |
| Product Principles that just restate one flow step | Rewrite as a general rule that resolves tension across multiple flows. |
| Only the happy path is documented in User Flows | Add branch, cancellation, and error-recovery paths. |
| Interaction Rules cover clicks only | Add the keyboard equivalent for every mouse action, or note where none exists. |
| Compatibility Requirements assumed instead of verified | Check the actual current payload/token/behavior before writing the constraint. |
| Success Determination forced into a metrics table with no real numbers | Default to qualitative behavioral criteria; state explicitly if no new metrics are added this phase. |
| Market or competitive claims drafted from general knowledge | Omit entirely unless the user or an existing doc supplies the claim and its source. |
