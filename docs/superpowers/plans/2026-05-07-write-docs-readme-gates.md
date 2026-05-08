# Write Docs README Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten `write-docs` so references are read before drafting, README badges are required and verified, and README no longer grows an architecture section.

**Architecture:** Update only the existing Markdown skill files in `skills/write-docs/`. Put global hard-gate behavior in `SKILL.md`, README-specific identity and boundary behavior in `references/readme.md`, and generic heading guidance in `references/elements-of-style.md`. Keep this follow-up rule-based: no scripts, generated README rewrite, or process-log schema.

**Tech Stack:** Markdown skills, XML-style instruction blocks, repository verification with `rg`, optional pressure testing with subagents.

---

## Scope Check

The spec covers one existing skill and three files. It does not need decomposition.

Important workspace constraint: the repo may already contain unrelated changes in `DESIGN.md`, `skills/mermaid-course/SKILL.md`, `mockup/`, and `skills/mermaid-course/references/DESIGN.md`. Do not edit, stage, commit, or revert those files.

## File Structure

- Modify: `skills/write-docs/SKILL.md`
  - Add `<required_reading>`.
  - Add `## File Organization`.
  - Add badge-source scanning to repository fact gathering.
  - Require final reports to list references read and badge sources checked.
- Modify: `skills/write-docs/references/readme.md`
  - Add `<readme_identity>`.
  - Add `<readme_boundaries>`.
  - Make plain Markdown Shields.io badges required.
  - Remove README guidance that encourages a body `## Architecture` section.
- Modify: `skills/write-docs/references/elements-of-style.md`
  - Stop presenting `Architecture` as a generic good heading for README.
  - State that document-specific references override generic heading examples.

## Task 1: Add Required Reading And Resource Map

**Files:**
- Modify: `skills/write-docs/SKILL.md`

- [ ] **Step 1: Inspect current `SKILL.md`**

Run:

```bash
sed -n '1,220p' skills/write-docs/SKILL.md
```

Expected: the file contains the current workflow, required references table, repository fact scan, self-check, report, and common mistakes sections.

- [ ] **Step 2: Insert `<required_reading>` after the overview paragraph**

In `skills/write-docs/SKILL.md`, insert this block immediately after the sentence `Write useful project documentation by reading the repository first. Default to improving existing docs before creating new files.`:

```markdown
<required_reading>
Before drafting or editing any document, read:
- `references/elements-of-style.md`
- the matching document reference for the target type

Required mapping:
- `README.md` -> `references/readme.md`
- `ARCHITECTURE.md` -> `references/architecture.md`
- `CONTRIBUTING.md` -> `references/contributing.md`
- `TUTORIAL.md` -> `references/tutorial.md`

For unsupported document types, read `references/elements-of-style.md`,
choose the closest supported reference, and tell the user which fallback
reference was used.

Do not draft until required reading is complete.
The final response must list the references read.
</required_reading>
```

- [ ] **Step 3: Add `## File Organization` before `## Supported Documents`**

In `skills/write-docs/SKILL.md`, insert this section before `## Supported Documents`:

````markdown
## File Organization

```text
skills/write-docs/
  SKILL.md                         # Main workflow, hard gates, reporting rules
  references/
    elements-of-style.md           # General writing rules for all docs
    readme.md                      # README identity, badge rules, boundaries
    architecture.md                # System boundary, modules, flows, decisions
    contributing.md                # Setup, checks, PR workflow, option changes
    tutorial.md                    # Goal-led teaching path
```
````

- [ ] **Step 4: Update repository fact scanning bullets**

In `skills/write-docs/SKILL.md`, replace this bullet:

```markdown
- CI, license, package, or version sources for badges.
```

with:

