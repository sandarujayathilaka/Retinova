import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Typography } from "antd";
import UploadSection from "../../components/diagnose/UploadSection";
import LoadingSection from "../../components/diagnose/LoadingSection";
import ResultsSection from "../../components/diagnose/ResultsSection";
import PatientTabs from "../../components/diagnose/PatientTabs";
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
    <div className="p-6 max-w-5xl mx-auto">
      <Title level={2} className="text-gray-900 mb-6 font-semibold text-left ">
        Diagnose <span className="text-blue-500 font-medium">{disease}</span>
      </Title>

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
