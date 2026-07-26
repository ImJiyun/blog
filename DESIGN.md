# Design Tokens — Quick Reference

Source of truth: `.notes/superpowers/specs/content-platform-design.md` ("Visual Design
System" section). This file is a scannable excerpt for quick lookup while building
frontend components — if it ever disagrees with the spec or with `src/app/globals.css`,
those two win, update this file to match.

Implemented in: `src/app/globals.css` (color tokens, typography scale, global resets),
`src/app/fonts.ts` (IBM Plex Mono via `next/font/google`), Pretendard loaded via
`pretendard/dist/web/static/pretendard.css` in `src/app/layout.tsx`.

## Color

| Token           | Light     | Dark      | Used for                                    |
|-----------------|-----------|-----------|----------------------------------------------|
| `--bg`          | `#FFFFFF` | `#101114` | page background                              |
| `--card-bg`     | `#F2F2EF` | `#1B1D22` | card thumbnails, code block background       |
| `--ink`         | `#14171A` | `#F2F2F0` | primary text                                 |
| `--ink-soft`    | `#6B7280` | `#9A9CA3` | secondary text (excerpts, metadata)          |
| `--accent`      | `#4898EE` | `#6FB0F5` | links, category labels, tags — only color    |
| `--accent-soft` | `#DCEAFB` | `#223349` | hover/active tints                           |
| `--border`      | `#E6E6E2` | `#2A2C31` | hairlines, card/code block borders           |

Monochrome black-on-white is the base. `--accent` is a narrow, deliberate accent — never
a background fill. Dark mode follows OS preference (`prefers-color-scheme`), with
`[data-theme="dark"]` / `[data-theme="light"]` override hooks already wired in
`globals.css` for a future manual toggle (no toggle UI exists yet).

## Type

- **Pretendard** — the only typeface for content. Weight carries hierarchy:
  - **900 (Black)** — hero title, post titles, card titles
  - **500 (Medium)** — nav / metadata / UI labels
  - **400 (Regular)** — body copy
- **IBM Plex Mono** (400/500) — code blocks and the category label inside card
  thumbnails only. Not used for dates/metadata. Loaded as `--font-mono` via
  `next/font/google`, attached through the `plexMono.variable` class on `<html>` (not
  declared in `globals.css` directly — see the comment there for why).

## Typography scale (CSS vars, `globals.css`)

| Var                 | Value      | Used for            |
|----------------------|-----------|----------------------|
| `--text-hero`        | `2.75rem` | hero title           |
| `--text-h1`          | `2.25rem` | page titles          |
| `--text-h2`          | `1.5rem`  | section headings     |
| `--text-card-title`  | `1.15rem` | card titles          |
| `--text-body`        | `1rem`    | body copy            |
| `--text-meta`        | `0.85rem` | metadata text        |
| `--text-mono`        | `0.8rem`  | mono/code-sized text |

## Layout quick facts

- **Top bar**: `jiyun.dev` text wordmark left, dark/light mode toggle + GitHub button
  right (`space-between`). Shown on every page, including `/posts/[slug]` and
  `/admin/*`.
- **Avatar**: small circular character illustration, centered directly below the top
  bar. Shown on every page except `/posts/[slug]` and `/admin/*` (those are
  reading/functional screens, not browsing entry points). Replaces the old
  home-only "Data Learning Platform" hero title.
- **Tab nav**: Latest / Study / Life / About, centered, active tab underlined in
  `--accent`; search icon pinned right.
- **Card grid**: 2 columns. Photo if `thumbnailUrl` exists, else flat `--card-bg` block
  with category name in small-caps mono.
- **Tag filter chips** (`/posts` etc.): bordered rectangles, not pills. Tag name in
  `--ink`, count in small `--ink-soft` mono. Active chip switches both to `--accent`.
- **Post detail**: centered breadcrumb + title + meta, then two columns — body copy
  main column, sticky 200px table-of-contents right rail. Code blocks are bordered
  `--card-bg` panels. Tags are plain `--accent` text links at the end of the body (not
  pills). Thin `--accent` scroll-progress bar fixed to viewport top, scaled to the
  article element's own scroll range (not the whole page).

## Known follow-up (not urgent)

`globals.css` currently repeats the full light/dark hex table across 4 selectors
(`:root`, `@media (prefers-color-scheme: dark)`, `[data-theme="dark"]`,
`[data-theme="light"]`) — flagged in Task 1's code review as a future drift risk. Fine
as-is with no theme-toggle UI yet; collapse to a single source (e.g. only override the
delta under `[data-theme]`) if/when a toggle gets built.
