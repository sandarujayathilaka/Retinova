import React from "react";
import { Typography } from "antd";
import { motion } from "framer-motion";

const { Text } = Typography;

const LoadingSection = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow-md border border-indigo-100"
  >
    {/* Custom Spinner */}
    <div className="relative w-24 h-24">
      {/* Outer Circle */}
      <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
      
      {/* Spinner Arc - Animation */}
      <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 border-r-indigo-600 rounded-full animate-spin"></div>
      
      {/* Inner Circle */}
      <div className="absolute inset-0 m-2 border-2 border-blue-100 rounded-full"></div>
      
      {/* Inner Spinner - Counter Animation */}
      <div className="absolute inset-0 m-2 border-2 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '1.2s' }}></div>
      
      {/* Center Eye Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-indigo-700"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </div>
    </div>
    
    <div className="mt-8 text-center">
      <Text className="text-xl text-gray-800 font-medium">Analyzing Retinal Scan</Text>
      
      <div className="mt-2 max-w-md">
        <Text className="text-gray-600">
          Our AI is processing your image to detect signs of diabetic retinopathy
        </Text>
      </div>
      
      {/* Loading Steps */}
      <div className="mt-6 flex flex-col items-center">
        <div className="flex items-center space-x-2 text-sm text-indigo-700">
          <div className="w-2 h-2 bg-indigo-700 rounded-full animate-ping"></div>
          <span className="font-medium">Analyzing image patterns</span>
        </div>
        
        
      </div>
      
      <p className="text-xs text-gray-500 mt-8">
        This process typically takes 15-20 seconds
      </p>
    </div>
  </motion.div>
);

export default LoadingSection;