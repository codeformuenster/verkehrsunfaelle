from hashlib import sha1

BUF_SIZE = 65536  # specify 64kb chunks for file hashing input streaming


def hash_file(file_path):
    file_hash = sha1()

    with open(file_path, 'rb') as f:
        while True:
            data = f.read(BUF_SIZE)
            if not data:
                break
            file_hash.update(data)

    return file_hash.hexdigest()


required_colums = ['place', 'date']


def accident_is_valid(accident):
    # check for empty row, checking the first 5 columns for
    # emptyness should be enough
    try:
        required_colums_values = [
            accident[k] for k in required_colums
            if accident[k] is not None and accident[k] != 'None'
        ]

        return len(required_colums) == len(required_colums_values)
    except KeyError:
        return False
