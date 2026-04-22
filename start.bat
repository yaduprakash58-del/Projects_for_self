@echo off
echo ======================================
echo   BillApp - Starting All Services
echo ======================================

echo.
echo Starting Spring Boot backend...
cd backend
start "BillApp Backend" cmd /k "mvn spring-boot:run"

echo Waiting for backend to start (15 seconds)...
timeout /t 15 /nobreak

echo.
echo Starting React frontend...
cd ..\frontend
start "BillApp Frontend" cmd /k "npm install && npm start"

echo.
echo ======================================
echo   BillApp is running!
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:3000
echo.
echo   Login: admin / admin123
echo ======================================
pause
