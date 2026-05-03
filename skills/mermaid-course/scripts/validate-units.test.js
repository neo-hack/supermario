// skills/mermaid-course/scripts/validate-units.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateModule, validatePerspective } from './validate-units.js';

test('module: missing learningPromise fails', () => {
  const result = validateModule({ module: 'a', units: [{ kind: 'concept', body: 'x' }, { kind: 'takeaway', body: 'y' }] });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /learningPromise/);
});

test('module: missing guess-first AND surprise fails', () => {
  const result = validateModule({
    module: 'a',
    learningPromise: 'p',
    units: [{ kind: 'concept', body: 'x' }, { kind: 'takeaway', body: 'y' }],
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /guess-first.*surprise|surprise.*guess-first/);
});

test('module: missing trailing takeaway fails', () => {
  const result = validateModule({
    module: 'a',
    learningPromise: 'p',
    units: [{ kind: 'concept', body: 'x' }, { kind: 'surprise', body: 's' }],
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /takeaway/);
});

test('module: more than one stepped code-walk fails', () => {
  const result = validateModule({
    module: 'a',
    learningPromise: 'p',
    units: [
      { kind: 'concept', body: 'x' },
      { kind: 'code-walk', layout: 'stepped', steps: [] },
      { kind: 'code-walk', layout: 'stepped', steps: [] },
      { kind: 'surprise', body: 's' },
      { kind: 'takeaway', body: 't' },
    ],
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /stepped/);
});

test('module: more than 10 units fails', () => {
  const units = Array.from({ length: 11 }, (_, i) => ({ kind: 'concept', body: 'x' + i }));
  units[units.length - 1] = { kind: 'takeaway', body: 't' };
  units[5] = { kind: 'surprise', body: 's' };
  const result = validateModule({ module: 'a', learningPromise: 'p', units });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /unit budget|10/);
});

test('module: valid passes', () => {
  const result = validateModule({
    module: 'a',
    learningPromise: 'p',
    units: [
      { kind: 'concept', body: 'x' },
      { kind: 'guess-first', question: 'q', reveal: { explanation: 'e' } },
      { kind: 'surprise', body: 's' },
      { kind: 'takeaway', body: 't' },
    ],
  });
  assert.equal(result.ok, true, result.errors?.join('\n'));
});

test('perspective: must start with concept', () => {
  const result = validatePerspective({
    perspective: 'arch',
    learningPromise: 'p',
    units: [{ kind: 'surprise', body: 's' }, { kind: 'takeaway', body: 't' }],
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /start.*concept/);
});

test('perspective: valid passes', () => {
  const result = validatePerspective({
    perspective: 'arch',
    learningPromise: 'p',
    units: [{ kind: 'concept', body: 'x' }, { kind: 'takeaway', body: 't' }],
  });
  assert.equal(result.ok, true, result.errors?.join('\n'));
});
