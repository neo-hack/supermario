# Init From E2E

Use this mode when the user passes `--init`. Generate qa.md from existing E2E tests, then immediately run case verification with the generated file.

## Detect E2E Tests

Scan the project root for common directories:

| Path Pattern | Framework |
|--------------|-----------|
| `cypress/e2e/` | Cypress |
| `e2e/` | Playwright |
| `tests/e2e/` | Playwright |
| `__tests__/` | Jest / Vitest |
| `playwright/` | Playwright |
| `spec/` | RSpec |

```bash
ls -d cypress/e2e e2e tests/e2e __tests__ playwright spec 2>/dev/null
```

If none are found, ask the user for the test directory path. If the user has no E2E tests, fall back to normal free exploration.

## Extract Scenarios

For each test file in the detected directory:

- Use `describe`, `it`, `test`, or `scenario` block names as scenario names.
- Use `page.goto()`, `cy.visit()`, or equivalent navigation calls as the scenario `url`.
- Convert interaction calls into `<action>` entries.
- Convert assertions into `<expect>` entries.
- Convert selectors into natural-language descriptions when possible.

Interaction mappings:

| Framework | Source | Generated action |
|-----------|--------|------------------|
| Cypress | `cy.get().click()` | `Click {element}` |
| Cypress | `cy.get().type()` | `Fill {field} with {value}` |
| Cypress | `cy.contains().click()` | `Click {text}` |
| Playwright | `page.click()` | `Click {element}` |
| Playwright | `page.fill()` | `Fill {field} with {value}` |
| Playwright | `locator.click()` | `Click {element}` |
| Playwright | `locator.fill()` | `Fill {field} with {value}` |
| Jest/Vitest | `fireEvent.click()` | `Click {element}` |
| RSpec | `click_button` / `click_link` | `Click {label}` |
| RSpec | `fill_in` | `Fill {field} with {value}` |

Assertion mappings:

| Framework | Source | Generated expectation |
|-----------|--------|-----------------------|
| Cypress | `cy.contains('text')` | `Text "text" appears` |
| Cypress | `cy.get('.error').should('be.visible')` | `Error message is visible` |
| Playwright | `expect(page.locator()).toContainText('text')` | `Contains text "text"` |
| Playwright | `expect(page).toHaveURL('/path')` | `Navigates to /path` |
| Jest/Vitest | `expect(element.textContent).toContain('text')` | `Contains text "text"` |
| RSpec | `expect(page).to have_text('text')` | `Contains text "text"` |

When a test has multiple actions before its first assertion, add neutral expectations such as `No error appears` after intermediate actions.

## Generated qa.md Shape

```xml
<scenario name="login with wrong password" url="/login">
  <action>Fill email with test@example.com</action>
  <expect>No error appears</expect>

  <action>Fill password with wrong-password</action>
  <expect>No error appears</expect>

  <action>Click the submit button</action>
  <expect>An error message appears: "Email or password is incorrect"</expect>
</scenario>
```

Write generated qa.md to `{OUTPUT_DIR}/qa.md`.

## Self-Verify

After generating qa.md:

1. Read `references/case-verification.md`.
2. Execute all generated scenarios against the live page.
3. Include this line in the report: `Generated N scenarios from M test files. Self-verify: X PASS, Y FAIL`.
4. Treat FAIL results as drift between test code and browser behavior.

Ask whether the user wants to keep or edit the generated qa.md only after self-verification completes.
