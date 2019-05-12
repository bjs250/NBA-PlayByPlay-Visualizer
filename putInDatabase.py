import os
import pprint
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "djangoBackend.settings.local")
django.setup()
from nephewStatsBackend.models import Game


f=open("master.txt", "r")
if f.mode == 'r':
    contents = f.readlines()
f.close()
contents = [x.strip() for x in contents]
for content in contents:
    x = content.split(" ")
    date = x[0]
    game_id = x[1]
    home = x[2]
    away = x[3]
    try:
        foundGame = Game.objects.get(game_id=game_id)
    except Game.DoesNotExist:
        foundGame = None
    
    if foundGame is None:
        game = Game(game_id=game_id,date=date,home=home,away=away)
        game.save()
    print(x, foundGame)
