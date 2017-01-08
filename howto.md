# geocoding howto:

make sure you have yarn or npm install -ed locations/geocode_js

- start database and geocoders `docker-compose up -d postgis overpass nominatim`
- start some more instances of the geocoders `docker-compose scale overpass=5`
- let it warm up ;) (wait like 5 minutes depending on your computer)
- start the geocoder load balancer `docker-compose up -d proxy`
- start the geocoding `docker-compose run --rm runner`

