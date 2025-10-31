@echo off
echo ========================================
echo LinkedIn Auto Commenter
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Check if credentials.json exists
if not exist "credentials.json" (
    echo.
    echo WARNING: credentials.json not found!
    echo Please follow the setup instructions to create it.
    echo See QUICK_START.md for details.
    echo.
    pause
    exit /b 1
)

REM Run the script
echo Starting LinkedIn Auto Commenter...
echo.
python linkedin_auto_commenter.py

pause

