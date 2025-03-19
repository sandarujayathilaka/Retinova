import React from "react";
import { Card, Typography, Button } from "antd";
import { FaFilePdf } from "react-icons/fa";
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
            <Title level={4} className="text-lg font-bold text-gray-800 mb-6 text-center">
              Export Patient Data
            </Title>
            
            {/* Export Option Container */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Icon Container */}
                  <div className="bg-blue-100 p-4 rounded-full flex items-center justify-center">
                    <FaFilePdf className="text-blue-600 text-2xl" />
                  </div>
                  
                  {/* Content Container */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Comprehensive PDF Report</h3>
                    <p className="text-gray-600 mb-6">
                      Generate a detailed report with patient information, diagnosis history, and visualizations.
                      This report includes all relevant clinical data and can be saved or printed for your records.
                    </p>
                    
                    {/* Button Container */}
                    <div className="flex justify-center sm:justify-start">
                      <Button
                        type="primary"
                        icon={<FaFilePdf className="mr-2" />}
                        onClick={handleExportPDFClick}
                        className="bg-blue-600 hover:bg-blue-700 border-0 rounded-lg shadow-sm hover:shadow-md transition-all px-6 py-3 h-auto text-base font-medium"
                      >
                        Generate PDF Report
                      </Button>
                    </div>
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