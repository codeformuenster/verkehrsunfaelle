from kinto_utils import create_accident_raw

from pyxlsb import open_workbook, convert_date
from datetime import datetime


def extract_value(row, column_number, column_name):
    value = row[column_number].v
    if column_name == 'date' or column_name == 'time_of_day':
        value = convert_date(value)

    if column_name == 'time_of_day':
        value = value.time()

    if type(value) is float and value == int(value):
        value = int(value)

    return str(value)


def import_xlsb(file_path, file_meta):
    with open_workbook(file_path) as wb:
        with wb.get_sheet(file_meta['sheet_name']) as sheet:
            for row in sheet.rows():
                row_number = row[0].r + 1
                if row_number < file_meta['first_data_row']:
                    continue
                raw_accident = {
                    column_name: extract_value(
                        row, column_number - 1, column_name)
                    for (column_name, column_number)
                    in file_meta['columns_mapping'].items()
                    if column_number
                }

                raw_accident['source_row_number'] = row_number

                for key in ['source_file', 'import_timestamp', 'source_file_hash']:
                    raw_accident[key] = file_meta[key]

                create_accident_raw(raw_accident)

                # for cell in row:
                #     print(cell)
                #     break
                # break
