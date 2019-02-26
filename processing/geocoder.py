from kinto_utils import client
from geopy.geocoders import Photon

geocoder = Photon()

records = client.get_records(
    bucket='accidents', collection='accidents_raw', _limit=10)

for record in records:
    place_str = f"{record['place']} {record['place_near']} Münster"
    location = geocoder.geocode(place_str, location_bias=(51.96, 7.62))
    print(location)
