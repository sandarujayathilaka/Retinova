import React, { useState } from "react";
import axios from "axios";

// Helper function to detect file type based on URL extension
const getFileType = url => {
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

  // Initialize form data for a diagnosis
  const initializeFormData = diagnosisId => ({
    medicine: "",
    tests: [{ testName: "", status: "Pending" }],
    note: "",
  });

  // Handle form input changes
  const handleInputChange = (diagnosisId, field, value, testIndex = null) => {
    setFormData(prev => {
      const diagnosisForm = prev[diagnosisId] || initializeFormData(diagnosisId);
      if (field === "tests" && testIndex !== null) {
        const updatedTests = [...diagnosisForm.tests];
        updatedTests[testIndex] = { ...updatedTests[testIndex], testName: value };
        return { ...prev, [diagnosisId]: { ...diagnosisForm, tests: updatedTests } };
      }
      return { ...prev, [diagnosisId]: { ...diagnosisForm, [field]: value } };
    });
  };

  // Add a new test field
  const addTestField = diagnosisId => {
    setFormData(prev => {
      const diagnosisForm = prev[diagnosisId] || initializeFormData(diagnosisId);
      const updatedTests = [...diagnosisForm.tests, { testName: "", status: "Pending" }];
      return { ...prev, [diagnosisId]: { ...diagnosisForm, tests: updatedTests } };
    });
  };

  // Remove a test field
  const removeTestField = (diagnosisId, testIndex) => {
    setFormData(prev => {
      const diagnosisForm = prev[diagnosisId] || initializeFormData(diagnosisId);
      const updatedTests = diagnosisForm.tests.filter((_, idx) => idx !== testIndex);
      return { ...prev, [diagnosisId]: { ...diagnosisForm, tests: updatedTests } };
    });
  };

  // Open modal for adding recommendations
  const openModal = diagnosisId => {
    setSelectedDiagnosisId(diagnosisId);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDiagnosisId(null);
    if (selectedDiagnosisId) {
      setFormData(prev => ({
        ...prev,
        [selectedDiagnosisId]: initializeFormData(selectedDiagnosisId),
      }));
    }
  };

  // Handle form submission with recommendations
  const handleSubmit = async diagnosisId => {
    const data = formData[diagnosisId];
    if (!data || !data.medicine || !data.tests.length || !data.note) {
      alert("Please fill in all fields (medicine, at least one test, and note).");
      return;
    }

    setSubmitting(prev => ({ ...prev, [diagnosisId]: true }));
    try {
      const response = await axios.put(
        `http://localhost:4000/api/patients/${patient._id}/diagnoses/${diagnosisId}/recommendations`,
        {
          medicine: data.medicine,
          tests: data.tests,
          note: data.note,
        },
      );
      alert("Recommendations updated successfully!");
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Error updating recommendations:", error.response?.data || error.message);
      alert("Failed to update recommendations: " + (error.response?.data?.error || error.message));
    }
    setSubmitting(prev => ({ ...prev, [diagnosisId]: false }));
  };

  // Handle "Mark as Checked" with empty payload
  const handleMarkAsChecked = async diagnosisId => {
    setSubmitting(prev => ({ ...prev, [diagnosisId]: true }));
    try {
      const response = await axios.put(
        `http://localhost:4000/api/patients/${patient._id}/diagnoses/${diagnosisId}/recommendations`,
        {
          medicine: "",
          tests: [],
          note: "",
        },
      );
      alert("Diagnosis marked as checked successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error marking diagnosis as checked:", error.response?.data || error.message);
      alert(
        "Failed to mark diagnosis as checked: " + (error.response?.data?.error || error.message),
      );
    }
    setSubmitting(prev => ({ ...prev, [diagnosisId]: false }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01"
          />
        </svg>
        Diagnosis History
      </h2>
      {patient.diagnoseHistory.length > 0 ? (
        patient.diagnoseHistory.map((diag, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Section: Image and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <img
                  src={diag.imageUrl}
                  alt="Diagnosis"
                  className="w-full max-w-xs h-32 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onClick={() => openImage(diag.imageUrl)}
                />
                <div className="mt-2 text-center md:text-left">
                  <p className="text-gray-700">
                    <span className="font-semibold text-blue-600">Diagnosis:</span> {diag.diagnosis}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-blue-600">Uploaded:</span>{" "}
                    {new Date(diag.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-blue-600">Status:</span>
                    <span
                      className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        diag.status === "Checked"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {diag.status}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-blue-600">Confidence:</span>{" "}
                    {getMaxConfidence(diag.confidenceScores)}%
                  </p>
                </div>
              </div>

              {/* Right Section: Recommendations and Actions */}
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 font-semibold text-blue-600">Recommendations:</p>
                  {diag.recommend ? (
                    <div className="mt-2 space-y-3">
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                        <p className="font-medium text-gray-800">Medicine:</p>
                        <p className="text-gray-700">{diag.recommend.medicine || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                        <p className="font-medium text-gray-800">Tests:</p>
                        {diag.recommend.tests && diag.recommend.tests.length > 0 ? (
                          <ul className="space-y-2">
                            {diag.recommend.tests.map((test, idx) => {
                              const fileType = getFileType(test.attachmentURL);
                              return (
                                <li key={idx} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span>{test.testName}</span>
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        test.status === "Pending"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {test.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {fileType === "image" && test.attachmentURL ? (
                                      <a
                                        href={test.attachmentURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                      >
                                        <img
                                          src={test.attachmentURL}
                                          alt="Attachment"
                                          className="w-8 h-8 object-cover rounded-md border border-gray-200"
                                        />
                                      </a>
                                    ) : fileType === "pdf" && test.attachmentURL ? (
                                      <a
                                        href={test.attachmentURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline flex items-center"
                                      >
                                        <svg
                                          className="w-6 h-6 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                        View PDF
                                      </a>
                                    ) : (
                                      <span className="text-gray-500 text-sm">N/A</span>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-gray-700">N/A</p>
                        )}
                      </div>
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                        <p className="font-medium text-gray-800">Note:</p>
                        <p className="text-gray-700">{diag.recommend.note || "N/A"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No recommendations available</p>
                  )}
                </div>

                {/* Buttons for Unchecked Diagnoses */}
                {isFromPreMonitoring && diag.status === "Unchecked" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => openModal(diag._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Diagnose with Note
                    </button>
                    <button
                      onClick={() => handleMarkAsChecked(diag._id)}
                      disabled={submitting[diag._id]}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center ${
                        submitting[diag._id] ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Mark as Checked
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 italic">No diagnosis history available</p>
      )}

      {/* Modal for Adding Recommendations */}
      {isModalOpen && selectedDiagnosisId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fade-in-down">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
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
                  onChange={e => handleInputChange(selectedDiagnosisId, "medicine", e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter medicine prescription (e.g., Aspirin 100mg)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tests</label>
                {(
                  formData[selectedDiagnosisId]?.tests || [{ testName: "", status: "Pending" }]
                ).map((test, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={test.testName}
                      onChange={e =>
                        handleInputChange(selectedDiagnosisId, "tests", e.target.value, idx)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder={`Test ${idx + 1}`}
                    />
                    {idx === (formData[selectedDiagnosisId]?.tests.length || 1) - 1 && (
                      <button
                        onClick={() => addTestField(selectedDiagnosisId)}
                        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200"
                      >
                        +
                      </button>
                    )}
                    {idx > 0 && (
                      <button
                        onClick={() => removeTestField(selectedDiagnosisId, idx)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
                      >
                        -
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <textarea
                  value={formData[selectedDiagnosisId]?.note || ""}
                  onChange={e => handleInputChange(selectedDiagnosisId, "note", e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter note"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit(selectedDiagnosisId)}
                  disabled={submitting[selectedDiagnosisId]}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ${
                    submitting[selectedDiagnosisId] ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting[selectedDiagnosisId] ? "Submitting..." : "Submit Recommendations"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisHistory;
