import React, { useCallback, useState, useEffect } from "react";
import uploadIcon from "../../assets/icons/upload.svg"; // Verify this path
import { useDropzone } from "react-dropzone";
import { PushSpinner } from "react-spinners-kit";
import {
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaInfoCircle,
  FaFilePdf,
  FaFileCsv,
  FaSearchPlus,
  FaUndo,
  FaSave,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import {
  Alert,
  Tabs,
  Progress,
  Card,
  Typography,
  List,
  Button,
  Avatar,
  Modal,
  Input,
  Form,
} from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
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
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Diagnose = ({
  disease,
  handleSubmission,
  handleSavePrescription,
  isSubmitting,
  isSaving,
  prediction,
  patientData,
  errorMessage,
  resetState,
}) => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [activeTab, setActiveTab] = useState("patientInfo");
  const [showUploader, setShowUploader] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [availableTests, setAvailableTests] = useState([]);
  const [form] = Form.useForm();

  const onDrop = useCallback(
    acceptedFiles => {
      setUploadError(null);
      if (acceptedFiles.length !== 1) {
        setUploadError("Please upload exactly one image.");
        return;
      }
      const file = acceptedFiles[0];
      if (!file.type.startsWith("image/")) {
        setUploadError("Please upload a valid image file (JPEG, PNG).");
        return;
      }
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setShowUploader(false);
      handleSubmission(file);
    },
    [handleSubmission],
  );

  // Fetch tests from the API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get("tests");
        console.log("Available tests:", response.data);
        setAvailableTests(response.data); 
      } catch (error) {
        console.error("Error fetching tests:", error);
        toast.error("Failed to fetch available tests.");
      }
    };
    fetchTests();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
  });

  const resetForNewUpload = () => {
    setImage(null);
    setImageUrl(null);
    setUploadError(null);
    setShowUploader(true);
    resetState();
    form.resetFields();
  };

  const handleError = () => {
    if (
      errorMessage?.includes("No patient profile found") ||
      errorMessage?.includes("Invalid filename format")
    ) {
      setTimeout(() => {
        resetForNewUpload();
      }, 3000);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      handleError();
    }
  }, [errorMessage]);

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

  const handleImageClick = url => {
    setSelectedImage(url);
    setZoomLevel(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleImageDownload = () => {
    if (imageUrl && image) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = image.name;
      link.click();
    }
  };

  const chartData =
    patientData?.diagnoseHistory
      ?.filter(item => item.confidenceScores?.length > 0)
      ?.map(item => ({
        date: new Date(item.uploadedAt).toLocaleDateString(),
        confidence: Math.max(...item.confidenceScores) * 100,
      })) || [];

  const handleExportPDF = () => alert("Exporting as PDF...");
  const handleExportCSV = () => alert("Exporting as CSV...");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Title level={2} className="text-gray-800 mb-6 font-semibold text-center">
        Diagnose <span className="text-blue-600 font-medium">{disease}</span>
      </Title>

      {/* Upload Section */}
      {!isSubmitting && !prediction?.type && !errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="shadow-xl rounded-xl overflow-hidden border-none bg-gradient-to-br from-white to-gray-50"
            bodyStyle={{ padding: "0" }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <Title level={3} className="text-white mb-1">
                Retinal Scan
              </Title>
              <Text className="text-white opacity-80">
                Drop an image to analyze Diabetic Retinopathy
              </Text>
            </div>
            <div className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                <img src={uploadIcon} alt="Upload" className="w-16 h-16 mb-4 opacity-70" />
                {isDragActive ? (
                  <Text className="text-lg text-gray-600 font-medium">Drop your image here...</Text>
                ) : (
                  <>
                    <Text className="text-lg text-gray-700 font-medium">
                      Drag & drop or{" "}
                      <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                        click to upload
                      </span>
                    </Text>
                    <Text className="text-sm text-gray-500 mt-2">
                      File format: <strong>patientId_randomtext.jpg</strong> (e.g.,
                      123456_image.jpg)
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                      Supported: JPEG, PNG | Max size: 10MB | 1 file only
                    </Text>
                  </>
                )}
              </div>
              {uploadError && (
                <Alert
                  message={uploadError}
                  type="error"
                  showIcon
                  className="mt-4 rounded-md shadow-sm"
                />
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Loading Screen */}
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-64"
        >
          <PushSpinner size={50} color="#3B82F6" />
          <Text className="mt-4 text-lg text-gray-600 font-medium">Analyzing Image...</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Processing your retinal scan. Please wait.
          </Text>
        </motion.div>
      )}

      {/* Results Section */}
      {prediction?.type && !isSubmitting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border-none">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Image and Prediction */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    className="w-32 h-32 rounded-lg object-cover cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                    onClick={() => handleImageClick(imageUrl)}
                    title="Click to zoom/rotate"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getPredictionDetails(prediction.type).icon}
                      <Text
                        strong
                        className={`text-2xl capitalize text-${getPredictionDetails(prediction.type).color}-500`}
                      >
                        {prediction.type}
                      </Text>
                    </div>
                    <Text className="text-gray-600 font-medium">Confidence Level</Text>
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
                <Button
                  size="small"
                  onClick={handleImageDownload}
                  className="bg-blue-500 text-white hover:bg-blue-600 rounded-md"
                >
                  Download Image
                </Button>
                <Text className="text-xs text-gray-500 flex items-center gap-1">
                  <FaInfoCircle /> AI-generated result. Consult a specialist.
                </Text>
              </div>

              {/* Right: Prescription Form */}
              <div className="space-y-4">
                <Title level={4} className="text-gray-800">
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
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 rounded-md shadow-md"
                    >
                      {isSaving ? "Saving..." : "Save Prescription"}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            animated
            className="mt-6"
            tabBarStyle={{ fontWeight: "500", color: "#1f2937" }}
          >
            <TabPane tab="Patient Information" key="patientInfo">
              {patientData && (
                <Card className="shadow-md rounded-xl bg-white">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
                    <div>
                      <Text strong className="text-lg text-gray-800">
                        {patientData.fullName}
                      </Text>
                      <Text className="block text-gray-600">ID: {patientData.patientId}</Text>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Text className="text-gray-500">Age</Text>
                      <Text strong className="block text-gray-800">
                        {patientData.age}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-gray-500">Gender</Text>
                      <Text strong className="block text-gray-800">
                        {patientData.gender}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-gray-500">Contact Number</Text>
                      <Text strong className="block text-gray-800">
                        {patientData.contactNumber}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-gray-500">Email</Text>
                      <Text strong className="block text-gray-800">
                        {patientData.email || "N/A"}
                      </Text>
                    </div>
                    <div className="col-span-2">
                      <Text className="text-gray-500">Address</Text>
                      <Text strong className="block text-gray-800">
                        {patientData.address || "N/A"}
                      </Text>
                    </div>
                    <div className="col-span-2">
                      <Text className="text-gray-500">Categories</Text>
                      <Text strong className="block text-gray-800">
                        {patientData.category.join(", ")}
                      </Text>
                    </div>
                  </div>
                </Card>
              )}
            </TabPane>

            <TabPane tab="Medical History" key="medicalHistory">
              {patientData?.medicalHistory?.length > 0 && (
                <Card className="shadow-md rounded-xl bg-white">
                  <List
                    dataSource={patientData.medicalHistory}
                    renderItem={item => (
                      <List.Item className="border-b last:border-b-0">
                        <List.Item.Meta
                          title={
                            <Text strong className="text-gray-800">
                              {item.condition}
                            </Text>
                          }
                          description={
                            <div>
                              <Text className="text-gray-600">
                                Diagnosed: {new Date(item.diagnosedAt).toLocaleDateString()}
                              </Text>
                              <Text className="block text-gray-600">
                                Medications: {item.medications.join(", ") || "None"}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </TabPane>

            <TabPane tab="Diagnosis History" key="diagnosisHistory">
              {patientData?.diagnoseHistory?.length > 0 && (
                <Card className="shadow-md rounded-xl bg-white">
                  <List
                    dataSource={patientData.diagnoseHistory}
                    renderItem={item => (
                      <List.Item className="border-b last:border-b-0">
                        <List.Item.Meta
                          avatar={
                            <img
                              src={item.imageUrl}
                              alt="Diagnosis"
                              className="w-16 h-16 rounded-lg object-cover cursor-pointer shadow-sm"
                              onClick={() => handleImageClick(item.imageUrl)}
                              title="Click to zoom/rotate"
                            />
                          }
                          title={
                            <Text strong className="text-gray-800">
                              {item.diagnosis}
                            </Text>
                          }
                          description={
                            <div>
                              <Text className="text-gray-600">
                                Uploaded: {new Date(item.uploadedAt).toLocaleString()}
                              </Text>
                              <Text className="block text-gray-600">Status: {item.status}</Text>
                              {item.confidenceScores?.length > 0 && (
                                <Text className="block text-gray-600">
                                  Confidence: {Math.round(Math.max(...item.confidenceScores) * 100)}
                                  %
                                </Text>
                              )}
                              {item.recommend && (
                                <>
                                  <Text className="block text-gray-600">
                                    Medicine: {item.recommend.medicine || "None"}
                                  </Text>
                                  <Text className="block text-gray-600">
                                    Tests:{" "}
                                    {item.recommend.tests?.length > 0
                                      ? item.recommend.tests
                                          .map(test => `${test.testName} (${test.status})`)
                                          .join(", ")
                                      : "None"}
                                  </Text>
                                  <Text className="block text-gray-600">
                                    Note: {item.recommend.note || "N/A"}
                                  </Text>
                                </>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </TabPane>

            <TabPane tab="Export" key="export">
              <Card className="shadow-md rounded-xl bg-white">
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
            </TabPane>
          </Tabs>

          {/* New Upload Button */}
          <div className="mt-6 text-center">
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={resetForNewUpload}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md shadow-md"
            >
              Upload Another Image
            </Button>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {errorMessage && !isSubmitting && showUploader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4"
        >
          <Alert
            message="Error Occurred"
            description={errorMessage}
            type="error"
            showIcon
            className="mb-6 rounded-md shadow-sm"
          />
        </motion.div>
      )}

      {/* Image Zoom/Rotate Modal */}
      <Modal
        visible={!!selectedImage}
        footer={null}
        onCancel={() => setSelectedImage(null)}
        width={800}
        bodyStyle={{ padding: "20px", textAlign: "center" }}
        className="rounded-lg"
      >
        <img
          src={selectedImage}
          alt="Zoomed"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            transition: "transform 0.3s ease",
            maxWidth: "100%",
            maxHeight: "70vh",
          }}
        />
        <div className="mt-4 flex justify-center gap-4">
          <Button
            icon={<FaSearchPlus />}
            onClick={handleZoomIn}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-md"
          >
            Zoom In
          </Button>
          <Button
            icon={<FaSearchPlus />}
            onClick={handleZoomOut}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-md"
            style={{ transform: "rotate(180deg)" }}
          >
            Zoom Out
          </Button>
          <Button
            icon={<FaUndo />}
            onClick={handleRotate}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-md"
          >
            Rotate
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Diagnose;
