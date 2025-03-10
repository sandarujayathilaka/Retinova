import React from "react";
import { FileText } from "lucide-react";

const MedicalHistory = ({ patient }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center text-xl font-semibold text-gray-800">
        <FileText className="w-6 h-6 mr-2 text-indigo-600" />
        <span>Medical History</span>
      </div>
      <div className="pl-8 border-l-2 border-indigo-200">
        {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
          <table className="w-full text-left text-gray-700">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-50/50 to-white/50">
                <th className="py-2 px-4 font-medium">Condition</th>
                <th className="py-2 px-4 font-medium">Diagnosed</th>
                <th className="py-2 px-4 font-medium">Medications</th>
              </tr>
            </thead>
            <tbody>
              {patient.medicalHistory.map((history, index) => (
                <tr
                  key={index}
                  className="border-t border-indigo-100 hover:bg-indigo-50/20 transition-all duration-300"
                >
                  <td className="py-2 px-4">{history.condition}</td>
                  <td className="py-2 px-4">
                    {new Date(history.diagnosedAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">{history.medications.join(", ") || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 italic text-center py-4">No medical history available</p>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
