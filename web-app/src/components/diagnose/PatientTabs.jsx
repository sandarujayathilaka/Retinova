import React from "react";
import { Card, Typography, Tag, Button, Avatar } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";
import {
  FaFilePdf,
  FaFileCsv,
  FaPills,
  FaCalendarAlt,
  FaImage,
  FaChartLine,
  FaVenusMars,
  FaBirthdayCake,
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
} from "recharts";

const { Title, Text } = Typography;

const PatientTabs = ({ patientData, setSelectedImage, activeTab }) => {
  const chartData =
    patientData?.diagnoseHistory
      ?.filter(item => item.confidenceScores?.length > 0)
      ?.map(item => ({
        date: new Date(item.uploadedAt).toLocaleDateString(),
        confidence: Math.max(...item.confidenceScores) * 100,
      })) || [];

  const handleImageClick = url => setSelectedImage(url);
  const handleExportPDF = () => alert("Exporting as PDF...");
  const handleExportCSV = () => alert("Exporting as CSV...");

  const renderContent = () => {
    switch (activeTab) {
      case "patientInfo":
        return patientData ? (
          <Card
            className="shadow-md rounded-lg bg-white border border-gray-200"
            title={
              <div className="flex items-center gap-4">
                <Avatar size={48} icon={<UserOutlined />} className="bg-blue-500" />
                <div>
                  <Title level={4} className="text-lg text-gray-800 font-semibold m-0">
                    {patientData.fullName}
                  </Title>
                  <Text className="text-sm text-gray-600">ID: {patientData.patientId}</Text>
                </div>
              </div>
            }
            bodyStyle={{ padding: "16px" }} // Unified padding
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Age */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 hover:shadow-sm transition-shadow">
                <FaBirthdayCake className="text-blue-500 text-xl" />
                <div>
                  <Text className="text-sm text-gray-500">Age</Text>
                  <Text strong className="block text-base text-gray-800">
                    {patientData.age}
                  </Text>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 hover:shadow-sm transition-shadow">
                <FaVenusMars className="text-blue-500 text-xl" />
                <div>
                  <Text className="text-sm text-gray-500">Gender</Text>
                  <Text strong className="block text-base text-gray-800">
                    {patientData.gender}
                  </Text>
                </div>
              </div>

              {/* Contact Number */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 hover:shadow-sm transition-shadow">
                <PhoneOutlined className="text-blue-500 text-xl" />
                <div>
                  <Text className="text-sm text-gray-500">Contact Number</Text>
                  <Text strong className="block text-base text-gray-800">
                    {patientData.contactNumber}
                  </Text>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 hover:shadow-sm transition-shadow">
                <MailOutlined className="text-blue-500 text-xl" />
                <div>
                  <Text className="text-sm text-gray-500">Email</Text>
                  <Text strong className="block text-base text-gray-800">
                    {patientData.email || "N/A"}
                  </Text>
                </div>
              </div>

              {/* Address */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 hover:shadow-sm transition-shadow">
                <HomeOutlined className="text-blue-500 text-xl" />
                <div>
                  <Text className="text-sm text-gray-500">Address</Text>
                  <Text strong className="block text-base text-gray-800">
                    {patientData.address || "N/A"}
                  </Text>
                </div>
              </div>

              {/* Categories */}
              <div className="col-span-1 md:col-span-2 flex items-start gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 hover:shadow-sm transition-shadow">
                <FaChartLine className="text-blue-500 text-xl mt-1" />
                <div>
                  <Text className="text-sm text-gray-500">Categories</Text>
                  <div className="mt-1">
                    {patientData.category.map((cat, i) => (
                      <Tag key={i} color="blue" className="mr-1 mb-1">
                        {cat}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
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
          <Card
            className="shadow-md rounded-lg bg-white border border-gray-200"
            title={
              <Title level={4} className="text-lg text-gray-800 font-semibold m-0">
                Medical History
              </Title>
            }
            bodyStyle={{ padding: "16px" }} // Unified padding
          >
            {patientData.medicalHistory.map((item, index) => (
              <Card
                key={index}
                className="shadow-sm rounded-md border border-gray-100 hover:shadow-md transition-shadow duration-200 bg-gray-50 mb-4 last:mb-0"
                bodyStyle={{ padding: "16px" }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaPills className="text-blue-500 text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Text strong className="text-base text-gray-800">
                        {item.condition}
                      </Text>
                      <Tag
                        color={item.medications.length > 0 ? "green" : "gray"}
                        className="text-xs font-medium"
                      >
                        {item.medications.length > 0 ? "Treated" : "Untreated"}
                      </Tag>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <Text className="text-sm text-gray-600">
                        Diagnosed: {new Date(item.diagnosedAt).toLocaleDateString()}
                      </Text>
                    </div>
                    <Text className="text-sm text-gray-600 block mt-1">
                      Medications:{" "}
                      {item.medications.length > 0
                        ? item.medications.map((med, i) => (
                            <Tag key={i} color="blue" className="mr-1 mb-1">
                              {med}
                            </Tag>
                          ))
                        : "None"}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </Card>
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
          <Card
            className="shadow-md rounded-lg bg-white border border-gray-200"
            title={
              <Title level={4} className="text-lg text-gray-800 font-semibold m-0">
                Diagnosis History
              </Title>
            }
            bodyStyle={{ padding: "16px" }} // Unified padding
          >
            {patientData.diagnoseHistory.map((item, index) => (
              <Card
                key={index}
                className="shadow-sm rounded-md border border-gray-100 hover:shadow-md transition-shadow duration-200 bg-gray-50 mb-4 last:mb-0"
                bodyStyle={{ padding: "16px" }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center cursor-pointer relative overflow-hidden"
                      onClick={() => handleImageClick(item.imageUrl)}
                      title="Click to zoom/rotate"
                    >
                      <img
                        src={item.imageUrl}
                        alt="Diagnosis"
                        className="w-full h-full object-cover"
                      />
                      <FaImage className="text-gray-500 text-xl absolute opacity-0 hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Text strong className="text-base text-gray-800">
                        {item.diagnosis}
                      </Text>
                      <Tag
                        color={
                          item.status === "Confirmed"
                            ? "green"
                            : item.status === "Pending"
                              ? "orange"
                              : "gray"
                        }
                        className="text-xs font-medium"
                      >
                        {item.status}
                      </Tag>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <Text className="text-sm text-gray-600">
                        Uploaded: {new Date(item.uploadedAt).toLocaleString()}
                      </Text>
                    </div>
                    {item.confidenceScores?.length > 0 && (
                      <Text className="text-sm text-gray-600 block mt-1">
                        Confidence:{" "}
                        <Tag color="purple" className="mr-1">
                          {Math.round(Math.max(...item.confidenceScores) * 100)}%
                        </Tag>
                      </Text>
                    )}
                    {item.recommend && (
                      <>
                        <Text className="text-sm text-gray-600 block mt-1">
                          Medicine:{" "}
                          {item.recommend.medicine ? (
                            <Tag color="blue">{item.recommend.medicine}</Tag>
                          ) : (
                            "None"
                          )}
                        </Text>
                        <Text className="text-sm text-gray-600 block mt-1">
                          Tests:{" "}
                          {item.recommend.tests?.length > 0
                            ? item.recommend.tests.map((test, i) => (
                                <Tag key={i} color="cyan" className="mr-1 mb-1">
                                  {test.testName} ({test.status})
                                </Tag>
                              ))
                            : "None"}
                        </Text>
                        <Text className="text-sm text-gray-600 block mt-1">
                          Note: {item.recommend.note || "N/A"}
                        </Text>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </Card>
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
            bodyStyle={{ padding: "16px" }}
          >
            <div className="flex gap-4">
              <Button
                icon={<FaFilePdf />}
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 rounded-md"
              >
                Export as PDF
              </Button>
              <Button
                icon={<FaFileCsv />}
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 rounded-md"
              >
                Export as CSV
              </Button>
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
