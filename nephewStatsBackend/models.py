from django.db import models

class Game(models.Model):

    game_id = models.CharField(max_length=120)
    date = models.DateField()
    home = models.CharField(max_length=120)
    away = models.CharField(max_length=120)

    def _str_(self):
        return self.game_id + "," + self.date