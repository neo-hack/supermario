# QA Report: {URL}

## Session Info

| Field | Value |
|-------|-------|
| URL | {url} |
| Date | {date} |
| Mode | Free Exploration / Case Verification |
| Raw interactive elements | {count by role} |
| Coverage actions discovered | {count} |
| Coverage actions visited | {count} |
| Issues found | {count} |

## Health Score

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Console | | 15% | |
| Links | | 10% | |
| Visual | | 10% | |
| Functional | | 20% | |
| UX | | 15% | |
| Performance | | 10% | |
| Content | | 5% | |
| Accessibility | | 15% | |
| **Total** | | | **/100** |

## Coverage Status

| Field | Value |
|-------|-------|
| Status | completed / halted |
| Scope | full page / {scopeKey} |
| Raw interactive elements | {count by role} |
| Coverage actions discovered | {count} |
| Coverage actions visited | {count} |
| Skipped | {count} |
| Out of scope | {count} |
| Pending | {count} |
| Stable passes | {count} |
| Stable pass threshold | {count} |
| Halt reason | none / ISSUE-{NNN} |

## Behavior Testing

| Feature model | Planned cases | Tested cases | Skipped cases | Notes |
|---------------|---------------|--------------|---------------|-------|
| {model} | {cases} | {cases} | {cases} | {notes} |

<!-- Case verification mode: add Scenario Results and Scenario Details sections here -->
<!-- Free exploration mode: skip directly to Exploration Log -->

## Exploration Log

<!-- Copy this block for each element explored -->

### Step {N}: {Action description}
- **Before**: ![step-{NNN}](screenshots/step-{NNN}.png)
- **Target**: ![step-{NNN}-target](screenshots/step-{NNN}-target.png)
- **Action**: {action command}
- **After**: ![step-{NNN}-after](screenshots/step-{NNN}-after.png)
- **Diff**: [step-{NNN} diff](diffs/step-{NNN}.txt)
- **Observation**: {what happened, what changed}
- **Issue**: None / ISSUE-{NNN}

---

## Issues

<!-- Copy this block for each issue found -->

### ISSUE-{NNN}: {Short title}

| Field | Value |
|-------|-------|
| **Severity** | critical / high / medium / low |
| **Category** | visual / functional / ux / content / performance / console / accessibility |
| **Element** | @e{N} role "label" |
| **Evidence** | step-{NNN} before/target/after screenshots, diffs/step-{NNN}.txt |
| **Description** | {what is wrong, what was expected, what actually happened} |
| **Recommendation** | {how to fix it} |

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| **Total** | **0** |
