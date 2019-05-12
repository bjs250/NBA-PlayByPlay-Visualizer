from .base import *

# Common

SECRET_KEY = '1v-brmj#%p4rpqg#ppzv1qsj(5#!i@0cn$ff%x=e=xs1*on1ay'
ALLOWED_HOSTS = ['*']


# Dev

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

# DEBUG = True

# Prod

# DATABASES = {  
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql_psycopg2', 
#         'NAME': 'nephewStatsDB',                     
#         'HOST': 'localhost',                      # Set to empty string for localhost. 
#         'PORT': '5432',                      # Set to empty string for default. 
#     }
# }

# DATABASES['default'] =  dj_database_url.config() # enable in production

# DEBUG = False

