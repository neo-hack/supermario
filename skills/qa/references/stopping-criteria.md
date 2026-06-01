# Stopping Criteria & Scoring Logic

## Stopping Conditions

### Free Exploration Mode

The exploration ends when **all interactive elements on the page have been explored**.

- After the initial `snapshot -i`, all discovered elements enter a queue
- Elements are processed top-to-bottom, left-to-right
- If scrolling reveals new elements (via `snapshot -i` after scroll), add them to the queue
- No issue count limit -- keep going until the queue is empty
- Skip elements per the Skip Rules (disabled, hidden, already visited, external links)

### Case Verification Mode

1. Execute all `<scenario>` blocks from qa.md until all scenarios are complete
2. Identify elements not exercised by any scenario action
3. Free-explore those uncovered elements until all are visited
4. Stop when both scenarios and uncovered elements are exhausted

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
