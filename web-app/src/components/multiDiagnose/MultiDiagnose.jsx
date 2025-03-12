// src/components/MultiDiagnose/MultiDiagnose.jsx
import React, { useState } from "react";
import { Tabs } from "antd";
import MultiUploadSection from "./MultiUploadSection";
import PredictionCard from "./PredictionCard";
import ConfirmationModal from "./ConfirmationModal";
import ImagePreviewModal from "./ImagePreviewModal";
import { PushSpinner } from "react-spinners-kit";
import { Button } from "antd";
import { FaSave } from "react-icons/fa";

const { TabPane } = Tabs;

const MultiDiagnose = ({
  disease,
  handleSubmission,
  isSubmitting,
  predictions,
  patientData,
  missingPatientIds,
  showConfirmation,
  setShowConfirmation,
  handleSaveAll,
  isSaving,
  isSaved,
  handleReset,
}) => {
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [expandedCards, setExpandedCards] = useState({});

  const onSubmit = () => {
    if (images.length > 0) {
      handleSubmission(images);
    } else {
      setError("Please upload at least one image.");
    }
  };

  const toggleExpandCard = index => {
    setExpandedCards(prev => ({ ...prev, [index]: !prev[index] }));
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
          <MultiUploadSection
            setImages={setImages}
            setImageUrls={setImageUrls}
            imageUrls={imageUrls}
            handleSubmission={onSubmit}
            uploadError={error}
            setUploadError={setError}
            disease={disease}
            isSubmitting={isSubmitting}
          />
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
                  {predictions.map((prediction, index) => (
                    <PredictionCard
                      key={index}
                      prediction={prediction}
                      imageUrl={imageUrls[index]}
                      isExpanded={expandedCards[index]}
                      toggleExpand={toggleExpandCard}
                      index={index}
                      setSelectedImage={setSelectedImage}
                      setIsModalVisible={setIsModalVisible}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabPane>
      </Tabs>

      <ConfirmationModal
        showConfirmation={showConfirmation}
        missingPatientIds={missingPatientIds}
        handleConfirmation={(confirmed) => {
          setShowConfirmation(false);
          if (confirmed) {
            const validImages = images.filter(
              image => !missingPatientIds.includes(image.name.split(".")[0])
            );
            if (validImages.length > 0) handleSubmission(validImages, true);
            else setError("No valid images to submit.");
          }
        }}
      />

      <ImagePreviewModal
        isModalVisible={isModalVisible}
        selectedImage={selectedImage}
        rotation={rotation}
        setRotation={setRotation}
        handleCancel={() => {
          setIsModalVisible(false);
          setSelectedImage(null);
          setRotation(0);
        }}
      />
    </div>
  );
};

export default MultiDiagnose;