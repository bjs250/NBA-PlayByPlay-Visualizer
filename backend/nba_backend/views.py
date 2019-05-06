from django.shortcuts import render
from django.http import HttpResponse

from rest_framework import viewsets          
from django.core import serializers
#from .serializers import GameSerializer      
from .models import Game           
import requests      

import pandas as pd
import numpy as np
import json
import os
import pickle
import datetime


def showGamePBPLine(request,id):
    try:
        foundGame = Game.objects.get(game_id=id)
    except Game.DoesNotExist:
        foundGame = None

    if foundGame is not None:
        
        # Get the corresponding data file
        os.chdir(os.path.dirname(__file__))
        cwd = os.getcwd()
        with open (cwd+'/PBPdata/'+foundGame.game_id+'line_edit.pkl', 'rb') as fp:
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
        with open (cwd+'/PBPdata/'+foundGame.game_id+'_edit.pkl', 'rb') as fp:
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
        with open (cwd+'/BoxScoreData/'+foundGame.game_id+'_edit.pkl', 'rb') as fp:
            data = pickle.load(fp)
        
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


"""
class GameView(viewsets.ModelViewSet):       
    serializer_class = GameSerializer          
    queryset = Game.objects.all()
"""