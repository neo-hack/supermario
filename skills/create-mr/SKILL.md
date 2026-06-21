---
name: create-mr
description: Use when creating a GitHub pull request or merge request from the current branch, especially when a project PR template may exist. Creates the PR with GitHub CLI, verifies it, and arranges a scheduled CI monitor so the MR/PR is followed until required checks pass or a failure needs repair.
---

# Create MR

Create a GitHub pull request from the current branch by reading the repository state, respecting any PR template, verifying the created PR, and arranging follow-up monitoring for CI.

## Workflow

### 1. Detect PR Template

Search for a PR template in this order:

1. `.github/PULL_REQUEST_TEMPLATE.md`
2. `.github/PULL_REQUEST_TEMPLATE/*.md` (pick the first match)
3. `PULL_REQUEST_TEMPLATE.md`
4. `docs/PULL_REQUEST_TEMPLATE.md`

If a template is found, read it and use it as the base structure for the PR body. Preserve all template sections and fill them from the actual changes.

If no template is found, use the default body format below.

### 2. Gather Context

Run these checks, parallelizing file reads and git commands where possible:

```bash
git status
git diff --staged
git diff
git log --oneline -20
git remote -v
git branch --show-current
```

### 3. Analyze Changes

From the gathered context:

1. Summarize commits and diffs into a coherent narrative.
2. Identify the change type: feature, bugfix, refactor, docs, chore, or test.
3. Note verification evidence already present in the branch.

### 4. Check Changeset Requirement

Before pushing or creating the PR, check whether the repository uses Changesets:

```bash
test -d .changeset && test -f .changeset/config.json
rg -n '"@changesets/cli"|changeset' package.json pnpm-lock.yaml package-lock.json yarn.lock 2>/dev/null
```

If Changesets is not configured, skip this step.

If Changesets is configured, inspect the staged, unstaged, and unpushed
branch diff that will be included in the PR. When the diff includes any
meaningful content change to a versioned package or workspace —
including source code, skills, documentation, or configuration — and no
matching `.changeset/*.md` file is already included, use the `changeset`
skill before pushing.

Do not duplicate package eligibility, package-name, or bump-selection logic here. Let the `changeset` skill derive package names, release impact, and validation commands from repository metadata and Changesets config.

Include any generated `.changeset/*.md` file in the branch before running `git push` and `gh pr create`.

### 5. Generate PR Title and Body

Title requirements:

- 72 characters or fewer.
- Imperative mood.
- Conventional commit style: `<type>(<scope>): <short description>`.

Example:

```text
feat(auth): add OAuth2 login flow
```

Default body when no template exists:

```markdown
## Summary
- <1-3 bullets summarizing what this PR does>

## Changes
- <key change 1>
- <key change 2>

## Test Plan
- <how to verify these changes>

## Screenshots
<before/after for visual changes, or omit if not applicable>
```

## Create the Pull Request

Use GitHub CLI:

```bash
gh pr create --title "<title>" --body "<body>"
```

If the body is large, write it to a temporary file and pass `--body-file`.

If the current branch has no remote tracking branch, push first:

```bash
git push -u origin HEAD
```

Then retry `gh pr create`.

## Verify

After creation, run:

```bash
gh pr view <number>
```

For machine-readable verification, prefer:

```bash
gh pr view <number> --json number,title,url,state,headRefName,baseRefName
```

Capture the PR number, URL, head branch, base branch, and current head SHA for the CI monitor.

## Monitor PR CI

After verifying the PR, arrange a scheduled follow-up to check CI until all required checks pass or a real failure needs repair.

When running in the Codex app and `automation_update` is available, use that tool. If it is not in the active tool list but `tool_search` is available, discover it with a query such as `automation_update recurring monitor`.

If no automation tool is available in the current agent environment, do not claim a monitor was created. Instead, provide a concise follow-up prompt and suggested check interval for the host system or human operator to schedule.

Prefer a short `heartbeat` with `destination: "thread"` for same-thread follow-up shortly after PR creation. Use `cron` only when the monitoring should run independently of this thread or workspace.

Set the automation prompt to include:

- PR number and URL.
- Repository path.
- Head branch, base branch, and last pushed SHA.
- Instruction to fetch PR status with `gh pr view <number> --json statusCheckRollup,headRefOid,state,url`.
- Instruction to inspect failed runs with `gh run list` and `gh run view --log-failed`.
- Instruction to stop and report success once all required checks pass.
- Instruction to use the `fix-ci` skill if checks fail and a code or configuration repair is needed.
- Instruction to schedule another follow-up only when checks are still pending or a pushed repair needs another CI rerun.

When an automation tool is available, do not hand-write raw automation directives in the final response; use the tool call. When no automation tool is available, clearly state that monitoring was not created and include the follow-up prompt that should be scheduled elsewhere.

Report the PR URL and whether CI monitoring was created or handed off.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Ignoring a PR template | Search all supported template locations first. |
| Writing a title from memory | Base the title on the actual diff and commits. |
| Claiming tests passed without evidence | Put only verified commands in the test plan. |
| Omitting a required changeset | When Changesets is configured, any content change to a versioned package needs a `.changeset/*.md`. Skills and docs count too. |
| Forgetting to push the branch | Push with `git push -u origin HEAD`, then create the PR. |
| Forgetting post-create CI follow-up | Arrange a monitor after PR verification, or clearly hand off the follow-up prompt if no automation tool exists. |
