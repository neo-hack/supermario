# Unit Kind Examples

These are the concrete patterns the generator should imitate. Every unit kind has 2–3 worked examples showing the exact JS object literal format. Voice rules live separately in `voice-examples.md`.

> Source: examples drawn from scanned codebases. Don't invent codebases — only use repos you've actually scanned.

---

## concept

Plain prose, 60–150 words. The teacher pointing at a thing before showing code.

### Example 1 — Hono routing

```javascript
{
  kind: "concept",
  title: "Why a trie?",
  body:
    "Hono picks a trie for path matching. Express uses a regex array. Why does that matter? Look at the lookup cost: trie is O(path-segments), regex array is O(routes-registered). Hono runs the same benchmark as Express on a 200-route app and wins by 30x. The data-structure choice IS the performance story — which is the only reason this code reads cleanly. Once you've internalized that, the rest of the router code reads as scaffolding."
}
```

### Example 2 — React fiber

```javascript
{
  kind: "concept",
  title: "Fiber as scheduling unit",
  body:
    "Before fibers, React rendered top-to-bottom in one synchronous shot. With fibers, every component instance becomes a small interruptible work unit on a linked list. The scheduler can pause between fibers, give the browser a frame, and pick up where it left off. The thing to notice: a fiber is not a component. It's a *promise* of component work. That distinction lets React keep two trees alive — current and work-in-progress — so it can throw away half-rendered work without tearing the UI."
}
```

### Concept rules

- Use `style: "callout"` for surprising or counter-intuitive content.
- Callout concepts render with the red `unit-surprise` treatment.
- Normal concept units should prepare the reader before code by explaining role, reasoning, and tradeoff.

---

## whoa

Rare highlight for a design choice that deserves extra attention. Use this when the reader should understand not only what the code does, but why the design is unusually strong.

### Example 1 — Product boundary

```javascript
{
  kind: "whoa",
  angle: "product",
  title: "The host owns the product policy; the component owns the conversation surface.",
  body:
    "The component is useful because it does not try to become the whole app. Transport, persistence, permissions, callbacks, and host slots stay outside the visible chat surface. That lets an embedder adopt the conversation UI without surrendering the product decisions around it.",
  evidence: {
    files: ["src/components/ChatPanel.tsx"],
    modules: ["ChatPanel"],
    constraints: ["embeddable UI", "host-controlled persistence", "optional extension points"]
  }
}
```

### Example 2 — Code boundary

```javascript
{
  kind: "whoa",
  angle: "code",
  title: "Internal stream metadata does not leak into the SDK message shape.",
  body:
    "The reducer needs metadata to dedupe live events and later snapshots, but consumers still expect SDK-shaped messages. Attaching non-enumerable Symbol metadata gives the reducer its private bookkeeping without changing what debug, export, or host code sees.",
  evidence: {
    files: ["src/hooks/threadStreamReducer.ts"],
    constraints: ["live stream dedupe", "snapshot replay", "public SDK compatibility"]
  }
}
```

### Whoa rules

- Use zero `whoa` units when there is no strong evidence. When evidence exists, keep a normal course around 3-5 `whoa` units total.
- Place `angle: "code"` after the proving `code-walk` or `code-graph`.
- Place `angle: "product"`, `"ux"`, and `"architecture"` near the feature, interaction, or diagram that makes the point understandable.
- Evidence can cite files, modules, interactions, or constraints. Do not invent evidence.

---

## code-walk (split)

Sticky code on the left, annotation cards on the right. Each annotation references a specific code line. Use when explanation has 2+ beats tied to specific lines.

### Example 1 — Auth middleware (split)

```javascript
{
  kind: "code-walk",
  title: "Token check before any handler",
  file: "src/middleware/auth.ts",
  code:
`export const auth: Middleware = async (c, next) => {
  const token = c.req.header('Authorization')?.slice(7);
  if (!token) { c.set('user', null); return next(); }
  try {
    const user = await verify(token);
    c.set('user', user);
  } catch {
    c.set('user', null);
  }
  return next();
};`,
  highlights: [
    { line: 2, note: "Optional chaining — no crash if header is missing." },
    { line: 5, note: "verify() throws on malformed tokens — caught below." },
    { line: 8, note: "Does NOT throw — sets null user, continues. Downstream decides." }
  ]
}
```

### Example 2 — Router trie builder (split)

```javascript
{
  kind: "code-walk",
  title: "Building the trie",
  file: "src/router.ts",
  code:
`function add(path: string, handler: Handler) {
  const segments = path.split('/').filter(Boolean);
  let node = root;
  for (const seg of segments) {
    const isParam = seg.startsWith(':');
    const key = isParam ? '*' : seg;
    if (!node.children[key]) node.children[key] = makeNode();
    if (isParam) node.children[key].param = seg.slice(1);
    node = node.children[key];
  }
  node.handler = handler;
}`,
  highlights: [
    { line: 4, note: "Walk every path segment, descending into the trie." },
    { line: 5, note: "Param segments (starting with :) collapse to a single wildcard key '*'." },
    { line: 8, note: "The wildcard child remembers its original param name for lookup." },
    { line: 11, note: "Handlers live only at leaf nodes — no ambiguous routes." }
  ]
}
```

