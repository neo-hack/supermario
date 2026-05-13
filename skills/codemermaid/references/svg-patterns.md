# SVG Diagram Patterns

## SVG Skeleton

Every SVG diagram follows this skeleton:

```html
<svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
  <defs>
    <marker id="arrowhead" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="#9c9c9d"/>
    </marker>
  </defs>
  <!-- Nodes and edges here -->
</svg>
```

## Node Types

### Rectangle (default for modules, services)

```html
<g class="node" data-node-id="auth-service">
  <rect x="0" y="0" width="140" height="40" rx="8" fill="#161718" stroke="#252829" stroke-width="1.5"/>
  <text x="70" y="25" text-anchor="middle" fill="#f9f9f9" font-family="Inter, sans-serif" font-size="13" font-weight="500">AuthService</text>
</g>
```

### Rounded pill (for small utilities)

```html
<g class="node" data-node-id="logger">
  <rect x="0" y="0" width="100" height="32" rx="16" fill="#161718" stroke="#252829" stroke-width="1.5"/>
  <text x="50" y="21" text-anchor="middle" fill="#f9f9f9" font-family="Inter, sans-serif" font-size="12" font-weight="500">Logger</text>
</g>
```

### Diamond (for decision points)

```html
<g class="node" data-node-id="auth-check">
  <polygon points="60,0 120,30 60,60 0,30" fill="#161718" stroke="#252829" stroke-width="1.5"/>
  <text x="60" y="35" text-anchor="middle" fill="#f9f9f9" font-family="Inter, sans-serif" font-size="11" font-weight="500">Auth?</text>
</g>
```

## Edges

### Directed edge with arrow

```html
<line x1="140" y1="20" x2="200" y2="20" stroke="#9c9c9d" stroke-width="1.5" marker-end="url(#arrowhead)"/>
```

### Edge with label

```html
<line x1="140" y1="20" x2="260" y2="20" stroke="#9c9c9d" stroke-width="1.5" marker-end="url(#arrowhead)"/>
<text x="200" y="12" text-anchor="middle" fill="#9c9c9d" font-family="Inter, sans-serif" font-size="11" font-style="italic">calls</text>
```

### Dashed edge (optional/indirect)

```html
<line x1="140" y1="20" x2="260" y2="20" stroke="#9c9c9d" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#arrowhead)"/>
```

### Curved edge (for crossing paths)

```html
<path d="M 140 20 C 180 20, 180 60, 220 60" stroke="#9c9c9d" stroke-width="1.5" fill="none" marker-end="url(#arrowhead)"/>
```

## Grouping (subgraph equivalent)

```html
<g class="layer">
  <rect x="-10" y="-10" width="320" height="120" rx="12" fill="none" stroke="#252829" stroke-width="1" stroke-dasharray="6 3"/>
  <text x="0" y="8" fill="#6b6b6c" font-family="Inter, sans-serif" font-size="11" font-weight="600" letter-spacing="1">ENTRY LAYER</text>
  <!-- Nodes inside this group -->
</g>
```

## Layout Math

### Horizontal layout (left-to-right flow)
- Node spacing: 60px horizontal gap between node right edge and next node left edge
- Node heights: 40px default
- Vertical centering: Y = total_height / 2 - node_height / 2

### Vertical layout (top-down flow)
- Node spacing: 50px vertical gap between node bottom edge and next node top edge
- Node widths: 140px default, auto-size to text + 24px padding

### Auto-sizing viewBox
- `viewBox="0 0 {max_x + 40} {max_y + 40}"` where max_x and max_y account for the rightmost/bottommost element plus padding

## Design Tokens

| Token | Value |
|-------|-------|
| Node fill | `#161718` |
| Node stroke | `#252829` |
| Node stroke width | `1.5` |
| Node border radius | `8` |
| Node text | `#f9f9f9`, Inter 13px/500 |
| Active node fill | `#FF6363` |
| Active node stroke | `#FF6363` |
| Active node text | `#ffffff` |
| Edge line | `#9c9c9d`, 1.5px |
| Edge arrow | `#9c9c9d` |
| Edge label | `#9c9c9d`, Inter 11px italic |
| Group rect stroke | `#252829` dashed |
| Group label | `#6b6b6c`, Inter 11px/600 uppercase |
