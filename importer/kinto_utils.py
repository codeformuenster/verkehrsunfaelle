from config import kinto_url, kinto_admin, kinto_password

from kinto_http import Client

client = Client(server_url=kinto_url,
                auth=(kinto_admin, kinto_password),
                retry=10)


def create_accident_raw(accident):
    # check for empty row, checking the first 5 columns for
    # emptyness should be enough
    if all([accident[k] for k in ['place', 'place_near',
                                  'day_of_week', 'date',
                                  'time_of_day']]):
        client.create_record(data=accident,
                             collection='accidents_raw',
                             bucket='accidents',
                             permissions={
                                 'read': ['system.Authenticated', 'system.Everyone']
                             })
