# Design Tokens — Quick Reference

Source of truth: `.notes/superpowers/specs/content-platform-design.md` ("Visual Design
System" section). This file is a scannable excerpt for quick lookup while building
frontend components — if it ever disagrees with the spec or with `src/app/globals.css`,
those two win, update this file to match.

Implemented in: `src/app/globals.css` (color tokens, typography scale, global resets),
`src/app/fonts.ts` (JetBrains Mono via `next/font/google`), Pretendard loaded via
`pretendard/dist/web/static/pretendard.css` in `src/app/layout.tsx`.

**Redesign note (2026-07, PR #62):** the color palette moved from flat hex to `oklch()`
and the mono typeface moved from IBM Plex Mono to JetBrains Mono, based on a Claude
Design prototype (`Blog v1.dc.html`/`Admin.dc.html`) brought in for a full visual
refresh — see issue #61. The tables below reflect the post-refresh state; treat this
file, not the older prototype files, as current.

## Color

| Token             | Light                        | Dark                          | Used for                                          |
|-------------------|-------------------------------|--------------------------------|----------------------------------------------------|
| `--bg`            | `oklch(0.99 0.002 90)`        | `oklch(0.16 0 0)`              | page background                                    |
| `--card-bg`       | `oklch(0.97 0.002 90)`        | `oklch(0.20 0 0)`               | card thumbnails, code block background, card panels |
| `--ink`           | `oklch(0.16 0 0)`             | `oklch(0.95 0 0)`               | primary text                                        |
| `--ink-soft`      | `oklch(0.5 0 0)`              | `oklch(0.65 0 0)`               | secondary text (excerpts, metadata)                 |
| `--accent`        | `oklch(0.58 0.13 230)`        | `oklch(0.78 0.11 230)`          | links, category labels, tags, active-pill fills     |
| `--accent-soft`   | `oklch(0.58 0.13 230 / 0.10)` | `oklch(0.78 0.11 230 / 0.14)`   | hover/active tints                                  |
| `--border`        | `oklch(0.88 0 0)`             | `oklch(0.32 0 0)`               | hairlines, card/code block borders                  |
| `--border-strong` | `oklch(0.72 0 0)`             | `oklch(0.42 0 0)`               | post-card border (1.5px, more contrast than `--border`) |

Monochrome black-on-white is still the base; `--accent` shifted hue from a clear blue
(`#4898EE`) to a teal/cyan (`oklch(0.58 0.13 230)` ≈ `#0087B8`) as part of the prototype
adoption — this was a deliberate choice, not a bug, even though it reads as text below
WCAG AA contrast (3.97:1) in a few solid-fill spots (active nav tab, active tag chip).
Dark mode follows OS preference (`prefers-color-scheme`), with `[data-theme="dark"]` /
`[data-theme="light"]` override hooks in `globals.css` driven by a working toggle button
(`ThemeToggle`, top-right of the header on every page).

## Radius

| Token           | Value   | Used for                                                        |
|-----------------|---------|-------------------------------------------------------------------|
| `--radius-sm`   | `6px`   | cards, code blocks, bordered panels (About, admin login, forms)  |
| `--radius-pill` | `999px` | nav tabs, tag chips, theme toggle track, buttons, badges         |

## Type

- **Pretendard** — the only typeface for content. Weight carries hierarchy:
  - **900 (Black)** — hero title, post titles, card titles
  - **500 (Medium)** — nav / metadata / UI labels
  - **400 (Regular)** — body copy
- **JetBrains Mono** (400/500/700) — code blocks, the category label and index badge
  inside card thumbnails, the nav wordmark's `>` prompt + "hanul.dev" text, post-detail
  meta text (date/read time), the table-of-contents "목차" label. Not used for
  dates/metadata elsewhere. Loaded as `--font-mono` via `next/font/google`, attached
  through the `plexMono.variable` class on `<html>` (not declared in `globals.css`
  directly — see the comment there for why). Keep all three weights loaded — dropping
  any one silently makes existing mono text that doesn't set an explicit weight fall
  back to a heavier loaded face (bit us once in PR #62's final review).

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

- **Top bar**: mono wordmark `>hanul.dev` (the `>` in `--accent`) left, working
  dark/light mode toggle (sliding pill switch, not an icon button) + GitHub button
  right (`space-between`). Shown on every page, including `/posts/[slug]` and
  `/admin/*`. On mobile (≤560px) the tab row below it scrolls horizontally instead of
  overflowing the page.
- **Avatar**: small circular character illustration, centered directly below the top
  bar. Shown on every page except `/posts/[slug]` and `/admin/*` (those are
  reading/functional screens, not browsing entry points).
- **Tab nav**: Latest / Study / Life / About, centered, rendered as `--radius-pill`
  buttons — active tab is a solid `--accent` fill with `--bg`-colored text (not an
  underline); `space-between` against a pill-shaped live search input pinned right
  (debounced, routes to `/posts?q=`).
- **Card grid**: 2 columns. Photo if `thumbnailUrl` exists, else flat `--card-bg` block
  with category name in small-caps mono. Each card also gets a numbered `01`/`02`/...
  badge (mono, `--ink`-on-`--bg` chip) pinned to the thumbnail's top-left corner.
- **Tag filter chips** (`/posts`, `/study`, `/life`, and now the home feed): `--radius-pill`
  pills, not bordered rectangles. Tag name in `--ink`, count in small `--ink-soft` mono.
  Active chip is a solid `--accent` fill with `--bg`-colored text. `PostCard` also shows
  each post's own tags as static (non-interactive) `--radius-pill` pills — those aren't
  filter controls, just labels.
- **Post detail**: centered breadcrumb + title + meta (meta text in mono `--accent`),
  then two columns — body copy main column, sticky 200px table-of-contents right rail
  (headed by a small mono "목차" label). Code blocks are bordered `--card-bg` panels.
  Tags are `--radius-pill` badges at the end of the body (not plain text links). Like
  button is a dot-indicator pill (no count — the API only returns `{ liked: boolean }`).
  Thin `--accent` scroll-progress bar fixed to viewport top, scaled to the article
  element's own scroll range (not the whole page).
- **Admin** (a keyboard-shortcut login modal, `/admin/posts`, editor): same wordmark/pill
  language as the public site — bordered `--card-bg` cards for the login modal and the
  post editor, a `--radius-sm` bordered table for the post list with `--radius-pill`
  action buttons,
  and an inverted (`--ink` background) pill for the primary action (Log in / Publish /
  + New Post).

## Known follow-up (not urgent)

`globals.css` currently repeats the full light/dark token table across 4 selectors
(`:root`, `@media (prefers-color-scheme: dark)`, `[data-theme="dark"]`,
`[data-theme="light"]`) — flagged in Task 1's code review (PR #62) as a future drift
risk, same concern as before the redesign, just with more tokens now (`--border-strong`,
plus the two radius tokens which are theme-independent and live only in `:root`). Fine
as-is; collapse to a single source (e.g. only override the delta under `[data-theme]`)
if it ever becomes a real maintenance burden.

A few minor visual inconsistencies from the redesign are known and deferred, not
blocking: `PostCard`'s index-badge radius is hardcoded to `6px` instead of referencing
`--radius-sm`; `PostForm`'s image-upload button wasn't migrated to the pill/radius-sm
language used by the rest of the form; `MarkdownBody`'s code-block/inline-code radii
weren't migrated to `--radius-sm`. Bundle these into one small cleanup pass if picked up.
