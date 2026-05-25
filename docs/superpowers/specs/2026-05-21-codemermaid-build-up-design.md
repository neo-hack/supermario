# CodeMermaid Build-Up Perspective Design

**Date:** 2026-05-21
**Skill:** `skills/codemermaid/`
**Status:** Draft for planning
**Context:** User wants CodeMermaid to teach code in a gradual "building blocks" style: start from a small useful slice of code, explain what it can do, then add the next capability and explain how the system grows.

## Problem

CodeMermaid currently generates architecture, inferred perspective, and per-module deep-dive pages. Those pages explain the finished system well, but they do not always give a new reader a gentle path from "small understandable piece" to "complete system."

For a project like `@aiden-ai/chat-kit`, a reader can see modules such as Agent Server, Chat Panel, Message Router, Stores, and Tool Renderers. What is missing is the learning route that says:

1. Start with rendering one message.
2. Add routing when message types multiply.
3. Add tool renderers when assistant messages contain tool calls.
4. Add hooks and stores when messages become streamed state.
5. Add Agent Server when the browser needs live backend events.
6. Compose everything into ChatPanel and ChatComposer.

That route is not a replacement for architecture or module pages. It is a first-pass teaching path.

## Goals

- Always generate a project-level `build-up.html` perspective page.
- Teach the project as a gradual capability build, not as a flat module inventory.
- Use diagrams and real source snippets together so each step shows both "what changed" and "where the code lives."
- Allow module pages to include a build-up section when the module has a natural internal growth path.
- Keep all existing real-code and pedagogy rules: no invented snippets, no simplified fake code, no lazy annotations.

## Non-Goals

- Do not claim the project was implemented in this order unless git history proves it.
- Do not force every module to have a build-up section.
- Do not replace `architecture.html`, inferred perspective pages, or `module-*.html`.
- Do not introduce a new browser runtime requirement for the first implementation if existing unit composition is enough.
- Do not set a fixed number of build steps or units. The page should use as much structure as needed to explain the code clearly.

## Page Model

### Project-Level Page

`build-up.html` is a default perspective, generated for every CodeMermaid course. It appears alongside `architecture.html` and other perspective pages in the `index.html` Perspectives section.

Recommended ordering:

1. `Architecture Overview`
2. `Build-Up Walkthrough`
3. Other user-requested or auto-inferred perspectives, such as Data Flow or Module Dependency

The page answers:

> If I wanted to understand this project from the smallest useful capability upward, what code should I read first, and what capability does each next piece add?

### Module-Level Build-Up Sections

Module pages may include a build-up section when the module itself has a clear internal progression. This is optional.

Good candidates:

- `ChatComposer`: text input -> submit handling -> model and permission controls -> attachments.
- `MessageRouter`: one message type -> type dispatch -> tool dispatch -> fallback behavior.
- `Stores`: array state -> thread-keyed state -> LRU cache -> streamed updates.

Poor candidates:

- Thin wrappers.
- Primitive collections with no coherent growth path.
- Modules where a normal code-walk explains the code more directly.

If a module does not have a natural build-up path, the generator should keep the normal module deep dive and avoid filler.

## Build Step Structure

A build step is a focused capability increment. It is a teaching unit, not a historical commit.

Each step should explain:

- What the reader can understand before this step.
- What new capability appears after this step.
- Why the next piece of code or module is needed.
- Which real source snippet demonstrates the capability.
- How the system shape changes, when a diagram helps.
- What gap remains, setting up the next step.

The implementation can express a build step using existing units:

- `concept` for the capability and reason.
- `diagram` for structure, flow, or sequence.
- `code-walk` or `code-graph` for exact source.
- `quiz` for a key design check.
- `takeaway` at the end of the page.

There is no fixed count for steps or units. A simple step may need only a concept and diagram. A complex step may need multiple concepts, diagrams, and code-walks. The standard is whether the reader can follow the capability growth without a missing bridge.

## Generation Rules

### Perspective List

`build-up.html` joins `architecture.html` as a default perspective. Existing auto-inferred perspectives remain supplementary:

- Has HTTP, WebSocket, or event streams -> Data Flow perspective.
- Has database or ORM -> Data Model perspective.
- Has state management -> State Machine perspective.
- Has many modules -> Module Dependency perspective.
- Has CI/CD config -> Build Pipeline perspective.

User-requested perspectives remain mandatory.

### Build Route Discovery

The generator should derive a reading route from the discovered modules and source relationships. It should prefer reader comprehension order over filesystem order.

For `@aiden-ai/chat-kit`, a good route is:

1. Message rendering.
2. Message routing.
3. Tool rendering.
4. Hooks and stores.
5. Agent Server streaming.
6. ChatPanel and ChatComposer composition.

Other projects may use a different route, such as CLI entry -> parser -> core transform -> output writer, or request handler -> service -> repository -> serializer.

### Source Integrity

All code snippets must be exact excerpts from real source files. The generator may choose a narrow contiguous slice, trim leading/trailing blank lines, and use top-level elision comments where allowed by existing rules. It must not invent smaller "teaching versions" of code.

### Diagram Use

Diagrams are expected when they clarify the capability change. They should not be decorative.

Good diagram uses:

- Flow from input to renderer.
- Component composition after a new layer is added.
- Sequence from browser event to streamed state update.
- Before/after structure when a router or store is introduced.

If a diagram does not make the step easier to understand, skip it and use prose plus source.

## Fallback Behavior

Because `build-up.html` is always generated, the generator needs a conservative fallback for projects without an obvious linear build route.

Fallback route:

1. Entry point.
2. Core domain or transformation logic.
3. State or data layer, when present.
4. Integration or output layer.
5. User-facing composition or final command/API, when present.

The page must describe this as a learning order. It must not imply the code was literally written in that order.

## Validation

Generated Build-Up pages must satisfy existing page quality rules plus these checks:

- `index.html` links to `build-up.html`.
- `build-up.html` exists and has no placeholder links.
- The Build-Up perspective starts with a `concept` and ends with a `takeaway`.
- The page contains at least one quiz.
- Every code snippet is real source and obeys existing code presentation rules.
- Every build step explains a capability change; a plain module inventory is not enough.
- Diagrams, when present, explain structure, flow, or sequence relevant to the step.
- Module-level build-up sections are included only when they add a clearer explanation than a normal module deep dive.

## Success Criteria

- A regenerated `@aiden-ai/chat-kit` course includes `build-up.html` in the Perspectives section.
- The `chat-kit` Build-Up route can explain message rendering -> routing -> tool renderers -> hooks/stores -> Agent Server -> ChatPanel/Composer without relying on fake code.
- Module pages can include build-up sections for suitable modules, while unsuitable modules remain normal deep dives.
- The new guidance makes CodeMermaid output more consistent without requiring a new unit kind in the first implementation.
- Readers can use `build-up.html` as the first learning page before moving into architecture, data flow, or module details.
