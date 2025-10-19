import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCloudUpload, HiCamera, HiCheckCircle, HiX, HiDocumentText, HiDownload } from 'react-icons/hi';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Confetti from 'react-confetti';

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

interface ReceiptData {
  products: Product[];
  summary: Summary;
  merchantInfo: MerchantInfo;
  receiptDate: string;
  receiptId: string;
  receiptName: string;
}

interface FileUploadProps {
  onDataExtracted: (data: ReceiptData) => void;
  onError: (error: string | null) => void;
  onLoading: (loading: boolean) => void;
  loading: boolean;
}

interface FileItem {
  uid: string;
  name: string;
  status: string;
  url: string;
  originFileObj: File;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const LocalFileUpload: React.FC<FileUploadProps> = ({ onDataExtracted, onError, onLoading, loading }) => {
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [csvData, setCsvData] = useState<ReceiptData | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileItem[] = acceptedFiles.map(file => ({
      uid: Math.random().toString(36).substr(2, 9),
      name: file.name,
      status: 'done',
      url: URL.createObjectURL(file),
      originFileObj: file,
    }));

    setFileList(prev => [...prev, ...newFiles]);
    onError(null);
  }, [onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    onLoading(true);
    setUploadProgress(0);
    onError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const formData = new FormData();
      formData.append('receipt', file);

      // Upload file to local endpoint
      const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.message || 'Upload failed');
      }

      // Process the uploaded file
      const processResponse = await axios.post(`${API_URL}/process`, {
        filePath: uploadResponse.data.file.path,
        receiptName: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
      });

      if (!processResponse.data.success) {
        throw new Error(processResponse.data.message || 'Processing failed');
      }

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      const extractedData = processResponse.data.data;
      setCsvData(extractedData);
      onDataExtracted(extractedData);

    } catch (error: any) {
      console.error('Upload/Processing error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      onError(errorMessage);
    } finally {
      setUploading(false);
      onLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadCSV = async () => {
    if (!csvData) return;

    try {
      const response = await axios.post(`${API_URL}/process/csv`, {
        data: csvData,
        filename: csvData.receiptName
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${csvData.receiptName}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV download error:', error);
      onError('Failed to download CSV');
    }
  };

  const handleProcessAndDownload = async (file: File) => {
    setUploading(true);
    onLoading(true);
    setUploadProgress(0);
    onError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const formData = new FormData();
      formData.append('receipt', file);

      // Upload file to local endpoint
      const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.message || 'Upload failed');
      }

      // Process and generate CSV in one step
      const processResponse = await axios.post(`${API_URL}/process/process-and-csv`, {
        filePath: uploadResponse.data.file.path,
        receiptName: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
      }, {
        responseType: 'blob'
      });

      // Download the CSV file
      const url = window.URL.createObjectURL(new Blob([processResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${file.name.replace(/\.[^/.]+$/, '')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

    } catch (error: any) {
      console.error('Process and download error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      onError(errorMessage);
    } finally {
      setUploading(false);
      onLoading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setCsvData(null);
    onError(null);
  };

  const handleCameraCapture = () => {
    // This would open camera for photo capture
    // For now, just show a message
    onError('Camera capture not implemented yet. Please upload an image file.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {showConfetti && <Confetti />}
      
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <HiCloudUpload className="w-16 h-16 text-purple-500" />
          <div>
            <p className="text-xl font-semibold text-gray-700">
              {isDragActive ? 'Drop your receipt here' : 'Drag & drop your receipt here or click to browse files'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Maximum file size: 10MB
            </p>
          </div>
        </div>

        {uploading && (
          <motion.div
            className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-purple-600">Processing...</p>
              <p className="text-sm text-gray-600">{uploadProgress}%</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* File Preview */}
      <AnimatePresence>
        {fileList.length > 0 && (
          <motion.div
            className="mt-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {fileList.map((file) => (
              <motion.div
                key={file.uid}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <HiDocumentText className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.originFileObj.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpload(file.originFileObj)}
                      disabled={uploading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiCheckCircle className="w-4 h-4 mr-1" />
                      Process Receipt
                    </button>
                    <button
                      onClick={() => handleProcessAndDownload(file.originFileObj)}
                      disabled={uploading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiDownload className="w-4 h-4 mr-1" />
                      Process & Download CSV
                    </button>
                    <button
                      onClick={handleRemove}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={handleCameraCapture}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          <HiCamera className="w-5 h-5 mr-2" />
          Camera
        </button>
        
        {csvData && (
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <HiDownload className="w-5 h-5 mr-2" />
            Download CSV
          </button>
        )}
      </div>
    </div>
  );
};

export default LocalFileUpload;
