# Structure Reference

`structure.md` expands the Structure layer of `PRODUCT.md` (see `product.md`) into a detailed template: how a user moves through the product as a whole, across features and pages.

Structure is not a standalone document type. It has no canonical filename of its own — its content lives inside `PRODUCT.md` under a `## Structure` heading, or in a linked file when the product has enough cross-feature flows to warrant one. Use this reference whenever `PRODUCT.md`'s Structure section needs more than a paragraph.

```text
PRODUCT.md   -> intent, users, scope boundaries, why
  Structure  -> site map, key flows, cross-feature journeys (this reference)
FEATURES.md  -> functional specs, user behavior, states, acceptance (per feature)
DESIGN.md    -> UI system, visual treatment, components, interaction style
ARCHITECTURE.md -> implementation structure, modules, data flow
```

## The Boundary With FEATURES.md

This is the one thing to get right. Structure and `FEATURES.md` both describe behavior, but at different altitude:

| | Structure | `FEATURES.md` |
| --- | --- | --- |
| Scope | How features/pages connect to each other | How one feature behaves internally |
| Unit | A site map node, or a journey step | An action, a state, an acceptance check |
| Example | "Space home -> Space settings -> back to home" | "Click send -> confirmation dialog -> submit -> success/error" |
| Stability | Describes a conceptual path; often survives a UI rewrite | Describes current implementation; changes when the feature's UI changes |
| Owned by | No single feature — it is the connective tissue between them | Exactly one feature |

If a diagram shows steps a user takes *inside* one feature (open a menu, pick an option, see a result), it belongs in that feature's `### Flow` in `FEATURES.md`. If a diagram shows a user moving *between* features or pages, or a map of what connects to what, it belongs here.

A quick test: can this diagram be understood by reading only one `## Feature: <Name>` section? If yes, it is feature-level Flow. If it requires knowing about a second feature or page, it is Structure.

## Reader Questions

Answer these when repository facts, existing docs, visible UI, or user-provided requirements support them:

1. Where does the user enter the product, and are there multiple entry points?
2. What are the main pages, screens, or top-level commands, and how do they connect?
3. What are the key end-to-end journeys a user takes across more than one feature?
4. What has to happen before something else can happen (dependency, not just sequence)?
5. Where do journeys branch on a condition, and where do they end, fail, or loop back?
6. Which paths are stable and expected to survive redesigns, versus incidental to the current UI?

If a fact cannot be verified, mark it as an assumption or say it is unknown. Do not invent pages, routes, or journeys that have no repository or requirement evidence.

## Flow Granularity

A Flow is a task flow, command sequence, screen sequence, state lifecycle, or document workflow that crosses more than one feature or page. Name it for the outcome it produces, not the mechanism:

- Onboarding Flow.
- Search-to-Purchase Flow.
- Space Creation to First Task Flow.

Do not create a Flow entry for something that stays inside one feature — that belongs in `FEATURES.md`.

## Recommended Shape

Choose sections by project need. Do not force every heading into every `PRODUCT.md`.

```markdown
## Structure

### Site Map

Depth alone does not decide the format. Use a plain text tree by default, even for deep hierarchies — indentation already expresses level, and it stays easy to write, diff, and read without a renderer. Switch to a mermaid graph only when the map stops being a tree: a page reachable from more than one parent, or a cross-link between branches. A text tree cannot express that without duplicating the node; a graph can.

Default — plain tree, any depth:

\`\`\`text
Home
├── Search
│   └── Result Detail
│       └── Reviews
├── Account
│   ├── Settings
│   │   ├── Profile
│   │   └── Notifications
│   └── History
└── Help
\`\`\`

Only when a node has more than one parent — mermaid graph:

\`\`\`mermaid
graph TD
  Home --> Search
  Home --> Account
  Search --> Detail[Result Detail]
  Account --> History
  History --> Detail
\`\`\`

### Flow: <Name>

**Entry**: where the user starts this journey, and from what state.

**Steps**:

1. Step one -> the state or result it produces.
2. Step two, which depends on step one's result.
3. Step three (branch: condition A -> path A; condition B -> path B).

**Exit**: how the journey ends (completed, abandoned, error recovery back to an earlier step).

### Open Questions

- Assumption or unknown, same as `PRODUCT.md`'s Open Questions.
```

For small products, one Site Map and one or two Flows are enough. For complex products, keep this section focused on structure and link to `FEATURES.md` for what happens inside each stop on the map.

## Evidence Rules

Structure claims must come from at least one of these sources:

- Routes, navigation config, sitemaps, or link structure in the code.
- Existing docs, wireframes, or flow diagrams.
- User-provided requirements in the current request.
- Tests or fixtures that exercise a multi-step or multi-page path.
- Screenshots or demo output showing navigation between screens.
- Clearly marked assumptions.

Do not invent navigation paths, entry points, or journeys that no route, test, or requirement supports.

Write assumptions explicitly, same pattern as `product.md`:

```markdown
### Open Questions

- Assumption: Users reach Settings only from the account menu; no route evidence confirms a second entry point.
- Unknown: There is no verified journey connecting onboarding to the first task creation.
```

## What Belongs Here

- A site map or navigation tree showing what connects to what.
- End-to-end journeys that span two or more features or pages.
- Dependency between steps ("this only makes sense after that"), not just an ordered list.
- Branch points, exits, and recovery paths at the journey level.
- Which paths are structurally stable versus incidental to the current UI, when that distinction is known.

## What Does Not Belong Here

- A single feature's internal actions, states, or acceptance checks — that is `FEATURES.md`.
- Visual layout, component styling, navigation chrome details — that is `DESIGN.md` (Skeleton/Surface).
- Module boundaries, data flow, or API internals — that is `ARCHITECTURE.md`.
- Broad product vision or scope justification — that is `PRODUCT.md`'s Strategy and Scope.
- Milestone status, delivery order, or owner assignment — that belongs in `MILESTONES.md`, `ROADMAP.md`, planning docs, or issues.

## Relationship to Product Scope

Structure describes movement through what `PRODUCT.md`'s Scope has already committed to. It should not introduce features or pages that Scope excludes.

Prefer:

```markdown
This flow connects the Space and Account areas defined in Scope.
```

Avoid:

```markdown
This flow assumes a Notifications Center that Scope does not list.
```

If a journey needs a page or feature that Scope has not committed to, mark it as an open question instead of drawing it into the map.

## Structure Self-Check

Before finishing the Structure section, verify:

- Every Flow shows dependency between steps, not just a numbered list of features.
- The Site Map (when present) matches real routes or navigation, not an aspirational one.
- No diagram here duplicates a single feature's internal Flow from `FEATURES.md`.
- Branch points, exits, and error/recovery paths are named for journeys where they matter.
- Claims are backed by routes, docs, tests, requirements, or a marked assumption.
- Journeys stay inside the boundaries `PRODUCT.md`'s Scope has already committed to.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Structure is a feature list with no connections | Add a site map or journey showing how features relate. |
| Site map switches to mermaid just because it is deep | Keep a plain text tree; depth alone does not need mermaid. |
| Site map is a text tree but a page has two parents, duplicated to fake it | Switch to a mermaid graph — it is no longer a tree. |
| A journey step is really one feature's internal state machine | Move it to that feature's `### Flow` in `FEATURES.md`. |
| Site map includes pages Scope excludes or has not committed to | Mark as an open question, or remove until Scope accepts it. |
| Steps are listed in order but no dependency is stated | Rewrite to show what each step requires from the one before it. |
| Diagram mixes UI layout detail with journey steps | Keep layout in `DESIGN.md`; keep only movement and dependency here. |
| No exit or recovery path for a journey that can fail | Add what happens on abandonment, error, or timeout. |
