// src/components/MultiDiagnose/ConfirmationModal.jsx
import React from "react";
import { Modal } from "antd";
import { FaExclamationCircle } from "react-icons/fa";

const ConfirmationModal = ({ showConfirmation, missingPatientIds, handleConfirmation }) => (
  <Modal
    title={
      <div className="flex items-center text-red-500 gap-2">
        <FaExclamationCircle /> <span>Mismatched Patient IDs Detected</span>
      </div>
    }
    visible={showConfirmation}
    onOk={() => handleConfirmation(true)}
    onCancel={() => handleConfirmation(false)}
    okText="Remove and Proceed"
    cancelText="Cancel"
    okButtonProps={{ style: { backgroundColor: "#ef4444", borderColor: "#ef4444" } }}
  >
    <div className="py-2">
      <p>The following images have patient IDs that do not match the database:</p>
      <div className="bg-red-50 p-3 rounded-lg my-3">
        <ul className="list-disc pl-5">
          {missingPatientIds.map((id, index) => (
            <li key={index} className="text-red-500 my-1">{id}</li>
          ))}
        </ul>
      </div>
      <p>Please remove these images to proceed with the analysis.</p>
    </div>
  </Modal>
);

export default ConfirmationModal;