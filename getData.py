from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import re
import pandas as pd
import os

# launch url
url = "https://stats.nba.com/game/0021800922/playbyplay/"

# create a new Firefox session
driver = webdriver.Chrome()
driver.implicitly_wait(20)
driver.get(url)

soup = BeautifulSoup(driver.page_source, 'html.parser')
print(soup.find('table'))


driver.quit()
