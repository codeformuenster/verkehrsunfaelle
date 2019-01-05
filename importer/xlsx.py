from kinto_utils import create_accident_raw

from openpyxl import load_workbook


def import_xlsx(file_path, file_meta):
    wb = load_workbook(filename=file_path, read_only=True)
    ws = wb[file_meta['sheet_name']]

    print(
        f"Dimensions for sheet {file_meta['sheet_name']} is {ws.calculate_dimension()}")

    for row in ws.iter_rows(min_row=file_meta['first_data_row']):
        row_number = row[0].row
        raw_accident = {
            column_name: str(ws.cell(row=row_number,
                                     column=column_number).value)
            for (column_name, column_number)
            in file_meta['columns_mapping'].items()
            if column_number
        }

        raw_accident['source_row_number'] = row_number

        for key in ['source_file', 'import_timestamp', 'source_file_hash']:
            raw_accident[key] = file_meta[key]

        create_accident_raw(raw_accident)
