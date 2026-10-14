@echo off
TITLE Smart Restaurant Analytics System Launcher
echo ======================================================================
echo  J26-IT-333: AI + IoT Smart Restaurant Management System
echo ======================================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && python run.py"

timeout /t 3 /nobreak >nul

echo Starting React Vite Frontend on http://localhost:5173 ...
start "Frontend - React Vite" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================================
echo  SYSTEM LAUNCHED SUCCESSFULLY!
echo  - Frontend Dashboard: http://localhost:5173
echo  - Backend API Docs:   http://127.0.0.1:8000/docs
echo ======================================================================
pause
