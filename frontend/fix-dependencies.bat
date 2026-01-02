@echo off
echo Cleaning node_modules and reinstalling dependencies...
echo.
echo Step 1: Removing node_modules...
rmdir /s /q node_modules 2>nul
echo.
echo Step 2: Removing package-lock.json...
del /f /q package-lock.json 2>nul
echo.
echo Step 3: Clearing npm cache...
call npm cache clean --force
echo.
echo Step 4: Installing dependencies...
call npm install
echo.
echo Done! You can now run: npm run dev
pause
