import json
from pprint import pprint

with open('leaguegamefinder.json') as f:
    d = json.load(f)
    print(d.keys())
    print(d["resultSets"][0].keys())
    print(d["resultSets"][0]["headers"])  
    for rowSet in d["resultSets"][0]["rowSet"]:
        print(rowSet[3],rowSet[4], rowSet[5], rowSet[6])