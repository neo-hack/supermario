---
name: pr-comments
description: Use when the user wants to fetch, list, or check GitHub pull request review comments — inline code-review feedback presented as author / comment / referenced code. Triggers on requests like "show the review comments on PR 123", "what did reviewers say", "check the PR feedback", "获取/查看 PR 的 review 评论", "代码评审意见", even when the word "review" is the only hint.
---

# PR Comments

Fetch a GitHub pull request's **inline review comments** (the ones attached to diff lines) and present each as 作者 / 评论内容 / 对应代码 — author, comment body, and the code the reviewer was looking at. If the `receiving-code-review` skill is installed, hand off to it afterwards to judge whether each comment actually holds.

## Workflow

### 1. Resolve the PR

- If the user named a PR number or URL, use that number.
- Otherwise resolve the current branch's PR:

  ```bash
  gh pr view --json number,title,url,author
  ```

- If the current branch has no open PR, say so and stop. Do not guess a number.

### 2. Fetch the review comments

Inline review comments come from the REST API. `gh pr view --comments` returns conversation comments and will silently miss every inline comment, so do not use it as the source:

```bash
repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
gh api repos/$repo/pulls/$NUMBER/comments --paginate \
  --jq '.[] | {id: .id, author: .user.login, created: .created_at, path: .path,
               line: (.line // .original_line), outdated: (.position == null),
               reply_to: .in_reply_to_id, body: .body, hunk: .diff_hunk}'
```

`--paginate` matters: this endpoint returns 30 comments per page by default.

### 3. Organize

- Group comments by `path`, files sorted alphabetically; within a file order by `line`, then `created`.
- Replies have `reply_to` set: nest them under the parent comment (match `reply_to` to a comment's `id`) instead of listing them as separate entries.
- Mark comments whose `outdated` is true — the diff side has changed since; the code shown no longer matches HEAD.

### 4. Output format

One section per file, one block per comment. Render the three field labels in the conversation language (Chinese: 作者 / 评论内容 / 对应代码):

````markdown
# PR #14783 Review Comments — 3 条评论 · 2 个文件

## pkg/cmd/release/download/download.go

### @Copilot · L600 · 2026-10-21

**评论内容：**
🛑 Requirement: Preserve stdout behavior without --verify

Downloading an asset named `-` into the current directory now creates a file instead of streaming its bytes to stdout, even without `--verify`. Existing pipelines receive no data, and an existing file can make a previously successful invocation fail. The description documents this break but supplies no maintainer approval, as required by docs/command-development.md:66-69. Preserve the legacy route for ordinary downloads and keep staging file-only, or obtain explicit approval for the compatibility change. Update the regression test to reflect the agreed behavior.

**对应代码：**
```diff
+// isStdout reports whether output goes to standard output. Only an explicit
+// "--output -" means that; an asset that happens to be named "-" is a file.
+func (w *destinationWriter) isStdout() bool {
+	return w.file == "-"
```

> ↳ 作者：@maintainer —— good catch, fixed in 4f2ab1. （回复嵌在父评论下）
````

Quote each comment body verbatim and in full — never elide it with `…` or `[snip]`. If the body itself contains a fenced code block, nest fences with more backticks so it renders intact.

Rules for the code block:

- Fence the hunk as `diff` so `+`/`-` lines highlight. Drop the `@@ … @@` header unless it aids orientation.
- For current (non-outdated) comments, the commented line is the **last line of the hunk** — that is the line under discussion.
- Hunks can be huge (a new file yields a whole-file hunk). If the hunk exceeds ~20 lines, keep the last ~15 lines and add a one-line note like `（已截取 hunk 末尾 15 行，完整上下文见 PR）`.

### 5. Assess whether the comments hold

This step is conditional. Check the available-skills list first, and run it only if `receiving-code-review` is installed:

- **If it exists:** load `receiving-code-review` and check each comment against the current code — does the problem it raises actually exist there, and is the requested change sound? Give one verdict per comment — 成立 / 部分成立 / 不成立 (valid / partially valid / invalid) — backed by the code evidence that produced it.
- **If it does not exist:** end after the formatted list. Mentioning the missing skill is optional; never improvise the assessment with ad-hoc reasoning in its place.
- Also skip this step when the user explicitly asked to just view the comments, or when there are zero comments.

### Empty and edge cases

- Zero comments: say so plainly, then offer to check general (non-inline) feedback with `gh pr view $NUMBER --json reviews,comments` — many PRs carry only approval reviews or conversation comments.
- Pending (unsubmitted) review comments are invisible to the API; only submitted reviews appear.
- Resolved/unresolved thread status needs GraphQL; fetch it only if the user asks.
- If the API call fails with 404, re-check the repo (`gh repo view`) — the PR may live on the base repo of a fork.

## Keep Out

- Do not dump raw JSON at the user; the API call is plumbing, the formatted list is the product.
- Do not paraphrase comment bodies into vague summaries — quote them verbatim and in full; summarizing is a separate step the user can request.
- Do not include conversation/issue comments unless the user asks for them; they have no code anchor.
