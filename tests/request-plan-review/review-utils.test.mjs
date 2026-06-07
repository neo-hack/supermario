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
  assert.match(script, /\\u003c\/script/);
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
