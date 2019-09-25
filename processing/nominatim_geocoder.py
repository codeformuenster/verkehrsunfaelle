from geopy import Point
from geopy.geocoders import Nominatim

geocoder = Nominatim(format_string="%s Münster", view_box=[
                     Point(51.8375, 7.471), Point(52.061, 7.775)],
                     bounded=True, domain="nominatim:8080", scheme="http",
                     user_agent="crashes-geocoder")


def geocode(place, place_near):
    """
    Given a place and place_near string, poll the Nominatim Geocoder and
    return all returned elements as a list of dictionaries.

    The dictionaries have the following form:

    {
        'used_geocoder': 'nominatim',
        'used_query': <the query that was used>,
        'lat': <latitude>,
        'lon': <longitude>,
    }
    """

    place_str = ""

    if place != 'None':
        place_str = f"{place}"
    if place_near != 'None':
        place_str = f"{place_str} {place_near}"

    location = geocoder.geocode(place_str)
    if location:
        return [{
            'used_geocoder': 'nominatim',
            'used_query': geocoder.format_string % place_str,
            'lat': location.latitude,
            'lon': location.longitude,
        }]
