from kinto_utils import client, create_geometry
from datetime import datetime, timezone
from multiprocessing import Process, Queue
from tqdm import tqdm

import nominatim_geocoder
import overpass_geocoder

import_timestamp = datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()


def handle_location(queue):
    while True:
        record = queue.get()
        if record == 'no-records-left':
            break

        try:
            nominatim_geometries = nominatim_geocoder.geocode(
                record['place'], record['place_near'])
            if nominatim_geometries:
                for geometry in nominatim_geometries:
                    geometry['accident_id'] = record['id']
                    geometry['geocoded_timestamp'] = import_timestamp
                    create_geometry(geometry)
        except Exception as e:
            print('Nominatim exception')
            print(e)
            print('End Nominatim exception')
        try:
            overpass_geometries = overpass_geocoder.geocode(
                record['place'], record['place_near'])
            if overpass_geometries:
                for geometry in overpass_geometries:
                    geometry['accident_id'] = record['id']
                    geometry['geocoded_timestamp'] = import_timestamp
                    create_geometry(geometry)
        except Exception as e:
            print('Overpass exception')
            print(e)
            print('End Overpass exception')


if __name__ == '__main__':
    pqueue = Queue(5)

    records = client.get_records(
        bucket='accidents', collection='accidents_raw', not_place='None')

    reader_p = Process(target=handle_location, args=((pqueue),))
    reader_p.daemon = True
    reader_p.start()

    for record in tqdm(records,
                       desc='Geocoding...',
                       unit='location',
                       dynamic_ncols=True):
        pqueue.put(record)

    pqueue.put('no-records-left')
    reader_p.join()

    print('done')
