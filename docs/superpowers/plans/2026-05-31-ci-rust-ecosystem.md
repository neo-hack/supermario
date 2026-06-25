# CI Skill: Rust Ecosystem Support — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the `ci` skill to support Pure Rust, Mixed (JS+Rust), and Tauri project types alongside the existing JS-only flow.

**Architecture:** The skill auto-detects project type via `package.json` / `Cargo.toml` / `src-tauri/Cargo.toml` markers, then dispatches the appropriate asset files. New Rust asset files are added under `assets/rust/`, `assets/workflows/rust/`, `assets/husky-rust/`, and `assets/lint-staged/`. The SKILL.md document is rewritten to incorporate the detection branching logic for all four project types.

**Tech Stack:** Skill definition (SKILL.md), GitHub Actions YAML, TOML (rustfmt), shell scripts, JSON (lint-staged, Cargo.toml edits).

---

## File Structure

### New Files (created in this plan)

| File | Purpose |
|---|---|
| `skills/ci/assets/rust/rustfmt.toml` | rustfmt configuration for Rust/Tauri projects |
| `skills/ci/assets/workflows/rust/ci.yml` | Pure Rust CI workflow |
| `skills/ci/assets/workflows/rust/ci-rust.yml` | Rust CI job for mixed (non-Tauri) projects |
| `skills/ci/assets/workflows/rust/ci-rust-tauri.yml` | Rust CI job for Tauri projects (working-directory: src-tauri) |
| `skills/ci/assets/workflows/rust/release-tauri.yml` | Cross-platform Tauri release workflow |
| `skills/ci/assets/husky-rust/pre-commit` | Pre-commit hook for pure Rust projects |
| `skills/ci/assets/lint-staged/lintstagedrc-mixed` | lint-staged config combining JS + Rust rules |

### Modified Files

| File | Change |
|---|---|
| `skills/ci/SKILL.md` | Rewrite to add Rust detection, asset dispatch, pure Rust mode, mixed/Tauri mode |
| `skills/ci/agents/openai.yaml` | Update description to mention Rust/Tauri support |

---

### Task 1: Create `rustfmt.toml` asset

**Files:**
- Create: `skills/ci/assets/rust/rustfmt.toml`

- [ ] **Step 1: Create directory and file**

```toml
edition = "2021"
max_width = 120
```

- [ ] **Step 2: Verify file exists**

Run: `cat skills/ci/assets/rust/rustfmt.toml`
Expected: the two-line TOML content above.

- [ ] **Step 3: Commit**

```bash
git add skills/ci/assets/rust/rustfmt.toml
git commit -m "feat(ci): add rustfmt config asset for Rust/Tauri projects"
```

---

### Task 2: Create Pure Rust CI workflow

**Files:**
- Create: `skills/ci/assets/workflows/rust/ci.yml`

- [ ] **Step 1: Create directory and file**

```yaml
name: Rust CI

on:
  push:
  pull_request:
    branches: [master, release]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy
      - uses: Swatinem/rust-cache@v2
      - run: cargo fmt --all -- --check
      - run: cargo clippy --all-targets --all-features -- -D warnings
      - run: cargo test --all
```

- [ ] **Step 2: Verify file exists**

Run: `cat skills/ci/assets/workflows/rust/ci.yml`
Expected: the YAML content above.

- [ ] **Step 3: Commit**

```bash
git add skills/ci/assets/workflows/rust/ci.yml
git commit -m "feat(ci): add pure Rust CI workflow asset"
```

---

### Task 3: Create Mixed (non-Tauri) Rust CI workflow

**Files:**
- Create: `skills/ci/assets/workflows/rust/ci-rust.yml`

- [ ] **Step 1: Create file**

```yaml
name: Rust CI

on:
  push:
  pull_request:
    branches: [master, release]

jobs:
  rust-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy
      - uses: Swatinem/rust-cache@v2
      - run: cargo fmt --all -- --check
      - run: cargo clippy --all-targets --all-features -- -D warnings
      - run: cargo test --all
```

