import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  Check,
  Edit,
  FileText,
  Eye,
  File,
  Image,
  ChevronDown,
  ChevronUp,
  Pill,
  Clipboard,
  AlertCircle,
  Calendar,
  RefreshCw,
  PlusCircle, 
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/services/api.service";

const getFileType = (url) => {
  if (!url) return null;
  const extension = url.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "image";
  if (extension === "pdf") return "pdf";
  return null;
};

const DiagnosisHistory = ({ patient, getMaxConfidence, openImage, isFromPreMonitoring }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
  const [expandedDiagnosis, setExpandedDiagnosis] = useState({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    recommendedMedicine: "",
    notes: "",
    revisitTimeFrame: "Monthly",
    additionalTests: [{ testName: "", attachmentURL: "" }],
    doctorStatus: "Monitoring",
  });
  const [reviewDiagnosisId, setReviewDiagnosisId] = useState(null);
  const [diagnoseHistory, setDiagnoseHistory] = useState(patient.diagnoseHistory || []);
  const [isAddTestModalOpen, setIsAddTestModalOpen] = useState(false);
  const [addTestDiagnosisId, setAddTestDiagnosisId] = useState(null);
  const [newTestName, setNewTestName] = useState("");
  const [availableTests, setAvailableTests] = useState([]);

  const initializeFormData = (diagnosisId) => ({
    medicine: "",
    tests: [{ testName: "", status: "Pending" }],
    note: "",
  });

  
// Fetch tests from the API
useEffect(() => {
  const fetchTests = async () => {
    try {
      const response = await api.get("tests");
      console.log("Available tests:", response.data);
      setAvailableTests(response.data); 
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to fetch available tests.");
    }
  };
  fetchTests();
}, []);

  const handleInputChange = (diagnosisId, field, value, testIndex = null) => {
    setFormData((prev) => {
      const diagnosisForm = prev[diagnosisId] || initializeFormData(diagnosisId);
      if (field === "tests" && testIndex !== null) {
        const updatedTests = [...diagnosisForm.tests];
        updatedTests[testIndex] = { ...updatedTests[testIndex], testName: value };
        return { ...prev, [diagnosisId]: { ...diagnosisForm, tests: updatedTests } };
      }
      return { ...prev, [diagnosisId]: { ...diagnosisForm, [field]: value } };
    });
  };

  const handleReviewInputChange = (field, value, testIndex = null) => {
    setReviewFormData((prev) => {
      if (field === "additionalTests" && testIndex !== null) {
        const updatedTests = [...prev.additionalTests];
        updatedTests[testIndex] = { ...updatedTests[testIndex], testName: value };
        return { ...prev, additionalTests: updatedTests };
      }
      return { ...prev, [field]: value };
    });
  };

  const addTestField = (diagnosisId) => {
    setFormData((prev) => {
      const diagnosisForm = prev[diagnosisId] || initializeFormData(diagnosisId);
      return {
        ...prev,
        [diagnosisId]: {
          ...diagnosisForm,
          tests: [...diagnosisForm.tests, { testName: "", status: "Pending" }],
        },
      };
    });
  };

  const addReviewTestField = () => {
    setReviewFormData((prev) => ({
      ...prev,
      additionalTests: [...prev.additionalTests, { testName: "", attachmentURL: "" }],
    }));
  };

  const removeTestField = (diagnosisId, testIndex) => {
    setFormData((prev) => {
      const diagnosisForm = prev[diagnosisId] || initializeFormData(diagnosisId);
      return {
        ...prev,
        [diagnosisId]: {
          ...diagnosisForm,
          tests: diagnosisForm.tests.filter((_, idx) => idx !== testIndex),
        },
      };
    });
  };

  const removeReviewTestField = (testIndex) => {
    setReviewFormData((prev) => ({
      ...prev,
      additionalTests: prev.additionalTests.filter((_, idx) => idx !== testIndex),
    }));
  };

  const openModal = (diagnosisId) => {
    setSelectedDiagnosisId(diagnosisId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDiagnosisId(null);
    if (selectedDiagnosisId) {
      setFormData((prev) => ({
        ...prev,
        [selectedDiagnosisId]: initializeFormData(selectedDiagnosisId),
      }));
    }
  };

  const openReviewModal = (diagnosisId) => {
    setReviewDiagnosisId(diagnosisId);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewDiagnosisId(null);
    setReviewFormData({
      recommendedMedicine: "",
      notes: "",
      revisitTimeFrame: "Monthly",
      additionalTests: [{ testName: "", attachmentURL: "" }],
      doctorStatus: "Monitoring",
    });
  };

  // New functions for "Add More Tests" popup
  const openAddTestModal = (diagnosisId) => {
    setAddTestDiagnosisId(diagnosisId);
    setNewTestName(""); // Reset test name input
    setIsAddTestModalOpen(true);
  };

  const closeAddTestModal = () => {
    setIsAddTestModalOpen(false);
    setAddTestDiagnosisId(null);
    setNewTestName("");
  };

  const handleAddTestSubmit = async () => {
    if (!newTestName.trim()) {
      toast.error("Please enter a test name.");
      return;
    }

    setSubmitting((prev) => ({ ...prev, [addTestDiagnosisId]: true }));
    try {
      const response = await api.put(
        `predictions/${patient.patientId}/diagnoses/${addTestDiagnosisId}/tests`,
        { testName: newTestName }
      );

      toast.success("Test added successfully!");

      // Update local state with the new test
      setDiagnoseHistory((prevHistory) =>
        prevHistory.map((diag) => {
          if (diag._id === addTestDiagnosisId) {
            return {
              ...diag,
              recommend: {
                ...diag.recommend,
                tests: [
                  ...(diag.recommend?.tests || []),
                  {
                    testName: newTestName,
                    status: "Pending", // Default from backend
                    addedAt: new Date(),
                    _id: response.data.data.recommend.tests[response.data.data.recommend.tests.length - 1]._id, // Get new test ID from response
                  },
                ],
              },
            };
          }
          return diag;
        })
      );

      closeAddTestModal();
    } catch (error) {
      console.error("Error adding test:", error.response?.data || error.message);
      toast.error(`Failed to add test: ${error.response?.data?.error || error.message}`);
    }
    setSubmitting((prev) => ({ ...prev, [addTestDiagnosisId]: false }));
  };

  const openPdfViewer = (url) => {
    setCurrentPdfUrl(url);
    setPdfViewerOpen(true);
  };

  const closePdfViewer = () => {
    setPdfViewerOpen(false);
    setCurrentPdfUrl(null);
  };

  const toggleRecommendation = (diagnosisId) => {
    setExpandedDiagnosis((prev) => ({
      ...prev,
      [diagnosisId]: !prev[diagnosisId],
    }));
  };

  const handleSubmit = async (diagnosisId) => {
    const data = formData[diagnosisId];
    if (!data || !data.medicine || !data.tests.length || !data.note) {
      toast.error("Please fill in all fields (medicine, at least one test, and note).");
      return;
    }

    setSubmitting((prev) => ({ ...prev, [diagnosisId]: true }));
    try {
      await api.put(
        `predictions/${patient._id}/diagnoses/${diagnosisId}/recommendations`,
        {
          medicine: data.medicine,
          tests: data.tests,
          note: data.note,
        }
      );
      toast.success("Recommendations updated successfully!");
      closeModal();
      await refreshDiagnosisHistory();
    } catch (error) {
      console.error("Error updating recommendations:", error.response?.data || error.message);
      toast.error(
        `Failed to update recommendations: ${error.response?.data?.error || error.message}`
      );
    }
    setSubmitting((prev) => ({ ...prev, [diagnosisId]: false }));
  };

  const handleReviewSubmit = async () => {
    if (!reviewFormData.recommendedMedicine && !reviewFormData.notes) {
      toast.error("Please provide at least one of recommended medicine or notes.");
      return;
    }

    setSubmitting((prev) => ({ ...prev, [reviewDiagnosisId]: true }));
    try {
      const filteredTests = reviewFormData.additionalTests.filter((test) => test.testName.trim());
      const response = await api.put(
        `predictions/${patient._id}/diagnoses/${reviewDiagnosisId}/review`,
        {
          reviewInfo: {
            recommendedMedicine: reviewFormData.recommendedMedicine,
            notes: reviewFormData.notes,
          },
          additionalTests: filteredTests,
          doctorStatus: reviewFormData.doctorStatus,
          ...(reviewFormData.revisitTimeFrame && { "reviewInfo.revisitTimeFrame": reviewFormData.revisitTimeFrame }),
        }
      );

      toast.success("Review information and tests added successfully!");

      setDiagnoseHistory((prevHistory) =>
        prevHistory.map((diag) => {
          if (diag._id === reviewDiagnosisId) {
            const newReview = {
              recommendedMedicine: reviewFormData.recommendedMedicine,
              notes: reviewFormData.notes,
              updatedAt: new Date(),
            };

            const updatedTests = filteredTests.map((test) => ({
              testName: test.testName,
              status: "Pending",
              attachmentURL: test.attachmentURL || "",
              addedAt: new Date(),
            }));

            return {
              ...diag,
              status: "Checked",
              revisitTimeFrame: reviewFormData.revisitTimeFrame || diag.revisitTimeFrame,
              reviewInfo: [...(diag.reviewInfo || []), newReview],
              recommend: {
                ...diag.recommend,
                tests: [...(diag.recommend?.tests || []), ...updatedTests],
              },
            };
          }
          return diag;
        })
      );

      setExpandedDiagnosis((prev) => ({
        ...prev,
        [reviewDiagnosisId]: true,
      }));

      closeReviewModal();
    } catch (error) {
      console.error("Error adding review information:", error.response?.data || error.message);
      toast.error(
        `Failed to add review information: ${error.response?.data?.error || error.message}`
      );
    }
    setSubmitting((prev) => ({ ...prev, [reviewDiagnosisId]: false }));
  };

  const handleMarkAsChecked = async (diagnosisId) => {
    setSubmitting((prev) => ({ ...prev, [diagnosisId]: true }));
    try {
      await api.put(
        `predictions/${patient._id}/diagnoses/${diagnosisId}/recommendations`,
        {
          medicine: "",
          tests: [],
          note: "",
        }
      );
      toast.success("Diagnosis marked as checked successfully!");
      await refreshDiagnosisHistory();
    } catch (error) {
      console.error("Error marking diagnosis as checked:", error.response?.data || error.message);
      toast.error(`Failed to mark as checked: ${error.response?.data?.error || error.message}`);
    }
    setSubmitting((prev) => ({ ...prev, [diagnosisId]: false }));
  };

  const handleMarkAsReviewed = async (diagnosisId, testId) => {
    setSubmitting((prev) => ({ ...prev, [testId]: true }));
    try {
      const response = await api.put(
        `predictions/${patient._id}/diagnoses/${diagnosisId}/tests/${testId}/status`,
        { status: "Reviewed" }
      );
      toast.success("Test marked as reviewed successfully!");

      setDiagnoseHistory((prevHistory) =>
        prevHistory.map((diag) => {
          if (diag._id === diagnosisId) {
            const updatedTests = diag.recommend.tests.map((test) =>
              test._id === testId ? { ...test, status: "Reviewed" } : test
            );
            return {
              ...diag,
              recommend: {
                ...diag.recommend,
                tests: updatedTests,
              },
            };
          }
          return diag;
        })
      );
    } catch (error) {
      console.error("Error marking test as reviewed:", error.response?.data || error.message);
      toast.error(
        `Failed to mark test as reviewed: ${error.response?.data?.error || error.message}`
      );
    }
    setSubmitting((prev) => ({ ...prev, [testId]: false }));
  };

  const refreshDiagnosisHistory = async () => {
    try {
      console.log(patient._id);
      const response = await api.get(`patients/${patient.patientId}`);
      console.log(response);
      setDiagnoseHistory(response.data.data.diagnoseHistory || []);
    } catch (error) {
      console.error("Error refreshing diagnosis history:", error);
      toast.error(error.response?.data?.error || "Failed to refresh diagnosis history");
    }
  };

  const handleFileClick = (url, fileType) => {
    if (fileType === "pdf") {
      openPdfViewer(url);
    } else if (fileType === "image") {
      openImage(url);
    }
  };

  const areAllTestsReviewed = (tests) => {
    return tests.length > 0 && tests.every((test) => test.status === "Reviewed");
  };

  useEffect(() => {
    setDiagnoseHistory(patient.diagnoseHistory || []);
  }, [patient]);

  return (
    <div className="space-y-6">
      <div className="flex items-center text-xl font-semibold text-gray-800">
        <Activity className="w-6 h-6 mr-2 text-indigo-600" />
        <span>Diagnosis History</span>
      </div>

      {diagnoseHistory.length === 0 ? (
        <p className="text-gray-600 italic text-center py-4">No diagnosis history available</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl">
          <table className="min-w-full bg-white rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eye
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {diagnoseHistory.map((diag, index) => (
                <React.Fragment key={index}>
                  <tr
                    className={`hover:bg-indigo-50/50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center">
                        {diag.imageUrl ? (
                          <img
                            src={diag.imageUrl}
                            alt="Diagnosis"
                            className="w-full h-full object-cover rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200"
                            onClick={() => openImage(diag.imageUrl)}
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {diag.diagnosis || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1 text-indigo-600" />
                        {diag.eye || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {diag.uploadedAt ? new Date(diag.uploadedAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          diag.status === "Checked" || diag.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : diag.status === "Review"
                            ? "bg-purple-100 text-purple-700"
                            : diag.status === "Test Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {diag.status || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {getMaxConfidence(diag.confidenceScores) || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-2">
                        {isFromPreMonitoring && diag.status === "Unchecked" && (
                          <>
                            <button
                              onClick={() => openModal(diag._id)}
                              className="flex items-center px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-300 text-xs shadow-sm"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Diagnose
                            </button>
                            <button
                              onClick={() => handleMarkAsChecked(diag._id)}
                              disabled={submitting[diag._id]}
                              className={`flex items-center px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-300 text-xs shadow-sm ${
                                submitting[diag._id] ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Check
                            </button>
                          </>
                        )}
                        {areAllTestsReviewed(diag.recommend?.tests || []) && diag.status === "Test Completed" && (
                          <button
                            onClick={() => openReviewModal(diag._id)}
                            className="flex items-center px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 text-xs shadow-sm"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Add Review
                          </button>
                        )}
                        {(diag.recommend || diag.reviewInfo?.length > 0) && (
                          <button
                            onClick={() => toggleRecommendation(diag._id)}
                            className={`flex items-center px-2 py-1 text-white rounded-md transition-all duration-300 text-xs shadow-sm ${
                              expandedDiagnosis[diag._id]
                                ? "bg-indigo-400 hover:bg-indigo-500"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            {expandedDiagnosis[diag._id] ? (
                              <>
                                Hide <ChevronUp className="w-3 h-3 ml-1" />
                              </>
                            ) : (
                              <>
                                View <ChevronDown className="w-3 h-3 ml-1" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {(diag.recommend || diag.reviewInfo?.length > 0) && expandedDiagnosis[diag._id] && (
                    <tr>
                      <td colSpan="7" className="p-0">
                        <div className="bg-gradient-to-br from-indigo-50 to-white animate-fadeIn p-6 border-t border-b border-indigo-100">
                          {diag.recommend && (
                            <>
                              <div className="text-lg font-semibold text-indigo-800 mb-4 flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileText className="w-5 h-5 mr-2" />
                                  Medical Recommendations
                                </div>
                                {(patient.patientStatus === "Monitoring" || patient.patientStatus === "Pre-Monitoring") &&
                                  diag.status === "Checked" && (
                                    <button
                                      onClick={() => openAddTestModal(diag._id)}
                                      className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 text-xs shadow-sm"
                                    >
                                      <PlusCircle className="w-3 h-3 mr-1" />
                                      Add More Tests
                                    </button>
                                  )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 transition-all duration-300 hover:shadow-md">
                                  <div className="flex items-center mb-3">
                                    <Pill className="w-5 h-5 text-indigo-600 mr-2" />
                                    <h3 className="text-md font-medium text-gray-800">
                                      Prescribed Medicine
                                    </h3>
                                  </div>
                                  <p className="text-gray-700 pl-7">
                                    {diag.recommend.medicine || "No medicine prescribed"}
                                  </p>
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 transition-all duration-300 hover:shadow-md">
                                  <div className="flex items-center mb-3">
                                    <AlertCircle className="w-5 h-5 text-indigo-600 mr-2" />
                                    <h3 className="text-md font-medium text-gray-800">Doctor's Note</h3>
                                  </div>
                                  <p className="text-gray-700 pl-7">
                                    {diag.recommend.note || "No notes added"}
                                  </p>
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 transition-all duration-300 hover:shadow-md">
                                  <div className="flex items-center mb-3">
                                    <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                                    <h3 className="text-md font-medium text-gray-800">
                                      Revisit Time Frame
                                    </h3>
                                  </div>
                                  <p className="text-gray-700 pl-7">
                                    {diag.revisitTimeFrame || "No revisit schedule set"}
                                  </p>
                                </div>
                              </div>
                              {diag.recommend.tests?.length > 0 && (
                                <div className="mt-6">
                                  <div className="text-md font-semibold text-indigo-700 mb-3">
                                    Tests
                                  </div>
                                  <div className="overflow-hidden rounded-xl border border-indigo-100 shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-indigo-50">
                                        <tr>
                                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Test Name
                                          </th>
                                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Status
                                          </th>
                                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Attachment
                                          </th>
                                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Added At
                                          </th>
                                          {patient.patientStatus === "Review" && (
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                              Actions
                                            </th>
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {diag.recommend.tests.map((test, idx) => (
                                          <tr
                                            key={test._id}
                                            className={`${
                                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                            } hover:bg-indigo-50/30 transition-colors duration-200`}
                                          >
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                              {test.testName || "N/A"}
                                            </td>
                                            <td className="px-6 py-4">
                                              <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                  test.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : test.status === "In Progress"
                                                    ? "bg-orange-100 text-orange-800"
                                                    : test.status === "Completed"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-green-100 text-green-800"
                                                }`}
                                              >
                                                {test.status === "Pending" ? (
                                                  <svg
                                                    className="w-2 h-2 mr-1.5 text-yellow-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 8 8"
                                                  >
                                                    <circle cx="4" cy="4" r="3" />
                                                  </svg>
                                                ) : test.status === "In Progress" ? (
                                                  <svg
                                                    className="w-2 h-2 mr-1.5 text-orange-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 8 8"
                                                  >
                                                    <circle cx="4" cy="4" r="3" />
                                                  </svg>
                                                ) : test.status === "Completed" ? (
                                                  <svg
                                                    className="w-2 h-2 mr-1.5 text-blue-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 8 8"
                                                  >
                                                    <circle cx="4" cy="4" r="3" />
                                                  </svg>
                                                ) : (
                                                  <svg
                                                    className="w-2 h-2 mr-1.5 text-green-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 8 8"
                                                  >
                                                    <circle cx="4" cy="4" r="3" />
                                                  </svg>
                                                )}
                                                {test.status || "N/A"}
                                              </span>
                                            </td>
                                            <td className="px-6 py-4">
                                              {test.attachmentURL ? (
                                                <button
                                                  onClick={() =>
                                                    handleFileClick(
                                                      test.attachmentURL,
                                                      getFileType(test.attachmentURL)
                                                    )
                                                  }
                                                  className="inline-flex items-center px-3 py-1.5 bg-white border border-indigo-300 rounded-md text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900 transition-all duration-200 shadow-sm"
                                                >
                                                  {getFileType(test.attachmentURL) === "image" ? (
                                                    <>
                                                      <Image className="w-4 h-4 mr-1.5" />
                                                      <span className="text-xs font-medium">
                                                        View Image
                                                      </span>
                                                    </>
                                                  ) : getFileType(test.attachmentURL) === "pdf" ? (
                                                    <>
                                                      <File className="w-4 h-4 mr-1.5" />
                                                      <span className="text-xs font-medium">
                                                        View PDF
                                                      </span>
                                                    </>
                                                  ) : (
                                                    <span className="text-xs font-medium">
                                                      View File
                                                    </span>
                                                  )}
                                                </button>
                                              ) : (
                                                <span className="text-xs text-gray-500">
                                                  No attachment
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                              {test.addedAt
                                                ? new Date(test.addedAt).toLocaleString()
                                                : "N/A"}
                                            </td>
                                            {patient.patientStatus === "Review" && (
                                              <td className="px-6 py-4">
                                                {test.status === "Completed" || test.status === "Reviewed" ? (
                                                  <button
                                                    onClick={() => handleMarkAsReviewed(diag._id, test._id)}
                                                    disabled={test.status === "Reviewed" || submitting[test._id]}
                                                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md shadow-sm transition-all duration-300 ${
                                                      test.status === "Reviewed"
                                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                        : "bg-green-600 text-white hover:bg-green-700"
                                                    } ${submitting[test._id] ? "opacity-50 cursor-not-allowed" : ""}`}
                                                  >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Mark as Reviewed
                                                  </button>
                                                ) : null}
                                              </td>
                                            )}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {diag.reviewInfo?.length > 0 && (
                            <div
                              className={`${diag.recommend ? "mt-8 pt-6 border-t border-indigo-100" : ""}`}
                            >
                              <div className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Review History
                              </div>
                              {diag.reviewInfo.map((review, reviewIdx) => (
                                <div
                                  key={reviewIdx}
                                  className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-purple-100"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <div className="flex items-center mb-3">
                                        <Pill className="w-5 h-5 text-purple-600 mr-2" />
                                        <h3 className="text-md font-medium text-gray-800">
                                          Recommended Medicine
                                        </h3>
                                      </div>
                                      <p className="text-gray-700 pl-7">
                                        {review.recommendedMedicine || "No medicine recommended"}
                                      </p>
                                    </div>
                                    <div>
                                      <div className="flex items-center mb-3">
                                        <Clipboard className="w-5 h-5 text-purple-600 mr-2" />
                                        <h3 className="text-md font-medium text-gray-800">
                                          Notes
                                        </h3>
                                      </div>
                                      <p className="text-gray-700 pl-7">
                                        {review.notes || "No notes recorded"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-4 text-right text-xs text-gray-500">
                                    Last updated: {new Date(review.updatedAt).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedDiagnosisId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-all duration-300"
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Recommendations</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Medicine</label>
                <input
                  type="text"
                  value={formData[selectedDiagnosisId]?.medicine || ""}
                  onChange={(e) => handleInputChange(selectedDiagnosisId, "medicine", e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter medicine prescription"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tests</label>
                {(formData[selectedDiagnosisId]?.tests || [{ testName: "", status: "Pending" }]).map(
                  (test, idx) => (
                    <div key={idx} className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={test.testName}
                        onChange={(e) =>
                          handleInputChange(selectedDiagnosisId, "tests", e.target.value, idx)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        placeholder={`Test ${idx + 1}`}
                      />
                      {idx === (formData[selectedDiagnosisId]?.tests.length || 1) - 1 && (
                        <button
                          onClick={() => addTestField(selectedDiagnosisId)}
                          className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-300"
                        >
                          +
                        </button>
                      )}
                      {idx > 0 && (
                        <button
                          onClick={() => removeTestField(selectedDiagnosisId, idx)}
                          className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300"
                        >
                          -
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <textarea
                  value={formData[selectedDiagnosisId]?.note || ""}
                  onChange={(e) => handleInputChange(selectedDiagnosisId, "note", e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter note"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit(selectedDiagnosisId)}
                  disabled={submitting[selectedDiagnosisId]}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-300 ${
                    submitting[selectedDiagnosisId] ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting[selectedDiagnosisId] ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReviewModalOpen && reviewDiagnosisId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fadeIn">
            <button
              onClick={closeReviewModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-all duration-300"
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
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-purple-600" />
              Add Review Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Recommended Medicine</label>
                <input
                  type="text"
                  value={reviewFormData.recommendedMedicine}
                  onChange={(e) => handleReviewInputChange("recommendedMedicine", e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter recommended medicine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={reviewFormData.notes}
                  onChange={(e) => handleReviewInputChange("notes", e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter review notes"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Revisit Time Frame</label>
                <select
                  value={reviewFormData.revisitTimeFrame}
                  onChange={(e) => handleReviewInputChange("revisitTimeFrame", e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Bi-annually">Bi-annually</option>
                  <option value="Annually">Annually</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Additional Tests</label>
                {reviewFormData.additionalTests.map((test, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={test.testName}
                      onChange={(e) =>
                        handleReviewInputChange("additionalTests", e.target.value, idx)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder={`Test ${idx + 1}`}
                    />
                    {idx === reviewFormData.additionalTests.length - 1 && (
                      <button
                        onClick={addReviewTestField}
                        className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-300"
                      >
                        +
                      </button>
                    )}
                    {idx > 0 && (
                      <button
                        onClick={() => removeReviewTestField(idx)}
                        className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300"
                      >
                        -
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor Status</label>
                <select
                  value={reviewFormData.doctorStatus}
                  onChange={(e) => handleReviewInputChange("doctorStatus", e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="Pre-Monitoring">Pre-Monitoring</option>
                  <option value="Published">Published</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Monitoring">Monitoring</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeReviewModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={submitting[reviewDiagnosisId]}
                  className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 ${
                    submitting[reviewDiagnosisId] ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting[reviewDiagnosisId] ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddTestModalOpen && addTestDiagnosisId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative animate-fadeIn">
            <button
              onClick={closeAddTestModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-all duration-300"
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Test</h3>
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Test Name</label>
                <select
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select a test</option>
                  {availableTests
                    .filter((test) => test.isEnabled)
                    .map((test) => (
                      <option key={test._id} value={test.name}>
                        {test.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeAddTestModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTestSubmit}
                  disabled={submitting[addTestDiagnosisId]}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 ${
                    submitting[addTestDiagnosisId] ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting[addTestDiagnosisId] ? "Submitting..." : "Add Test"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pdfViewerOpen && currentPdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-4/5 p-2 relative">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={closePdfViewer}
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <iframe src={currentPdfUrl} className="w-full h-full rounded-lg" title="PDF Viewer" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisHistory;