# Request Plan Review Automated Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add automatic multi-CLI markdown review to `request-plan-review` and surface reviewer findings as reusable HTML comments with hand-drawn underlines.

**Architecture:** Keep the generated HTML self-contained. Add a small tested Node helper for reviewer discovery, reviews markdown parsing, and review-data injection, then update the skill instructions, template, runtime, and CSS to render automated findings through the existing comments system.

**Tech Stack:** Vanilla JavaScript, Node.js `node:test`, static HTML/CSS, existing CDN-style runtime imports, Rough Notation via dynamic CDN import.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `skills/request-plan-review/scripts/review-utils.mjs` | Pure helper functions for reviewer discovery, review prompt construction, `.reviews.md` formatting/parsing, and safe JSON script generation. |
| `tests/request-plan-review/review-utils.test.mjs` | Unit tests for discovery, location parsing, reviews markdown parsing, failure records, and safe HTML injection data. |
| `skills/request-plan-review/SKILL.md` | Documents the review-on-render workflow, reviewer CLI behavior, reviews markdown sidecar, and new template slot. |
| `skills/request-plan-review/references/review-template.md` | Canonical reviewer output template read before constructing external reviewer prompts. |
| `skills/request-plan-review/assets/template.html` | Adds the inline review-data slot before `runtime.js` initializes. |
| `skills/request-plan-review/assets/runtime.js` | Seeds automated comments, renders reviewer/severity metadata, anchors automated badges, and loads Rough Notation as progressive enhancement. |
| `skills/request-plan-review/assets/style.css` | Styles automated metadata chips, unanchored cards, and CSS fallback highlights. |
| `docs/request-plan-review/automated-comments-demo.html` | Generated verification artifact from a sample markdown file with injected mock review comments. |
| `docs/request-plan-review/automated-comments-demo.reviews.md` | Generated sidecar reviews markdown for the demo. |

## Review CLI Contract

The first implementation supports these command shapes and records failures for commands that exit non-zero or time out:

| Reviewer | Detection | Invocation |
| --- | --- | --- |
| Claude | `command -v claude` | `claude -p "$(cat <prompt-file>)"` |
| Gemini | `command -v gemini` | `gemini -p "$(cat <prompt-file>)"` |
| Codex | `command -v codex` | `codex exec --ask-for-approval never "$(cat <prompt-file>)"` |
| OpenCode | `command -v opencode` | `opencode run "$(cat <prompt-file>)"` |
| Qwen Code | `command -v qwen` | `qwen -p "$(cat <prompt-file>)"` |
| Cursor | `command -v cursor` | detection only in v1; record `Review failed.` with reason `Cursor CLI review mode is not supported by request-plan-review yet.` |

All reviewer invocations run with a 120 second timeout. Each reviewer receives the same prompt text. The workflow continues when a reviewer is unavailable, unsupported, times out, exits non-zero, or returns unparseable output.

---

### Task 1: Add Review Helper Unit

**Files:**
- Create: `skills/request-plan-review/scripts/review-utils.mjs`
- Create: `tests/request-plan-review/review-utils.test.mjs`

- [ ] **Step 1: Create the test directory**

Run:

```bash
mkdir -p tests/request-plan-review
```

Expected: command exits with code 0.

- [ ] **Step 2: Write failing tests for review utility behavior**

Create `tests/request-plan-review/review-utils.test.mjs` with this complete file:

```js
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAutomatedReviewDataScript,
  buildReviewPrompt,
  discoverReviewers,
  parseLocation,
  parseReviewsMarkdown,
  renderReviewsMarkdown,
} from '../../skills/request-plan-review/scripts/review-utils.mjs';

test('discoverReviewers returns only commands found by injected lookup', () => {
  const found = new Set(['claude', 'codex']);
  const reviewers = discoverReviewers({
    lookupCommand(command) {
      return found.has(command) ? `/usr/local/bin/${command}` : null;
    },
  });

  assert.deepEqual(
    reviewers.map((reviewer) => reviewer.id),
    ['claude', 'codex'],
  );
  assert.equal(reviewers[0].displayName, 'Claude');
  assert.equal(reviewers[1].command, 'codex');
});

test('parseLocation handles a single source line', () => {
  assert.deepEqual(
    parseLocation('docs/superpowers/plans/example.md:42'),
    {
      path: 'docs/superpowers/plans/example.md',
      startLine: 42,
      endLine: 42,
    },
  );
});

test('parseLocation handles a source range', () => {
  assert.deepEqual(
    parseLocation('docs/superpowers/plans/example.md:42-48'),
    {
      path: 'docs/superpowers/plans/example.md',
      startLine: 42,
      endLine: 48,
    },
  );
});

test('parseReviewsMarkdown extracts valid findings and ignores no-findings blocks', () => {
  const markdown = `# Automated Reviews: docs/superpowers/plans/example.md

## Reviewer: claude

### Finding: Missing failure path
Severity: high
Location: docs/superpowers/plans/example.md:42-48
Quote:
> generated HTML has no source-line annotations

Comment:
This step assumes the command succeeds but does not define the failure path.

## Reviewer: gemini

No findings.
`;

  const result = parseReviewsMarkdown(markdown, {
    sourcePath: 'docs/superpowers/plans/example.md',
  });

  assert.deepEqual(result.warnings, []);
  assert.equal(result.comments.length, 1);
  assert.deepEqual(result.comments[0], {
    id: 'A1',
    source: 'automated',
    reviewer: 'claude',
    severity: 'high',
    title: 'Missing failure path',
    startLine: 42,
    endLine: 48,
    selectedText: 'generated HTML has no source-line annotations',
    comment: 'This step assumes the command succeeds but does not define the failure path.',
    unanchored: false,
  });
});

test('parseReviewsMarkdown records warnings for invalid severity and skips block', () => {
  const markdown = `# Automated Reviews: docs/superpowers/plans/example.md

## Reviewer: claude

### Finding: Unsupported severity
Severity: urgent
Location: docs/superpowers/plans/example.md:4

Comment:
The severity is not in the supported set.
`;

  const result = parseReviewsMarkdown(markdown, {
    sourcePath: 'docs/superpowers/plans/example.md',
  });

  assert.equal(result.comments.length, 0);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /invalid severity/);
});

test('renderReviewsMarkdown writes no-review status when no reviewers ran', () => {
  const markdown = renderReviewsMarkdown({
    sourcePath: 'docs/superpowers/plans/example.md',
    results: [],
  });

  assert.match(markdown, /^# Automated Reviews: docs\/superpowers\/plans\/example\.md/);
  assert.match(markdown, /Automated reviews were not run\./);
  assert.match(markdown, /Reason:\nNo supported external reviewer CLI was detected\./);
});

test('renderReviewsMarkdown writes findings and failures', () => {
  const markdown = renderReviewsMarkdown({
    sourcePath: 'docs/superpowers/plans/example.md',
    results: [
      {
        reviewer: 'claude',
        findingsMarkdown: `### Finding: Missing failure path
Severity: high
Location: docs/superpowers/plans/example.md:42
Quote:
> failure path

Comment:
Define the failure path.`,
      },
      {
        reviewer: 'gemini',
        error: 'Process timed out after 120 seconds.',
      },
    ],
  });

  assert.match(markdown, /## Reviewer: claude/);
  assert.match(markdown, /### Finding: Missing failure path/);
  assert.match(markdown, /## Reviewer: gemini/);
  assert.match(markdown, /Review failed\./);
  assert.match(markdown, /Process timed out after 120 seconds\./);
});

test('buildAutomatedReviewDataScript safely escapes script-breaking text', () => {
  const script = buildAutomatedReviewDataScript([
    {
      id: 'A1',
      source: 'automated',
      reviewer: 'claude',
      severity: 'high',
      title: '</script><script>alert(1)</script>',
      startLine: 1,
      endLine: 1,
      selectedText: '</script>',
      comment: 'escape this',
      unanchored: false,
    },
  ]);

  assert.match(script, /window\.__AUTOMATED_REVIEW_COMMENTS__ = /);
  assert.doesNotMatch(script, /<\/script>/i);
  assert.match(script, /\\u003c\\/script/);
});

test('buildReviewPrompt includes source path, content, and strict output format', () => {
  const prompt = buildReviewPrompt({
    sourcePath: 'docs/superpowers/plans/example.md',
    markdown: '# Example\n\nPlan body.',
    reviewTemplate: '### Finding: <short title>\nSeverity: <critical|high|medium|low|note>',
  });

  assert.match(prompt, /Review this markdown plan or spec/);
  assert.match(prompt, /docs\/superpowers\/plans\/example\.md/);
  assert.match(prompt, /### Finding: <short title>/);
  assert.match(prompt, /# Example/);
});
```

- [ ] **Step 3: Run the tests to verify they fail because the helper is missing**

Run:

```bash
node --test tests/request-plan-review/review-utils.test.mjs
```

Expected: FAIL with an error like `Cannot find module ... review-utils.mjs`.

- [ ] **Step 4: Implement the review helper**

Create `skills/request-plan-review/scripts/review-utils.mjs` with this complete file:

```js
import { execFileSync } from 'node:child_process';

export const REVIEWER_CANDIDATES = [
  { id: 'claude', displayName: 'Claude', command: 'claude', supported: true },
  { id: 'gemini', displayName: 'Gemini', command: 'gemini', supported: true },
  { id: 'codex', displayName: 'Codex', command: 'codex', supported: true },
  { id: 'opencode', displayName: 'OpenCode', command: 'opencode', supported: true },
  { id: 'qwen', displayName: 'Qwen Code', command: 'qwen', supported: true },
  { id: 'cursor', displayName: 'Cursor', command: 'cursor', supported: false },
];

export const ALLOWED_SEVERITIES = new Set([
  'critical',
  'high',
  'medium',
  'low',
  'note',
]);

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function defaultLookupCommand(command) {
  try {
    return execFileSync('/bin/sh', ['-lc', `command -v ${shellQuote(command)}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || null;
  } catch {
    return null;
  }
}

export function discoverReviewers(options = {}) {
  const lookupCommand = options.lookupCommand || defaultLookupCommand;
  return REVIEWER_CANDIDATES
    .map((candidate) => ({
      ...candidate,
      path: lookupCommand(candidate.command),
    }))
    .filter((candidate) => Boolean(candidate.path));
}

export function parseLocation(rawLocation) {
  const value = String(rawLocation || '').trim();
  const match = value.match(/^(.+):(\d+)(?:-(\d+))?$/);
  if (!match) {
    throw new Error(`invalid location: ${value}`);
  }

  const startLine = Number(match[2]);
  const endLine = match[3] ? Number(match[3]) : startLine;

  if (!Number.isInteger(startLine) || startLine < 1) {
    throw new Error(`invalid start line in location: ${value}`);
  }
  if (!Number.isInteger(endLine) || endLine < startLine) {
    throw new Error(`invalid end line in location: ${value}`);
  }

  return {
    path: match[1],
    startLine,
    endLine,
  };
}

function readField(block, name) {
  const pattern = new RegExp(`^${name}:\\s*(.+)$`, 'm');
  const match = block.match(pattern);
  return match ? match[1].trim() : '';
}

function readSection(block, name) {
  const pattern = new RegExp(`^${name}:\\n([\\s\\S]*?)(?=\\n[A-Z][A-Za-z ]*:\\n|\\n### Finding:|\\n## Reviewer:|$)`, 'm');
  const match = block.match(pattern);
  return match ? match[1].trim() : '';
}

function normalizeQuote(quoteBlock) {
  return quoteBlock
    .split('\n')
    .map((line) => line.replace(/^>\s?/, ''))
    .join('\n')
    .trim();
}

function parseReviewerBlocks(markdown) {
  const blocks = [];
  const reviewerPattern = /^## Reviewer:\s*(.+)$/gm;
  const matches = Array.from(markdown.matchAll(reviewerPattern));

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    blocks.push({
      reviewer: match[1].trim(),
      body: markdown.slice(match.index + match[0].length, next ? next.index : markdown.length),
    });
  }

  return blocks;
}

export function parseReviewsMarkdown(markdown, options = {}) {
  const sourcePath = options.sourcePath || '';
  const comments = [];
  const warnings = [];
  const reviewerBlocks = parseReviewerBlocks(String(markdown || ''));

  for (const reviewerBlock of reviewerBlocks) {
    const findingPattern = /^### Finding:\s*(.+)$/gm;
    const matches = Array.from(reviewerBlock.body.matchAll(findingPattern));

    for (let index = 0; index < matches.length; index += 1) {
      const match = matches[index];
      const next = matches[index + 1];
      const title = match[1].trim();
      const block = reviewerBlock.body.slice(
        match.index + match[0].length,
        next ? next.index : reviewerBlock.body.length,
      );

      const severity = readField(block, 'Severity').toLowerCase();
      if (!ALLOWED_SEVERITIES.has(severity)) {
        warnings.push(`ignored finding "${title}" from ${reviewerBlock.reviewer}: invalid severity "${severity}"`);
        continue;
      }

      const rawLocation = readField(block, 'Location');
      let location;
      try {
        location = parseLocation(rawLocation);
      } catch (error) {
        warnings.push(`ignored finding "${title}" from ${reviewerBlock.reviewer}: ${error.message}`);
        continue;
      }

      const comment = readSection(block, 'Comment');
      if (!comment) {
        warnings.push(`ignored finding "${title}" from ${reviewerBlock.reviewer}: missing Comment section`);
        continue;
      }

      comments.push({
        id: `A${comments.length + 1}`,
        source: 'automated',
        reviewer: reviewerBlock.reviewer,
        severity,
        title,
        startLine: location.startLine,
        endLine: location.endLine,
        selectedText: normalizeQuote(readSection(block, 'Quote')),
        comment,
        unanchored: Boolean(sourcePath && location.path !== sourcePath),
      });
    }
  }

  return { comments, warnings };
}

function ensureTrailingNewline(value) {
  return value.endsWith('\n') ? value : `${value}\n`;
}

export function renderReviewsMarkdown({ sourcePath, results }) {
  const parts = [`# Automated Reviews: ${sourcePath}`, ''];

  if (!results || results.length === 0) {
    parts.push(
      'Automated reviews were not run.',
      '',
      'Reason:',
      'No supported external reviewer CLI was detected.',
      '',
    );
    return parts.join('\n');
  }

  for (const result of results) {
    parts.push(`## Reviewer: ${result.reviewer}`, '');
    if (result.error) {
      parts.push('Review failed.', '', 'Reason:', result.error, '');
      continue;
    }

    const findingsMarkdown = String(result.findingsMarkdown || '').trim();
    parts.push(findingsMarkdown ? ensureTrailingNewline(findingsMarkdown).trimEnd() : 'No findings.', '');
  }

  return parts.join('\n');
}

