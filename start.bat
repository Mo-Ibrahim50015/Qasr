@echo off
title Qasr Al Otoor - Storefront & Admin
echo ===================================================
echo   Starting Qasr Al Otoor (قصر العطور) Platform
echo   Local URL: http://localhost:3000
echo   Admin URL: http://localhost:3000/admin
echo ===================================================
set PATH=E:\tools\nodejs;%PATH%
cd frontend
npm run dev
pause
