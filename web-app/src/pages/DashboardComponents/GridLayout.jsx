import React from 'react';

/**
 * Grid layout component for dashboard sections
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.columns - Grid columns configuration
 * @param {string} props.className - Additional CSS classes
 */
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