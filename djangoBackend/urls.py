"""djangoBackend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from nephewStatsBackend import views
from nephewStatsBackend.views import FrontendAppView

urlpatterns = [
    re_path(r'^admin/', admin.site.urls),
    path('games/PBP/line/<str:id>',views.showGamePBPLine),
    path('games/PBP/data/<str:id>',views.showGamePBPData),
    path('games/BS/<str:id>',views.showGameBS),
    path('games/date/<str:date>',views.showGames),
    path('games/quotes/',views.getQuotes),
    path('games/<str:id>',views.getOrRetrieveGame),
    re_path(r'^', views.FrontendAppView.as_view()),
]
