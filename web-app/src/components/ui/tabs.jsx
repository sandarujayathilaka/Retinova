import React from "react";
import { cn } from "../../lib/utils";

const Tabs = ({ value, onValueChange, className, children }) => {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}
    </div>
  );
};

const TabsList = ({ value, onValueChange, className, children }) => (
  <div
    className={cn(
      "flex justify-center gap-2 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-100",
      "max-w-3xl mx-auto",
      className,
    )}
  >
    {React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}
  </div>
);

const TabsTrigger = ({ value, onValueChange, className, children, ...props }) => (
  <button
    className={cn(
      "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
      value === props.value
        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600",
      "focus:outline-none focus:ring-2 focus:ring-blue-300",
      className,
    )}
    onClick={() => onValueChange(props.value)}
    {...props}
  >
    {children}
  </button>
);

const TabsContent = ({ value, className, children, ...props }) => (
  <div
    className={cn(
      "mt-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300",
      value === props.value ? "opacity-100 block" : "opacity-0 hidden",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
