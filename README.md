# Receipt Processing Web App

A professional receipt processing application with OCR capabilities using Tesseract.js. Features a modern React frontend and robust Node.js backend, fully containerized with Docker for easy deployment.

## ✨ Features

- 📷 Upload receipts via drag-and-drop or camera capture
- 🤖 AI-powered text extraction using Tesseract OCR
- 📊 Structured data display in interactive tables
- 📁 CSV export functionality
- 🎨 Modern, responsive UI with Ant Design
- 🐳 Docker-ready for production deployment
- 🔒 Security-first with Helmet and rate limiting
- 📈 Health checks and monitoring

## 📁 Project Structure

```
Receipt-Process/
├── backend/              # Node.js/Express backend API
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (OCR, CSV generation)
│   ├── middleware/      # Error handling middleware
│   ├── Dockerfile       # Backend container configuration
│   └── server.ts        # Main server file
├── frontend/            # React frontend application
│   ├── src/
│   │   └── components/  # React components
│   ├── Dockerfile       # Frontend container configuration
│   └── nginx.conf       # Nginx configuration for production
├── cloud/               # Deployment & orchestration
│   ├── docker-compose.yml
│   ├── .env.example
│   └── README.md        # Detailed deployment guide
└── uploads/             # Receipt file storage
```

## 🚀 Quick Start

### Option 1: Docker (Recommended for Production)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Receipt-Process
   ```

2. **Deploy with Docker:**
   ```bash
   cd cloud
   cp .env.example .env
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Health Check: http://localhost:5001/api/health

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Set up environment:**
   ```bash
   # Backend
   cd backend
   cp env.example .env
   
   # Frontend
   cd ../frontend
   cp env.example .env
   ```

3. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🐳 Docker Deployment

For detailed deployment instructions, monitoring, troubleshooting, and production best practices, see the **[Cloud Deployment Guide](./cloud/README.md)**.

### Quick Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## 🛠️ Technologies

### Frontend
- React.js 18
- TypeScript
- Ant Design
- PapaParse (CSV handling)
- Tailwind CSS

### Backend
- Node.js 18
- Express.js
- TypeScript
- Tesseract.js (OCR)
- Multer (file uploads)
- Helmet (security)
- Express Rate Limit

### Infrastructure
- Docker & Docker Compose
- Nginx (frontend serving)
- Multi-stage builds for optimization

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| POST | `/api/upload` | Upload receipt file |
| POST | `/api/process` | Process uploaded file with OCR |

## 🔒 Security Features

- Helmet.js for HTTP headers security
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation
- Non-root Docker containers
- Security headers in Nginx

## 📊 Monitoring

### Health Checks

Both services include automated health checks:

```bash
# Backend health
curl http://localhost:5001/api/health

# Container health status
docker ps
```

### Logs

```bash
# View all logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🌐 Production Deployment

See the [Cloud Deployment Guide](./cloud/README.md) for:
- VPS/Cloud server setup
- SSL/TLS configuration
- Reverse proxy setup
- Backup strategies
- Monitoring solutions
- Security best practices

## 🧹 Development

### Code Structure

- **Backend:** TypeScript with Express.js, follows MVC pattern
- **Frontend:** React with TypeScript, component-based architecture
- **Middleware:** Centralized error handling
- **Utils:** Reusable OCR and CSV generation utilities

### Building

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.


