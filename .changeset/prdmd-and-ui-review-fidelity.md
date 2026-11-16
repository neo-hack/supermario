---
"supermario": minor
---

Add first-class `PRD.md` support to the write-docs skill via a new `prdmd.md` reference — a self-contained, initiative-scoped spec (background, goals, principles, flows, interaction/display rules, states, compatibility, acceptance criteria) modeled on a real-world PRD, distinct from `PRODUCT.md`'s living five-layer model.

Sharpen the ui-review skill's Figma fidelity comparison: prefer Figma Dev Mode/API/MCP for exact token values over eyeballing screenshots, enumerate every design-reference frame/state before comparing instead of a skimmable prose checklist, report coverage as a design-vs-live comparison table so verdicts can't hide an unstated gap behind a hedge word, and persist reports to `.ui-review/reports/` so Regression mode has a real baseline to diff against.
