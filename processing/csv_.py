import csv
from os import PathLike

from kinto_utils import create_record


def import_csv(file_path: PathLike, file_meta: dict):
    """
    Given a csv file and dictionary of meta info, map the values of each row to keys according
    to a columns mapping contained in the meta info, convert the row keys into integers and 
    create a database record for each row.

    Failed rows will produce an error message, but not interupt.
    
    Arguments:
        file_path {PathLike} -- a path to a csv file (delimiter: ',', quotechar: '"')
        file_meta {dict} -- a dictionary containing the keys 'columns_mapping', 'collection', 'source_file'
    """
    with open(file_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',', quotechar='"', )
        for row in reader:
            try:
                data_dict: dict = {
                    key: row[file_meta['columns_mapping'][key]]
                    for key in file_meta['columns_mapping']
                }
                data_dict['key'] = int(data_dict['key'])

                # 'id' is the field that is used to uniquely identify the rows so that they are inserted twice
                # this must be a string
                data_dict['id'] = str(data_dict['key'])

                create_record(data_dict, collection=file_meta['collection'])
            except Exception as e:
                print(
                    f'{file_meta["source_file"]} failed to import: ' + str(e))
