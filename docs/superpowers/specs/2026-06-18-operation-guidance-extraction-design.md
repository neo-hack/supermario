# Operation Guidance Extraction Design

## Context

Recent QA and UX exploration exposed a gap: the browser evidence can include product-authored operation guidance through `aria-describedby`, `aria-description`, visible helper text, tooltips, placeholders, and accessibility snapshots, but the skills can still treat that guidance as passive context. In the repository branch picker example, the component described keyboard and list navigation behavior, but the exploration only partially exercised it.

The goal is not to create a keyboard-specific checklist. Keyboard instructions are one form of a broader pattern: the product tells the user how an interaction is supposed to work, and the agent should test that instruction when it is in scope.

## Design Goal

Introduce a generic **Operation Guidance Extraction** rule for QA and UX exploration:

> Product-authored operation guidance is actionable exploration input. If it is in scope, the agent must exercise it with evidence or explicitly skip it with a reason.

This keeps the behavior product-agnostic and avoids special-casing keyboard instructions.

## Sources Of Operation Guidance

The skills should treat these as operation guidance sources:

- `aria-describedby` and `aria-description` content.
- Visible helper text near controls.
- Tooltips and popovers that explain how to use a control.
- Placeholder text that describes an allowed operation or format.
- Snapshot text that describes keyboard, pointer, selection, filtering, drag, upload, command, or recovery behavior.
- Labels that imply a non-obvious workflow, such as multi-select, apply, clear, retry, manage, expand, or choose.

The source can be visible or accessibility-only. Accessibility-only guidance still matters because it is product-authored behavior, but UX judgment should still consider whether a sighted first-time user could discover it.

## Exploration Behavior

After each meaningful snapshot or newly opened panel/dialog/menu, the agent should scan available operation guidance and convert it into exploration work.

For each in-scope instruction:

1. Create an operation note in the working queue using the product's own language.
2. Exercise the instruction with the normal evidence model: before screenshot, target screenshot when practical, action, after screenshot, snapshot diff, console, and errors.
3. Inspect the screenshots before judging outcome or severity.
4. Mark the instruction as covered, failed, inconclusive, or skipped with a reason.

Examples:

- "Use ArrowDown to enter the list" becomes a keyboard navigation step.
- "按 Escape 返回列表导航" becomes an interruption/recovery step.
- "点击申请" on a disabled item becomes a permission recovery path, if navigation is safe.
- "Search repositories and branches" becomes separate search/filter checks for each search surface.
- "Drag to reorder" becomes a drag behavior check, if safe for the current page.

## Scope Rules

Operation guidance should not override the user's requested scope.

- If the user asks to focus one component, only execute guidance attached to that component or its opened surfaces.
- If guidance would navigate away, submit destructive data, download files, or leave the safe test boundary, record it as skipped with the reason.
- If guidance describes a hidden or accessibility-only feature, still test it when it is directly attached to the scoped control.
- If the guidance is redundant with an already executed behavior case, link it to the existing step instead of duplicating work.

## Reporting

Reports should make operation guidance visible enough to audit coverage without turning the report into an accessibility dump.

Add a compact section or per-step note:

- Guidance source: `aria-describedby`, visible helper text, tooltip, placeholder, or snapshot text.
- Extracted operation: short product-language instruction.
- Evidence step: covered step number or skipped reason.
- Result: covered, issue, inconclusive, or skipped.

This should appear in both QA and UX reports when operation guidance materially shaped the exploration.

## Relationship To Existing Concepts

This rule complements, not replaces:

- Snapshot diff: detects semantic changes.
- Screenshot evidence: judges visible UX correctness.
- Behavior testing: turns product behavior into test cases.
- Scope resolution: limits where exploration happens.

Operation guidance is a source for behavior cases and UX exploration steps. It should not be treated as evidence that behavior works until the live page is exercised.

## Success Criteria

- When a component exposes usage instructions through ARIA or visible helper text, generated exploration includes corresponding actions or explicit skip reasons.
- Reports show which operation guidance was covered.
- Keyboard behavior is tested when the product describes it, without adding a keyboard-specific hard rule.
- Product-specific labels stay in the session output, not in baseline skill references.

## Non-Goals

- Do not add a universal keyboard checklist.
- Do not require testing every possible shortcut on every page.
- Do not turn accessibility metadata into a substitute for screenshot inspection.
- Do not force navigation or destructive actions just because guidance mentions them.

## Implementation Direction

Update the QA and UX skills with a product-agnostic rule named **Operation Guidance Extraction**. Add it near the snapshot/ARIA guidance sections and reference it from free exploration, case verification, and reporting cleanup. The wording should be broad enough to cover keyboard, pointer, search, selection, permission recovery, and command workflows without naming one as special.
