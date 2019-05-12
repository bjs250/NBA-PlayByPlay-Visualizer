from .base import *
import os

# Common

print("in local")

SECRET_KEY = str(os.environ["django_secret_key"])
ALLOWED_HOSTS = ['*']

if str(os.environ["django_env"]) == "DEV":
    print("Running in dev")
    DATABASES = {  
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2', 
            'NAME': 'nephewStatsDB',                     
            'USER': 'postgres',                      # Remove in produuction
            'PASSWORD': 'DeltaV123',                  # Remove in production
            'HOST': 'localhost',                      # Set to empty string for localhost. 
            'PORT': '5432',                      # Set to empty string for default. 
        }
    }

    DEBUG = True
else:
    #Prod
    print("Running in prod")
    DATABASES = {  
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2', 
            'NAME': 'nephewStatsDB',                     
            'HOST': 'localhost',                      # Set to empty string for localhost. 
            'PORT': '5432',                      # Set to empty string for default. 
        }
    }

    DATABASES['default'] =  dj_database_url.config() # enable in production

    DEBUG = False

