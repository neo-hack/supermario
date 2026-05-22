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

## quiz

Checks whether the reader understood a design choice, not trivia.

### Quiz rules

- Exactly 4 options.
- Option letters A-D.
- Exactly 1 option has `correct: true`.
- `explanation` is shown after answering, regardless of correctness.
- The explanation must cite specific code evidence and briefly rule out the wrong answers.

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

## storyboard

Multi-scene Mermaid player with optional paired code. Use when a static diagram would hide the sequence of moves.

Use storyboard for:
- **Multi-step sequences**: state transitions, request lifecycles, build pipelines
- **Cross-file interactions**: showing how components, hooks, or modules call each other
- **Single-file drilling**: examining different aspects of one file across multiple scenes (Props → State → Handlers)

### Example 1 — Single-file: Phase 6 assembly

```javascript
{
  kind: "storyboard",
  title: "How Phase 6 assembles one page",
  caption: "The page appears when the shell, partials, data, and validator line up.",
  scenes: [
    {
      name: "Read shell",
      mermaid:
`flowchart LR
  A["template-essay.html"] --> B["slot markers"]
  B --> C["empty page shell"]`,
      explanation:
        "Start with the shell. It owns the document structure, but it is still hollow: title slots, CSS slots, JS slots, and one PAGE_DATA slot."
    },
    {
      name: "Inline partials",
      mermaid:
`flowchart LR
  A["template-essay.html"] --> C["output HTML"]
  B["_runtime.js"] --> C`,
      code: {
        file: "skills/codemermaid/SKILL.md",
        lang: "markdown",
        source: "1. Read template-essay.html\n2. Read _runtime.js and _essay.js\n3. Replace template slots",
        highlights: [
          { line: 2, note: "Runtime partials keep each output page interactive without a build step." }
        ]
      },
      explanation:
        "This is the key move: reusable partials become inline page assets, so the final course page opens as one file."
    },
    {
      name: "Validate before emit",
      mermaid:
`flowchart LR
  A["PAGE_DATA"] --> B["validate-units.js"]
  B -->|ok| C["write HTML"]
  B -->|errors| D["stop"]`,
      code: {
        file: "skills/codemermaid/scripts/validate-units.js",
        lang: "js",
        source: "if (!result.ok) {\n  console.error('Validation failed:');\n  for (const e of result.errors) console.error(`  - ${e}`);\n  process.exit(1);\n}\nconsole.log('OK');",
        highlights: [
          { line: 1, note: "Validation gates output instead of warning after the page exists." },
          { lines: [2, 3, 4], note: "The run prints every failure, then exits once." }
        ]
      },
      explanation:
        "Bad pedagogy fails before the page is written. That keeps the generator honest when it starts producing richer units."
    }
  ]
}
```

### Example 2 — Cross-file: Component calls Hook

```javascript
{
  kind: "storyboard",
  title: "ChatPanel uses useAutoScroll",
  caption: "How the top-level component initializes scrolling behavior via a custom hook.",
  scenes: [
    {
      name: "Component Setup",
      mermaid:
`flowchart LR
  A["ChatPanel.tsx"] --> B["useAutoScroll hook"]`,
      code: {
        file: "src/components/ChatPanel.tsx",
        lang: "tsx",
        source: "const containerRef = useRef<HTMLDivElement>(null);\nconst { autoScroll, scrollToBottom } = useAutoScroll(containerRef);",
        highlights: [
          { line: 1, note: "ChatPanel creates a ref to pass into the hook." },
          { line: 2, note: "The hook returns both state and an imperative scroll function." }
        ]
      },
      explanation:
        "ChatPanel needs auto-scroll for new messages. It creates a ref and passes it to useAutoScroll, which manages the scroll state."
    },
    {
      name: "Hook Internals",
      mermaid:
`flowchart LR
  B["useAutoScroll hook"] --> C["scrollToBottom()"]`,
      code: {
        file: "src/hooks/useAutoScroll.ts",
        lang: "ts",
        source: "export function useAutoScroll(containerRef: RefObject<HTMLElement>) {\n  const [autoScroll, setAutoScroll] = useState(true);\n  // ...\n  const scrollToBottom = () => {\n    if (containerRef.current) {\n      containerRef.current.scrollTop = containerRef.current.scrollHeight;\n    }\n  };\n  return { autoScroll, scrollToBottom };\n}",
        highlights: [
          { line: 5, note: "The hook provides an imperative scroll function." },
          { line: 8, note: "Returns state and controls to the caller." }
        ]
      },
      explanation:
        "The hook encapsulates scroll logic. It returns state so ChatPanel can show an indicator, and a function so ChatPanel can trigger scrolling."
    },
    {
      name: "Back to Component",
      mermaid:
`flowchart LR
  C["scrollToBottom()"] --> D["Message renders"]`,
      code: {
        file: "src/components/ChatPanel.tsx",
        lang: "tsx",
        source: "useEffect(() => {\n  if (autoScroll) scrollToBottom();\n}, [messages]);",
        highlights: [
          { line: 2, note: "Whenever messages change, auto-scroll if enabled." }
        ]
      },
      explanation:
        "ChatPanel wires the hook's return value into its effect. New messages trigger auto-scroll, but the user can disable it by toggling the state."
    }
  ]
}
```

---

## code-graph

Use `code-graph` when a code snippet is easier to understand with a small call graph beside it.

### Code-graph rules

- Same source and highlight rules as `code-walk`.
- Add an `svg` field containing the mini call graph.
- `highlights[].graphNode` must match an SVG node `data-node-id`.
- The runtime syncs highlights by that id: clicking a code line highlights the SVG node, and clicking a SVG node highlights the matching code line.
