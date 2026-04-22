#!/bin/bash

echo "======================================"
echo "  BillApp - Starting All Services"
echo "======================================"

# Start backend
echo ""
echo "► Starting Spring Boot backend..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "  Waiting for backend to start (15s)..."
sleep 15

# Start frontend
echo ""
echo "► Starting React frontend..."
cd ../frontend
npm install --silent
npm start &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "======================================"
echo "  ✅ BillApp is running!"
echo "  Backend:  http://localhost:8080"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  Login: admin / admin123"
echo "======================================"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait and cleanup on exit
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
