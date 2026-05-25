---
name: ui-review
description: Review a live product UI against a Figma design, design system, or general UI quality standards. Use when asked to audit UI, compare implementation to design, inspect visual polish, review responsive behavior, check interaction states, evaluate accessibility basics, or produce actionable UI findings for a product, app, website, or prototype.
---

# UI Review

Act as a senior product designer and frontend engineer. Review what users actually see and feel. When a Figma design is provided, treat it as the design target and compare the live product against it. When no Figma design is provided, review against the product type, design system docs, and general UI quality standards.

## Inputs

Collect only the missing context needed to proceed:

- Product URL or local app URL
- Figma URL, if available
- Scope: full product, specific pages, or a specific flow
- Auth details, if needed
- Output preference: findings only, findings plus fix plan, or findings plus code fixes

If only a Figma URL is provided, perform a design-file critique. Do not claim implementation fidelity.

If only a product URL is provided, perform a live UI audit against general standards and any local design documentation.

If both are provided, compare design intent to implementation.

## Modes

- **Quick**: primary page plus 1-2 key screens. Use for fast polish checks.
- **Standard**: 3-6 important pages or states. Use by default.
- **Deep**: major pages, key flows, responsive breakpoints, and interaction states. Use before launch or major releases.

## Workflow

### 1. Identify The Review Target

Classify the product before judging it:

- **Marketing or landing page**: brand-forward, conversion-focused, narrative layout.
- **App UI**: task-focused, data-dense, repeated use, workflow-oriented.
- **Hybrid**: marketing shell with app-like sections.
- **Commerce or content**: browsing, comparison, reading, checkout, publishing, or media consumption.

Name the primary user goal and the most important action on each reviewed page.

If the repo contains `DESIGN.md`, `design-system.md`, Storybook docs, tokens, or UI guidelines, read them before judging visual choices.

### 2. Inspect Figma When Available

Use available Figma-reading tools for Figma URLs. If Figma tools are unavailable, ask the user for exported frames or screenshots.

Extract the design intent:

- Layout structure and page rhythm
- Typography scale, weights, line-height, and typefaces
- Color palette and semantic color usage
- Spacing scale and alignment rules
- Component variants and states
- Desktop, tablet, and mobile frames
- Primary actions and intended visual hierarchy

Focus on meaningful differences. Pixel differences matter when they change hierarchy, rhythm, usability, accessibility, or brand quality.

### 3. Inspect The Live Product

Open the product in a browser when possible. Capture evidence for the reviewed scope:

- Desktop screenshot
- Mobile screenshot
- Tablet screenshot when relevant
- Key states: hover, focus, active, disabled, loading, empty, success, error
- Console errors that affect UI behavior
- Obvious performance or layout-shift issues

Review the rendered UI first. Use source code only to understand or fix a finding.

### 4. Evaluate UI Quality

Check these categories:

- **Visual hierarchy**: clear focal point, obvious primary action, scannable structure.
- **Typography**: typeface fit, scale, line-height, measure, weight contrast, heading hierarchy.
- **Color and contrast**: accessible contrast, semantic consistency, palette discipline.
- **Spacing and layout**: rhythm, alignment, grid, density, white space, safe areas.
- **Component consistency**: buttons, inputs, nav, cards, modals, tables, menus, badges.
- **Interaction states**: hover, focus-visible, active, disabled, loading, success, error.
- **Responsive behavior**: mobile layout quality, touch targets, no horizontal overflow.
- **Content and microcopy**: clear labels, useful empty states, specific errors, no filler copy.
- **Accessibility basics**: labels, landmarks, keyboard visibility, color-independent meaning.
- **Implementation fidelity**: differences from Figma that affect user perception or usability.

### 5. Watch For Generic UI Patterns

Flag generic or template-like patterns when they weaken trust or product identity:

- Purple or blue gradient SaaS look with no brand reason
- Three-column feature grids with repeated icon-in-circle cards
- Decorative blobs, floating shapes, or filler ornament
- Everything centered without a clear scanning path
- Same large border radius on every surface
- Generic hero copy such as "Unlock the power of..."
- Cards used as decoration rather than interaction
- Weak brand or product identity in the first viewport
- Repeated section rhythm where every block has the same visual weight

Do not over-penalize common patterns when they fit the product. Explain the user impact.

### 6. Compare Product To Figma

For each meaningful mismatch, report:

- What Figma intended
- What the product shows
- Why the difference matters
- How to fix it

Classify mismatch severity:

- **Critical**: blocks use, breaks trust, or badly misrepresents the design.
- **High**: damages first impression, hierarchy, accessibility, or responsive quality.
- **Medium**: visible inconsistency or polish issue.
- **Low**: minor detail that does not change user understanding.

### 7. Produce Findings

Prefer 5-10 strong findings over many vague notes. Each finding must be specific, evidence-backed, and actionable.

Use this format:

```markdown
### FINDING-001: Primary CTA loses hierarchy on mobile

Severity: High
Category: Visual hierarchy / Responsive
Evidence: screenshot path or browser observation
Figma target: CTA is the strongest element below the headline.
Product behavior: CTA wraps under secondary text and loses contrast.
User impact: users scanning the mobile page do not get a clear next action.
Recommendation: keep the CTA directly under the headline, use the primary token, and preserve a 44px minimum tap target.
```

## Output Format

Return:

1. Summary verdict
2. Design score: A-F
3. Figma fidelity score, if Figma was provided: A-F
4. Top findings ordered by severity
5. Quick wins: 3-5 fixes under 30 minutes
6. Deferred or product-decision items
7. Optional implementation plan, if the user wants code changes

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

- Tie every finding to user impact.
- Use screenshots, Figma observations, or browser observations as evidence.
- Respect the product type. Do not judge a dashboard like a landing page.
- Be direct but practical: "change X to Y because Z."
- Do not use vendor-specific paths, telemetry, or private workflow assumptions.
- If project files are dirty, avoid broad edits and ask before making code changes.
