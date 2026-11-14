---
name: what-have-done
description: Use when summarizing completed work, handoff status, final implementation results, or what still needs human verification after changes.
---

# What Have Done

## Overview

Produce an evidence-based completion summary that separates what was done,
why the change should work, what was verified automatically, and what still
needs a human to check. Use diagrams to explain meaningful flow changes.

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

Establish the comparison baseline from the task's actual commits or diff.
Read both the baseline and current implementation before describing an old
and new flow. A clean working tree may still contain committed changes;
inspect the relevant commit or branch diff rather than concluding nothing changed.

### 2. Summarize Completed Work

List only concrete changes supported by evidence. Prefer user-facing outcomes
over internal implementation details, but include important files or modules
when they help the reviewer find the work.

### 3. Explain the Flow and Why It Works

Include a diagram when the user asks for a diagram, or when changed branching,
cross-component interactions, or lifecycle transitions need a visual explanation.
Skip diagrams for trivial changes such as wording or a simple rename unless
the user explicitly asks for one.

Choose the form that explains the behavior:

| Change | Mermaid form |
| --- | --- |
| Steps, decisions, or retry routes | `flowchart` |
| Requests, responses, and ordering across components | `sequenceDiagram` |
| Lifecycle states and transition conditions | `stateDiagram-v2` |

Use Mermaid fenced blocks. Name nodes and arrows in the reader's terms, label
branch conditions, and preserve meaningful async boundaries and ownership.
Show the path affected by the change, including relevant error or recovery
branches; leave unrelated calls out. Link the key transitions to the relevant
files and revisions in a short caption or the explanation beside the diagram.

Show **Before** and **After** diagrams when requested or when the fix depends
on a changed route, decision, ordering, ownership, or state transition that a
single current-flow diagram would hide. Use the same triggering input, labels,
and level of detail so the important difference is visible. If the baseline
cannot be established, show only the current flow and state what evidence is
missing. Do not invent a previous flow from the intended fix.

Explain the mechanism beside the diagram: the original trigger and failure or
limitation; the specific changed decision, ordering, ownership, or state
transition; and why that change prevents the failure or enables the intended
outcome. Connect that reasoning to code reasoning, tests, or a live observation
as available, and state assumptions and unverified paths. Label an untested
mechanism as code reasoning, not as a confirmed runtime result.

These are explanatory diagrams, not formal verification. No TLA+ model or
additional rendering tool is required for this summary. Do not claim a diagram
was rendered or a model checked unless that actually ran. Diagram generation
does not move any behavior into the Verified bucket.

### 4. Separate Verification

Group verification into three clear buckets:

- `Verified`: Commands, tests, builds, screenshots, or checks that actually ran.
- `Not verified`: Checks that would be useful but were not run.
- `Needs human verification`: Product judgment, visual approval, copy tone,
  business logic confirmation, credentials, external systems, or workflows that
  require human access or intent.

### 5. Call Out Risk

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

**Flow and Why It Works**
<current flow, or before/after diagrams when needed>
<trigger, changed mechanism, why it addresses the problem, and source links>
<supporting evidence and any unverified assumptions>

**Verified**
- `<command>` passed

**Not Verified**
- <important check that was not run>

**Needs Human Verification**
- <specific check a human should perform>

**Notes**
- <optional concise risk, limitation, or follow-up>
```

Omit empty sections. Omit the flow section when it adds no explanatory value
and the user has not requested it. If nothing needs human verification, say so directly.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Claiming tests passed from memory | Include only commands that actually ran. |
| Mixing automated and human checks | Keep `Verified` and `Needs Human Verification` separate. |
| Summarizing intentions | Summarize completed, observable changes. |
| Dumping every changed file | Mention files only when useful for review. |
| Hiding skipped checks | State important checks that were not run. |
| Drawing only the happy path | Include the changed failure, branch, or recovery path needed to explain the result. |
| Guessing the previous behavior | Read the comparison baseline; omit the Before diagram when the baseline is unavailable. |
| Saying the change works without explaining why | Identify the changed decision or transition and connect it to the result and evidence. |
| Treating a diagram as a passing test | Keep explanatory reasoning separate from tests, live observations, and model-check results. |
