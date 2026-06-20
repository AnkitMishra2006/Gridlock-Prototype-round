#!/bin/bash

# GuardianEye - Start All Services
# This script starts all three components of the system

echo "🚀 GuardianEye - Starting All Services"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Check MongoDB
echo "1️⃣  Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  Starting MongoDB...${NC}"
    brew services start mongodb-community 2>/dev/null || {
        echo -e "${RED}❌ Could not start MongoDB. Please start it manually.${NC}"
    }
fi
echo ""

# Check if ports are available
echo "2️⃣  Checking ports..."
if check_port 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 (Backend) is already in use${NC}"
else
    echo -e "${GREEN}✅ Port 8000 is available${NC}"
fi

if check_port 5173; then
    echo -e "${YELLOW}⚠️  Port 5173 (Frontend) is already in use${NC}"
else
    echo -e "${GREEN}✅ Port 5173 is available${NC}"
fi
echo ""

echo "======================================"
echo "📝 To start all services, open 2 terminals:"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend (Embedded AI):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "======================================"
echo "🌐 Access URLs:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
echo "  Docs:      http://localhost:8000/docs"
echo ""
echo "🧪 Test the pipeline:"
echo "  python3 test_pipeline.py"
echo ""
echo "======================================"
