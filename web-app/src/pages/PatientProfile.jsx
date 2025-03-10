import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/PatientProfile/Header";
import TabNavigation from "../components/PatientProfile/TabNavigation";
import TabContent from "../components/PatientProfile/TabContent";
import Footer from "../components/PatientProfile/Footer";
import ImageModal from "../components/PatientProfile/ImageModal";

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedImage, setSelectedImage] = useState(null);

  const isFromPreMonitoring = location.state?.referrer === "PreMonitoringPatientsPage";

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-white">
        <div className="text-gray-600 text-lg animate-pulse flex items-center">
          <svg
            className="w-6 h-6 mr-2 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 12a8 8 0 018-8v8m0 0a8 8 0 01-8 8"
            />
          </svg>
          Loading Patient Profile...
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-white">
        <div className="text-red-600 text-lg font-semibold">Patient not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <Header patientId={patientId} navigate={navigate} />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabContent
          activeTab={activeTab}
          patient={patient}
          getMaxConfidence={getMaxConfidence}
          openImage={openImage}
          isFromPreMonitoring={isFromPreMonitoring}
        />
        <Footer patient={patient} />
        <ImageModal selectedImage={selectedImage} closeImage={closeImage} />
      </div>
    </div>
  );
};

export default PatientProfile;
