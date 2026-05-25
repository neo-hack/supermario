# UI Quality Review

Use this reference to judge whether the design reference or rendered product is high-quality UI. This complements implementation fidelity; it does not override it.

When a design reference exists, label quality problems in the reference as `Design-source concern`. When no design reference exists, use this as the primary review guide.

## Quality Principles

- Prominence communicates importance.
- Related things should be visually grouped; unrelated things should separate cleanly.
- Type, color, spacing, radii, shadows, and states should feel like one system.
- Interactive elements should look interactive before hover.
- Whitespace should clarify structure, not look accidental.
- Mobile and tablet layouts should feel intentionally composed, not merely stacked.
- Loading, empty, error, focus, disabled, and success states are part of UI quality.

## First Visual Impression

Before detailed analysis, record:

- What does the product appear to be?
- What does the page communicate at a glance: premium, competent, playful, dense, generic, unfinished, confusing?
- What are the first three elements the eye notices?
- Are those the elements the interface should emphasize?
- Can the page purpose be understood in three seconds?
- Can each visible region be named in two seconds?
- Does the first viewport have one clear visual anchor?

Write concrete observations. Name the exact element, position, and visual treatment.

## Rendered Design System Extraction

Infer the actual UI system:

- **Fonts**: families, roles, counts, fallback behavior.
- **Type scale**: h1-h6, body, label, caption, weights, line-height.
- **Colors**: core palette, semantic colors, neutral system, accent usage, dark-mode behavior.
- **Spacing**: padding, margin, gaps, section rhythm, container widths.
- **Radii and borders**: radius scale, nested radius logic, border weight, surface separation.
- **Components**: buttons, inputs, menus, cards, tables, nav, dialogs, alerts, badges.
- **State language**: hover, focus, active, disabled, loading, success, error.
- **Responsive rules**: breakpoints, nav behavior, density changes, content priority.

Flag competing systems: random font sizes, mixed border radii, scattered colors, inconsistent shadows, or one-off component styles.

## Detailed UI Checklist

Apply these categories page by page. Use numeric checks as heuristics unless the design reference or project design system defines a different value.

### 1. Visual Hierarchy And Composition

- Clear focal point.
- One obvious primary action per view, unless the page is intentionally exploratory.
- Eye flow supports the page goal.
- Important information has stronger visual weight than secondary information.
- Related items are grouped; unrelated items separate cleanly.
- Above-the-fold content communicates purpose quickly.
- Hierarchy remains visible when squinting or viewing a thumbnail.
- No accidental overlap, clipping, or z-index confusion.
- White space feels intentional.
- Visual density matches the product type.
- Cards are used because they structure interaction or content, not as decoration.
- Each section has one job.

### 2. Typography

- Font count is controlled; use three or fewer as a default heuristic.
- Typeface choices match the brand and product category.
- Display, heading, body, label, and caption sizes form a clear scale.
- Body copy is readable for the context; use 16px as a web reading heuristic when no system exists.
- Captions and labels remain legible; use 12px as a lower-bound heuristic.
- Body line-height supports reading; headings are tighter than body.
- Long prose uses comfortable measure; 45-75 characters per line is a useful heuristic.
- Heading hierarchy is visually clear.
- Weight contrast is meaningful.
- Numeric columns use tabular figures when alignment matters.
- Letter spacing is not applied to normal lowercase body text.
- Long headings wrap gracefully.
- Truncation is intentional and preserves key information.
- Production UI has no lorem ipsum, placeholder copy, accidental debug text, or broken localization.
- Quotation marks, apostrophes, and ellipses match the product's editorial polish.

### 3. Color And Contrast

- Palette is coherent and not an uncontrolled mix of accents.
- Primary, secondary, success, warning, error, and neutral colors are used consistently.
- Body text has accessible contrast; WCAG AA is the default heuristic when no product-specific standard exists.
- Large text and UI boundaries have enough contrast to be perceived.
- Color is not the only way to communicate status or category.
- Error and warning colors are distinguishable from decorative accents.
- Dark mode, if present, uses surface hierarchy rather than simple inversion.
- Dark-mode text avoids harsh pure white on pure black unless deliberately styled.
- Disabled states remain understandable without looking broken.
- Brand color supports the interface rather than overwhelming utility or readability.
- Neutral palette is consistently warm, cool, or intentionally mixed.

### 4. Spacing And Layout

- Spacing follows a recognizable scale, often 4px or 8px based.
- Alignment is consistent across sections and breakpoints.
- Related controls sit closer together than unrelated controls.
- Distinct sections have enough separation to scan.
- Container widths prevent unreadably long text.
- Grid behavior is predictable across desktop, tablet, and mobile.
- Nested radii look intentional.
- Cards, panels, and surfaces do not stack into clutter.
- Mobile has no horizontal overflow.
- Safe-area insets are handled for modern devices when relevant.
- Filter, tab, pagination, and view state are reflected in URL when product expectations call for it.
- Layout uses CSS layout primitives instead of fragile visual hacks when possible.

### 5. Components And Visible States

