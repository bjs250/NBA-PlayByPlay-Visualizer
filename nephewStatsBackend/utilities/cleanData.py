from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import sys
import os
import time
import pickle
import re
import pprint
from copy import deepcopy

def trim(s):
	if s is not None:
		return s.lstrip().rstrip()
	else: 
		return s

def replace(s):
	if s is "":
		return None
	else:
		return s

def getHomePoints(s):
	return int(s.split(" - ")[0])

def getVisitPoints(s):
	return int(s.split(" - ")[1])

def convertTime(s):
	minutes = int(s.split(":")[0])
	seconds = s.split(":")[1]
	if "." in seconds:
		seconds = int(seconds.split(".")[0])
	else:
		seconds = int(seconds)
	return (12*60) - (minutes*60+seconds)

def inverseConvertTime(s):
	minutes = s / 60
	seconds = s % 60
	return str(minutes) + ":" + str(seconds)

def handlePlayer(player):
	if "Totals:" not in player:
		changedPlayer = player.split(" ")[0] + " " +  player.split(" ")[1]
	else:
		changedPlayer = player
	return changedPlayer

def handlePM(row,tag1,tag2):
	if "DNP" in row["FGM"]:
		return ""
	else:
		return int(row[tag1]) - int(row[tag2])

def handle2PMiss(row):
	if "DNP" in row["FGM"]:
		return ""
	else:
		if float(row["FG%"]) != 0:
			# Calculation thanks to Dan Kosteva
			return int( round(float(row["FGM"])/float(row["FG%"])*100 )) - int(row["FGM"]) + int(row["3PM"]) - int(row["3PA"])
		else:
			return 0

if __name__ == "__main__":

	# Check if there was an input argument or not
	game_id = ""
	if len(sys.argv) == 1:
		game_id = "0041800104"
	elif len(sys.argv) == 2:
		game_id = str(sys.argv[1])
	else:
		raise Exception("Wrong number of input arguments : " + str(len(sys.argv)))

######### Clean the Box Score Data
	df = pd.read_pickle("..//BoxScoreData//" + game_id + ".pkl")
	df = df.rename({playerName:handlePlayer(playerName) for playerName in df.index}, axis="index")
	df['-3PM'] = df.apply(lambda row: handlePM(row,"3PA","3PM"), axis=1)
	df['-FTM'] = df.apply(lambda row: handlePM(row,"FTA","FTM"), axis=1)
	df['2PM'] = df.apply(lambda row: handlePM(row,"FGM","3PM"), axis=1)
	df['-2PM'] = df.apply(lambda row: handle2PMiss(row), axis=1)
	
	df_dict = df.fillna('').transpose().to_dict()
	for key in df_dict.keys():
		df_dict[key]["PLAYER"] = df_dict[key]["TEAM"] + " " +  key
		df_dict[key]["_PLAYER"] = key

	data = list(df_dict.values())
	with open("..//BoxScoreData//" + game_id + "_cleaned.pkl", 'wb') as fp:
		pickle.dump(data, fp)

	# Will need this later for data filtering the play-by-play
	players = [df_dict[key]["PLAYER"] for key in df_dict.keys() if df_dict[key]["TEAM"] not in key] # get rid of overall teams
	home = df.iloc[-1]["TEAM"]
	visit = df.iloc[0]["TEAM"]
	nameMap = {}
	teamMap = {}
	teamMap[home] = []
	teamMap[visit] = []
	for player in players:
		nameMap[player] = {}

		if home.lower() in player.lower():
			teamMap[home].append(player)
			nameMap[player][home] = {}
			nameMap[player][home]["Full Name"] = player.split(home + " ")[1].lower()
			nameMap[player][home]["First Name"] = nameMap[player][home]["Full Name"].split(" ")[0].lower()
			nameMap[player][home]["Last Name"] = nameMap[player][home]["Full Name"].split(" ")[1].lower()
						
		if visit.lower() in player.lower():
			teamMap[visit].append(player)
			nameMap[player][visit] = {}
			nameMap[player][visit]["Full Name"] = player.split(visit + " ")[1].lower()
			nameMap[player][visit]["First Name"] = nameMap[player][visit]["Full Name"].split(" ")[0].lower()
			nameMap[player][visit]["Last Name"] = nameMap[player][visit]["Full Name"].split(" ")[1].lower()
	
