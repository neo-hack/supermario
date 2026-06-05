# Case Verification

Use this mode when qa.md exists or was generated from E2E tests. Execute the user-defined scenarios first, then free-explore uncovered interactive elements and behavior testing cases.

## qa.md Schema

The qa.md file contains one or more scenario blocks:

```xml
<scenario name="Login flow" url="/login">
  <action>Fill Email with test@example.com</action>
  <expect>No error appears</expect>

  <action>Fill Password with wrong-password</action>
  <expect>No error appears</expect>

  <action>Click the "Sign In" button</action>
  <expect>An error message appears: "Email or password is incorrect"</expect>
</scenario>
```

Parsing rules:

- Each `<scenario>` requires a `name` attribute.
- `url` is optional. Resolve relative URLs against the original target URL origin.
- Each scenario contains sequential `<action>` and `<expect>` pairs.
- Action text is natural language. Match it to the closest current `@eN` element by semantic similarity, using role, accessible name, visible label, placeholder, and nearby text.
- Expect text is natural language. Judge it from the after screenshot, `agent-browser diff snapshot`, current page state, console output, and errors.

## Scenario Execution

For each scenario:

1. If a scenario `url` exists, navigate to it and wait:

```bash
agent-browser goto {RESOLVED_URL}
agent-browser wait 1000
```

2. For each action/expect pair:

- Screenshot before: `{OUTPUT_DIR}/screenshots/step-{NNN}.png`
- Capture baseline snapshot: `agent-browser snapshot > {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt`
- Run `agent-browser snapshot -i` and match the action to the closest current element.
- Record coverage with stable traits: URL/path, role, accessible name/label, nearby text, and action text.
- Highlight the matched target and save target evidence: `agent-browser highlight @eN` then `agent-browser screenshot {OUTPUT_DIR}/screenshots/step-{NNN}-target.png`.
- Execute the operation with the current `@eN`.
- Wait: `agent-browser wait 1000`.
- Screenshot after: `{OUTPUT_DIR}/screenshots/step-{NNN}-after.png`
- Diff against the baseline:

```bash
agent-browser diff snapshot --baseline {OUTPUT_DIR}/snapshots/step-{NNN}-before.txt > {OUTPUT_DIR}/diffs/step-{NNN}.txt
```

- Run `agent-browser snapshot` only if the full accessibility tree is needed.
- Run `agent-browser console` and `agent-browser errors`.
- Judge PASS or FAIL against the `<expect>` text.
- On FAIL, assign `ISSUE-NNN`, capture an annotated issue screenshot, and append the finding immediately.

3. Add scenario totals to the report: total actions, PASS, FAIL, and issues.

## Matching Guidance

When matching action text to elements:

- Prefer exact accessible name or label matches over selector-like hints.
- For fill actions, prefer textbox/searchbox/combobox roles and matching placeholder text.
- For click actions, prefer button/menuitem/link/tab roles with matching visible text.
- If multiple elements match, choose the visible enabled element closest to the action language and current scenario context.
- If no credible match exists, mark the action FAIL with an issue explaining the missing or unmatchable control.

## Scoped Case Verification

If a resolved scope exists:

- Execute scenario actions that target elements inside the resolved scope.
- If an action targets an element outside the resolved scope, mark it out-of-scope unless the user explicitly allowed it.
- After scenarios complete, run coverage only for uncovered in-scope elements.
- Do not explore header, footer, global navigation, or unrelated page controls.

## Coverage Tracking

Track scenario coverage by stable traits, not by `@eN`. A covered element record should include:

```json
{
  "urlPath": "/settings",
  "role": "button",
  "name": "Save",
  "nearbyText": "Profile",
  "action": "Click Save"
}
```

After all scenarios finish, compare covered traits against the current interactive element inventory and inferred behaviorCases from `references/behavior-testing.md`. Use `references/free-exploration.md` for all uncovered elements and behavior cases.

## Result Semantics

- PASS: the observed result satisfies the expectation and no new console/error signal contradicts it.
- FAIL: the expected state does not appear, the wrong state appears, the action cannot be executed, or a relevant console/error signal appears.
- BLOCKED: the scenario cannot continue because an earlier required action failed. Record the blocking issue and skip dependent steps.

Do not rewrite vague expectations during execution. If an expectation is ambiguous, use visible user impact and the issue taxonomy to make the narrowest defensible judgment.