export function buildAutomatedReviewDataScript(comments) {
  const json = JSON.stringify(comments || [], null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `window.__AUTOMATED_REVIEW_COMMENTS__ = ${json};`;
}

export function buildReviewPrompt({ sourcePath, markdown, reviewTemplate }) {
  return `Review this markdown plan or spec.

Source path: ${sourcePath}

Use this review template exactly:

${reviewTemplate}

Markdown to review:

${markdown}`;
}
```

- [ ] **Step 5: Run the review utility tests**

Run:

```bash
node --test tests/request-plan-review/review-utils.test.mjs
```

Expected: PASS with all tests in `review-utils.test.mjs` passing.

- [ ] **Step 6: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 7: Commit the helper and tests**

Run:

```bash
git add skills/request-plan-review/scripts/review-utils.mjs tests/request-plan-review/review-utils.test.mjs
git commit -m ":sparkles: feat(review): add automated review utilities"
```

Expected: commit succeeds.

---

### Task 2: Document Review-On-Render Workflow

**Files:**
- Create: `skills/request-plan-review/references/review-template.md`
- Modify: `skills/request-plan-review/SKILL.md`

- [ ] **Step 1: Create the automated review output template reference**

Create the directory:

```bash
mkdir -p skills/request-plan-review/references
```

Expected: command exits with code 0.

Create `skills/request-plan-review/references/review-template.md` with this complete file:

```markdown
# Automated Review Template

Use this reference when `request-plan-review` runs automated markdown reviews.
Each external reviewer must receive a prompt that requires this output format.
The renderer parses this format and converts findings into HTML comments.

## Reviewer Instructions

Review the source markdown plan or spec. Do not review the rendered HTML.
The review prompt must provide both the source path and the full markdown
contents. Use the provided source path in every `Location:` field.

Focus on:

- Executability gaps.
- Missing steps.
- Contradictions.
- Risky assumptions.
- Missing tests or weak verification.
- Unclear ownership or unclear file boundaries.
- Steps that are too vague for another agent to execute safely.

Do not rewrite the source document. Return only concrete findings that are
tied to source markdown line numbers.

## Finding Template

Every finding must use this exact markdown shape:

```markdown
### Finding: <short title>
Severity: <critical|high|medium|low|note>
Location: <source-path>:<line-or-start-end>
Quote:
> <short source quote>

Comment:
<specific actionable review comment>
```

Rules:

- `Severity` must be one of `critical`, `high`, `medium`, `low`, or `note`.
- `Location` must use the source markdown path and a 1-indexed line number or
  line range.
- `Quote` should be a short excerpt from the source markdown at that location.
- `Comment` should explain the problem and the concrete fix.
- Use one `### Finding:` block per issue.
- If there are no findings, return exactly `No findings.`

## Example

```markdown
### Finding: Missing failure path
Severity: high
Location: docs/superpowers/plans/example.md:42-48
Quote:
> generated HTML has no source-line annotations

Comment:
This step assumes the command succeeds but does not define what to do when the
generated HTML is missing source-line annotations. Add an explicit fallback or
failure condition before the commit step.
```

## No Findings Template

```markdown
No findings.
```
```

Expected: the reference file exists and contains the reviewer output template.

- [ ] **Step 2: Update the workflow section**

In `skills/request-plan-review/SKILL.md`, replace the numbered workflow list under `## Workflow` with this text:

```markdown
1. Read the target `.md` file.
2. Read `skills/request-plan-review/assets/template.html` as the HTML shell.
3. Read `skills/request-plan-review/assets/style.css` and `skills/request-plan-review/assets/runtime.js` — these will be inlined into the HTML.
4. Run automated markdown review:
   - Import helper functions from `skills/request-plan-review/scripts/review-utils.mjs`.
   - Read `skills/request-plan-review/references/review-template.md`.
   - Discover available reviewer CLIs with `discoverReviewers()`.
   - Build one prompt with `buildReviewPrompt({ sourcePath, markdown, reviewTemplate })`, where `sourcePath` is the target `.md` plan/spec address and `markdown` is the full target file contents.
   - Run every supported detected reviewer with a 120 second timeout.
   - Write `docs/request-plan-review/<filename>.reviews.md` with `renderReviewsMarkdown(...)`.
   - Parse that reviews markdown with `parseReviewsMarkdown(...)`.
   - Build review data with `buildAutomatedReviewDataScript(...)`.
   - If no reviewer CLI is detected, still write a `.reviews.md` file that records automated reviews were not run.
   - If a reviewer fails, times out, or returns invalid output, record the failure in `.reviews.md` and continue rendering.
5. Convert the markdown content to HTML manually (see MD→HTML rules below).
6. Generate a TOC sidebar from all h2/h3 headings.
7. Fill the template slots:
   - `<!-- SLOT:TITLE -->` — page title and topbar (use first h1 text or filename)
   - `<!-- SLOT:SOURCE -->` — relative path of the source `.md` file (e.g. `docs/plans/my-plan.md`)
   - `<!-- SLOT:STYLE -->` — paste the full contents of `style.css` (replaces the entire line including the `/* SLOT:STYLE */` comment)
   - `<!-- SLOT:CONTENT -->` — the converted HTML content
   - `<!-- SLOT:TOC_SIDEBAR -->` — the generated TOC sidebar HTML
   - `/* SLOT:REVIEW_DATA */` — paste the full output from `buildAutomatedReviewDataScript(...)`
   - `/* SLOT:SCRIPT */` — paste the full contents of `runtime.js` (replaces the entire line including the `/* SLOT:SCRIPT */` comment)
8. Write the result to `docs/request-plan-review/<filename>.html` (same basename as source).
9. Run `open docs/request-plan-review/<filename>.html`.
```

- [ ] **Step 3: Add automated review output format documentation**

After the current `## Source Line Annotation` section and before `## Verification`, insert this section:

```markdown
## Automated Review Comments

During generation, create a sidecar reviews file:

```text
docs/request-plan-review/<filename>.reviews.md
```

Reviewer findings use this parseable markdown format:

```markdown
## Reviewer: claude

### Finding: Missing failure path
Severity: high
Location: docs/superpowers/plans/example.md:42-48
Quote:
> original markdown snippet

Comment:
This step assumes the command succeeds but does not define what to do if the
generated HTML has no source-line annotations.
```

Allowed severity values are `critical`, `high`, `medium`, `low`, and `note`.

Injected automated comments use this shape:

```js
window.__AUTOMATED_REVIEW_COMMENTS__ = [
  {
    id: 'A1',
    source: 'automated',
    reviewer: 'claude',
    severity: 'high',
    title: 'Missing failure path',
    startLine: 42,
    endLine: 48,
    selectedText: 'original markdown snippet',
    comment: 'This step assumes the command succeeds...',
    unanchored: false
  }
];
```

Automated comments reuse the existing comments panel. They get `A1`, `A2`, and
`A3` IDs so manual comments can continue using numeric IDs.
```

- [ ] **Step 4: Add verification bullets for automated reviews**

In the `## Verification` checklist, append these bullets:

```markdown
- `docs/request-plan-review/<filename>.reviews.md` exists.
- If no reviewer CLI is available, the reviews file says automated reviews were not run.
- If reviewer findings exist, automated comments appear in the comments panel.
- Rough Notation underlines appear when the CDN is available and CSS highlights remain when it is not.
```

- [ ] **Step 5: Review the skill documentation diff**

Run:

```bash
git diff -- skills/request-plan-review/SKILL.md skills/request-plan-review/references/review-template.md
```

Expected: diff creates the review template reference and documents automated review workflow, target plan/spec address, full markdown content, `/* SLOT:REVIEW_DATA */`, sidecar reviews markdown, injected comments, and verification.

- [ ] **Step 6: Commit the documentation update**

Run:

```bash
git add skills/request-plan-review/SKILL.md skills/request-plan-review/references/review-template.md
git commit -m ":memo: docs(review): document automated plan reviews"
```

Expected: commit succeeds.

---

### Task 3: Add Review Data Slot To Template

**Files:**
- Modify: `skills/request-plan-review/assets/template.html`

- [ ] **Step 1: Add the review data script slot before runtime script**

In `skills/request-plan-review/assets/template.html`, insert this script block after the closing `</div>` for `.container` and before the existing runtime `<script>`:

```html
  <script>
/* SLOT:REVIEW_DATA */
  </script>
```

The bottom of the file should have this shape:

```html
  <div class="container">
    <div class="page-layout">
<!-- SLOT:TOC_SIDEBAR -->
      <article id="content">
<!-- SLOT:CONTENT -->
      </article>
    </div>
  </div>
  <script>
/* SLOT:REVIEW_DATA */
  </script>
  <script>
/* SLOT:SCRIPT */
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify the slot is present exactly once**

Run:

```bash
rg -n "SLOT:REVIEW_DATA" skills/request-plan-review/assets/template.html
```

Expected: one matching line.

- [ ] **Step 3: Commit the template slot**

Run:

```bash
git add skills/request-plan-review/assets/template.html
git commit -m ":wrench: feat(review): add automated review data slot"
```

Expected: commit succeeds.

---

### Task 4: Seed Automated Comments In Runtime

**Files:**
- Modify: `skills/request-plan-review/assets/runtime.js`

- [ ] **Step 1: Add Rough Notation loader before `initCommentSystem()`**

In `skills/request-plan-review/assets/runtime.js`, insert this code before `function initCommentSystem()`:

```js
var roughAnnotate = null;
var roughNotationLoad = null;

function loadRoughNotation() {
  if (roughNotationLoad) return roughNotationLoad;
  roughNotationLoad = import('https://unpkg.com/rough-notation?module')
    .then(function(mod) {
      roughAnnotate = mod.annotate;
      return roughAnnotate;
    })
    .catch(function() {
      roughAnnotate = null;
      return null;
    });
  return roughNotationLoad;
}

function applyRoughAnnotation(el, options) {
  if (!el) return;
  loadRoughNotation().then(function(annotate) {
    if (!annotate || !document.body.contains(el)) return;
    try {
      var annotation = annotate(el, {
        type: 'underline',
        color: options && options.color ? options.color : 'var(--accent)',
        animate: options && Object.prototype.hasOwnProperty.call(options, 'animate') ? options.animate : true,
        multiline: true
      });
      annotation.show();
    } catch (err) {}
  });
}
```

- [ ] **Step 2: Replace comment state initialization**

Inside `initCommentSystem()`, replace:

```js
  var comments = [];
  var nextId = 1;
```

with:

```js
  var comments = seedAutomatedComments();
  var nextId = 1;
```

- [ ] **Step 3: Add automated comment helper functions inside `initCommentSystem()`**

Inside `initCommentSystem()`, after `var panel = document.createElement('aside');`, add these functions:

```js
  function seedAutomatedComments() {
    var raw = Array.isArray(window.__AUTOMATED_REVIEW_COMMENTS__)
      ? window.__AUTOMATED_REVIEW_COMMENTS__
      : [];
    return raw.map(function(c, index) {
      return {
        id: c.id || ('A' + (index + 1)),
        source: 'automated',
        reviewer: c.reviewer || 'reviewer',
        severity: c.severity || 'note',
        title: c.title || 'Automated review comment',
        startLine: parseInt(c.startLine, 10) || 0,
        endLine: parseInt(c.endLine, 10) || parseInt(c.startLine, 10) || 0,
        selectedText: c.selectedText || '',
        comment: c.comment || '',
        unanchored: Boolean(c.unanchored)
      };
    });
  }

  function displayId(c) {
    return String(c.id);
  }

  function commentLocation(c) {
    var start = c.startLine || 0;
    var end = c.endLine || start;
    return sourceFile + ':' + start + (start !== end ? '-' + end : '');
  }

  function severityClass(c) {
    return 'severity-' + String(c.severity || 'note').toLowerCase();
  }

  function automatedMeta(c) {
    if (c.source !== 'automated') return '';
    return '<span class="comment-card-reviewer">' + escapeHtml(c.reviewer || 'reviewer') + '</span>' +
      '<span class="comment-card-severity ' + severityClass(c) + '">' + escapeHtml(c.severity || 'note') + '</span>';
  }
```

- [ ] **Step 4: Update `renderCard(c)` to show automated metadata**

Replace the full `renderCard(c)` function with:

```js
  function renderCard(c) {
    var loc = commentLocation(c);
    var preview = c.selectedText ? c.selectedText.split('\n')[0].slice(0, 60) : '';
    var title = c.source === 'automated' && c.title
      ? '<div class="comment-card-title">' + escapeHtml(c.title) + '</div>'
      : '';
    var unanchored = c.unanchored ? '<span class="comment-card-unanchored">unanchored</span>' : '';
    return '<div class="comment-card ' + (c.source === 'automated' ? 'comment-card-automated' : '') + '" data-id="' + displayId(c) + '">' +
      '<div class="comment-card-header">' +
        '<span>#' + displayId(c) + ' ' + loc + '</span>' +
        '<span class="comment-card-meta">' + automatedMeta(c) + unanchored + '</span>' +
        '<button class="comment-card-delete" data-id="' + displayId(c) + '">&times;</button>' +
      '</div>' +
      title +
      '<div class="comment-card-body">' + escapeHtml(c.comment) + '</div>' +
      (preview ? '<div class="comment-card-preview">' + escapeHtml(preview) + '</div>' : '') +
    '</div>';
  }
```

- [ ] **Step 5: Update numeric ID lookups to support `A1` IDs**

Replace this delete listener block:

```js
    panel.querySelectorAll('.comment-card-delete').forEach(function(btn) {
      btn.addEventListener('click', function() {
        deleteComment(parseInt(btn.dataset.id, 10));
      });
    });
```

with:

```js
    panel.querySelectorAll('.comment-card-delete').forEach(function(btn) {
      btn.addEventListener('click', function() {
        deleteComment(btn.dataset.id);
      });
    });
```

Replace this card click block:

```js
        var id = parseInt(card.dataset.id, 10);
        scrollToBadge(id);
```

with:

```js
        scrollToBadge(card.dataset.id);
```

Replace this active-card line:

```js
      card.classList.toggle('active', parseInt(card.dataset.id, 10) === id);
```

with:

```js
      card.classList.toggle('active', card.dataset.id === String(id));
```

Replace the first line of `deleteComment(id)` body:

```js
    var idx = comments.findIndex(function(x) { return x.id === id; });
```

with:

```js
    id = String(id);
    var idx = comments.findIndex(function(x) { return String(x.id) === id; });
```

- [ ] **Step 6: Apply Rough Notation to manual comments**

Inside `addComment()`, after `mark.after(badge);`, insert:

```js
        applyRoughAnnotation(mark, { animate: true });
```

- [ ] **Step 7: Run syntax check**

Run:

```bash
node --check skills/request-plan-review/assets/runtime.js
```

Expected: exits with code 0.

- [ ] **Step 8: Commit seeded automated comments support**

Run:

```bash
git add skills/request-plan-review/assets/runtime.js
git commit -m ":sparkles: feat(review): seed automated review comments"
```

Expected: commit succeeds.

---

### Task 5: Anchor Automated Badges And Quote Underlines

**Files:**
- Modify: `skills/request-plan-review/assets/runtime.js`

- [ ] **Step 1: Add automated anchoring functions inside `initCommentSystem()`**

Inside `initCommentSystem()`, after `scrollToBadge(id)`, add:

```js
  function canUseRoughNotation(el) {
    return !el.closest('table, pre, code');
  }

  function sourceLineOf(el) {
    return el && el.dataset && el.dataset.sourceLine
      ? parseInt(el.dataset.sourceLine, 10)
      : null;
  }

  function findAnchorForComment(c) {
    var blocks = Array.from(article.querySelectorAll('[data-source-line]'));
    var exact = blocks.find(function(el) {
      return sourceLineOf(el) === c.startLine;
    });
    if (exact) return exact;

    var inRange = blocks.find(function(el) {
      var line = sourceLineOf(el);
      return line && line >= c.startLine && line <= c.endLine;
    });
    if (inRange) return inRange;

    c.unanchored = true;
    return blocks.find(function(el) {
      var line = sourceLineOf(el);
      return line && line > c.endLine;
    }) || null;
  }

  function findTextNode(root, text) {
    if (!text) return null;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var index = node.nodeValue.indexOf(text);
      if (index !== -1) return { node: node, index: index };
    }
    return null;
  }

  function wrapMatchedQuote(anchor, c) {
    if (!c.selectedText || !canUseRoughNotation(anchor)) return null;
    var firstLine = c.selectedText.split('\n').map(function(line) {
      return line.trim();
    }).find(Boolean);
    if (!firstLine) return null;

    var match = findTextNode(anchor, firstLine);
    if (!match) return null;

    var range = document.createRange();
    range.setStart(match.node, match.index);
    range.setEnd(match.node, match.index + firstLine.length);
    var mark = document.createElement('mark');
    mark.className = 'comment-highlight comment-highlight-automated';
    mark.dataset.commentId = displayId(c);
    try {
      range.surroundContents(mark);
      applyRoughAnnotation(mark, { animate: false });
      return mark;
    } catch (err) {
      return null;
    }
  }

  function createBadge(c) {
    var badge = document.createElement('span');
    badge.className = 'comment-badge comment-badge-automated';
    badge.textContent = displayId(c);
    badge.dataset.commentId = displayId(c);
    badge.addEventListener('click', function(e) {
      e.stopPropagation();
      scrollToBadge(displayId(c));
    });
    return badge;
  }

  function applyAutomatedCommentAnchors() {
    comments.filter(function(c) {
      return c.source === 'automated';
    }).forEach(function(c) {
      var anchor = findAnchorForComment(c);
      if (!anchor) {
        c.unanchored = true;
        return;
      }

      var mark = wrapMatchedQuote(anchor, c);
      var badge = createBadge(c);
      if (mark) mark.after(badge);
      else anchor.appendChild(badge);
    });
  }
