#!/bin/bash
# Prepare App Runner - SEOGrid Project
# Starts both frontend (Vite) and backend (Express) in development mode
set -e

echo "🚀 Preparing SEOGrid application..."

# Check if frontend dependencies are installed
if [ ! -d "main/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd main/frontend && yarn install && cd ../..
fi

# Check if backend dependencies are installed
if [ ! -d "main/api/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd main/api && yarn install && cd ../..
fi

echo "✓ Dependencies installed"

# Start both frontend and backend in background
# IMPORTANT: Must cd into each directory first so yarn dev can source .env.dev files
echo "🎯 Starting frontend (Vite)..."
(cd main/frontend && yarn dev) &
FRONTEND_PID=$!

echo "🎯 Starting backend (Express API)..."
(cd main/api && yarn dev) &
BACKEND_PID=$!

# Store PIDs for cleanup
echo "$FRONTEND_PID" > /tmp/seogrid-frontend.pid
echo "$BACKEND_PID" > /tmp/seogrid-backend.pid

echo ""
echo "✅ Application prepared and running:"
echo "   Frontend PID: $FRONTEND_PID"
echo "   Backend PID:  $BACKEND_PID"
echo ""
echo "📝 Logs are being written to:"
echo "   Frontend: log-frontend.log"
echo "   Backend:  log-api.log"
echo ""
echo "⚠️  To stop the application, run:"
echo "   kill $FRONTEND_PID $BACKEND_PID"

# Keep script running
wait
