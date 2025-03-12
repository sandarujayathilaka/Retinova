import React from "react";
import { ArrowLeft, UserCircle, Calendar, Mail, Phone } from "lucide-react";

const Header = ({ patientId, navigate, patient }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={() => navigate("/")}
          className="mr-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Patient Profile
          </h1>
          <p className="text-gray-600 text-sm">
            Comprehensive medical overview and history
          </p>
        </div>
      </div>
      
      {patient && (
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
          {patient.contactNumber && (
            <a
              href={`tel:${patient.contactNumber}`}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <Phone className="w-4 h-4 mr-2 text-blue-900" />
              Call Patient
            </a>
          )}
          
          {patient.email && (
            <a
              href={`mailto:${patient.email}`}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <Mail className="w-4 h-4 mr-2 text-blue-900" />
              Email
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;