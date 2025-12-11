@echo off
echo ========================================
echo   PPTMaster - Quick Start
echo ========================================
echo.

echo [1/3] Starting Next.js Development Server...
start "PPTMaster Dev Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [2/3] Starting ngrok tunnel...
echo.
echo NOTE: If this is your first time using ngrok:
echo 1. Sign up at https://dashboard.ngrok.com/signup
echo 2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
echo 3. Run: ngrok config add-authtoken YOUR_AUTH_TOKEN
echo.
start "ngrok Tunnel" cmd /k "ngrok http 3000"
timeout /t 3 /nobreak >nul

echo [3/3] Opening application...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Local:     http://localhost:3000
echo ngrok UI:  http://localhost:4040
echo.
echo Check the ngrok window for your public URL
echo Then configure webhooks in Clerk and Polar
echo.
echo Press any key to view setup instructions...
pause >nul
start START_SERVERS.md
