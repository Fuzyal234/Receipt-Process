import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiDownload, 
  HiEye, 
  HiX, 
  HiChevronLeft, 
  HiChevronRight,
  HiCheckCircle,
  HiCurrencyDollar
} from 'react-icons/hi';
import Papa from 'papaparse';
import axios from 'axios';

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
}

interface DataTableProps {
  data: ReceiptData;
}

interface TableRow {
  key: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  vat: string;
  deliveryCharge: string;
  subtotal: number;
  grandTotal: number;
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<TableRow | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const itemsPerPage = 5;

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const tableData = useMemo(() => {
    if (!data || !data.products) return [];
    
    return data.products.map((product, index) => ({
      key: index,
      productName: product.productName || 'N/A',
      quantity: product.quantity || 1,
      unitPrice: product.unitPrice || 0,
      total: product.total || 0,
      vat: (data.summary.vat / data.products.length).toFixed(2),
      deliveryCharge: (data.summary.deliveryCharge / data.products.length).toFixed(2),
      subtotal: data.summary.subtotal || 0,
      grandTotal: data.summary.total || 0
    }));
  }, [data]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const paginatedData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreview = (record: TableRow) => {
    setPreviewData(record);
    setPreviewVisible(true);
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const csvData = tableData.map(item => ({
        'Product Name': item.productName,
        'Quantity': item.quantity,
        'Unit Price': item.unitPrice,
        'Total': item.total,
        'VAT': item.vat,
        'Delivery Charge': item.deliveryCharge,
      }));

      csvData.push({
        'Product Name': 'SUMMARY',
        'Quantity': 0,
        'Unit Price': 0,
        'Total': 0,
        'VAT': data.summary.vat.toFixed(2),
        'Delivery Charge': data.summary.deliveryCharge.toFixed(2),
      });

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `receipt-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('CSV export error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!data || !data.products || data.products.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-glass overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/30 to-purple-600/30 backdrop-blur-md p-6 border-b border-white/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-white mb-1">Extracted Product Data</h3>
              <p className="text-white/70">{tableData.length} items found</p>
            </motion.div>

            <motion.button
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleExportCSV}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HiDownload className="text-xl" />
              <span>Export CSV</span>
            </motion.button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-bold text-white/90 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-white/90 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white/90 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white/90 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white/90 uppercase tracking-wider">
                  VAT
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-white/90 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedData.map((row, index) => (
                  <motion.tr
                    key={row.key}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredRow(row.key)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`
                      border-b border-white/5 transition-all duration-300
                      ${hoveredRow === row.key ? 'bg-white/10 scale-[1.02]' : 'bg-transparent'}
                    `}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                          className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center"
                        >
                          <HiCheckCircle className="text-white text-xl" />
                        </motion.div>
                        <div>
                          <p className="text-white font-medium">{row.productName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/30 rounded-lg text-white font-bold">
                        {row.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-white font-medium">
                        ${parseFloat(row.unitPrice.toString()).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-300 font-bold text-lg">
                        ${parseFloat(row.total.toString()).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-purple-300 font-medium">
                        ${parseFloat(row.vat).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <motion.button
                        onClick={() => handlePreview(row)}
                        className="inline-flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <HiEye className="text-lg" />
                        <span>View</span>
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/5 backdrop-blur-sm p-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length} items
              </p>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <HiChevronLeft className="text-xl" />
                </motion.button>

                {[...Array(totalPages)].map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`
                      w-10 h-10 rounded-lg font-bold transition-all duration-300
                      ${currentPage === i + 1
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {i + 1}
                  </motion.button>
                ))}

                <motion.button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <HiChevronRight className="text-xl" />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewVisible && previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 rounded-2xl border border-white/30 shadow-premium p-8"
            >
              {/* Close Button */}
              <motion.button
                onClick={() => setPreviewVisible(false)}
                className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <HiX className="text-2xl" />
              </motion.button>

              {/* Modal Content */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl p-3">
                    <HiCurrencyDollar className="text-2xl" />
                  </div>
                  <span>Product Details</span>
                </h3>

                <div className="space-y-4">
                  {[
                    { label: 'Product Name', value: previewData.productName, icon: '📦' },
                    { label: 'Quantity', value: previewData.quantity, icon: '🔢' },
                    { label: 'Unit Price', value: `$${parseFloat(previewData.unitPrice.toString()).toFixed(2)}`, icon: '💵' },
                    { label: 'Total', value: `$${parseFloat(previewData.total.toString()).toFixed(2)}`, icon: '💰' },
                    { label: 'VAT', value: `$${parseFloat(previewData.vat).toFixed(2)}`, icon: '📊' },
                    { label: 'Delivery Charge', value: `$${parseFloat(previewData.deliveryCharge).toFixed(2)}`, icon: '🚚' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-white/80 font-medium">{item.label}</span>
                      </div>
                      <span className="text-white font-bold text-lg">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DataTable;
