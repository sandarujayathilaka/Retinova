import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * Empty state component for dashboards when no data is available
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Empty state title
 * @param {string} props.description - Empty state description
 * @param {string} props.buttonText - Text for action button
 * @param {Function} props.buttonAction - Function to call when button is clicked
 * @param {React.ReactNode} props.icon - Icon component
 */
export const EmptyState = ({
  title = "No data available",
  description = "There is no data to display at this time.",
  buttonText,
  buttonAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="bg-blue-50 p-4 rounded-full mb-4">
        {icon || <PlusCircle className="h-12 w-12 text-blue-300" />}
      </div>
      <h3 className="text-xl font-semibold text-blue-900 mb-2">{title}</h3>
      <p className="text-blue-600 mb-6 max-w-md">{description}</p>
      {buttonText && buttonAction && (
        <Button
          onClick={buttonAction}
          className="px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};