```markdown
- Badge sources: `package.json`, lockfiles, `LICENSE*`, `.github/workflows/*`, runtime/build config, existing docs, and package metadata.
```

- [ ] **Step 5: Add README hard-block note to Phase 4**

In `skills/write-docs/SKILL.md`, after `Use the matching reference and references/elements-of-style.md.`, add:

```markdown
For README targets, obey the extra hard blocks in `references/readme.md`:

- `<readme_identity>`
- `<readme_boundaries>`
```

- [ ] **Step 6: Tighten self-check bullets**

In `skills/write-docs/SKILL.md`, replace the current README badge self-check bullet:

```markdown
- README badges are true and restrained.
```

with:

```markdown
- README includes at least one verified plain Markdown Shields.io badge, or drafting stopped because no badge source could be verified.
```

Then add this bullet immediately after it:

```markdown
- README does not contain a `## Architecture` section.
```

- [ ] **Step 7: Tighten final report bullets**

In `skills/write-docs/SKILL.md`, replace the Phase 6 final response list:

```markdown
- Which document changed.
- Which repository facts supported the content.
- Which details could not be verified.
- Which checks or commands were run.
```

with:

```markdown
- Which document changed.
- References read.
- Which repository facts supported the content.
- Badge sources checked, when the target is README.
- Missing facts that blocked required identity elements, when applicable.
- Whether README boundaries were enforced, when the target is README.
- Which checks or commands were run.
```

- [ ] **Step 8: Verify `SKILL.md` changes**

Run:

```bash
rg -n "<required_reading>|## File Organization|Badge sources|<readme_identity>|<readme_boundaries>|References read|Badge sources checked|## Architecture" skills/write-docs/SKILL.md
```

Expected: matches for the required reading block, file organization, badge source scanning, README hard-block note, final report requirements, and README architecture self-check.

- [ ] **Step 9: Commit task 1**

```bash
git add skills/write-docs/SKILL.md
git commit -m "docs(write-docs): require reading references"
```

## Task 2: Add README Identity And Boundaries

**Files:**
- Modify: `skills/write-docs/references/readme.md`

- [ ] **Step 1: Inspect current README reference**

Run:

```bash
sed -n '1,260p' skills/write-docs/references/readme.md
```

Expected: the file contains reader questions, recommended shape, badge guidance, quick start, usage, configuration, development, documentation map, cat signature, and self-check.

- [ ] **Step 2: Insert `<readme_identity>` after the opening paragraph**

In `skills/write-docs/references/readme.md`, insert this block immediately after the sentence `README is the project entry point. It should help a new reader decide whether the project matters to them, run it quickly, and find deeper docs.`:

```markdown
<readme_identity>
README must open with project identity:
- title
- at least one verified Markdown Shields.io badge
- one sharp description sentence

Use plain Markdown badge syntax, not HTML.
If no badge source can be verified, stop and report the missing source
instead of silently omitting badges.

Future visual identity additions, such as a hero image or product screenshot,
belong in this block and require a real asset source.
</readme_identity>
```

- [ ] **Step 3: Insert `<readme_boundaries>` after `<readme_identity>`**

Immediately after the `<readme_identity>` block, add:

```markdown
<readme_boundaries>
Do not create a `## Architecture` section in README.
README is the project entry point, not the full architecture document.

If architecture details matter, link to `ARCHITECTURE.md` from `## Documentation`
only when that file exists.

Do not turn README into a full API reference, architecture explanation, or
large directory walkthrough. Keep deep explanations in dedicated docs.
</readme_boundaries>
```

- [ ] **Step 4: Update recommended shape**

In `skills/write-docs/references/readme.md`, replace the current `Useful sections:` list with:

```markdown
Useful sections:

- Title.
- Required Markdown Shields.io badge block.
- One sharp description sentence.
- Quick Start.
- Usage.
- Configuration.
- Development.
- Documentation, only if real docs exist.
- Cat signature.
```

Then replace:

```markdown
For small projects, combine sections. For complex projects, keep README short and link to `ARCHITECTURE.md`, `CONTRIBUTING.md`, or `TUTORIAL.md`.
```

with:

```markdown
For small projects, combine sections. For complex projects, keep README short and link to deeper docs only when those files exist.
```

- [ ] **Step 5: Rewrite badge introduction**

In `skills/write-docs/references/readme.md`, replace this sentence:

```markdown
Use badges only when they communicate true project facts.
```

with:

```markdown
README must include at least one verified plain Markdown Shields.io badge near the top. Use badges only when they communicate true project facts.
```

Then replace this sentence:

```markdown
Personal badges are allowed after functional badges, but keep them rare.
```

with:

```markdown
Personal badges are allowed after functional badges, but keep them rare and secondary.
```

- [ ] **Step 6: Add proactive badge source scanning**

In `skills/write-docs/references/readme.md`, after the badge examples block, insert:

```markdown
Badge source scanning is mandatory during repository fact gathering.

Useful sources:

- `package.json` for package name, version, package manager, engines, and scripts.
- lockfiles for package manager.
- `LICENSE*` for license.
- `.github/workflows/*` for CI, build, and test badges.
- runtime or build config such as `tsup.config.ts`, `tsconfig.json`, `pyproject.toml`, `Cargo.toml`, or `go.mod`.
- existing docs or package metadata for docs or status badges.

If a source exists but has not been read, the badge is not verified.
```

- [ ] **Step 7: Tighten badge rules**

In `skills/write-docs/references/readme.md`, replace this rule:

```markdown
- If repository facts are unavailable, do not add badges.
```

with:

```markdown
- If no badge source can be verified, stop and report the missing source instead of silently omitting badges.
```

Add this rule immediately after it:

```markdown
- Use plain Markdown badge syntax, not HTML.
```

- [ ] **Step 8: Update Documentation Map**

In `skills/write-docs/references/readme.md`, replace:

```markdown
If deeper docs exist, link them:
```

with:

```markdown
If deeper docs exist, link them. Only link files that actually exist:
```

After the documentation map example, add:

```markdown
Do not create a `## Architecture` body section in README. Link to `ARCHITECTURE.md` from `## Documentation` only when that file exists.
```

- [ ] **Step 9: Tighten README self-check**

In `skills/write-docs/references/readme.md`, replace these self-check bullets:

```markdown
- Badges are true and restrained.
- Badges are omitted when no badge source was checked.
```

with:

```markdown
- At least one verified plain Markdown Shields.io badge appears near the top.
- Badge sources were checked and can be named.
- If no badge source was verified, drafting stopped and reported the missing source.
- README does not contain a `## Architecture` section.
```

- [ ] **Step 10: Verify README reference changes**

Run:

```bash
rg -n "<readme_identity>|<readme_boundaries>|Required Markdown Shields.io badge block|plain Markdown|Badge source scanning is mandatory|Do not create a `## Architecture`|Only link files that actually exist" skills/write-docs/references/readme.md
```

Expected: matches for both XML-style blocks, required badge wording, source scanning, and README architecture boundary.

- [ ] **Step 11: Commit task 2**

```bash
git add skills/write-docs/references/readme.md
git commit -m "docs(write-docs): require readme identity"
```

## Task 3: Tighten Generic Style Headings

**Files:**
- Modify: `skills/write-docs/references/elements-of-style.md`

- [ ] **Step 1: Inspect current style reference**

Run:

```bash
sed -n '1,180p' skills/write-docs/references/elements-of-style.md
```

Expected: the file contains core rules, strong sentences, structure, facts first, options tables, and personality rules.

- [ ] **Step 2: Replace the generic heading list**

In `skills/write-docs/references/elements-of-style.md`, replace this list:

```markdown
- Quick Start
- Configuration
- Development
- Testing
- Architecture
- Release Process
- Troubleshooting
```

with:

```markdown
- Quick Start
- Configuration
- Development
- Testing
- Release Process
- Troubleshooting
```

- [ ] **Step 3: Add document-specific override note**

Immediately after the heading list, add:

```markdown
Document-specific references override this generic heading list. For example, `Architecture` is appropriate in `ARCHITECTURE.md`, but it is not a default README heading.
```

- [ ] **Step 4: Verify style changes**

Run:

```bash
rg -n "Document-specific references override|not a default README heading|^- Architecture$" skills/write-docs/references/elements-of-style.md
```

Expected: matches for the override note and no standalone `- Architecture` bullet. The `rg` command exits non-zero if there is no standalone `- Architecture`; that is acceptable only if the override note matched before it. If the command output still shows `- Architecture`, remove it and rerun.

- [ ] **Step 5: Commit task 3**

```bash
git add skills/write-docs/references/elements-of-style.md
git commit -m "docs(write-docs): narrow generic headings"
```

## Task 4: Verify End-To-End Behavior

**Files:**
- Verify: `skills/write-docs/SKILL.md`
- Verify: `skills/write-docs/references/readme.md`
- Verify: `skills/write-docs/references/elements-of-style.md`

- [ ] **Step 1: Verify all required markers exist**

Run:

```bash
rg -n "<required_reading>|## File Organization|<readme_identity>|<readme_boundaries>|plain Markdown Shields.io|Badge source scanning is mandatory|References read|Badge sources checked" skills/write-docs/SKILL.md skills/write-docs/references/readme.md skills/write-docs/references/elements-of-style.md
```

Expected: output includes `SKILL.md`, `references/readme.md`, and the required XML-style blocks and reporting text.

- [ ] **Step 2: Verify README no longer encourages architecture sections**

Run:

```bash
rg -n "## Architecture|^- Architecture\\.|^- Architecture$|Architecture section" skills/write-docs/references/readme.md skills/write-docs/references/elements-of-style.md
```

Expected: output may include `Do not create a \`## Architecture\` section` and `not a default README heading`, but must not include a positive recommendation to add an architecture section to README.

- [ ] **Step 3: Verify badge requirement is fail-closed**

Run:

```bash
rg -n "must include at least one verified|stop and report the missing source|If a source exists but has not been read, the badge is not verified" skills/write-docs/references/readme.md
```

Expected: all three rules appear.

- [ ] **Step 4: Verify unrelated files remain unstaged**

Run:

```bash
git diff --cached --name-only
git status --short
```

Expected before final commit: staged files, if any, are only under `skills/write-docs/`. Existing unrelated paths such as `DESIGN.md`, `skills/mermaid-course/SKILL.md`, `mockup/`, and `skills/mermaid-course/references/DESIGN.md` must not be staged by this plan.

- [ ] **Step 5: Run pressure scenario manually or with a subagent**

Use this scenario:

```text
Read the write-docs skill and answer without editing files:
Write a README for packages/cli based on the readme-process failure.
What references must be read before drafting?
What badge sources must be checked?
Should README contain a ## Architecture section?
```

Expected answer:

```text
Must read references/elements-of-style.md and references/readme.md before drafting.
Must check badge sources such as package.json, lockfiles, LICENSE*, .github/workflows/*, runtime/build config, existing docs/package metadata.
README must not contain a ## Architecture section; it may link ARCHITECTURE.md from Documentation only if that file exists.
```

- [ ] **Step 6: Commit verification polish if needed**

If verification required small fixes, stage only `skills/write-docs/` files and commit:

```bash
git add skills/write-docs/SKILL.md skills/write-docs/references/readme.md skills/write-docs/references/elements-of-style.md
git commit -m "docs(write-docs): verify readme gates"
```

If all verification passed and there are no additional changes, do not create an empty commit.

## Spec Coverage Review

- `<required_reading>` for all document types: Task 1.
- `## File Organization`: Task 1.
- README required Markdown Shields.io badge block: Task 2.
- README badge source scanning: Task 1 and Task 2.
- README no `## Architecture` body section: Task 2 and Task 4.
- Elements of Style no longer presents `Architecture` as a default README heading: Task 3.
- Final report lists references and badge sources: Task 1.
- No process-log schema, validation script, HTML badge output, or generated README rewrite: no task adds those.
