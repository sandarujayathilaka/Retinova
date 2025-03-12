import React, { useState } from "react";
import { Card, Typography, Tag, Button, Avatar, Modal, Spin } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, FilePdfOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
  FaFilePdf,
  FaFileCsv,
  FaPills,
  FaCalendarAlt,
  FaImage,
  FaChartLine,
  FaVenusMars,
  FaBirthdayCake,
  FaHospital,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHistory,
  FaFileDownload,
  FaPrint
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import MedicalHistory from "../PatientProfile/TabContent/MedicalHistory";
import BasicInfo from "../PatientProfile/TabContent/BasicInfo";
import DiagnosisHistory from "../PatientProfile/TabContent/DiagnosisHistory";

const { Title, Text, Paragraph } = Typography;

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PatientTabs = ({ patientData, setSelectedImage, activeTab }) => {
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  const chartData =
    patientData?.diagnoseHistory
      ?.filter(item => item.confidenceScores?.length > 0)
      ?.map(item => ({
        date: new Date(item.uploadedAt).toLocaleDateString(),
        confidence: Math.max(...item.confidenceScores) * 100,
      })) || [];

  // Mock data for visualizations in the report  
  const diagnosisDistribution = [
    { name: 'No DR', value: 14 },
    { name: 'Mild NPDR', value: 8 },
    { name: 'Moderate NPDR', value: 4 },
    { name: 'Severe NPDR', value: 2 },
    { name: 'PDR', value: 1 }
  ];
  
  const medicationData = [
    { name: 'Jan', adherence: 95 },
    { name: 'Feb', adherence: 88 },
    { name: 'Mar', adherence: 92 },
    { name: 'Apr', adherence: 99 },
    { name: 'May', adherence: 85 },
    { name: 'Jun', adherence: 91 }
  ];

  const handleImageClick = url => setSelectedImage(url);
  
  const handleExportPDF = () => {
    setIsReportModalVisible(true);
    setIsGeneratingReport(true);
    setReportGenerated(false);
    
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      setReportGenerated(true);
    }, 2500);
  };
  
  const handleExportCSV = () => alert("Exporting as CSV...");
  
  const handleDownloadReport = () => {
    // In a real application, this would trigger the actual download
    alert("Downloading PDF report...");
    setIsReportModalVisible(false);
    setReportGenerated(false);
  };
  
  const handlePrintReport = () => {
    // In a real application, this would trigger the print dialog
    alert("Printing PDF report...");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "patientInfo":
        return patientData ? (
          <BasicInfo patient={patientData} />
        ) : (
          <Card
            className="shadow-md rounded-lg bg-white border border-gray-200"
            bodyStyle={{ padding: "16px" }}
          >
            <Text className="text-gray-600">No patient information available.</Text>
          </Card>
        );

      case "medicalHistory":
        return patientData?.medicalHistory?.length > 0 ? (
          <MedicalHistory patient={patientData} />
        ) : (
          <Card
            className="shadow-md rounded-lg bg-white border border-gray-200"
            bodyStyle={{ padding: "16px" }}
          >
            <Text className="text-gray-600">No medical history available.</Text>
          </Card>
        );

      case "diagnosisHistory":
        return patientData?.diagnoseHistory?.length > 0 ? (
        <DiagnosisHistory patient={patientData.diagnoseHistory} />
        ) : (
          <Card
            className="shadow-md rounded-lg bg-white border border-gray-200"
            bodyStyle={{ padding: "16px" }}
          >
            <Text className="text-gray-600">No diagnosis history available.</Text>
          </Card>
        );

      case "charts":
        return chartData.length > 0 ? (
          <Card
            className="shadow-md rounded-lg bg-white border border-gray-200"
            bodyStyle={{ padding: "16px" }}
          >
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
          <Card
            className="shadow-md rounded-lg bg-white border border-gray-200"
            bodyStyle={{ padding: "24px" }}
          >
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
                    <p className="text-gray-600 mb-4">Generate a detailed report with patient information, diagnosis history, and visualizations.</p>
                    <Button
                      type="primary"
                      icon={<FaFilePdf className="mr-2" />}
                      onClick={handleExportPDF}
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

  // PDF Report Preview Modal
  const renderReportPreview = () => {
    if (isGeneratingReport) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Generating comprehensive patient report...</p>
        </div>
      );
    }

    if (reportGenerated) {
      return (
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-1">Patient Health Report</h1>
                <p className="text-blue-100">Generated on {new Date().toLocaleDateString()}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <FaIdCard className="text-2xl" />
              </div>
            </div>
          </div>
          
          {/* Report Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Patient Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                <FaIdCard className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                  <div className="flex items-center mb-3">
                    <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500 mr-4" />
                    <div>
                      <h3 className="text-lg font-semibold">{patientData?.fullName || "John Doe"}</h3>
                      <p className="text-gray-500 text-sm">Patient ID: {patientData?.patientId || "P12345678"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center text-gray-600">
                      <FaBirthdayCake className="mr-2 text-blue-500" />
                      <span>Age: {patientData?.age || "45"} years</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaVenusMars className="mr-2 text-blue-500" />
                      <span>Gender: {patientData?.gender || "Male"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="mr-2 text-blue-500" />
                      <span>Phone: {patientData?.phoneNumber || "+1 234 567 8900"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="mr-2 text-blue-500" />
                      <span>Email: {patientData?.email || "john.doe@example.com"}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Health Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="font-medium">AB+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Height:</span>
                        <span className="font-medium">175 cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">78 kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">BMI:</span>
                        <span className="font-medium">25.5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Allergies:</span>
                        <span className="font-medium">Penicillin</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Diagnosis History Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                <FaHistory className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Diagnosis History</h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Diagnosis</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Confidence</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Doctor</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patientData?.diagnoseHistory?.slice(0, 5).map((diagnosis, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {new Date(diagnosis.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Tag 
                            color={diagnosis.label === "No_DR" ? "green" : diagnosis.label === "NPDR" ? "gold" : "red"}
                          >
                            {diagnosis.label || "No_DR"}
                          </Tag>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {Math.max(...(diagnosis.confidenceScores || [0])) * 100}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          Dr. {diagnosis.doctor || "Smith"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Diagnosis Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={diagnosisDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {diagnosisDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Confidence Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} unit="%" />
                        <Tooltip />
                        <Line type="monotone" dataKey="confidence" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Medical History Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                <FaPills className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Treatment & Medications</h2>
              </div>
              
              <div className="space-y-4">
                {patientData?.medicalHistory?.slice(0, 3).map((record, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{record.condition}</h4>
                        <p className="text-sm text-gray-500">
                          Diagnosed: {new Date(record.diagnosedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Tag color={record.status === "Active" ? "blue" : "green"}>
                        {record.status || "Active"}
                      </Tag>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Medications:</h5>
                      <div className="flex flex-wrap gap-2">
                        {record.medications?.map((med, i) => (
                          <Tag key={i} color="blue" className="px-2 py-1">
                            {med}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Medication Adherence</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={medicationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} unit="%" />
                      <Tooltip />
                      <Bar dataKey="adherence" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Recommendations Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Recommendations</h2>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-blue-100 p-1 rounded-full">
                      <CheckCircleOutlined className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Regular Eye Examinations</h4>
                      <p className="text-sm text-gray-600">Schedule eye examinations every 3-6 months to monitor retinopathy progression.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-blue-100 p-1 rounded-full">
                      <CheckCircleOutlined className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Blood Sugar Control</h4>
                      <p className="text-sm text-gray-600">Maintain HbA1c levels below 7.0% to slow the progression of diabetic retinopathy.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-blue-100 p-1 rounded-full">
                      <CheckCircleOutlined className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Blood Pressure Management</h4>
                      <p className="text-sm text-gray-600">Keep blood pressure below 130/80 mmHg to reduce risk of eye complications.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-blue-100 p-1 rounded-full">
                      <CheckCircleOutlined className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Lifestyle Modifications</h4>
                      <p className="text-sm text-gray-600">Regular exercise, balanced diet, and smoking cessation are recommended.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600 text-sm">
              <p>This report was generated by the Diabetic Retinopathy Diagnosis System.</p>
              <p className="mt-1">For medical advice, please consult with your healthcare provider.</p>
            </div>
          </div>
          
          {/* Report Actions */}
          <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-200">
            <Button 
              icon={<FaFileDownload className="mr-2" />}
              onClick={handleDownloadReport}
              className="flex items-center"
            >
              Download Report
            </Button>
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
      );
    }
  };

  return (
    <div className="p-6">
      {renderContent()}
      
      <Modal
        title={
          <div className="flex items-center gap-2 text-xl">
            <FilePdfOutlined className="text-red-500" />
            <span>Comprehensive Patient Report</span>
          </div>
        }
        visible={isReportModalVisible}
        onCancel={() => {
          setIsReportModalVisible(false);
          setReportGenerated(false);
        }}
        footer={null}
        width={1000}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
      >
        {renderReportPreview()}
      </Modal>
    </div>
  );
};

export default PatientTabs;