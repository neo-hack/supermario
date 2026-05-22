# CodeMermaid Whoa Unit Design

**Date:** 2026-05-22
**Skill:** `skills/codemermaid/`
**Status:** Design approved for spec review
**Context:** User wants CodeMermaid to call out project features and implementation choices that make readers stop and think, "that is a surprisingly good design."

## Problem

CodeMermaid can explain architecture, Build-Up learning routes, module dependencies, source snippets, diagrams, quizzes, and takeaways. Those units teach how code works, but they do not give the generator a dedicated way to mark "this design is especially good."

Today, an agent can mention a clever implementation inside a `concept` or `code-walk` annotation, but that makes high-value design moments blend into normal explanation. A reader should be able to notice a small number of standout moments across a generated course:

- A product decision that makes the project easier to embed or use.
- A UX detail that makes a complex flow feel simple.
- An architecture boundary that keeps complexity contained.
- A code technique that solves a hard constraint without polluting the public model.

## Goals

- Add a `whoa` unit for rare, high-signal design highlights.
- Support code, product, UX, and architecture highlights without creating separate visual components for each.
- Keep `whoa` evidence flexible: it may point to files, modules, interactions, constraints, or source snippets, but it does not always need a single code block.
- Keep `whoa` visually consistent with `skills/codemermaid/DESIGN.md`: dark Raycast-style surface, restrained Raycast Red punctuation, cool borders, and neutral evidence chips.
- Keep density low enough that `whoa` remains special.

## Non-Goals

- Do not use `whoa` for every important concept.
- Do not replace `concept`, `code-walk`, `diagram`, `quiz`, or `takeaway`.
- Do not add a separate color palette for each `angle`.
- Do not require every `whoa` to bind to a single code snippet.
- Do not claim a design is clever without evidence from the scanned project.

## Unit Model

Recommended data shape:

```javascript
{
  kind: "whoa",
  angle: "code" | "product" | "ux" | "architecture",
  title: "...",
  body: "...",
  evidence?: {
    files?: string[],
    modules?: string[],
    interactions?: string[],
    constraints?: string[]
  }
}
```

### Fields

- `kind`: always `"whoa"`.
- `angle`: describes what kind of design moment the unit explains.
- `title`: a short, concrete statement of the surprising design win.
- `body`: explains why the design is unusually good, what constraint it handles, and what would be worse without it.
- `evidence`: optional but encouraged. Evidence can be code files, module names, interaction names, runtime constraints, or design constraints.

## Angles

### `angle: "code"`

Use when the standout detail is a source-level technique or implementation boundary.

Best placement: after the relevant `code-walk` or `code-graph`.

Example from `chat-kit`: `threadStreamReducer` attaches non-enumerable Symbol metadata to SDK messages so the reducer can dedupe live events and snapshots without changing the public SDK message shape.

### `angle: "product"`

Use when the standout detail is a product capability or embedder-facing API decision.

Best placement: near the feature introduction, or after the capability has been explained.

Example from `chat-kit`: `ChatPanel` is prop-driven. The host owns transport, persistence, permissions, and callbacks, while chat-kit owns the visible conversation UI.

### `angle: "ux"`

Use when the standout detail improves the user's experience of a complex flow.

Best placement: near the interaction, diagram, or behavior being explained.

Example from `chat-kit`: `ToolResultProvider` lets tool renderers subscribe by `tool_use_id`, so late tool results update the specific waiting renderer instead of repainting the whole historical transcript.

### `angle: "architecture"`

Use when the standout detail is a system boundary, data-flow decision, or composition pattern.

Best placement: after an architecture diagram, Build-Up capability step, module dependency explanation, or composition code.

Example from `chat-kit`: completed history can render as a collapsed transcript first, then hydrate hidden internals on idle or on expansion, keeping replay/read-only sessions responsive without losing detail.

## Selection Rules

