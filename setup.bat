@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM SRMS — Automated Setup Script (Windows)
REM ═══════════════════════════════════════════════════════════════════════════
REM This script automatically sets up the complete SRMS project
REM Run: setup.bat
REM ═══════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion
title SRMS Setup
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                  🎓 SRMS Setup - Student Resource Management System   ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ❌  Node.js is not installed!
    echo    Download from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✔  Node.js %NODE_VERSION% found

REM Install database dependencies
echo.
echo [2/4] Installing database dependencies...
cd database
if not exist node_modules (
    call npm install >nul 2>&1
    if errorlevel 1 (
        color 0C
        echo ❌  Failed to install database dependencies
        pause
        exit /b 1
    )
)
echo ✔  Database dependencies installed

REM Install backend dependencies
echo.
echo [3/4] Installing backend dependencies...
cd ..\backend
if not exist node_modules (
    call npm install >nul 2>&1
    if errorlevel 1 (
        color 0C
        echo ❌  Failed to install backend dependencies
        pause
        exit /b 1
    )
)
echo ✔  Backend dependencies installed

REM Check MongoDB connection and setup database
echo.
echo [4/4] Setting up MongoDB database...
cd ..\database

echo.
echo 📡  Testing MongoDB connection...
call npm run check >nul 2>&1

if errorlevel 1 (
    color 0C
    echo.
    echo ❌  MongoDB is not running!
    echo.
    echo 💡  To start MongoDB:
    echo    • Windows Service: net start MongoDB
    echo    • Or manually: mongod.exe
    echo    • Or open MongoDB Compass
    echo.
    pause
    exit /b 1
)

echo ✔  MongoDB connected successfully

echo.
echo 📊  Creating database indexes...
call npm run index >nul 2>&1

echo ✔  Indexes created

echo.
echo 🌱  Seeding sample data...
call npm run seed >nul 2>&1

echo ✔  Sample data seeded

REM Summary
color 0B
echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                     ✅ Setup Complete!                               ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.

echo 📋 Test Credentials:
echo    Admin   — admin@srms.com   / admin123
echo    Student — urvashi@srms.com / student123
echo.

echo 🚀 Next Steps:
echo.
echo    1. Start Backend:
echo       • cd backend
echo       • npm run dev
echo.
echo    2. Start Frontend (in new terminal):
echo       • cd frontend
echo       • npx http-server -p 3000
echo.
echo    3. Open Browser:
echo       • Frontend: http://localhost:3000
echo       • API Health: http://localhost:5000/api/health
echo.

echo 📚 For detailed instructions, see SETUP_GUIDE.md
echo.

pause
