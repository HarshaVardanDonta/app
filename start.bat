@echo off
echo Starting development environment...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if ports are already in use
echo Checking if ports are available...
netstat -an | find ":8001" >nul
if not errorlevel 1 (
    echo WARNING: Port 8001 is already in use. Backend may not start properly.
    echo Run stop.bat first to kill existing servers.
    pause
)

netstat -an | find ":3000" >nul
if not errorlevel 1 (
    echo WARNING: Port 3000 is already in use. Frontend may not start properly.
    echo Run stop.bat first to kill existing servers.
    pause
)

REM Setup Python environment
echo Setting up Python environment...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
    echo Installing Python dependencies...
    pip install -r requirements.txt
) else (
    echo Virtual environment already exists, skipping setup...
    call venv\Scripts\activate.bat
)

cd ..

REM Setup Node.js environment
echo Setting up Node.js environment...
cd frontend
if not exist node_modules (
    echo Installing Node.js dependencies...
    if exist yarn.lock (
        yarn install
    ) else (
        npm install
    )
)
cd ..

REM Start backend
echo Starting backend server...
cd backend
call venv\Scripts\activate.bat
start "Backend Server" cmd /k "cd /d c:\Users\harsh\Documents\app\backend && call venv\Scripts\activate.bat && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend
echo Starting frontend server...
cd frontend

REM Check if dependencies are installed
if not exist node_modules (
    echo ERROR: Node modules not found. Please run the dependency installation first.
    cd ..
    pause
    exit /b 1
)

REM Start frontend with appropriate command
if exist yarn.lock (
    echo Checking if Yarn is available...
    yarn --version >nul 2>&1
    if not errorlevel 1 (
        echo Using Yarn to start frontend...
        start "Frontend Server" cmd /k "cd /d c:\Users\harsh\Documents\app\frontend && yarn start"
    ) else (
        echo Yarn not found, using NPM instead...
        start "Frontend Server" cmd /k "cd /d c:\Users\harsh\Documents\app\frontend && npm start"
    )
) else (
    echo Using NPM to start frontend...
    start "Frontend Server" cmd /k "cd /d c:\Users\harsh\Documents\app\frontend && npm start"
)
cd ..

echo.
echo Both servers are starting!
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
echo API Documentation: http://localhost:8001/docs
echo.
echo To stop the servers, run: stop.bat
echo.
echo Press any key to continue...
pause >nul
