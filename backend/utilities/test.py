import json
from pprint import pprint

valid_teams = ["Hawks","Celtics","Nets","Hornets","Bulls","Cavaliers","Mavericks","Nuggets","Pistons","Warriors","Rockets","Pacers","Clippers","Lakers","Grizzlies","Heat","Bucks","Timberwolves","Pelicans","Knicks","Thunder","Magic","76ers","Suns","Blazers","Kings","Spurs","Raptors","Jazz","Wizards"]
valid_abbreviations = []
valid_teams = [s.strip().lower() for s in valid_teams]
nameMap = {}
data = {}
unique_games = set()
exclusion_list = ["Pistons GT","NetsGC","Long Island Nets","Santa Cruz Warriors","Lakeland Magic","Westchester Knicks","Raptors 905","Stockton Kings","Windy City Bulls","Erie BayHawks","South Bay Lakers","Austin Spurs","Agua Caliente Clippers","Northern Arizona Suns","Sydney Kings","New Orleans Hornets"]
exclusion_list = [s.strip().lower() for s in exclusion_list]

with open('leaguegamefinder.json') as f:
    d = json.load(f)
    #print(d.keys())
    #print(d["resultSets"][0].keys())
    #print(d["resultSets"][0]["headers"])  
    for rowSet in d["resultSets"][0]["rowSet"]:
        teamName = rowSet[3].strip().lower()
        
        teamAbbreviation = rowSet[2]
        if teamAbbreviation not in nameMap:
            nameMap[teamAbbreviation] = teamName

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

                a = matchup.split(" @ ")
        
total = 0
for key in data.keys():
    if "2019-04" in key:
        for s in data[key]:
            if "boston celtics" in s:
                print(key,data[key][s])
        total += len(data[key])
        
#for name in nameMap.keys():
#    print(name,nameMap[name])

