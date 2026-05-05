---
description: Create a GitHub Pull Request from current branch changes
agent: build
---

## Step 1: Detect PR Template

Search the project for a PR template in this order:

1. `.github/PULL_REQUEST_TEMPLATE.md`
2. `.github/PULL_REQUEST_TEMPLATE/*.md` (pick the first match)
3. `PULL_REQUEST_TEMPLATE.md` (project root)
4. `docs/PULL_REQUEST_TEMPLATE.md`

If a template is found, read its contents and use it as the base structure for the PR body. Preserve all template sections and fill them in based on the actual changes.

If no template is found, proceed with the default format (Step 4).

## Step 2: Gather Context

Run these in parallel:

- `git status` — see working tree state
- `git diff --staged` — staged changes
- `git diff` — unstaged changes
- `git log --oneline -20` — recent commits on current branch
- `git remote -v` — confirm remote and owner/repo
- `git branch --show-current` — current branch name

## Step 3: Analyze Changes

From the gathered context:

1. Summarize all commits and diffs into a coherent narrative.
2. Identify the type of change: feature, bugfix, refactor, docs, chore, etc.

## Step 4: Generate PR Title and Body

**Title** (≤72 chars, imperative mood):
Format: `<type>(<scope>): <short description>`
Example: `feat(auth): add OAuth2 login flow`

**Body** — use the template if found, otherwise this default structure:

```markdown
## Summary
<1-3 bullet points summarizing what this PR does>

## Changes
- <key change 1>
- <key change 2>
- ...

## Test Plan
<how to verify these changes>

## Screenshots (if applicable)
<before/after for visual changes>
```

## Step 5: Create the Pull Request

Execute:

```bash
gh pr create --title "<title>" --body "<body>"
```

If the body is large, write it to a temp file first:

```bash
gh pr create --title "<title>" --body <(cat <<'EOF'
<body>
EOF
)
```

If the current branch has no remote tracking branch, push first:

```bash
git push -u origin HEAD
```

Then retry the `gh pr create` command.

## Step 6: Verify

After creation, run `gh pr view <number>` to confirm the PR was created successfully and show the user the URL.
