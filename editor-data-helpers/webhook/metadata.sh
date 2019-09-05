#!/bin/bash

psql -qtAX ${POSTGRES_URL} -c "
  WITH
    accident_category AS
      (SELECT json_agg(data) as data
       FROM objects
       WHERE resource_name = 'record'
         AND parent_id = '/buckets/accidents/collections/accident_category'),
    accident_type AS
      (SELECT json_agg(data) as data
       FROM objects
       WHERE resource_name = 'record'
         AND parent_id = '/buckets/accidents/collections/accident_type'),
    accident_kind AS
      (SELECT json_agg(data) as data
       FROM objects
       WHERE resource_name = 'record'
         AND parent_id = '/buckets/accidents/collections/accident_kind'),
    accident_cause AS
      (SELECT json_agg(data) as data
       FROM objects
       WHERE resource_name = 'record'
         AND parent_id = '/buckets/accidents/collections/accident_cause'),
    traffic_involvement AS
      (SELECT json_agg(data) as data
       FROM objects
       WHERE resource_name = 'record'
         AND parent_id = '/buckets/accidents/collections/traffic_involvement')
  SELECT json_build_object(
    'accident_category', accident_category.data,
    'accident_type', accident_type.data,
    'accident_kind', accident_kind.data,
    'accident_cause', accident_cause.data,
    'traffic_involvement', traffic_involvement.data
    )
  FROM
    accident_category,
    accident_type,
    accident_kind,
    accident_cause,
    traffic_involvement
"
