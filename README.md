# Verkehrsunfälle in Münster

[![Diskussion im Chat](https://img.shields.io/matrix/verkehrsunfaelle-muenster:matrix.org?label=Diskussion%20im%20Chat&style=for-the-badge)](https://matrix.to/#/#verkehrsunfaelle-muenster:matrix.org)

Daten und Tools für die Verarbeitung von Verkehrsunfalldaten der Polizei Münster.

- [Quickstart](#quickstart) importing raw data
- [Geocoding](#geocoding) try to guess the location of the accident
- [I just want the data](#data-container-images) Container images with built in data
- [Metadata](#metadata) Metadata
- [CSV](#csv-files) csv files

## Quickstart data import

Initialize containers (may fail, just retry)

    ./ctl.sh init

Run the importer. This takes a long time (> 1 hour). If you are not that patient consider using a ready-made container instead (see [Data container images](#data-container-images)).

    ./ctl.sh import

Or just import a single file

    docker-compose run --rm importer python processing/importer.py 'VU PP 2015.xlsb'

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

    ./ctl.sh geocode

## Exporting a database dump

    docker-compose exec postgres pg_dump postgres://postgres@/accidents --encoding=utf8 --format=plain --no-owner --no-acl --no-privileges | gzip -9 > dump.sql.gz

## Data container images

Container images with built in data are available from [quay.io/repository/codeformuenster/verkehrsunfaelle](https://quay.io/repository/codeformuenster/verkehrsunfaelle).

The images are based on the [official postgres container images](https://hub.docker.com/_/postgres) from the docker hub. Just treat them as such.

You'll find instructions on how to build the data container images in directory [data-container-image](data-container-image).

### Simple Usage

Find the latest container image tag on [the quay.io repository](https://quay.io/repository/codeformuenster/verkehrsunfaelle) and start a container from it and wait until `database system is ready to accept connections` is printed.

    docker run --rm --name verkehrsunfaelle -p 5432:5432 quay.io/codeformuenster/verkehrsunfaelle:2019-11-15

Open a second terminal. Execute psql inside the container

    docker exec -it verkehrsunfaelle psql -U postgres accidents

The data lives in the table `objects` in the column `data` as [JSON](https://www.postgresql.org/docs/12/datatype-json.html).

Get all accidents

    SELECT id, data FROM objects WHERE resource_name = 'record' AND parent_id = '/buckets/accidents/collections/accidents_raw';

Get all geometries

    SELECT id, data FROM objects WHERE resource_name = 'record' AND parent_id = '/buckets/accidents/collections/geometries';

Available fields inside `data` can be found in the file [kinto/schema.yml](kinto/schema.yml)

## Metadata

Some columns in the `accidents_raw` collection contain numbers referencing values in metadata collections.

| Column in `accidents_raw` | Collection            |
|---------------------------|-----------------------|
| `accident_category`       | `accident_category`   |
| `cause_1_4`               | `accident_cause`      |
| `cause_2`                 | `accident_cause`      |
| `cause_3`                 | `accident_cause`      |
| `cause_other`             | `accident_cause`      |
| `cause_02`                | `accident_cause`      |
| `participants_01`         | `traffic_involvement` |
| `participants_02`         | `traffic_involvement` |

Collection `accident_type` is NOT related to the `accident_type` column in the `accidents_raw` collection.

## CSV files

[Container images](#data-container-images) mentioned above can be used to create csv files of the data.

You can either download the csv from [this release](https://github.com/codeformuenster/verkehrsunfaelle/releases/tag/data-2019-11-03) or create the file `export.csv` containing the imported raw accidents:

    cat csv-export.sql | docker-compose exec -T postgres psql -qt postgres://postgres@/accidents > export.csv

You'll find instructions on how to export csv directory [csv](csv).
