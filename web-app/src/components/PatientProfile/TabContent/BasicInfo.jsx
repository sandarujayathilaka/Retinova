import React from "react";
import { User, Calendar } from "lucide-react";

const BasicInfo = ({ patient }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center text-xl font-semibold text-gray-800">
        <User className="w-6 h-6 mr-2 text-indigo-600" />
        <span>Basic Information</span>
      </div>
      <div className="space-y-4 pl-8 border-l-2 border-indigo-200">
        <div className="flex items-center text-gray-700">
          <span className="font-medium text-indigo-600 w-24">Name:</span>
          <span className="text-gray-800">{patient.fullName || "N/A"}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-medium text-indigo-600 w-24">Age:</span>
          <span className="text-gray-800">{patient.age || "N/A"}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-medium text-indigo-600 w-24">Gender:</span>
          <span className="text-gray-800">{patient.gender || "N/A"}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-medium text-indigo-600 w-24">Admission:</span>
          <span className="text-gray-800">{patient.admissionDate || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
