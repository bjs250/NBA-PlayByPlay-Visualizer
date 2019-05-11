# Generated by Django 2.2.1 on 2019-05-10 17:00

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('game_id', models.CharField(max_length=120)),
                ('date', models.DateField()),
                ('home', models.CharField(max_length=120)),
                ('away', models.CharField(max_length=120)),
            ],
        ),
    ]