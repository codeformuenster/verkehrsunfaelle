#!/bin/bash

set -euo pipefail
IFS=$'\n\t'


command=${1:-}
if [[ -z "$command" ]]; then
    echo "usage: $0 COMMAND (down|init|reinit|import|geocode)"
    exit 1
fi

_down () {
  docker-compose down -v -t 0
  sudo rm -rf postgres_data
}

_init () {
  docker-compose up initializer
  docker-compose rm -f initializer
}

_import () {
  docker-compose run --rm importer
}

_geocode () {
  docker-compose run --rm geocoder
}


case "$command" in
  down)
    _down
      ;;
  init)
    _init
      ;;
  reinit)
    _down
    _init
      ;;
  import)
    _import
      ;;
  geocode)
    _geocode
      ;;
esac

