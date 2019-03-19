# Verkehrsunfälle in Münster

Daten und Tools für die Verarbeitung von Verkehrsunfalldaten der Polizei Münster.

- [Quickstart](#quickstart) importing raw data
- [Geocoding](#geocoding) try to guess the location of the accident

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

Initialize Nominatim (4 is the number of you CPU cores) This will take a long time!

    docker-compose run --rm nominatim-import sh /app/init.sh /data/muenster-regbez-latest.osm.pbf postgresdata 4
    docker-compose run --rm overpass-import

Initialize Overpass

    docker-compose run --rm overpass

Start Nominatim & Overpass

    docker-compose up -d nominatim overpass

Execute the geocoder

    docker-compose run --rm geocoder