### Example 3 — Repository read (split)

```javascript
{
  kind: "code-walk",
  title: "Read-through cache pattern",
  file: "src/repo/user.ts",
  code:
`export async function findUser(id: string) {
  const cached = cache.get(id);
  if (cached) return cached;
  const row = await db.users.findById(id);
  cache.set(id, row, { ttl: 60_000 });
  return row;
}`,
  highlights: [
    { line: 2, note: "Cache check is synchronous — instant return on hit." },
    { line: 3, note: "Early return avoids the DB query entirely." },
    { line: 5, note: "Short TTL (60s) because this table mutates often." }
  ]
}
```

### Code-walk rules

- `layout` defaults to `split`, with code on the left and annotations on the right.
- `stacked` is the alternative layout when horizontal space is too tight or the explanation reads better top-to-bottom.
- `highlights` is an array of `{ line, note }` objects.
- Highlight lines are snippet-local, 1-based line numbers after trimming the snippet.
- `code` must be the exact, unmodified source snippet.

---

## takeaway

End-of-section recap. 2–4 sentences. Stronger styling than `concept` so readers know they've reached a checkpoint.

### Example 1 — Auth recap

```javascript
{
  kind: "takeaway",
  body:
    "Auth in this codebase pushes the policy decision *down* into handlers, not up into middleware. Middleware sets `user` (or `null`) and gets out of the way. That's why you'll see `if (!ctx.user) ...` in every protected handler — and that's the right shape."
}
```

### Example 2 — Router recap

```javascript
{
  kind: "takeaway",
  body:
    "The router is a trie because lookup cost matters more than registration cost. Param names are bookkeeping; the actual match key is structural. Once you see this, every other choice in the file (no regex, no precompile step, no route ordering) lines up."
}
```

## contract

The module's reference card — the table a maintainer re-opens before every edit. Neutral documentation voice: complete rows, no teaching signposts.

### Example — Auth middleware contract

```javascript
{
  kind: "contract",
  title: "auth module contract",
  exports: [
    { name: "auth", signature: "Middleware (async (c, next) => void)", callers: "app.ts middleware chain", note: "Sets ctx.user or null; never throws on bad tokens." },
    { name: "verify", signature: "async (token: string) => User", callers: "auth middleware only", note: "Throws on malformed/expired tokens; network call to JWKS endpoint." },
    { name: "AuthUser (type), re-exported constants", signature: "—", callers: "handlers", note: "Trivial type/const re-exports, grouped." }
  ],
  dependsOn: [
    { target: "jose", why: "JWT verification against the issuer's JWKS." }
  ],
  usedBy: [
    { source: "every protected handler", why: "reads ctx.user to decide access." }
  ],
  changeRouting: [
    { intent: "Add a new claim to the session user", where: "verify() in auth.ts — extend the mapping after jwtVerify, then the AuthUser type" },
    { intent: "Make an endpoint public", where: "the handler itself — remove its ctx.user check; middleware never blocks" },
    { intent: "Swap the token issuer", where: "JWKS_URL in config.ts; verify() reads it at call time" }
  ]
}
```

### Contract rules

- Every public export appears in `exports`; trivial re-exports may share one explicitly-labeled grouped row.
- `changeRouting` intents come from the Phase 2 maintainer analysis — real changes a maintainer would make, each mapped to a concrete location.
- Omit `dependsOn`/`usedBy` only when the module genuinely has none in that category.

---

## gotcha

Invariants, implicit ordering constraints, and footguns — each with the consequence of violating it and real evidence.

### Example 1 — With items

```javascript
{
  kind: "gotcha",
  title: "Invariants the auth module assumes",
  items: [
    {
      rule: "Middleware must run before ANY route that reads ctx.user.",
      consequence: "A route registered above the middleware chain sees ctx.user === undefined (not null) and its `if (!ctx.user)` check passes for the wrong reason.",
      evidence: "app.ts:12 — registration order is the only thing enforcing this"
    },
    {
      rule: "verify() results are not cached; every request pays the JWKS latency.",
      consequence: "Adding a hot public endpoint behind the middleware multiplies issuer traffic — cache or exempt it first.",
      evidence: "auth.ts:5 doc comment; load test in tests/auth-latency.test.ts"
    }
  ]
}
```

### Example 2 — Explicit empty state

```javascript
{
  kind: "gotcha",
  title: "Gotchas",
  items: [],
  scannedNote: "scanned error paths, registration order, and concurrent-call behavior; the module is stateless and order-independent"
}
```

### Gotcha rules

- Every item cites real evidence (file:line, doc comment, or test). Never invent an item to fill the unit.
- An empty `items` is valid and must carry `scannedNote` naming what was actually examined.

---

## self-check

Page-end scenario questions testing whether the reader can ACT — one `self-check` unit per page, second-to-last before `takeaway`, 2–4 questions.

### Example — Scenario question

