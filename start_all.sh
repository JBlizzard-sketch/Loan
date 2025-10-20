#!/bin/bash

echo "Starting Kechita Intelligence Platform..."

cd backend
echo "Starting backend on port 8000..."
python main.py &
BACKEND_PID=$!

cd ../frontend
echo "Starting frontend on port 5000..."
npm run dev

kill $BACKEND_PID 2>/dev/null
