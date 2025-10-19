import express, { Request, Response } from 'express';
import { processReceiptImage } from '../utils/freeOcr';
import { generateCSV, readCSVContent, cleanupCSV } from '../utils/csvGenerator';
import fs from 'fs';
import path from 'path';

const router = express.Router();

interface ProcessRequest {
  filePath: string;
  receiptName?: string;
}

interface CSVRequest {
  data: {
    products: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    summary: {
      subtotal: number;
      vat: number;
      deliveryCharge: number;
      discount: number;
      total: number;
    };
    receiptId: string;
    receiptName: string;
  };
  filename?: string;
}

/**
 * Process uploaded receipt with free OCR
 */
router.post('/', async (req: Request<{}, {}, ProcessRequest>, res: Response): Promise<void> => {
  try {
    const { filePath, receiptName } = req.body;

    if (!filePath) {
      res.status(400).json({
        success: false,
        message: 'File path is required'
      });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }

    console.log('Processing receipt with free OCR...');
    
    // Process the receipt image
    const result = await processReceiptImage(filePath);
    
    if (!result.success) {
      res.status(500).json({
        success: false,
        message: 'Failed to process receipt'
      });
      return;
    }

    // Clean up the uploaded file (optional)
    if (process.env.CLEANUP_UPLOADS === 'true') {
      try {
        fs.unlinkSync(filePath);
        console.log('Cleaned up uploaded file:', filePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError);
      }
    }

    res.json({
      success: true,
      message: 'Receipt processed successfully',
      data: result.data,
      provider: 'tesseract',
      extractedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process receipt',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * Generate CSV from processed data
 */
router.post('/csv', async (req: Request<{}, {}, CSVRequest>, res: Response): Promise<void> => {
  try {
    const { data, filename } = req.body;

    if (!data || !data.products) {
      res.status(400).json({
        success: false,
        message: 'Invalid data provided'
      });
      return;
    }

    // Generate unique filename if not provided
    const csvFilename = filename || `${data.receiptName || 'receipt'}_${data.receiptId}`;
    
    // Generate CSV file
    const csvPath = await generateCSV(data, csvFilename);
    
    // Read CSV content
    const csvContent = readCSVContent(csvPath);
    
    // Clean up temporary file
    cleanupCSV(csvPath);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${csvFilename}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('CSV generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSV',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * Process and generate CSV in one step
 */
router.post('/process-and-csv', async (req: Request<{}, {}, ProcessRequest>, res: Response): Promise<void> => {
  try {
    const { filePath, receiptName } = req.body;

    if (!filePath) {
      res.status(400).json({
        success: false,
        message: 'File path is required'
      });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }

    console.log('Processing receipt and generating CSV...');
    
    // Process the receipt image
    const result = await processReceiptImage(filePath);
    
    if (!result.success) {
      res.status(500).json({
        success: false,
        message: 'Failed to process receipt'
      });
      return;
    }

    // Generate CSV filename
    const csvFilename = receiptName || result.data.receiptName || 'receipt';
    
    // Generate CSV file
    const csvPath = await generateCSV(result.data, csvFilename);
    
    // Read CSV content
    const csvContent = readCSVContent(csvPath);
    
    // Clean up temporary files
    cleanupCSV(csvPath);
    
    if (process.env.CLEANUP_UPLOADS === 'true') {
      try {
        fs.unlinkSync(filePath);
        console.log('Cleaned up uploaded file:', filePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError);
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${csvFilename}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Process and CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process receipt and generate CSV',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * Get processing status (for async processing)
 */
router.get('/status/:jobId', (req: Request, res: Response) => {
  // This would be implemented with a job queue system like Bull or Agenda
  // For now, return a simple response
  res.json({
    success: true,
    message: 'Processing status endpoint',
    jobId: req.params.jobId,
    status: 'completed' // This would be dynamic in a real implementation
  });
});

export default router;
