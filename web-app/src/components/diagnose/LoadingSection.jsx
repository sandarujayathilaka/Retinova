import React from "react";
import { PushSpinner } from "react-spinners-kit";
import { Typography } from "antd";
import { motion } from "framer-motion";

const { Text } = Typography;

const LoadingSection = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center h-64"
  >
    <PushSpinner size={50} color="#3B82F6" />
    <Text className="mt-4 text-lg text-gray-600 font-medium">Analyzing Image...</Text>
    <Text className="text-sm text-gray-500 mt-1">Processing your retinal scan. Please wait.</Text>
  </motion.div>
);

export default LoadingSection;
