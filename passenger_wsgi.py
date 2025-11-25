#!/usr/bin/env python
"""
Phusion Passenger configuration for Django
serv00.com - PrixRadio
"""

import sys
import os

# Add the project directory to the path
sys.path.insert(0, os.getcwd())

# Set Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'comparateur_allemand.settings'

# Setup Django
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
