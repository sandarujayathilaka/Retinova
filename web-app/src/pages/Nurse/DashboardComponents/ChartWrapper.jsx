import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * Wrapper component for charts
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Chart component
 * @param {string} props.title - Chart title
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.filters - Filter controls
 * @param {React.ReactNode} props.legend - Chart legend
 */
const ChartWrapper = ({ 
  children, 
  title, 
  icon, 
  className = "",
  filters,
  legend
}) => {
  return (
    <Card className={`overflow-hidden shadow-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between bg-blue-50 pb-3 border-b border-blue-100">
        <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        {filters && (
          <div className="flex items-center space-x-2">
            {filters}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {children}
        {legend && (
          <div className="mt-4 flex items-center justify-center flex-wrap gap-3">
            {legend}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartWrapper;