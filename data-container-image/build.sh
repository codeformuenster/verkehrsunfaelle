#!/bin/bash

set -e

IMAGE_TAG="quay.io/codeformuenster/verkehrsunfaelle:$(date -I)"

echo -n "Step 1: Extracting database dump ... "

sudo docker-compose exec postgres pg_dump postgres://postgres@/accidents --encoding=utf8 --format=plain --no-owner --no-acl --no-privileges | gzip -9 > dump.sql.gz

echo "done"

echo "Step 2: Building data container with tag '${IMAGE_TAG}' ... "

sudo docker build --pull -t "${IMAGE_TAG}" .

echo "done"

echo

echo "If you want to publish this image, execute"
echo
echo "sudo docker push ${IMAGE_TAG}"
