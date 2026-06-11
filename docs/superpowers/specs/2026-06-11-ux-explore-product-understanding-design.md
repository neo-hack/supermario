# UX Explore Product Understanding Design

## Problem

`ux-explore` can already inspect a page through screenshots and `agent-browser snapshot -i`, but its instructions still make it too easy to move from setup directly into element interaction. That creates a weak exploration pattern: many controls may be clicked, yet few product capabilities are actually experienced as a user would experience them.

The existing Trunk Test is valuable, but it answers a different question: whether a user can tell where they are and what the page offers. It does not force the agent to turn page evidence into a working product model or a prioritized list of capabilities to experience.

QA already has `skills/qa/references/behavior-testing.md`, which solves a related problem by making behavior cases more important than raw element coverage. UX Explore needs the same baseline idea, but not the QA coverage vocabulary, P0 bug handling, or `coverage.json` contract.

## Goals

- Keep the Trunk Test as a UX clarity check.
- Add a Product Understanding stage before free mode or journey mode action planning.
- Add a UX-specific Behavior Experience reference inspired by QA behavior testing.
- Make capability experience the first-class unit for UX Explore.
- Keep baseline capability profiles explicitly non-exhaustive.
- Make the agent infer product capabilities from screenshot, snapshot, visible copy, ARIA roles, states, and revealed overlays.
- Avoid asking the user what the product is unless page evidence is insufficient.
- Keep `SKILL.md` as the route and shared judgment entrypoint.
- Keep UX reports and usage guides as the reporting outputs.

## Non-Goals

- Do not make UX Explore import or directly depend on QA `behavior-testing.md`.
- Do not add `coverage.json` to UX Explore.
- Do not add P0-specific stop behavior to UX Explore.
- Do not change the agent-browser command model.
- Do not add a runtime engine that automatically parses or replays `usage.md`.
- Do not remove free mode or journey mode.

## Proposed Structure

```text
skills/ux-explore/
  SKILL.md
  references/
    product-understanding.md
    behavior-experience.md
    free-mode.md
    journey-mode.md
    reporting.md
  templates/
    ux-report-template.html
    usage-template.html
```

## Conceptual Model

UX Explore should use three separate reasoning layers:

1. **Trunk Test**
   - Purpose: evaluate page clarity.
   - Question: can a user tell what this is, where they are, and what they can do?
   - Failure mode: record UX issues when the page does not explain itself.

2. **Product Understanding**
   - Purpose: create an action-planning model.
   - Question: based on page evidence, what product is this and which capabilities should be experienced?
   - Failure mode: if confidence is low, record unclear assumptions and ask the user only when the next action cannot be chosen responsibly.

3. **Behavior Experience**
   - Purpose: turn the working product model into capability experiences.
   - Question: what user-facing capabilities should be completed, partially completed, or skipped with evidence?
   - Failure mode: do not treat opening a control as enough to prove a capability.

## `SKILL.md`

`SKILL.md` should remain the entrypoint. It should not contain the detailed Product Understanding or Behavior Experience workflows.

Required references should become:

```markdown
## Required References

Read the references for the selected work:

- After setup and Trunk Test, follow `references/product-understanding.md`.
- For capability planning in free mode and journey mode, follow `references/behavior-experience.md`.
- For free mode traversal, follow `references/free-mode.md`.
- For journey mode, follow `references/journey-mode.md`.
- For all Markdown and HTML artifacts, follow `references/reporting.md`.
```

Execution order should be explicit:

```markdown
## Execution Order

1. Run setup and capture screenshot, snapshot, console, and errors.
2. Run the Trunk Test as a UX clarity check.
3. Follow `references/product-understanding.md` to create a working product model.
4. Follow `references/behavior-experience.md` to derive capability experiences from the working model.
5. Run exactly one execution mode: free mode or journey mode.
6. Follow `references/reporting.md` for Markdown and HTML artifacts.
```

The Trunk Test wording should clarify that the agent answers the questions from page evidence:

```markdown
Answer these yourself from screenshot and snapshot evidence. Do not ask the user unless the page evidence is insufficient after inspection.
```

## `references/product-understanding.md`

This file owns product inference before action planning.

It should require the agent to inspect:

- URL and route.
- Page title if visible or available.
- Initial annotated screenshot.
- Initial interactive snapshot.
- Visible copy, headings, nav items, empty states, button labels, input hints, and status text.
- ARIA roles and states.
- Initial console or error signals only when they affect user-visible understanding.

It should produce a short working model in the exploration notes and in `ux-report.md`:

```markdown
## Product Understanding

| Field | Value |
|-------|-------|
| Product or page identity | {inferred identity} |
| Primary user goal | {most likely user job} |
| Major areas | {nav, content, editor, list, settings, etc.} |
| Obvious capabilities | {capability list} |
| Unclear assumptions | {unknowns or none} |
| Confidence | high / medium / low |
```

The reference should include rules:

