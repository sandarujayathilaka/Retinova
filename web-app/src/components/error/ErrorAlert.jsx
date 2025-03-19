import * as React from "react";
import { AlertCircle } from "lucide-react"; // Assuming you're using lucide-react for icons
import PropTypes from "prop-types"; // For prop type validation (optional)

// Reusable ErrorAlert component
export function ErrorAlert({ message, variant = "error", className = "", ...props }) {
  // Determine styles based on variant
  const variantStyles = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: "text-red-500",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      icon: "text-yellow-500",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      icon: "text-blue-500",
    },
  };

  const { bg, border, text, icon } = variantStyles[variant] || variantStyles.error;

  return (
    <div
      className={`mb-6 p-4 ${bg} border ${border} rounded-lg flex items-start ${className}`}
      {...props}
    >
      <AlertCircle className={`w-5 h-5 ${icon} mr-2 flex-shrink-0 mt-0.5`} />
      <p className={`${text} text-sm`}>{message}</p>
    </div>
  );
}

// PropTypes for validation (optional but recommended)
ErrorAlert.propTypes = {
  message: PropTypes.string.isRequired, // The error/warning/info message
  variant: PropTypes.oneOf(["error", "warning", "info"]), // Variant type
  className: PropTypes.string, // Additional custom classes
};