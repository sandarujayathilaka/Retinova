import React from "react";

const Pagination = ({ pagination, handlePageChange }) => (
  <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
    <p className="text-sm text-gray-700">
      Showing {pagination.patientsPerPage * (pagination.currentPage - 1) + 1} to{" "}
      {Math.min(pagination.patientsPerPage * pagination.currentPage, pagination.totalPatients)} of{" "}
      {pagination.totalPatients} patients
    </p>
    <div className="flex space-x-2">
      <button
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700"
      >
        Previous
      </button>
      <button
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.totalPages}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700"
      >
        Next
      </button>
    </div>
  </div>
);

export default Pagination;