`whoa` should be rare. A normal generated course should pick about 3-5 project-level highlights total. Important module pages may include a local `whoa`, but those still count against the overall budget unless the course is very large.

A candidate can become `whoa` if it has one strong reason or two weak reasons.

Strong reasons:

- The design clearly lowers complexity.
- The feature clearly improves user understanding or user experience.
- The choice is hard to achieve under the project's constraints.

Weak reasons:

- The point crosses multiple modules or pages.
- The implementation is simpler than the common alternative.
- The interaction makes a workflow smoother.
- The design leaves room for future extension.
- Removing it would remove a visible project strength.

If the agent is unsure whether something is `whoa`, it should keep the idea in a normal `concept` or `code-walk` note.

## Visual Design

Use one visual treatment for all `whoa` units. `angle` changes the label and placement rules, not the color palette.

Required style direction:

- Near-black or `var(--surface)` card background.
- Subtle Raycast Red accent, preferably a left edge and small label dot.
- Cool border aligned with the existing card/border system.
- 16px-ish card radius, matching existing prominent containers.
- Medium-weight Inter typography.
- Neutral gray evidence chips using Geist Mono.
- No blue/green/yellow/purple angle-specific card colors.
- No decorative gradients beyond a restrained dark red tint compatible with the existing `unit-surprise` treatment.

The visual should feel like a special CodeMermaid unit, not a separate product component.

## Placement Rules

- `code`: place after the code unit that proves the point.
- `product`: place near the feature introduction or after the feature capability is explained.
- `ux`: place beside or after the interaction it praises.
- `architecture`: place after the diagram, route step, or module relationship that reveals the design.

Do not put all `whoa` units at the top of a page. Their value depends on context.

## Evidence Rules

Evidence is optional because some `whoa` moments are cross-module or experiential. When possible, provide one or more of:

- `files`: real source files that demonstrate the design.
- `modules`: module names involved in the design.
- `interactions`: user-visible interactions or UI behaviors.
- `constraints`: constraints that make the design impressive.

When a `whoa` depends on source code, the surrounding page should already include or link to the relevant `code-walk`, `code-graph`, or module page. Do not paste invented source into a `whoa`.

## Example Chat-Kit Candidates

The visual demo used real examples from:

`/Users/bytedance/Projects/bugs/markone-rebase-only/aiden/chat-kit`

Good candidate `whoa` units:

- `product`: `ChatPanel` renders the agent experience while the host keeps control through props, callbacks, slots, and resource config.
- `code`: `threadStreamReducer` uses non-enumerable Symbol metadata to dedupe live events and snapshots without changing SDK message shape.
- `product`: `ChatComposer` packs prompt text, slash commands, mentions, attachments, permission mode, branch controls, model controls, plugins, MCP, workspace selection, and stop/send lifecycle into optional controls.
- `ux`: `ToolResultProvider` uses `useSyncExternalStore` subscriptions keyed by `tool_use_id` so late results wake the specific renderer waiting for them.
- `architecture`: `ChatPanel` can render collapsed completed history first, then hydrate hidden internals on idle or expansion.

## Validation

Generated pages with `whoa` units must satisfy these checks:

- Each `whoa` has `angle`, `title`, and `body`.
- `angle` is one of `code`, `product`, `ux`, or `architecture`.
- `body` explains why the design is unusually good, not just what it does.
- Evidence, when provided, points to real files, modules, interactions, or constraints.
- `whoa` count stays intentionally low for the course.
- The visual style uses one unified Raycast-style treatment.
- The page still satisfies existing CodeMermaid rules: real source only, no dummy links, no lazy code explanations, and valid unit order.

## Success Criteria

- A generated CodeMermaid course can surface 3-5 standout design moments without turning every callout into `whoa`.
- `whoa` improves a reader's understanding of why the project is well-designed, not only how it works.
- Code, product, UX, and architecture highlights share one consistent visual language.
- The unit remains compatible with existing essay pages, module pages, Build-Up pages, and inferred perspective pages.
