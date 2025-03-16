import React from "react";
import { ChevronLeft, ChevronRight, Database } from "lucide-react";

const Pagination = ({ pagination, handlePageChange }) => {
  const { patientsPerPage, currentPage, totalPatients, totalPages } = pagination;
  
  // Calculate the range of visible pages
  const getPageNumbers = () => {
    const delta = 1; // Number of pages to show on each side of current page
    const range = [];
    
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    
    // Add first page if it's not already in the range
    if (range[0] > 1) {
      if (range[0] > 2) {
        range.unshift('...');
      }
      range.unshift(1);
    }
    
    // Add last page if it's not already in the range
    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) {
        range.push('...');
      }
      range.push(totalPages);
    }
    
    return range;
  };

  if (totalPatients === 0) {
    return null; // Don't show pagination if there are no results
  }

  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 rounded-b-xl shadow-lg">
      {/* Info Text */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="inline-flex items-center px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium shadow-sm">
          <Database size={12} className="mr-1.5" />
          {totalPatients}
        </span>
        <p className="text-gray-700">
          Showing <span className="font-semibold">{patientsPerPage * (currentPage - 1) + 1}</span>{" "}
          to{" "}
          <span className="font-semibold">
            {Math.min(patientsPerPage * currentPage, totalPatients)}
          </span>{" "}
          of <span className="font-semibold">{totalPatients}</span> patients
        </p>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="group relative p-2 mr-1 text-gray-700 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} className="transform group-hover:scale-110 transition-transform duration-200" />
        </button>
        
        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-gray-500 text-sm">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="group relative p-2 ml-1 text-gray-700 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200"
          aria-label="Next page"
        >
          <ChevronRight size={18} className="transform group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;