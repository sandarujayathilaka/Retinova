import React, { useState } from "react";
import { Card, Typography, Progress, Button, Form, Input, Tabs } from "antd";
import {
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaInfoCircle,
  FaSave,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { UploadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import PatientTabs from "./PatientTabs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ResultsSection = ({
  imageUrl,
  prediction,
  handleSavePrescription,
  isSaving,
  resetForNewUpload,
  setSelectedImage,
  patientData,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("currentResults"); // Default to Current Results

  const getPredictionDetails = type => {
    switch (type) {
      case "advanced":
        return { color: "red", icon: <FaExclamationCircle className="text-red-500" /> };
      case "early":
        return { color: "orange", icon: <FaClock className="text-orange-500" /> };
      case "normal":
        return { color: "green", icon: <FaCheckCircle className="text-green-500" /> };
      default:
        return { color: "gray", icon: null };
    }
  };

  const handleImageClick = url => setSelectedImage(url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-md rounded-lg border border-gray-200 bg-white">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ padding: "0 24px" }}
          className="border-b border-gray-200"
        >
          <TabPane tab="Current Results" key="currentResults">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prediction Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className="w-32 h-32 rounded-lg object-cover cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => handleImageClick(imageUrl)}
                      title="Click to zoom/rotate"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getPredictionDetails(prediction.type).icon}
                        <Text
                          strong
                          className={`text-xl capitalize text-${getPredictionDetails(prediction.type).color}-500`}
                        >
                          {prediction.type}
                        </Text>
                      </div>
                      <Text className="text-base text-gray-600 font-medium">Confidence Level</Text>
                      <Progress
                        percent={Math.round(prediction.confidence * 100)}
                        strokeColor={getPredictionDetails(prediction.type).color}
                        size="small"
                        className="w-full mt-1"
                      />
                      <Text className="text-sm text-gray-600">
                        Score: {(prediction.confidence * 100).toFixed(2)}%
                      </Text>
                    </div>
                  </div>
                  <Text className="text-xs text-gray-500 flex items-center gap-1">
                    <FaInfoCircle /> AI-generated result. Consult a specialist.
                  </Text>
                </div>

                {/* Prescription Section */}
                <div className="space-y-4">
                  <Title level={4} className="text-lg text-gray-800 font-semibold">
                    Doctor's Prescription
                  </Title>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSavePrescription}
                    className="space-y-4"
                    initialValues={{ tests: [{ testName: "" }] }}
                  >
                    <Form.Item
                      label={<Text strong>Prescribed Medicine</Text>}
                      name="medicine"
                      rules={[{ message: "Enter prescribed medicine" }]}
                    >
                      <Input
                        placeholder="e.g., Insulin"
                        className="rounded-md border-gray-300 focus:border-blue-500 shadow-sm"
                      />
                    </Form.Item>

                    <Form.List name="tests">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }, index) => (
                            <div key={key} className="flex items-end gap-4">
                              <Form.Item
                                {...restField}
                                label={index === 0 ? <Text strong>Recommended Tests</Text> : null}
                                name={[name, "testName"]}
                                rules={[{ required: true, message: "Enter test name" }]}
                                className="flex-1"
                              >
                                <Input
                                  placeholder="e.g., Blood Sugar"
                                  className="rounded-md border-gray-300 focus:border-blue-500 shadow-sm"
                                />
                              </Form.Item>
                              {fields.length > 1 && (
                                <Button
                                  icon={<FaTrash />}
                                  onClick={() => remove(name)}
                                  className="text-red-500 hover:text-red-600 border-none"
                                />
                              )}
                            </div>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<FaPlus />}
                              className="flex items-center justify-center gap-2 text-gray-700 hover:text-blue-600"
                            >
                              Add Another Test
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>

                    <Form.Item label={<Text strong>Clinical Notes</Text>} name="note">
                      <TextArea
                        rows={3}
                        placeholder="Add clinical notes..."
                        className="rounded-md border-gray-300 focus:border-blue-500 shadow-sm"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        icon={<FaSave />}
                        htmlType="submit"
                        disabled={isSaving}
                        loading={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 rounded-md shadow-sm"
                      >
                        {isSaving ? "Saving..." : "Save Prescription"}
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </div>
          </TabPane>

          {/* Delegate other tabs to PatientTabs */}
          <TabPane tab="Patient Information" key="patientInfo">
            <PatientTabs
              patientData={patientData}
              setSelectedImage={setSelectedImage}
              activeTab="patientInfo"
            />
          </TabPane>
          <TabPane tab="Medical History" key="medicalHistory">
            <PatientTabs
              patientData={patientData}
              setSelectedImage={setSelectedImage}
              activeTab="medicalHistory"
            />
          </TabPane>
          <TabPane tab="Diagnosis History" key="diagnosisHistory">
            <PatientTabs
              patientData={patientData}
              setSelectedImage={setSelectedImage}
              activeTab="diagnosisHistory"
            />
          </TabPane>
          <TabPane tab="Trend Analysis" key="charts">
            <PatientTabs
              patientData={patientData}
              setSelectedImage={setSelectedImage}
              activeTab="charts"
            />
          </TabPane>
          <TabPane tab="Export" key="export">
            <PatientTabs
              patientData={patientData}
              setSelectedImage={setSelectedImage}
              activeTab="export"
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Upload Another Image Button */}
      <div className="mt-6 text-center">
        <Button
          type="default"
          icon={<UploadOutlined />}
          onClick={resetForNewUpload}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md shadow-sm"
        >
          Upload Another Image
        </Button>
      </div>
    </motion.div>
  );
};

export default ResultsSection;
