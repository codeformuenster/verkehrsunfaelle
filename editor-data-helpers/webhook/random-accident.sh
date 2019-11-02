#!/bin/bash

ACCIDENT_ID=$(psql -qtAX ${POSTGRES_URL} -c "
  SELECT id
  FROM objects
  WHERE resource_name = 'record'
    AND parent_id = '/buckets/accidents/collections/accidents_raw'
  OFFSET floor(random()*(
    SELECT count(id) FROM objects
    WHERE resource_name = 'record'
    AND parent_id = '/buckets/accidents/collections/accidents_raw'))
  LIMIT 1;
")

psql -qtAX ${POSTGRES_URL} -c "
  WITH
    accident AS (
      SELECT
        id AS accident_id,
        data->'place' AS place,
        data->'place_near' AS place_near,
        data->'source_file' AS source_file,
        data->'source_row_number' AS source_row_number,
        data->'accident_category' AS accident_category,
        data->'accident_type' AS accident_type,
        data->'cause_1_4' AS cause_1_4,
        data->'cause_2' AS cause_2,
        data->'cause_3' AS cause_3,
        data->'cause_other' AS cause_other,
        data->'cause_02' AS cause_02,
        data->'participants_01' AS participants_01,
        data->'participants_02' AS participants_02,
        data->'deaths' AS deaths,
        data->'seriously_injured' AS seriously_injured,
        data->'slightly_injured' AS slightly_injured
      FROM objects
      WHERE resource_name = 'record'
        AND parent_id = '/buckets/accidents/collections/accidents_raw'
        AND id = '${ACCIDENT_ID}'
    ),
    geometries AS (
      SELECT
        id as geometry_id,
        data->>'accident_id' AS accident_id,
        data->'lat' AS lat,
        data->'lon' AS lon
      FROM objects
      WHERE resource_name = 'record'
        AND parent_id = '/buckets/accidents/collections/geometries'
        AND data->>'accident_id' = '${ACCIDENT_ID}'
    ),
    result AS (
      SELECT *
      FROM accident LEFT JOIN geometries USING (accident_id)
      LIMIT 1
    )
  SELECT row_to_json(result) FROM result;
"
