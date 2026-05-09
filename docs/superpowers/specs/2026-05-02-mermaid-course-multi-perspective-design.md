# Mermaid Course Multi-Perspective Design

**Date:** 2026-05-02
**Skill:** `skills/codemermaid/`
**Status:** Draft
**Superseded (in part):** by `2026-05-03-codemermaid-essay-design.md` — the multi-page output structure stays; the per-page click-explore template is replaced by scrollable essays.

## Problem

The current `codemermaid` skill outputs a single HTML file with one Mermaid graph. This breaks down when:

1. **Large projects** — 10+ modules cannot fit meaningfully in one diagram
2. **Single perspective** — only shows module dependencies, not data flow, state machines, request traces, etc.
3. **No navigation** — no way to move between different views of the same codebase
4. **Shallow coverage** — no deep-dive into individual modules from multiple angles

The user wants to teach others how a codebase works. Teaching requires multiple perspectives (architecture, data flow, implementation) and the ability to go from macro to micro.

## Solution

Upgrade from single-file to multi-file output with an index page as router and flexible perspective pages.

### Output Structure

```
docs/codebase-course/
  index.html                    ← Entry page (perspective + module cards)
  architecture.html             ← Architecture perspective
  <perspective-name>.html       ← Other perspectives (agent decides)
  module-<name>.html            ← Per-module deep dives (agent decides)
```

### Navigation Model

- **index.html** — card grid listing all perspectives and modules, each card links to a sub-page
- **Sub-pages** — reuse `template-course.html` layout (Mermaid + detail panel) with breadcrumb back to index
- **Cross-linking** — perspective pages link to module pages via "Deep dive →" button in detail panel

### Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Navigation model | Index + separate pages | Each page independently shareable; templates reuse directly |
| Perspective types | Fully flexible, agent decides | Different projects need different views; no fixed template |
| Perspective selection | User-specified (mandatory) + auto-inferred (supplementary) | User can force specific views; agent fills gaps |
| File naming | `index.html` fixed, rest agent-decides in kebab-case | Flexibility for different project structures |
| Templates | 2 templates (`index` + `course`) | Minimal; index is card nav, course is interactive Mermaid |
| State sharing | None across pages | Each page is self-contained; simplicity over SPA complexity |

## Architecture

### Phase Workflow (6 phases)

```
Phase 1: Scan (unchanged)
    └─ Exhaustive module discovery + dependency mapping

Phase 2: Analyze (enhanced)
    ├─ Architecture pattern, data flow, module graph, key abstractions
    ├─ Parse user perspective requirements (mandatory list)
    ├─ Auto-infer perspectives from project characteristics
    └─ Merge into final perspective list

Phase 3: Build Data (enhanced)
    ├─ COURSE object (unchanged, for module pages)
    ├─ INDEX object (new, for index.html)
    └─ PERSPECTIVE objects (new, one per perspective page)

Phase 4: Build Graphs (enhanced)
    └─ One Mermaid graph per perspective page + per module page

Phase 5: Generate Page List (new)
    └─ Determine which files to generate based on perspective list

Phase 6: Assemble (was Phase 5)
    └─ Read templates, fill data, output all files
```

### Data Structures

#### INDEX (for index.html)

```javascript
const INDEX = {
  project: {
    name: "Project Name",
    description: "One-line description",
    language: "TypeScript",
    framework: "Next.js"
  },
  perspectives: [
    {
      title: "Architecture Overview",
      description: "12 modules across 5 layers",
      page: "architecture.html",
      diagramType: "graph TD"
    }
  ],
  modules: [
    {
      title: "user-service",
      description: "User management and authentication",
      page: "module-user-service.html",
      steps: 3
    }
  ]
};
```

#### PERSPECTIVE (for perspective pages)

```javascript
const PERSPECTIVE = {
  title: "Request Lifecycle",
  backLink: "index.html",
  graph: "sequenceDiagram\n  participant Client\n  ...",
  nodes: [
    {
      id: "auth",
      label: "Auth Middleware",
      summary: "Validates JWT tokens and sets user context.",
      deepLink: "module-auth.html"
    }
  ]
};
```

#### COURSE (unchanged, for module pages)

Existing structure with `flowOrder`, `label`, `summary`, `files`, `steps[]`. Used exclusively by module deep-dive pages (`module-*.html`). Not used by perspective pages.

### Perspective System

#### Perspective Types

