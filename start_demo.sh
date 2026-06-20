#!/bin/bash

# GuardianEye Demo Startup Script
# This script starts all services needed for the demo

echo "🎯 GuardianEye - Starting Demo Environment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo "1️⃣  Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB is not running. Starting...${NC}"
    brew services start mongodb-community 2>/dev/null || echo -e "${RED}❌ Please start MongoDB manually${NC}"
fi
echo ""

# Check backend dependencies
echo "2️⃣  Checking Backend..."
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend environment ready${NC}"
fi
echo ""

# Check frontend dependencies
echo "3️⃣  Checking Frontend..."
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Node modules not found. Installing...${NC}"
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies ready${NC}"
fi
echo ""

# Instructions for starting services
echo "=========================================="
echo -e "${GREEN}✅ All dependencies are ready!${NC}"
echo ""
echo "📝 To start the demo, open 2 terminal windows:"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "🌐 Access URLs:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "🎬 You're ready to demo! Good luck! 🚀"
echo "=========================================="
