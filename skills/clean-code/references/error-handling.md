# Error Handling

Errors are part of the interface. Do not swallow them or return vague sentinels.

- Fail at the boundary that can add context.
- Keep happy-path logic free of nested error bookkeeping.
- Prefer explicit results or thrown errors over magic values such as `null` or `-1` unless the project already uses that pattern.
- Do not catch an error only to log and continue unless that is the documented contract.
- Preserve the original cause when wrapping an error.
- Return the same empty or error shape the callers already handle.
