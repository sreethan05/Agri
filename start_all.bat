@echo off
title Agri AI - Launcher
echo ========================================================
echo Starting Agri AI System (Backend & Frontend)
echo ========================================================
start "Agri AI - Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "Agri AI - Frontend" cmd /k "%~dp0run_frontend.bat"
echo.
echo Both servers are starting up!
echo - Backend API: http://127.0.0.1:8000/docs
echo - Frontend UI:  http://localhost:5173
echo ========================================================
pause
