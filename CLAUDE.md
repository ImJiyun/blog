# Data Learning Platform

A personal blog whose own usage data feeds a BI/analytics practice. Not just a blog —
the project is deliberately scoped as a content platform (Phase 1) that later grows
event logging, an ETL pipeline, a BI dashboard, and personal learning analytics on top
of the same data.

## Roadmap

1. **Content Platform** (current phase — see spec below)
2. Event Logging — page_view, scroll_depth, reading_time, click, search-query tracking
3. Pipeline / Warehouse — ETL from Postgres into BigQuery (or DuckDB)
4. BI Dashboard — Traffic / Content / Funnel dashboards
5. Learning Analytics — author's own study metadata (difficulty, time spent, AI-assisted
   flag, revision count) as a personal dashboard

Each phase is an independent sub-project with its own design spec under
`docs/superpowers/specs/`. Don't pull work from a later phase forward unless a spec for
it has been written and approved — e.g. don't add event-logging tables or
learning-analytics columns while still on Phase 1.

## Current Phase: Content Platform

Full design: `.notes/superpowers/specs/content-platform-design.md`

Stack:

- Frontend: Next.js (App Router) on Cloud Run
- Backend: FastAPI on Cloud Run
- Database: PostgreSQL on Neon (serverless, free tier — not Cloud SQL, to avoid its
  ~$10-30/mo fixed cost at this traffic level)

Key decisions worth knowing before touching this code:

- `posts.id` (uuid) is the internal/write identifier; `posts.slug` is the public
  read-route identifier. Never conflate them — writes go through `id`, public URLs go
  through `slug`.
- `visitor_id` (anonymous cookie) is used for like-dedup now and is intentionally
  designed to carry over into Phase 2's event logging — don't invent a second
  anonymous-visitor concept later.
- Comments are anonymous with reply threading (`parent_comment_id`) but no
  notifications — no email capture, no notification system. This was a deliberate
  scope cut, not an oversight.
- Auth is a single hardcoded admin identity (password hash in env config -> JWT). No
  user table, no roles, no signup.
- This is also the author's one personal blog (travel, career posts), not a pure
  technical portfolio. Personal content lives under `/life` and is deliberately
  excluded from the `Latest` home feed, which stays technical/study content only — see
  the spec's Frontend Pages section before changing nav or the home feed query.

## Working Conventions

- Follow the spec docs in `docs/superpowers/specs/` — when a task isn't covered by an
  approved spec, brainstorm and write one before implementing (see
  `superpowers:brainstorming` skill).
- Keep phases isolated. Resist adding "just one column" for a future phase before that
  phase has its own spec — it's cheap to add later and it clutters the current schema's
  intent.
