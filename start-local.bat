@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 tools\local_server.py %*
  exit /b %errorlevel%
)

where python >nul 2>nul
if not %errorlevel%==0 (
  echo Python 3 not found. Install Python 3 and enable "Add Python to PATH".
  exit /b 1
)
python tools\local_server.py %*
exit /b %errorlevel%
