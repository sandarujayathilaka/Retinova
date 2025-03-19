import { useState, useEffect } from "react";
import { api } from "../../../src/services/api.service";
import { toast } from "react-hot-toast";
import TestRecordItem from "../../components/testrecords/TestRecordItem";
import TestRecordConfirmModal from "../../components/testrecords/TestRecordConfirmModal";
import { TestTubes, AlertCircle, RefreshCw, ClipboardCheck } from "lucide-react";

function TestRecords({ patientId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${patientId}/test-records`); // Use api instead of axios
      if (res.data && Array.isArray(res.data.data)) {
        const sortedRecords = res.data.data.sort((a, b) => b._id.localeCompare(a._id));
        setRecords(sortedRecords);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (err) {
      console.error("Error fetching test records:", err.response || err.message);
      setError("Failed to load test records. Check patient ID or backend status.");
      toast.error("Failed to load test records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const handleFileUpload = async (file, diagnoseId, testIndex) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/patients/upload-test", formData); // Use api instead of axios
    return res.data.data.attachmentURL;
  };

  const handleSave = async (diagnoseId, updatedTests) => {
    try {
      await Promise.all(
        updatedTests.map((test, index) =>
          api.put("/patients/update-test", { // Use api instead of axios
            patientId,
            diagnoseId,
            testIndex: index,
            status: test.status,
            attachmentURL: test.attachmentURL,
          })
        )
      );
      await fetchRecords(); // Refresh records after saving
      toast.success("Tests updated successfully!");
    } catch (err) {
      console.error("Error saving tests:", err.response || err.message);
      toast.error("Failed to update tests.");
    }
  };

  const handleCompleteDiagnosis = async (diagnoseId) => {
    try {
      await fetchRecords(); // Refresh records
      const record = records.find((r) => r._id === diagnoseId);
      if (!record) throw new Error("Record not found after refresh.");

      if (record.status !== "Checked")
        throw new Error("Diagnosis is no longer in 'Checked' status.");

      const allTestsCompleted = record.recommend.tests.every(
        (test) => test.status === "Completed" || test.status === "Reviewed"
      );
      if (!allTestsCompleted)
        throw new Error("Not all tests are completed or reviewed yet.");

      const res = await api.put(`/patients/${patientId}/complete-diagnosis`, { diagnoseId }); // Use api instead of axios
      const updatedRecords = records.map((record) =>
        record._id === diagnoseId
          ? { ...record, ...res.data.data.diagnose, status: "Test Completed" }
          : record
      );
      setRecords(updatedRecords);
      setShowConfirm(null);
      toast.success("Diagnosis completed and patient marked as ReviewReady!");
    } catch (err) {
      console.error("Error completing diagnosis:", err.response || err.message);
      const errorMessage = err.response?.data?.message || "Failed to complete diagnosis.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const openConfirmModal = (diagnoseId) => {
    const record = records.find((r) => r._id === diagnoseId);
    if (!record) {
      toast.error("Record not found.");
      return;
    }
    if (record.status !== "Checked") {
      toast.error("Diagnosis is not in 'Checked' status and cannot be completed.");
      return;
    }
    const allTestsCompleted = record.recommend.tests.every(
      (test) => test.status === "Completed" || test.status === "Reviewed"
    );
    if (allTestsCompleted) {
      setShowConfirm(diagnoseId);
    } else {
      toast.error("Not all tests are completed or reviewed yet!");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-xl shadow-md">
          <div className="animate-spin text-blue-600">
            <RefreshCw className="h-12 w-12" />
          </div>
          <p className="text-lg font-semibold text-blue-700">Loading Test Records...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch the patient data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="p-8 bg-white rounded-xl shadow-md max-w-md">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="h-7 w-7" />
            <h3 className="text-lg font-semibold">Error Loading Records</h3>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
            <ClipboardCheck className="h-6 w-6 text-indigo-700" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900">Required Tests for Patient</h2>
        </div>

        {records.length > 0 ? (
          <div className="space-y-6">
            {records.map((record) => (
              <TestRecordItem
                key={record._id}
                record={record}
                onSave={handleSave}
                onComplete={openConfirmModal}
                handleFileUpload={handleFileUpload}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="inline-flex justify-center items-center p-4 bg-blue-50 rounded-full mb-4">
              <TestTubes className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Records Found</h3>
            <p className="text-gray-500 mb-6">There are no test records available for this patient.</p>
          </div>
        )}
      </div>
      <TestRecordConfirmModal
        show={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => handleCompleteDiagnosis(showConfirm)}
      />
    </div>
  );
}

export default TestRecords;