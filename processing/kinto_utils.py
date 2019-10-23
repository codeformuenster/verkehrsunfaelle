import re
from config import kinto_url, kinto_admin, kinto_password
from utils import accident_is_valid
from uuid import uuid5, NAMESPACE_URL

from kinto_http import Client

client = Client(server_url=kinto_url,
                auth=(kinto_admin, kinto_password),
                retry=10)

raw_accident_schema = client.get_collection(
    bucket='accidents', id='accidents_raw')

# use only the first type of the schema, we're having some fields with for
# example type: ["string", null] in there
raw_accident_schema = {
    key: {
        **value,
        **{'type': value['type'][0] if value['type'][0] else value['type']}}
    for (key, value) in (
        raw_accident_schema['data']['schema']['properties'].items())
}

for key, value in raw_accident_schema.items():
    if value.get('pattern') is not None:
        value['pattern'] = re.compile(value['pattern'])


def make_safe_value(s: str) -> str:
    """
    Replace all non-alphanumeric characters in a string with underscores.
    """
    def safe_char(c):
        if c.isalnum():
            return c
        else:
            return "_"
    return "".join(safe_char(c) for c in str(s))


def create_id(accident: dict) -> str:
    """
    Given an accident dict return a unique, deterministic identifier based on the
    accidents source file and source row number.

    The id will be shaped something like 'abcd1234-ab12-ab12-ab12-abcdef123456' with
    random characters and numbers.

    Arguments:
        accident {dict} -- a dictionary with the keys 'source_file' and 'source_row_number'

    Returns:
        str -- a unique, deterministic identifier
    """
    return str(uuid5(NAMESPACE_URL, make_safe_value(
        f"{accident['source_file']}{accident['source_row_number']}"))
    )


def create_accident_raw(accident: dict):
    """
    Given an accident dictionary, check if the dictionary is valid (:= all required columns are present).
    If the accident is invalid, print a warning and return, else add a unique, distinct ID to it and
    create the recored in the database.

    Arguments:
        accident {dict} -- An accident dictionary. Will fail if it does not contain all required columns/keys.
    """
    if accident_is_valid(accident) == False:
        print(
            f'Row {accident["row_number"]} in file {accident["source_file"]} seems to be invalid')
        return
    try:
        accident['id'] = create_id(accident)
        create_record(data=accident, collection='accidents_raw')
    except TypeError:
        print(f'ERROR creating accident {accident}')


def create_geometry(geometry: dict):
    """
    A wrapper around the kinto client's 'create_geometry', pushing to the 'geometries' collection.

    Arguments:
        geometry {dict} -- the data to push
    """
    create_record(data=geometry, collection='geometries')


def create_record(data: dict, collection: str, bucket: str = 'accidents'):
    """
    A wrapper around the kinto client's 'create_record', adding the read permissions
    to everyone.
    """
    if 'id' in data:
        client.update_record(id=data['id'],
                             data=data,
                             collection=collection,
                             bucket=bucket,
                             permissions={
                                 'read': ['system.Authenticated', 'system.Everyone']
        })
    else:
        client.create_record(data=data,
                             collection=collection,
                             bucket=bucket,
                             permissions={
                                 'read': ['system.Authenticated', 'system.Everyone']
                             })
