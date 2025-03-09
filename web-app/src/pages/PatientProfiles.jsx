import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/patients/${patientId}`);
        setPatient(response.data.data);
      } catch (error) {
        console.error("Error fetching patient:", error);
        alert("Failed to load patient details");
        navigate("/");
      }
      setLoading(false);
    };
    fetchPatient();
  }, [patientId, navigate]);

  const getMaxConfidence = scores => {
    if (!scores || scores.length === 0) return "N/A";
    const maxScore = Math.max(...scores);
    return `${(maxScore * 100).toFixed(2)}%`;
  };

  const openImage = imageUrl => setSelectedImage(imageUrl);
  const closeImage = () => setSelectedImage(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-gray-600 text-lg animate-pulse">Loading Patient Profile...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-red-500 text-lg font-semibold">Patient not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 transform transition-all hover:shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Patient Profile</h1>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
              >
                Back to List
              </button>
            </div>
            <p className="mt-2 text-sm opacity-80">ID: {patient.patientId}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex border-b border-gray-200">
            {["basic", "contact", "medical", "diagnosis"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 text-center font-semibold text-sm uppercase tracking-wider transition-colors duration-200 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "basic" && "Basic Info"}
                {tab === "contact" && "Contact Info"}
                {tab === "medical" && "Medical History"}
                {tab === "diagnosis" && "Diagnosis History"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "basic" && (
              <div className="space-y-4 text-gray-700 animate-fade-in">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Basic Information
                </h2>
                <p>
                  <span className="font-medium">Name:</span> {patient.fullName}
                </p>
                <p>
                  <span className="font-medium">Age:</span> {patient.age}
                </p>
                <p>
                  <span className="font-medium">Gender:</span> {patient.gender}
                </p>
                <p>
                  <span className="font-medium">Category:</span> {patient.category.join(", ")}
                </p>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-4 text-gray-700 animate-fade-in">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Contact Information
                </h2>
                <p>
                  <span className="font-medium">Phone:</span> {patient.contactNumber}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {patient.email || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {patient.address || "N/A"}
                </p>
              </div>
            )}

            {activeTab === "medical" && (
              <div className="space-y-4 animate-fade-in">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Medical History
                </h2>
                {patient.medicalHistory.length > 0 ? (
                  patient.medicalHistory.map((history, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200"
                    >
                      <p className="text-gray-700">
                        <span className="font-medium">Condition:</span> {history.condition}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Diagnosed:</span>{" "}
                        {new Date(history.diagnosedAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Medications:</span>{" "}
                        {history.medications.join(", ") || "None"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No medical history available</p>
                )}
              </div>
            )}

            {/* Updated Diagnosis History Tab */}
            {activeTab === "diagnosis" && (
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
                      className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 flex flex-col sm:flex-row gap-4"
                    >
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={diag.imageUrl}
                          alt="Diagnosis"
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          onClick={() => openImage(diag.imageUrl)}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <p className="text-gray-700">
                            <span className="font-semibold text-blue-600">Diagnosis:</span>{" "}
                            {diag.diagnosis}
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
                            {getMaxConfidence(diag.confidenceScores)}
                          </p>
                        </div>

                        {/* Recommendations */}
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-gray-700 font-semibold text-blue-600">
                            Recommendations:
                          </p>
                          {diag.recommend ? (
                            <div className="mt-1 text-sm text-gray-700 space-y-1">
                              <p>
                                <span className="font-medium">Medicine:</span>{" "}
                                <span className="inline-block bg-blue-50 px-2 py-1 rounded-md">
                                  {diag.recommend.medicine || "N/A"}
                                </span>
                              </p>
                              <p className="font-medium">Tests:</p>
                              {diag.recommend.tests && diag.recommend.tests.length > 0 ? (
                                <ul className="list-disc list-inside ml-4">
                                  {diag.recommend.tests.map((test, idx) => (
                                    <li key={idx} className="text-gray-700">
                                      <span className="inline-block bg-blue-50 px-2 py-1 rounded-md">
                                        {test.testName}{" "}
                                        <span
                                          className={`text-xs ml-1 px-1 py-0.5 rounded-full ${
                                            test.status === "Pending"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-green-100 text-green-700"
                                          }`}
                                        >
                                          {test.status}
                                        </span>
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="inline-block bg-blue-50 px-2 py-1 rounded-md">
                                  N/A
                                </span>
                              )}
                              <p>
                                <span className="font-medium">Note:</span>{" "}
                                <span className="inline-block bg-blue-50 px-2 py-1 rounded-md">
                                  {diag.recommend.note || "N/A"}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic text-sm mt-1">
                              No recommendations available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No diagnosis history available</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-sm text-gray-600 transform transition-all hover:shadow-xl">
          <p>
            <span className="font-medium">Created At:</span>{" "}
            {new Date(patient.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Updated At:</span>{" "}
            {new Date(patient.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Full-Screen Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative max-w-4xl w-full">
            <img
              src={selectedImage}
              alt="Full View"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <button
              onClick={closeImage}
              className="absolute top-4 right-4 p-2 bg-white text-gray-800 rounded-full hover:bg-gray-200 transition-colors duration-200"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
