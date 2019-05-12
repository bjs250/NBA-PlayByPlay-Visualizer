from selenium import webdriver
from bs4 import BeautifulSoup
import pandas as pd
import sys

# Check if there was an input argument or not
game_id = ""
if len(sys.argv) == 1:
    game_id = "0041800104"
elif len(sys.argv) == 2:
    game_id = str(sys.argv[1])
else:
    raise Exception("Wrong number of input arguments : " + str(len(sys.argv)))

# launch url
url = "https://stats.nba.com/game/" + game_id + "/playbyplay/"

# TODO: add error handling if an invalid id is specified

# create a new Firefox session
driver = webdriver.Chrome()
#driver = webdriver.Firefox()
driver.get(url)
driver.implicitly_wait(100)

visitEvents = list()
timeEvents = list()
scoreEvents = list()
homeEvents = list()
quarters = list()

soup = BeautifulSoup(driver.page_source, 'html.parser')
table = soup.find("div", class_="boxscore-pbp__inner")
for tr in table.find_all("tr"):
    
    # quarter node
    quarterNode = tr.find("td", class_="start-period")
    if quarterNode != None:
        quarterText = quarterNode.getText()
        t = None
        for s in quarterText.split(" "):
            if "Q" in s:
                t = s
        quarters.append(t)
    else:
        quarters.append(None)

    # visiting team node
    visitNode = tr.find("td", class_="play team vtm")
    if visitNode != None:
        t = visitNode.find("a")
        if t != None:
            visitEvents.append(t.getText())
        else:
            visitEvents.append(None)            
    else:
        visitEvents.append(None)

    # play status node
    statusNode = tr.find("td", class_="play status")
    if statusNode != None:
        timeNode = tr.find("div", class_="time")
        if timeNode != None:
            timeEvents.append(timeNode.getText())
        else:
            timeEvents.append(None)

        scoreNode = tr.find("div", class_="score")
        if scoreNode != None:
            scoreEvents.append(scoreNode.getText())
        else:
            scoreEvents.append(None)
    else:
        timeEvents.append(None)
        scoreEvents.append(None)

    # home team node
    homeNode = tr.find("td", class_="play team htm")
    if homeNode != None:
        t = homeNode.find("a")
        if t != None:
            homeEvents.append(t.getText())
        else:
            homeEvents.append(None)            
    else:
        homeEvents.append(None)

df = pd.DataFrame({"time": timeEvents, "score": scoreEvents, "home": homeEvents, "visit": visitEvents, "quarter":quarters})

df.to_pickle("..//PBPdata//" + game_id + ".pkl")
driver.quit()
