#!/bin/bash

psql -qtAX ${POSTGRES_URL} -c "
  WITH
    count_accidents AS
      (SELECT count(id)
       FROM objects
       WHERE resource_name = 'record'
         AND parent_id = '/buckets/accidents/collections/accidents_raw'),
    count_geometries AS
      (SELECT count(id)
       FROM objects
       WHERE resource_name = 'record'
         AND parent_id = '/buckets/accidents/collections/geometries'),
    count_corrections AS
      (SELECT count(id)
       FROM objects
       WHERE resource_name = 'record'
         AND parent_id = '/buckets/accidents/collections/geometries_corrections'),
    count_accounts AS
      (SELECT count(id)
       FROM objects
       WHERE resource_name = 'account' AND id <> 'admin')
  SELECT json_build_object(
    'num_accidents', count_accidents.count,
    'num_geometries', count_geometries.count,
    'num_corrections', count_corrections.count,
    'num_accounts', count_accounts.count
    )
  FROM count_accidents,
       count_geometries,
       count_corrections,
       count_accounts;
"
