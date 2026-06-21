---
name: fix-ci
description: Use when asked to inspect, debug, fix, push, or monitor failing GitHub CI for a pull request or merge request. Fetches PR/MR CI jobs with GitHub CLI (`gh`), applies `superpowers:systematic-debugging` before changing code, verifies the fix locally, pushes the branch, and creates an automation to watch reruns and repeat the fetch/fix/push loop when CI is still failing.
---

# Fix CI

Use this workflow to repair failing GitHub CI from evidence, not guesses. Treat "MR" and "PR" as the same GitHub pull request unless the repository uses another hosting provider.

## Preconditions

Require a git repository with a GitHub remote, `gh` installed and authenticated, and a branch associated with a pull request. If no PR is specified, resolve the current branch's PR first:

```bash
gh pr view --json number,url,headRefName,baseRefName,state,statusCheckRollup
```

If `gh` is missing or unauthenticated, stop and report the exact blocker.

## Workflow

### 1. Collect CI Evidence

Do not edit files yet. Fetch the PR and workflow state:

```bash
gh pr view <pr> --json number,url,headRefName,baseRefName,headRefOid,statusCheckRollup
gh run list --branch <headRefName> --limit 20 --json databaseId,displayTitle,workflowName,headSha,status,conclusion,createdAt,updatedAt,url
```

For each failed or cancelled run that belongs to the PR head SHA, inspect jobs and logs:

```bash
gh run view <run-id> --json databaseId,displayTitle,workflowName,headSha,status,conclusion,jobs,url
gh run view <run-id> --log-failed
```

Capture the failing workflow name, job name, step name, command, exit code, and the first actionable error. If the logs are too large, search within them for `error`, `failed`, `Exception`, `Traceback`, `ERR!`, `not found`, and compiler or test runner failure markers.

### 2. Apply Systematic Debugging

Use `superpowers:systematic-debugging` before proposing or applying fixes.

Follow its phases explicitly:

1. Root cause investigation: read the full relevant CI error, reproduce locally when possible, inspect recent changes, and trace the failing path.
2. Pattern analysis: find a similar passing workflow, script, config, or test in this repository and compare differences.
3. Hypothesis and testing: state one concrete root-cause hypothesis and test it with the smallest useful command or code change.
4. Implementation: create or run the narrowest failing test/reproduction, make one root-cause fix, then verify.

Never make speculative "try this" changes from a log fragment alone. If three fix attempts fail, stop and ask for architectural direction instead of stacking more patches.

### 3. Reproduce Locally

Prefer running the same command CI ran. Derive package manager and scripts from repo files instead of guessing:

```bash
git status --short --branch
rg -n "name:|run:|uses:" .github/workflows
test -f package.json && cat package.json
```

Run the smallest matching check first, then broaden only as needed. Examples:

```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
npm test
pytest <path>
go test ./...
```

If the failure is environment-only and cannot be reproduced locally, document what was verified and add diagnostics or a targeted CI-safe fix based on evidence from the logs.

### 4. Fix, Verify, and Push

Before editing, confirm the worktree state and avoid overwriting unrelated user changes:

```bash
git status --short
```

After the fix, run the local reproduction and any adjacent checks needed to prove no nearby behavior broke. Then push the current branch:

```bash
git status --short
git diff
git push
```

If the branch has no upstream, use:

```bash
git push -u origin HEAD
```

Report only verification commands that actually ran and their outcomes.

### 5. Arrange a CI Rerun Monitor

After pushing, arrange a scheduled follow-up to watch the PR CI rerun and continue the fetch, debug, fix, and push loop if failures remain.

When running in the Codex app and `automation_update` is available, use that tool. If it is not in the active tool list but `tool_search` is available, discover it with a query such as `automation_update recurring monitor`.

If no automation tool is available in the current agent environment, do not pretend a monitor was created. Instead, provide a concise follow-up prompt and suggested check interval for the host system or human operator to schedule.

Choose automation type:

- Use `heartbeat` with `destination: "thread"` for a short follow-up in this same thread, especially under one hour.
- Use `cron` for detached workspace monitoring that should run independently of this thread.

Set the automation prompt to include:

- PR number or URL.
- Repository path.
- Branch name and last pushed SHA.
- Instruction to fetch current CI status with `gh`, inspect failed logs, apply `superpowers:systematic-debugging`, make a minimal root-cause fix if needed, verify locally, push, and schedule another monitor only if CI is still failing or pending.
- Instruction to stop and report success when all required checks pass.

When an automation tool is available, do not hand-write raw automation directives in the final response; use the tool call. When no automation tool is available, clearly state that monitoring was not created and provide the follow-up prompt that should be scheduled elsewhere.

## Reporting

Keep the final response concise:

- PR/MR inspected.
- Failed workflow/job/step and root cause.
- Files changed.
- Verification run.
- Push result.
- Automation created or blocker encountered.
