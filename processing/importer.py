from config import files, data_directory
from utils import hash_file
from xlsx import import_xlsx
from xlsb import import_xlsb
from csv_ import import_csv

from os import path
from sys import argv, exit
from datetime import datetime, timezone
from multiprocessing import Process

import_timestamp = datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()


def execute(file_name: str):
    """
    Given a file name, look up the meta data from the config (where each file
    name is a key), and depending on the file extension call the appropriate
    handler.
    Each handler will ultimately attempt to create a record, either a raw
    accident (from Excel files) or one of the meta information collections
    (from csv files).
    """
    try:
        file_meta = files[file_name]
    except KeyError:
        print(f"Unknown file {file_name}")
        exit(1)

    file_path = path.normpath(f'{data_directory}/{file_name}')

    _, file_extension = path.splitext(file_path)

    file_meta['source_file'] = file_name
    file_meta['import_timestamp'] = import_timestamp
    file_meta['source_file_hash'] = hash_file(file_path)

    if file_extension == '.xlsx':
        import_xlsx(file_path, file_meta)
    elif file_extension == '.xlsb':
        import_xlsb(file_path, file_meta)
    elif file_extension == '.csv':
        import_csv(file_path, file_meta)
    else:
        print(f'Unknown file extension {file_extension}')
        exit(1)


if __name__ == '__main__':
    try:
        _, file_name = argv
        execute(file_name)
        exit(0)
    except ValueError:
        pass

    for idx, file_name in enumerate(files):
        Process(target=execute, args=(file_name,)).start()
