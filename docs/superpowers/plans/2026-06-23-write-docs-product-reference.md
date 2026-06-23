# Write Docs PRODUCT Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add first-class `PRODUCT.md` support to `write-docs`, backed by a product reference that adapts the five layers from *The Elements of User Experience* into practical documentation constraints.

**Architecture:** Keep `skills/write-docs/SKILL.md` responsible for document routing, required reference mapping, fact scanning, and final reporting rules. Add `skills/write-docs/references/product.md` as the focused product-document reference for creating, rewriting, and auditing `PRODUCT.md`. Verification is text-based because this skill is Markdown guidance, not runtime code.

**Tech Stack:** Markdown skill files, shell verification with `rg`, `test`, `git diff --check`, and git commits.

---

## Scope Check

The approved spec covers one small subsystem: extending the existing `write-docs` skill with `PRODUCT.md` routing and a new product reference. It does not need to be split into multiple implementation plans.

## File Structure

- Modify: `skills/write-docs/SKILL.md`
  - Add `PRODUCT.md` to the skill description, required-reading mapping, file organization, supported documents, required references, multi-document ordering, documentation search commands, product-specific fact scanning, self-check rules, reporting rules, and common mistakes table.
- Create: `skills/write-docs/references/product.md`
  - Define how to write and audit `PRODUCT.md`.
  - Translate Strategy, Scope, Structure, Skeleton, and Surface into concrete documentation constraints.
  - Preserve repository-fact grounding and mark assumptions clearly.
- No automated test files are needed.
  - This repository represents skills as Markdown instructions.
  - Verification uses deterministic text checks and Markdown diff checks.

## Task 1: Route `PRODUCT.md` Through `write-docs`

**Files:**
- Modify: `skills/write-docs/SKILL.md`

- [ ] **Step 1: Confirm `PRODUCT.md` is not currently supported**

Run:

```bash
rg -n "PRODUCT.md|references/product.md|Write PRODUCT.md|product intent|product notes" skills/write-docs/SKILL.md
```

Expected: command exits with status 1 and prints no matches.

- [ ] **Step 2: Patch `SKILL.md` routing and workflow text**

Apply this patch:

