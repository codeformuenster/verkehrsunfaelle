#!/bin/bash

# unofficial strict mode
set -uo pipefail
IFS=$'\n\t'

SLEEPSECONDS=5
echo "waiting $SLEEPSECONDS seconds for postgres.."

# sleep while postgres is initializing
sleep $SLEEPSECONDS
pg_isready -q -h ${PG_PORT_5432_TCP_ADDR} -p ${PG_PORT_5432_TCP_PORT} -U ${PG_ENV_POSTGRES_USER}
ISREADY=$?
while [[ "$ISREADY" != 0 ]]; do
  pg_isready -q -h ${PG_PORT_5432_TCP_ADDR} -p ${PG_PORT_5432_TCP_PORT} -U ${PG_ENV_POSTGRES_USER}
  let ISREADY=$?
  echo "waiting $SLEEPSECONDS seconds for postgres.."
  sleep $SLEEPSECONDS
done

echo "postgres is now avaliable, starting postgrest"

eval exec postgrest postgres://${PG_ENV_POSTGRES_USER}:${PG_ENV_POSTGRES_PASSWORD}@${PG_PORT_5432_TCP_ADDR}:${PG_PORT_5432_TCP_PORT}/${PG_ENV_POSTGRES_DB} \
              --port 3000 \
              --schema ${POSTGREST_SCHEMA} \
              --anonymous ${POSTGREST_ANONYMOUS} \
              --pool ${POSTGREST_POOL} \
              --jwt-secret ${POSTGREST_JWT_SECRET} \
              --max-rows ${POSTGREST_MAX_ROWS}