| Type | Mermaid Diagram | When to Use | Detail Panel Shows |
|------|----------------|-------------|-------------------|
| Architecture | `graph TD` + subgraph | All projects (mandatory) | Module overview + deep-dive link |
| Data Flow | `sequenceDiagram` | Has request processing chain | Participant role + deep-dive link |
| Module Dependency | `graph LR` / `graph TD` | 10+ modules | Dependency description |
| Data Model | `classDiagram` / `erDiagram` | Has database/ORM layer | Field descriptions |
| State Machine | `stateDiagram-v2` | Has state management | Transition explanation |
| Build Pipeline | `graph LR` | Has CI/CD config | Stage description |
| Custom | Any | Agent decides | Agent decides |

#### Perspective Selection Priority

1. **User-specified** — parsed from user prompt, mandatory, cannot be omitted
2. **Auto-inferred** — agent selects based on project characteristics (supplementary)
3. **Coverage rule** — every discovered module must be reachable from at least one perspective page

### Template System

#### `template-index.html` (new)

Entry page. Card navigation, no Mermaid.

**Agent replaces:**

| Placeholder | Content |
|-------------|---------|
| `{{PROJECT_NAME}}` | Project name |
| `{{PROJECT_DESCRIPTION}}` | One-line description |
| `{{LANGUAGE}}` | Language badge |
| `{{FRAMEWORK}}` | Framework badge (optional, empty string if none) |
| `{{INDEX_DATA}}` | `INDEX` JS object |

**Runtime provides:**
- Responsive card grid (2-3 columns)
- Perspective card rendering (title + description + diagram type badge)
- Module card rendering (title + description + step count)
- Same design system CSS variables

#### `template-course.html` (renamed from template.html)

Sub-page. Mermaid + detail panel + breadcrumb.

**New placeholders vs template.html:**

| Placeholder | Content | New? |
|-------------|---------|------|
| `{{PROJECT_NAME}}` | Project name | Existing |
| `{{LANGUAGE}}` | Language badge | Existing |
| `{{MERMAID_GRAPH}}` | Mermaid graph definition | Existing |
| `{{BREADCRUMB_TITLE}}` | Page title for breadcrumb | New |
| `{{BACK_LINK}}` | URL back to index, always `index.html` | New |

**New detail panel behavior:**
- Perspective pages: click node → show summary + `→ Deep dive into module-name` button linking to module page
- Module pages: click node → show code step (existing behavior, unchanged)

### File Organization

```
skills/codemermaid/
  SKILL.md                         ← Updated: 6-phase workflow + perspective system
  references/
    design-system.md               ← Unchanged
    template-index.html            ← New: entry page template
    template-course.html           ← Renamed (was template.html) + breadcrumb
```

## What Changes

| Component | Before | After |
|-----------|--------|-------|
| Output | `docs/codebase-course.html` (single file) | `docs/codebase-course/` (directory) |
| Templates | 1 (`template.html`) | 2 (`template-index.html` + `template-course.html`) |
| Phases | 5 | 6 (new Phase 5: page list generation) |
| Perspectives | 1 (architecture only) | Flexible, agent-decides |
| User control | None over perspectives | User can specify mandatory perspectives |
| Navigation | None | Index → sub-pages, breadcrumb back, cross-links |
| Data structures | `COURSE` only | `COURSE` + `INDEX` + `PERSPECTIVE` |

## What Does NOT Change

- Phase 1 (Scan) — exhaustive module discovery logic unchanged
- `COURSE` data structure — module pages use same format
- `design-system.md` — Raycast-inspired dark theme unchanged
- Runtime logic in `template-course.html` — Mermaid init, click callback, zoom, flow animation, detail panel rendering all unchanged
- Important Rules — real code only, securityLevel loose, 500ms init delay
- Common Mistakes table

## SKILL.md Update Summary

| Section | Change |
|---------|--------|
| Description | Add "multi-perspective", "multi-page" |
| When to Use | No change |
| When NOT to Use | No change |
| Output | Single file → directory |
| Phase 1 | No change |
| Phase 2 | Add user perspective parsing + auto-inference + merge |
| Phase 3 | Add `INDEX` and `PERSPECTIVE` data structure definitions |
| Phase 4 | Clarify: one graph per page, node IDs consistent across pages |
| Phase 5 | New: determine file list from perspective list |
| Phase 6 | Was Phase 5: read both templates, fill data, output all files |
| Design System | No change (still references `design-system.md`) |
| Important Rules | Add: every module reachable from at least one perspective |
| Common Mistakes | No change |
| File Organization | Add `template-index.html`, rename to `template-course.html` |
