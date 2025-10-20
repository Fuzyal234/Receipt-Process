#!/bin/bash

# Receipt Processing App - Docker Deployment Script
# This script helps deploy the application using Docker

set -e  # Exit on error

echo "🐳 Receipt Processing App - Docker Deployment"
echo "=============================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker version: $(docker --version)"
echo "✅ Docker Compose version: $(docker-compose --version)"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding."
    echo ""
    read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
fi

echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📱 Access your application at:"
    echo "   Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    echo "   Backend:  http://localhost:${BACKEND_PORT:-5001}"
    echo "   Health:   http://localhost:${BACKEND_PORT:-5001}/api/health"
    echo ""
    echo "📊 View logs with: docker-compose logs -f"
    echo "🛑 Stop services with: docker-compose down"
else
    echo ""
    echo "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi

