# Successive Refinement

Each pass leaves the code simpler than it found it.

- Start with names and local structure. Then extract functions. Then flatten control flow.
- DRY: one rule, one place. Extract only when the duplication is the same rule, not similar-looking code.
- KISS: prefer the obvious local fix over a new abstraction.
- YAGNI: do not add extension points, extra types, or layers for a future need.
- One class of issue per pass when several issues remain.
- Re-read the code after each pass. Do not keep a stale plan.
- Stop when a pass would only reshuffle style or rename without adding clarity.
- Verification after every pass is part of the refinement, not a final extra.
- Leave remaining issues in the report instead of forcing a speculative rewrite.
