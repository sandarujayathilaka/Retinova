import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import TabNavigation from "./TabNavigation";
import TabContent from "./TabContent";
import Footer from "./Footer";
import ImageModal from "./ImageModal";

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
        <Header patientId={patient.patientId} navigate={navigate} />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabContent
          activeTab={activeTab}
          patient={patient}
          getMaxConfidence={getMaxConfidence}
          openImage={openImage}
        />
        <Footer patient={patient} />
        <ImageModal selectedImage={selectedImage} closeImage={closeImage} />
      </div>
    </div>
  );
};

export default PatientProfile;
