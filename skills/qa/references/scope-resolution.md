# Scope Resolution

Use this reference before free exploration, case verification, or init QA when the user asks to focus on part of the current page.

## Natural-language triggers

Enable scope resolution when the request names a component or region, including:

- English: `only`, `focus`, `scope`, `component`, `section`, `panel`, `modal`, `dialog`, `card`, `form`, `table`, `chart`, `sidebar`, `filters`, `pricing`, `checkout`, `login`.
- Equivalent phrases in other languages are valid user intent, but keep examples in this skill file English-only.

Do not enable scope resolution for a plain page QA request such as `qa https://example.com`. Do not enable it when the user explicitly asks for full-page or exhaustive QA.

## Resolution Flow

1. Open the page normally.
2. Run `agent-browser snapshot` for page structure.
3. Run `agent-browser snapshot -i --json` for structured interactive refs.
4. Run `agent-browser screenshot --annotate {OUTPUT_DIR}/screenshots/scope-candidates.png`.
5. Identify one to three candidate scopes from headings, forms, regions, dialogs, cards, panels, nearby text, and contained interactive elements.
6. Highlight the best candidate anchor:

```bash
agent-browser highlight @eN
agent-browser screenshot {OUTPUT_DIR}/screenshots/scope-target.png
```

7. If one candidate is clearly dominant, record it and continue.
8. If multiple candidates match, ask the user to confirm before exploration.

## Candidate Evidence Format

Record the chosen scope in `{OUTPUT_DIR}/coverage.json`:

```json
{
  "scope": {
    "mode": "natural-language",
    "query": "login form",
    "scopeKey": "/login|form|Sign in",
    "anchor": {
      "role": "form",
      "name": "Sign in",
      "ref": "e12"
    },
    "evidence": {
      "annotatedScreenshot": "screenshots/scope-candidates.png",
      "targetScreenshot": "screenshots/scope-target.png"
    }
  }
}
```

## Confirmation Rules

Continue without asking only when all of these are true:

- Exactly one candidate strongly matches the user phrase.
- The candidate contains at least one interactive element.
- The candidate is not global navigation, footer, or unrelated page chrome.

Ask the user to confirm when:

- Multiple similar candidates exist.
- The best candidate is only a child control, not the whole component.
- The requested scope is visible in the screenshot but absent from the accessibility tree.

## Scoped Exploration Rules

- Build queues only from elements inside the resolved scope.
- Scope limits where exploration happens; it does not reduce behavior depth. Within the resolved scope, still generate baseline behavior cases and snapshot-derived behavior cases using `references/behavior-testing.md`.
- Include popovers, menus, dialogs, and tooltips triggered by in-scope elements.
- Treat behavior revealed by in-scope overlays as in-scope until it navigates, creates external side effects, becomes destructive, or leaves the resolved component workflow.
- Mark navigation, header, footer, and unrelated page controls as out-of-scope.
- If an in-scope action causes full-page navigation, stop that step and record out-of-scope navigation unless the user explicitly allows navigation.
- Scroll the scoped container first. Scroll the page only when the scope itself cannot scroll.

## Stable Scope Key

Use this shape for stable scope keys:

```text
path + "|" + scopeRole + "|" + scopeNameOrNearbyHeading
```

Examples:

```text
/login|form|Sign in
/pricing|section|Pricing
/dashboard|panel|Filters
```
