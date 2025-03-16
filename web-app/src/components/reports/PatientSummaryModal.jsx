import React from "react";
import { Modal, Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { FaFileDownload, FaPrint } from "react-icons/fa";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import FullPatientPDFReport from "./FullPatientPDFReport";

const PatientSummaryModal = ({ visible, onClose, patientData }) => {
  const handlePrintReport = async () => {
    const blob = await pdf(<FullPatientPDFReport patientData={patientData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);
    printWindow.onload = () => printWindow.print();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-xl">
          <FilePdfOutlined className="text-red-500" />
          <span>Patient Summary Report</span>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Patient Summary Preview</h2>
        <p className="text-sm text-gray-600 mb-4">
          Complete patient information report
        </p>
        
        <div className="flex justify-end gap-3">
          <PDFDownloadLink
            document={<FullPatientPDFReport patientData={patientData} />}
            fileName={`Patient_Summary_${patientData?.patientId || "Unknown"}.pdf`}
          >
            {({ loading }) => (
              <Button
                icon={<FaFileDownload className="mr-2" />}
                disabled={loading}
                className="flex items-center"
              >
                {loading ? "Generating..." : "Download Report"}
              </Button>
            )}
          </PDFDownloadLink>
          
          <Button
            type="primary"
            icon={<FaPrint className="mr-2" />}
            onClick={handlePrintReport}
            className="flex items-center bg-blue-600 hover:bg-blue-700"
          >
            Print Report
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PatientSummaryModal;