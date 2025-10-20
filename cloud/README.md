# Cloud Deployment Guide

This directory contains all the necessary files for deploying the Receipt Processing application using Docker.

## 📋 Prerequisites

- Docker (20.10+)
- Docker Compose (1.29+)
- 2GB+ available RAM
- 5GB+ available disk space

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment example file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your specific configuration:
- `BACKEND_PORT`: Port for backend API (default: 5001)
- `FRONTEND_PORT`: Port for frontend web app (default: 3000)
- `REACT_APP_API_URL`: Full URL to backend API
- `FRONTEND_URL`: Full URL to frontend (used by backend CORS)

### 2. Build and Start

From the `cloud` directory:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## 🛠️ Management Commands

### Start/Stop Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

## 🌐 Production Deployment

### Option 1: VPS/Cloud Server (Recommended)

1. **Prepare Server** (Ubuntu/Debian):
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone Repository**:
   ```bash
   git clone <your-repo-url>
   cd Receipt-Process/cloud
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your production values
   ```

4. **Deploy**:
   ```bash
   docker-compose up -d
   ```

5. **Setup Reverse Proxy** (Optional but recommended):
   Use Nginx or Caddy for SSL/TLS:
   ```nginx
   # Example Nginx config
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api {
           proxy_pass http://localhost:5001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Option 2: Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml receipt-app
```

### Option 3: Kubernetes

See `k8s/` directory for Kubernetes manifests (if you need K8s deployment, let me know).

## 📊 Monitoring

### Health Checks

Both services have built-in health checks:

```bash
# Check backend health
curl http://localhost:5001/api/health

# Check container health status
docker ps
```

### Resource Usage

```bash
# View resource usage
docker stats

# View specific service
docker stats receipt-processor-backend
```

## 🔧 Troubleshooting

### Service Won't Start

1. Check logs:
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. Check port availability:
   ```bash
   netstat -tuln | grep 5001
   netstat -tuln | grep 3000
   ```

3. Verify environment variables:
   ```bash
   docker-compose config
   ```

### Out of Memory

Increase Docker memory limit or optimize services:
```bash
# Check memory usage
docker stats

# Restart with more memory
docker-compose down
docker-compose up -d
```

### Permission Issues

```bash
# Fix volume permissions
docker-compose down
sudo chown -R $USER:$USER ../uploads
docker-compose up -d
```

## 🔒 Security Best Practices

1. **Use environment variables** for sensitive data
2. **Enable firewall** on production servers
3. **Keep Docker updated** regularly
4. **Use SSL/TLS** with reverse proxy
5. **Regular backups** of uploads volume
6. **Monitor logs** for suspicious activity
7. **Limit resource usage** with Docker limits

## 📦 Backup & Restore

### Backup Uploads

```bash
# Create backup
docker run --rm -v receipt-uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz -C /data .

# Restore backup
docker run --rm -v receipt-uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup-YYYYMMDD.tar.gz -C /data
```

## 🆘 Support

For issues or questions:
1. Check application logs
2. Verify environment configuration
3. Review Docker logs
4. Check server resources

## 📝 Notes

- Default ports: Backend (5001), Frontend (3000)
- Data persists in named volume `receipt-uploads`
- Frontend is served via Nginx for optimal performance
- Backend uses Node.js with built-in Tesseract OCR

