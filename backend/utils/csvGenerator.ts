import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

interface Product {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Summary {
  subtotal: number;
  vat: number;
  deliveryCharge: number;
  discount: number;
  total: number;
}

interface ReceiptData {
  products: Product[];
  summary: Summary;
  receiptId?: string;
  receiptName?: string;
}

interface CSVRow {
  receiptId: string;
  receiptName: string;
  productName: string;
  quantity: number | string;
  unitPrice: number;
  total: number;
  vat: string | number;
  deliveryCharge: string | number;
  discount: string | number;
  subtotal: number;
  grandTotal: number;
}

/**
 * Generate CSV file from receipt data
 * @param data - Receipt data object
 * @param filename - Output filename (without extension)
 * @returns Path to generated CSV file
 */
async function generateCSV(data: ReceiptData, filename: string = 'receipt-data'): Promise<string> {
  const outputPath = path.join('/tmp', `${filename}.csv`);
  
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'receiptId', title: 'Receipt ID' },
      { id: 'receiptName', title: 'Receipt Name' },
      { id: 'productName', title: 'Product Name' },
      { id: 'quantity', title: 'Quantity' },
      { id: 'unitPrice', title: 'Unit Price' },
      { id: 'total', title: 'Total' },
      { id: 'vat', title: 'VAT' },
      { id: 'deliveryCharge', title: 'Delivery Charge' },
      { id: 'discount', title: 'Discount' },
      { id: 'subtotal', title: 'Subtotal' },
      { id: 'grandTotal', title: 'Grand Total' }
    ]
  });

  // Prepare data for CSV
  const csvData: CSVRow[] = [];
  
  if (data.products && data.products.length > 0) {
    data.products.forEach((product, index) => {
      csvData.push({
        receiptId: data.receiptId || 'N/A',
        receiptName: data.receiptName || 'N/A',
        productName: product.productName || 'N/A',
        quantity: product.quantity || 1,
        unitPrice: product.unitPrice || 0,
        total: product.total || 0,
        vat: (data.summary.vat / data.products.length).toFixed(2),
        deliveryCharge: (data.summary.deliveryCharge / data.products.length).toFixed(2),
        discount: (data.summary.discount / data.products.length).toFixed(2),
        subtotal: data.summary.subtotal || 0,
        grandTotal: data.summary.total || 0
      });
    });
  }

  // Add summary row
  csvData.push({
    receiptId: data.receiptId || 'N/A',
    receiptName: data.receiptName || 'N/A',
    productName: 'SUMMARY',
    quantity: '',
    unitPrice: 0,
    total: 0,
    vat: data.summary.vat || 0,
    deliveryCharge: data.summary.deliveryCharge || 0,
    discount: data.summary.discount || 0,
    subtotal: data.summary.subtotal || 0,
    grandTotal: data.summary.total || 0
  });

  await csvWriter.writeRecords(csvData);
  return outputPath;
}

/**
 * Read CSV file content
 * @param filePath - Path to CSV file
 * @returns CSV content
 */
function readCSVContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Clean up temporary CSV file
 * @param filePath - Path to CSV file
 */
function cleanupCSV(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn('Failed to cleanup CSV file:', error);
  }
}

export {
  generateCSV,
  readCSVContent,
  cleanupCSV
};