- Infer first; do not ask the user by default.
- Ask only if the page evidence is insufficient and the next action would otherwise be arbitrary or risky.
- If confidence is low but a safe first action exists, proceed and record the assumption.
- Use product language from visible copy when naming capabilities.
- Do not reduce capabilities to individual elements.

## `references/behavior-experience.md`

This file owns UX capability experience planning.

It should be inspired by QA behavior testing but use UX language:

- Capability experience, not test case coverage.
- Experience state, not pass/fail.
- UX friction and confidence, not P0/P1 bug classes.
- Reporting to `ux-report.md` and `usage.md`, not `coverage.json`.

It should start with the same baseline principle as QA:

```markdown
The profiles below are a baseline seed set, not an exhaustive list. Always extend them with behavior inferred from the current snapshot, screenshot, visible copy, ARIA roles/states, and overlays revealed during exploration.
```

It should define a capability queue:

```markdown
## Capability Queue

Maintain a lightweight queue in exploration notes:

- Planned: capabilities inferred from Product Understanding and baseline profiles.
- In progress: the current capability being experienced.
- Experienced: capabilities completed or partially completed with evidence.
- Skipped: capabilities skipped with a reason.
```

No JSON artifact is required. The queue is instructional state used to guide exploration and reporting.

Baseline capability profiles should include:

- Text input, editor, composer.
- Form.
- Combobox, select, picker.
- Menu, popover, dialog.
- Tabs and segmented controls.
- Table and list.
- File and upload.
- Search.
- Navigation.
- Destructive or high-risk actions.

Each profile should use UX experience language. For example, text input should include empty input, valid input, invalid input when applicable, long input, keyboard editing, submit/reset, trigger sequences, visible feedback, error recovery, and whether the user can tell the operation succeeded.

The completion rule should be:

```markdown
A capability is experienced only when the user-facing path is completed, partially completed with a clear blocker, or skipped with a clear reason. Opening a control, menu, picker, or popover reveals a capability; it does not prove the capability has been experienced.
```

## Free Mode Changes

Free mode should become capability-first, with element traversal as a backstop.

Current free mode says to work through interactive elements top-to-bottom, left-to-right. That should be adjusted:

- Start from Product Understanding capability candidates.
- Use Behavior Experience baseline profiles to expand obvious capability states.
- Experience coherent capabilities before isolated element clicks.
- If an interaction reveals a new capability, add it to the queue.
- If a capability uses several controls, treat the group as one product experience.
- After capability experience slows down, use element traversal to find missed interactive controls.
- If no coherent capability can be inferred, fall back to element-level exploration and record that limitation.

This keeps free mode broad while preventing it from becoming mechanical clicking.

## Journey Mode Changes

Journey mode should use Product Understanding to contextualize the stated goal and Behavior Experience to break the journey into capability steps.

For example, an RSS subscription journey may become:

- Add feed.
- Validate URL input.
- Confirm subscription appears.
- Refresh feed.
- Open an item.
- Handle empty or error feed state.

Journey mode should not become full-page traversal. It should use the baseline only to enrich the stated goal with obvious state variants such as invalid input, loading feedback, empty state, cancel, retry, or success confirmation.

## Reporting Rules

`references/reporting.md` already owns artifact formats. This design should only clarify inputs to those artifacts:

- Product Understanding should appear in `ux-report.md`.
- Capability experiences should feed the exploration or journey log in `ux-report.md`.
- UX friction belongs in `ux-report.md`.
- Observed product paths belong in `usage.md`.
- Partial or blocked capabilities should still be represented in `usage.md` with limitations when they reveal useful product behavior.

## Testing

Update `tests/ux-explore/structure.test.js` to verify:

- `SKILL.md` routes Product Understanding to `references/product-understanding.md`.
- `SKILL.md` routes Behavior Experience to `references/behavior-experience.md`.
- `SKILL.md` defines the execution order: setup, Trunk Test, Product Understanding, Behavior Experience, mode execution, reporting.
- The Trunk Test tells the agent to answer from screenshot and snapshot evidence.
- `product-understanding.md` requires a working model with Product or page identity, Primary user goal, Major areas, Obvious capabilities, Unclear assumptions, and Confidence.
- `product-understanding.md` says not to ask the user by default.
- `behavior-experience.md` states that baseline profiles are not exhaustive.
- `behavior-experience.md` states that opening a control does not prove a capability has been experienced.
- `free-mode.md` prioritizes capability experience before mechanical element traversal.
- `journey-mode.md` uses Behavior Experience to enrich the stated goal without turning into full-page traversal.
- UX Explore files remain English-only.

## Acceptance Criteria

- UX Explore keeps Trunk Test and Product Understanding as separate concepts.
- Product Understanding creates a working model before action planning.
- Behavior Experience provides a UX-specific baseline seed set for capability experience.
- Free mode becomes capability-first while retaining element traversal as a backstop.
- Journey mode uses capability steps for complete feature flows.
- UX Explore does not depend on QA `behavior-testing.md` or `coverage.json`.
- Tests pass and UX Explore files remain English-only.
