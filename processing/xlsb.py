from kinto_utils import create_accident_raw, raw_accident_schema

from pyxlsb import open_workbook, convert_date
from datetime import datetime

from re import match, sub
from math import isnan


def extract_value(row, column_number, column_name):
    schema = raw_accident_schema[column_name]
    value = row[column_number].v

    if value is None:
        return None

    if column_name == 'date':
        value = convert_date(value)
        value = str(value)[0:10]

    if column_name == 'time_of_day':
        value = convert_date(value)
        try:
            value = value.time()
        except AttributeError:
            # VU PP 2015.xlsb contains the following errors in the time_of_day
            # column:
            #   row     value
            #   8056    13.15
            #   9687    14.45
            #   9749    14.30
            #   9764    15.15
            #   9776    15.20
            #   9927    14.45
            #   10068   20.30
            #
            # Note the pattern of all faulty values having a dot instead of a
            # colon. We simply replace the dot (.) with a colon (:) and create
            # a datetime from the original string with the replaced dot.
            value = row[column_number].v
            if value and match(r'\d{2}\.\d{2}', value):
                value = datetime.strptime(
                    value.replace('.', ':'), '%H:%M').time()
            else:
                return None
        value = str(value)

    if schema.get('pattern') is not None:
        if schema['pattern'].match(value) is not None:
            return value
        else:
            raise Exception

    if schema['type'] == 'integer':
        if type(value) is float and value == int(value):
            value = int(value)
        else:
            value = str(value)
            value = sub(r'\D', '', value)

            if value != '':
                value = int(value)
            else:
                value = None

    if schema['type'] == 'string':
        # if the cell is a float, prevent saving 166.0 instead of 166
        if type(value) is float and value == int(value):
            value = int(value)
        value = str(value)

    if value == '' or (type(value) is int and isnan(value)):
        value = None

    return value


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

                try:
                    create_accident_raw(raw_accident)
                except:
                    print(
                        f'{file_meta["source_file"]}:{row_number} failed to import')
