#!/bin/bash

set -e

echo "creating admin account"
curl -XPUT \
   --fail \
  -H 'content-type: application/json' \
  -d "{\"data\": {\"password\": \"${KINTO_ADMIN_PASSWORD}\"}}" \
  "${KINTO_URL}/accounts/admin"

echo
echo "importing schema"
kinto-wizard load \
  --server "${KINTO_URL}" \
  --auth "admin:${KINTO_ADMIN_PASSWORD}" \
  kinto/schema.yml

echo "done"
