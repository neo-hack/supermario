# Comments

Prefer clear code over comments that compensate for confusing structure. Preserve information the code cannot express.

- For confusing code we control, improve names, types, or local structure when that reduces reader load. Do not add wrappers merely to remove a comment.
- Verify external dependency, platform, or protocol constraints against the relevant code or source, and retain necessary explanations of constraints we cannot change. If verification is unavailable, preserve the comment and report the uncertainty.
- Preserve legal or license headers, public API contracts, and issue or RFC links that explain constraints the code cannot express.
- When a constraint has a simple, useful in-scope type, runtime check, test, or lint encoding, use it without changing observable behavior. Delete the comment only after the constraint is fully represented and the comment adds no remaining rationale. Do not introduce complex mechanisms just to remove prose.
- Remove redundant narration and stale investigation notes only after checking that they carry no contract, constraint, or rationale. Keep necessary explanations of non-obvious tradeoffs.
- Do not turn this into a comment-deletion or dead-code campaign; primary unused-code cleanup belongs to `fire`.
- Match the language already used in nearby comments.
