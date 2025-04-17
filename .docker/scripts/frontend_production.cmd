@echo off
REM Script: deploy_frontend.cmd
REM Usage: deploy_frontend.cmd [development|test|prod]
REM This script builds the front end based on the given mode and then starts an Alpine-based Apache container mounting the "dist" folder.

REM Check if a mode parameter is provided
if "%~1"=="" (
    echo Usage: %~nx0 [development^|test^|prod]
    exit /b 1
)
set "MODE=%~1"

REM Determine the build command based on the mode (case-insensitive)
if /I "%MODE%"=="development" (
    set "BUILD_CMD=npm run build:dev"
) else if /I "%MODE%"=="test" (
    set "BUILD_CMD=npm run build:test"
) else if /I "%MODE%"=="prod" (
    set "BUILD_CMD=npm run build:prod"
) else (
    echo Invalid mode. Choose one of: development, test, prod.
    exit /b 1
)

echo Building front-end in %MODE% mode...
%BUILD_CMD%
if errorlevel 1 (
    echo Build failed.
    exit /b 1
)

echo Starting Alpine-based Apache container with compiled files...
docker run --rm -d -p 80:80 -v "%cd%\dist:/usr/local/apache2/htdocs" httpd:2.4-alpine
if errorlevel 1 (
    echo Docker run failed.
    exit /b 1
)

echo Deployment completed. Access your site at http://localhost
pause
