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
- The Tauri release workflow (`release-tauri.yml`) uses `pnpm` by default. If the detected package manager is `bun`, replace `pnpm/action-setup@v4` step with `oven-sh/setup-bun@v2`, `pnpm install --frozen-lockfile=false` with `bun install`. If `pnpm`, keep as-is.
- **pnpm/action-setup ordering**: `pnpm/action-setup@v4` must run BEFORE `actions/setup-node@v5` in all pnpm workflows. This is required because setup-node v5 expects the package manager to already be on PATH.
- **Cross-platform shell compatibility**: Any step using `$GITHUB_ENV` must include `shell: bash` to work on Windows runners (which default to PowerShell). This applies to pnpm store path detection and similar env-setting steps.
- **pnpm store caching**: All pnpm workflows include pnpm store caching (`actions/cache@v4`) between install and build steps. The cache key is derived from `pnpm-lock.yaml` hashes.
- **npm publish provenance**: All release and snapshot-release workflows include `id-token: write` permission, `registry-url` in setup-node, and `NPM_CONFIG_PROVENANCE: true` + `NODE_AUTH_TOKEN` environment variables for OIDC-based supply-chain traceability.
- **Tauri monorepo builds**: For pnpm monorepo Tauri projects, workspace dependencies (shared types, UI components, etc.) must be built before `tauri-action`. The template includes a `Build workspace dependencies` step using `pnpm build` (runs all packages). For targeted builds, replace with `pnpm --filter '<package-name>...' build` to build only the Tauri app and its transitive dependencies in topological order.

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
