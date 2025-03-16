import React from "react";

const Footer = ({ patient }) => (
  <div className="pt-4 border-t border-indigo-100 text-sm text-gray-600 space-y-1">
    <div>
      <span className="font-medium text-gray-700">Created:</span>{" "}
      {new Date(patient.createdAt).toLocaleString()}
    </div>
    <div>
      <span className="font-medium text-gray-700">Updated:</span>{" "}
      {new Date(patient.updatedAt).toLocaleString()}
    </div>
  </div>
);

export default Footer;
