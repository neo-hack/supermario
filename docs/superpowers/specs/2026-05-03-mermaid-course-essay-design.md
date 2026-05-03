# Mermaid Course — Scrollable Essay Redesign (C′)

**Date:** 2026-05-03
**Skill:** `skills/mermaid-course/`
**Status:** Approved
**Supersedes (partially):** `2026-05-02-mermaid-course-multi-perspective-design.md` — keeps the multi-page output structure, replaces the per-page click-explore template with a scrollable essay template.

## Problem

The current `mermaid-course` skill produces multi-page interactive HTML: index page, perspective pages with click-to-explore Mermaid graphs, per-module deep dives. Output renders cleanly and the Raycast theme is sharp, but reading a generated course feels like documentation, not a course:

- Diagrams describe; code panels carry neutral "what this does" prose.
- No pedagogical voice, no pacing, no setup→payoff, no surprise-spotting.
- The click-panel form forces teaching into pellets, flattening the prose.

DeepWiki and GitDiagram already auto-generate docs. The unfilled gap is **DeepWiki-style automation combined with Crafting Interpreters / Julia Evans pedagogy** — visual-first, learning-rich, opinionated. The current skill sits on the wrong side of that gap.

User thesis: *"when everyone is vibe coding, you should know why it works, what can I learn."*

## Solution

Replace the per-page click-explore template with **scrollable essays where Mermaid diagrams act as anchors, not navigation**. Each perspective and each module becomes one scrollable HTML page that walks the reader top-to-bottom through typed pedagogical units.

The multi-page output structure (`index.html` + per-perspective pages + per-module pages) carries forward unchanged. What changes is the per-page template and the content schema feeding it.

## Constraints

- Personal-use scope. Optimize for "next time the user runs this on a repo they want to learn from." Not a product.
- Single self-contained HTML output per page. Vanilla JS. No build tools, no React.
- Raycast-themed dark UI carries forward (existing `DESIGN.md` tokens).
- Mermaid stays as the diagramming primitive.
- Skill is invoked from Claude Code; output lands in target repo's `docs/codebase-course/`.

## Page Shape

Every per-perspective and per-module page renders in this order:

1. **Hero** — title, `learningPromise` ("After this, you'll understand why X handles Y the way it does"), `prereqs` chips ("comfortable with: HTTP middleware, JS closures").
2. **Anchor diagram** (optional) — Mermaid rendered at top of page. Pure orienting mini-map. ≤ 8 nodes recommended. Scroll-linked when units bind to it via `anchorNode`.
3. **Essay body** — `units[]` rendered inline in array order.
4. **Footer** — "next perspective" / "next module" link, learning-promise recap.

## Schema

Replace `COURSE.steps[]` with `units[]`. Same shape for `PERSPECTIVE`.

```javascript
COURSE = {
  module: "auth",
  learningPromise: "After reading, you'll understand how token validation flows through middleware before any handler runs.",
  prereqs: ["HTTP middleware", "JWT structure"],
  diagram: "graph TD ...",  // optional module-internal anchor diagram
  units: [ /* see UNIT shapes below */ ]
}

PERSPECTIVE = {
  perspective: "architecture",
  learningPromise: "After reading, you'll see why this codebase splits responsibilities into 5 layers and what each one's actually for.",
  prereqs: ["MVC pattern"],
  diagram: "graph TD ...",  // REQUIRED for perspective pages
  units: [ /* same UNIT shapes; deep links live as inline markdown links inside body prose */ ]
}

INDEX = {
  project: { name, description, language, framework },
  perspectives: [ { title, description, page, unitCount } ],
  modules:      [ { title, description, page, unitCount } ]
}
```

### Unit kinds

```javascript
{ kind: "concept",     title, body }                                          // 60-150 words prose
{ kind: "code-walk",   title, file, code, highlightLines, explanation, layout?, steps?, anchorNode? }
{ kind: "guess-first", question, reveal: { code?, explanation } }             // collapsed by default
{ kind: "compare",     title, left: { label, code }, right: { label, code }, lesson }
{ kind: "surprise",    title, body }                                          // 1-3 sentences, distinct callout
{ kind: "takeaway",    body }                                                 // recap card, end-of-section
{ kind: "diagram",     title, mermaid, caption, zoomable? }                   // architecture/sequence/state figure; zoomable defaults true
```

