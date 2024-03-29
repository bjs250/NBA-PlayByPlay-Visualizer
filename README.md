# NephewStats

## Purpose

To allow end users to understand the flow of an NBA game based on score differential and events. 

## Design & Implementation

The play-by-play data and boxscore stats used in the application are webscraped in Python using Selenium and BeautifulSoup from stats.nba.com and saved as pickled files to be cleaned later (more specifically, URL's in the form of https://stats.nba.com/game/(game_id)/playbyplay/ and https://stats.nba.com/game/(game_id)/ respectively. Details can be seen in backend/utilities/getBoxScoreData.py and backend/utilities/getPlayByPlayData.py). Using the unofficial NBA.com API documented at swar/nba_api, a list of NBA game ID's was constructed, and a script was built to webscrape using these ID's.

The raw data was then cleaned and stored into JSON serializable data structures in Python using Pandas (backend/utilities/cleanData.py).

Django was chosen as backend since the webscraping and data cleaning operations were already being performed using Python. An API was constructed in Django to serve cleaned backend data to the frontend based on a few simple internal URL patterns. 

React was chosen as a frontend JavaScript framework primarily because it is great for Single Page Applications, relatively good at managing state, and its internal diff logic aids in rendering performance. The component tree is relatively shallow, so a state managing library like Redux was not used. D3 is the premier JavaScript data visualization library, so it was chosen to render the line chart. React and D3 both compete for managing the DOM -- to get these libraries to work together, React was chosen as the DOM master, and D3's methods are only invoked as utility functions. 

A simplified react component tree with state and prop relations is pictured below:
![Imgur](https://i.imgur.com/SxN4QlP.png)

A simplified UML diagram for some of the data servicing transactions is pictured below:
![Imgur](https://i.imgur.com/nhLJRPn.png)

## Built With

* [BeautifulSoup]() - Webscraping
* [Selenium]() - Webscraping
* [Pandas]() - Raw data cleaning and formatting
* [Django]() - Backend framework
* [React]() - Frontend framework
* [PostgreSQL]() - Backend database
* [D3]() - Data visualization (line chart)
* [React-table]() - Creating the interactive BoxScore table
* [Memoize-one]() - Memoization of front-end JavaScript functions

Deployed on Heroku

## Acknowledgments

* [swar/nba_api]() - Documenting the unofficial API endpoints of NBA.com
