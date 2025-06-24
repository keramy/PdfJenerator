@echo off
echo Starting local web server for Jewelry Work Order System...
echo.
echo After the server starts, open your browser and go to:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the server when done.
echo.
python -m http.server 8000
pause