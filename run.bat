@echo off
title Smart Restaurant Analytics System Launcher
echo ========================================================
echo   Starting Smart Restaurant Analytics Platform
echo ========================================================
echo.

echo [1/2] Launching Python FastAPI Backend on http://localhost:8000 ...
start "FastAPI Backend" cmd /k "cd backend && python run.py"

timeout /t 3 /nobreak >nul

echo [2/2] Launching React Vite Frontend on http://localhost:5173 ...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Both servers launched successfully!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo ========================================================
echo.
pause
