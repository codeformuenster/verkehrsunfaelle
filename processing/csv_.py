import csv

from kinto_utils import create_accident_category

def import_csv(file_path, file_meta, position):
    """
    Read the given csv file

    Arguments:
        file_path {[type]} -- [description]
        file_meta {[type]} -- [description]
        position {[type]} -- [description]
    """
    with open(file_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',', quotechar='"', )
        for row in reader:
            try:
                data_dict: dict = {
                    key: row[file_meta['columns_mapping'][key]]
                    for key in file_meta['columns_mapping']
                }

                if file_meta['source_file'] == 'unfallkategorien.csv':
                    create_accident_category(data_dict)
                else:
                    print(f'{file_meta["source_file"]} cannot be handled')
            except Exception as e:
                print(f'{file_meta["source_file"]} failed to import: ' + str(e))