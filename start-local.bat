@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if not errorlevel 1 goto use_py

where python >nul 2>nul
if not errorlevel 1 goto use_python

echo Python 3 not found. Install Python 3 and enable "Add Python to PATH".
exit /b 1

:use_py
py -3 tools\local_server.py %*
exit /b %ERRORLEVEL%

:use_python
python tools\local_server.py %*
exit /b %ERRORLEVEL%
