import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/PatientProfile/Header";
import TabNavigation from "../components/PatientProfile/TabNavigation";
import TabContent from "../components/PatientProfile/TabContent";
import Footer from "../components/PatientProfile/Footer";
import ImageModal from "../components/diagnose/ImageModal";
import { BadgeAlert, Activity } from "lucide-react";
import { api } from "@/services/api.service";

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);  // Added for ImageModal
  const [rotation, setRotation] = useState(0);    // Added for ImageModal
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isFromPreMonitoring = location.state?.referrer === "PreMonitoringPatientsPage";

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await api.get(`patients/${patientId}`);
        setPatient(response.data.data);
        console.log("Patient data:", response.data.data);
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Failed to load patient details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patientId, navigate, refreshTrigger]);

  const refreshPatientData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const getMaxConfidence = scores => {
    if (!scores || scores.length === 0) return "N/A";
    const maxScore = Math.max(...scores);
    return `${(maxScore * 100).toFixed(2)}%`;
  };

  const openImage = imageUrl => setSelectedImage(imageUrl);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-t-blue-900 border-r-indigo-900 border-b-blue-900 border-l-indigo-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Loading Patient Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <BadgeAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-6">The requested patient profile could not be found.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-lg hover:opacity-90 transition-all duration-300 focus:ring-4 focus:ring-blue-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const urgentItems = patient.diagnoseHistory 
    ? patient.diagnoseHistory.filter(d => d.status === "Unchecked").length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Header patientId={patientId} navigate={navigate} patient={patient} />
        
        <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden border border-indigo-100">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {patient.fullName || "Unnamed Patient"}
                </h1>
                <div className="flex flex-wrap gap-3 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ID: {patient.patientId || patientId}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {patient.gender || "Unspecified"} • {patient.age || "?"} Years
                  </span>
                  {urgentItems > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Activity className="w-3 h-3 mr-1" />
                      {urgentItems} Urgent {urgentItems === 1 ? "Item" : "Items"}
                    </span>
                  )}

                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Patient Status: {patient.patientStatus || patientId}
                  </span>
                </div>
                <p className="text-gray-600">
                
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                  Last Updated: {new Date(patient.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="p-6 sm:p-8">
            <TabContent
              activeTab={activeTab}
              patient={patient}
              getMaxConfidence={getMaxConfidence}
              openImage={openImage}
              isFromPreMonitoring={isFromPreMonitoring}
              refreshData={refreshPatientData}
            />
          </div>
          
          <div className="px-6 sm:px-8 pb-6">
            <Footer patient={patient} />
          </div>
        </div>
      </div>
      
      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        rotation={rotation}
        setRotation={setRotation}
      />
    </div>
  );
};

export default PatientProfile;