### code-walk layouts

- `layout: "stacked"` (default) — single column, code then prose.
- `layout: "split"` — sticky code on left, prose beside it on right. Use when the explanation has multiple beats tied to specific lines and stacked would force scroll-back. Collapses to stacked below 880px viewport.
- `layout: "stepped"` — sticky code on left, ordered `steps[]` on right. Each step has `{ highlightLines, beat }`. As reader scrolls, the step nearest viewport center becomes active and its `highlightLines` light up in the sticky code. Tapping a step smooth-scrolls and centers it. Mutually exclusive with flat `highlightLines + explanation`. Collapses to stacked below 880px (active step = first, no scroll-link).
- **Budget: at most one `stepped` code-walk per module.** Attention-heavy primitive; overuse turns the page into a slideshow.

Only `code-walk` honors `layout`. All other unit kinds render single-column.

## Mermaid: two roles, one schema

**Role 1 — Anchor diagram.** Page-level `diagram` field on COURSE/PERSPECTIVE. Job: orientation. ≤ 8 nodes. Scroll-linked when units opt in via `anchorNode: "<mermaidNodeId>"`. The unit nearest viewport center wins; matching node fills with accent (`#FF6363`), inactive nodes return to surface color. Tapping a node smooth-scrolls to its bound unit. Units without `anchorNode` are ignored. **Never zoomable.**

**Role 2 — Architecture/sequence/state figure.** New `diagram` unit kind. Inline in `units[]`. Nodes represent real components, message flows, states, dependencies — independent of reading order. No scroll-linking, no node binding. Counts toward unit budget. Renders with a "Zoom" button that opens a fullscreen overlay (cursor-anchored wheel zoom, drag-pan, +/− controls, reset, Esc/backdrop closes). Default `zoomable: true`; set `false` for tiny figures.

The two roles never share a Mermaid graph. If a page needs both, write a small anchor at the top and a richer architecture figure inside a unit.

## Voice

A teacher pointing at the thing. Not neutral docs prose. Signposted (*"watch this," "the move is...," "here's where it gets clever"*), opinionated, and constantly comparing to the reader's existing mental models.

> ❌ Flat: *"This middleware validates the JWT token from the Authorization header. If valid, the user object is attached to the request context."*
>
> ✅ Pointed: *"Watch what they do here — the token check happens before any handler runs, but they don't throw on a malformed token, they `next()` with a null user. That's the move. It means downstream handlers decide whether `null user` is OK for them, instead of the middleware deciding for everyone."*

> ❌ Flat: *"The router uses a trie data structure for path matching."*
>
> ✅ Pointed: *"They use a trie for path matching. Express uses a regex array. Why does that matter? Look at the lookup cost: trie is O(path-segments), regex array is O(routes-registered). Hono runs the same benchmark as Express on a 200-route app and wins by 30x. The data structure choice IS the performance story."*

> ❌ Flat: *"This function returns a Promise that resolves to the parsed body."*
>
> ✅ Pointed: *"Heads up — this returns a Promise but the cache check is synchronous. If you `await` this without checking the cache flag first, you've already lost the early-return win. The shape of the API hides the cost."*

These three examples ship in `references/voice-examples.md` so the generator has concrete patterns to imitate.

## Budgets

| Unit | Limit |
|------|-------|
| `concept` | 60–150 words |
| `code-walk` | 8–15 lines code + 50–150 words explanation |
| `guess-first` | question ≤ 2 sentences, reveal ≤ 150 words |
| `compare` | ≤ 12 lines per side, lesson ≤ 80 words |
| `surprise` | 1–3 sentences |
| `takeaway` | 2–4 sentences |
| **Per page** | **4–8 units, hard max 10** |
| Stepped code-walks | ≤ 1 per module |

Bloat is the failure mode of generated content; cap it.

## Pedagogy enforcement

Both prompt-level (taught in `SKILL.md` Phase 3) **and** generator-side validator (fails the run on violation):

