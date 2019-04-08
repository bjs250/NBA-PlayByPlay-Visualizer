from django.shortcuts import render
from django.http import HttpResponse

from rest_framework import viewsets          
from .serializers import GameSerializer      
from .models import Game           
import requests          

def showGame(request,id):
    try:
        foundGame = Game.objects.get(game_id=id)
    except Game.DoesNotExist:
        foundGame = None

    if foundGame is not None:
        return HttpResponse("test: " + foundGame.game_id)
    else:
        return HttpResponse("That does not exist")

"""
class GameView(viewsets.ModelViewSet):       
    serializer_class = GameSerializer          
    queryset = Game.objects.all()
"""