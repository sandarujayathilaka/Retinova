import React from "react";
import { Card, Typography, Button } from "antd";
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MedicalHistory from "../PatientProfile/TabContent/MedicalHistory";
import BasicInfo from "../PatientProfile/TabContent/BasicInfo";
import DiagnosisHistory from "../PatientProfile/TabContent/DiagnosisHistory";

const { Title, Text: AntdText } = Typography;

const PatientTabs = ({ patientData, setSelectedImage, activeTab, onExportPDF, prediction }) => {
  const chartData =
    patientData?.diagnoseHistory
      ?.filter((item) => item.confidenceScores?.length > 0)
      ?.map((item) => ({
        date: new Date(item.uploadedAt).toLocaleDateString(),
        confidence: Math.max(...item.confidenceScores) * 100,
      })) || [];

  const handleExportCSV = () => alert("Exporting as CSV...");

  const handleExportPDFClick = () => {
    onExportPDF({ patientData, prediction, setSelectedImage });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "patientInfo":
        return patientData ? (
          <BasicInfo patient={patientData} />
        ) : (
          <Card className="shadow-md rounded-lg bg-white border border-gray-200" bodyStyle={{ padding: "16px" }}>
            <AntdText className="text-gray-600">No patient information available.</AntdText>
          </Card>
        );

      case "medicalHistory":
        return patientData?.medicalHistory?.length > 0 ? (
          <MedicalHistory patient={patientData} />
        ) : (
          <Card className="shadow-md rounded-lg bg-white border border-gray-200" bodyStyle={{ padding: "16px" }}>
            <AntdText className="text-gray-600">No medical history available.</AntdText>
          </Card>
        );

      case "diagnosisHistory":
        return patientData?.diagnoseHistory?.length > 0 ? (
          <DiagnosisHistory patient={patientData.diagnoseHistory} />
        ) : (
          <Card className="shadow-md rounded-lg bg-white border border-gray-200" bodyStyle={{ padding: "16px" }}>
            <AntdText className="text-gray-600">No diagnosis history available.</AntdText>
          </Card>
        );

      case "charts":
        return chartData.length > 0 ? (
          <Card className="shadow-md rounded-lg bg-white border border-gray-200" bodyStyle={{ padding: "16px" }}>
            <Title level={4} className="text-lg text-gray-800 mb-4">
              Confidence Trend Over Time
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="confidence" stroke="#3B82F6" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ) : null;

      case "export":
        return (
          <Card className="shadow-md rounded-lg bg-white border border-gray-200" bodyStyle={{ padding: "24px" }}>
            <Title level={4} className="text-lg text-gray-800 mb-6">
              Export Patient Data
            </Title>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaFilePdf className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Comprehensive PDF Report</h3>
                    <p className="text-gray-600 mb-4">
                      Generate a detailed report with patient information, diagnosis history, and visualizations.
                    </p>
                    <Button
                      type="primary"
                      icon={<FaFilePdf className="mr-2" />}
                      onClick={handleExportPDFClick}
                      className="bg-blue-600 hover:bg-blue-700 border-0 rounded-lg shadow-sm hover:shadow-md transition-all px-5 py-2 h-auto"
                    >
                      Generate PDF Report
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaFileCsv className="text-green-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Data Export as CSV</h3>
                    <p className="text-gray-600 mb-4">Export raw patient data for further analysis or record-keeping.</p>
                    <Button
                      type="primary"
                      icon={<FaFileCsv className="mr-2" />}
                      onClick={handleExportCSV}
                      className="bg-green-600 hover:bg-green-700 border-0 rounded-lg shadow-sm hover:shadow-md transition-all px-5 py-2 h-auto"
                    >
                      Export as CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return <div className="p-6">{renderContent()}</div>;
};

export default PatientTabs;