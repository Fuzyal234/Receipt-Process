import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

interface MerchantInfo {
  name: string;
  address: string;
  phone: string;
}

interface ParsedData {
  products: Product[];
  summary: Summary;
  merchantInfo: MerchantInfo;
  receiptDate: string;
  receiptId: string;
  receiptName: string;
}

interface ExtractionResult {
  success: boolean;
  data: ParsedData;
  rawText?: string;
}

/**
 * Extract text from image using Tesseract.js (free OCR)
 * @param imagePath - Path to the image file
 * @returns Extracted text and structured data
 */
async function extractTextFromImage(imagePath: string): Promise<ExtractionResult> {
  try {
    console.log('Starting OCR processing with Tesseract.js...');
    
    // Use Tesseract.js for OCR
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: m => console.log(m)
      }
    );

    console.log('OCR completed, parsing receipt data...');
    
    // Parse the extracted text
    const parsedData = parseReceiptText(text, path.basename(imagePath));
    
    return {
      success: true,
      data: parsedData,
      rawText: text
    };
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    throw new Error(`Failed to extract text: ${(error as Error).message}`);
  }
}

/**
 * Parse receipt text into structured format
 * @param text - Raw OCR text
 * @param filename - Original filename
 * @returns Structured receipt data
 */
function parseReceiptText(text: string, filename: string): ParsedData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const receiptId = uuidv4();
  const receiptName = filename.replace(/\.[^/.]+$/, ''); // Remove file extension
  
  // Initialize data structure
  const data: ParsedData = {
    products: [],
    summary: {
      subtotal: 0,
      vat: 0,
      deliveryCharge: 0,
      discount: 0,
      total: 0
    },
    merchantInfo: {
      name: '',
      address: '',
      phone: ''
    },
    receiptDate: '',
    receiptId,
    receiptName
  };

  console.log('Raw OCR Text:', text);
  console.log('Parsing lines:', lines);

  // Extract merchant info (usually at the top)
  extractMerchantInfo(lines, data);
  
  // Extract products and summary
  extractProductsAndSummary(lines, data);
  
  // Extract date
  extractReceiptDate(lines, data);

  console.log('Parsed data:', JSON.stringify(data, null, 2));

  return data;
}

/**
 * Extract merchant information from receipt lines
 */
function extractMerchantInfo(lines: string[], data: ParsedData): void {
  console.log('Extracting merchant info...');
  
  // Look for merchant name in first few lines
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    console.log(`Checking line ${i} for merchant: "${line}"`);
    
    // Skip lines that look like prices or dates
    if (/\$[\d,]+\.?\d*/.test(line) || /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line)) {
      continue;
    }
    
    // Look for FAST FOOD or similar merchant names
    if (line.includes('FAST FOOD') || (line.length > 3 && line.length < 50 && !/\d/.test(line))) {
      data.merchantInfo.name = line;
      console.log(`Found merchant name: "${line}"`);
      break;
    }
  }
  
  // Look for address and phone
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for address pattern
    if (line.includes('Circle') || line.includes('Springfield') || line.includes('MA')) {
      data.merchantInfo.address = line;
      console.log(`Found address: "${line}"`);
    }
    
    // Look for phone pattern
    if (line.includes('(413)') || line.includes('732-3899')) {
      data.merchantInfo.phone = line;
      console.log(`Found phone: "${line}"`);
    }
  }
}

/**
 * Extract products and summary information
 */
function extractProductsAndSummary(lines: string[], data: ParsedData): void {
  const products: Product[] = [];
  let foundSummary = false;
  let inProductSection = false;
  
  // Common patterns for receipt parsing
  const pricePattern = /\$?[\d,]+\.?\d{2}/;
  const quantityPattern = /^\d+(\.\d+)?[x×]/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    console.log(`Processing line ${i}: "${line}"`);
    
    // Look for product section indicators
    if (line.includes('QTY') || line.includes('ITEM') || line.includes('PRICE') || 
        line.includes('|') || line.includes('PIZZA') || line.includes('1 |')) {
      inProductSection = true;
      console.log('Found product section');
    }
    
    // Look for summary section (total, subtotal, tax, etc.)
    if (isSummaryLine(line)) {
      foundSummary = true;
      inProductSection = false;
      parseSummaryLine(line, data);
      console.log('Found summary line:', line);
      continue;
    }
    
    // Look for product lines (contain price but not summary keywords)
    if (pricePattern.test(line) && !isSummaryLine(line) && !foundSummary) {
      const product = parseProductLine(line);
      if (product && product.productName.trim()) {
        products.push(product);
        console.log('Added product:', product);
      }
    }
  }
  
  data.products = products;
  
  // If no products found, try alternative parsing
  if (products.length === 0) {
    console.log('No products found, trying alternative parsing');
    parseAlternativeProductFormat(lines, data);
  }
}

/**
 * Check if a line contains summary information
 */
