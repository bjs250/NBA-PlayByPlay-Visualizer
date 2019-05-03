from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import sys
import os
import time
import pickle
import re

def trim(s):
    if s is not None:
        return s.lstrip().rstrip()
    else: 
        return s

def replace(s):
    #print(s, s is "")
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
    df = pd.read_pickle("..//nba_backend//BoxScoreData//" + game_id + ".pkl")
    df = df.rename({playerName:handlePlayer(playerName) for playerName in df.index}, axis="index")
    df = df.fillna('').transpose().to_dict()
    for key in df.keys():
        df[key]["PLAYER"] = key
    
    data = list(df.values())
    #data = [df[key] for key in df.keys()]
    with open("..//nba_backend//BoxScoreData//" + game_id + "_edit.pkl", 'wb') as fp:
        pickle.dump(data, fp)
    
    players = [df[key]["PLAYER"].split(" ")[1].lower() for key in df.keys()]
    
######### Clean the PBP Data
    # Read in the Play-By-Play data
    df = pd.read_pickle("..//nba_backend//PBPdata//" + game_id + ".pkl")

    # Drop all rows that are all None
    df = df.dropna(how='all')

    # Forward fill the quarter number
    df["quarter"] = df["quarter"].fillna(method='ffill')

    # Remove rows that don't have a time
    df = df.dropna(subset=['time'])

    # Replace all None with empty string
    df = df.fillna("")

    # Find the true bottom of the score table and drop everything after that
    endpoint = df.index[df['home'].str.contains("Go to top ⇧")][-1]
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
    
    # Split the score into home and away, get score differential
    df["home_score"] = df["score"].apply(getHomePoints)
    df["visit_score"] = df["score"].apply(getVisitPoints)
    df = df.drop(columns=["score"])
    df["score differential"] = df["home_score"] - df["visit_score"]

    df.drop_duplicates(keep=False,inplace=True) 

    df.loc[df['quarter'] == "Q2",'time_seconds'] += 720
    df.loc[df['quarter'] == "Q3",'time_seconds'] += 720*2
    df.loc[df['quarter'] == "Q4",'time_seconds'] += 720*3
    
    # Create score-differential line data
    full_line_data = pd.DataFrame()
    full_line_data['quarter'] = df['quarter']
    full_line_data['time_seconds'] = df['time_seconds']
    full_line_data['score differential'] = df['score differential']
    full_line_data['key'] = full_line_data.index
    full_line_data_dict = full_line_data.fillna('').transpose().to_dict()
    full_line_data_list = list(full_line_data_dict.values())
    
    truncated_data_list = []
    for index,element in enumerate(full_line_data_list):
        if index == 0:
            truncated_data_list.append(element)
        else:
            if full_line_data_list[index]["score differential"] != full_line_data_list[index-1]["score differential"]:
                truncated_data_list.append(element)
    
    with open("..//nba_backend//PBPdata//" + game_id + "line_edit.pkl", 'wb') as fp:
        pickle.dump(truncated_data_list, fp)
    
    #print(truncated_data_list)
    #print(len(truncated_data_list))
    
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

    
    for index in range(1,len(dt.keys())):
        event = dt[index]
        tag = ""
        event["tag"] = tag
        event["color"] = "green"
        text = (event["home"] + " "  + event["visit"]).strip().lower()
        if text is "":
            pass
            #data["rest"].append(event)
        else:
            for player in players:
                if player in text:

                    # AST
                    a = re.search("\([\w ]+\)$",text)
                    if event not in data[player]["AST"] and a is not None and a.group(0).split(" ")[0][1:] == player:
                        tag = "A"
                        if "3pt" in text:
                            tag = "3A"
                        else:
                            tag = "2A"
                        event["tag"] = tag
                        data[player]["AST"].append(event)

                    difference = np.abs(dt[index]["score differential"]-dt[index-1]["score differential"])

                    # 1, 2, 3
                    if difference == 1 and event not in data[player]["1"]["Made"]:
                        event["tag"] = "1"
                        data[player]["1"]["Made"].append(event)
                    elif difference == 2 and event not in data[player]["2"]["Made"]:
                        if "ast" in text:
                            event["tag"] = "2A"
                        else:
                            event["tag"] = "2"
                        data[player]["2"]["Made"].append(event)                    
                    elif difference == 3 and event not in data[player]["3"]["Made"]:
                        if "ast" in text:
                            event["tag"] = "3A"
                        else:
                            event["tag"] = "3"
                        data[player]["3"]["Made"].append(event)
                    
                    # BLK
                    if "blk" in text and event not in data[player]["BLK"]:
                        event["tag"] = "B"
                        data[player]["BLK"].append(event)

                    # FOUL
                    if "foul" in text and "s.foul" not in text and event not in data[player]["FOUL"] and text.split(" ")[0] == player:
                        event["tag"] = "F"
                        data[player]["FOUL"].append(event)

                    # STL
                    phrase = player + " " + "steal"
                    if phrase in text and event not in data[player]["STL"]:
                        event["tag"] = "S"
                        data[player]["STL"].append(event)

                    # TOV
                    if "turnover" in text and event not in data[player]["TOV"] and event not in data[player]["STL"]:
                        event["tag"] = "T"
                        data[player]["TOV"].append(event)

                    if player in text and "miss" in text and event not in data[player]["BLK"]:
                        event["color"] = "red"
                        if "3pt" in text:
                            event["tag"] = "3"
                            data[player]["3"]["Miss"].append(event)
                        elif "free throw" in text:
                            event["tag"] = "1"
                            data[player]["1"]["Miss"].append(event)
                        else:
                            event["tag"] = "2"
                            data[player]["2"]["Miss"].append(event)
    
    with open("..//nba_backend//PBPdata//" + game_id + "_edit.pkl", 'wb') as fp:
        pickle.dump(data, fp)

    #df.to_csv("..//nba_backend//PBPdata//" + game_id + ".csv")

##### Remove the pickle files
    #os.remove("..//nba_backend//PBPdata//0041800104.pkl")
    #os.remove("..//nba_backend//BoxScoreData//0041800104.pkl")