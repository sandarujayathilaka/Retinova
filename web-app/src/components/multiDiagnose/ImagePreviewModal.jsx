// src/components/MultiDiagnose/ImagePreviewModal.jsx
import React from "react";
import { Modal, Button } from "antd";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const ImagePreviewModal = ({ isModalVisible, selectedImage, rotation, setRotation, handleCancel }) => (
  <Modal
    title="Image Viewer"
    visible={isModalVisible}
    onCancel={handleCancel}
    footer={[
      <Button key="close" onClick={handleCancel}>Close</Button>,
      <Button key="rotate" onClick={() => setRotation(prev => (prev + 90) % 360)}>Rotate</Button>,
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
);

export default ImagePreviewModal;