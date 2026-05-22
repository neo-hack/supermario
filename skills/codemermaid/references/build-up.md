# Build-Up Perspective

Use this reference when generating `build-up.html` or deciding whether a module page needs a module-level Build-Up section.

## Purpose

Build-Up teaches the project as a learning order: start with the smallest useful behavior, then add one capability at a time until the reader can understand the complete system. It is not the actual development order and not a historical commit sequence unless git history is explicitly cited.

## Project-Level Build-Up

`build-up.html` is a required perspective page. It should answer:

- What can the system do at the smallest useful point?
- What capability appears at each step?
- Which real modules and source files make that capability possible?
- What gap remains for the next step?
- How does the final step connect back to the full architecture?

### Route Shape

```javascript
const BUILD_UP = {
  perspective: "build-up",
  learningPromise: "Learn how the project grows from its smallest useful behavior into the complete system.",
  prereqs: ["Architecture Overview"],
  route: [
    {
      capability: "Render the smallest useful output",
      modules: ["messages"],
      sourceFiles: ["src/messages.ts"],
      whyNow: "Readers need to see the final product at its smallest scale before routing, state, or transport matter."
    }
  ],
  units: []
};
```

## Capability Increment Rules

A capability increment is a focused learning step. It explains what the reader understands before the step, what new capability appears after it, why the code or module is needed now, and what remains unresolved.

- Start from the smallest useful behavior the project can show.
- Add one primary capability at a time, such as routing, persistence, streaming, rendering, validation, composition, or deployment.
- Use as many units as needed to explain the step clearly. There is no fixed number of steps or units.
- Use exact real source excerpts under the existing Real code only rules.
- Use diagrams when they clarify structure, data flow, sequence, state, or before/after shape. Skip decorative diagrams.
- End the page with a `takeaway` that summarizes how the smallest capability grew into the complete system.

## Unit Mix

Use existing unit kinds:

- `concept` to explain the capability and why it comes now.
- `diagram` for the shape of the capability, using `references/svg-patterns.md`.
- `code-walk` for exact source excerpts that implement the step.
- `code-graph` only when code lines need click-sync to a 4-6 node call graph.
- `quiz` to check whether the reader understood the design choice.
- `takeaway` to close the step or the whole page.

If a graph does not need code-line click-sync, use a Mermaid `diagram` instead of `code-graph`.

## Example Routes

For a React chat UI, a good route might be:

1. Render one message.
2. Route message types to renderers.
3. Render tool calls.
4. Add hooks or stores for state.
5. Add streaming transport.
6. Compose the panel and composer.

For a CLI transform tool, a good route might be:

1. CLI entry.
2. Argument parsing.
3. Core transform.
4. Output writer.
5. Error handling.

## Module-Level Build-Up

Module pages may include a module-level Build-Up section when the module has a natural internal progression. This section is optional.

Use module-level Build-Up when the module becomes clearer as capability increments, such as:

- Text input -> submit handling -> controls -> attachments.
- One message type -> type dispatch -> fallback.
- Raw config -> validation -> normalized runtime config.

Do not force module-level Build-Up into thin wrappers, primitive collections, or modules where a normal code-walk is clearer. Not every module needs one.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Build-Up reads like git history | Reword as a learning order: "To understand this, start with the smallest useful behavior." |
| Build-Up is just a module list | Rewrite each step around a capability change: what exists before, what appears after, and what code makes that possible. |
| Decorative diagram | Remove it or replace it with a code-walk. |
| Forced module Build-Up | Remove the section and use a normal module deep dive. |
| `code-graph` used without click-sync | Use a Mermaid `diagram` instead. |
