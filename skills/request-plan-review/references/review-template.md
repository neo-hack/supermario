# Automated Review Template

Use this reference when `request-plan-review` runs automated markdown reviews.
Each external reviewer must receive a prompt that requires this output format.
The renderer parses this format and converts findings into HTML comments.

## Reviewer Instructions

Review the source markdown plan or spec. Do not review the rendered HTML.
The review prompt must provide both the source path and the full markdown
contents. Use the provided source path in every `Location:` field.

Focus on:

- Executability gaps.
- Missing steps.
- Contradictions.
- Risky assumptions.
- Missing tests or weak verification.
- Unclear ownership or unclear file boundaries.
- Steps that are too vague for another agent to execute safely.

Do not rewrite the source document. Return only concrete findings that are
tied to source markdown line numbers.

## Finding Template

Every finding must use this exact markdown shape:

```markdown
### Finding: <short title>
Severity: <critical|high|medium|low|note>
Location: <source-path>:<line-or-start-end>
Quote:
> <short source quote>

Comment:
<specific actionable review comment>
```

Rules:

- `Severity` must be one of `critical`, `high`, `medium`, `low`, or `note`.
- `Location` must use the source markdown path and a 1-indexed line number or
  line range.
- `Quote` should be a short excerpt from the source markdown at that location.
- `Comment` should explain the problem and the concrete fix.
- Use one `### Finding:` block per issue.
- If there are no findings, return exactly `No findings.`

## Example

```markdown
### Finding: Missing failure path
Severity: high
Location: docs/superpowers/plans/example.md:42-48
Quote:
> generated HTML has no source-line annotations

Comment:
This step assumes the command succeeds but does not define what to do when the
generated HTML is missing source-line annotations. Add an explicit fallback or
failure condition before the commit step.
```

## No Findings Template

```markdown
No findings.
```
