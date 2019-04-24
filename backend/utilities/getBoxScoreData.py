from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import re
import pandas as pd
import os

# launch url
url = "https://stats.nba.com/game/0041800104/"

# create a new Firefox session
driver = webdriver.Chrome()
#driver = webdriver.Firefox()
driver.implicitly_wait(20)
driver.get(url)

count = 0

players = list()
headers = list()
data = {}


soup = BeautifulSoup(driver.page_source, 'html.parser')
tables = soup.find_all("div", class_="nba-stat-table__overflow")
for table in tables:
    for thead in table.find_all("thead"):
        for tr in thead.find_all("tr"):
            for th in tr.find_all("th"):
                if th.getText() is not None:
                    header = th.getText()
                    if header not in headers:
                        headers.append(header)


    for tr in table.find_all("tr"):
        
        # player node
        playerNode = tr.find("td", class_="player")
        if playerNode != None:
        
            textNode = playerNode.find("a")
            if textNode != None:
                playerName = textNode.getText()
                players.append(playerName)
                data[playerName] = {}
            
            # Everything else in this row is good stuff
            i = 0
            for td in tr.find_all("td"):
                if td.getText() != None:
                    if i == 0:
                        data[playerName] = td.getText()
                        data[playerName] = {}
                    else:
                        data[playerName][headers[i]] = td.getText()
                    i += 1

df = pd.DataFrame.from_dict(data).transpose()
print(df)

#df = pd.DataFrame({"players": players})
#df.to_pickle("..//nba_backend//BoxScoreData//0041800104.pkl")

driver.quit()
