from django.db import models

class Game(models.Model):

    id = models.CharField(primary_key=True, max_length=120)
    date = models.DateField()
    home = models.CharField(max_length=120)
    away = models.CharField(max_length=120)

    def _str_(self):
        return self.id + "," + self.date