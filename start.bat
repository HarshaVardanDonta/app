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

REM Setup Python environment
echo Setting up Python environment...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

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
start "Backend Server" cmd /k "uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend
echo Starting frontend server...
cd frontend
if exist yarn.lock (
    start "Frontend Server" cmd /k "yarn start"
) else (
    start "Frontend Server" cmd /k "npm start"
)
cd ..

echo.
echo Both servers are starting!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press any key to continue...
pause >nul
