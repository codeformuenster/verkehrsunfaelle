#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

echo -n "Exporting years 2007 to 2018 in separate files ... "
# export yearly csv files
for year in $(seq 2007 2018); do
    sed -e "/WHERE/adate_part('year', date(data->>'date')) = ${year} AND" csv-export.sql | sudo docker-compose exec -T postgres psql -qt postgres://postgres@/accidents > verkehrsunfaelle_raw_"${year}".csv
done

echo "done"

echo -n "Concatenating years 2007 to 2018 to single file ... "
# export csv file with all years
cat verkehrsunfaelle_raw_*.csv > verkehrsunfaelle_raw_2007-2018.csv

echo "done"
