# Naming

Name reveals intent. A reader should know why the value exists without a comment.

- Prefer `daysUntilExpiry` over `d`, `data`, or `info`.
- Use pronounceable, searchable names.
- Keep one word per concept. Do not mix `fetch`, `get`, and `retrieve` for the same action.
- Drop noise prefixes such as `the`, `my`, and `info` unless they change meaning.
- Name booleans as predicates: `isReady`, `hasCache`, `canRetry`.
- If a good name needs a comment, extract a function or type instead.
