import React, { useEffect, useState } from "react";
import { Card, Typography, Progress, Button, Form, Input, Tabs, Space, Tooltip } from "antd";
import { motion } from "framer-motion";
import PatientTabs from "./PatientTabs";
import PatientReport from "../reports/PatientReport";
import DiagnosisHistory from "../PatientProfile/TabContent/DiagnosisHistory";
import ConfirmDialog from "../custom-dialog/ConfirmDialog";
import { FaFilePdf, FaCamera } from "react-icons/fa";
import { api } from "@/services/api.service"; // Adjust this import based on your project structure
import toast from "react-hot-toast"; // Ensure toast is imported if used

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
  const [activeTab, setActiveTab] = useState("currentResults");
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [showNewScanDialog, setShowNewScanDialog] = useState(false);
  const [showQuickSaveDialog, setShowQuickSaveDialog] = useState(false);
  const [showSavePrescriptionDialog, setShowSavePrescriptionDialog] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false); // Added loading state

  const getMaxConfidence = (confidenceScores) => {
    if (!confidenceScores || confidenceScores.length === 0) return "N/A";
    return `${(Math.max(...confidenceScores) * 100).toFixed(1)}%`;
  };

  useEffect(() => {
    const fetchTests = async () => {
      setLoadingTests(true);
      try {
        const response = await api.get("tests");
        console.log("Available tests:", response.data); 
        setAvailableTests(response.data); 
      } catch (error) {
        console.error("Error fetching tests:", error);
        toast.error("Failed to fetch available tests.");
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTests();
  }, []);

  const openImage = (url) => {
    setSelectedImage(url);
  };

  const getPredictionDetails = (type) => {
    // ... (unchanged, keeping your existing logic)
    switch (type) {
      case "advanced":
      case "PDR":
      case "CRVO":
      case "wet":
        return {
          color: "red",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-red-600"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          ),
          progressColor: "#ef4444",
          message: "Advanced signs detected. Immediate specialist consultation recommended.",
        };
      case "early":
      case "dry":
      case "NPDR":
      case "BRVO":
        return {
          color: "orange",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-700",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-amber-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          ),
          progressColor: "#f59e0b",
          message: "Early signs detected. Regular monitoring and lifestyle changes advised.",
        };
      case "normal":
      case "No_DR":
      case "Healthy":
        return {
          color: "green",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-green-600"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ),
          progressColor: "#22c55e",
          message: "No signs detected. Continue with regular check-ups.",
        };
      default:
        return {
          color: "gray",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          ),
          progressColor: "#6b7280",
          message: "Assessment completed.",
        };
    }
  };

  const handleImageClick = (url) => setSelectedImage(url);

  const predictionDetails = getPredictionDetails(prediction.type);
  const confidencePercent = Math.round(prediction.confidence * 100);

  const handleNewScanClick = () => {
    setShowNewScanDialog(true);
  };

  const handleConfirmNewScan = () => {
    resetForNewUpload();
    setShowNewScanDialog(false);
  };

  const handleCancelNewScan = () => {
    setShowNewScanDialog(false);
  };

  const handleQuickSaveClick = () => {
    setShowQuickSaveDialog(true);
  };

  const handleConfirmQuickSave = () => {
    const emptyPrescription = {
      medicine: "",
      tests: [],
      note: "",
    };
    handleSavePrescription(emptyPrescription);
    setShowQuickSaveDialog(false);
  };

  const handleCancelQuickSave = () => {
    setShowQuickSaveDialog(false);
  };

  const handleSavePrescriptionClick = () => {
    setShowSavePrescriptionDialog(true);
  };

  const handleConfirmSavePrescription = () => {
    const prescriptionData = form.getFieldsValue();
    handleSavePrescription(prescriptionData);
    setShowSavePrescriptionDialog(false);
  };

  const handleCancelSavePrescription = () => {
    setShowSavePrescriptionDialog(false);
  };

  const handleExportPDF = () => {
    setIsReportVisible(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Compact Action Buttons */}
      <div className="mb-4 flex justify-end gap-3">
        <Button
          onClick={handleNewScanClick}
          className="px-4 py-1 h-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-md shadow-sm hover:shadow transition-all flex items-center justify-center"
        >
          <FaCamera className="mr-2 text-gray-500" size={14} />
          <span>New Scan</span>
        </Button>
        <Button
          onClick={handleExportPDF}
          className="px-4 py-1 h-auto bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-md shadow-sm hover:shadow transition-all flex items-center justify-center"
        >
          <FaFilePdf className="mr-2" size={14} />
          <span>Export PDF</span>
        </Button>
      </div>

      <Card className="rounded-xl shadow-md border border-indigo-100 overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          className="diagnosis-tabs"
        >
          <TabPane
            tab={
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                Diagnosis Results
              </span>
            }
            key="currentResults"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Prediction Section */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <div
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => handleImageClick(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt="Retinal scan"
                          className="w-full h-auto rounded-lg object-cover shadow-md border border-gray-200 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="absolute bottom-0 w-full p-2 text-center text-white text-xs font-medium">
                            Click to enlarge
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-300"
                          >
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-2/3">
                      <div
                        className={`rounded-lg p-5 ${predictionDetails.bgColor} ${predictionDetails.borderColor} border shadow-sm`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-white bg-opacity-60 shadow-sm">
                            {predictionDetails.icon}
                          </div>
                          <div>
                            <Text className={`text-sm font-medium ${predictionDetails.textColor}`}>
                              AI Assessment
                            </Text>
                            <Text strong className={`text-lg block capitalize ${predictionDetails.textColor}`}>
                              {prediction.type}
                            </Text>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={`font-medium ${predictionDetails.textColor}`}>Confidence Level</span>
                            <span className={`${predictionDetails.textColor} font-semibold`}>
                              {confidencePercent}%
                            </span>
                          </div>
                          <Progress
                            percent={confidencePercent}
                            showInfo={false}
                            strokeColor={predictionDetails.progressColor}
                            trailColor="#e5e7eb"
                            strokeWidth={8}
                            className="rounded-full"
                          />
                        </div>

                        <div className="mt-4 text-sm">
                          <p className={`${predictionDetails.textColor}`}>{predictionDetails.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prescription Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 shadow-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-white"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                          <path d="M3.22 12H9.5l.5-1 .5 1h6.28"></path>
                        </svg>
                      </div>
                      <Title level={4} className="text-lg text-gray-800 font-semibold m-0">
                        Doctor's Prescription
                      </Title>
                    </div>

                    <Tooltip title="Save without prescription">
                      <Button
                        onClick={handleQuickSaveClick}
                        type="default"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200 rounded text-xs py-1 px-2 flex items-center h-auto"
                        disabled={isSaving}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3 h-3 mr-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Quick Save
                      </Button>
                    </Tooltip>
                  </div>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSavePrescriptionClick}
                    initialValues={{ tests: [{ testName: "" }] }}
                    className="space-y-5"
                  >
                    <Form.Item
                      label={<Text strong className="text-gray-700">Prescribed Medicine</Text>}
                      name="medicine"
                    >
                      <Input
                        placeholder="e.g., Insulin, Metformin"
                        className="rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
                      />
                    </Form.Item>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Text strong className="text-gray-700">Recommended Tests</Text>
                        <Button
                          type="default"
                          onClick={() => {
                            const tests = form.getFieldValue("tests") || [];
                            form.setFieldsValue({
                              tests: [...tests, { testName: "" }],
                            });
                          }}
                          className="text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-md flex items-center h-8 shadow-sm"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 mr-1"
                          >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Add Test
                        </Button>
                      </div>

                      <Form.List name="tests">
                        {(fields, { add, remove }) => (
                          <div className="space-y-3">
                            {fields.map(({ key, name, ...restField }, index) => (
                              <div
                                key={key}
                                className="flex items-center gap-2 animate__animated animate__fadeIn"
                              >
                                <div className="flex-grow relative">
                                  <Form.Item
                                    {...restField}
                                    name={[name, "testName"]}
                                    rules={[{ required: true, message: "Please select a test" }]}
                                    className="mb-0"
                                  >
                                    <select
                                      className="w-full h-10 pl-9 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                      disabled={loadingTests}
                                    >
                                      {loadingTests ? (
                                        <option value="">Loading tests...</option>
                                      ) : (
                                        <>
                                          <option value="">Select Test {index + 1}</option>
                                          {availableTests
                                            .filter((test) => test.isEnabled)
                                            .map((test) => (
                                              <option key={test._id} value={test.name}>
                                                {test.name}
                                              </option>
                                            ))}
                                        </>
                                      )}
                                    </select>
                                  </Form.Item>
                                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="w-4 h-4 text-gray-400"
                                    >
                                      <path d="M14 11h7"></path>
                                      <path d="M14 1h7"></path>
                                      <path d="M3 13v10h18V13"></path>
                                      <path d="M3 1v10h18V1"></path>
                                    </svg>
                                  </div>
                                </div>

                                {fields.length > 1 && (
                                  <Tooltip title="Remove test">
                                    <Button
                                      type="text"
                                      onClick={() => remove(name)}
                                      className="flex items-center justify-center hover:bg-red-50 transition-colors rounded-full w-8 h-8 text-red-500"
                                      icon={
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="w-4 h-4"
                                        >
                                          <line x1="18" y1="6" x2="6" y2="18"></line>
                                          <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                      }
                                    />
                                  </Tooltip>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Form.List>
                    </div>

                    <Form.Item label={<Text strong className="text-gray-700">Clinical Notes</Text>} name="note">
                      <TextArea
                        rows={4}
                        placeholder="Add important notes about the diagnosis, treatment plan, or follow-up instructions..."
                        className="rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
                      />
                    </Form.Item>

                    <Form.Item className="mb-0">
                      <Button
                        type="primary"
                        htmlType="submit"
                        disabled={isSaving}
                        loading={isSaving}
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-md flex items-center justify-center"
                      >
                        {!isSaving && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5 mr-2"
                          >
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                        )}
                        {isSaving ? "Saving Prescription..." : "Save Prescription"}
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M18 20a6 6 0 0 0-12 0"></path>
                  <circle cx="12" cy="10" r="4"></circle>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                Patient Info
              </span>
            }
            key="patientInfo"
          >
            <PatientTabs patientData={patientData} setSelectedImage={setSelectedImage} activeTab="patientInfo" />
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M3 2v1c0 1 2 1 2 2S3 6 3 7s2 1 2 2-2 1-2 2 2 1 2 2"></path>
                  <path d="M18 6h.01"></path>
                  <path d="M6 18h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-5"></path>
                  <rect x="10" y="6" width="8" height="4" rx="1"></rect>
                  <path d="M6 10v8"></path>
                </svg>
                Medical History
              </span>
            }
            key="medicalHistory"
          >
            <PatientTabs patientData={patientData} setSelectedImage={setSelectedImage} activeTab="medicalHistory" />
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
                Past Diagnoses
              </span>
            }
            key="diagnosisHistory"
          >
            <DiagnosisHistory
              patient={patientData}
              getMaxConfidence={getMaxConfidence}
              openImage={openImage}
              isFromPreMonitoring={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      <PatientReport
        patientData={patientData}
        prediction={prediction}
        imageUrl={imageUrl}
        visible={isReportVisible}
        onClose={() => setIsReportVisible(false)}
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showNewScanDialog}
        onConfirm={handleConfirmNewScan}
        onCancel={handleCancelNewScan}
        message="Are you sure you want to start a new scan? Current results will be discarded."
        confirmText="Yes, Start New Scan"
        cancelText="Cancel"
      />
      <ConfirmDialog
        isOpen={showQuickSaveDialog}
        onConfirm={handleConfirmQuickSave}
        onCancel={handleCancelQuickSave}
        message="Are you sure you want to save without adding a prescription?"
        confirmText="Yes, Save"
        cancelText="Cancel"
      />
      <ConfirmDialog
        isOpen={showSavePrescriptionDialog}
        onConfirm={handleConfirmSavePrescription}
        onCancel={handleCancelSavePrescription}
        message="Are you sure you want to save this prescription? Once saved, it cannot be changed."
        confirmText="Yes, Save"
        cancelText="Cancel"
      />
    </motion.div>
  );
};

export default ResultsSection;