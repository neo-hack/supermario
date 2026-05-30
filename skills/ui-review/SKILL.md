---
name: ui-review
description: Review UI implementation fidelity, visual quality, and optional code compliance. Use when asked to "compare product to design", "check if this matches the mockup", "review this UI", "audit visual polish", "critique this design", "check responsive states", "review UI code", or "check Web Interface Guidelines".
---

# UI Review

Act as a UI implementation reviewer and senior product designer. Separate three jobs:

1. **Implementation fidelity**: did the live product faithfully and professionally implement the supplied design reference?
2. **UI quality**: is the design reference or resulting interface visually strong, accessible, responsive, consistent, and product-appropriate?
3. **Code compliance**: does the source code follow established web interface best practices for accessibility, forms, animation, typography, performance, and interaction?

When a design reference exists, fidelity comes first. Do not treat every deviation from a generic UI heuristic as a bug. Classify whether each issue is an implementation mismatch, design-system mismatch, runtime UI issue, design-source concern, or code compliance issue.

## Inputs

Collect only the missing context needed to proceed:

- Product URL or local app URL
- Design reference, if available: Figma, screenshots, Storybook, design system docs, annotated mockups, product specs, brand guidelines, or an existing product baseline
- Scope: full product, specific pages, specific components, or visible states
- Auth details, if needed
- Review mode: quick, standard, deep, diff-aware, or regression
- Output preference: findings only, findings plus fix plan, or findings plus code fixes

If only a design reference is provided, critique the reference as a design artifact. Do not claim implementation fidelity.

If only a product URL is provided, perform a live UI quality audit against project conventions and general UI standards.

If both are provided, review fidelity first, then review UI quality.

## Reference Guides

Load these references as needed:

- For design-reference comparison and implementation QA, read `references/implementation-fidelity.md`.
- For first-impression, design-system extraction, detailed UI checklist, scoring, and generic/AI-looking UI detection, read `references/ui-quality.md`.
- For code-level compliance checks, read `references/code-compliance.md`. It fetches the latest Web Interface Guidelines dynamically instead of storing local rule copies.

Use all three references when the user provides a design reference, a live product URL, and explicitly requests code-level review.
For design-reference-only critiques or product-only visual audits, use `references/ui-quality.md`.
For code-only reviews, use `references/code-compliance.md` and skip visual review.

## Which Reference To Use

| User asks for | Read |
| --- | --- |
| "Does live match design?", "compare to mockup", "implementation QA" | `references/implementation-fidelity.md` |
| "Is this UI good?", "visual polish", "review design", "audit product page" | `references/ui-quality.md` |
| "Check UI code", "accessibility code review", "Web Interface Guidelines", "Vercel rules" | `references/code-compliance.md` |
| Design reference + live URL | `implementation-fidelity.md`, then `ui-quality.md` |
| Live URL only | `ui-quality.md` |
| Design reference only | `ui-quality.md` |
| Code files only | `code-compliance.md` |

## Standards Priority

Use standards in this order:

1. Design reference: Figma, screenshot, Storybook, spec, mockup, or product baseline.
2. Project design system: tokens, components, CSS variables, Storybook, `DESIGN.md`, or UI guidelines.
3. Existing shipped product conventions in nearby pages.
4. General UI heuristics: readability, accessibility basics, consistency, responsiveness, and polish.

Treat numeric values in the references as heuristics unless the design reference or design system defines them. Flag a value only when it conflicts with the design reference, breaks consistency, harms readability/accessibility, weakens visual hierarchy, or creates an implementation-quality problem.

## Modes

- **Quick**: primary page plus 1-2 key screens or states.
- **Standard**: 3-6 important pages or states. Use by default.
- **Deep**: 10-15 pages, major components, key visible states, and responsive breakpoints.
- **Diff-aware**: if no URL is given but the repo has a feature branch, map changed files to affected routes and audit those surfaces.
- **Regression**: compare against a previous report or baseline when available. Report new, resolved, and worsened findings.

## Workflow

