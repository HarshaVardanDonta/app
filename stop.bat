@echo off
echo Stopping development servers...
echo.

REM Kill backend (port 8001)
echo [1/4] Stopping backend server (port 8001)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8001" 2^>nul') do (
    echo     Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill frontend (port 3000)
echo [2/4] Stopping frontend server (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" 2^>nul') do (
    echo     Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill any uvicorn processes
echo [3/4] Stopping uvicorn processes...
taskkill /f /im "python.exe" /fi "WINDOWTITLE eq Backend Server*" >nul 2>&1

REM Kill any Node.js processes with our project name
echo [4/4] Stopping Node.js processes...
taskkill /f /im "node.exe" /fi "WINDOWTITLE eq Frontend Server*" >nul 2>&1

REM Alternative method using wmic for more specific process killing
echo Cleaning up remaining processes...
wmic process where "CommandLine like '%%uvicorn%%server:app%%'" delete >nul 2>&1
wmic process where "CommandLine like '%%craco start%%'" delete >nul 2>&1
wmic process where "CommandLine like '%%react-scripts start%%'" delete >nul 2>&1

echo.
echo ✓ All development servers stopped successfully!
echo.
echo You can now run start.bat to restart the servers.
echo.
pause
