import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


const TableWrapper = ({ 
  children, 
  title, 
  icon, 
  className = "",
  onSeeAll,
  loading = false
}) => {
  return (
    <Card className={`overflow-hidden shadow-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between bg-blue-50 pb-3 border-b border-blue-100">
        <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className={`p-0 ${loading ? 'flex items-center justify-center min-h-[200px]' : ''}`}>
        {children}
      </CardContent>
      {onSeeAll && (
        <CardFooter className="py-3 px-4 border-t border-gray-100 bg-gray-50">
          <Button 
            variant="link" 
            onClick={onSeeAll} 
            className="ml-auto text-sm text-blue-600 hover:text-blue-800"
          >
            See All →
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TableWrapper;