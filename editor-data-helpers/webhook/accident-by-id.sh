#!/bin/bash

ID=${1:-}
if [[ -z "$ID" ]]; then
    echo -n '{ "error": "missing id url parameter", "missingParameter": true }'
    exit 0
fi
shift

RND=$(date +%s%N)

RESULT=$(psql -qtAX ${POSTGRES_URL} -c "
  PREPARE accidentbyid$RND (text) AS
  WITH
    geometries AS (
      SELECT
        id as geometry_id,
        data->>'accident_id' AS accident_id,
        data->'lat' AS lat,
        data->'lon' AS lon
      FROM objects
      WHERE data->>'accident_id' = \$1
        AND resource_name = 'record'
        AND parent_id = '/buckets/accidents/collections/geometries'),
    result AS (
      SELECT
        g.geometry_id,
        g.accident_id,
        g.lat,
        g.lon,
        a.data->'place' AS place,
        a.data->'place_near' AS place_near,
        a.data->'source_file' AS source_file,
        a.data->'source_row_number' AS source_row_number,
        a.data->'accident_category' AS accident_category,
        a.data->'accident_type' AS accident_type,
        a.data->'cause_1_4' AS cause_1_4,
        a.data->'cause_2' AS cause_2,
        a.data->'cause_3' AS cause_3,
        a.data->'cause_other' AS cause_other,
        a.data->'cause_02' AS cause_02,
        a.data->'participants_01' AS participants_01,
        a.data->'participants_02' AS participants_02,
        a.data->'deaths' AS deaths,
        a.data->'seriously_injured' AS seriously_injured,
        json_build_object(
          'pedestrian', a.data->'pedestrian',
          'bicycle', a.data->'bicycle',
          'small_moped', a.data->'small_moped',
          'moped', a.data->'moped',
          'motorcycle', a.data->'motorcycle',
          'car', a.data->'car',
          'lorry', a.data->'lorry',
          'omnibus', a.data->'omnibus',
          'other_road_user', a.data->'other_road_user'
        ) AS participants,
        a.data->'date' AS date,
        a.data->'time_of_day' AS time_of_day
      FROM objects AS a, geometries AS g
      WHERE
        a.id = \$1
        AND a.resource_name = 'record'
        AND a.parent_id = '/buckets/accidents/collections/accidents_raw')
    SELECT row_to_json(result) FROM result;
  EXECUTE accidentbyid$RND('$ID');
")

if [[ -z "$RESULT" ]]; then
    echo -n '{ "error": "empty result", "empty": true }'
    exit 0
fi

echo -n "$RESULT"
