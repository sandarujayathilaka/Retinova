import React from "react";
import { Phone } from "lucide-react";

const ContactInfo = ({ patient }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center text-xl font-semibold text-gray-800">
        <Phone className="w-6 h-6 mr-2 text-indigo-600" />
        <span>Contact Information</span>
      </div>
      <div className="space-y-4 pl-8 border-l-2 border-indigo-200">
        <div className="flex items-center text-gray-700">
          <span className="font-medium text-indigo-600 w-24">Phone:</span>
          <span className="text-gray-800">{patient.contactNumber || "N/A"}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-medium text-indigo-600 w-24">Email:</span>
          <span className="text-gray-800">{patient.email || "N/A"}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-medium text-indigo-600 w-24">Address:</span>
          <span className="text-gray-800">{patient.address || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
