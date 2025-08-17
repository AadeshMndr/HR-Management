#!/bin/bash

# Script to start the entire HR Management application

echo "🚀 Starting HR Management Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm > /dev/null 2>&1; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    exit 1
fi

echo "🗄️  Starting Database..."
cd database
docker compose up -d
cd ..
echo "✅ Database started on localhost:5432"
echo "🔍 Database admin panel available on http://localhost:8080"

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    pnpm install
fi

# Install frontend dependencies  
echo "Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    pnpm install
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start backend: cd backend && pnpm start"
echo "2. Start frontend: cd frontend && pnpm start"
echo ""
echo "Application URLs:"
echo "📱 Frontend: http://localhost:3000 (after starting)"
echo "🔧 Backend API: http://localhost:5000 (after starting)"
echo "🗄️  Database Admin: http://localhost:8080"
echo ""
echo "To stop the database, run: ./stop-app.sh"