```javascript
{
  kind: "self-check",
  questions: [
    {
      question: "You need to add a `role` claim to the session user. Which files change?",
      options: [
        { letter: "A", text: "auth.ts only — extend the mapping in verify() and the AuthUser type", correct: true },
        { letter: "B", text: "Every protected handler — each one re-parses the token", correct: false },
        { letter: "C", text: "app.ts — claims are configured on the middleware chain", correct: false },
        { letter: "D", text: "config.ts — add the claim to JWKS_URL parameters", correct: false }
      ],
      explanation: "verify() (auth.ts:5) is the single place raw JWT claims become the AuthUser object; handlers only ever read ctx.user. B re-implements parsing that already exists; C confuses registration with mapping; D — the JWKS URL serves keys, not claims."
    }
  ]
}
```

### Self-check rules

- Questions are action scenarios ("to add X, which files change?", "what happens after a restart?"), never recall trivia ("what data structure is used?").
- Exactly 4 options, letters A-D, and exactly 1 option has `correct: true`.
- `explanation` is shown after answering; it must cite specific code evidence and briefly rule out the wrong answers.

---

## diagram

Architecture / sequence / state figure. Inline in `units[]`. Renders with a Zoom button by default.

### Example 1 — Architecture flow (zoomable)

```javascript
{
  kind: "diagram",
  title: "Where the auth handshake actually lives",
  mermaid:
`graph TD
  Client["Browser"]
  CDN["Edge CDN"]
  App["app.fetch()"]
  Auth["auth middleware"]
  Handler["protected handler"]
  Client -->|"HTTPS"| CDN
  CDN -->|"forwards"| App
  App -->|"runs middleware chain"| Auth
  Auth -->|"sets ctx.user"| Handler`,
  caption:
    "Auth lives in the framework's middleware loop, *not* on a route prefix. That's why every protected handler still has to check `ctx.user` itself — middleware never short-circuits on missing auth.",
  zoomable: true
}
```

### Example 2 — Login sequence (sequenceDiagram)

```javascript
{
  kind: "diagram",
  title: "Login sequence (happy path)",
  mermaid:
`sequenceDiagram
  participant U as User
  participant F as Frontend
  participant API as Backend
  participant DB as Postgres
  U->>F: submit form
  F->>API: POST /login
  API->>DB: SELECT user WHERE email=...
  DB-->>API: row
  API->>API: bcrypt.compare(password, row.hash)
  API-->>F: { token }
  F-->>U: redirect /app`,
  caption:
    "Notice the `bcrypt.compare` lives in the API — not the DB. That's the whole reason the row leaves the database; if you moved bcrypt into a stored procedure, you could keep the hash on-server. This codebase chose horizontal scaling over that.",
  zoomable: true
}
```

---

## trace

Step-through of a process that unfolds over time — a request path, a state machine, a startup sequence, or a change scenario crossing modules. Rendered by runtime.js as a stepper (step rail + one active detail panel + prev/next). The page contains data attributes only; never bespoke JS.

Use trace for:
- **Change scenarios** (`change-scenarios.html`): how a typical feature/bugfix flows across modules end to end
- **Request lifecycles**: entry → response, one hop with its code at a time
- **Cross-file interactions**: how components, hooks, or modules call each other in sequence

### Example — Request lifecycle

```javascript
{
  kind: "trace",
  title: "A protected request, entry to handler",
  scenario: "GET /api/profile with a valid JWT — every hop until the handler runs.",
  steps: [
    {
      label: "Middleware chain starts",
      file: "src/app.ts",
      line: 12,
      code: "app.use(auth);\napp.get('/api/profile', profileHandler);",
      note: "Registration order IS the execution order — auth runs before any route because it is registered first."
    },
    {
      label: "Token extracted and verified",
      file: "src/middleware/auth.ts",
      line: 5,
      code: "const user = await verify(token);\nc.set('user', user);",
      note: "The only await on the hot path. verify() reaches the JWKS endpoint; every request pays this latency."
    },
    {
      label: "Handler reads ctx.user",
      file: "src/handlers/profile.ts",
      line: 3,
      code: "if (!ctx.user) return c.json({ error: 'unauthorized' }, 401);",
      note: "The policy decision lives HERE, not in middleware — middleware only annotates. This is the check every protected handler repeats."
    }
  ]
}
```

### Trace rules

- 4–10 steps (fewer is fine when the real path is genuinely short, as above); every step has a real `file` and `line`.
- Per-step `code` is optional but preferred; ≤ 10 lines, exact copy under the Real code only rules.
- `note` explains what this hop does to the system state and why it matters — same depth bar as code-walk annotations.
- Interaction restraint: the stepper renders step buttons, one active panel, and prev/next. Never add filters, autoplay, or extra controls.
- Step indices and panel indices in the rendered HTML must match one-to-one, starting at 0.

---

## code-graph

Use `code-graph` when a code snippet is easier to understand with a small call graph beside it.

### Code-graph rules

- Same source and highlight rules as `code-walk`.
- Add an `svg` field containing the mini call graph.
- `highlights[].graphNode` must match an SVG node `data-node-id`.
- The runtime syncs highlights by that id: clicking a code line highlights the SVG node, and clicking a SVG node highlights the matching code line.
