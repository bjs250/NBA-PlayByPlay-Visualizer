from django.shortcuts import render
from django.http import HttpResponse

from rest_framework import viewsets          
from django.core import serializers
#from .serializers import GameSerializer      
from .models import Game           
import requests      

import pandas as pd
import json
import os

def showGame(request,id):
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
        dt = pd.read_csv(cwd+'/PBPdata/'+foundGame.game_id+'.csv').fillna('').to_dict()
        
        # Return as a JSON response
        return HttpResponse(
            json.dumps(dt),
            content_type = 'application/javascript; charset=utf8'
            )
    
    else:
        return HttpResponse("That does not exist")

"""
class GameView(viewsets.ModelViewSet):       
    serializer_class = GameSerializer          
    queryset = Game.objects.all()
"""