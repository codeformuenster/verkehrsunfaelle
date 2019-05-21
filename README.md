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

Run the importer

    docker-compose run --rm importer

Or just import a single file

    docker-compose run --rm importer python processing/importer.py '/data/VU PP 2015.xlsb'

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