```

- [ ] **Step 2: Call automated anchoring before the first panel render**

Inside `initCommentSystem()`, replace:

```js
  var panel = document.createElement('aside');
  panel.className = 'comments-panel';
  renderPanel();
  layout.appendChild(panel);
```

with:

```js
  var panel = document.createElement('aside');
  panel.className = 'comments-panel';
  applyAutomatedCommentAnchors();
  renderPanel();
  layout.appendChild(panel);
```

- [ ] **Step 3: Run syntax check**

Run:

```bash
node --check skills/request-plan-review/assets/runtime.js
```

Expected: exits with code 0.

- [ ] **Step 4: Commit automated anchoring**

Run:

```bash
git add skills/request-plan-review/assets/runtime.js
git commit -m ":sparkles: feat(review): anchor automated comments"
```

Expected: commit succeeds.

---

### Task 6: Style Automated Comment Metadata

**Files:**
- Modify: `skills/request-plan-review/assets/style.css`

- [ ] **Step 1: Add automated comment card styles**

Append this CSS near the existing comment system styles in `skills/request-plan-review/assets/style.css`:

```css
.comment-card-automated {
  border-color: var(--border);
}

.comment-card-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding-left: 8px;
}

.comment-card-reviewer,
.comment-card-severity,
.comment-card-unanchored {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 2px 7px;
  font-family: var(--font-primary);
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
}

.comment-card-reviewer {
  background: var(--surface-2);
  color: var(--text-faint);
  border: 1px solid var(--border-soft);
}

.comment-card-severity {
  color: #ffffff;
  background: var(--accent);
}

.comment-card-severity.severity-critical,
.comment-card-severity.severity-high {
  background: var(--orange);
}

.comment-card-severity.severity-medium {
  background: var(--yellow);
  color: var(--text);
}

.comment-card-severity.severity-low,
.comment-card-severity.severity-note {
  background: var(--blue);
}

.comment-card-unanchored {
  color: var(--text-faint);
  border: 1px solid var(--border-soft);
}

.comment-card-title {
  padding: 10px 12px 0;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}

.comment-badge-automated {
  width: auto;
  min-width: 22px;
  padding: 0 6px;
}

.comment-highlight-automated {
  background: transparent;
  border-bottom-color: var(--accent);
}
```

- [ ] **Step 2: Verify CSS selectors are present**

Run:

```bash
rg -n "comment-card-automated|comment-card-severity|comment-highlight-automated" skills/request-plan-review/assets/style.css
```

Expected: prints matching selectors.

- [ ] **Step 3: Commit CSS updates**

Run:

```bash
git add skills/request-plan-review/assets/style.css
git commit -m ":art: style(review): style automated comment metadata"
```

Expected: commit succeeds.

---

### Task 7: Generate Demo With Mock Automated Reviews

**Files:**
- Create: `docs/request-plan-review/automated-comments-demo.html`
- Create: `docs/request-plan-review/automated-comments-demo.reviews.md`

- [ ] **Step 1: Create the request-plan-review output directory**

Run:

```bash
mkdir -p docs/request-plan-review
```

Expected: command exits with code 0.

- [ ] **Step 2: Generate a mock reviews sidecar**

Run:

```bash
cat > docs/request-plan-review/automated-comments-demo.reviews.md <<'EOF'
# Automated Reviews: docs/superpowers/plans/2026-05-22-codemermaid-html-style-application.md

## Reviewer: claude

### Finding: Missing failure path
Severity: high
Location: docs/superpowers/plans/2026-05-22-codemermaid-html-style-application.md:5-8
Quote:
> generated HTML pages

Comment:
Define what the agent should do when generated HTML is missing expected
source-line annotations.

## Reviewer: gemini

### Finding: Verification could be tighter
Severity: medium
Location: docs/superpowers/plans/2026-05-22-codemermaid-html-style-application.md:20
Quote:
> Tech Stack

Comment:
Add one browser-level assertion for the review comment panel so visual
regressions are caught before committing.
EOF
```

Expected: file is created with two findings.

- [ ] **Step 3: Generate review data from the sidecar**

Run:

```bash
node --input-type=module <<'NODE'
import fs from 'node:fs';
import {
  buildAutomatedReviewDataScript,
  parseReviewsMarkdown,
} from './skills/request-plan-review/scripts/review-utils.mjs';

const sourcePath = 'docs/superpowers/plans/2026-05-22-codemermaid-html-style-application.md';
const reviews = fs.readFileSync('docs/request-plan-review/automated-comments-demo.reviews.md', 'utf8');
const { comments, warnings } = parseReviewsMarkdown(reviews, { sourcePath });
if (warnings.length) {
  console.error(warnings.join('\n'));
  process.exit(1);
}
fs.writeFileSync(
  'docs/request-plan-review/automated-comments-demo.review-data.js',
  buildAutomatedReviewDataScript(comments),
);
console.log(`wrote ${comments.length} comments`);
NODE
```

Expected: prints `wrote 2 comments`.

- [ ] **Step 4: Generate a demo HTML with a complete local renderer script**

Run:

```bash
node --input-type=module <<'NODE'
import fs from 'node:fs';
import path from 'node:path';

const source = 'docs/superpowers/plans/2026-05-22-codemermaid-html-style-application.md';
const output = 'docs/request-plan-review/automated-comments-demo.html';
const template = fs.readFileSync('skills/request-plan-review/assets/template.html', 'utf8');
const style = fs.readFileSync('skills/request-plan-review/assets/style.css', 'utf8');
const runtime = fs.readFileSync('skills/request-plan-review/assets/runtime.js', 'utf8');
const reviewData = fs.readFileSync('docs/request-plan-review/automated-comments-demo.review-data.js', 'utf8');
const markdown = fs.readFileSync(source, 'utf8');

const usedIds = new Map();
const toc = [];
const lines = markdown.split(/\r?\n/);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function slugify(value) {
  let base = String(value)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  if (!base) base = 'section';
  const count = (usedIds.get(base) || 0) + 1;
  usedIds.set(base, count);
  return count === 1 ? base : `${base}-${count}`;
}

function renderList(items, type) {
  const hasTasks = items.some((item) => item.task);
  return `<${type}${hasTasks ? ' class="task-list"' : ''}>\n${items.map((item) => `<li data-source-line="${item.line}">${item.html}</li>`).join('\n')}\n</${type}>\n`;
}

let html = '';
let paragraph = [];
let paragraphLine = 0;
let list = [];
let listType = null;

function flushParagraph() {
  if (!paragraph.length) return;
  html += `<p data-source-line="${paragraphLine}">${inlineMarkdown(paragraph.join(' '))}</p>\n`;
  paragraph = [];
  paragraphLine = 0;
}

function flushList() {
  if (!list.length) return;
  html += renderList(list, listType);
  list = [];
  listType = null;
}

for (let index = 0; index < lines.length; index += 1) {
  const raw = lines[index];
  const lineNumber = index + 1;
  const fence = raw.match(/^```(\w+)?\s*$/);

  if (fence) {
    flushParagraph();
    flushList();
    const language = fence[1] || '';
    const startLine = lineNumber;
    const body = [];
    index += 1;
    while (index < lines.length && !/^```\s*$/.test(lines[index])) {
      body.push(lines[index]);
      index += 1;
    }
    if (language === 'mermaid') {
      html += `<pre class="mermaid" data-source-line="${startLine}">${escapeHtml(body.join('\n'))}</pre>\n`;
    } else {
      html += `<pre data-source-line="${startLine}"><code${language ? ` class="language-${language}"` : ''}>${escapeHtml(body.join('\n'))}</code>${language ? `<span class="code-lang">${language}</span><button class="copy-btn">Copy</button>` : ''}</pre>\n`;
    }
    continue;
  }

  if (!raw.trim()) {
    flushParagraph();
    flushList();
    continue;
  }

  if (/^---+$/.test(raw.trim())) {
    flushParagraph();
    flushList();
    html += `<hr data-source-line="${lineNumber}">\n`;
    continue;
  }

  const heading = raw.match(/^(#{1,4})\s+(.+)$/);
  if (heading) {
    flushParagraph();
    flushList();
    const level = heading[1].length;
    const text = heading[2].trim();
    if (level === 2 || level === 3) {
      const id = slugify(text);
      toc.push({ level, id, text });
      html += `<h${level} data-source-line="${lineNumber}" id="${id}">${inlineMarkdown(text)}</h${level}>\n`;
    } else {
      html += `<h${level} data-source-line="${lineNumber}">${inlineMarkdown(text)}</h${level}>\n`;
    }
    continue;
  }

  const quote = raw.match(/^>\s*(.*)$/);
  if (quote) {
    flushParagraph();
    flushList();
    html += `<blockquote data-source-line="${lineNumber}"><p data-source-line="${lineNumber}">${inlineMarkdown(quote[1])}</p></blockquote>\n`;
    continue;
  }

  const unordered = raw.match(/^[-*]\s+(.*)$/);
  const ordered = raw.match(/^\d+\.\s+(.*)$/);
  if (unordered || ordered) {
    flushParagraph();
    const type = unordered ? 'ul' : 'ol';
    if (listType && listType !== type) flushList();
    listType = type;
    let text = (unordered || ordered)[1];
    const task = text.match(/^\[([ xX])\]\s+(.*)$/);
    if (task) {
      text = `<input type="checkbox"${task[1].toLowerCase() === 'x' ? ' checked disabled' : ''}> <span>${inlineMarkdown(task[2])}</span>`;
    } else {
      text = inlineMarkdown(text);
    }
    list.push({ line: lineNumber, html: text, task: Boolean(task) });
    continue;
  }

  flushList();
  if (!paragraph.length) paragraphLine = lineNumber;
  paragraph.push(raw.trim());
}

flushParagraph();
flushList();

const title = (markdown.match(/^#\s+(.+)$/m)?.[1] || path.basename(source, '.md')).trim();
const tocSidebar = `<aside class="toc-sidebar">\n  <nav>\n    <div class="toc-sidebar-title">On this page</div>\n    <ul>\n${toc.map((entry) => `      <li${entry.level === 3 ? ' class="toc-h3"' : ''}><a href="#${entry.id}">${escapeHtml(entry.text)}</a></li>`).join('\n')}\n    </ul>\n  </nav>\n</aside>`;

const page = template
  .replaceAll('<!-- SLOT:TITLE -->', escapeHtml(title))
  .replace('<!-- SLOT:SOURCE -->', source)
  .replace('/* SLOT:STYLE */', style)
  .replace('<!-- SLOT:TOC_SIDEBAR -->', tocSidebar)
  .replace('<!-- SLOT:CONTENT -->', html)
  .replace('/* SLOT:REVIEW_DATA */', reviewData)
  .replace('/* SLOT:SCRIPT */', runtime);

fs.writeFileSync(output, page);
console.log(output);
NODE
```

Expected: prints `docs/request-plan-review/automated-comments-demo.html`.

- [ ] **Step 5: Verify the generated HTML contains review data and no review slot**

Run:

```bash
rg -n "__AUTOMATED_REVIEW_COMMENTS__|comment-card-severity" docs/request-plan-review/automated-comments-demo.html
rg -n "SLOT:REVIEW_DATA" docs/request-plan-review/automated-comments-demo.html || true
```

Expected: the first command prints matching lines; the second command prints no output.

- [ ] **Step 6: Remove the temporary review data file**

Run:

```bash
rm docs/request-plan-review/automated-comments-demo.review-data.js
```

Expected: file is removed.

- [ ] **Step 7: Open the demo**

Run:

```bash
open docs/request-plan-review/automated-comments-demo.html
```

Expected: browser opens the generated page. The comments panel shows two automated comments with reviewer and severity metadata.

- [ ] **Step 8: Commit the demo artifacts**

Run:

```bash
git add docs/request-plan-review/automated-comments-demo.html docs/request-plan-review/automated-comments-demo.reviews.md
git commit -m ":memo: docs(review): add automated comments demo"
```

Expected: commit succeeds.

---

### Task 8: Final Verification

**Files:**
- Inspect: `skills/request-plan-review/SKILL.md`
- Inspect: `skills/request-plan-review/assets/template.html`
- Inspect: `skills/request-plan-review/assets/runtime.js`
- Inspect: `skills/request-plan-review/assets/style.css`
- Inspect: `skills/request-plan-review/scripts/review-utils.mjs`
- Inspect: `tests/request-plan-review/review-utils.test.mjs`
- Inspect: `docs/request-plan-review/automated-comments-demo.html`
- Inspect: `docs/request-plan-review/automated-comments-demo.reviews.md`

- [ ] **Step 1: Run all tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 2: Run runtime syntax checks**

Run:

```bash
node --check skills/request-plan-review/assets/runtime.js
node --check skills/request-plan-review/scripts/review-utils.mjs
```

Expected: both commands exit with code 0.

- [ ] **Step 3: Verify template slots are filled in the demo**

Run:

```bash
rg -n "SLOT:TITLE|SLOT:SOURCE|SLOT:STYLE|SLOT:CONTENT|SLOT:TOC_SIDEBAR|SLOT:REVIEW_DATA|SLOT:SCRIPT" docs/request-plan-review/automated-comments-demo.html || true
```

Expected: no output.

- [ ] **Step 4: Verify sidecar reviews format**

Run:

```bash
rg -n "Automated Reviews|Reviewer:|Finding:|Severity:|Location:|Comment:" docs/request-plan-review/automated-comments-demo.reviews.md
```

Expected: prints the automated reviews heading, two reviewer headings, two finding headings, severity lines, location lines, and comment sections.

- [ ] **Step 5: Browser-check automated comments**

Open:

```bash
open docs/request-plan-review/automated-comments-demo.html
```

Expected:

- The comments panel starts with two automated comments.
- Each automated card shows reviewer and severity metadata.
- At least one automated badge appears in the article.
- Manual text-selection comments still work.
- Theme toggle keeps automated comments legible in light and dark mode.
- If the Rough Notation CDN is reachable, matching quote text gets hand-drawn underlines.
- If the Rough Notation CDN is blocked, CSS highlight and badges still appear.

- [ ] **Step 6: Review git diff**

Run:

```bash
git diff --stat HEAD~7..HEAD
git status --short
```

Expected: diff only contains request-plan-review assets, helper tests, the demo sidecar, and generated demo HTML. `git status --short` is clean.

## Self-Review

Spec coverage:

- Automatic review-on-render is covered by Tasks 1, 2, and 7.
- Reviewer discovery and CLI failure behavior are covered by Task 1.
- Sidecar `.reviews.md` generation and parsing are covered by Tasks 1 and 7.
- `/* SLOT:REVIEW_DATA */` and self-contained HTML injection are covered by Tasks 2 and 3.
- Existing comments template reuse is covered by Tasks 4, 5, and 6.
- Rough Notation as a CDN-loaded progressive enhancement is covered by Tasks 4, 5, 6, and 8.
- No-review and reviewer failure paths are covered by Task 1 tests.

Placeholder scan:

- The plan contains concrete file paths, concrete test files, exact helper code, exact runtime snippets, exact CSS, exact commands, and expected outputs.

Type consistency:

- Automated comment fields use the same names throughout: `id`, `source`, `reviewer`, `severity`, `title`, `startLine`, `endLine`, `selectedText`, `comment`, and `unanchored`.
- Review parser output matches `window.__AUTOMATED_REVIEW_COMMENTS__` input.
- Manual comments keep numeric IDs while automated comments use string IDs such as `A1`.
