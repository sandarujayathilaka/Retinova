import React from "react";

const Pagination = ({ pagination, handlePageChange }) => {
  const { patientsPerPage, currentPage, totalPatients, totalPages } = pagination;

  return (
    <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 rounded-b-xl shadow-lg">
      {/* Info Text */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="inline-flex items-center px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium shadow-sm">
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
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="group relative px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg text-xs"
        >
          <svg
            className="w-3 h-3 mr-1 inline-block transform group-hover:-translate-x-0.5 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        {/* Page Indicator */}
        <div className="flex items-center justify-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium shadow-inner">
          Page {currentPage} of {totalPages}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="group relative px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg text-xs"
        >
          Next
          <svg
            className="w-3 h-3 ml-1 inline-block transform group-hover:translate-x-0.5 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
