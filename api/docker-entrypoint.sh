#!/bin/bash

# unofficial strict mode
set -euo pipefail
IFS=$'\n\t'

SLEEPSECONDS=5

set +e
pg_isready -q -h ${PG_PORT_5432_TCP_ADDR} -p ${PG_PORT_5432_TCP_PORT} -U ${PG_ENV_POSTGRES_USER}
ISREADY=$?
set -e

# sleep while postgres is initializing
while [[ "$ISREADY" != 0 ]]; do
  echo "waiting $SLEEPSECONDS seconds for postgres.."
  sleep $SLEEPSECONDS
  set +e
  pg_isready -q -h ${PG_PORT_5432_TCP_ADDR} -p ${PG_PORT_5432_TCP_PORT} -U ${PG_ENV_POSTGRES_USER}
  let ISREADY=$?
  set -e
done

echo "postgres is now avaliable, starting postgrest"

eval exec postgrest postgres://${PG_ENV_POSTGRES_USER}:${PG_ENV_POSTGRES_PASSWORD}@${PG_PORT_5432_TCP_ADDR}:${PG_PORT_5432_TCP_PORT}/${PG_ENV_POSTGRES_DB} \
              --port 3000 \
              --schema ${POSTGREST_SCHEMA} \
              --anonymous ${POSTGREST_ANONYMOUS} \
              --pool ${POSTGREST_POOL} \
              --jwt-secret ${POSTGREST_JWT_SECRET} \
              --max-rows ${POSTGREST_MAX_ROWS}
