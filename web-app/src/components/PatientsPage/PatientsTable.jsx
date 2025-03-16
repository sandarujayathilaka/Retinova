import React from "react";
import { Users, Eye, AlertCircle } from "lucide-react";

const PatientsTable = ({ patients, loading, handleViewPatient }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mb-4 relative">
            <div className="absolute inset-0 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
            <div className="absolute inset-3 border-2 border-gray-200 border-solid rounded-full"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading patient records...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle size={28} className="text-gray-400" />
          </div>
          <h3 className="text-gray-700 font-medium text-lg">No patients found</h3>
          <p className="text-gray-500 mt-2 max-w-md">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Patient ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Age
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Gender
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {patients.map((patient, index) => (
              <tr
                key={patient.patientId}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                } hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-blue-50/40 transition-colors duration-200`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {patient.patientId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">{patient.fullName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {Array.isArray(patient.category) ? (
                    patient.category.map((cat, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full mr-1 mb-1"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      {patient.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className="font-medium">{patient.age}</span>
                  <span className="text-gray-500 text-xs ml-1">years</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      patient.gender === "Male"
                        ? "bg-blue-100 text-blue-800"
                        : patient.gender === "Female"
                          ? "bg-pink-100 text-pink-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {patient.gender}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  <button
                    onClick={() => handleViewPatient(patient.patientId)}
                    className="group inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-medium rounded-md hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <span>View</span>
                    <Eye 
                      size={16} 
                      className="ml-2 transform group-hover:scale-110 transition-transform duration-300" 
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientsTable;