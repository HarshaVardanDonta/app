#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to kill processes on a port
kill_port() {
    if lsof -i :$1 >/dev/null 2>&1; then
        print_warning "Killing processes on port $1..."
        lsof -ti :$1 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

print_status "Stopping development servers..."

# Kill backend (port 8000)
kill_port 8001

# Kill frontend (port 3000)
kill_port 3000

# Kill any uvicorn processes
pkill -f "uvicorn.*server:app" 2>/dev/null || true

# Kill any node processes related to our project
pkill -f "craco start" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

print_success "All development servers stopped"
