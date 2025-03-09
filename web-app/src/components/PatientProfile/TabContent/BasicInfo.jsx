import React from "react";

const BasicInfo = ({ patient }) => (
  <div className="space-y-4 text-gray-700 animate-fade-in">
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
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      Basic Information
    </h2>
    <p>
      <span className="font-medium">Name:</span> {patient.fullName}
    </p>
    <p>
      <span className="font-medium">Age:</span> {patient.age}
    </p>
    <p>
      <span className="font-medium">Gender:</span> {patient.gender}
    </p>
    <p>
      <span className="font-medium">Category:</span> {patient.category.join(", ")}
    </p>
  </div>
);

export default BasicInfo;
