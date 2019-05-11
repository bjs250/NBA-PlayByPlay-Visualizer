from django.shortcuts import render

# Create your views here.
import os
import logging
from django.http import HttpResponse
from django.views.generic import View
from django.conf import settings

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
    print("hit", request, id)
    print("Game", Game.objects.all())
    try:
        foundGame = Game.objects.get(game_id=id)
    except Game.DoesNotExist:
        foundGame = None

    if foundGame is not None:
        
        # Get the corresponding data file
        os.chdir(os.path.dirname(__file__))
        cwd = os.getcwd()
        print("Attempting to read PBP Line Data")
        with open (cwd+'/PBPdata/'+foundGame.game_id+'line_edit.pkl', 'rb') as fp:
            data = pickle.load(fp)
        print(data)
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
        print("Attempting to read PBP Data")
        with open (cwd+'/PBPdata/'+foundGame.game_id+'_edit.pkl', 'rb') as fp:
            data = pickle.load(fp)
        print(data)

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
        print("Attempting to read BoxScore Data")
        with open (cwd+'/BoxScoreData/'+foundGame.game_id+'_edit.pkl', 'rb') as fp:
            data = pickle.load(fp)
        print(data)
        
        # Return as a JSON response
        return HttpResponse(
            json.dumps(data),
            content_type = 'application/javascript; charset=utf8'
            )
    
    else:
        return HttpResponse("That does not exist")

def showGames(request,date):
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
    
    else:
        return HttpResponse("That does not exist")