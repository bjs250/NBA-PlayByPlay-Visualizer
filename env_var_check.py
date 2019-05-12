import os
print(os.environ.get('django_secret_key', 'Not Set'))
print(os.environ.get('django_env', 'Not Set'))