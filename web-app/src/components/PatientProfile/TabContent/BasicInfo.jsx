import React from "react";
import { User, UserCircle, Tag } from "lucide-react";

const BasicInfo = ({ patient }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center mb-6">
        <div className="p-2 rounded-full bg-blue-100 mr-3">
          <User className="w-6 h-6 text-blue-900" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Patient Information
        </h2>
      </div>
      
      <div>
        {/* Personal Information Card */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-indigo-100">
          <div className="p-5 border-b border-indigo-50 bg-gradient-to-r from-blue-50 to-white">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <UserCircle className="w-5 h-5 mr-2 text-blue-900" />
              Personal Details
            </h3>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Full Name</span>
              <span className="text-gray-900 font-medium">{patient.fullName || "N/A"}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Age</span>
                <span className="text-gray-900">{patient.age ? `${patient.age} years` : "N/A"}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Gender</span>
                <span className="text-gray-900">{patient.gender || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-indigo-100">
        <div className="p-5 border-b border-indigo-50 bg-gradient-to-r from-blue-50 to-white">
          <h3 className="flex items-center text-lg font-medium text-gray-900">
            <Tag className="w-5 h-5 mr-2 text-blue-900" />
            Additional Information
          </h3>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Blood Type</span>
              <span className="text-gray-900">{patient.bloodType || "Not recorded"}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Height</span>
              <span className="text-gray-900">{patient.height ? `${patient.height} cm` : "Not recorded"}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Weight</span>
              <span className="text-gray-900">{patient.weight ? `${patient.weight} kg` : "Not recorded"}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Allergies</span>
              <span className="text-gray-900">
                {patient.allergies && patient.allergies.length > 0 
                  ? patient.allergies.join(", ") 
                  : "No known allergies"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Primary Physician</span>
              <span className="text-gray-900">{patient.primaryPhysician || "Not assigned"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;