# Receipt Processing Web App

An AI-powered web application for processing receipts using AWS Textract for OCR and data extraction.

## Features

- 📷 Upload receipts via drag-and-drop or camera capture
- 🤖 AI-powered text extraction using AWS Textract
- 📊 Structured data display in tables
- 📁 CSV export functionality
- 🎨 Modern UI with Ant Design
- ☁️ AWS S3 integration for file storage

## Project Structure

```
receipt-ifex/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
├── package.json       # Root package.json for scripts
└── README.md         # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
   - Fill in your AWS credentials and configuration

3. **Start development servers:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Environment Variables

### Backend (.env)
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
PORT=5000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

### Backend (AWS Lambda/EC2)
```bash
cd backend
npm run build
```

## Technologies Used

- **Frontend:** React.js, Ant Design, papaparse
- **Backend:** Node.js, Express, multer
- **AI/OCR:** AWS Textract
- **Storage:** AWS S3
- **File Processing:** multer, sharp (image processing)

## API Endpoints

- `POST /api/upload` - Upload receipt file
- `POST /api/process` - Process uploaded file with OCR
- `GET /api/health` - Health check

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request


