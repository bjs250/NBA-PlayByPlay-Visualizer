from django.urls import path
from . import views

urlpatterns = [
    path('games/<str:id>',views.showGame)
]