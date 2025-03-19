import React from "react";
import { toast } from "react-hot-toast";
import { AlertCircle, Check, Info } from "lucide-react";

export const showErrorToast = (message) => {
  toast.custom(
    (t) => 
      React.createElement(
        "div", 
        { 
          className: "bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-md flex items-center gap-3" 
        },
        React.createElement(AlertCircle, { className: "h-5 w-5 text-red-500" }),
        React.createElement("div", { className: "font-medium" }, message)
      ),
    { duration: 4000 }
  );
};

export const showSuccessToast = (message) => {
  toast.custom(
    (t) => 
      React.createElement(
        "div", 
        { 
          className: "bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl shadow-md flex items-center gap-3" 
        },
        React.createElement(
          "div", 
          { className: "bg-green-100 p-2 rounded-full" },
          React.createElement(Check, { className: "h-4 w-4 text-green-700" })
        ),
        React.createElement("div", { className: "font-medium" }, message)
      ),
    { duration: 4000 }
  );
};

export const showNoChangesToast = (message) => {
  toast.custom(
    (t) => 
      React.createElement(
        "div", 
        { 
          className: "bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl shadow-md flex items-center gap-3" 
        },
        React.createElement(Info, { className: "h-5 w-5 text-blue-600" }),
        React.createElement("div", { className: "font-medium" }, message)
      ),
    { duration: 4000 }
  );
};