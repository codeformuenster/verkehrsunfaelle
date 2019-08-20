import re
from config import kinto_url, kinto_admin, kinto_password
from utils import accident_is_valid
from uuid import uuid5, NAMESPACE_URL

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


def make_safe_value(s):
    def safe_char(c):
        if c.isalnum():
            return c
        else:
            return "_"
    return "".join(safe_char(c) for c in str(s))


def create_id(accident):
    return str(uuid5(NAMESPACE_URL, make_safe_value(
        f"{accident['source_file']}{accident['source_row_number']}"))
    )


def create_accident_raw(accident):
    if accident_is_valid(accident) == False:
        print(
            f'Row {accident["row_number"]} in file {accident["source_file"]} seems to be invalid')
        return
    try:
        accident['id'] = create_id(accident)
        create_record(data=accident, collection='accidents_raw')
    except TypeError:
        print(f'ERROR creating accident {accident}')


def create_geometry(geometry):
    create_record(data=geometry, collection='geometries')


def create_record(data, collection, bucket='accidents'):
    client.create_record(data=data,
                         collection=collection,
                         bucket=bucket,
                         permissions={
                             'read': ['system.Authenticated', 'system.Everyone']
                         })
