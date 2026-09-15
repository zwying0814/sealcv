# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace

This is a pnpm monorepo; all real code lives in `apps/web/`. The root `package.json` only exposes proxy scripts. Other apps/packages are not yet populated.

## Commands

Run from repo root:

- `pnpm web:dev` — start Next.js dev server on `http://localhost:12800` (Turbopack)
- `pnpm web:build` — production build
- From inside `apps/web`: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`

No test runner is configured. No formatter/lint script beyond `eslint`.

## Tech Stack

- **Next.js 16 + React 19** (App Router, Turbopack) — `lang="zh-CN"` by default
- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax (no `tailwind.config.js`); theme is inline in `app/globals.css` via `@theme inline { ... }`
- **shadcn/ui v4, `base-nova` style** — see critical gotchas below
- **Fonts**: Geist Sans → `--font-sans`, Geist Mono → `--font-mono` (registered in `app/layout.tsx`)
- **Base color**: neutral (set in `components.json`)
- **Markdown rendering**: `marked` with `dangerouslySetInnerHTML`

### shadcn/ui gotchas — READ THIS

This project uses `@base-ui/react` (Base UI), **not** Radix UI. The API differs from most shadcn tutorials/examples you'll find:

| What you're used to (Radix) | This project (Base UI) |
|---|---|
| `Button` with `asChild={<Link />}` | `Button` with `render={<Link />}` + `nativeButton={false}` |
| `TooltipProvider delayDuration={200}` | `TooltipProvider delay={200}` |
| `TooltipTrigger` with `asChild` | Apply styles directly to `TooltipTrigger`; no `asChild` prop |
| `Slider` `onValueChange([v])` always array | `onValueChange(v)` — `v` is `number \| readonly number[]`; guard with `Array.isArray(v) ? v[0] : v` |
| Generic `render`/`asChild` anywhere | Check the Base UI docs for each component |

When adding new shadcn components, generate with `pnpm dlx shadcn@latest add <name>` from inside `apps/web/`. Verify the output uses `@base-ui/react` imports — if a component pulls Radix, something is wrong.

### Next.js version warning

The injected `AGENTS.md` is not optional — Next.js 16 has breaking changes vs. earlier versions. Before writing any Next.js code, read the relevant guide under `node_modules/next/dist/docs/` and heed deprecation notices. Trust the local docs over your training data.

## Architecture

### Routing

- **`/`** — Landing page (`app/page.tsx`). Static marketing page with SealCV branding, feature cards, CTA linking to `/cv`.
- **`/cv`** — Resume editor. Must be **client-only rendered** with a loading skeleton. Implemented via `next/dynamic` + `ssr: false` in `app/cv/page.tsx`, with a matching `app/cv/loading.tsx` for the Next.js Suspense fallback during navigation.

The editor state (markdown, paper size, zoom, margins, etc.) lives entirely client-side; there is no persistence layer yet.

### Component layout

```
components/
  cv/              # The editor and its parts
    editor.tsx        # Main orchestrator — owns state, wires Topbar + EditorPanel + Canvas + ControlsPanel
    editor-panel.tsx  # Left markdown textarea + toolbar
    canvas.tsx        # Right paper preview with zoom/smart-fit JS
    controls-panel.tsx# Right panel: paper size, orientation, margins, typography, zoom, export
    topbar.tsx        # Top bar: logo, doc title, undo/preview/export
    editor-types.ts   # Shared types (PaperSize, Orientation, EditorState), constants (PAPER_SIZES, PADDING_RANGE), clampPadding
    default-resume.ts # Sample markdown (林清和, 高级产品设计师)
    loading-skeleton.tsx # Minimal spinner used by /cv during dynamic import
  ui/              # shadcn-generated primitives — do not hand-edit
```

### CSS strategy

- **`app/globals.css`** — only shadcn theme tokens + `@layer base`. Do not add component CSS here.
- **`app/cv/editor.css`** — scoped to the editor. Contains ONLY what Tailwind cannot express:
  - `::-webkit-scrollbar` pseudo-elements on `.cv-canvas`
  - `.cv-resume` typography for dynamically-rendered markdown HTML (h1/h2/h3/p/strong/em/a/ul/ol/li/hr/blockquote/code)
  - `.cv-resume.is-compact` modifier
  - `@media print` `!important` rules for `.cv-paper-wrap` / `.cv-paper` that must override JS-driven inline `transform` / `width` / `minHeight`

- **Everything else** — use Tailwind utilities directly in JSX. Custom responsive breakpoints (e.g. 1100px, 920px for the editor 3-column → stacked layout) use Tailwind arbitrary variants: `[@media(max-width:1100px)]:`.

When adding styling, prefer Tailwind → fall back to `editor.css` only if Tailwind literally can't express it. Do not reintroduce dead CSS classes.

### Print support

The editor uses `print:hidden` on chrome (topbar, panels, status pill) and `print:bg-white` / `print:shadow-none` on the paper. The `@media print` block in `editor.css` uses `!important` because the canvas JS sets inline `transform`/`width`/`minHeight` that CSS classes cannot override. The export-to-PDF flow captures each `.cv-paper` page with `@zumer/snapdom` and stitches them into a multi-page file with `jspdf` (see `handleExport` in `editor.tsx`); it falls back to `window.print()` on failure.

## Branding

Product name: **SealCV** (not "sealcv" or "Seal CV"). Logo at `public/logo.webp` (96×96 source, render at 24×24 in topbar, 56×56 in loading skeleton). Tagline: "Build your resume, deploy your future 💼✨".
