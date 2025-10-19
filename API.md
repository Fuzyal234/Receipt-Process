# API Documentation

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://your-api-domain.com/api`

## Authentication

Currently, no authentication is required. For production, consider implementing API keys or JWT tokens.

## Endpoints

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "success": true,
  "message": "Receipt Processing API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### File Upload

**POST** `/upload`

Upload a receipt file to S3.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `receipt` field containing the file

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "key": "receipts/uuid-filename.jpg",
    "location": "https://bucket.s3.region.amazonaws.com/receipts/uuid-filename.jpg",
    "originalName": "receipt.jpg",
    "size": 1024000,
    "contentType": "image/jpeg",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB.",
  "code": "FILE_TOO_LARGE"
}
```

### Multiple File Upload

**POST** `/upload/multiple`

Upload multiple receipt files.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `receipts` field containing multiple files (max 5)

**Response:**
```json
{
  "success": true,
  "message": "3 files uploaded successfully",
  "files": [
    {
      "key": "receipts/uuid1-filename1.jpg",
      "location": "https://bucket.s3.region.amazonaws.com/receipts/uuid1-filename1.jpg",
      "originalName": "receipt1.jpg",
      "size": 1024000,
      "contentType": "image/jpeg",
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Process Receipt

**POST** `/process`

Process an uploaded receipt with AWS Textract OCR.

**Request:**
```json
{
  "s3Key": "receipts/uuid-filename.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Receipt processed successfully",
  "data": {
    "products": [
      {
        "productName": "Coffee",
        "quantity": 2,
        "unitPrice": 3.50,
        "total": 7.00
      }
    ],
    "summary": {
      "subtotal": 7.00,
      "vat": 0.70,
      "deliveryCharge": 2.00,
      "total": 9.70
    },
    "merchantInfo": {
      "name": "Coffee Shop",
      "address": "123 Main St",
      "phone": "555-0123"
    },
    "receiptDate": "2024-01-01"
  },
  "extractedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Failed to process receipt",
  "error": "Invalid file format for OCR processing.",
  "code": "INVALID_FILE_FORMAT"
}
```

### Generate CSV

**POST** `/process/csv`

Generate and download a CSV file from processed receipt data.

**Request:**
```json
{
  "data": {
    "products": [...],
    "summary": {...}
  },
  "filename": "receipt-data-2024-01-01"
}
```

**Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="receipt-data-2024-01-01.csv"`
- Body: CSV file content

### Processing Status

**GET** `/process/status/:jobId`

Get the status of an async processing job.

**Response:**
```json
{
  "success": true,
  "message": "Processing status endpoint",
  "jobId": "job-123",
  "status": "completed"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `FILE_TOO_LARGE` | File exceeds maximum size limit |
| `UNEXPECTED_FILE` | Invalid file field in request |
| `TOO_MANY_FILES` | Exceeds maximum file count |
| `S3_BUCKET_NOT_FOUND` | S3 bucket doesn't exist |
| `AWS_ACCESS_DENIED` | AWS credentials insufficient |
| `INVALID_FILE_FORMAT` | File format not supported for OCR |
| `INTERNAL_ERROR` | Unexpected server error |

## Rate Limiting

- 100 requests per 15 minutes per IP address
- File uploads: 10MB maximum per file
- Multiple uploads: 5 files maximum per request

## Supported File Types

- Images: JPEG, JPG, PNG
- Documents: PDF
- Maximum file size: 10MB

## Data Structure

### Product Object
```typescript
interface Product {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

### Summary Object
```typescript
interface Summary {
  subtotal: number;
  vat: number;
  deliveryCharge: number;
  total: number;
}
```

### Merchant Info Object
```typescript
interface MerchantInfo {
  name: string;
  address: string;
  phone: string;
}
```

## Example Usage

### Complete Workflow

1. **Upload file:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "receipt=@/path/to/receipt.jpg"
```

2. **Process receipt:**
```bash
curl -X POST http://localhost:5000/api/process \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "receipts/uuid-filename.jpg"}'
```

3. **Download CSV:**
```bash
curl -X POST http://localhost:5000/api/process/csv \
  -H "Content-Type: application/json" \
  -d '{"data": {...}, "filename": "receipt-data"}' \
  --output receipt-data.csv
```

## Testing

Use the provided Postman collection or test with curl commands:

```bash
# Health check
curl http://localhost:5000/api/health

# Upload test
curl -X POST http://localhost:5000/api/upload \
  -F "receipt=@test-receipt.jpg"

# Process test
curl -X POST http://localhost:5000/api/process \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "receipts/test-file.jpg"}'
```


