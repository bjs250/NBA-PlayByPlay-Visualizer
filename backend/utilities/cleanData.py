from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import sys
import os
import time

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
    df["score"][0] = "0 - 0"
    df["score"] = df["score"].fillna(method='ffill')

    # Split the score into home and away, get score differential
    df["home_score"] = df["score"].apply(getHomePoints)
    df["visit_score"] = df["score"].apply(getVisitPoints)
    df = df.drop(columns=["score"])
    df["score differential"] = df["home_score"] - df["visit_score"]

    df.drop_duplicates(keep=False,inplace=True) 
    df = df.reset_index(drop=True)

    df.loc[df['quarter'] == "Q2",'time_seconds'] += 720
    df.loc[df['quarter'] == "Q3",'time_seconds'] += 720*2
    df.loc[df['quarter'] == "Q4",'time_seconds'] += 720*3
    df.to_csv("..//nba_backend//PBPdata//" + game_id + ".csv")
    
##### Clean the Box Score Data
    df = pd.read_pickle("..//nba_backend//BoxScoreData//" + game_id + ".pkl")
    df = df.rename({playerName:handlePlayer(playerName) for playerName in df.index}, axis="index")
    print(df)
    df.to_csv("..//nba_backend//BoxScoreData//" + game_id + ".csv")

##### Remove the pickle files
    #os.remove("..//nba_backend//PBPdata//0041800104.pkl")
    #os.remove("..//nba_backend//BoxScoreData//0041800104.pkl")