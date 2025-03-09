import React from "react";

const MedicalHistory = ({ patient }) => (
  <div className="space-y-4 animate-fade-in">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <svg
        className="w-6 h-6 mr-2 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      Medical History
    </h2>
    {patient.medicalHistory.length > 0 ? (
      patient.medicalHistory.map((history, index) => (
        <div
          key={index}
          className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200"
        >
          <p className="text-gray-700">
            <span className="font-medium">Condition:</span> {history.condition}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Diagnosed:</span>{" "}
            {new Date(history.diagnosedAt).toLocaleDateString()}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Medications:</span>{" "}
            {history.medications.join(", ") || "None"}
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-500 italic">No medical history available</p>
    )}
  </div>
);

export default MedicalHistory;
