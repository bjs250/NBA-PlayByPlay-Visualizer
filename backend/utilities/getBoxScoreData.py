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
url = "https://stats.nba.com/game/" + game_id + "/"

# TODO: add error handling if an invalid id is specified

# create a new Firefox session
driver = webdriver.Chrome()
#driver = webdriver.Firefox()
driver.implicitly_wait(40)
driver.get(url)

count = 0

# Declare data structures to be used to store data for the Pandas dataframe
headers = list()
data = {}

soup = BeautifulSoup(driver.page_source, 'html.parser')

# Get the 2 team names
team_nodes = soup.find_all("div", class_="nba-stat-table__caption")
teams = []
for team_node in team_nodes:
    teams.append(team_node.getText())

tables = soup.find_all("div", class_="nba-stat-table__overflow")
for index,table in enumerate(tables):

    # Get the box score table column headers
    for thead in table.find_all("thead"):
        for tr in thead.find_all("tr"):
            for th in tr.find_all("th"):
                if th.getText() is not None:
                    header = th.getText()
                    if header not in headers:
                        headers.append(header)

    # Load respective data for each player into the data dictionary
    for tr in table.find_all("tr"):
        
        # player node
        playerNode = tr.find("td", class_="player")
        if playerNode != None:
                    
            i = 0
            for td in tr.find_all("td"):
                if td.getText() != None:
                    if i == 0:
                        playerName = td.getText()
                        if "Totals:" in playerName:
                            playerName = teams[index]+" " +playerName
                        data[playerName] = {}
                        data[playerName]["TEAM"] = teams[index]
                    else:
                        data[playerName][headers[i]] = td.getText()
                    i += 1

# Save to file
df = pd.DataFrame.from_dict(data).transpose()
df.to_pickle("..//nba_backend//BoxScoreData//" + game_id + ".pkl")

#print(df)
driver.quit()