- [ ] **Step 2: Verify file exists**

Run: `cat skills/ci/assets/workflows/rust/ci-rust.yml`
Expected: the YAML content above.

- [ ] **Step 3: Commit**

```bash
git add skills/ci/assets/workflows/rust/ci-rust.yml
git commit -m "feat(ci): add mixed project Rust CI workflow asset"
```

---

### Task 4: Create Tauri Rust CI workflow

**Files:**
- Create: `skills/ci/assets/workflows/rust/ci-rust-tauri.yml`

- [ ] **Step 1: Create file**

This variant uses `working-directory: src-tauri` and scoped `rust-cache` because Tauri places `Cargo.toml` inside `src-tauri/`.

```yaml
name: Rust CI

on:
  push:
  pull_request:
    branches: [master, release]

jobs:
  rust-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy
      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: src-tauri
      - name: Check formatting
        run: cargo fmt --all -- --check
        working-directory: src-tauri
      - name: Clippy
        run: cargo clippy --all-targets --all-features -- -D warnings
        working-directory: src-tauri
      - name: Test
        run: cargo test --all
        working-directory: src-tauri
```

- [ ] **Step 2: Verify file exists**

Run: `cat skills/ci/assets/workflows/rust/ci-rust-tauri.yml`
Expected: the YAML content above.

- [ ] **Step 3: Commit**

```bash
git add skills/ci/assets/workflows/rust/ci-rust-tauri.yml
git commit -m "feat(ci): add Tauri Rust CI workflow asset"
```

---

### Task 5: Create Tauri release workflow

**Files:**
- Create: `skills/ci/assets/workflows/rust/release-tauri.yml`

- [ ] **Step 1: Create file**

This workflow is triggered by `v*` tags, builds on macOS/Windows/Linux in parallel, and uploads artifacts to GitHub Releases as draft. Uses `pnpm/action-setup` for consistency with the existing JS workflows. The `{{PACKAGE_MANAGER}}` placeholder will be replaced by the skill at copy time.

```yaml
name: Release Tauri App

on:
  push:
    tags: ['v*']

jobs:
  release:
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest, ubuntu-22.04, windows-latest]
    runs-on: ${{ matrix.platform }}

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          run_install: false
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: pnpm install --frozen-lockfile=false
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: src-tauri
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: ${{ github.ref_name }}
          releaseBody: 'See the assets below to download the installer.'
          releaseDraft: true
          prerelease: false
```

- [ ] **Step 2: Verify file exists**

Run: `cat skills/ci/assets/workflows/rust/release-tauri.yml`
Expected: the YAML content above.

- [ ] **Step 3: Commit**

```bash
git add skills/ci/assets/workflows/rust/release-tauri.yml
git commit -m "feat(ci): add Tauri cross-platform release workflow asset"
```

---

### Task 6: Create pure Rust husky pre-commit hook

**Files:**
- Create: `skills/ci/assets/husky-rust/pre-commit`

- [ ] **Step 1: Create directory and file**

This is a standalone pre-commit hook for pure Rust projects that don't have Node.js. It runs `cargo fmt` check and `cargo clippy` directly. Note: this file is used as a reference — pure Rust projects will primarily use `cargo-husky` which manages hooks automatically. This file serves as a fallback or for manual setup.

```sh
#!/bin/sh
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
```

- [ ] **Step 2: Make file executable locally (for reference)**

Run: `chmod +x skills/ci/assets/husky-rust/pre-commit`

- [ ] **Step 3: Verify file exists**

Run: `cat skills/ci/assets/husky-rust/pre-commit`
Expected: the 3-line shell script above.

- [ ] **Step 4: Commit**

```bash
git add skills/ci/assets/husky-rust/pre-commit
git commit -m "feat(ci): add pure Rust pre-commit hook asset"
```

