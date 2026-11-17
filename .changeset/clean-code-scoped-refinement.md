---
"supermario": minor
---

Default clean-code to the current diff against the base branch when no scope is given, and drop the `iterations` argument: passes repeat with no limit until none finds a worthwhile simplification. Snapshot each file before a pass edits it so a failed pass can be undone without touching user changes or the index. With no verification available, run one restricted pass and report it as unverified. Refine naming, function, and comment guidance around reader load, preserve verified constraints and public contracts, and encode constraints only when a simple in-scope solution is useful. Classify verification failures before undoing only the current pass's edits. Replace wording assertions with reference-file integrity checks and an explicitly unexecuted behavioral acceptance checklist; retain shared metadata validation.
