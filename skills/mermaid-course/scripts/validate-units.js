// skills/mermaid-course/scripts/validate-units.js
// Pedagogy enforcement for mermaid-course pages.
// Module pages (per-module deep dives) and Perspective pages (cross-module essays).

const VALID_KINDS = new Set([
  'concept',
  'code-walk',
  'guess-first',
  'compare',
  'surprise',
  'takeaway',
  'diagram',
]);
const MAX_UNITS = 10;
const MAX_STEPPED_PER_MODULE = 1;

function commonChecks(page, kindLabel) {
  const errors = [];
  const name = page.module || page.perspective || '<unnamed>';
  if (!page.learningPromise || !String(page.learningPromise).trim()) {
    errors.push(`${kindLabel} '${name}' missing learningPromise`);
  }
  const units = page.units || [];
  if (units.length === 0) {
    errors.push(`${kindLabel} '${name}' has no units`);
  }
  if (units.length > MAX_UNITS) {
    errors.push(`${kindLabel} '${name}' exceeds unit budget (${units.length} > ${MAX_UNITS})`);
  }
  for (const u of units) {
    if (!VALID_KINDS.has(u.kind)) {
      errors.push(`unknown unit kind '${u.kind}'`);
    }
  }
  const stepped = units.filter((u) => u.kind === 'code-walk' && u.layout === 'stepped').length;
  if (stepped > MAX_STEPPED_PER_MODULE) {
    errors.push(`too many stepped code-walks (${stepped}); max is ${MAX_STEPPED_PER_MODULE} per page`);
  }
  return errors;
}

export function validateModule(page) {
  const errors = commonChecks(page, 'module');
  const units = page.units || [];
  const hasEngagement = units.some((u) => u.kind === 'guess-first' || u.kind === 'surprise');
  if (!hasEngagement) {
    errors.push(`module '${page.module}' missing required guess-first OR surprise unit`);
  }
  if (units.length > 0 && units[units.length - 1].kind !== 'takeaway') {
    errors.push(`module '${page.module}' must end with a takeaway unit`);
  }
  return { ok: errors.length === 0, errors };
}

export function validatePerspective(page) {
  const errors = commonChecks(page, 'perspective');
  const units = page.units || [];
  if (units.length > 0 && units[0].kind !== 'concept') {
    errors.push(`perspective '${page.perspective}' must start with a concept unit`);
  }
  if (units.length > 0 && units[units.length - 1].kind !== 'takeaway') {
    errors.push(`perspective '${page.perspective}' must end with a takeaway unit`);
  }
  return { ok: errors.length === 0, errors };
}

// CLI: node validate-units.js path/to/page.json    (or "-" for stdin)
if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const arg = process.argv[2];
  if (!arg) {
    console.error('usage: node validate-units.js <path-to-page.json | ->');
    process.exit(2);
  }
  const raw = arg === '-'
    ? fs.readFileSync(0, 'utf8')
    : fs.readFileSync(arg, 'utf8');
  const page = JSON.parse(raw);
  const result = page.module ? validateModule(page) : validatePerspective(page);
  if (!result.ok) {
    console.error('Validation failed:');
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('OK');
}
