@echo off
echo 🚀 STARTING NEURAL CANVAS ENTERPRISE B2B SYSTEM
echo.
echo 💰 Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo 🎨 Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ✅ ENTERPRISE SYSTEM LAUNCHED!
echo.
echo 📊 Admin Dashboard: http://localhost:3000/admin
echo 🏢 Client Portal: http://localhost:3000/client  
echo 🔧 Backend API: http://localhost:3001
echo.
echo 🔑 Demo Login: admin@demo.com / demo123
echo.
pause