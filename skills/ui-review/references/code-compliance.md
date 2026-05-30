# Code Compliance Review

Use this reference when the user asks for code-level UI compliance review or when source-code inspection is explicitly part of the UI review.

Do not keep a local copy of the full rules. Fetch the latest Web Interface Guidelines at review time and treat the fetched content as the authority:

```text
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

## How It Works

1. Fetch the guidelines source URL above before each code compliance review.
2. Read the specified files or infer affected UI files from the requested scope.
3. Apply all rules from the fetched guidelines.
4. Use the output format and severity guidance from the fetched guidelines.
5. Classify violations in the `ui-review` report as `Code compliance issue`.

If the fetch fails, say that the latest Web Interface Guidelines could not be loaded and skip code compliance rather than using stale local rules.

## When To Use

Use this reference for:

- Source-code UI review
- Accessibility implementation checks
- Form, focus, animation, typography, performance, and interaction compliance
- Reviewing changed UI files in a PR or branch

Skip this reference when:

- There is no source-code access
- The user only asked for visual/design-reference review
- The review is design-reference-only
- The user explicitly asks not to run code compliance checks

## Finding Integration

When including guideline violations in a broader `ui-review` report, use this type:

```markdown
Type: Code compliance issue
```

Use `file:line` evidence whenever possible, matching the format required by the fetched guidelines.
