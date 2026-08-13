#!/usr/bin/env bash
set -euo pipefail
: "${GCP_PROJECT_ID:?GCP_PROJECT_ID env var required}"
: "${GA4_DATASET_ID:?GA4_DATASET_ID env var required (e.g. analytics_XXXXXXXXX)}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
envsubst '${GCP_PROJECT_ID} ${GA4_DATASET_ID}' < "$SCRIPT_DIR/views/flat_events.sql" | bq query --project_id="$GCP_PROJECT_ID" --use_legacy_sql=false
