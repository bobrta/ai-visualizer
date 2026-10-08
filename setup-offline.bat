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
py -3 tools\offline_setup.py %*
set "EXITCODE=%ERRORLEVEL%"
goto after_run

:use_python
python tools\offline_setup.py %*
set "EXITCODE=%ERRORLEVEL%"

:after_run
if not "%CI%"=="" exit /b %EXITCODE%
if not "%EXITCODE%"=="0" (
  echo.
  pause
  exit /b %EXITCODE%
)
echo.
echo Offline assets are ready.
pause
exit /b 0