- Every module's `units[]` MUST contain at least one `guess-first` OR one `surprise`.
- Every module MUST have a non-empty `learningPromise`.
- Every module's `units[]` MUST end with a `takeaway`.
- Every perspective's `units[]` MUST start with a `concept` and end with a `takeaway`.

## Locked decisions (do not re-litigate)

- `code-walk` uses `highlightLines + explanation` only. **No** per-line `annotations` map. (One mechanism; upgrade only if a real run demands it.)
- `flowOrder` from old `COURSE` is **dropped**. `units[]` array order *is* reading order.
- `click nodeId callback` Mermaid directives are **dropped** on essay pages. `index.html` cards are plain `<a href>`. The `securityLevel: 'loose'` line in `SKILL.md` Common Mistakes becomes obsolete and is removed.
- Cross-module references in `PERSPECTIVE.units[].body` are inline markdown links (`[the auth middleware](module-auth.html)`). No `nodes[].deepLink` schema. Renderer parses markdown in body fields.
- `template-essay.html` **replaces** `template-course.html`. Old template is deleted in the same change. Existing generated courses regenerate from scratch — personal-use scope, no migration story.
- `template-index.html` is updated in place: same card layout, schema field renamed `steps` → `unitCount`.

## SKILL.md changes

- **Phase 2** — perspective inference unchanged (each perspective still maps to one essay page).
- **Phase 3** — rewritten around `units[]`. Includes voice rules, unit-kind catalog with examples, budgets, pedagogy enforcement.
- **Phase 4** — Mermaid graph rules drop the `click` directive section entirely. Adds the two-roles distinction and the `anchorNode` binding contract.
- **Phase 5** — file routing unchanged: `index.html` + `<perspective>.html` + `module-<name>.html`.
- **Phase 6** — template assembly rewritten for `template-essay.html` and `units[]`.

## File changes

| Path | Change |
|------|--------|
| `skills/mermaid-course/templates/template-essay.html` | **NEW** — vanilla JS, scrollable layout, renders all unit kinds, scroll-linked anchor diagram, zoomable diagram units |
| `skills/mermaid-course/templates/template-course.html` | **DELETE** |
| `skills/mermaid-course/templates/template-index.html` | **EDIT** — `steps` → `unitCount` |
| `skills/mermaid-course/SKILL.md` | **EDIT** — Phases 3, 4, 6 rewritten |
| `skills/mermaid-course/references/units-examples.md` | **NEW** — 2–3 examples per unit kind |
| `skills/mermaid-course/references/voice-examples.md` | **NEW** — flat-vs-pointed prose pairs from this spec |
| `skills/mermaid-course/scripts/validate-units.{js,ts}` | **NEW** — runs the pedagogy-enforcement rules; fails the build on violation |

Reference implementation already exists at `docs/codebase-demo-mermaid-essay.html` — uses every unit kind, both Mermaid roles, all three `code-walk` layouts, and the zoom overlay. The template is a productized fork of this demo.

## Success criteria

- Running the skill on a repo you want to learn from produces an essay you'd send a friend a link to.
- Reading the output, you stop at `surprise` callouts going "oh, that's clever."
- A `guess-first` block makes you actually pause and guess before clicking, at least once per module.
- The artifact reads on your phone over coffee.
- After reading one perspective, you can articulate the answer to its `learningPromise` without scrolling back.

## Open questions (deferred, not blocking)

1. **Mermaid graph density for very large repos.** When a perspective covers 30+ modules, the anchor diagram becomes unreadable. Layered subgraphs vs. multiple narrower perspectives — defer until a real repo forces the call.
2. **Annotation rendering on `code-walk`.** Margin notes (hover-to-reveal) vs. inline numbered footnotes. Ship `highlightLines + explanation` first; upgrade only if it feels flat in practice.
3. **Per-module pages vs. folded into perspectives.** Default to separate pages so the index gallery still works; revisit if fragmentation hurts.

## Out of scope

- Migration of existing generated courses (regenerate from scratch).
- Slidev/orientation-tour split — handled by the separate `presentation` skill.
- Multi-user, gallery, productization concerns.
