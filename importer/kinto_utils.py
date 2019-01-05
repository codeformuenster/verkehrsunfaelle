from config import kinto_url, kinto_admin, kinto_password

from kinto_http import Client

client = Client(server_url=kinto_url,
                auth=(kinto_admin, kinto_password),
                retry=10)


def create_accident_raw(accident):
    client.create_record(data=accident,
                         collection='accidents_raw',
                         bucket='accidents',
                         permissions={
                             'read': ['system.Authenticated', 'system.Everyone']
                         })
