# Stopping Criteria & Scoring Logic

## Stopping Conditions

### Free Exploration Mode

The exploration ends only when aggressive coverage converges:

- `{OUTPUT_DIR}/coverage.json` exists and is current.
- `pending` element actions are empty; in legacy shorthand, pending is empty.
- `behaviorCases.pending` has no untested high-risk or medium-risk behavior variants.
- Any remaining low-risk behavior variants are in `behaviorCases.skipped` with clear reasons.
- `stablePasses >= coverageThresholds.stablePassesRequired`.
- The scope container or page has reached its scroll boundary.
- No open menu, popover, dialog, tooltip, or dynamically revealed panel remains unexplored.
- Every discovered in-scope stable key is in `visited`, `skipped`, `outOfScope`, or `halted`.
- No confirmed P0 halt is active.
- Stop immediately after evidence and one minimal reproduction confirm a P0 halt.

No issue count limit exists. Keep going until coverage converges or a confirmed P0 halt stops exploration.

### Case Verification Mode

1. Execute all `<scenario>` blocks from qa.md exactly as written until all scenarios are complete, failed, or blocked.
2. If the user requested strict qa.md-only verification, stop after scenario reporting and mark uncovered behavior as intentionally not explored.
3. Otherwise, identify elements and behavior cases not exercised by any scenario action.
4. Run aggressive supplemental exploration for uncovered in-scope behavior and elements.
5. Stop only when scenario execution and supplemental aggressive coverage are both complete, or when a confirmed P0 halt stops exploration.

## Scoring Logic

Use [8-Dimension Health Score](evidence-and-reporting.md#8-dimension-health-score) as the source of truth for assessment states, deductions, weights, and rating eligibility. Finishing exploration does not imply complete assessment. Preserve unassessed categories and report coverage gaps when scoring is unavailable.
