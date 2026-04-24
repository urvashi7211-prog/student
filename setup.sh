#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# SRMS — Automated Setup Script (Linux/Mac)
# ═══════════════════════════════════════════════════════════════════════════
# This script automatically sets up the complete SRMS project
# Run: chmod +x setup.sh && ./setup.sh
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                  🎓 SRMS Setup - Student Resource Management System   ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌  Node.js is not installed!"
    echo "   Download from: https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✔  Node.js $NODE_VERSION found"

# Install database dependencies
echo ""
echo "[2/4] Installing database dependencies..."
cd database
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "❌  Failed to install database dependencies"
        exit 1
    fi
fi
echo "✔  Database dependencies installed"

# Install backend dependencies
echo ""
echo "[3/4] Installing backend dependencies..."
cd ../backend
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "❌  Failed to install backend dependencies"
        exit 1
    fi
fi
echo "✔  Backend dependencies installed"

# Check MongoDB connection and setup database
echo ""
echo "[4/4] Setting up MongoDB database..."
cd ../database

echo ""
echo "📡  Testing MongoDB connection..."
if ! npm run check > /dev/null 2>&1; then
    echo ""
    echo "❌  MongoDB is not running!"
    echo ""
    echo "💡  To start MongoDB:"
    echo "   • Mac: brew services start mongodb-community"
    echo "   • Linux: sudo systemctl start mongod"
    echo "   • Or manually: mongod"
    echo "   • Or open MongoDB Compass"
    echo ""
    exit 1
fi

echo "✔  MongoDB connected successfully"

echo ""
echo "📊  Creating database indexes..."
npm run index > /dev/null 2>&1

echo "✔  Indexes created"

echo ""
echo "🌱  Seeding sample data..."
npm run seed > /dev/null 2>&1

echo "✔  Sample data seeded"

# Summary
echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                     ✅ Setup Complete!                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Test Credentials:"
echo "   Admin   — admin@srms.com   / admin123"
echo "   Student — urvashi@srms.com / student123"
echo ""

echo "🚀 Next Steps:"
echo ""
echo "   1. Start Backend:"
echo "      • cd backend"
echo "      • npm run dev"
echo ""
echo "   2. Start Frontend (in new terminal):"
echo "      • cd frontend"
echo "      • npx http-server -p 3000"
echo ""
echo "   3. Open Browser:"
echo "      • Frontend: http://localhost:3000"
echo "      • API Health: http://localhost:5000/api/health"
echo ""

echo "📚 For detailed instructions, see SETUP_GUIDE.md"
echo ""
