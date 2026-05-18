# Dead Code Risk Reference

Use this reference when static results look plausible but the project has dynamic behavior.

## Common False Positives

- Public exports consumed outside the repository.
- Framework file conventions: pages, routes, layouts, commands, migrations, jobs, handlers, middleware, serializers, fixtures, and seed data.
- Reflection or string lookup: class names, method names, enum values, dependency injection tokens, event names, metrics, feature flags, localization keys, and telemetry names.
- Generated code and generated manifests.
- Test fixtures, snapshots, golden files, and sample projects.
- Package entry points: `exports`, `bin`, `main`, `module`, `types`, Python entry points, Go commands, Rust binaries/examples/benches, Java service descriptors.
- Native/mobile resources referenced by build tools rather than source imports.
- CSS class names or assets referenced by templates, markdown, CMS data, screenshots, or runtime configuration.

## Evidence Checklist

Before deleting a non-local symbol or file, collect at least two independent signals:

- Language-aware unused/dependency analyzer reports it.
- No inbound references in source, tests, config, docs, manifests, generated registries, or templates.
- The symbol is private or not exported from a public boundary.
- Removing it does not break typecheck, build, lint, tests, or framework route discovery.
- Git history shows the feature or caller was already removed.

For public API packages, prefer deprecation or an explicit user decision over immediate deletion unless the repository owns all consumers.

## Batch Strategy

1. Remove isolated local symbols first.
2. Remove unused imports and re-export barrels next.
3. Remove orphan files only after checking package manifests and framework conventions.
4. Remove dependencies last, after the code paths importing them are gone.
5. Run the broad verification suite after dependency or manifest changes.
