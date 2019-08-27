#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

AUTHORIZATION=$(echo -n "admin:${KINTO_ADMIN_PASSWORD}" | base64)

curl \
  --silent -o /dev/null \
  --fail \
  -H "Authorization: Basic ${AUTHORIZATION}" \
  "${KINTO_URL}/accounts/admin" || (echo "creating admin account";
curl -XPUT \
  --fail \
  --silent \
  -H 'content-type: application/json' \
  -d "{\"data\": {\"password\": \"${KINTO_ADMIN_PASSWORD}\"}}" \
  "${KINTO_URL}/accounts/admin"; echo)

echo "importing schema"
kinto-wizard load \
  --server "${KINTO_URL}" \
  --auth "admin:${KINTO_ADMIN_PASSWORD}" \
  kinto/schema.yml

echo "done"
