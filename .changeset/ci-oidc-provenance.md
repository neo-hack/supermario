---
"supermario": patch
---

Refactor the CI skill's release workflows to publish via npm OIDC trusted publishing (Node 24, id-token: write) instead of the no-op NPM_CONFIG_PROVENANCE flag, and merge the standalone snapshot-release workflow into release.yml (routed by github.event_name) so npm's single trusted-publisher-per-package constraint is satisfied by one workflow file.
