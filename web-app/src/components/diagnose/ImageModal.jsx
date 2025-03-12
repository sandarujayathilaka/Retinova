import React, { useState } from "react";
import { Modal } from "antd";

const ImageModal = ({
  selectedImage,
  setSelectedImage,
  zoomLevel,
  setZoomLevel,
  rotation,
  setRotation,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoomLevel(1);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleResetRotation = () => setRotation(0);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClose = () => {
    setSelectedImage(null);
    // Reset everything when closing
    handleReset();
  };

  return (
    <Modal
      open={!!selectedImage}
      footer={null}
      onCancel={handleClose}
      width={900}
      className="image-viewer-modal"
      bodyStyle={{ padding: 0 }}
      style={{ top: 20 }}
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      destroyOnClose
    >
      <div className="bg-gray-900 text-white">
        {/* Header with controls */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-medium">Retinal Scan Viewer</h3>
          <div className="flex items-center">
            <div className="text-sm text-gray-400 mr-4">
              Zoom: {Math.round(zoomLevel * 100)}% | Rotation: {rotation}°
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Image Container */}
        <div 
          className="relative overflow-hidden bg-gray-900 h-[calc(100vh-200px)] min-h-96"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="absolute left-1/2 top-1/2 origin-center transition-transform duration-200"
            style={{ 
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
            }}
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Enlarged scan"
                className="max-w-full max-h-full object-contain"
                draggable="false"
              />
            )}
          </div>
        </div>
        
        {/* Controls Toolbar */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-950 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
            <button 
              onClick={handleZoomOut}
              className="p-3 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
              title="Zoom Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            
            <button 
              onClick={handleResetZoom}
              className="p-3 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white border-l border-r border-gray-700"
              title="Reset Zoom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            
            <button 
              onClick={handleZoomIn}
              className="p-3 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
              title="Zoom In"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
            <button 
              onClick={handleRotate}
              className="p-3 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
              title="Rotate 90°"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
              </svg>
            </button>
            
            <button 
              onClick={handleResetRotation}
              className="p-3 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white border-l border-gray-700"
              title="Reset Rotation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
          </div>
          
          <button 
            onClick={handleReset}
            className="p-3 bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white rounded-lg"
            title="Reset All"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v6h6"></path>
              <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
            </svg>
          </button>
          
          <div className="ml-auto text-xs text-gray-500">
            Tip: Click and drag to pan the image
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImageModal;