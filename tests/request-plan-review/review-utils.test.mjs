import test from 'node:test';
import assert from 'node:assert/strict';

import * as reviewUtils from '../../skills/request-plan-review/scripts/review-utils.mjs';

test('review utils only exports prompt construction', () => {
  assert.deepEqual(Object.keys(reviewUtils), ['buildReviewPrompt']);
});

test('buildReviewPrompt includes source path, content, and strict output format', () => {
  const prompt = reviewUtils.buildReviewPrompt({
    sourcePath: 'docs/superpowers/plans/example.md',
    markdown: '# Example\n\nPlan body.',
    reviewTemplate: '### Finding: <short title>\nSeverity: <critical|high|medium|low|note>',
  });

  assert.match(prompt, /Review this markdown plan or spec/);
  assert.match(prompt, /docs\/superpowers\/plans\/example\.md/);
  assert.match(prompt, /### Finding: <short title>/);
  assert.match(prompt, /# Example/);
});
