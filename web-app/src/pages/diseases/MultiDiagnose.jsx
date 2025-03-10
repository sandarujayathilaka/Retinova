import React, { useCallback, useState } from "react";
import upload from "../../assets/icons/upload.svg";
import { useDropzone } from "react-dropzone";
import { PushSpinner } from "react-spinners-kit";
import {
  FaExclamationCircle,
  FaCheckCircle,
  FaTimes,
  FaUser,
  FaNotesMedical,
  FaEye,
  FaSave,
} from "react-icons/fa";
import { Button, Tabs, Modal, Progress, Descriptions, List } from "antd";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const { TabPane } = Tabs;

const MultiDiagnose = ({
  disease,
  handleSubmission,
  isSubmitting,
  predictions,
  patientData,
  missingPatientIds,
  showConfirmation,
  handleConfirmation,
  handleSaveAll,
  isSaving,
  isSaved,
}) => {
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [expandedCards, setExpandedCards] = useState({});

  const showImageModal = imageUrl => {
    setSelectedImage(imageUrl);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
    setRotation(0);
  };

  const rotateImage = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  const removeImage = index => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const onDrop = useCallback(acceptedFiles => {
    setLoading(true);
    setError(null);

    if (acceptedFiles.length > 0) {
      const validFiles = acceptedFiles.filter(file => file.type.startsWith("image/"));
      if (validFiles.length !== acceptedFiles.length) {
        setError("Please upload valid image files (JPEG, PNG).");
        setLoading(false);
        return;
      }

      setImages(prev => [...prev, ...validFiles]);
      const urls = validFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...urls]);
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 10,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
  });

  const onSubmit = () => {
    if (images.length > 0) {
      handleSubmission(images);
    } else {
      setError("Please upload at least one image.");
    }
  };

  const isImageMissing = imageName => {
    const nameWithoutExt = imageName.split(".")[0];
    return missingPatientIds.includes(nameWithoutExt);
  };

  const getDiagnosisStyle = diagnosis => {
    switch (diagnosis) {
      case "PDR":
        return { color: "red", icon: <FaExclamationCircle className="text-red-500" /> };
      case "NPDR":
        return { color: "orange", icon: <FaExclamationCircle className="text-orange-500" /> };
      case "No_DR":
        return { color: "green", icon: <FaCheckCircle className="text-green-500" /> };
      default:
        return { color: "gray", icon: null };
    }
  };

  const toggleExpandCard = index => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="p-6">
      <div className="font-kanit text-4xl font-semibold text-gray-800 mb-6">
        Multi Diagnose{" "}
        {disease && (
          <span className="font-medium text-3xl text-gray-600">
            {">"} {disease}
          </span>
        )}
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} tabPosition="top" animated>
        <TabPane tab="Upload" key="upload">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div {...getRootProps()} className="cursor-pointer">
              <input {...getInputProps()} />
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-[240px] flex flex-col items-center justify-center text-center px-6">
                {isDragActive ? (
                  <p className="text-lg text-gray-600">Drop the images here...</p>
                ) : (
                  <>
                    <img src={upload} alt="Upload" className="w-16 h-16 mb-4" />
                    <div className="text-lg text-gray-700">
                      Drag and drop or{" "}
                      <span className="text-blue-600 font-semibold">click to upload</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Supported formats: JPEG, PNG</div>
                  </>
                )}
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <FaExclamationCircle />
                {error}
              </div>
            )}

            {imageUrls.length > 0 && (
              <div className="mt-6">
                <div className="text-lg font-semibold text-gray-800 mb-4">Uploaded Images</div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => {
                    const isMissing = isImageMissing(images[index].name);
                    return (
                      <div key={index} className="relative flex flex-col items-center">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className={`w-[120px] h-[120px] rounded-lg object-cover cursor-pointer ${
                            isMissing ? "border-4 border-red-500" : ""
                          }`}
                          onClick={() => showImageModal(url)}
                        />
                        <div
                          className={`text-sm mt-2 ${isMissing ? "text-red-500" : "text-gray-600"}`}
                        >
                          {images[index].name}
                        </div>
                        <button
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          onClick={() => removeImage(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <Button
                  type="primary"
                  className="mt-6"
                  onClick={onSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
              </div>
            )}
          </div>
        </TabPane>

        <TabPane
          tab="Prediction"
          key="prediction"
          disabled={predictions.length === 0 || missingPatientIds.length > 0}
        >
          {predictions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-center text-2xl font-semibold text-gray-800">
                  Prediction Results
                </div>
                {!isSaved && (
                  <Button
                    type="primary"
                    icon={<FaSave />}
                    onClick={() => handleSaveAll(images)}
                    loading={isSaving}
                    disabled={isSaving || predictions.length === 0}
                  >
                    Save All
                  </Button>
                )}
              </div>
              {isSubmitting ? (
                <div className="flex items-center justify-center my-8">
                  <PushSpinner size={50} color="#3B82F6" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {predictions.map((prediction, index) => {
                    const { color, icon } = getDiagnosisStyle(prediction.prediction.label);
                    const maxConfidence = Math.max(...prediction.prediction.confidence) * 100;
                    const isExpanded = expandedCards[index];

                    return (
                      <div
                        key={index}
                        className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200"
                      >
                        <div className="flex justify-center mb-4">
                          <img
                            src={imageUrls[index]}
                            alt={`Uploaded Image ${index + 1}`}
                            className="w-[150px] h-[150px] rounded-lg object-cover cursor-pointer"
                            onClick={() => showImageModal(imageUrls[index])}
                          />
                        </div>

                        <div className="mb-4">
                          <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {icon} Diagnosis:{" "}
                            <span className={`text-${color}-500`}>
                              {prediction.prediction.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-2">Confidence Level</div>
                          <Progress
                            percent={maxConfidence.toFixed(2)}
                            strokeColor={color}
                            status="active"
                          />
                          <div className="text-sm text-gray-600 mt-1">
                            Confidence: {maxConfidence.toFixed(2)}%
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4">
                            <Descriptions
                              title={
                                <span className="flex items-center gap-2">
                                  <FaUser /> Patient Information
                                </span>
                              }
                              column={1}
                              size="small"
                              bordered
                              className="mb-4"
                            >
                              <Descriptions.Item label="Patient ID">
                                {prediction.patientId}
                              </Descriptions.Item>
                              <Descriptions.Item label="Name">
                                {prediction.patientDetails.fullName}
                              </Descriptions.Item>
                              <Descriptions.Item label="Age">
                                {prediction.patientDetails.age}
                              </Descriptions.Item>
                              <Descriptions.Item label="Gender">
                                {prediction.patientDetails.gender}
                              </Descriptions.Item>
                            </Descriptions>

                            {prediction.patientDetails.medicalHistory.length > 0 && (
                              <div>
                                <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                  <FaNotesMedical /> Medical History
                                </div>
                                <List
                                  size="small"
                                  dataSource={prediction.patientDetails.medicalHistory.slice(0, 2)}
                                  renderItem={item => (
                                    <List.Item>
                                      <span className="text-gray-700">
                                        {item.condition} (Diagnosed:{" "}
                                        {new Date(item.diagnosedAt).toLocaleDateString()})
                                      </span>
                                      <span className="text-gray-500 ml-2">
                                        Meds: {item.medications.join(", ")}
                                      </span>
                                    </List.Item>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <Button
                          type="link"
                          icon={<FaEye />}
                          onClick={() => toggleExpandCard(index)}
                          className="mt-2 p-0"
                        >
                          {isExpanded ? "Hide Details" : "View More"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </TabPane>
      </Tabs>

      <Modal
        title="Mismatched Patient IDs Detected"
        visible={showConfirmation}
        onOk={() => handleConfirmation(true, images)}
        onCancel={() => handleConfirmation(false, images)}
        okText="Remove and Proceed"
        cancelText="Cancel"
      >
        <p>The following images have patient IDs that do not match the database:</p>
        <ul className="list-disc pl-5">
          {missingPatientIds.map((id, index) => (
            <li key={index} className="text-red-500">
              {id}
            </li>
          ))}
        </ul>
        <p>Please remove these images to proceed with the analysis.</p>
      </Modal>

      <Modal
        title="Image Viewer"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="rotate" onClick={rotateImage}>
            Rotate
          </Button>,
        ]}
        width={800}
      >
        <Zoom>
          <img
            src={selectedImage}
            alt="Full View"
            className="w-full h-auto rounded-lg"
            style={{
              maxHeight: "70vh",
              objectFit: "contain",
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.3s ease",
            }}
          />
        </Zoom>
      </Modal>
    </div>
  );
};

export default MultiDiagnose;
