# Write Docs PRODUCT Reference Design

**Date:** 2026-06-23
**Skill:** `skills/write-docs/`
**Status:** Approved design for planning
**Context:** Extend `write-docs` so it can create, rewrite, and audit `PRODUCT.md` using the five layers from Jesse James Garrett's *The Elements of User Experience* as product-experience constraints.

## Problem

`write-docs` currently supports README, architecture, contributing, and tutorial documents. It can explain how to run or change a project, but it does not give agents a strong way to document product intent, user value, scope, interaction structure, or the desired experience.

Without product-specific guidance, an agent asked to write `PRODUCT.md` will likely choose one of two weak defaults:

- Write a generic PRD template that is disconnected from the repository.
- Produce a feature list that says what exists, but not why the experience should work.

The new reference should make `PRODUCT.md` a practical product-experience document, not a book summary or a loose brainstorm.

## Goal

Add first-class `PRODUCT.md` support to `write-docs`.

The extension should:

- Route `PRODUCT.md` requests to a new `references/product.md` file.
- Use the five layers from *The Elements of User Experience* as writing and review constraints:
  - Strategy: user needs and product objectives.
  - Scope: included, excluded, and deferred capabilities.
  - Structure: task flow, information architecture, and interaction sequence.
  - Skeleton: interface model, navigation, inputs, feedback, and layout obligations.
  - Surface: voice, visual feel, states, and sensory polish.
- Support both new `PRODUCT.md` creation and existing `PRODUCT.md` audits.
- Keep the existing `write-docs` principle: product claims must come from repository facts, user-provided requirements, existing docs, visible UI, or clearly marked assumptions.

## Non-Goals

- Do not add a full PRD generator.
- Do not create product strategy from nothing when the repository has no evidence.
- Do not turn `PRODUCT.md` into architecture, roadmap, changelog, or issue tracking.
- Do not require every product to expose all five layers as visible headings if a more natural section shape reads better.
- Do not quote or reproduce large parts of the source book.

## Proposed File Changes

```text
skills/write-docs/
  SKILL.md
  references/
    product.md
```

`SKILL.md` remains responsible for document routing, repository fact gathering, and final reporting.

`references/product.md` owns the judgment for writing `PRODUCT.md`: what questions it answers, how the five UX layers constrain the document, what evidence is required, and what weak product-writing patterns to reject.

## `SKILL.md` Updates

Add `PRODUCT.md` to supported documents and required reference routing:

```text
PRODUCT.md -> references/product.md
```

When multiple documents are requested, place `PRODUCT.md` after `README.md` and before `ARCHITECTURE.md`:

1. `README.md`
2. `PRODUCT.md`
3. `ARCHITECTURE.md`
4. `CONTRIBUTING.md`
5. `TUTORIAL.md`

Rationale: README introduces the project first. Product intent should then constrain architecture, contribution, and tutorial writing instead of being derived after implementation detail.

Extend repository fact scanning for product targets to include:

- Existing product notes, roadmap notes, issue templates, design docs, and docs navigation.
- UI routes, screens, commands, components, prompts, or flows that reveal product behavior.
- README claims about users, use cases, positioning, or outcomes.
- Configuration and options that shape user-facing behavior.
- Tests or examples that show expected user journeys.

The scan should still avoid invented personas, business goals, feature promises, market claims, and unsupported roadmap items.

## `references/product.md` Responsibilities

`PRODUCT.md` should answer these reader questions:

1. Who is the product for?
2. What user need or job makes it worth existing?
3. What product outcome should the experience create?
4. What is in scope now, out of scope, and deferred?
5. How does a user move through the main experience?
6. What interface model should stay stable as the product changes?
7. What tone, feedback, and visual or sensory qualities should the product preserve?
8. What assumptions need validation?

The reference should recommend sections by need, not as a mandatory template:

- Product Intent.
- Users and Jobs.
- Experience Principles.
- Scope.
- Structure.
- Key Flows.
- Interface Model.
- Surface and Voice.
- Open Questions.

For small projects, sections may be combined. For complex products, `PRODUCT.md` should stay focused on product-experience intent and link to deeper specs when they exist.

## Five-Layer Constraints

### Strategy

Require a clear link between user need and product objective. The document should say what user pain, job, or context matters, and what outcome the product is trying to create.

Reject vague strategy such as "make the product better" or "provide a seamless experience" unless it is grounded in a specific user and task.

### Scope

Require scope to distinguish:

- Included now.
- Explicitly excluded.
- Deferred or open.

This prevents `PRODUCT.md` from becoming a wishlist. If the repository only proves current behavior, the document should say so instead of promising future features.

### Structure

Require the document to describe how users move through the experience. This can be a task flow, information architecture, command sequence, screen sequence, or lifecycle.

The structure section should expose dependency between steps, not just list features.

### Skeleton

Require interface-level constraints: navigation, input controls, feedback points, defaults, empty states, error states, or layout obligations.

For non-visual tools, skeleton still applies: command shape, prompt flow, option grouping, output format, confirmation steps, and recovery paths.

### Surface

Require guidance for voice, tone, visual feel, feedback texture, and perceived quality. Avoid empty adjectives such as "beautiful" or "modern" unless the document explains what that means in product behavior.

Surface guidance should be specific enough for future implementation and review decisions.

## Audit Behavior

When auditing an existing `PRODUCT.md`, the skill should check:

- Whether each of the five layers is present or intentionally omitted.
- Whether strategy is grounded in users and outcomes.
- Whether scope separates current, excluded, and deferred work.
- Whether key flows are understandable without reading source internals.
- Whether interface and feedback expectations are concrete.
- Whether surface guidance constrains language, visual treatment, and state behavior.
- Whether claims conflict with repository facts or are unsupported.

The final response should list the product reference as a required reference read, plus the repository facts used to verify product claims.

## Common Mistakes to Prevent

| Mistake | Fix |
| --- | --- |
| Product doc is only a feature list. | Add user need, product objective, task flow, interface expectations, and surface constraints. |
| Product doc is only a vision statement. | Add concrete scope, flows, current behavior, and open assumptions. |
| User personas are invented. | Use repository evidence or mark personas as assumptions. |
| Scope promises unsupported future work. | Split current, excluded, and deferred items. |
| UX language is generic. | Tie each experience principle to a user action, state, or product decision. |
| Visual guidance says only "clean" or "modern". | Describe tone, hierarchy, density, feedback, and state behavior. |

## Testing and Verification

Implementation should be verified with text checks rather than runtime tests:

- `rg -n "PRODUCT.md|references/product.md" skills/write-docs/SKILL.md`
- `test -f skills/write-docs/references/product.md`
- `rg -n "Strategy|Scope|Structure|Skeleton|Surface|Users and Jobs|Open Questions" skills/write-docs/references/product.md`

Manual review should confirm:

- `PRODUCT.md` is listed in supported documents.
- Required reference routing includes `references/product.md`.
- Product fact scanning is added without weakening the existing anti-guessing rules.
- The reference adapts the five layers into writing constraints rather than summarizing the book.

## Acceptance Criteria

- `write-docs` treats `PRODUCT.md` as a supported document.
- `write-docs` requires `references/product.md` for `PRODUCT.md` work.
- The new product reference covers creation and audit workflows.
- The five UX layers constrain `PRODUCT.md` content in practical terms.
- The guidance preserves repository-fact grounding and clearly marks assumptions.
- No existing README, architecture, contributing, or tutorial behavior regresses.
