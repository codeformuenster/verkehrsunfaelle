# Verkehrsunfaelle data container image

This directory documents the creation of the data container images currently
hosted at [quay.io/codeformuenster/verkehrsunfaelle].

## Preparations

### Method a): Start from scratch

Follow the instructions for importing and geocoding outlined in the
[readme](../README.md) in the root of this repository. This will take some
time.

### Method b): Use a previous data container image as base

Replace the `image` in the `docker-compose.yml` file with an image from
[quay.io/codeformuenster/verkehrsunfaelle] and start it. Make sure the data
volume of the postgres container is empty, otherwise nothing will be imported.

Then make your changes or import something new.

## Building the container image

Execute the `build.sh` file in this directory.

[quay.io/codeformuenster/verkehrsunfaelle]: https://quay.io/repository/codeformuenster/verkehrsunfaelle
