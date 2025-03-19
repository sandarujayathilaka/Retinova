import React from "react";
import { Phone, Mail, MapPin, UserPlus, User } from "lucide-react";

const ContactInfo = ({ patient }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center mb-6">
        <div className="p-2 rounded-full bg-blue-100 mr-3">
          <Phone className="w-6 h-6 text-blue-900" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Contact Information
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Contact Card */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-indigo-100">
          <div className="p-5 border-b border-indigo-50 bg-gradient-to-r from-blue-50 to-white">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <User className="w-5 h-5 mr-2 text-blue-900" />
              Primary Contact Details
            </h3>
          </div>
          
          <div className="p-5 space-y-5">
            <div className="flex items-start">
              <Phone className="w-5 h-5 mr-3 text-blue-900 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Phone Number</span>
                <a 
                  href={`tel:${patient.contactNumber}`} 
                  className="text-gray-900 hover:text-blue-900 transition-colors duration-200"
                >
                  {patient.contactNumber || "N/A"}
                </a>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="w-5 h-5 mr-3 text-blue-900 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Email Address</span>
                <a 
                  href={`mailto:${patient.email}`} 
                  className="text-gray-900 hover:text-blue-900 transition-colors duration-200"
                >
                  {patient.email || "N/A"}
                </a>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 text-blue-900 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Residential Address</span>
                <address className="text-gray-900 not-italic">
                  {patient.address || "No address provided"}
                </address>
              </div>
            </div>
          </div>
        </div>
        
        {/* Emergency Contacts Card */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-indigo-100">
          <div className="p-5 border-b border-indigo-50 bg-gradient-to-r from-blue-50 to-white">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <UserPlus className="w-5 h-5 mr-2 text-blue-900" />
              Emergency Contacts
            </h3>
          </div>
          
          <div className="p-5">
            {patient.emergencyContact ? (
              <div className="space-y-5">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <span className="text-blue-900 font-medium">1</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{patient.emergencyContact.name || "Emergency Contact"}</span>
                    <span className="text-gray-600 text-sm">{patient.emergencyContact.relationship || "Relationship not specified"}</span>
                    <a 
                      href={`tel:${patient.emergencyContact.phone}`} 
                      className="text-blue-900 hover:underline mt-1"
                    >
                      {patient.emergencyContact.phone || "No phone provided"}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <UserPlus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-1">No emergency contacts provided</p>
                <p className="text-sm text-gray-400">
                  Emergency contacts help medical staff reach family members in critical situations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ContactInfo;