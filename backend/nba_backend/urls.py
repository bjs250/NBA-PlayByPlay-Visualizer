from django.urls import path
from . import views

urlpatterns = [
    path('games/PBP/line/<str:id>',views.showGamePBPLine),
    path('games/PBP/data/<str:id>',views.showGamePBPData),
    path('games/BS/<str:id>',views.showGameBS),
    path('games/date/<str:date>',views.showGames)
    
]