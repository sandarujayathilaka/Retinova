// src/components/MultiDiagnose/PredictionCard.jsx
import React from "react";
import { Progress } from "antd";
import { FaExclamationCircle, FaCheckCircle, FaUser, FaNotesMedical, FaEye } from "react-icons/fa";

const PredictionCard = ({ prediction, imageUrl, isExpanded, toggleExpand, index, setSelectedImage, setIsModalVisible }) => {
  const getDiagnosisStyle = diagnosis => {
    switch (diagnosis) {
      case "PDR": return { color: "red", icon: <FaExclamationCircle className="text-red-500" /> };
      case "NPDR": return { color: "orange", icon: <FaExclamationCircle className="text-orange-500" /> };
      case "No_DR": return { color: "green", icon: <FaCheckCircle className="text-green-500" /> };
      default: return { color: "gray", icon: null };
    }
  };
console.log("prediction",prediction)

  const { color, icon } = getDiagnosisStyle(prediction.prediction.label);
  const confidence = prediction.prediction.confidence;
  const maxConfidence = Array.isArray(confidence) ? Math.max(...confidence) * 100 : confidence * 100;
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className={`h-1 bg-${color}-500 -mx-6 -mt-6 mb-6 rounded-t-lg`}></div>
      <div className="flex justify-center mb-4">
        <img
          src={imageUrl}
          alt={`Uploaded Image ${index + 1}`}
          className="w-[150px] h-[150px] rounded-lg object-cover cursor-pointer shadow-md hover:shadow-lg transition-shadow"
          onClick={() => { setSelectedImage(imageUrl); setIsModalVisible(true); }}
        />
      </div>
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {icon} Diagnosis: <span className={`text-${color}-500`}>{prediction.prediction.label}</span>
        </div>
        <div className="text-sm text-gray-600 mt-3">Confidence Level</div>
        <Progress percent={maxConfidence.toFixed(2)} strokeColor={color} status="active" />
      </div>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-indigo-700 font-medium mb-3">
              <FaUser /> Patient Information
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-xs text-gray-500">Patient ID</div><div>{prediction.patientId}</div></div>
              <div><div className="text-xs text-gray-500">Name</div><div>{prediction.patientDetails.fullName}</div></div>
              <div><div className="text-xs text-gray-500">Age</div><div>{prediction.patientDetails.age}</div></div>
              <div><div className="text-xs text-gray-500">Gender</div><div>{prediction.patientDetails.gender}</div></div>
            </div>
          </div>
          {prediction.patientDetails.medicalHistory.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-indigo-700 font-medium mb-3">
                <FaNotesMedical /> Medical History
              </div>
              {prediction.patientDetails.medicalHistory.slice(0, 2).map((item, idx) => (
                <div key={idx} className={`${idx > 0 ? "mt-3 pt-3 border-t border-blue-100" : ""}`}>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-800">{item.condition}</span>
                    <span className="text-xs text-gray-500">{new Date(item.diagnosedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Medications:</span> {item.medications.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => toggleExpand(index)}
        className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
          isExpanded ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <FaEye className="text-sm" /> {isExpanded ? "Hide Details" : "View Patient Details"}
      </button>
    </div>
  );
};

export default PredictionCard;