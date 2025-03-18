import React from 'react';


export const GridLayout = ({ 
  children, 
  columns = "grid-cols-1 md:grid-cols-2", 
  className = "gap-6 mb-8" 
}) => {
  return (
    <div className={`grid ${columns} ${className}`}>
      {children}
    </div>
  );
};