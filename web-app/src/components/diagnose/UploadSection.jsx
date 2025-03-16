import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Typography, Alert } from "antd";
import { motion } from "framer-motion";

const { Text } = Typography;

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
      <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="mb-6 text-center max-w-2xl mx-auto">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
              Upload Retinal Scan
            </h3>
            <Text className="text-base text-gray-600">
              The AI will analyze your retinal scan to detect signs of Diabetic Retinopathy
            </Text>
          </div>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? "border-indigo-400 bg-indigo-50"
                : "border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/30"
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="w-20 h-20 mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-indigo-600"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            
            {isDragActive ? (
              <p className="text-lg text-indigo-700 font-medium animate-pulse">
                Release to upload your scan...
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-800 font-medium mb-2">
                  Drag & drop your retinal scan here
                </p>
                <p className="text-base text-gray-600 mb-4">
                  or <span className="text-indigo-600 font-medium">browse files</span>
                </p>
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    File naming convention:
                  </p>
                  <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-800">
                    patientId_randomtext.jpg
                  </code>
                  <p className="text-xs text-gray-600 mt-2">
                    Example: 123456_image.jpg
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: JPEG, PNG | Max size: 10MB | 1 file only
                </p>
              </>
            )}
          </div>
          
          {uploadError && (
            <Alert
              message={uploadError}
              type="error"
              showIcon
              className="mt-6 rounded-lg shadow-sm border border-red-200"
            />
          )}
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By uploading an image, you agree to our{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-800">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-800">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadSection;