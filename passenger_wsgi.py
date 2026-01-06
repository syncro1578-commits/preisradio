#!/usr/bin/env python
"""
Phusion Passenger configuration for Django
serv00.com - PrixRadio
"""

import sys
import os
from pathlib import Path

# Debug logging to file
DEBUG_LOG = "django_debug.log"
def log_debug(message):
    with open(DEBUG_LOG, "a") as f:
        f.write(message + "\n")

log_debug("\n=== New Passenger Request ===")
log_debug(f"Working dir: {os.getcwd()}")
log_debug(f"Script dir: {os.path.dirname(__file__)}")
log_debug(f"Initial Python path: {sys.path}")

# 1. Get base directory
BASE_DIR = Path(__file__).parent.resolve()
log_debug(f"BASE_DIR: {BASE_DIR}")

# 2. Find virtualenv (check multiple locations)
VENV_PATH = None
possible_venv_paths = [
    Path('/usr/home/wael/venv'),                # ✅ CORRECT PATH for serv00
    BASE_DIR / 'venv',                          # In public_python
    BASE_DIR.parent / 'venv',                   # In domain root (api.preisradio.de)
]

for path in possible_venv_paths:
    log_debug(f"Checking for venv at: {path}")
    if path.exists():
        VENV_PATH = path
        log_debug(f"Found virtualenv at: {VENV_PATH}")
        break

if not VENV_PATH:
    log_debug(f"ERROR: Could not find virtualenv in any expected location")
    raise RuntimeError("Virtualenv not found")

# 3. Determine Python version
python_versions = ['python3.11', 'python3.10', 'python3.12', 'python3.9']
SITE_PACKAGES = None

for py_version in python_versions:
    candidate = VENV_PATH / 'lib' / py_version / 'site-packages'
    log_debug(f"Checking for site-packages at: {candidate}")
    if candidate.exists():
        SITE_PACKAGES = candidate
        log_debug(f"Found site-packages at: {SITE_PACKAGES}")
        break

if not SITE_PACKAGES:
    log_debug(f"ERROR: Could not find site-packages in virtualenv")
    raise RuntimeError("site-packages not found in virtualenv")

# 4. Add paths to sys.path
paths_to_add = [
    str(SITE_PACKAGES),
    str(BASE_DIR),
]

for path in paths_to_add:
    if os.path.exists(path):
        sys.path.insert(0, path)
        log_debug(f"Added path: {path}")
    else:
        log_debug(f"WARNING: Path does not exist: {path}")

log_debug(f"Updated Python path: {sys.path}")

# 5. Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "comparateur_allemand.settings")

# 6. Try Django initialization
try:
    from django.core.wsgi import get_wsgi_application
    log_debug("Django imported successfully!")
    application = get_wsgi_application()
    log_debug("WSGI application initialized successfully!")
except Exception as e:
    log_debug(f"ERROR during Django initialization: {str(e)}")
    log_debug(f"sys.path at error: {sys.path}")
    raise
