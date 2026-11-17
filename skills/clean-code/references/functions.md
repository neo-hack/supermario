# Functions

One function, one responsibility. Keep each function at one abstraction level.

- Extract when a named function hides a coherent responsibility or meaningful complexity. Inline wrappers that add navigation without adding understanding.
- Prefer few arguments. Group related values instead of growing the parameter list.
- Do not use a boolean flag to fuse two functions into one.
- Keep the happy path visible. Simplify control flow first; extract a nested block only when it forms a coherent responsibility.
- Hide parsing, encoding, and I/O behind the business step that needs them.
- Separate decisions from effects when it reduces reasoning complexity; keep a simple, coherent operation together.
