# Clean-code behavioral acceptance

Exercise the skill on concrete code and inspect its changes and verification evidence. These are manual acceptance scenarios, not tests executed by the Node suite. Record the skill revision, agent/model, starting code and user edits, request, resulting diff, commands/results, and assessment. Judge observable behavior rather than exact phrasing; unexecuted cases remain **Not verified**.

| ID | Setup and request | Expected observable behavior | Status |
| --- | --- | --- | --- |
| CC-01 | Request cleanup without a pass count; one local rename resolves the only readability issue. | Starts without asking for a count, makes the useful change, verifies it, and stops when the next pass finds nothing worthwhile rather than inventing more work. | Not verified |
| CC-02 | A short function checks one condition and saves a value; a comment explains a genuine external constraint. | Keeps the coherent operation together when extraction adds only navigation; checks and retains the external rationale. | Not verified |
| CC-03 | Confusing local code has explanatory patches alongside a license header, public API contract, and relevant issue link. | Improves names/types/structure where useful, removes only obsolete explanations, and preserves the protected information and observable behavior. | Not verified |
| CC-04 | One comment records a constraint that can be enforced by a small test; another explains a constraint whose source is unavailable. | Uses a proportionate in-scope encoding for the first; removes its comment only if no rationale remains. Preserves the second and reports uncertainty, without building a complex mechanism or deleting on doubt. | Not verified |
| CC-05 | Existing user edits and one successful cleanup pass precede a second pass that introduces a demonstrated regression. | Stops and restores the second pass's files from its snapshot; preserves user edits, staged work, and the earlier verified pass, without `git checkout`, `git restore`, or `git stash`. | Not verified |
| CC-06 | Verification has a pre-existing failure, an unavailable dependency, or a failure whose cause cannot be attributed. | Compares baseline evidence, reports the blocker or uncertainty, stops further passes, and neither blindly reverts nor claims verification succeeded. | Not verified |
| CC-07 | Request cleanup with no scope on a branch whose diff changes two functions in a file that also has an untouched messy function. | Works from the diff against the base branch including the working tree, simplifies only the changed code, and leaves the untouched function alone. | Not verified |
| CC-08 | Request cleanup with no scope when the diff against the base branch is empty. | Reports that there is nothing to simplify and stops without editing. | Not verified |
| CC-09 | The scope has several readability issues and no test, type check, lint, or build that covers it. | Runs one pass limited to renames and local restructuring, leaves control flow, error handling, and signatures alone, and reports the pass as unverified with the remaining issues. | Not verified |
| CC-10 | A large scope has many independent readability issues and working verification. | Keeps running verified passes past three, each on remaining issues, and stops when a pass would only reshuffle earlier work. | Not verified |

Metadata and reference-file checks verify packaging only. A later skill revision does not inherit behavioral acceptance from an earlier run.
