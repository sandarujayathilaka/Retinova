import React from "react";
import BasicInfo from "./BasicInfo";
import ContactInfo from "./ContactInfo";
import MedicalHistory from "./MedicalHistory";
import DiagnosisHistory from "./DiagnosisHistory";

const TabContent = ({ activeTab, patient, getMaxConfidence, openImage, isFromPreMonitoring }) => {
  return (
    <div className="space-y-12">
      {activeTab === "basic" && <BasicInfo patient={patient} />}
      {activeTab === "contact" && <ContactInfo patient={patient} />}
      {activeTab === "medical" && <MedicalHistory patient={patient} />}
      {activeTab === "diagnosis" && (
        <DiagnosisHistory
          patient={patient}
          getMaxConfidence={getMaxConfidence}
          openImage={openImage}
          isFromPreMonitoring={isFromPreMonitoring}
        />
      )}
    </div>
  );
};

export default TabContent;
