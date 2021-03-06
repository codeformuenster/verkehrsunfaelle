import overpass
import re
from textwrap import dedent

api = overpass.API(endpoint='http://overpass/api/interpreter')
bbox = '51.8375,7.471,52.061,7.775'


def geocode(place: str, place_near: str) -> list:
    """
    Given a place and place_near string, poll the Overpass Geocoder and
    return all returned elements as a list of dictionaries.

    The dictionaries have the following form:

    {
        'used_geocoder': 'overpass',
        'used_query': <the query that was used>,
        'lat': <latitude>,
        'lon': <longitude>,
    }
    """
    place_near = re.sub(r'"|\?', ' ', place_near)
    place_near = " ".join(place_near.split())

    if place_near == '':
        return

    query = dedent(f'''[out:json][bbox:{bbox}];
    way[highway][~"^(name|ref|disused:name)$"~"{place}",i]->.w1;
    way[highway][~"^(name|ref|disused:name)$"~"{place_near}",i]->.w2;
    node(w.w1)(w.w2);
    out qt;''')

    response = api.get(query, build=False)

    if len(response['elements']) > 0:
        return [
            {
                'used_geocoder': 'overpass',
                'used_query': query,
                'lat': location['lat'],
                'lon': location['lon'],
            } for location in response['elements'] if location['lat']
        ][:1]
