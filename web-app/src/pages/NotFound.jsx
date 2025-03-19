import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 text-slate-800">
      <div className="w-full max-w-md mx-auto text-center">
        {/* 404 SVG Illustration */}
        <div className="mb-8 relative mx-auto w-64 h-64">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fill="#e2e8f0"
              d="M44.9,-76.5C58.1,-70.7,68.9,-58.5,76.1,-44.7C83.3,-30.9,87,-15.5,85.7,-0.8C84.3,13.9,77.9,27.8,69.8,40.9C61.7,54,51.9,66.2,39.7,72.5C27.4,78.8,13.7,79.1,-0.6,80.1C-14.9,81.1,-29.8,82.8,-40.8,76.6C-51.8,70.5,-58.9,56.6,-65.3,43.1C-71.8,29.6,-77.5,14.8,-79.8,-1.3C-82.1,-17.4,-80.9,-34.9,-72.8,-48.6C-64.7,-62.3,-49.7,-72.3,-34.7,-77.2C-19.8,-82,-9.9,-81.8,2.4,-85.8C14.6,-89.8,29.2,-98,44.9,-76.5Z"
              transform="translate(100 100)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-indigo-800">404</span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-slate-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