1. **Identify the review target**: classify product type, scope, design reference, and reviewed surfaces.
2. **Inspect the design reference, if provided**: extract intended layout, typography, color, spacing, components, states, breakpoints, assets, and content.
3. **Inspect the live product**: capture rendered desktop/mobile/tablet views, key states, and runtime-only visual issues.
4. **Run fidelity review**: use `references/implementation-fidelity.md` when a design reference exists.
5. **Run UI quality review**: use `references/ui-quality.md` for quality scoring and design-source concerns.
6. **Run code compliance review, if requested or in scope**: read `references/code-compliance.md`, fetch the latest rules, and check affected files. Report violations as `Code compliance issue` findings.
7. **Classify findings**: separate implementation mismatches, design-source concerns, and code compliance issues.
8. **Report results**: prioritize the findings that materially affect fidelity, visual hierarchy, responsiveness, accessibility basics, code correctness, or polish.

Review rendered UI before source code. Use source code only to understand or fix a finding, or when running a code compliance review.

## Finding Types

- **Implementation mismatch**: live product differs from the design reference in a meaningful way.
- **Design-system mismatch**: live product or reference conflicts with project tokens, components, or established conventions.
- **Runtime UI issue**: live product exposes a visible issue not covered by the design reference, such as layout shift, overflow, missing focus state, or broken loading state.
- **Design-source concern**: the design reference itself has a UI quality issue, such as weak contrast, unclear hierarchy, missing states, or generic/template-like composition.
- **Code compliance issue**: source code violates a web interface best practice, such as missing aria-label, wrong element semantics, missing prefers-reduced-motion, or transition: all. Evidence uses `file:line` format.

## Severity

- **Critical**: blocks use, badly breaks the rendered interface, or makes the product look untrustworthy.
- **High**: damages fidelity, first impression, visual hierarchy, accessibility basics, responsive quality, or important UI states.
- **Medium**: visible inconsistency or polish issue users will notice.
- **Low**: minor detail that does not change user understanding.

## Output Format

Return:

1. Summary verdict
2. Review scope and evidence captured
3. Design reference used, if any
4. Fidelity score, if a design reference was provided
5. UI quality score and category grades
6. Code compliance summary, only if code compliance was requested or run
7. Findings ordered by severity, each with a finding type
8. Visible state coverage notes
9. Responsive review notes
10. Cross-page or cross-component UI consistency notes
11. Quick wins: 3-5 fixes under 30 minutes
12. Deferred or product-decision items
13. Optional implementation plan, if the user wants code changes

Use this finding format:

```markdown
### FINDING-001: Primary CTA spacing is tighter than the design reference

Type: Implementation mismatch
Severity: High
Category: Spacing / Visual hierarchy
Evidence: screenshot path, design reference observation, or browser observation
Design reference: CTA sits 24px below the headline with strong primary contrast.
Product behavior: CTA sits 12px below the headline and visually merges with secondary copy.
User impact: the primary action is harder to scan and the hero loses intended hierarchy.
Recommendation: match the reference spacing token and primary button treatment.
```

For code compliance findings, follow the output format specified by the fetched Web Interface Guidelines. Do not rewrite guideline output unless the user asks for a unified report.

For product-only reviews, replace `Design reference` with `Expected standard`.

## Fixing Code

Only modify code when the user asks for fixes or clearly delegates implementation.

When fixing:

- Keep changes scoped to the finding.
- Prefer CSS, tokens, and component prop changes over structural rewrites.
- Reuse existing components and design tokens.
- Do not add unrelated features.
- Do not set up test frameworks.
- Do not modify `CLAUDE.md`, `AGENTS.md`, or other agent routing files.
- Do not create hidden global artifacts.
- Verify with before/after screenshots when possible.

If a change affects interaction logic, add or update a focused regression test using the project's existing test setup.

## Rules

- Separate fidelity from quality.
- Use screenshots, design-reference observations, or browser observations as evidence.
- Respect the product type. Do not judge a dashboard like a landing page.
- Be direct and practical: change X to Y because Z.
- Do not use vendor-specific paths, telemetry, or private workflow assumptions.
- If project files are dirty, avoid broad edits and ask before making code changes.
- Depth beats breadth: a few well-supported findings are better than many vague notes.
