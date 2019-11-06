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
        data->'slightly_injured' AS slightly_injured,
        data->'pedestrian' AS pedestrian,
        data->'bicycle' AS bicycle,
        data->'small_moped' AS small_moped,
        data->'moped' AS moped,
        data->'motorcycle' AS motorcycle,
        data->'car' AS car,
        data->'lorry' AS lorry,
        data->'omnibus' AS omnibus,
        data->'other_road_user' AS other_road_user,
        data->'date' AS date,
        data->'time_of_day' AS time_of_day
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
      SELECT
        geometry_id,
        accident_id,
        lat,
        lon,
        place,
        place_near,
        source_file,
        source_row_number,
        accident_category,
        accident_type,
        cause_1_4,
        cause_2,
        cause_3,
        cause_other,
        cause_02,
        participants_01,
        participants_02,
        deaths,
        seriously_injured,
        json_build_object(
          'pedestrian', pedestrian,
          'bicycle', bicycle,
          'small_moped', small_moped,
          'moped', moped,
          'motorcycle', motorcycle,
          'car', car,
          'lorry', lorry,
          'omnibus', omnibus,
          'other_road_user', other_road_user
        ) AS participants,
        date,
        time_of_day
      FROM accident LEFT JOIN geometries USING (accident_id)
      LIMIT 1
    )
  SELECT row_to_json(result) FROM result;
"
