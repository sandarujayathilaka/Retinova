import React from "react";

const ContactInfo = ({ patient }) => (
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
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
      Contact Information
    </h2>
    <p>
      <span className="font-medium">Phone:</span> {patient.contactNumber}
    </p>
    <p>
      <span className="font-medium">Email:</span> {patient.email || "N/A"}
    </p>
    <p>
      <span className="font-medium">Address:</span> {patient.address || "N/A"}
    </p>
  </div>
);

export default ContactInfo;
