# Product Reference

`PRODUCT.md` explains the product experience a project is trying to create. It should connect user needs, product goals, scope, flows, interface expectations, and surface quality so future work has a product north star.

This reference adapts the five layers from Jesse James Garrett's *The Elements of User Experience* into writing constraints. Do not write a book summary. Use the layers to make product documentation harder to fake and easier to review.

## Reader Questions

Answer these questions when repository facts, existing docs, visible UI, or user-provided requirements support them:

1. Who is the product for?
2. What user need, job, or context makes it worth existing?
3. What product outcome should the experience create?
4. What is included now, explicitly excluded, and deferred?
5. How does a user move through the main experience?
6. What interface model should stay stable as the product changes?
7. What tone, feedback, visual feel, and state behavior should the product preserve?
8. Which assumptions need validation?

If a fact cannot be verified, mark it as an assumption or say it is unknown. Do not invent personas, business goals, market position, future features, or roadmap promises.

## Recommended Shape

Choose sections by project need. Do not force every heading into every `PRODUCT.md`.

Useful sections:

- Product Intent.
- Users and Jobs.
- Experience Principles.
- Scope.
- Structure.
- Key Flows.
- Interface Model.
- Surface and Voice.
- Open Questions.

For small projects, sections may be combined. For complex products, `PRODUCT.md` should stay focused on product-experience intent and link to deeper specs only when those files exist.

## Document Relationships

`PRODUCT.md` is upstream of feature, design, and architecture docs:

```text
PRODUCT.md   -> intent, users, scope boundaries, why
FEATURES.md  -> functional specs, user behavior, states, acceptance
DESIGN.md    -> UI system, visual treatment, components, interaction style
ARCHITECTURE.md -> implementation structure, modules, data flow
```

`PRODUCT.md` may weakly link to `FEATURES.md` for detailed functional behavior, but it should not depend on `FEATURES.md` to define product direction.

`PRODUCT.md` may define a release baseline or milestone strategy when that clarifies product scope. Do not maintain live milestone status, delivery order, owner assignments, or completion tracking here. Put those in `MILESTONES.md`, `ROADMAP.md`, planning docs, or issues.

Prefer:

```markdown
This section defines product boundaries. Detailed page-level behavior and functional specifications belong in [FEATURES.md](./FEATURES.md) when that document exists.
```

Avoid:

```markdown
This product is defined by the feature list in [FEATURES.md](./FEATURES.md).
```

## Evidence Rules

Product claims must come from at least one of these sources:

- User-provided requirements in the current request.
- Existing docs, specs, product notes, roadmap notes, or issue templates.
- README positioning, usage examples, command examples, screenshots, or demo output.
- Routes, screens, components, commands, prompts, examples, tests, or fixtures.
- Configuration that changes user-facing behavior.
- Clearly marked assumptions.

Roadmap notes and milestone notes can support scope decisions, but they do not automatically define product direction. Use them as evidence for a product choice only when the item is tied back to a user need, product objective, or explicit constraint.

Write assumptions explicitly:

```markdown
## Open Questions

- Assumption: The primary user is a maintainer improving project documentation. Repository evidence: the skill reads local project files and edits docs.
- Unknown: There is no verified roadmap source for collaboration features.
```

Avoid unsupported certainty:

```markdown
## Product Intent

This product will become the leading platform for every documentation workflow.
```

## Five-Layer Constraints

Use these layers as review gates. The final document does not need to expose all five layer names as headings, but the thinking must be present or intentionally omitted.

### Strategy

Strategy links user needs to product objectives.

`PRODUCT.md` should say:

- Which user or role matters.
- What job, pain, or context creates demand.
- What product outcome should happen for that user.
- Which repository facts or assumptions support the claim.

Prefer:

```markdown
## Product Intent

This skill helps maintainers turn repository facts into useful documentation without guessing commands, badges, options, or project behavior. The intended outcome is a doc update that a reader can use immediately and that stays honest about unverifiable facts.
```

Avoid:

```markdown
## Product Intent

The product delivers a seamless and delightful documentation experience for everyone.
```

### Scope

Scope is the product's prioritized commitment, not a feature inventory. It separates what the product includes from what it excludes, and it explains why each decision belongs in that status.

`PRODUCT.md` should distinguish:

- Included now.
- Explicitly excluded.
- Deferred or open.

Each scope decision should be justified by:

- The user need it serves.
- The product objective it supports.
- The feasibility, dependency, or constraint that makes it current, deferred, or excluded.

If an item cannot be tied back to strategy fit or feasibility, mark it as open or out of scope instead of listing it as planned.

Use this shape when scope matters:

```markdown
## Scope

| Status | Item | Why It Belongs Here | Evidence |
| --- | --- | --- | --- |
| Included | README, PRODUCT, FEATURES, ARCHITECTURE, CONTRIBUTING, and TUTORIAL guidance | Maintainers need consistent docs that route to the right reference before drafting. | `skills/write-docs/SKILL.md` supported documents |
| Excluded | Publishing a documentation website | The product objective is repository-grounded documentation editing, not docs hosting or distribution. | No publishing workflow exists in the repository |
| Deferred | More product research examples | Product guidance would benefit from more examples, but no verified source defines them yet. | No verified source exists yet |

Detailed feature behavior belongs in [FEATURES.md](./FEATURES.md) when that document exists.
```

Do not turn scope into a wishlist, release plan, or milestone tracker. If the repository only proves current behavior, say that. If a future item appears only in a milestone discussion, keep it out of `PRODUCT.md` unless the document can explain the user need, product objective, and constraint behind the decision.

### Structure

Structure explains how the user moves through the experience.

Depending on the project, this can be:

- A task flow.
- A command sequence.
- An information architecture.
- A screen sequence.
- A state lifecycle.
- A document workflow.

Prefer flow descriptions that show dependency between steps:

```markdown
## Key Flow

1. The user asks for a documentation change.
2. The agent identifies the target document.
3. The agent reads the general style reference and matching document reference.
4. The agent scans repository facts before drafting.
5. The agent edits the document and self-checks claims against evidence.
6. The agent reports changed files, references read, verified facts, and checks run.
```

Avoid lists that do not explain movement:

```markdown
## Features

- References.
- Fact scan.
- Final response.
```

### Skeleton

Skeleton defines the interface model: navigation, input, output, feedback, layout, and recovery paths.

For visual products, describe screens, navigation, layout obligations, controls, empty states, loading states, error states, and feedback.

For command-line, agent, or documentation tools, describe command shape, prompt flow, option grouping, output format, confirmation steps, fallbacks, and recovery behavior.

Useful prompts:

- What does the user provide first?
- What does the product ask next?
- Where does feedback appear?
- Which defaults should stay stable?
- How does the product recover from missing facts?

Prefer:

```markdown
## Interface Model

The product behaves like a guided documentation workflow. The user names a document or intent, then the skill routes the request to required references. Missing repository facts should produce an explicit note in the final response instead of quiet guesswork.
```

Avoid:

```markdown
## Interface Model

The interface should be intuitive.
```

### Surface

Surface covers what the user perceives: voice, tone, visual feel, state feedback, hierarchy, density, motion, and polish.

Surface guidance must be specific enough to guide future implementation and review decisions.

Prefer:

```markdown
## Surface and Voice

Documentation should sound direct, calm, and concrete. It should name files, commands, options, and evidence plainly. Personality is allowed as a small accent, but it must not replace useful facts.
```

Avoid:

```markdown
## Surface and Voice

The product should feel clean, modern, and beautiful.
```

## Creation Workflow

When creating a new `PRODUCT.md`:

1. Read `references/elements-of-style.md` and this reference.
2. Search for existing product, roadmap, design, issue, route, screen, command, prompt, example, and test evidence.
3. Read the files that support product claims.
4. Draft only claims that are supported or marked as assumptions.
5. Use the five layers to check that product intent, scope, flow, interface model, and surface quality are covered.
6. Link to `FEATURES.md` only as the place for detailed functional behavior, not as the source of product direction.
7. Keep architecture details, changelogs, issue tracking, and long roadmaps out of `PRODUCT.md`.

## Audit Workflow

When auditing an existing `PRODUCT.md`, check:

- Strategy: user needs and product objectives are specific and supported.
- Scope: included, excluded, and deferred work are separated.
- Structure: key flows are understandable without reading source internals.
- Skeleton: interface, navigation, input, output, feedback, and recovery expectations are concrete.
- Surface: tone, visual feel, state behavior, and perceived quality are specific.
- Evidence: claims match repository facts or are marked as assumptions.
- Boundaries: the document is not acting as architecture, changelog, roadmap, feature specification, or issue tracker.
- Cross-links: references to `FEATURES.md`, `DESIGN.md`, or `ARCHITECTURE.md` are weak links to detail docs, not upstream product-definition sources.

For audit reports, lead with gaps that would mislead future product or engineering decisions.

## Product Self-Check

Before finishing `PRODUCT.md`, verify:

- Every product claim is supported by repository facts, user-provided requirements, existing docs, visible UI, or a marked assumption.
- The document names a user, job, or context when evidence exists.
- Scope separates included, excluded, and deferred work.
- Scope links to `FEATURES.md` for detailed functional behavior when that document exists.
- Key flows describe sequence and dependency, not only features.
- Interface guidance covers inputs, outputs, feedback, defaults, and missing-fact behavior.
- Surface guidance avoids empty adjectives and ties tone or visual feel to product behavior.
- Open questions identify what needs validation instead of hiding uncertainty.
- The document does not promise future work without evidence.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Product doc is only a feature list. | Add user need, product objective, task flow, interface expectations, and surface constraints. |
| Product doc is only a vision statement. | Add concrete scope, flows, current behavior, and open assumptions. |
| User personas are invented. | Use repository evidence or mark personas as assumptions. |
| Scope promises unsupported future work. | Split current, excluded, and deferred items. |
| UX language is generic. | Tie each experience principle to a user action, state, or product decision. |
| Visual guidance says only "clean" or "modern". | Describe tone, hierarchy, density, feedback, and state behavior. |
| Architecture details dominate the product doc. | Move module maps, data flow internals, and implementation decisions to `ARCHITECTURE.md`. |
| Feature details dominate the product doc. | Keep scope boundaries in `PRODUCT.md` and move page-level behavior to `FEATURES.md`. |
