import React from 'react';
import { motion } from 'framer-motion';

const ConfirmDialog = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "No"
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg"
      >
        <p className="text-lg text-gray-800 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmDialog;