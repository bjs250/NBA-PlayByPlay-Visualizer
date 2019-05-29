import json
from pprint import pprint
import time
from pathlib import Path
import subprocess
import sys

old_stdout = sys.stdout
log_file = open("message.log","w")
sys.stdout = log_file

valid_teams = ["Hawks","Celtics","Nets","Hornets","Bulls","Cavaliers","Mavericks","Nuggets","Pistons","Warriors","Rockets","Pacers","Clippers","Lakers","Grizzlies","Heat","Bucks","Timberwolves","Pelicans","Knicks","Thunder","Magic","76ers","Suns","Blazers","Kings","Spurs","Raptors","Jazz","Wizards"]
valid_abbreviations = []
valid_teams = [s.strip().lower() for s in valid_teams]
nameMap = {}
abbreviationMap = {}
data = {}
exclusion_list = ["Pistons GT","NetsGC","Long Island Nets","Santa Cruz Warriors","Lakeland Magic","Westchester Knicks","Raptors 905","Stockton Kings","Windy City Bulls","Erie BayHawks","South Bay Lakers","Austin Spurs","Agua Caliente Clippers","Northern Arizona Suns","Sydney Kings","New Orleans Hornets"]
exclusion_list = [s.strip().lower() for s in exclusion_list]

with open('leaguegamefinder.json') as f:
    d = json.load(f)
    for rowSet in d["resultSets"][0]["rowSet"]:
        teamName = rowSet[3].strip().lower()
        
        teamAbbreviation = rowSet[2]
        if teamAbbreviation not in nameMap:
            nameMap[teamAbbreviation] = teamName
        if teamName not in abbreviationMap:
            abbreviationMap[teamName] = teamAbbreviation

    for rowSet in d["resultSets"][0]["rowSet"]:
        teamName = rowSet[3].strip().lower()
        
        for team in valid_teams:
            if team in teamName and "gaming" not in teamName and " gc" not in teamName and " gt" not in teamName and teamName not in exclusion_list:
                
                date = rowSet[5]
                matchup = rowSet[6]
                gameID = rowSet[4]
                teamAbbreviation = rowSet[2]
                
                a = matchup.split(" @ ")
                if len(a) == 1:
                    a = a[0].split(" vs. ")
                b = frozenset({nameMap[a[0]],nameMap[a[1]]})
                
                
                if date not in data:
                    data[date] = {}
                data[date][b] = gameID
        
total = 0

# modify as needed

for key in data.keys():
    if "2019-" in key:
        for s in data[key]:
            game_id = data[key][s]
            config = Path("..//BoxScoreData//" + game_id + ".pkl")
            if config.is_file():                
                #print(key, game_id, abbreviationMap[list(s)[0]], abbreviationMap[list(s)[1]], "already found")
                print(key, game_id, abbreviationMap[list(s)[0]], abbreviationMap[list(s)[1]])
                continue
            else:
                game_id = data[key][s]
                print(key, game_id, abbreviationMap[list(s)[0]], abbreviationMap[list(s)[1]])
                #print("\tGetting BoxScore data")
                cmd = ['python', 'getBoxScoreData.py', game_id]
                subprocess.Popen(cmd).wait()

                #print("\tGetting PlayByPlay data")
                cmd = ['python', 'getPlayByPlayData.py', game_id]
                subprocess.Popen(cmd).wait()

                #print("\tCleaning data")
                cmd = ['python', 'cleanData.py', game_id]
                subprocess.Popen(cmd).wait()
                #print("\tDone")


sys.stdout = log_file
log_file.close()

