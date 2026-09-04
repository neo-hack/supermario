# Functions

One function, one responsibility. Keep each function at one abstraction level.

- Extract until the function name is the documentation.
- Prefer few arguments. Group related values instead of growing the parameter list.
- Do not use a boolean flag to fuse two functions into one.
- Keep the happy path visible. Push nested conditionals into named helpers.
- Hide parsing, encoding, and I/O behind the business step that needs them.
- If a function both decides and executes, split the decision from the effect.
