import React from 'react';
import { Button } from "@/components/ui/button";


export const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
        <div className="text-red-500 text-lg mb-4 font-medium">{error}</div>
        <Button 
          onClick={onRetry}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};