---

### Task 7: Create mixed lint-staged config

**Files:**
- Create: `skills/ci/assets/lint-staged/lintstagedrc-mixed`

- [ ] **Step 1: Create file**

This config extends the existing JS-only lint-staged config with Rust file rules. It is only used for Mixed and Tauri projects. For pure JS projects, the existing `lintstagedrc` is used unchanged.

```json
{
  "**/**/*.{js,ts,tsx,json,yml,yaml,md}": ["eslint --fix"],
  "**/*.rs": ["rustfmt --edition 2021"],
  "**/Cargo.toml": ["cargo sort -w"]
}
```

- [ ] **Step 2: Verify file exists**

Run: `cat skills/ci/assets/lint-staged/lintstagedrc-mixed`
Expected: the JSON content above.

- [ ] **Step 3: Commit**

```bash
git add skills/ci/assets/lint-staged/lintstagedrc-mixed
git commit -m "feat(ci): add mixed JS+Rust lint-staged config asset"
```

---

### Task 8: Rewrite SKILL.md

**Files:**
- Modify: `skills/ci/SKILL.md` (full rewrite)

- [ ] **Step 1: Rewrite SKILL.md**

Replace the entire file content with the updated version below. Key changes from the original:
- Detection now checks for `Cargo.toml` (root and `src-tauri/`) in addition to `package.json`
- Four project types: JS, Pure Rust, Mixed (non-Tauri), Tauri
- New Rust asset files in the conflict scan table
- Asset dispatch varies by project type
- Pure Rust mode uses `cargo-husky` instead of npm husky, edits `Cargo.toml` instead of `package.json`, skips npm install
- Mixed/Tauri mode adds Rust assets on top of the existing JS flow
- lint-staged has a mixed variant

```markdown
---
name: ci
description: "Automated setup of developer-experience tooling: ESLint, clippy, rustfmt, changesets, husky, lint-staged, GitHub workflows, templates, and commitizen. Supports JS, Rust, Mixed, and Tauri projects."
---

# ci Skill

## Purpose

Set up best-practice developer tooling in JavaScript/TypeScript, Rust, and Tauri projects. This skill detects the project type, checks for existing configurations, copies asset files, edits configuration files, and installs dependencies.

## Arguments

- `--force` — Skip all interactive prompts. Use predefined overwrite/merge rules:
  - **Asset files**: overwrite unconditionally.
  - **`package.json` scripts**: merge new scripts; overwrite existing keys with skill defaults.
  - **`package.json` devDependencies**: merge new dependencies; if a version conflict exists, keep the higher semver version. If unparseable, overwrite with skill default.
  - **`Cargo.toml` dev-dependencies**: merge new dependencies; overwrite existing keys with skill defaults.
  - **lint-staged config**: overwrite unconditionally.

## Execution Workflow

### Detect Environment

1. Locate the project root by finding the nearest `package.json` or `Cargo.toml` upward from the current working directory.
2. If neither is found, abort with: "No package.json or Cargo.toml found. Run this skill from the project root directory."
3. Determine project type:
   - `package.json` exists, no `Cargo.toml` at root or `src-tauri/` → **JS**
   - `Cargo.toml` at root exists, no `package.json` → **Pure Rust**
   - `package.json` exists + `Cargo.toml` at root → **Mixed**
   - `package.json` exists + `src-tauri/Cargo.toml` exists → **Tauri**
4. If JS-based (JS, Mixed, Tauri), detect the package manager by checking lockfiles:
   - `pnpm-lock.yaml` → **pnpm**
   - `bun.lock` or `bun.lockb` → **bun**
   - Default to **pnpm** if none found.
5. Read `package.json` (if present) to inspect existing `scripts` and `devDependencies`.
6. Read `Cargo.toml` (if present) to inspect existing `[dev-dependencies]`.

### Check Existing Configs

Scan the project for existing files that may conflict:

| Asset | Target Path | JS | Mixed | Tauri | Pure Rust |
|-------|-------------|:--:|:-----:|:-----:|:---------:|
| ESLint config | `eslint.config.mjs` | ✓ | ✓ | ✓ | |
| rustfmt config | `rustfmt.toml` | | ✓ | ✓ | ✓ |
| CI workflow (JS) | `.github/workflows/ci.yml` | ✓ | ✓ | ✓ | |
| CI workflow (Rust, mixed) | `.github/workflows/ci-rust.yml` | | ✓ | | |
| CI workflow (Rust, Tauri) | `.github/workflows/ci-rust-tauri.yml` | | | ✓ | |
| CI workflow (pure Rust) | `.github/workflows/ci.yml` | | | | ✓ |
| Release workflow | `.github/workflows/release.yml` | ✓ | ✓ | ✓ | |
| Snapshot release workflow | `.github/workflows/snapshot-release.yml` | ✓ | ✓ | ✓ | |
| Tauri release workflow | `.github/workflows/release-tauri.yml` | | | ✓ | |
| PR template | `.github/PULL_REQUEST_TEMPLATE.md` | ✓ | ✓ | ✓ | ✓ |
| Bug report template | `.github/ISSUE_TEMPLATE/bug_report.md` | ✓ | ✓ | ✓ | ✓ |
| Feature request template | `.github/ISSUE_TEMPLATE/feature_request.md` | ✓ | ✓ | ✓ | ✓ |
| Changeset config | `.changeset/config.json` | ✓ | ✓ | ✓ | |
| Changeset README | `.changeset/README.md` | ✓ | ✓ | ✓ | |
| Husky pre-commit | `.husky/pre-commit` | ✓ | ✓ | ✓ | |
| Husky pre-merge | `.husky/pre-merge` | ✓ | ✓ | ✓ | |
| lint-staged config (JS) | `.lintstagedrc` | ✓ | | | |
| lint-staged config (mixed) | `.lintstagedrc` | | ✓ | ✓ | |
| .czrc | `.czrc` | ✓ | ✓ | ✓ | |
| .node-version | `.node-version` | ✓ | ✓ | ✓ | |

Build a conflict report listing every item that already exists for the detected project type.

### Prompt User on Conflicts

- If `--force` is active, apply the force strategies from the Arguments section without prompting.
- If no conflicts exist, proceed automatically.
- If conflicts exist and `--force` is not active, present the conflict report to the user.
- For each conflict, ask: **overwrite**, **skip**, or **keep existing**.

### Copy Assets

For each item approved (or with no conflict), copy from `assets/<category>/` to the target path relative to the project root.

**Common assets (all project types):**

- `assets/templates/PULL_REQUEST_TEMPLATE.md` → `.github/PULL_REQUEST_TEMPLATE.md`
- `assets/templates/ISSUE_TEMPLATE/bug_report.md` → `.github/ISSUE_TEMPLATE/bug_report.md`
- `assets/templates/ISSUE_TEMPLATE/feature_request.md` → `.github/ISSUE_TEMPLATE/feature_request.md`

**JS-only assets (JS, Mixed, Tauri):**

- `assets/eslint/eslint.config.mjs` → `eslint.config.mjs`
- `assets/workflows/<pm>/ci.yml` → `.github/workflows/ci.yml`
- `assets/workflows/<pm>/release.yml` → `.github/workflows/release.yml`
- `assets/workflows/<pm>/snapshot-release.yml` → `.github/workflows/snapshot-release.yml`
- `assets/changeset/config.json` → `.changeset/config.json`
- `assets/changeset/README.md` → `.changeset/README.md`
- `assets/husky/pre-commit` → `.husky/pre-commit`
- `assets/husky/pre-merge` → `.husky/pre-merge`
- `assets/dotfiles/cz-rc` → `.czrc`
- `assets/dotfiles/node-version` → `.node-version`

Where `<pm>` is the detected package manager (`pnpm` or `bun`).

**JS project lint-staged:**

- `assets/lint-staged/lintstagedrc` → `.lintstagedrc`

**Mixed/Tauri project lint-staged:**

- `assets/lint-staged/lintstagedrc-mixed` → `.lintstagedrc`

**Rust assets (Mixed, Tauri, Pure Rust):**

- `assets/rust/rustfmt.toml` → `rustfmt.toml`

**Mixed project Rust CI:**

- `assets/workflows/rust/ci-rust.yml` → `.github/workflows/ci-rust.yml`

**Tauri project Rust CI:**

- `assets/workflows/rust/ci-rust-tauri.yml` → `.github/workflows/ci-rust-tauri.yml`

**Tauri release:**

- `assets/workflows/rust/release-tauri.yml` → `.github/workflows/release-tauri.yml`

**Pure Rust CI:**

- `assets/workflows/rust/ci.yml` → `.github/workflows/ci.yml`

**Template substitution:**
- The husky scripts (`pre-commit`, `pre-merge`) contain the placeholder `{{PACKAGE_MANAGER}}`, which must be replaced with the detected package manager name before copying.
- The Tauri release workflow (`release-tauri.yml`) contains the placeholder `{{PACKAGE_MANAGER}}` in the `pnpm install` step. If the detected package manager is `bun`, replace `pnpm/action-setup@v2` with `oven-sh/setup-bun@v1`, `pnpm install` with `bun install`, and remove the `pnpm/action-setup` step. If `pnpm`, keep as-is.

**Make husky scripts executable:** After copying, run `chmod +x` on `.husky/pre-commit` and `.husky/pre-merge`.

Ensure target directories exist before copying.

### Edit Configuration Files

#### JS/Mixed/Tauri: Edit package.json

Add the following keys **only if they do not already exist or if overwrite was approved**:

**Scripts:**
Replace `<package_manager>` with the detected package manager name.
```json
{
  "ci:version": "<package_manager> changeset version",
  "ci:publish": "<package_manager> run build && <package_manager> changeset publish",
  "ci:snapshot": "<package_manager> changeset version --snapshot snapshot",
  "ci:prerelease": "<package_manager> run build && <package_manager> changeset publish --no-git-tag --tag snapshot",
  "lint:fix": "eslint . --fix",
  "prepare": "husky install"
}
```

**Tauri-only additional script:**
```json
{
  "release:tauri": "<package_manager> tauri build"
}
```

**devDependencies:**
```json
{
  "typescript": "^5.9.3",
  "eslint": "^10.2.1",
  "@aiou/eslint-config": "^3.1.0",
  "lint-staged": "^13.1.0",
  "@changesets/cli": "^2.31.0",
  "husky": "^8.0.3",
  "cz-emoji": "^1.3.1"
}
```

If `--force` is active:
- For scripts: overwrite existing keys with skill defaults.
- For devDependencies: keep the higher semver version when conflicting. If unparseable, use skill default.

#### Pure Rust: Edit Cargo.toml

Add the following to `[dev-dependencies]` **only if it does not already exist or if overwrite was approved**:

```toml
[dev-dependencies]
cargo-husky = { version = "1", default-features = false, features = ["precommit-hook", "run-cargo-fmt", "run-cargo-clippy"] }
```

If `[dev-dependencies]` section does not exist, create it. If `cargo-husky` already exists under `[dev-dependencies]`, skip (or overwrite if `--force`).

### Run Package Install

**JS/Mixed/Tauri:** Execute the detected package manager's install command:
- **pnpm**: `pnpm install`
- **bun**: `bun install`

**Pure Rust:** Skip. No package install step needed.

If install fails, capture stderr, display a concise error, and advise the user to run install manually.

### Verification

List everything that was created, modified, or skipped in a final summary. Include:

- Project type detected (JS / Mixed / Tauri / Pure Rust)
- All files created, modified, or skipped
- **Mixed/Tauri projects**: reminder to install `cargo-sort` (`cargo install cargo-sort`) for lint-staged Cargo.toml sorting
- **Tauri projects**: reminder that `tauri-action` requires `GITHUB_TOKEN` with `contents: write` permission
- **Pure Rust projects**: reminder that `cargo-husky` hooks activate on first `cargo test`

Confirm successful completion.

## Error Handling

- **No package.json or Cargo.toml**: Abort immediately with clear message.
- **File copy failures** (e.g., permission denied): Continue with remaining steps. Report failure in summary.
- **Install failures**: Surface stderr. Advise manual install. Do not retry.
- **Partial failures**: Always complete the full workflow and report what succeeded vs. failed.
- **No Cargo.toml but Rust assets requested**: Skip Rust assets and warn.
- **Tauri detection without @tauri-apps/cli in dependencies**: Warn that Tauri CLI may need to be installed.

## Rollback

No automatic rollback. The skill is additive. Overwrites require explicit user consent (or `--force`).
```

