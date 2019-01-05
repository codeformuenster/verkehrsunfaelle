# Verkehrsunfälle in Münster

Daten und Tools für die Verarbeitung von Verkehrsunfalldaten der Polizei Münster.

- [Quickstart](#quickstart)

## Quickstart

Start Kinto (Datastore)

    docker-compose up -d kinto

Initialize Kinto

    docker-compose run --rm initializer

Run the importer

    docker-compose run --rm importer

Or just import a single file

    docker-compose run --rm importer python importer/importer.py '/data/VU PP 2015.xlsb'
