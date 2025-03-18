import React from 'react';
import { Button } from "@/components/ui/button";
import { ActivitySquare, Loader2, RefreshCw } from "lucide-react";


export const DashboardHeader = ({ title, onRefresh, isRefreshing }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent flex items-center gap-3">
        <ActivitySquare className="h-8 w-8 text-indigo-700" /> 
        <span>{title}</span>
      </h1>
      <Button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900 rounded-lg px-6 py-2 text-white flex items-center gap-2 transition-all duration-200"
      >
        {isRefreshing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Refreshing...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </>
        )}
      </Button>
    </div>
  );
};
