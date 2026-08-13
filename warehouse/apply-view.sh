#!/usr/bin/env bash
set -euo pipefail
: "${GCP_PROJECT_ID:?GCP_PROJECT_ID env var required}"
: "${GA4_DATASET_ID:?GA4_DATASET_ID env var required (e.g. analytics_XXXXXXXXX)}"

envsubst < warehouse/views/events_flat.sql | bq query --use_legacy_sql=false
