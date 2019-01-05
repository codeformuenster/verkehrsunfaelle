from config import files
from utils import hash_file
from xlsx import import_xlsx
from xlsb import import_xlsb

from os import path
from sys import argv, exit
from datetime import datetime, timezone
from multiprocessing import Process

import_timestamp = datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()


def execute(file_path):
    try:
        file_meta = files[file_path]
    except KeyError:
        print(f"Unknown file {file_path}")
        exit(1)

    print(f'importing {file_path}')

    _, file_extension = path.splitext(file_path)

    file_meta['source_file'] = path.basename(file_path)
    file_meta['import_timestamp'] = import_timestamp
    file_meta['source_file_hash'] = hash_file(file_path)

    if file_extension == ".xlsx":
        import_xlsx(file_path, file_meta)
    elif file_extension == ".xlsb":
        import_xlsb(file_path, file_meta)
    else:
        print(f'Unknown file extension {file_extension}')
        exit(1)

    print(f"done importing {file_path}")


if __name__ == '__main__':
    try:
        _, file_path = argv
    except KeyError:
        for file_path in files:
            Process(target=execute, args=(file_path,)).start()

    execute(file_path)

# def import_xlsb(file_path, file_meta):
#    with open_workbook(file_path) as wb:
#        with wb.get_sheet(file_meta['sheet_name']) as sheet:
#            for row in sheet.rows():
#
#                # for file_path, file_meta in files.items():
#    print(f"importing {file_path}")
#
#    file_meta['hash'] = hash_file(file_path)
#
#    print(f"File has hash {file_meta['hash']}")
#
#    _, file_extension = path.splitext(file_path)
#
#    if file_extension == ".xlsx":
#        # import_xlsx(file_path, file_meta)
#        print('skip')
#    elif file_extension == ".xlsb":
#        import_xlsb(file_path, file_meta)
#    else:
#        raise BaseException(f'Unknown file extension {file_extension}')
#
#    print(f"done importing {file_path}")
#    print('-----')
