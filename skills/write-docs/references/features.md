# Features Reference

`FEATURES.md` expands product scope into user-visible functional specifications. It should say what users can do, how the system responds, which states matter, and how behavior can be accepted.

Think of `FEATURES.md` as the detail layer under product scope:

```text
PRODUCT.md   -> intent, users, scope boundaries, why
FEATURES.md  -> functional specs, user behavior, states, acceptance
DESIGN.md    -> UI system, visual treatment, components, interaction style
ARCHITECTURE.md -> implementation structure, modules, data flow
```

If `PRODUCT.md` does not exist, infer scope from repository facts and mark assumptions. Do not require `PRODUCT.md` to write useful feature specs.

## Reader Questions

Answer:

1. What features or behavior groups exist?
2. Which user need does each feature serve?
3. Where does the user enter the feature?
4. What actions can the user take?
5. How should the system respond?
6. What loading, empty, error, disabled, permission, or unavailable states matter?
7. What is explicitly out of scope for the feature?
8. How can a developer or reviewer verify the behavior?

## Feature Granularity

A feature may be a page, route, workflow, capability, or user-visible behavior group. Use the smallest heading that still represents one coherent user outcome.

Valid feature names include project-specific names such as:

- Timeline.
- Command Palette.
- Theme Switching.
- Resource Search.
- Empty State Recovery.

Do not treat those names as required headings. They are examples only. In templates, write `Feature: <Name>` so the placeholder is clear.

## Recommended Shape

Choose sections by project need. Do not force every section into every file.

```markdown
# Features

## Purpose

This document expands product scope into functional behavior that can be built, reviewed, and tested.

## Feature Map

| Feature | User Need | Status | Source |
| --- | --- | --- | --- |
| `<Feature Name>` | `<need>` | Current / Planned / Excluded / Open | `<file, spec, issue, or assumption>` |

## Feature: <Name>

### Purpose

State the user need and product outcome this feature serves.

### Entry Points

- Where the user can access the feature.
- Any shortcuts, routes, commands, or links that open it.

### User Actions

| Action | Expected Behavior |
| --- | --- |
| `<user action>` | `<system response>` |

### States

| State | Expected Behavior |
| --- | --- |
| Loading | `<stable layout, progress, or placeholder behavior>` |
| Empty | `<what source was checked and what the user can do next>` |
| Error | `<what failed and whether the rest of the product remains usable>` |

### Out of Scope

- Behavior this feature does not own.

### Acceptance Checks

- [ ] The user can `<complete a concrete behavior>`.
- [ ] The feature handles `<important state>` without losing context.
```

## Evidence Rules

Feature behavior must come from verified sources:

- Existing `FEATURES.md`, specs, issues, product docs, or roadmap notes.
- Routes, pages, commands, screens, components, menus, or CLI commands.
- Tests, fixtures, examples, screenshots, or demo output.
- User-provided requirements in the current request.
- Clearly marked assumptions.

Do not invent features, statuses, shortcuts, permissions, or states. If repository evidence only proves current behavior, do not promise planned behavior.

Roadmap or milestone notes can prove that a feature is planned only when they name a user-visible behavior and tie it to product scope. Do not promote every milestone idea, delivery task, dependency, or stretch goal into `FEATURES.md`.

## What Belongs Here

Write user-visible behavior:

- Page or route entry points.
- User actions.
- System responses.
- Data or content shown to the user.
- Loading, empty, error, disabled, permission, offline, or reduced-capability states.
- Search, filter, sort, selection, edit, save, delete, import, export, and navigation behavior.
- Acceptance checks that a reviewer can run manually or automate later.

For frontend products, it is acceptable for `FEATURES.md` to be page-level and state-aware. That is the point of functional specifications.

## What Does Not Belong Here

Keep implementation and visual-system detail out:

- React component names, hooks, reducers, or file structure.
- CSS class names, token values, spacing scales, or animation curves.
- Database schema, backend module design, or API handler internals.
- Broad product vision that belongs in `PRODUCT.md`.
- Milestone status, release sequencing, owner assignment, or delivery tracking that belongs in `MILESTONES.md`, `ROADMAP.md`, planning docs, or issues.
- Visual component rules that belong in `DESIGN.md`.
- Module and data-flow explanations that belong in `ARCHITECTURE.md`.

Short references are fine:

```markdown
Visual treatment is defined in [DESIGN.md](./DESIGN.md).
Implementation structure is defined in [ARCHITECTURE.md](./ARCHITECTURE.md).
```

## Status Values

Use a small, explicit status vocabulary:

| Status | Meaning |
| --- | --- |
| Current | Repository evidence shows this behavior exists. |
| Planned | A spec, issue, roadmap note, or user requirement asks for it. |
| Excluded | The product or feature explicitly does not include it. |
| Open | The behavior needs validation before it can be specified. |

Do not use `Done`, `Todo`, or `Maybe` unless the repository already uses those terms consistently.

`Planned` does not mean "mentioned in a milestone." It means a product source, spec, issue, or explicit user requirement has accepted the behavior into product scope. If the item is only a candidate for a future milestone, mark it `Open` or leave it in planning docs.

## Relationship to Product Scope

`FEATURES.md` may reference product scope, but it should not define product direction by itself.

Prefer:

```markdown
This feature expands the Activity scope defined in `PRODUCT.md`.
```

Avoid:

```markdown
The product exists because this feature list says so.
```

If a scope decision is missing, mark it as an open question instead of hiding the gap.

Milestones may be referenced as delivery metadata, but they should not be the organizing structure of `FEATURES.md`. Organize by user-visible behavior first; track delivery grouping elsewhere unless the repository already has a different convention.

## Feature Self-Check

Before finishing `FEATURES.md`, verify:

- Every feature has a user need or product reason.
- Every feature has entry points or says why entry is unknown.
- User actions describe expected system behavior, not implementation tasks.
- Loading, empty, error, disabled, permission, or unavailable states are covered when relevant.
- Status labels are consistent and evidence-backed.
- Out-of-scope behavior is named when it prevents common misunderstandings.
- Acceptance checks are concrete enough for manual review.
- Visual details point to `DESIGN.md`; implementation details point to `ARCHITECTURE.md`.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Listing feature names only | Add user need, entry points, actions, system responses, states, and acceptance checks. |
| Treating a sample feature name as required | Use `Feature: <Name>` in templates and project-specific names in real docs. |
| Writing implementation tasks | Rewrite from the user's point of view. |
| Duplicating DESIGN.md | Keep visual rules as references, not detailed token/component specs. |
| Duplicating ARCHITECTURE.md | Keep module, data-flow, and API internals out. |
| Promising planned behavior without evidence | Mark it `Open` or cite the spec, issue, roadmap note, or user requirement. |
| Treating milestone ideas as feature specs | Keep delivery planning in `MILESTONES.md`, `ROADMAP.md`, planning docs, or issues until a user-visible behavior is accepted into product scope. |
