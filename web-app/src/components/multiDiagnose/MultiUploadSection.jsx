import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaImages, FaTimes, FaUpload } from "react-icons/fa";
import { motion } from "framer-motion";
import CustomAlert from "../custom-alert/CustomAlert";
import ConfirmDialog from "../custom-dialog/ConfirmDialog";
import LoadingSection from "../diagnose/LoadingSection";
import { Typography } from "antd";

const { Text } = Typography;

const MultiUploadSection = ({
  setImages,
  setImageUrls,
  imageUrls,
  handleSubmission,
  uploadError,
  setUploadError,
  disease,
  isSubmitting,
}) => {
  const [invalidImages, setInvalidImages] = useState(new Set());
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const filenamePattern = /^[A-Za-z0-9]+_(right|left|RIGHT|LEFT)_[A-Za-z0-9]+\.(jpe?g|png)$/i;

  const validateFilename = (filename) => {
    return filenamePattern.test(filename);
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      setUploadError(null);
      if (acceptedFiles.length === 0) {
        setUploadError("No files were selected.");
        return;
      }

      const validImageFiles = acceptedFiles.filter((file) =>
        file.type.startsWith("image/")
      );
      if (validImageFiles.length !== acceptedFiles.length) {
        setUploadError("Please upload valid image files (JPEG, PNG) only.");
        return;
      }

      const newFiles = [...validImageFiles];
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      const newInvalidIndices = new Set();
      newFiles.forEach((file, index) => {
        if (!validateFilename(file.name)) {
          newInvalidIndices.add(imageUrls.length + index);
        }
      });

      setImages((prev) => [...prev, ...newFiles]);
      setImageUrls((prev) => [...prev, ...newUrls]);
      setInvalidImages((prev) => new Set([...prev, ...newInvalidIndices]));
    },
    [setImages, setImageUrls, setUploadError, imageUrls.length]
  );

  const removeImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
    setInvalidImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      const updatedSet = new Set();
      newSet.forEach((i) => {
        updatedSet.add(i > index ? i - 1 : i);
      });
      return updatedSet;
    });
  };

  const handleClearAllClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmClear = () => {
    setImageUrls([]);
    setImages([]);
    setInvalidImages(new Set());
    setShowClearAlert(true);
    setShowConfirmDialog(false);
    setTimeout(() => setShowClearAlert(false), 3000);
  };

  const handleCancelClear = () => {
    setShowConfirmDialog(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
  });

  const isSubmitDisabled =
    isSubmitting || imageUrls.length === 0 || invalidImages.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {isSubmitting ? (
        <LoadingSection />
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mb-6 text-center max-w-2xl mx-auto">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                Multi Image Upload{" "}
                {disease && (
                  <span className="text-gray-600 ml-2"> {disease}</span>
                )}
              </h3>
              <Text className="text-base text-gray-600">
                The AI will analyze multiple retinal scans to detect signs of
                Diabetic Retinopathy
              </Text>
              <Text className="text-sm text-gray-500 block mt-2">
                Filename format: PatientID_[Right|Left]_randomtext.[jpg|jpeg|png]
              </Text>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 md:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/30"
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-20 h-20 mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <FaImages className="w-10 h-10 text-indigo-600" />
              </div>
              {isDragActive ? (
                <p className="text-lg text-indigo-700 font-medium animate-pulse">
                  Release to upload your scans...
                </p>
              ) : (
                <>
                  <p className="text-lg text-gray-800 font-medium mb-2">
                    Drag & drop multiple retinal Images here
                  </p>
                  <p className="text-base text-gray-600 mb-4">
                    or{" "}
                    <span className="text-indigo-600 font-medium">
                      browse files
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: JPEG, PNG | Max size: 10MB
                  </p>
                </>
              )}
            </div>

            {uploadError && (
              <CustomAlert message={uploadError} type="error" className="mt-6" />
            )}

            {invalidImages.size > 0 && (
              <CustomAlert
                message={`Please remove ${invalidImages.size} invalidly named image(s) before submitting`}
                type="warning"
                className="mt-6"
              />
            )}

            {showClearAlert && (
              <CustomAlert
                message="All images have been successfully cleared!"
                type="success"
                className="mt-6"
              />
            )}

            {imageUrls.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Uploaded Images{" "}
                    <span className="text-indigo-600">({imageUrls.length})</span>
                  </h4>
                  <button
                    onClick={handleClearAllClick}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className={`group relative ${
                        invalidImages.has(index)
                          ? "border-2 border-red-500 rounded-lg"
                          : ""
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Scan ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => removeImage(index)}
                          className="bg-white rounded-full p-2 text-red-500"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      {invalidImages.has(index) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-1">
                          Invalid filename
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSubmission}
                  disabled={isSubmitDisabled}
                  className={`mt-6 w-full sm:w-auto px-8 py-3 bg-indigo-900 text-white rounded-lg ${
                    isSubmitDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-indigo-700"
                  }`}
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : (
                    <>
                      <FaUpload className="mr-1" /> Submit {imageUrls.length}{" "}
                      Images
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
        message="Are you sure you want to remove all images?"
        confirmText="Yes, Clear All"
        cancelText="Cancel"
      />
    </motion.div>
  );
};

export default MultiUploadSection;