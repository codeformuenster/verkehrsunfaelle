from kinto_utils import create_accident_raw

from pyxlsb import open_workbook, convert_date
from tqdm import tqdm
from datetime import datetime


def extract_value(row, column_number, column_name):
    value = row[column_number].v
    if column_name == 'date' or column_name == 'time_of_day':
        value = convert_date(value)

    if column_name == 'time_of_day':
        try:
            value = value.time()
        except AttributeError:
            # VU PP 2015.xlsb contains in row 8057 in the time_of_day column
            # the value "'13.15". We grab the value again from the row[column_number].v
            # and check for string "'13.15", and create a datetime
            if row[column_number].v == "13.15":
                value = datetime.strptime('13:15', '%H:%M').time()
            else:
                raise

    if type(value) is float and value == int(value):
        value = int(value)

    return str(value)


def import_xlsb(file_path, file_meta, position):
    with open_workbook(file_path) as wb:
        with wb.get_sheet(file_meta['sheet_name']) as sheet:
            for row in tqdm(sheet.rows(),
                            desc=file_meta['source_file'],
                            position=position,
                            unit='row',
                            dynamic_ncols=True):
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