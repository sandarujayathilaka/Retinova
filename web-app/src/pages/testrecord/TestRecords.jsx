import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import TestRecordCard from "../../components/testrecords/TestRecordCard";
import TestRecordModal from "../../components/testrecords/TestRecordModal";
import TestRecordConfirmModal from "../../components/testrecords/TestRecordConfirmModal";
import {
  TestTubes
} from "lucide-react";

function TestRecords({patientId}) {
  // const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDiagnose, setSelectedDiagnose] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:4000/api/patients/${patientId}/test-records`)
      .then((res) => {
        console.log("Test Records Response:", res.data);
        if (res.data && Array.isArray(res.data.data)) {
          setRecords(res.data.data);
        } else {
          throw new Error("Unexpected API response format");
        }
      })
      .catch((err) => {
        console.error("Error fetching test records:", err.response || err.message);
        setError("Failed to load test records. Check patient ID or backend status.");
        toast.error("Failed to load test records.");
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  const handleFileUpload = async (file, diagnoseId, testIndex) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:4000/api/patients/upload-test", formData);
    return res.data.data.attachmentURL;
  };

  const handleSave = async (diagnoseId, updatedTests) => {
    try {
      await Promise.all(
        updatedTests.map((test, index) =>
          axios.put("http://localhost:4000/api/patients/update-test", {
            patientId,
            diagnoseId,
            testIndex: index,
            status: test.status,
            attachmentURL: test.attachmentURL,
          })
        )
      );
      const res = await axios.get(`http://localhost:4000/api/patients/${patientId}/test-records`);
      setRecords(res.data.data);
      setShowModal(false);
      toast.success("Tests updated successfully!");
    } catch (err) {
      console.error("Error saving tests:", err);
      toast.error("Failed to update tests.");
    }
  };

  const handleCompleteDiagnosis = async (diagnoseId) => {
    const record = records.find((r) => r._id === diagnoseId);
    try {
      await axios.put(`http://localhost:4000/api/patients/${patientId}/complete-diagnosis`, { diagnoseId });
      const res = await axios.get(`http://localhost:4000/api/patients/${patientId}/test-records`);
      setRecords(res.data.data);
      setShowConfirm(null);
      toast.success("Diagnosis completed and patient marked as ReviewReady!");
    } catch (err) {
      console.error("Error completing diagnosis:", err.response || err.message);
      setError("Failed to complete diagnosis.");
      toast.error("Failed to complete diagnosis.");
    }
  };

  const openModal = (record) => {
    console.log("Opening modal with record:", record);
    if (record && record.diagnosis) {
      setSelectedDiagnose(record);
      setShowModal(true);
    } else {
      console.error("Invalid record passed to modal:", record);
      toast.error("Invalid record selected for update.");
    }
  };

  const openConfirmModal = (diagnoseId) => {
    const record = records.find((r) => r._id === diagnoseId);
    if (!record) {
      toast.error("Record not found.");
      return;
    }
    const allTestsCompleted = record.recommend.tests.every((test) => test.status === "Completed");
    if (allTestsCompleted) {
      setShowConfirm(diagnoseId); // Show the confirmation modal only if all tests are completed
    } else {
      toast.error("Not all tests are completed yet!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <p className="text-lg font-semibold text-sky-600">Loading Test Records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-inherit py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-teal-800 flex items-center gap-3 mb-6">
          <TestTubes className="h-7 w-7 text-teal-600" /> Patient Tests Records
        </h2>
          {records.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {records.map((record) => (
                <TestRecordCard
                  key={record._id}
                  record={record}
                  onUpdate={openModal}
                  onComplete={openConfirmModal}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-sky-500 text-sm">No test records found for this patient.</p>
          )}
        {/* </div> */}
      {/* </div> */}
      <TestRecordModal
        show={showModal && selectedDiagnose}
        onClose={() => setShowModal(false)}
        diagnose={selectedDiagnose}
        onSave={handleSave}
        handleFileUpload={handleFileUpload}
      />
      <TestRecordConfirmModal
        show={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => handleCompleteDiagnosis(showConfirm)}
      />
    </div>
  );
}

export default TestRecords;