######### Clean the PBP Data
	# Read in the Play-By-Play data
	df = pd.read_pickle("..//PBPdata//" + game_id + ".pkl")
	
	# Drop all rows that are all None
	df = df.dropna(how='all')

	# Forward fill the quarter number
	df["quarter"] = df["quarter"].fillna(method='ffill')

	# Remove rows that don't have a time
	df = df.dropna(subset=['time'])

	# Replace all None with empty string
	df = df.fillna("")

	# Find the true bottom of the score table and drop everything after that
	endpoint = df.index[df['home'].str.contains("Go to top")][-1]
	df.drop(df[ df.index > endpoint ].index , inplace=True)

	# Remove extra whitespace from string values
	df["home"] = df["home"].apply(trim)
	df["visit"] = df["visit"].apply(trim)
	
	# Remove rows that have a fractional time
	indices = []
	for index, row in df.iterrows():
		if "." in row["time"]:
			indices.append(index)
	df.drop(indices, inplace=True)

	# Make list of all viable times by second
	times = []
	for second in range(12*60+1):
		t = time.strftime("%M:%S", time.gmtime(second))
		if t[0] == "0":
			t = t[1:]
		times.append(t)

	for quarter in ["Q1","Q2","Q3","Q4"]:
		df_times = df.loc[df['quarter'] == quarter]['time'].tolist()
		for index,time in enumerate(times):
			if time not in df_times:
				new_row = [time,None,None,None,quarter]
				df = df.append(pd.Series(new_row, index=df.columns),ignore_index=True)#name=str(1000+index)))

	# convert time to seconds
	df["time_seconds"] = df["time"].apply(convertTime)

	df = df.sort_values(by=['quarter','time_seconds'],ascending=[True,True])

	# Turn empty string in Score column to None
	df["score"] = df["score"].apply(replace)
	
	# Fix the score column by filling forward
	df["score"].iloc[0] = "0 - 0"
	df["score"] = df["score"].fillna(method='ffill')
	
	# Split the score into home and visit, get score differential
	df["home_score"] = df["score"].apply(getHomePoints)
	df["visit_score"] = df["score"].apply(getVisitPoints)
	df = df.drop(columns=["score"])
	df["score differential"] = df["visit_score"] - df["home_score"]

	df.drop_duplicates(keep=False,inplace=True) 

	df.loc[df['quarter'] == "Q2",'time_seconds'] += 720
	df.loc[df['quarter'] == "Q3",'time_seconds'] += 720*2
	df.loc[df['quarter'] == "Q4",'time_seconds'] += 720*3
	
	lastScores = {}
	for quarterText in ["Q1","Q2","Q3","Q4"]:
		temp = df.loc[df['quarter'] == quarterText,'score differential']
		lastScores[quarterText] = str(temp.iloc[-1])
	
	# Create score-differential line data
	full_line_data = pd.DataFrame()
	full_line_data['quarter'] = df['quarter']
	full_line_data['time_seconds'] = df['time_seconds']
	full_line_data['score differential'] = df['score differential']
	full_line_data['key'] = full_line_data.index
	last_key = int(full_line_data.iloc[-1]["key"]) + 1
	
	full_line_data_dict = full_line_data.fillna('').transpose().to_dict()
	full_line_data_list = list(full_line_data_dict.values())
	
	truncated_data_list = []
	for index,element in enumerate(full_line_data_list):
		if index == 0:
			truncated_data_list.append(element)
		else:
			if full_line_data_list[index]["score differential"] != full_line_data_list[index-1]["score differential"]:
				truncated_data_list.append(element)

	# Add in special points
	special_elements = []
	special_elements.append({'quarter':'Q1','time_seconds':0,'score differential':0, 'key':20000})
	special_elements.append({'quarter':'Q2','time_seconds':720,'score differential':lastScores["Q1"], 'key':20001})
	special_elements.append({'quarter':'Q2','time_seconds':720*2,'score differential':lastScores["Q2"], 'key':20002})
	special_elements.append({'quarter':'Q3','time_seconds':720*2,'score differential':lastScores["Q2"], 'key':20003})
	special_elements.append({'quarter':'Q3','time_seconds':720*3,'score differential':lastScores["Q3"], 'key':20004})
	special_elements.append({'quarter':'Q4','time_seconds':720*3,'score differential':lastScores["Q3"], 'key':20005})
	special_elements.append({'quarter':'Q4','time_seconds':720*4,'score differential':lastScores["Q4"], 'key':20006})
	for element in special_elements:
		truncated_data_list.append(element)

	truncated_data_list.sort(key=lambda x: (x["quarter"],x["time_seconds"]))
	
	with open("..//PBPdata//" + game_id + "_line_cleaned.pkl", 'wb') as fp:
		pickle.dump(truncated_data_list, fp)
	
	# Create datapoint tree for queries
	df['key'] = df.index+10000
	dt = df.fillna('').transpose().to_dict()
	
	data = {}
	categories = ["1","2","3","BLK","TOV","FOUL","STL","REB","AST"]
	#data["rest"] = []
	for player in players:
		data[player] = {}
		for category in categories:
			if category in ["1","2","3"]:
				data[player][category] = {}
				data[player][category]["Made"] = []
				data[player][category]["Miss"] = []
			else:
				data[player][category] = []

	prev_index = 0
	for index in dt.keys():
		if index == 0:
			continue
		event = dt[index]
		tag = ""
		event["tag"] = tag
		event["color"] = "green"
		activeTeam = ""
		if event["home"] == "" and event["visit"] == "":
			text = ""
		elif event["home"] == "" and event["visit"] != "":
			text = event["visit"]
			activeTeam = visit
		elif event["home"] != "" and event["visit"] == "":
			text = event["home"]
			activeTeam = home
		elif event["home"] != "" and event["visit"] != "":
			text = event["home"] + " " + event["visit"]
			activeTeam = "both"
		if text is "":
			pass
		else:
			text = text.lower()
			# There is 1 Active team
			if activeTeam != "both":
				for player in teamMap[activeTeam]:
					
					# Get name
					full_name = nameMap[player][activeTeam]["Full Name"]
					first_name = nameMap[player][activeTeam]["First Name"]
					last_name = nameMap[player][activeTeam]["Last Name"]

					if last_name in text:

						# AST: Label as this player's assist if (<player>...AST) appears
						parenText = re.search("\([\w ]+\)$",text)
						if parenText is not None and parenText.group(0).split(" ")[0][1:] == last_name:
							tag = "A"
							if "3pt" in text:
								tag = "3A"
							else:
								tag = "2A"
							event["tag"] = tag
							data[player]["AST"].append(event)
							continue

						difference = np.abs(dt[index]["score differential"]-dt[prev_index]["score differential"])

						# 1, 2, 3: Using score difference, mark as 1,2 or 3 and check if it's (someone else's) AST
						if difference == 1:
							event["tag"] = "1"
							data[player]["1"]["Made"].append(event)
							continue
						elif difference == 2:
							if "ast" in text:
								event["tag"] = "2A"
							else:
								event["tag"] = "2"
							data[player]["2"]["Made"].append(event)                    
							continue
						elif difference == 3:
							if "ast" in text:
								event["tag"] = "3A"
							else:
								event["tag"] = "3"
							data[player]["3"]["Made"].append(event)
							continue
						
						# FOUL
						if "foul" in text and "s.foul" not in text and text.split(" ")[0] == last_name:
							new_event = deepcopy(event)
							new_event["tag"] = "F"
							new_event["color"] = "red"
							new_event["key"] = last_key
							data[player]["FOUL"].append(new_event)
							last_key += 1

						# REB
						if "rebound" in text:
							event["tag"] = "R"
							data[player]["REB"].append(event)
							continue

						# TOV
						if "turnover" in text:
							event["color"] = "red"
							event["tag"] = "T"
							data[player]["TOV"].append(event) 
							continue

						# 1, 2, 3: Using score difference, mark as 1,2 or 3 and check if it's (someone else's) AST
						if "miss" in text:
							event["color"] = "red"
							if "3pt" in text:
								event["tag"] = "3"
								data[player]["3"]["Miss"].append(event)
								continue
							elif "free throw" in text:
								event["tag"] = "1"
								data[player]["1"]["Miss"].append(event)
								continue
							else:
								event["tag"] = "2"
								data[player]["2"]["Miss"].append(event)
								continue

			# There are 2 Active teams
			elif activeTeam == "both":

				# BLK
				if "blk" in event["home"].lower():
					for player in teamMap[home]:
						if nameMap[player][home]["Last Name"] in event["home"].lower():
							new_event = deepcopy(event)
							new_event["tag"] = "B"
							new_event["key"] = last_key							
							data[player]["BLK"].append(new_event)
							last_key += 1
							

				elif "blk" in event["visit"].lower():
					for player in teamMap[visit]:
						if nameMap[player][visit]["Last Name"] in event["visit"].lower():
							new_event = deepcopy(event)
							event["tag"] = "B"
							new_event["key"] = last_key
							data[player]["BLK"].append(event)
							last_key += 1

				# Misses caused by blocks
				if "miss" in event["home"].lower():
					for player in teamMap[home]:
						if nameMap[player][home]["Last Name"] in event["home"].lower():
							new_event = deepcopy(event)
							new_event["color"] = "red"
							if "3pt" in text:
								new_event["tag"] = "3"
								new_event["key"] = last_key
								data[player]["3"]["Miss"].append(new_event)
								last_key += 1
							else:
								new_event["tag"] = "2"
								data[player]["2"]["Miss"].append(new_event)
								last_key += 1

				elif "miss" in event["visit"].lower():
					for player in teamMap[visit]:
						if nameMap[player][visit]["Last Name"] in event["visit"].lower():
							new_event = deepcopy(event)
							new_event["color"] = "red"
							if "3pt" in text:
								new_event["tag"] = "3"
								data[player]["3"]["Miss"].append(new_event)
								new_event["key"] = last_key
								last_key += 1
							else:
								new_event["tag"] = "2"
								new_event["key"] = last_key
								data[player]["2"]["Miss"].append(new_event)
								last_key += 1

				# Steals
				if "stl" in event["home"].lower():
					for player in teamMap[home]:
						if nameMap[player][home]["Last Name"] in event["home"].lower():
							new_event = deepcopy(event)
							new_event["tag"] = "S"
							new_event["key"] = last_key
							data[player]["STL"].append(new_event)
							last_key += 1

				elif "stl" in event["visit"].lower():
					for player in teamMap[visit]:
						if nameMap[player][visit]["Last Name"] in event["visit"].lower():
							new_event = deepcopy(event)
							new_event["tag"] = "S"
							new_event["key"] = last_key
							data[player]["STL"].append(new_event)
							last_key += 1

				# Turnovers caused by steals
				if "turnover" in event["home"].lower():
					for player in teamMap[home]:
						if nameMap[player][home]["Last Name"] in event["home"].lower():
							new_event = deepcopy(event)
							new_event["color"] = "red"
							new_event["tag"] = "T"
							new_event["key"] = last_key
							data[player]["TOV"].append(new_event)
							last_key += 1

				elif "turnover" in event["visit"].lower():
					for player in teamMap[visit]:
						if nameMap[player][visit]["Last Name"] in event["visit"].lower():
							new_event = deepcopy(event)
							new_event["color"] = "red"
							new_event["tag"] = "T"
							new_event["key"] = last_key
							data[player]["TOV"].append(new_event)
							last_key += 1
		prev_index = index
	
	with open("..//PBPdata//" + game_id + "_data_cleaned.pkl", 'wb') as fp:
		pickle.dump(data, fp)

##### Remove the pickle files
	#os.remove("..//nephewStatsBackend//PBPdata//0041800104.pkl")
	#os.remove("..//nephewStatsBackend//BoxScoreData//0041800104.pkl")