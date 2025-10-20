#!/bin/bash

echo "Starting Kechita Intelligence Platform (Production)..."

cd backend
echo "Starting backend on port 8000..."
python main.py &
BACKEND_PID=$!

cd ../frontend
echo "Building frontend..."
npm run build

echo "Serving frontend on port 5000..."
npx serve -s dist -l 5000

kill $BACKEND_PID 2>/dev/null
