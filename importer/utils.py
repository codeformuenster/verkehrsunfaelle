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
