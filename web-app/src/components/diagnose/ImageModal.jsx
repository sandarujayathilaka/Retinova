import React from "react";
import { Modal, Button } from "antd";
import { FaSearchPlus, FaUndo } from "react-icons/fa";

const ImageModal = ({
  selectedImage,
  setSelectedImage,
  zoomLevel,
  setZoomLevel,
  rotation,
  setRotation,
}) => {
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
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
  );
};

export default ImageModal;
