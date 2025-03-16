import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Typography, Alert } from "antd";
import UploadSection from "../../components/diagnose/UploadSection";
import LoadingSection from "../../components/diagnose/LoadingSection";
import ResultsSection from "../../components/diagnose/ResultsSection";
import ImageModal from "../../components/diagnose/ImageModal";

const { Title } = Typography;

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
  const [showUploader, setShowUploader] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (errorMessage) {
      if (
        errorMessage.includes("No patient profile found") ||
        errorMessage.includes("Invalid filename format")
      ) {
        setTimeout(() => resetForNewUpload(), 3000);
      }
    }
  }, [errorMessage]);

  const resetForNewUpload = () => {
    setImage(null);
    setImageUrl(null);
    setUploadError(null);
    setShowUploader(true);
    resetState();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center mb-8 bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl shadow-sm border border-indigo-100">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
            <path d="M2 3h20M16 3v18H8V3M12 7v2M12 14v2"/>
          </svg>
        </div>
        <div>
          <Title level={2} className="text-gray-900 mb-0 font-semibold text-xl md:text-2xl">
            Diagnose <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-600 font-medium">{disease}</span>
          </Title>
          <p className="text-gray-600 text-sm mt-1">Upload a retinal scan to analyze and diagnose potential conditions</p>
        </div>
      </div>

      {!isSubmitting && !prediction?.type && !errorMessage && (
        <UploadSection
          setImage={setImage}
          setImageUrl={setImageUrl}
          setUploadError={setUploadError}
          setShowUploader={setShowUploader}
          handleSubmission={handleSubmission}
          uploadError={uploadError}
        />
      )}

      {isSubmitting && <LoadingSection />}

      {prediction?.type && !isSubmitting && (
        <ResultsSection
          imageUrl={imageUrl}
          prediction={prediction}
          handleSavePrescription={handleSavePrescription}
          isSaving={isSaving}
          resetForNewUpload={resetForNewUpload}
          setSelectedImage={setSelectedImage}
          patientData={patientData}
        />
      )}

      {errorMessage && !isSubmitting && showUploader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <Alert
            message="Error Occurred"
            description={errorMessage}
            type="error"
            showIcon
            className="rounded-xl shadow-md border border-red-200"
          />
        </motion.div>
      )}

      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        rotation={rotation}
        setRotation={setRotation}
      />
    </div>
  );
};

export default Diagnose;