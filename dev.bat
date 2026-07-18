@echo off
REM GYD Grup - Development ortamı
REM PocketBase + Vite dev server'ı birlikte başlatır

setlocal

echo.
echo ============================================
echo   GYD Grup - Development
echo ============================================
echo.

REM PocketBase'i arka planda başlat
echo [1/2] PocketBase baslatiliyor (port 8090)...
cd /d "%~dp0backend"
start "PocketBase" /min pocketbase.exe serve

REM Vite dev server'ı başlat
echo [2/2] Vite dev server baslatiliyor (port 5173)...
cd /d "%~dp0"
start "Vite" /min npm run dev

echo.
echo ============================================
echo   Servisler hazir:
echo   - Site:    http://localhost:5173
echo   - Admin:   http://localhost:5173/admin
echo   - PocketBase: http://localhost:8090/_/
echo ============================================
echo.
echo Kapatmak icin PocketBase ve Vite pencerelerini kapatabilirsiniz.
pause
