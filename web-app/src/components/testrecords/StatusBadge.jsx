import React from 'react';
import { CheckCircle, Clock, AlertCircle, CheckSquare, Loader2, Eye } from 'lucide-react';

const StatusBadge = ({ status, size = "default" }) => {
  // Define the styling and icon based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'Pending':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: Clock,
          ariaLabel: 'Pending status'
        };
      case 'In Progress':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: Loader2,
          ariaLabel: 'In Progress status',
          className: 'animate-spin'
        };
      case 'Completed':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          ariaLabel: 'Completed status'
        };
      case 'Reviewed':
        return {
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          icon: Eye,
          ariaLabel: 'Reviewed status'
        };
      case 'Test Completed':
        return {
          bgColor: 'bg-cyan-100',
          textColor: 'text-cyan-700',
          borderColor: 'border-cyan-200',
          icon: CheckSquare,
          ariaLabel: 'Test Completed status'
        };
      case 'Checked':
        return {
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          icon: CheckCircle,
          ariaLabel: 'Checked status'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          icon: AlertCircle,
          ariaLabel: 'Unknown status'
        };
    }
  };

  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    default: "px-2.5 py-1 text-xs",
    large: "px-3 py-1.5 text-sm"
  };

  const iconSizes = {
    small: "h-2.5 w-2.5 mr-1",
    default: "h-3 w-3 mr-1.5",
    large: "h-4 w-4 mr-1.5"
  };

  const { bgColor, textColor, borderColor, icon: Icon, ariaLabel, className = "" } = getStatusConfig();
  
  return (
    <div 
      className={`inline-flex items-center rounded-full font-medium border shadow-sm ${bgColor} ${textColor} ${borderColor} ${sizeClasses[size]} transition-all hover:opacity-90`}
      role="status"
      aria-label={ariaLabel}
    >
      <Icon className={`${iconSizes[size]} ${className}`} aria-hidden="true" />
      <span>{status}</span>
    </div>
  );
};

export default StatusBadge;