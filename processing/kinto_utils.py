from config import kinto_url, kinto_admin, kinto_password

from kinto_http import Client

client = Client(server_url=kinto_url,
                auth=(kinto_admin, kinto_password),
                retry=10)

required_colums = [
    'place', 'day_of_week', 'date', 'time_of_day'
]


def get_schema(collection_id):
    collection = client.get_collection(bucket='accidents', id=collection_id)
    return collection['data']['schema']['properties']


def create_accident_raw(accident):
    try:
        client.create_record(data=accident,
                             collection='accidents_raw',
                             bucket='accidents',
                             permissions={
                                 'read': ['system.Authenticated', 'system.Everyone']
                             })
    except TypeError:
        print(f'ERROR creating accident {accident}')


def create_geometry(geometry):
    client.create_record(data=geometry,
                         collection='geometries',
                         bucket='accidents',
                         permissions={
                             'read': ['system.Authenticated', 'system.Everyone']
                         })
