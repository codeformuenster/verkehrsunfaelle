# Verkehrsunfälle in Münster

Daten und Tools für die Verarbeitung von Verkehrsunfalldaten der Polizei Münster.

- [Quickstart](#quickstart) importing raw data
- [Geocoding](#geocoding) try to guess the location of the accident
- [I just want the data](#data-container-images) Container images with built in data

## Quickstart

Start Kinto (Datastore)

    docker-compose up -d kinto

Initialize Kinto

    docker-compose run --rm initializer

Run the importer. This takes a long time (> 1 hour). If you are not that patient consider using a ready-made container instead (see [Data container images](#data-container-images)).

    docker-compose run --rm importer

Or just import a single file

    docker-compose run --rm importer python processing/importer.py '/data/VU PP 2015.xlsb'

### I am getting import errors!?

Rows 10120 to 10142 in file [`VU PP 2015.xlsb`](https://github.com/codeformuenster/verkehrsunfaelle/blob/master/data/VU%20PP%202015.xlsb), row 10482 in file [`VU PP 2016.xlsx`](https://github.com/codeformuenster/verkehrsunfaelle/blob/master/data/VU%20PP%202016.xlsx), row 10902 in file [`VU PP 2017.xlsx`](https://github.com/codeformuenster/verkehrsunfaelle/blob/master/data/VU%20PP%202017.xlsx) and row 10901 in file [`VU PP 2018.xlsx`](https://github.com/codeformuenster/verkehrsunfaelle/blob/master/data/VU%20PP%202018.xlsx) are known to produce `failed to import` errors. These rows are the very last rows in each of these files and are empty. The import error is produced because empty rows cannot be imported.

## Geocoding

Download OSM extract of Münster for Nominatim & Overpass

    wget -O nominatim/muenster-regbez-latest.osm.pbf http://download.geofabrik.de/europe/germany/nordrhein-westfalen/muenster-regbez-latest.osm.pbf
    wget -O overpass/muenster-regbez-latest.osm.bz2 http://download.geofabrik.de/europe/germany/nordrhein-westfalen/muenster-regbez-latest.osm.bz2

Initialize Nominatim and Overpass. This will take a long time!

    docker-compose run --rm nominatim-import

Initialize Overpass

    docker-compose run --rm overpass

Start Nominatim & Overpass

    docker-compose up -d nominatim overpass

Execute the geocoder

    docker-compose run --rm geocoder

## Exporting a database dump

    docker-compose exec postgres pg_dump postgres://accidents@/accidents --encoding=utf8 --format=plain --no-owner --no-acl --no-privileges | gzip -9 > dump.sql.gz

## Data container images

Container images with built in data are available from [quay.io/repository/codeformuenster/verkehrsunfaelle](https://quay.io/repository/codeformuenster/verkehrsunfaelle).

The images are based on the [official postgres container images](https://hub.docker.com/_/postgres) from the docker hub. Just treat them as such.

### Simple Usage

Find the latest container image tag on [the quay.io repository](https://quay.io/repository/codeformuenster/verkehrsunfaelle) and start a container from it and wait until `database system is ready to accept connections` is printed.

    docker run --rm --name verkehrsunfaelle -p 5432:5432 quay.io/codeformuenster/verkehrsunfaelle:2019-06-06

Open a second terminal. Execute psql inside the container

    docker exec -it verkehrsunfaelle psql -U postgres

The data lives in the table `objects` in the column `data` as [JSON](https://www.postgresql.org/docs/11/datatype-json.html).

Get all accidents

    SELECT id, data FROM objects WHERE resource_name = 'record' AND parent_id = '/buckets/accidents/collections/accidents_raw';

Get all geometries

    SELECT id, data FROM objects WHERE resource_name = 'record' AND parent_id = '/buckets/accidents/collections/geometries';

Available fields inside `data` can be found in the file [kinto/schema.yml](kinto/schema.yml)
