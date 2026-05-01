---
description: Stage all changes and commit with auto-selected message
agent: build
---
Stage ALL changes (untracked, modified, deleted) with `git add -A`.

Analyze the diff, then generate exactly 3 commit message candidates. Each candidate must have a **title** (≤50 chars, imperative mood, in czemoji format: `<gitmoji_code> <type>(<scope>): <subject>`, e.g. `:sparkles: feat(core): add new feature`. Use gitmoji text codes from https://gitmoji.dev/ (like `:sparkles:`, `:bug:`, `:memo:`, `:wrench:`) instead of actual emoji characters for better compatibility) and a **body** (wrapped at 72 chars, explains why). Display them like:

1. **title**: `<title>`
   **body**:
   `<body lines>`

2. **title**: `<title>`
   **body**:
   `<body lines>`

3. **title**: `<title>`
   **body**:
   `<body lines>`

Pick the most appropriate one yourself (do NOT ask the user), then commit with it immediately.

If the `OPENCODE` environment variable is set, append this trailer to the commit body:

Co-authored-by: !`echo opencode` <!`echo opencode`@ai>

