import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useDashboard } from '../../../hooks/useDashboard';

// Create context
const DashboardContext = createContext(null);

/**
 * Dashboard context provider for state management across components
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.dashboardType - Type of dashboard (admin/doctor)
 * @param {string} props.entityId - ID of the entity (doctor) if applicable
 */
export const DashboardProvider = ({ 
  children, 
  dashboardType = 'admin',
  entityId = null 
}) => {
  // Use the dashboard hook
  const dashboardData = useDashboard(dashboardType, entityId);
  
  // Additional state for dashboard context
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    endDate: new Date()
  });
  
  const [activeView, setActiveView] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  
  // Handler for expanding/collapsing sections
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);
  
  // Set date range
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setDateRange({ startDate, endDate });
  }, []);
  
  // Filter data by date range
  const filteredData = useMemo(() => {
    // This is a placeholder - implement actual filtering logic based on your data structure
    return dashboardData;
  }, [dashboardData, dateRange]);
  
  // Context value
  const contextValue = {
    ...filteredData,
    dateRange,
    handleDateRangeChange,
    activeView,
    setActiveView,
    expandedSections,
    toggleSection,
    dashboardType,
    entityId
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

/**
 * Custom hook to use the dashboard context
 * @returns {Object} Dashboard context
 */
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  
  return context;
};

/**
 * Higher-order component to wrap dashboard components with context
 * 
 * @param {React.ComponentType} Component - Component to wrap
 * @returns {React.ComponentType} Wrapped component with dashboard context
 */
export const withDashboardContext = (Component) => {
  const WithDashboardContext = (props) => {
    return (
      <DashboardProvider 
        dashboardType={props.dashboardType || 'admin'} 
        entityId={props.entityId}
      >
        <Component {...props} />
      </DashboardProvider>
    );
  };
  
  WithDashboardContext.displayName = `WithDashboardContext(${getDisplayName(Component)})`;
  
  return WithDashboardContext;
};

// Helper function to get component name for HOC
function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}