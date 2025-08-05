# utils/file_utils.py
import json

def read_json_file(path: str):
    with open(path, 'r') as f:
        return json.load(f)

def save_json_file(data, path: str):
    with open(path, 'w') as f:
        json.dump(data, f, indent=4)