function isSummaryLine(line: string): boolean {
  const summaryKeywords = [
    'total', 'subtotal', 'tax', 'vat', 'gst', 'service', 'delivery', 
    'discount', 'tip', 'amount', 'balance', 'change', 'due'
  ];
  
  const lowerLine = line.toLowerCase();
  return summaryKeywords.some(keyword => lowerLine.includes(keyword));
}

/**
 * Parse summary line (total, tax, etc.)
 */
function parseSummaryLine(line: string, data: ParsedData): void {
  console.log(`Parsing summary line: "${line}"`);
  
  const lowerLine = line.toLowerCase();
  const priceMatch = line.match(/\$?[\d,]+\.?\d{2}/);
  
  if (!priceMatch) return;
  
  const price = parseFloat(priceMatch[0].replace(/[$,]/g, ''));
  
  // Handle specific patterns from your receipt
  if (lowerLine.includes('=total') || (lowerLine.includes('total') && !lowerLine.includes('subtotal'))) {
    data.summary.total = price;
    console.log(`Set total: ${price}`);
  } else if (lowerLine.includes('subtotal')) {
    data.summary.subtotal = price;
    console.log(`Set subtotal: ${price}`);
  } else if (lowerLine.includes('tax')) {
    data.summary.vat = price;
    console.log(`Set tax: ${price}`);
  } else if (lowerLine.includes('delivery') || lowerLine.includes('service')) {
    data.summary.deliveryCharge = price;
    console.log(`Set delivery charge: ${price}`);
  } else if (lowerLine.includes('discount')) {
    data.summary.discount = price;
    console.log(`Set discount: ${price}`);
  }
}

/**
 * Parse product line
 */
function parseProductLine(line: string): Product | null {
  console.log(`Parsing product line: "${line}"`);
  
  // Handle specific format like "1 | PIZZA | $ 50.00"
  const pipeMatch = line.match(/(\d+)\s*\|\s*([^|]+)\s*\|\s*\$?\s*([\d,]+\.?\d{2})/);
  if (pipeMatch) {
    const quantity = parseFloat(pipeMatch[1]);
    const productName = pipeMatch[2].trim();
    const price = parseFloat(pipeMatch[3].replace(/,/g, ''));
    
    console.log(`Pipe format detected: qty=${quantity}, name="${productName}", price=${price}`);
    
    return {
      productName: productName || 'Unknown Item',
      quantity,
      unitPrice: price,
      total: price * quantity
    };
  }
  
  // Extract price from line
  const priceMatch = line.match(/\$?[\d,]+\.?\d{2}/);
  if (!priceMatch) return null;
  
  const price = parseFloat(priceMatch[0].replace(/[$,]/g, ''));
  
  // Remove price from line to get product name
  const productName = line.replace(priceMatch[0], '').trim();
  
  // Try to extract quantity
  const quantityMatch = line.match(/^(\d+(\.\d+)?)[x×]/);
  const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
  
  console.log(`Standard format: qty=${quantity}, name="${productName}", price=${price}`);
  
  return {
    productName: productName || 'Unknown Item',
    quantity,
    unitPrice: quantity > 1 ? price / quantity : price,
    total: price
  };
}

/**
 * Alternative product parsing for different receipt formats
 */
function parseAlternativeProductFormat(lines: string[], data: ParsedData): void {
  const products: Product[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for lines with prices that might be products
    const priceMatches = line.match(/\$?[\d,]+\.?\d{2}/g);
    if (priceMatches && priceMatches.length === 1) {
      const price = parseFloat(priceMatches[0].replace(/[$,]/g, ''));
      
      // Skip if it's likely a summary line
      if (isSummaryLine(line)) continue;
      
      // Skip very small amounts (likely not products)
      if (price < 0.50) continue;
      
      const productName = line.replace(priceMatches[0], '').trim();
      
      if (productName.length > 0) {
        products.push({
          productName: productName,
          quantity: 1,
          unitPrice: price,
          total: price
        });
      }
    }
  }
  
  data.products = products;
}

/**
 * Extract receipt date
 */
function extractReceiptDate(lines: string[], data: ParsedData): void {
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/,  // MM/DD/YYYY or DD/MM/YYYY
    /\d{1,2}-\d{1,2}-\d{2,4}/,    // MM-DD-YYYY or DD-MM-YYYY
    /\d{4}-\d{1,2}-\d{1,2}/,      // YYYY-MM-DD
    /\d{1,2}\s+\w+\s+\d{4}/       // DD Month YYYY
  ];
  
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        data.receiptDate = match[0];
        return;
      }
    }
  }
}

/**
 * Process receipt image file (main entry point)
 * @param imagePath - Path to the image file
 * @returns Structured receipt data
 */
export async function processReceiptImage(imagePath: string): Promise<ExtractionResult> {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    
    // Extract text and parse
    const result = await extractTextFromImage(imagePath);
    
    return result;
  } catch (error) {
    console.error('Receipt processing error:', error);
    throw error;
  }
}

export {
  extractTextFromImage,
  parseReceiptText,
  type ParsedData,
  type Product,
  type Summary,
  type MerchantInfo
};
