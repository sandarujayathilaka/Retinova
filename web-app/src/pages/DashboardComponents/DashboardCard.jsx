import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


export const DashboardCard = ({ 
  children, 
  title, 
  icon, 
  className = "",
  minHeight = "min-h-[450px]"
}) => {
  return (
    <Card className={`overflow-hidden ${minHeight} ${className}`}>
      {title && (
        <CardHeader className="bg-blue-50 border-blue-100">
          <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
            {icon}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-1">
        {children}
      </CardContent>
    </Card>
  );
};