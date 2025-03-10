import React from "react";

const PatientsTable = ({ patients, loading, handleViewPatient }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
    {loading ? (
      <div className="p-6 text-center text-gray-500 text-sm animate-pulse">
        <svg
          className="w-6 h-6 mx-auto mb-2 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
          />
        </svg>
        Loading patients...
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <tr>
              {["Patient ID", "Name", "Category", "Age", "Gender", "Actions"].map((header, idx) => (
                <th
                  key={header}
                  className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${
                    idx === 5 ? "text-center" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {patients.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 text-sm italic">
                  No patients found
                </td>
              </tr>
            ) : (
              patients.map((patient, index) => (
                <tr
                  key={patient.patientId}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  } hover:bg-gradient-to-r hover:from-indigo-50/20 hover:to-blue-50/20 transition-all duration-200`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {patient.patientId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{patient.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="inline-flex items-center px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      {patient.category.join(", ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{patient.age}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
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
                      <svg
                        className="w-4 h-4 ml-2 transform group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default PatientsTable;
