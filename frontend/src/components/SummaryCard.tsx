import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  HiCash, 
  HiShoppingCart, 
  HiTruck, 
  HiCalculator, 
  HiCheckCircle,
  HiLocationMarker,
  HiPhone,
  HiCalendar
} from 'react-icons/hi';

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

interface SummaryCardProps {
  data: ReceiptData;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  prefix?: string;
  gradient: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, prefix = '$', gradient, delay }) => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <div className={`
        backdrop-blur-xl bg-gradient-to-br ${gradient} 
        rounded-2xl p-6 border border-white/20 shadow-glass
        hover:shadow-premium transition-all duration-300
        overflow-hidden
      `}>
        {/* Animated Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="text-4xl text-white drop-shadow-lg"
            >
              {icon}
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.3, type: 'spring' }}
            >
              <HiCheckCircle className="text-2xl text-green-300" />
            </motion.div>
          </div>

          <h3 className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wider">
            {title}
          </h3>

          <div className="text-3xl font-bold text-white drop-shadow-lg">
            {hasAnimated && (
              <CountUp
                end={value}
                duration={2}
                decimals={2}
                prefix={prefix}
                separator=","
              />
            )}
          </div>

          {/* Shimmer Effect */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  if (!data || !data.summary) {
    return null;
  }

  const { summary, merchantInfo, receiptDate, products } = data;

  const stats = [
    {
      icon: <HiCash />,
      title: 'Total Amount',
      value: summary.total,
      gradient: 'from-emerald-500/90 to-teal-600/90',
    },
    {
      icon: <HiCalculator />,
      title: 'Subtotal',
      value: summary.subtotal,
      gradient: 'from-blue-500/90 to-indigo-600/90',
    },
    {
      icon: <HiShoppingCart />,
      title: 'VAT/Tax',
      value: summary.vat,
      gradient: 'from-purple-500/90 to-pink-600/90',
    },
    {
      icon: <HiTruck />,
      title: 'Delivery',
      value: summary.deliveryCharge,
      gradient: 'from-orange-500/90 to-red-600/90',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            gradient={stat.gradient}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Merchant Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-glass p-6 overflow-hidden relative"
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        />

        <div className="relative z-10">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center space-x-3 mb-6"
          >
            <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-full p-3">
              <HiCheckCircle className="text-2xl text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Receipt Details</h3>
              <p className="text-white/70">{products.length} items processed successfully</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {merchantInfo && merchantInfo.name && (
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-start space-x-3 backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-2">
                    <HiShoppingCart className="text-xl text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-1">Merchant</p>
                  <p className="text-white font-semibold text-lg">{merchantInfo.name}</p>
                </div>
              </motion.div>
            )}

            {merchantInfo && merchantInfo.address && (
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-start space-x-3 backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-2">
                    <HiLocationMarker className="text-xl text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-1">Address</p>
                  <p className="text-white font-medium">{merchantInfo.address}</p>
                </div>
              </motion.div>
            )}

            {merchantInfo && merchantInfo.phone && (
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-start space-x-3 backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg p-2">
                    <HiPhone className="text-xl text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-1">Phone</p>
                  <p className="text-white font-medium">{merchantInfo.phone}</p>
                </div>
              </motion.div>
            )}

            {receiptDate && (
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-start space-x-3 backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-2">
                    <HiCalendar className="text-xl text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-1">Date</p>
                  <p className="text-white font-medium">{receiptDate}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SummaryCard;
