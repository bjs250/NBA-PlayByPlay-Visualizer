from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import re
import pandas as pd
import os

# launch url
url = "https://stats.nba.com/game/0021800934/"

# create a new Firefox session
#driver = webdriver.Chrome()
driver = webdriver.Firefox()
driver.implicitly_wait(20)
driver.get(url)

count = 0

players = list()

soup = BeautifulSoup(driver.page_source, 'html.parser')
tables = soup.find_all("div", class_="nba-stat-table__overflow")
for table in tables:
    for tr in table.find_all("tr"):
        
        # player node
        playerNode = tr.find("td", class_="player")
        if playerNode != None:
            textNode = playerNode.find("a")
            if textNode != None:
                players.append(textNode.getText())


df = pd.DataFrame({"players": players})
df.to_pickle("./Box_stats.pkl")

driver.quit()