- Buttons have clear hierarchy: primary, secondary, tertiary, destructive.
- Clickable things look clickable before hover.
- Hover states exist where hover applies.
- Keyboard focus is visible and not removed without replacement.
- Active or pressed states communicate action.
- Disabled states are visibly disabled and do not look broken.
- Loading states match the shape of eventual content.
- Empty states include useful copy and a next action when appropriate.
- Error messages say what happened and how to recover.
- Success feedback is timely and visible.
- Touch targets are large enough; 44px is the default mobile heuristic.
- Menus, dialogs, popovers, tooltips, and drawers have clear visual chrome and exits.

### 6. Responsive UI

- Mobile layout is intentionally composed, not only stacked desktop columns.
- Primary UI elements remain reachable on mobile.
- Navigation adapts without hiding essential orientation.
- Text remains readable without zoom.
- Forms use mobile-appropriate controls and input types.
- Images and media crop or scale intentionally.
- Tables, charts, and dense data have a usable small-screen strategy.
- Tablet is not an awkward stretched phone or cramped desktop.
- Viewport settings do not disable user zoom.
- Breakpoints cover common widths: small mobile, large mobile, tablet, desktop, and wide desktop.

### 7. Motion And Animation

- Motion explains state, hierarchy, feedback, or spatial relationship.
- Durations feel responsive and not theatrical.
- Entering, exiting, and movement use appropriate easing.
- Reduced-motion preferences are respected.
- Avoid broad `transition: all`; animate specific properties.
- Prefer transform and opacity over layout properties.
- Hover motion does not cause layout shift.
- Page transitions do not block comprehension or task progress.

### 8. Content And Microcopy

- Button labels are specific to the action.
- Labels describe the data being requested.
- Empty states are helpful rather than merely saying nothing exists.
- Error copy is specific, recoverable, and near the source.
- Destructive actions have confirmation, undo, or a clear escape route.
- Loading copy is concise and uses the product's ellipsis convention.
- Visible instructions are short and timely; long instructions usually reveal a UI problem.
- Happy-talk copy is removed or compressed.
- Product language is concrete, not generic aspiration.
- Users can scan headings and understand the page story.

### 9. Accessibility Basics

- Interactive controls have accessible names.
- Inputs keep visible labels after content is entered.
- Landmarks and headings support orientation.
- Keyboard navigation reaches interactive controls in a sensible order.
- Focus states are visible against the surrounding surface.
- Link text is meaningful out of context.
- Visited and unvisited links remain distinguishable when that matters.
- Status changes are visibly connected to their trigger or announced.
- Images that communicate information have useful alt text.
- Icon-only buttons have labels or accessible names.

### 10. Performance Feel

- Initial load feels fast enough for the product type.
- Layout shifts do not distract or cause mis-clicks.
- Skeletons or placeholders resemble final content.
- Images have stable dimensions and appropriate lazy loading.
- Font loading does not cause jarring flashes or reflow.
- Heavy effects do not make scrolling feel sluggish.
- Client-side route changes provide immediate feedback.
- Slow actions show progress before users get anxious.

## Generic Or AI-Looking UI

Flag these only when they weaken trust, product identity, or perceived craft:

- Purple, violet, indigo, or blue-purple gradients used without brand reason.
- Repeated three-column feature grids with icon circles and short blurbs.
- Icons in colored circles used as section decoration.
- Everything centered without a scanning path.
- Same large border radius on every surface.
- Decorative blobs, floating circles, waves, or filler ornament.
- Emoji used as primary visual design elements.
- Accent-colored left borders on repeated cards.
- Generic hero copy such as "Unlock the power of..." or "All-in-one solution."
- Cookie-cutter section rhythm where every block has the same visual weight.
- Default-looking typography that gives the product no point of view.

Do not over-penalize common patterns when they fit the product. Explain why the pattern does or does not hurt this product.

## Product-Type Rules

### Marketing Or Landing Pages

- First viewport reads as one composition, not a dashboard.
- Brand or product is unmistakable.
- One strong visual anchor exists.
- Headline, supporting copy, and CTA form a clear hierarchy.
- Sections have distinct jobs and do not repeat the same mood.
- Cards are not used as filler decoration.
- Hero media, if present, clarifies the product or offer.

### App UI

- Calm surface hierarchy, strong typography, few colors.
- Dense but readable.
- Primary workspace, navigation, secondary context, and actions are clearly separated.
- Avoid dashboard-card mosaics unless cards are the actual interaction.
- Copy is utility-oriented: orientation, status, action.
- Section headings state what the area is or what users can do.

### Hybrid Products

- Apply landing-page rules to marketing sections.
- Apply app-UI rules to functional sections.
- Watch for visual language clashes between marketing and app surfaces.

## Scoring

Return a UI quality score:

- **A**: intentional, polished, product-appropriate, and distinctive.
- **B**: solid fundamentals with minor inconsistencies.
- **C**: functional but generic or uneven.
- **D**: visibly unfinished, confusing, or careless.
- **F**: actively harms trust, readability, or usability.

Grade categories individually:

- Visual hierarchy
- Typography
- Color and contrast
- Spacing and layout
- Components and states
- Responsive UI
- Content and microcopy
- Accessibility basics
- Motion
- Performance feel
- Generic/AI-looking risk

Start each category at A. Drop one letter for each High finding, half a letter for each Medium finding, and record Low findings without changing the grade. Critical findings cap the overall score at C unless they are isolated and outside the reviewed surface.