- [ ] **Step 2: Verify SKILL.md renders correctly**

Run: `head -20 skills/ci/SKILL.md`
Expected: the YAML front matter and the "# ci Skill" heading.

- [ ] **Step 3: Commit**

```bash
git add skills/ci/SKILL.md
git commit -m "feat(ci): rewrite SKILL.md with Rust/Tauri project type support"
```

---

### Task 9: Update openai.yaml agent description

**Files:**
- Modify: `skills/ci/agents/openai.yaml`

- [ ] **Step 1: Update file**

Replace the entire content:

```yaml
interface:
  display_name: "CI Setup"
  short_description: "Set up developer tooling and CI for JS, Rust, and Tauri projects"
  default_prompt: "Use $ci to set up developer tooling, CI workflows, changesets, commitizen, husky, lint-staged, clippy, and rustfmt for this project. Supports JavaScript, TypeScript, Rust, mixed JS+Rust, and Tauri projects."
```

- [ ] **Step 2: Verify file**

Run: `cat skills/ci/agents/openai.yaml`
Expected: the updated YAML content above.

- [ ] **Step 3: Commit**

```bash
git add skills/ci/agents/openai.yaml
git commit -m "feat(ci): update agent description for Rust/Tauri support"
```

---

## Self-Review

### 1. Spec Coverage

