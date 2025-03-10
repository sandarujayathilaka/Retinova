import React from "react";

const ImageModal = ({ selectedImage, closeImage }) => {
  if (!selectedImage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="relative max-w-4xl w-full">
        <img src={selectedImage} alt="Full View" className="w-full h-auto rounded-lg shadow-lg" />
        <button
          onClick={closeImage}
          className="absolute top-4 right-4 p-2 bg-white text-gray-800 rounded-full hover:bg-gray-200 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
