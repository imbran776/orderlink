@echo off
title OrderLink Launcher

echo ========================================
echo   OrderLink - Starting all services...
echo ========================================
echo.

echo [1/3] Starting Backend (Laravel)...
start "OrderLink - Backend" cmd /k "cd /d C:\Laravel\orderlink\backend && php artisan serve"

echo [2/3] Starting Realtime (Socket.io)...
start "OrderLink - Realtime" cmd /k "cd /d C:\Laravel\orderlink\realtime && npm run dev"

echo [3/3] Starting Frontend (React)...
start "OrderLink - Frontend" cmd /k "cd /d C:\Laravel\orderlink\frontend && npm run dev"

echo.
echo All services starting...
echo Open browser at: http://localhost:5173
echo.
pause
