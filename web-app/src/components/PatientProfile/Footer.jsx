import React from "react";

const Footer = ({ patient }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 text-sm text-gray-600 transform transition-all hover:shadow-xl">
    <p>
      <span className="font-medium">Created At:</span>{" "}
      {new Date(patient.createdAt).toLocaleString()}
    </p>
    <p>
      <span className="font-medium">Updated At:</span>{" "}
      {new Date(patient.updatedAt).toLocaleString()}
    </p>
  </div>
);

export default Footer;
