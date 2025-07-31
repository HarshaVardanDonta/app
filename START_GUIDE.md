# Development Server Startup Guide

This guide explains how to start the backend and frontend development servers for the blockchain banking application.

## Quick Start

### Option 1: Using the Start Script (Recommended)

**For macOS/Linux:**
```bash
./start.sh
```

**For Windows:**
```cmd
start.bat
```

### Option 2: Using npm scripts
```bash
npm run start
# or
npm run dev
```

### Option 3: Manual startup
```bash
# Backend
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate.bat
uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Frontend (in another terminal)
cd frontend
yarn start
```

## What the Start Script Does

1. **Environment Check**: Verifies Python 3 and Node.js are installed
2. **Dependency Installation**: 
   - Creates Python virtual environment (if not exists)
   - Installs Python packages from `requirements.txt`
   - Installs Node.js packages using yarn/npm
3. **Server Startup**:
   - Starts FastAPI backend on `http://localhost:8000`
   - Starts React frontend on `http://localhost:3000`
4. **Cleanup**: Properly shuts down both servers when interrupted (Ctrl+C)

## Available URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## Stopping the Servers

### Option 1: Interrupt the start script
If you used the start script, simply press `Ctrl+C` in the terminal

### Option 2: Use the stop script
```bash
./stop.sh
```

### Option 3: Manual stop
```bash
# Kill processes on specific ports
lsof -ti :8000 | xargs kill -9  # Backend
lsof -ti :3000 | xargs kill -9  # Frontend
```

## Troubleshooting

### Port Already in Use
The start script automatically kills any existing processes on ports 8000 and 3000 before starting new ones.

### Python Virtual Environment Issues
```bash
# Delete and recreate the virtual environment
rm -rf backend/venv
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node.js Dependencies Issues
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json yarn.lock
yarn install  # or npm install
```

### Backend Not Starting
1. Check if Python 3 is installed: `python3 --version`
2. Ensure all dependencies are installed: `pip install -r backend/requirements.txt`
3. Check for any missing environment variables in `backend/.env`

### Frontend Not Starting
1. Check if Node.js is installed: `node --version`
2. Ensure dependencies are installed: `yarn install` or `npm install`
3. Check for any syntax errors in the frontend code

## Development Commands

```bash
# Install all dependencies
npm run install:all

# Install only backend dependencies
npm run install:backend

# Install only frontend dependencies  
npm run install:frontend

# Start only backend
npm run backend

# Start only frontend
npm run frontend

# Build frontend for production
npm run build:frontend

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend
```

## Requirements

- **Python 3.8+**
- **Node.js 16+**
- **yarn** (recommended) or **npm**

## First Time Setup

1. Clone the repository
2. Run the start script: `./start.sh`
3. The script will automatically set up environments and install dependencies
4. Both servers will start automatically

That's it! The application should now be running locally.
