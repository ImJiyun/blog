# warehouse

BigQuery export layer for GA4 event data (Phase 3 — see
`.notes/superpowers/specs/warehouse-export-design.md` for the full design).

## Prerequisites

- Google Cloud SDK installed and authenticated (`gcloud auth login`).
- BigQuery API enabled on the target GCP project.
- `envsubst` available (ships with `gettext`; **not** installed by default on
  macOS — install with `brew install gettext && brew link --force gettext`).
- A default `gcloud`/`bq` project isn't strictly required — `bq query` is
  invoked with `--project_id` explicitly — but `gcloud`/`bq` still need some
  valid authenticated account to run at all.

## One-time setup (manual, GA4 console)

The GA4 → BigQuery Link itself is not code — it's set up once in the GA4
console (Admin → BigQuery Links), under the Google account that owns both the
GA4 property and the GCP project this repo deploys to (no cross-account
permission grant needed when that's the same account). See the design doc for
the exact steps if this ever needs to be redone (e.g. a new GA4 property).

## Applying view definitions

The single view currently in this repo, `warehouse/views/flat_events.sql`,
uses `${GCP_PROJECT_ID}` / `${GA4_DATASET_ID}` placeholder tokens — no real
values are committed to this repo (this repo may go public later; neither
value is secret, but there's no reason to hardcode an environment-specific
identifier into versioned SQL).

```bash
export GCP_PROJECT_ID=<your GCP project ID>
export GA4_DATASET_ID=analytics_<your GA4 property ID>
./warehouse/apply-view.sh
```

`apply-view.sh` resolves its own script directory, so it can be run from any
cwd. Today it only applies `views/flat_events.sql` (there's just the one view
so far) — re-run the same command any time that file changes, `CREATE OR
REPLACE VIEW` makes this idempotent. If a second view is added later, it will
need its own apply invocation (or the script extended into a loop at that
point — not built now since it'd be speculative for a single-view repo). Not
wired into any CI/CD pipeline; deliberately kept separate from the Cloud Run
app deploy (Phase 1).

## Verifying data is flowing

GA4's daily export can take up to ~48h to produce the first
`events_YYYYMMDD` table after the BigQuery Link is connected. Once it has:

```bash
bq query --use_legacy_sql=false \
  "SELECT event_name, COUNT(*) AS n
   FROM \`$GCP_PROJECT_ID.$GA4_DATASET_ID.flat_events\`
   WHERE event_name IN ('scroll_depth', 'reading_time')
   GROUP BY event_name"
```

Expected: both `scroll_depth` and `reading_time` show up with `n > 0` — these
are the two custom events already confirmed firing in the GA4 UI (2026-08-13)
before this BigQuery layer existed, so seeing them here confirms the export +
view pipeline end to end.
