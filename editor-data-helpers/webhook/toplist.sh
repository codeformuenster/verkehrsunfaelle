#!/bin/bash

psql -qtAX ${POSTGRES_URL} -c "
  WITH corrections AS
    (SELECT parent_id|| '/records/' || id AS object_id
     FROM objects
     WHERE parent_id = '/buckets/accidents/collections/geometries_corrections'),
       toplist AS
    (SELECT json_build_object('principal', principal, 'count', count(principal)) AS toplist_items,
            count(principal)
     FROM access_control_entries
     WHERE object_id IN
         (SELECT object_id
          FROM corrections)
     GROUP BY principal
     ORDER BY COUNT DESC)
  SELECT jsonb_build_object('toplist', json_agg(toplist_items))
  FROM toplist;
"
