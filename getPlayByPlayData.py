from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import re
import pandas as pd
import os

# launch url
url = "https://stats.nba.com/game/0021800934/playbyplay/"

# create a new Firefox session
driver = webdriver.Chrome()
#driver = webdriver.Firefox()
driver.implicitly_wait(20)
driver.get(url)

visitEvents = list()
timeEvents = list()
scoreEvents = list()
homeEvents = list()

count = 0

soup = BeautifulSoup(driver.page_source, 'html.parser')
table = soup.find("div", class_="boxscore-pbp__inner")
for tr in table.find_all("tr"):
    
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

    count+=1

df = pd.DataFrame({"time": timeEvents, "score": scoreEvents, "home": homeEvents, "visit": visitEvents})
df.to_pickle("./stats.pkl")

driver.quit()