```patch
*** Begin Patch
*** Update File: skills/write-docs/SKILL.md
@@
-description: Use when asked to create, rewrite, audit, or maintain README, ARCHITECTURE, CONTRIBUTING, TUTORIAL, docs navigation, project options, badges, or documentation signatures.
+description: Use when asked to create, rewrite, audit, or maintain README, PRODUCT, ARCHITECTURE, CONTRIBUTING, TUTORIAL, docs navigation, project options, badges, or documentation signatures.
@@
 - `README.md` -> `references/readme.md`
+- `PRODUCT.md` -> `references/product.md`
 - `ARCHITECTURE.md` -> `references/architecture.md`
 - `CONTRIBUTING.md` -> `references/contributing.md`
 - `TUTORIAL.md` -> `references/tutorial.md`
@@
 - "Improve the README"
+- "Write PRODUCT.md"
+- "Audit product docs"
 - "Create architecture docs"
@@
 - Link to mixed-case docs paths without checking the actual filenames.
+- Turn product documentation into unsupported personas, vague strategy, or a feature wishlist.
@@
     elements-of-style.md           # General writing rules for all docs
     readme.md                      # README identity, badge rules, boundaries
+    product.md                     # Product intent, UX layers, scope, flows
     architecture.md                # System boundary, modules, flows, decisions
     contributing.md                # Setup, checks, PR workflow, option changes
     tutorial.md                    # Goal-led teaching path
@@
 README.md
+PRODUCT.md
 ARCHITECTURE.md
 CONTRIBUTING.md
 TUTORIAL.md
@@
 | Target | Reference |
 | --- | --- |
 | `README.md` | `references/readme.md` |
+| `PRODUCT.md` | `references/product.md` |
 | `ARCHITECTURE.md` | `references/architecture.md` |
 | `CONTRIBUTING.md` | `references/contributing.md` |
 | `TUTORIAL.md` | `references/tutorial.md` |
@@
 1. `README.md`
-2. `ARCHITECTURE.md`
-3. `CONTRIBUTING.md`
-4. `TUTORIAL.md`
+2. `PRODUCT.md`
+3. `ARCHITECTURE.md`
+4. `CONTRIBUTING.md`
+5. `TUTORIAL.md`
@@
-git ls-files 'README*' 'ARCHITECTURE*' 'CONTRIBUTING*' 'TUTORIAL*' 'docs/**'
+git ls-files 'README*' 'PRODUCT*' 'ARCHITECTURE*' 'CONTRIBUTING*' 'TUTORIAL*' 'docs/**'
@@
-rg --files -g 'README*' -g 'ARCHITECTURE*' -g 'CONTRIBUTING*' -g 'TUTORIAL*' -g 'docs/**' -g '!node_modules' -g '!vendor' -g '!.git' -g '!dist' -g '!build' -g '!coverage'
+rg --files -g 'README*' -g 'PRODUCT*' -g 'ARCHITECTURE*' -g 'CONTRIBUTING*' -g 'TUTORIAL*' -g 'docs/**' -g '!node_modules' -g '!vendor' -g '!.git' -g '!dist' -g '!build' -g '!coverage'
@@
 - Existing docs and docs navigation.
 - Package, build, and runtime config.
 - Install, development, test, lint, build, and deploy commands.
 - Entry points and important source directories.
 - Badge sources: `package.json`, lockfiles, `LICENSE*`, `.github/workflows/*`, runtime/build config, existing docs, and package metadata.
 - Options, configuration, schema, or environment definitions.
+- Product facts for `PRODUCT.md`: existing product notes, roadmap notes, issue templates, design docs, README positioning, routes, screens, commands, components, prompts, examples, tests, and user-facing configuration.
@@
 git ls-files 'package.json' 'pnpm-lock.yaml' 'package-lock.json' 'yarn.lock' 'pyproject.toml' 'Cargo.toml' 'go.mod' 'Makefile' '.env.example' 'LICENSE*'
 git ls-files | rg 'scripts|dev|test|lint|build|start|serve|deploy'
 git ls-files | rg 'options|config|schema|default|env'
+git ls-files | rg 'product|roadmap|issue|design|route|screen|component|prompt|example|spec|test'
@@
 rg --files -g 'package.json' -g 'pnpm-lock.yaml' -g 'package-lock.json' -g 'yarn.lock' -g 'pyproject.toml' -g 'Cargo.toml' -g 'go.mod' -g 'Makefile' -g '.env.example' -g 'LICENSE*' -g '!node_modules' -g '!vendor' -g '!.git' -g '!dist' -g '!build' -g '!coverage'
 rg -n "scripts|dev|test|lint|build|start|serve|deploy" package.json Makefile pyproject.toml Cargo.toml go.mod 2>/dev/null
 rg -n "options|config|schema|default|env" . -g '!node_modules' -g '!vendor' -g '!.git' -g '!dist' -g '!build' -g '!coverage'
+rg -n "product|roadmap|persona|user|job|journey|flow|route|screen|component|prompt|example|spec|test" . -g '!node_modules' -g '!vendor' -g '!.git' -g '!dist' -g '!build' -g '!coverage'
@@
-Do not invent commands, defaults, paths, badges, options, types, examples, or capabilities. If repository facts are unavailable, say what cannot be verified instead of filling the gap from convention.
+Do not invent commands, defaults, paths, badges, options, types, examples, capabilities, personas, business goals, feature promises, market claims, or roadmap items. If repository facts are unavailable, say what cannot be verified instead of filling the gap from convention.
@@
 - Every options table uses `Option | Type | Default | Example | Description`.
+- `PRODUCT.md` ties product claims to repository facts, user-provided requirements, existing docs, visible UI, or clearly marked assumptions.
+- `PRODUCT.md` covers Strategy, Scope, Structure, Skeleton, and Surface either directly or by an intentional omission.
 - README cat signature appears only at the end.
@@
 - Badge sources checked, when the target is README.
 - Missing facts that blocked required identity elements, when applicable.
 - Whether README boundaries were enforced, when the target is README.
+- Product references read and product facts verified, when the target is `PRODUCT.md`.
 - Which checks or commands were run.
@@
 | Docs links have casual casing | Match real filenames exactly. |
+| Product docs become unsupported personas or vague strategy | Ground product claims in repository facts, user-provided requirements, existing docs, visible UI, or marked assumptions. |
*** End Patch
```

- [ ] **Step 3: Verify `SKILL.md` now routes product docs**

Run:

```bash
rg -n "PRODUCT.md|references/product.md|Write PRODUCT.md|Audit product docs|Product facts|Strategy, Scope, Structure, Skeleton, and Surface" skills/write-docs/SKILL.md
```

Expected: output includes matches in the description, required-reading mapping, supported documents, required references table, workflow ordering, fact scan, self-check, and reporting rules.

- [ ] **Step 4: Verify existing document routing still appears**

Run:

```bash
rg -n "README.md|ARCHITECTURE.md|CONTRIBUTING.md|TUTORIAL.md|references/readme.md|references/architecture.md|references/contributing.md|references/tutorial.md" skills/write-docs/SKILL.md
```

Expected: output still includes all four existing supported documents and their reference files.

- [ ] **Step 5: Commit routing changes**

Run:

```bash
git add skills/write-docs/SKILL.md
git commit -m "feat(write-docs): route product documentation"
```

Expected: commit succeeds with `skills/write-docs/SKILL.md` as the only changed file.

## Task 2: Add the Product Reference

**Files:**
- Create: `skills/write-docs/references/product.md`

- [ ] **Step 1: Confirm the product reference does not exist**

Run:

```bash
test ! -f skills/write-docs/references/product.md
```

Expected: command exits with status 0.

- [ ] **Step 2: Create `references/product.md`**

Create `skills/write-docs/references/product.md` with this exact content:

```markdown
# Product Reference

`PRODUCT.md` explains the product experience a project is trying to create. It should connect user needs, product goals, scope, flows, interface expectations, and surface quality so future work has a product north star.

This reference adapts the five layers from Jesse James Garrett's *The Elements of User Experience* into writing constraints. Do not write a book summary. Use the layers to make product documentation harder to fake and easier to review.

## Reader Questions

Answer these questions when repository facts, existing docs, visible UI, or user-provided requirements support them:

1. Who is the product for?
2. What user need, job, or context makes it worth existing?
3. What product outcome should the experience create?
4. What is included now, explicitly excluded, and deferred?
5. How does a user move through the main experience?
6. What interface model should stay stable as the product changes?
7. What tone, feedback, visual feel, and state behavior should the product preserve?
8. Which assumptions need validation?

If a fact cannot be verified, mark it as an assumption or say it is unknown. Do not invent personas, business goals, market position, future features, or roadmap promises.

## Recommended Shape

Choose sections by project need. Do not force every heading into every `PRODUCT.md`.

Useful sections:

- Product Intent.
- Users and Jobs.
- Experience Principles.
- Scope.
- Structure.
- Key Flows.
- Interface Model.
- Surface and Voice.
- Open Questions.

For small projects, combine sections. For complex products, keep `PRODUCT.md` focused on product-experience intent and link to deeper specs only when those files exist.

## Evidence Rules

Product claims must come from at least one of these sources:

- User-provided requirements in the current request.
- Existing docs, specs, product notes, roadmap notes, or issue templates.
- README positioning, usage examples, command examples, screenshots, or demo output.
- Routes, screens, components, commands, prompts, examples, tests, or fixtures.
- Configuration that changes user-facing behavior.
- Clearly marked assumptions.

Write assumptions explicitly:

```markdown
## Open Questions

- Assumption: The primary user is a maintainer improving project documentation. Repository evidence: the skill reads local project files and edits docs.
- Unknown: There is no verified roadmap source for collaboration features.
```

Avoid unsupported certainty:

```markdown
## Product Intent

This product will become the leading platform for every documentation workflow.
```

## Five-Layer Constraints

Use these layers as review gates. The final document does not need to expose all five layer names as headings, but the thinking must be present or intentionally omitted.

### Strategy

Strategy links user needs to product objectives.

`PRODUCT.md` should say:

- Which user or role matters.
- What job, pain, or context creates demand.
- What product outcome should happen for that user.
- Which repository facts or assumptions support the claim.

Prefer:

```markdown
## Product Intent

This skill helps maintainers turn repository facts into useful documentation without guessing commands, badges, options, or project behavior. The intended outcome is a doc update that a reader can use immediately and that stays honest about unverifiable facts.
```

Avoid:

```markdown
## Product Intent

The product delivers a seamless and delightful documentation experience for everyone.
```

### Scope

Scope separates what the product includes from what it excludes.

`PRODUCT.md` should distinguish:

- Included now.
- Explicitly excluded.
- Deferred or open.

Use this shape when scope matters:

```markdown
## Scope

| Status | Item | Evidence |
| --- | --- | --- |
| Included | README, PRODUCT, ARCHITECTURE, CONTRIBUTING, and TUTORIAL guidance | `skills/write-docs/SKILL.md` supported documents |
| Excluded | Publishing a documentation website | No publishing workflow exists in the repository |
| Deferred | More product research examples | No verified source exists yet |
```

Do not turn scope into a wishlist. If the repository only proves current behavior, say that.

### Structure

Structure explains how the user moves through the experience.

Depending on the project, this can be:

- A task flow.
- A command sequence.
- An information architecture.
- A screen sequence.
- A state lifecycle.
- A document workflow.

Prefer flow descriptions that show dependency between steps:

```markdown
## Key Flow

1. The user asks for a documentation change.
2. The agent identifies the target document.
3. The agent reads the general style reference and matching document reference.
4. The agent scans repository facts before drafting.
5. The agent edits the document and self-checks claims against evidence.
6. The agent reports changed files, references read, verified facts, and checks run.
```

Avoid lists that do not explain movement:

```markdown
## Features

- References.
- Fact scan.
- Final response.
```

### Skeleton

Skeleton defines the interface model: navigation, input, output, feedback, layout, and recovery paths.

For visual products, describe screens, navigation, layout obligations, controls, empty states, loading states, error states, and feedback.

For command-line, agent, or documentation tools, describe command shape, prompt flow, option grouping, output format, confirmation steps, fallbacks, and recovery behavior.

Useful prompts:

- What does the user provide first?
- What does the product ask next?
- Where does feedback appear?
- Which defaults should stay stable?
- How does the product recover from missing facts?

Prefer:

```markdown
## Interface Model

The product behaves like a guided documentation workflow. The user names a document or intent, then the skill routes the request to required references. Missing repository facts should produce an explicit note in the final response instead of quiet guesswork.
```

Avoid:

```markdown
## Interface Model

The interface should be intuitive.
```

### Surface

Surface covers what the user perceives: voice, tone, visual feel, state feedback, hierarchy, density, motion, and polish.

Surface guidance must be specific enough to guide future implementation and review decisions.

Prefer:

```markdown
## Surface and Voice

Documentation should sound direct, calm, and concrete. It should name files, commands, options, and evidence plainly. Personality is allowed as a small accent, but it must not replace useful facts.
```

Avoid:

```markdown
## Surface and Voice

The product should feel clean, modern, and beautiful.
```

## Creation Workflow

When creating a new `PRODUCT.md`:

1. Read `references/elements-of-style.md` and this reference.
2. Search for existing product, roadmap, design, issue, route, screen, command, prompt, example, and test evidence.
3. Read the files that support product claims.
4. Draft only claims that are supported or marked as assumptions.
5. Use the five layers to check that product intent, scope, flow, interface model, and surface quality are covered.
6. Keep architecture details, changelogs, issue tracking, and long roadmaps out of `PRODUCT.md`.

## Audit Workflow

When auditing an existing `PRODUCT.md`, check:

- Strategy: user needs and product objectives are specific and supported.
- Scope: included, excluded, and deferred work are separated.
- Structure: key flows are understandable without reading source internals.
- Skeleton: interface, navigation, input, output, feedback, and recovery expectations are concrete.
- Surface: tone, visual feel, state behavior, and perceived quality are specific.
- Evidence: claims match repository facts or are marked as assumptions.
- Boundaries: the document is not acting as architecture, changelog, roadmap, or issue tracker.

For audit reports, lead with gaps that would mislead future product or engineering decisions.

## Product Self-Check

Before finishing `PRODUCT.md`, verify:

- Every product claim is supported by repository facts, user-provided requirements, existing docs, visible UI, or a marked assumption.
- The document names a user, job, or context when evidence exists.
- Scope separates included, excluded, and deferred work.
- Key flows describe sequence and dependency, not only features.
- Interface guidance covers inputs, outputs, feedback, defaults, and missing-fact behavior.
- Surface guidance avoids empty adjectives and ties tone or visual feel to product behavior.
- Open questions identify what needs validation instead of hiding uncertainty.
- The document does not promise future work without evidence.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Product doc is only a feature list. | Add user need, product objective, task flow, interface expectations, and surface constraints. |
| Product doc is only a vision statement. | Add concrete scope, flows, current behavior, and open assumptions. |
| User personas are invented. | Use repository evidence or mark personas as assumptions. |
| Scope promises unsupported future work. | Split current, excluded, and deferred items. |
| UX language is generic. | Tie each experience principle to a user action, state, or product decision. |
| Visual guidance says only "clean" or "modern". | Describe tone, hierarchy, density, feedback, and state behavior. |
| Architecture details dominate the product doc. | Move module maps, data flow internals, and implementation decisions to `ARCHITECTURE.md`. |
```

- [ ] **Step 3: Verify the product reference contains required layer guidance**

Run:

```bash
rg -n "Strategy|Scope|Structure|Skeleton|Surface|Users and Jobs|Open Questions|Creation Workflow|Audit Workflow|Product Self-Check" skills/write-docs/references/product.md
```

Expected: output includes matches for every phrase.

- [ ] **Step 4: Verify the reference avoids unsupported source-book quoting**

Run:

```bash
rg -n "The Elements of User Experience|Jesse James Garrett|Strategy links|Scope separates|Structure explains|Skeleton defines|Surface covers" skills/write-docs/references/product.md
```

Expected: output shows attribution and paraphrased layer descriptions, not long quotes.

- [ ] **Step 5: Commit the product reference**

Run:

```bash
git add skills/write-docs/references/product.md
git commit -m "docs(write-docs): add product reference"
```

Expected: commit succeeds with `skills/write-docs/references/product.md` as the only changed file.

## Task 3: Final Verification and Integration Check

**Files:**
- Verify: `skills/write-docs/SKILL.md`
- Verify: `skills/write-docs/references/product.md`

- [ ] **Step 1: Verify all planned files exist**

Run:

```bash
test -f skills/write-docs/SKILL.md
test -f skills/write-docs/references/product.md
```

Expected: both commands exit with status 0.

- [ ] **Step 2: Verify `PRODUCT.md` is wired through the main skill**

Run:

```bash
rg -n "PRODUCT.md|references/product.md|Product facts|Product references read|Strategy, Scope, Structure, Skeleton, and Surface" skills/write-docs/SKILL.md
```

Expected: output includes matches for supported documents, required references, fact scanning, self-check, and final reporting.

- [ ] **Step 3: Verify existing document support remains intact**

Run:

```bash
rg -n "README.md|ARCHITECTURE.md|CONTRIBUTING.md|TUTORIAL.md" skills/write-docs/SKILL.md
rg -n "references/readme.md|references/architecture.md|references/contributing.md|references/tutorial.md" skills/write-docs/SKILL.md
```

Expected: both commands print matches for all existing document types and reference files.

- [ ] **Step 4: Verify Markdown diffs have no whitespace errors**

Run:

```bash
git diff --check HEAD~2..HEAD
```

Expected: command exits with status 0 and prints no output.

- [ ] **Step 5: Verify no implementation-plan red flags landed in changed skill files**

Run:

```bash
python3 - <<'PY'
from pathlib import Path

needles = [
    "T" + "BD",
    "TO" + "DO",
    "FIX" + "ME",
    "place" + "holder",
    "imple" + "ment later",
    "fill in de" + "tails",
    "add appropriate error hand" + "ling",
    "Write tests for the ab" + "ove",
    "Similar to Ta" + "sk",
]

failed = False
for path in [
    Path("skills/write-docs/SKILL.md"),
    Path("skills/write-docs/references/product.md"),
]:
    for line_number, line in enumerate(path.read_text().splitlines(), 1):
        for needle in needles:
            if needle in line:
                print(f"{path}:{line_number}: found {needle!r}")
                failed = True

raise SystemExit(1 if failed else 0)
PY
```

Expected: command exits with status 0 and prints no matches.

- [ ] **Step 6: Review the final diff**

Run:

```bash
git show --stat --oneline HEAD~1..HEAD
git show --stat --oneline HEAD~2..HEAD
```

Expected: the first command shows the product reference commit. The second command shows exactly these files across the two implementation commits:

```text
skills/write-docs/SKILL.md
skills/write-docs/references/product.md
```

- [ ] **Step 7: Report completion**

Use this final response shape:

```text
Implemented `PRODUCT.md` support for `write-docs`.

Changed:
- `skills/write-docs/SKILL.md`: added product routing, fact scanning, self-check, and reporting rules.
- `skills/write-docs/references/product.md`: added product creation/audit guidance using Strategy, Scope, Structure, Skeleton, and Surface.

Verified:
- Product routing checks passed.
- Existing README/ARCHITECTURE/CONTRIBUTING/TUTORIAL routing remains present.
- `git diff --check` passed.
- Placeholder scan found no matches.
```
