#!/bin/bash
# Script: deploy_frontend.sh
# This script builds the front end based on the given mode (development, test, or prod)
# and then starts an Alpine-based Apache container mounting the "dist" folder so that you can view the compiled files.
#
# Usage: ./deploy_frontend.sh [development|test|prod]

# Check if a mode parameter is provided
if [ -z "$1" ]; then
    echo "Usage: $0 [development|test|prod]"
    exit 1
fi

MODE="$1"
case "$MODE" in
    development)
        BUILD_CMD="npm run build:dev"
        ;;
    test)
        BUILD_CMD="npm run build:test"
        ;;
    prod)
        BUILD_CMD="npm run build:prod"
        ;;
    *)
        echo "Invalid mode. Choose one of: development, test, prod."
        exit 1
        ;;
esac

echo "Building front-end in $MODE mode..."
$BUILD_CMD
if [ $? -ne 0 ]; then
    echo "Build failed."
    exit 1
fi

echo "Starting Alpine-based Apache container with compiled files..."
docker run --rm -d -p 80:80 -v "$(pwd)/dist:/usr/local/apache2/htdocs" httpd:2.4-alpine
if [ $? -ne 0 ]; then
    echo "Docker run failed."
    exit 1
fi

echo "Deployment completed. Access your site at http://localhost"
