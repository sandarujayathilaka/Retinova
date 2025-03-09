import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Typography, Alert } from "antd";
import { motion } from "framer-motion";
import uploadIcon from "../../assets/icons/upload.svg"; // Ensure this path is correct

const { Title, Text } = Typography;

const UploadSection = ({
  setImage,
  setImageUrl,
  setUploadError,
  setShowUploader,
  handleSubmission,
  uploadError,
}) => {
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
    [handleSubmission, setImage, setImageUrl, setUploadError, setShowUploader],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className="shadow-md rounded-lg border border-gray-200 bg-white mt-14"
        bodyStyle={{ padding: "24px" }}
      >
        <div className="mb-4">
          <Title level={3} className="text-2xl font-semibold text-gray-800 m-0">
            Upload Retinal Scan
          </Title>
          <Text className="text-base text-gray-600">
            Drop an image to analyze Diabetic Retinopathy
          </Text>
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
            isDragActive
              ? "border-gray-400 bg-gray-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <img src={uploadIcon} alt="Upload" className="w-12 h-12 mb-4 text-gray-400" />
          {isDragActive ? (
            <Text className="text-base text-gray-600 font-medium">Drop your image here...</Text>
          ) : (
            <>
              <Text className="text-base text-gray-700 font-medium">
                Drag & drop or{" "}
                <span className="text-gray-800 font-semibold cursor-pointer hover:underline">
                  click to upload
                </span>
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                File format: <strong>patientId_randomtext.jpg</strong> (e.g., 123456_image.jpg)
              </Text>
              <Text className="text-sm text-gray-400 mt-1">
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
            className="mt-4 rounded-md shadow-sm border border-red-200"
          />
        )}
      </Card>
    </motion.div>
  );
};

export default UploadSection;
