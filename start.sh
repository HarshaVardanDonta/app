#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill processes on a port
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use. Killing existing processes..."
        lsof -ti :$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to setup Python virtual environment
setup_python_env() {
    cd backend
    
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    cd ..
}

# Function to setup Node.js dependencies
setup_node_env() {
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        if command_exists yarn; then
            yarn install
        else
            npm install
        fi
    fi
    
    cd ..
}

# Function to start backend
start_backend() {
    print_status "Starting backend server..."
    cd backend
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Start the FastAPI server
    uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
    BACKEND_PID=$!
    
    cd ..
    
    # Wait a bit and check if backend started successfully
    sleep 3
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_success "Backend started successfully on http://localhost:8000"
    else
        print_error "Failed to start backend"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend server..."
    cd frontend
    
    # Start the React development server
    if command_exists yarn; then
        yarn start &
    else
        npm start &
    fi
    FRONTEND_PID=$!
    
    cd ..
    
    # Wait a bit and check if frontend started successfully
    sleep 5
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_success "Frontend started successfully on http://localhost:3000"
    else
        print_error "Failed to start frontend"
        exit 1
    fi
}

# Function to cleanup on exit
cleanup() {
    print_warning "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on the ports
    kill_port 8000
    kill_port 3000
    
    print_success "Cleanup completed"
    exit 0
}

# Trap SIGINT and SIGTERM to cleanup properly
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_status "Starting development environment..."
    
    # Check required commands
    if ! command_exists python3; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    if ! command_exists node; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Kill any existing processes on our ports
    kill_port 8000
    kill_port 3000
    
    # Setup environments
    print_status "Setting up environments..."
    setup_python_env
    setup_node_env
    
    # Start services
    start_backend
    start_frontend
    
    print_success "Both servers are running!"
    print_status "Backend: http://localhost:8000"
    print_status "Frontend: http://localhost:3000"
    print_status "API Documentation: http://localhost:8000/docs"
    print_warning "Press Ctrl+C to stop both servers"
    
    # Wait for user to stop the servers
    while true; do
        sleep 1
    done
}

# Run main function
main
