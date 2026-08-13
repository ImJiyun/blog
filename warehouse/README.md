# warehouse

BigQuery export layer for GA4 event data (Phase 3 — see
`.notes/superpowers/specs/warehouse-export-design.md` for the full design).

## One-time setup (manual, GA4 console)

The GA4 → BigQuery Link itself is not code — it's set up once in the GA4
console (Admin → BigQuery Links), under the Google account that owns both the
GA4 property and the GCP project this repo deploys to (no cross-account
permission grant needed when that's the same account). See the design doc for
the exact steps if this ever needs to be redone (e.g. a new GA4 property).

## Applying view definitions

Views under `warehouse/views/*.sql` use `${GCP_PROJECT_ID}` /
`${GA4_DATASET_ID}` placeholder tokens — no real values are committed to this
repo (this repo may go public later; neither value is secret, but there's no
reason to hardcode an environment-specific identifier into versioned SQL).

```bash
export GCP_PROJECT_ID=<your GCP project ID>
export GA4_DATASET_ID=analytics_<your GA4 property ID>
./warehouse/apply-view.sh
```

Re-run the same command any time a view's `.sql` file changes — `CREATE OR
REPLACE VIEW` makes this idempotent. Not wired into any CI/CD pipeline;
deliberately kept separate from the Cloud Run app deploy (Phase 1).

## Verifying data is flowing

GA4's daily export can take up to ~48h to produce the first
`events_YYYYMMDD` table after the BigQuery Link is connected. Once it has:

```bash
bq query --use_legacy_sql=false \
  "SELECT event_name, COUNT(*) AS n
   FROM \`\${GCP_PROJECT_ID}.\${GA4_DATASET_ID}.events_flat\`
   WHERE event_name IN ('scroll_depth', 'reading_time')
   GROUP BY event_name"
```

Expected: both `scroll_depth` and `reading_time` show up with `n > 0` — these
are the two custom events already confirmed firing in the GA4 UI (2026-08-13)
before this BigQuery layer existed, so seeing them here confirms the export +
view pipeline end to end.
