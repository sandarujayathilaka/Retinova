import React from 'react';
import { Loader2 } from "lucide-react";


export const LoadingState = ({ message = "Loading dashboard..." }) => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-md">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};