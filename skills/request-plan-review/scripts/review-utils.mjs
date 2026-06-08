export function buildReviewPrompt({ sourcePath, markdown, reviewTemplate }) {
  return `Review this markdown plan or spec.

Source path: ${sourcePath}

Use this review template exactly:

${reviewTemplate}

Markdown to review:

${markdown}`;
}
