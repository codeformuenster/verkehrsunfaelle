import xlrd
import re
from datetime import datetime

from kinto_utils import create_accident_raw, raw_accident_schema


def extract_value(cell, column_name, datemode):
    # 0 == empty
    # 1 == string
    # 2 == float
    # 3 == date
    schema = raw_accident_schema[column_name]
    if cell.ctype == 0 and schema['type'] == 'integer':
        return 0
    if cell.ctype == 0 and schema['type'] == 'string':
        return ''

    value = cell.value

    if column_name == 'date':
        try:  # try the excel date first
            d = xlrd.xldate.xldate_as_datetime(value, datemode)
            value = str(d)[0:10]
        except:
            # remove leading and trailing spaces
            value = value.strip()

            # parse the string
            value = str(datetime.strptime(value, '%d.%m.%Y'))[0:10]

    if column_name == 'time_of_day':
        try:  # try the excel date first
            d = xlrd.xldate.xldate_as_datetime(value, datemode)
            value = str(d)[11:]
        except:
            # remove leading and trailing spaces
            value = value.strip()

            # replace dots and double colons with single colon
            value = re.sub(r'::|\.', ':', value)
            # parse the string
            value = str(datetime.strptime(value, '%H:%M'))[11:]

    if schema.get('pattern') is not None:
        if schema['pattern'].match(value) is not None:
            return value
        else:
            print(
                f'Final fail for {value} (Column: {column_name}, Celltype: {cell.ctype})')
            raise Exception

    if schema['type'] == 'integer':
        if cell.ctype == 1:  # cell is string
            value = re.sub(r'\D', '', value)
        # VU PP 2018.xlsx row 8144 column lorry
        if column_name == 'lorry' and value == 'ms':
            value = 1

        if value != '':
            return int(value)
        return -1
    if schema['type'] == 'string':
        return str(value)

    return value


def import_xlsx(file_path, file_meta, position):
    book = xlrd.open_workbook(filename=file_path)
    sheet = book.sheet_by_name(file_meta['sheet_name'])

    for row_idx in range(file_meta['first_data_row'] - 1, sheet.nrows):
        row_number = row_idx + 1
        row = sheet.row(row_idx)

        raw_accident = {
            key: file_meta[key]
            for key in ['source_file', 'import_timestamp', 'source_file_hash']
        }
        raw_accident['source_row_number'] = row_number

        for (column_name, column_number) in file_meta['columns_mapping'].items():
            if column_number is None:
                continue
            try:
                raw_accident[column_name] = extract_value(
                    row[column_number - 1], column_name, book.datemode)
            except:
                print(
                    f'{file_meta["source_file"]}:{row_number}:{column_name} {cell.value} {cell.ctype} failed to import')
        try:
            create_accident_raw(raw_accident)
        except:
            print(f'{file_meta["source_file"]}:{row_number} failed to import')
