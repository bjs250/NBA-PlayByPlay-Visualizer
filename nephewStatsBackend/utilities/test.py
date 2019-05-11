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
game_id = '0041800161'
df = pd.read_pickle("..//BoxScoreData//" + game_id + ".pkl")
#df = pd.read_pickle("..//PBPdata//" + game_id + ".pkl")
#df = pd.read_pickle("..//PBPdata//" + game_id + "_data_cleaned.pkl")

print(df)