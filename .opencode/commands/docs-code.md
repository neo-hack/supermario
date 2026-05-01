---
description: Analyze project modules and add code annotations in two phases
agent: build
---

You will work in **two phases**. Complete Phase 1 fully before starting Phase 2.

---

## Phase 1: Module Analysis

1. Scan the project structure. Skip these directories: `node_modules`, `.git`, `dist`, `build`, `.next`, `out`, `target`, `vendor`, `__pycache__`, `.cache`, `coverage`, `.turbo`, `.changeset`, `*.tsbuildinfo`.

2. Identify the project type: monorepo (has workspaces / packages), single package, or multi-language project.

3. For each top-level module / package / meaningful directory, read its key files and produce a structured understanding:

   - Module name and one-sentence responsibility
   - Key files and what each does (one sentence each)
   - Core exports / public API
   - Dependencies on other modules
   - Which modules depend on it

4. Present the analysis as a markdown report in this format:

```
## Module Analysis Report

### [Module Name]
- **Responsibility**: one-sentence description
- **Key Files**:
  - `path/to/file1.ext` — what it does
  - `path/to/file2.ext` — what it does
- **Exports**: list of key exported functions/types/classes
- **Depends On**: other modules it uses
- **Used By**: modules that depend on it

---
(repeat for each module)
```

5. **STOP HERE.** Wait for the user to review and confirm or correct the analysis before proceeding to Phase 2.

---

## Phase 2: Add Annotations

After user confirms the analysis:

1. **Detect comment style per-language:**
   | Language | File header | Doc comments | Inline |
   |----------|------------|--------------|--------|
   | JS / TS | `/** @file ... */` or `//` | `/** ... */` | `//` |
   | Python | `"""Module docstring."""` | `"""..."""` | `#` |
   | Shell (.sh) | `# ...` | `# ...` | `#` |
   | Go | `// ...` | `// ...` | `//` |
   | Rust | `//! ...` (module) | `/// ...` | `//` |
   | Java / Kotlin | `/** ... */` | `/** ... */` | `//` |
   | C / C++ | `/* ... */` | `/** ... */` | `//` |
   | Ruby | `# ...` | `# ...` | `#` |
   | Lua | `-- ...` | `--- ...` | `--` |
   | Other | Use that language's standard comment syntax |

2. **Detect existing project conventions first.** If the project already uses a specific comment style (e.g., all `//` instead of `/** */`), follow the existing style. Check a few existing files before deciding.

3. **Add three types of annotations (only where they don't already exist):**

   a. **File header** — at the top of each source file, a brief description of what the file contains and its role in the module. Skip if the file already has a meaningful header comment.

   b. **Exported functions / classes / interfaces** — a short doc comment explaining purpose, parameters, and return value. Skip if already documented.

   c. **Non-obvious logic blocks** — a brief inline comment before complex logic explaining *why* (intent), not *what* (code already says what). Skip trivial code.

4. **Rules:**
   - Do NOT overwrite or duplicate existing comments.
   - Do NOT modify any code logic — only add comments.
   - Do NOT add emojis to comments.
   - Comment language: match the language of existing comments in the project. If no comments exist yet, use the same natural language as the project's README or CLAUDE.md. If unclear, use the language the user is speaking in this conversation.
   - Skip generated / bundled / minified files.
   - Skip test files unless they lack any documentation and are part of the core module structure.
   - Skip `node_modules`, `dist`, `build`, `.next`, `out`, `target`, `vendor`, `__pycache__`, `.cache`, `coverage`.
   - For large files, focus on top-level structure and exported API. Don't comment every line — only what helps a developer quickly orient themselves.

5. Process files module by module. After annotating each module, briefly list what was changed (file path + type of annotation added).
