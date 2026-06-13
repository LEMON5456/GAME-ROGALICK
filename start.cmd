@echo off
cd /d "%~dp0"
echo Starting game server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
