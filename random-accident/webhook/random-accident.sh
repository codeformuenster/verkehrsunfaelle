#!/bin/bash


COUNT=$(psql -qtAX postgresql://accidents:PASSWORD@postgres/accidents -c "SELECT count(id) FROM objects WHERE resource_name = 'record' AND parent_id = '/buckets/accidents/collections/geometries';")

psql -qtAX postgresql://accidents:PASSWORD@postgres/accidents -c "
  WITH
    geometries AS (SELECT * FROM objects WHERE resource_name = 'record' AND parent_id = '/buckets/accidents/collections/geometries'),
    accidents AS (SELECT * FROM objects WHERE resource_name = 'record' AND parent_id = '/buckets/accidents/collections/accidents_raw'),
    result AS (SELECT
      geometries.id AS geometry_id,
      geometries.data->>'accident_id' AS accident_id,
      geometries.data->'lat' AS lat,
      geometries.data->'lon' AS lon,
      accidents.data->'place' AS place,
      accidents.data->'place_near' AS place_near,
      (date(accidents.data->>'date') + TO_TIMESTAMP(accidents.data->>'time_of_day', 'HH24:MI:SS')::time) AS timestamp
    FROM geometries JOIN accidents ON geometries.data->>'accident_id' = accidents.id OFFSET floor(random()*${COUNT}) LIMIT 1)
  SELECT row_to_json(result) FROM result;
"
