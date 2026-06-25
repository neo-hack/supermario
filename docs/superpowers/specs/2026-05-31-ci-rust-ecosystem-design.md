# CI Skill: Rust Ecosystem Support

## Summary

Extend the existing `ci` skill to support Rust and Tauri projects alongside the current JS/TS workflow. The skill will auto-detect project type and apply the appropriate tooling setup.

## Project Types

The skill detects three project types by checking for marker files:

| Marker Files | Project Type |
|---|---|
| `package.json` only | JS (existing flow, unchanged) |
| `Cargo.toml` only | Pure Rust |
| `package.json` + `Cargo.toml` (root or `src-tauri/`) | Mixed |
| `package.json` + `src-tauri/Cargo.toml` | Tauri |

Detection aborts only if neither `package.json` nor `Cargo.toml` is found.

Rust toolchain version is read from `rust-toolchain.toml` or `rust-toolchain` if present. If absent, stable is assumed (no explicit pinning).

## New Asset Files

### `assets/rust/rustfmt.toml`

```toml
edition = "2021"
max_width = 120
```

Placed at project root. rustfmt searches upward from `src-tauri/`, so one config covers both locations.

### `assets/workflows/rust/ci.yml`

Pure Rust CI workflow:

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

### `assets/workflows/rust/ci-rust.yml` (non-Tauri mixed)

For mixed projects where `Cargo.toml` is at the project root alongside `package.json`:

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

### `assets/workflows/rust/ci-rust-tauri.yml` (Tauri)

For Tauri projects where `Cargo.toml` is in `src-tauri/`. Uses `working-directory: src-tauri` and scoped `rust-cache`:

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

### `assets/workflows/rust/release-tauri.yml`

Cross-platform Tauri release:

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

Triggered by `v*` tags. Builds on macOS (.dmg), Windows (.msi/.exe), and Linux (.deb/.AppImage). Uploads to GitHub Releases as draft.

### `assets/husky-rust/pre-commit`

For pure Rust projects (no Node.js):

```sh
#!/bin/sh
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
```

### `assets/lint-staged/lintstagedrc-mixed`

For mixed/Tauri projects:

```json
{
  "**/**/*.{js,ts,tsx,json,yml,yaml,md}": ["eslint --fix"],
  "**/*.rs": ["rustfmt --edition 2021"],
  "**/Cargo.toml": ["cargo sort -w"]
}
```

## Asset Dispatch by Project Type

| Asset | JS | Mixed (non-Tauri) | Tauri | Pure Rust |
|---|---|---|---|---|
| ESLint config | copy | copy | copy | — |
| rustfmt.toml | — | copy | copy | copy |
| JS CI (ci.yml) | copy | copy | copy | — |
| Rust CI (ci-rust.yml) | — | copy | — | — |
| Rust CI Tauri (ci-rust-tauri.yml) | — | — | copy | — |
| Pure Rust CI (ci.yml) | — | — | — | copy |
| Release workflow | copy | copy | copy | — |
| Snapshot release | copy | copy | copy | — |
| Tauri release | — | — | copy | — |
| PR template | copy | copy | copy | copy |
| Bug report | copy | copy | copy | copy |
| Feature request | copy | copy | copy | copy |
| Changeset config | copy | copy | copy | — |
| Changeset README | copy | copy | copy | — |
| Husky pre-commit | copy (lint-staged) | copy (lint-staged) | copy (lint-staged) | — |
| Husky pre-merge | copy | copy | copy | — |
| lint-staged (JS) | copy | — | — | — |
| lint-staged (mixed) | — | copy | copy | — |
| .czrc | copy | copy | copy | — |
| .node-version | copy | copy | copy | — |

## Pure Rust Mode

### Git Hooks: cargo-husky

Pure Rust projects use `cargo-husky` instead of npm husky. The skill adds to `[dev-dependencies]` in `Cargo.toml`:

```toml
[dev-dependencies]
cargo-husky = { version = "1", default-features = false, features = ["precommit-hook", "run-cargo-fmt", "run-cargo-clippy"] }
```

This automatically sets up git hooks on `cargo test`. No Node.js required.

### Steps Skipped in Pure Rust Mode

- `package.json` editing
- `npm install` / `pnpm install` / `bun install`
- All JS-specific asset copies (ESLint, changeset, lint-staged, .czrc, .node-version)

## Mixed/Tauri Mode

### CI Workflows

Two separate CI files:
- `.github/workflows/ci.yml` — JS checks (existing)
- `.github/workflows/ci-rust.yml` — Rust checks (new)

Tauri projects use the variant with `working-directory: src-tauri` and `rust-cache` scoped accordingly.

### Lint-staged

Mixed version includes Rust file rules alongside JS rules. The `cargo sort -w` command requires `cargo-sort` installed locally.

### Tauri Release

Copied to `.github/workflows/release-tauri.yml`. Triggered by `v*` tags. Uses `tauri-apps/tauri-action` for cross-platform builds.

The skill adds the following script to `package.json`:

```json
{
  "release:tauri": "pnpm tauri build"
}
```

## Conflict Detection

New items added to the existing conflict scan:

| Asset | Target Path |
|---|---|
| rustfmt config | `rustfmt.toml` |
| Rust CI (mixed) | `.github/workflows/ci-rust.yml` |
| Rust CI (Tauri) | `.github/workflows/ci-rust-tauri.yml` |
| Rust CI (pure) | `.github/workflows/ci.yml` |
| Tauri release | `.github/workflows/release-tauri.yml` |
| lint-staged (mixed) | `.lintstagedrc` (overwrites JS version) |

## Package.json Changes (Mixed/Tauri Only)

### Scripts Added

```json
{
  "release:tauri": "<package_manager> tauri build"
}
```

### devDependencies

No new npm dependencies. Rust tooling (clippy, rustfmt) comes from the Rust toolchain.

## Verification Summary

The final summary includes:

- Project type detected (JS / Mixed / Tauri / Pure Rust)
- All files created, modified, or skipped
- For mixed/Tauri projects: reminder to install `cargo-sort` (`cargo install cargo-sort`) if lint-staged Rust rules are active
- For Tauri projects: reminder that `tauri-action` needs `GITHUB_TOKEN` with `contents: write` permission
- For pure Rust: reminder that `cargo-husky` hooks activate on first `cargo test`

## Error Handling

Same error handling strategy as existing skill:
- File copy failures: continue, report in summary
- Partial failures: always complete full workflow
- No automatic rollback

Additional Rust-specific errors:
- **No Cargo.toml but Rust assets requested**: This should not happen with auto-detection, but if it does, skip Rust assets and warn.
- **Tauri detection without @tauri-apps/cli**: Warn that Tauri CLI may need to be installed.