| Spec Requirement | Task |
|---|---|
| rustfmt.toml asset | Task 1 |
| Pure Rust CI workflow | Task 2 |
| Mixed Rust CI workflow | Task 3 |
| Tauri Rust CI workflow | Task 4 |
| Tauri release workflow | Task 5 |
| Pure Rust husky hook | Task 6 |
| Mixed lint-staged config | Task 7 |
| SKILL.md rewrite (detection, dispatch, pure Rust mode, mixed/Tauri mode) | Task 8 |
| Agent description update | Task 9 |
| cargo-husky in Cargo.toml for pure Rust | Task 8 (SKILL.md instructions) |
| Tauri release script in package.json | Task 8 (SKILL.md instructions) |
| Conflict detection for new Rust assets | Task 8 (SKILL.md conflict table) |
| Verification summary with Rust-specific reminders | Task 8 (SKILL.md verification section) |
| Error handling for Rust-specific cases | Task 8 (SKILL.md error handling section) |

All spec requirements covered.

### 2. Placeholder Scan

No TBD, TODO, or placeholder patterns found. All steps contain complete file contents.

### 3. Type Consistency

- File paths in SKILL.md dispatch section match the actual asset file paths created in Tasks 1-7.
- The `{{PACKAGE_MANAGER}}` placeholder is documented in both the existing husky scripts and the new Tauri release workflow.
- Conflict table target paths match the copy destination paths in the dispatch section.
