from config import kinto_url, kinto_admin, kinto_password

from kinto_http import Client

client = Client(server_url=kinto_url,
                auth=(kinto_admin, kinto_password),
                retry=10)

required_colums = [
    'place', 'place_near', 'day_of_week', 'date', 'time_of_day'
]


def create_accident_raw(accident):
    # check for empty row, checking the first 5 columns for
    # emptyness should be enough
    required_colums_values = [
        accident[k] for k in required_colums
        if accident[k] is not None and accident[k] != 'None'
    ]

    if len(required_colums) == len(required_colums_values):
        client.create_record(data=accident,
                             collection='accidents_raw',
                             bucket='accidents',
                             permissions={
                                 'read': ['system.Authenticated', 'system.Everyone']
                             })


def create_geometry(geometry):
    client.create_record(data=geometry,
                         collection='geometries',
                         bucket='accidents',
                         permissions={
                             'read': ['system.Authenticated', 'system.Everyone']
                         })
