from bs4 import BeautifulSoup
import re
import pandas as pd
import numpy as np
import os

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

if __name__ == "__main__":

    # Clean the play-by-play data
    df = pd.read_pickle("..//nba_backend//PBPdata//0041800104.pkl")

    # Remove extra whitespace
    print(df)
    df["home"] = df["home"].apply(trim)
    df["visit"] = df["visit"].apply(trim)

    # Turn empty string to None
    df["score"] = df["score"].apply(replace)

    # Drop all rows that are all None
    df = df.dropna(how='all')

    # Fix the score column by filling forward
    df["score"][2] = "0 - 0"
    df["score"] = df["score"].fillna(method='ffill')

    # Replace all None with empty string
    df = df.fillna("")

    # Find the true bottom of the score table
    endpoint = df.index[df['home'].str.contains("Go to top ⇧")][-1]
    df = df[:endpoint]
    
    # Split the score into home and away, get score differential
    df["home_score"] = df["score"].apply(getHomePoints)
    df["visit_score"] = df["score"].apply(getVisitPoints)
    df = df.drop(columns=["score"])
    df["score differential"] = df["home_score"] - df["visit_score"]
    
    # convert time to seconds
    df["time(seconds)"] = df["time"].apply(convertTime)

    offset = 0
    # deal with quarters --> create ascending time
    seconds = df["time(seconds)"].as_matrix()
    for index,time in enumerate(seconds[0:-2]):
        if seconds[index+1] < seconds[index]:
            seconds[(index+1):] += (seconds[index]-seconds[index+1])
    df["time(seconds)"] = seconds

    # interpolate score data
    quarter = list()
    count = 1
    for index, row in df.iterrows():
        quarter.append("Q" + str(count))
        if row['time'] == "0:00" and "Go to top" in row['home']:
            count += 1
    df["quarter"] = quarter

    df.to_csv('..//nba_backend//PBPdata//0041800104.csv')
    
##### Clean the Box Score Data
    df = pd.read_pickle("..//nba_backend//BoxScoreData//0041800104.pkl")
    df["players"] = df["players"].str.split(" ").str.get(0) + " " +  df["players"].str.split(" ").str.get(1) 
    df.to_csv('..//nba_backend//BoxScoreData//0041800104.csv')

##### Remove the pickle files
    #os.remove("..//nba_backend//PBPdata//0041800104.pkl")
    #os.remove("..//nba_backend//BoxScoreData//0041800104.pkl")