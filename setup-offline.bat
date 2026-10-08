@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 tools\offline_setup.py %*
  set EXITCODE=%errorlevel%
) else (
  where python >nul 2>nul
  if not %errorlevel%==0 (
    echo Python 3 not found. Install Python 3 and enable "Add Python to PATH".
    exit /b 1
  )
  python tools\offline_setup.py %*
  set EXITCODE=%errorlevel%
)

if not "%CI%"=="" exit /b %EXITCODE%
if not %EXITCODE%==0 (
  echo.
  pause
  exit /b %EXITCODE%
)
echo.
echo Offline assets are ready.
pause
exit /b 0
