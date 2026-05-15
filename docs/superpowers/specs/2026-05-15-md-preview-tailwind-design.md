# md-preview: Tailwind CSS + Typography Plugin

**Date:** 2026-05-15
**Status:** Approved

## Goal

Replace the md-preview skill's vanilla CSS layout and typography with Tailwind CSS CDN + `@tailwindcss/typography` prose class. This improves markdown rendering quality and adds responsive layout via Tailwind breakpoints.

## Changes

### 1. Template (`template.html`)

Replace Google Fonts `<link>` with Tailwind CDN + typography plugin:

```html
<script src="https://cdn.tailwindcss.com?plugins=typography"></script>
<script>
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    }
  }
}
</script>
```

Update HTML structure to use Tailwind layout classes:

- **topbar**: `fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 h-[52px] bg-[var(--bg)] border-b border-[var(--border-soft)]`
- **container**: `w-full mx-auto px-4 md:px-8 pt-[68px] pb-40`
- **page-layout grid**: `grid grid-cols-[1fr_300px] xl:grid-cols-[200px_minmax(0,1fr)_300px] gap-8 items-start`
- **article#content**: `min-w-0 break-words prose dark:prose-invert max-w-none`
- **toc-sidebar**: `hidden xl:block sticky top-[68px] max-h-[calc(100vh-84px)] overflow-y-auto`

Keep `data-theme` attribute alongside Tailwind's `dark` class for CSS variable theming.

### 2. Responsive Layout

| Breakpoint | Grid Columns | TOC | Comments |
|------------|-------------|-----|----------|
| < 1280px (default/md/lg) | `1fr 300px` (2-col) | Hidden | Right column, always visible |
| >= 1280px (xl) | `200px minmax(0,1fr) 300px` (3-col) | Left sticky sidebar | Right sticky sidebar |

### 3. CSS (`style.css`)

**Remove** (handled by Tailwind/prose):
- Typography rules: h1-h4, p, ul/ol/li, blockquote, table/th/td, code/pre, hr, a
- Layout rules: .container, .page-layout, #content, media queries
- Topbar base: .topbar, .topbar-title

**Keep** (Tailwind doesn't cover):
- CSS variables / theme (--bg, --surface, --text, etc.)
- Scrollbar styles
- .toc-sidebar detail styles (nav border, link hover/active states, .toc-h3)
- .task-list (custom checkbox styling)
- .admonition (note/warning/tip/caution)
- .code-lang, .copy-btn (code block extras)
- .tok-* (syntax highlighting colors)
- .shiki-wrapper (dual theme code blocks)
- Comments system (.comment-*, .comments-panel)

### 4. Runtime (`runtime.js`)

Update `initThemeToggle()` to toggle both:
- `data-theme` attribute on `<html>` (for CSS variable theme switching)
- `dark` class on `<html>` (for Tailwind's dark: prefix and prose-invert)

On page load, set both based on localStorage or system preference.

### 5. Conversion Script

Update the TOC sidebar generation to include `hidden xl:block` classes instead of relying on CSS media queries.

## Files Modified

| File | Action |
|------|--------|
| `.agents/skills/md-preview/assets/template.html` | Replace Google Fonts with Tailwind CDN, add utility classes to HTML |
| `.agents/skills/md-preview/assets/style.css` | Remove typography/layout CSS, keep component styles |
| `.agents/skills/md-preview/assets/runtime.js` | Update theme toggle for dual dark mode |

## Trade-offs

- (+) Professional typography via prose, responsive layout via Tailwind breakpoints
- (+) Less custom CSS to maintain (~40 lines of typography removed)
- (-) ~300KB runtime dependency (Tailwind CDN)
- (-) Requires network for first load (no offline support)
