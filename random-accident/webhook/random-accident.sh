#!/bin/bash

# TODO move this into container initialization
COUNT=$(psql -qtAX postgresql://accidents:PASSWORD@postgres/accidents -c "
  SELECT count(id) FROM objects
  WHERE resource_name = 'record'
    AND parent_id = '/buckets/accidents/collections/geometries';")

psql -qtAX postgresql://accidents:PASSWORD@postgres/accidents -c "
  WITH
    geometries AS (
      SELECT
        id as geometry_id,
        data->>'accident_id' AS accident_id,
        data->'lat' AS lat,
        data->'lon' AS lon
      FROM objects
      WHERE resource_name = 'record'
        AND parent_id = '/buckets/accidents/collections/geometries'
      OFFSET floor(random()*${COUNT}) LIMIT 1),
    result AS (
      SELECT
        g.geometry_id,
        g.accident_id,
        g.lat,
        g.lon,
        a.data->'place' AS place,
        a.data->'place_near' AS place_near
      FROM objects AS a, geometries AS g
      WHERE a.resource_name = 'record'
        AND a.parent_id = '/buckets/accidents/collections/accidents_raw'
        AND a.id = g.accident_id)
  SELECT row_to_json(result) FROM result;
"
