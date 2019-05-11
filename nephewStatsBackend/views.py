from django.shortcuts import render

# Create your views here.
import os
import logging
from django.http import HttpResponse
from django.views.generic import View
from django.conf import settings
from django.core import serializers
import urllib.request

from .models import Game           
import requests      

import pandas as pd
import numpy as np
import json
import os
import pickle
import datetime

class FrontendAppView(View):
    """
    Serves the compiled frontend entry point (only works if you have run `yarn
    build`).
    """
    index_file_path = os.path.join(settings.REACT_APP_DIR, 'build', 'index.html')

    def get(self, request):
        try:
            with open(self.index_file_path) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            logging.exception('Production build of app not found')
            return HttpResponse(
                """
                This URL is only used when you have built the production
                version of the app. Visit http://localhost:3000/ instead after
                running `yarn start` on the frontend/ directory
                """,
                status=501,
            )

def showGamePBPLine(request,id):
    try:
        foundGame = Game.objects.get(game_id=id)
    except Game.DoesNotExist:
        foundGame = None

    if foundGame is not None:
        
        # Get the corresponding data file
        os.chdir(os.path.dirname(__file__))
        cwd = os.getcwd()
        with open (cwd+'/PBPdata/'+foundGame.game_id+'_line_cleaned.pkl', 'rb') as fp:
            data = pickle.load(fp)
        # Return as a JSON response
        return HttpResponse(
            json.dumps(data),
            content_type = 'application/javascript; charset=utf8'
            )
    
    else:
        return HttpResponse("That does not exist")

def showGamePBPData(request,id):
    try:
        foundGame = Game.objects.get(game_id=id)
    except Game.DoesNotExist:
        foundGame = None

    if foundGame is not None:
        
        # Get the corresponding data file
        os.chdir(os.path.dirname(__file__))
        cwd = os.getcwd()
        with open (cwd+'/PBPdata/'+foundGame.game_id+'_data_cleaned.pkl', 'rb') as fp:
            data = pickle.load(fp)
 
        # Return as a JSON response
        return HttpResponse(
            json.dumps(data),
            content_type = 'application/javascript; charset=utf8'
            )
    
    else:
        return HttpResponse("That does not exist")


def showGameBS(request,id):
    try:
        foundGame = Game.objects.get(game_id=id)
    except Game.DoesNotExist:
        foundGame = None

    if foundGame is not None:

        #data = serializers.serialize('json', [foundGame,])
        #print(data)
        
        # Get the corresponding data file
        os.chdir(os.path.dirname(__file__))
        cwd = os.getcwd()
        with open (cwd+'/BoxScoreData/'+foundGame.game_id+'_cleaned.pkl', 'rb') as fp:
            data = pickle.load(fp)
        
        # Return as a JSON response
        return HttpResponse(
            json.dumps(data),
            content_type = 'application/javascript; charset=utf8'
            )
    
    else:
        return HttpResponse("That does not exist")

def showGames(request,date):
    print(date)
    [month,day,year] = date.split("-")
    month = int(month)
    day = int(day)
    year = int(year)
    print(month,day,year)
    try:
        foundGames = [{"id":game.game_id,"description":game.home+" vs. "+game.away} for game in Game.objects.filter(date__gte=datetime.date(year,month,day),date__lte=datetime.date(year,month,day))]
    except Game.DoesNotExist:
        foundGame = None

    if foundGames is not None:

        return HttpResponse(
            json.dumps(foundGames),
            content_type = 'application/javascript; charset=utf8'
            )

def getOrRetrieveGame(request,id):
    try: # Check if the game is cached
        foundGame = Game.objects.get(game_id=id)
    except Game.DoesNotExist:
        # Check if the input is a valid game id
        print("id",id)
        if len(id) == 10 and id.isnumeric():
            # TODO: Probably a check to see if the score is 0-0 to just ignore everything
            foundGame = None
        else:
            print("Invalid input")
            foundGame = None


    if foundGame is not None:
        
        fields = ['game_id','date','home','away']
        data = serializers.serialize('json', [foundGame], fields=fields)
        
        # Return as a JSON response
        return HttpResponse(
            json.dumps(data),
            content_type = 'application/javascript; charset=utf8'
            )
    
    else:
        return bad_request(message="test")

    
def bad_request(message):
    response = HttpResponse(json.dumps({'message': message}), 
        content_type='application/json')
    response.status_code = 400
    return response

