import React from "react";
import { Modal, Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { FaFileDownload, FaPrint } from "react-icons/fa";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import PatientReportPDF from "./PatientReportPDF";

// Color palette to match PatientReportPDF
const COLORS = {
  primary: "#1a56db",
  primaryLight: "#e0eaff",
  secondary: "#0f766e",
  secondaryLight: "#ccfbf1",
  text: "#1e293b",
  textLight: "#64748b",
  success: "#059669",
  warning: "#d97706",
  border: "#cbd5e1",
  white: "#ffffff",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
};

const PatientReport = ({ visible, onClose, patientData, prediction, imageUrl }) => {
  console.log("PatientReport props:", { patientData, prediction, imageUrl });

  const handlePrintReport = async () => {
    const blob = await pdf(
      <PatientReportPDF patientData={patientData} prediction={prediction} imageUrl={imageUrl} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);
    printWindow.onload = () => printWindow.print();
  };

  const generateReportId = () => {
    const patientId = patientData?.patientId || "P12345678";
    const timestamp = Date.now().toString().slice(-6);
    return `RPT-${patientId.slice(-4)}-${timestamp}`;
  };

  const reportId = generateReportId();
  const generationDate = new Date().toLocaleString();

  const renderReportPreview = () => {
    return (
      <div className="bg-white rounded-lg overflow-hidden text-[9px] font-sans text-[#1e293b]">
        {/* Header */}
        <div className="bg-[#1a56db] text-white p-4">
          <h1 className="text-lg font-bold">Patient Health Report</h1>
          <p className="text-[8px] opacity-80">
            Generated on {new Date().toLocaleDateString()} • Report ID: {reportId}
          </p>
        </div>

        {/* Content Container */}
        <div className="p-5">
          {/* Patient Info Section */}
          <div className="mb-2 border border-[#cbd5e1] rounded-sm p-2 bg-white">
            <div className="bg-[#e0eaff] px-2 py-1 -mx-2 -mt-2 mb-2 font-bold text-[10px] text-[#1a56db]">
              Patient Profile
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="bg-[#e0eaff] px-2 py-1 rounded-sm text-[#1a56db] font-bold text-[10px]">
                ID: {patientData?.patientId || "P12345678"}
              </span>
              <span className="bg-[#059669] text-white px-2 py-0.5 rounded-full text-[7px]">
                Active Patient
              </span>
            </div>
            <div className="flex">
              <div className="w-1/2">
                <p className="mb-1"><span className="text-[#64748b]">Name:</span> <strong>{patientData?.fullName || "John Doe"}</strong></p>
                <p className="mb-1"><span className="text-[#64748b]">Age/Gender:</span> <strong>{patientData?.age || "45"} y/o {patientData?.gender || "Male"}</strong></p>
                <p className="mb-1"><span className="text-[#64748b]">Phone:</span> <strong>{patientData?.phoneNumber || "+1 234 567 8900"}</strong></p>
                <p className="mb-1"><span className="text-[#64748b]">Email:</span> <strong>{patientData?.email || "john.doe@example.com"}</strong></p>
              </div>
              <div className="w-1/2">
                <p className="mb-1"><span className="text-[#64748b]">Blood:</span> <strong>{patientData?.bloodGroup || "AB+"}</strong></p>
                <p className="mb-1"><span className="text-[#64748b]">Height/Weight:</span> <strong>{patientData?.height || "175"} cm / {patientData?.weight || "78"} kg</strong></p>
                <p className="mb-1"><span className="text-[#64748b]">BMI:</span> <strong>{patientData?.bmi || "25.5"}</strong></p>
                <p className="mb-1"><span className="text-[#64748b]">Allergies:</span> <strong>{patientData?.allergies || "Penicillin"}</strong></p>
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex justify-between mb-2">
            {/* Prediction Section */}
            {prediction && (
              <div className="w-[48%] border border-[#cbd5e1] rounded-sm p-2 bg-white">
                <div className="bg-[#e0eaff] px-2 py-1 -mx-2 -mt-2 mb-2 font-bold text-[10px] text-[#1a56db]">
                  Latest Assessment
                </div>
                <div className="flex">
                  {imageUrl && (
                    <img src={imageUrl} alt="Retinal Scan" className="w-[100px] h-[100px] mr-2 rounded-sm border border-[#cbd5e1]" />
                  )}
                  <div className="flex-1">
                    <p className="mb-1"><span className="text-[#64748b]">Diagnosis:</span> <strong className="text-[#0f766e] text-[10px]">{prediction.type || "N/A"}</strong></p>
                    <div className="flex">
                      <div className="w-1/2">
                        <p className="mb-1"><span className="text-[#64748b]">Date:</span> <strong>{new Date(prediction.date).toLocaleDateString() || "N/A"}</strong></p>
                      </div>
                      <div className="w-1/2">
                        <p className="mb-1"><span className="text-[#64748b]">Doctor:</span> <strong>Dr. {prediction.doctor || "AI System"}</strong></p>
                      </div>
                    </div>
                    {prediction.notes && (
                      <div className="bg-[#ccfbf1] p-1 mt-1 rounded-sm">
                        <span className="text-[#64748b] block mb-1">Clinical Notes:</span>
                        <p className="text-[8px] italic">{prediction.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            <div className="w-[48%] border border-[#cbd5e1] rounded-sm p-2 bg-white">
              <div className="bg-[#e0eaff] px-2 py-1 -mx-2 -mt-2 mb-2 font-bold text-[10px] text-[#1a56db]">
                Care Recommendations
              </div>
              <div className="flex flex-wrap">
                <div className="w-1/2">
                  <p className="mb-1 relative pl-2"><span className="absolute left-0 text-[#1a56db] font-bold">•</span><strong className="text-[#0f766e]">Regular Eye Exams:</strong> Every 3-6 months</p>
                  <p className="mb-1 relative pl-2"><span className="absolute left-0 text-[#1a56db] font-bold">•</span><strong className="text-[#0f766e]">Blood Sugar:</strong> HbA1c below 7.0%</p>
                </div>
                <div className="w-1/2">
                  <p className="mb-1 relative pl-2"><span className="absolute left-0 text-[#1a56db] font-bold">•</span><strong className="text-[#0f766e]">Blood Pressure:</strong> Keep below 130/80 mmHg</p>
                  <p className="mb-1 relative pl-2"><span className="absolute left-0 text-[#1a56db] font-bold">•</span><strong className="text-[#0f766e]">Lifestyle:</strong> Exercise, balanced diet, no smoking</p>
                </div>
              </div>
              <div className="bg-[#ccfbf1] p-1 mt-1 rounded-sm">
                <p className="font-bold text-[#0f766e] text-[9px] mb-1">Next Steps</p>
                <p className="text-[8px]">Schedule follow-up appointment within 3 months. Contact ophthalmologist immediately for any sudden vision changes.</p>
              </div>
            </div>
          </div>

          {/* Treatment Section */}
          <div className="mb-2 border border-[#cbd5e1] rounded-sm p-2 bg-white">
            <div className="bg-[#e0eaff] px-2 py-1 -mx-2 -mt-2 mb-2 font-bold text-[10px] text-[#1a56db]">
              Treatment & Medications
            </div>
            {(patientData?.medicalHistory?.slice(0, 2) || []).map((record, index) => (
              <div key={index} className="mb-1 p-1 bg-[#f1f5f9] border-l-2 border-[#0f766e] rounded-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-[#0f766e] text-[9px]">{record.condition}</span>
                  <span className={`px-1 py-0.5 rounded-full text-[7px] text-white ${record.status === "Active" ? "bg-[#059669]" : "bg-[#64748b]"}`}>
                    {record.status || "Active"}
                  </span>
                </div>
                <div className="flex flex-wrap">
                  <div className="w-1/3">
                    <p className="mb-1"><span className="text-[#64748b]">Diagnosed:</span> <strong>{new Date(record.diagnosedAt).toLocaleDateString()}</strong></p>
                  </div>
                  <div className="w-1/3">
                    <p className="mb-1"><span className="text-[#64748b]">Follow-up:</span> <strong>{record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : "As needed"}</strong></p>
                  </div>
                  <div className="w-1/3">
                    <p className="mb-1"><span className="text-[#64748b]">Medications:</span> <strong>{record.medications?.join(", ") || "None"}</strong></p>
                  </div>
                </div>
                {record.notes && <p className="text-[7px] italic mt-1">{record.notes}</p>}
              </div>
            ))}
          </div>

          {/* Diagnosis History Section */}
          <div className="mb-2 border border-[#cbd5e1] rounded-sm p-2 bg-white">
            <div className="bg-[#e0eaff] px-2 py-1 -mx-2 -mt-2 mb-2 font-bold text-[10px] text-[#1a56db]">
              Diagnosis History
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1a56db] text-white">
                  <th className="w-1/4 p-1 text-[8px] font-bold text-center">Date</th>
                  <th className="w-[30%] p-1 text-[8px] font-bold text-center">Diagnosis</th>
                  <th className="w-[15%] p-1 text-[8px] font-bold text-center">Eye</th>
                  <th className="w-[15%] p-1 text-[8px] font-bold text-center">Confidence</th>
                  <th className="w-1/5 p-1 text-[8px] font-bold text-center">Doctor</th>
                </tr>
              </thead>
              <tbody>
                {(patientData?.diagnoseHistory?.slice(0, 4) || []).map((diagnosis, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#f1f5f9]"}>
                    <td className="p-1 text-[8px] text-center">{new Date(diagnosis.uploadedAt).toLocaleDateString()}</td>
                    <td className="p-1 text-[8px] text-center">{diagnosis.diagnosis || "N/A"}</td>
                    <td className="p-1 text-[8px] text-center">{diagnosis.eye || "N/A"}</td>
                    <td className="p-1 text-[8px] text-center">{Math.max(...(diagnosis.confidenceScores || [0])).toFixed(1)}%</td>
                    <td className="p-1 text-[8px] text-center">Dr. {diagnosis.doctor || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-2 text-center pt-2 pb-5 border-t border-[#cbd5e1] text-[7px] text-[#64748b]">
            <p className="font-bold text-[#1a56db] mb-1 text-[8px]">Diabetic Retinopathy Diagnosis System</p>
            <p className="mb-1">Consult your healthcare provider for medical advice</p>
            <p>Report ID: {reportId} • Generated: {generationDate} • CONFIDENTIAL MEDICAL RECORD</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <PDFDownloadLink
              document={<PatientReportPDF patientData={patientData} prediction={prediction} imageUrl={imageUrl} />}
              fileName={`Patient_Report_${patientData?.patientId || "Unknown"}.pdf`}
            >
              {({ loading }) => (
                <Button
                  icon={<FaFileDownload className="mr-2" />}
                  disabled={loading}
                  className="flex items-center"
                >
                  {loading ? "Generating..." : "Download Report"}
                </Button>
              )}
            </PDFDownloadLink>
            <Button
              type="primary"
              icon={<FaPrint className="mr-2" />}
              onClick={handlePrintReport}
              className="flex items-center bg-blue-600 hover:bg-blue-700"
            >
              Print Report
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-xl">
          <FilePdfOutlined className="text-red-500" />
          <span>Comprehensive Patient Report</span>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      bodyStyle={{ padding: 0 }}
      destroyOnClose
    >
      {renderReportPreview()}
    </Modal>
  );
};

export default PatientReport;