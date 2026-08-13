CREATE OR REPLACE VIEW `${GCP_PROJECT_ID}.${GA4_DATASET_ID}.events_flat` AS
SELECT
  PARSE_DATE('%Y%m%d', event_date) AS event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_timestamp,
  event_name,
  user_pseudo_id,
  device.category AS device_category,
  device.web_info.browser AS browser,
  geo.country AS country,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep
   WHERE ep.key = 'page_path') AS page_path,
  event_params  -- kept intact; UNNEST per-query for custom params
                 -- (post_slug, depth_percentage, seconds, target_type,
                 -- tag, search_term) rather than hardcoding columns here
FROM `${GCP_PROJECT_ID}.${GA4_DATASET_ID}.events_*`
