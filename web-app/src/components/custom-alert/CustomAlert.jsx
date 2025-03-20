import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const CustomAlert = ({ 
  message, 
  type = 'info', 
  onClose, 
  showIcon = true, 
  className = '' 
}) => {
  const alertStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconStyles = {
    success: <FaCheckCircle className="w-5 h-5" />,
    error: <FaExclamationCircle className="w-5 h-5" />,
    warning: <FaExclamationCircle className="w-5 h-5" />,
    info: <FaInfoCircle className="w-5 h-5" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border-l-4 p-4 rounded-lg shadow-sm ${alertStyles[type]} ${className}`}
    >
      <div className="flex items-center">
        {showIcon && (
          <div className="flex-shrink-0 mr-3">
            {iconStyles[type]}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-current hover:opacity-75 focus:outline-none"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CustomAlert;