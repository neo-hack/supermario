---
name: what-have-done
description: Use when summarizing completed work, handoff status, final implementation results, or what still needs human verification after changes.
---

# What Have Done

## Overview

Produce an evidence-based completion summary that separates what was done,
what was verified automatically, and what still needs a human to check.

## Workflow

### 1. Gather Evidence

Inspect the actual work before summarizing:

```bash
git status --short
git diff --stat
git diff
git log --oneline -5
```

When relevant, also inspect test output, screenshots, generated files, changed
docs, or command logs from the current task.

### 2. Summarize Completed Work

List only concrete changes supported by evidence. Prefer user-facing outcomes
over internal implementation details, but include important files or modules
when they help the reviewer find the work.

### 3. Separate Verification

Group verification into three clear buckets:

- `Verified`: Commands, tests, builds, screenshots, or checks that actually ran.
- `Not verified`: Checks that would be useful but were not run.
- `Needs human verification`: Product judgment, visual approval, copy tone,
  business logic confirmation, credentials, external systems, or workflows that
  require human access or intent.

### 4. Call Out Risk

Mention only realistic residual risk:

- Untested edge cases.
- Areas touched indirectly.
- Environment assumptions.
- Data, API, or integration dependencies.

Keep this short. Do not invent generic risk just to fill space.

## Output Shape

Use this structure unless the user asks for another format:

```markdown
**Completed**
- <concrete completed item>

**Verified**
- `<command>` passed

**Needs Human Verification**
- <specific check a human should perform>

**Notes**
- <optional concise risk, limitation, or follow-up>
```

Omit empty sections. If nothing needs human verification, say so directly.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Claiming tests passed from memory | Include only commands that actually ran. |
| Mixing automated and human checks | Keep `Verified` and `Needs Human Verification` separate. |
| Summarizing intentions | Summarize completed, observable changes. |
| Dumping every changed file | Mention files only when useful for review. |
| Hiding skipped checks | State important checks that were not run. |
