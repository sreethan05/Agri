@echo off
title Agri AI - Backend
echo Starting Agri AI FastAPI Backend...
cd /d "%~dp0backend"
call .venv\Scripts\activate
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
