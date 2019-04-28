import re
from config import kinto_url, kinto_admin, kinto_password
from utils import accident_is_valid

from kinto_http import Client

client = Client(server_url=kinto_url,
                auth=(kinto_admin, kinto_password),
                retry=10)

required_colums = [
    'place', 'day_of_week', 'date', 'time_of_day'
]

raw_accident_schema = client.get_collection(bucket='accidents', id='accidents_raw')[
    'data']['schema']['properties']

for key, value in raw_accident_schema.items():
    if value.get('pattern') is not None:
        value['pattern'] = re.compile(value['pattern'])


def create_accident_raw(accident):
    if accident_is_valid(accident) == False:
        print(
            f'Row {accident["row_number"]} in file {accident["source_file"]} seems to be invalid')
        return
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
