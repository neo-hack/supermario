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

### Category Scoring

Each of the 8 categories starts at 100. Deduct per finding.

#### Console (weight: 15%)

Count JS errors and failed network requests found across the entire session:

| Error count | Score |
|-------------|-------|
| 0 | 100 |
| 1-3 | 70 |
| 4-10 | 40 |
| 10+ | 10 |

#### Links (weight: 10%)

Start at 100. Each broken link (404, wrong destination, timeout): -15. Minimum 0.

#### Per-Issue Categories (Visual, Functional, UX, Performance, Content, Accessibility)

Start at 100. Deduct per finding:

| Severity | Deduction |
|----------|-----------|
| Critical | -25 |
| High | -15 |
| Medium | -8 |
| Low | -3 |

Minimum 0 per category.

### Weights

| Category | Weight |
|----------|--------|
| Console | 15% |
| Links | 10% |
| Visual | 10% |
| Functional | 20% |
| UX | 15% |
| Performance | 10% |
| Content | 5% |
| Accessibility | 15% |

### Final Score

```text
finalScore = sum(categoryScore * weight)
```

Range: 0-100. Round to nearest integer.

### Verdict

| Score | Verdict |
|-------|---------|
| 90-100 | Excellent |
| 75-89 | Good |
| 60-74 | Needs Work |
| 40-59 | Poor |
| 0-39 | Critical |
