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
