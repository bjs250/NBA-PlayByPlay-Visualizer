from django.urls import path
from . import views

urlpatterns = [
    path('games/PBP/<str:id>',views.showGamePBP),
    path('games/BS/<str:id>',views.showGameBS)
]