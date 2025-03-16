import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../services/api.service";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  UserCircle2Icon,
  ArrowLeft,
  Smartphone,
  Loader2,
  Mail,
  Pencil,
  Home,
  User2,
  IdCardIcon,
  CalendarIcon,
  Circle,
} from "lucide-react";
import ViewPatientStep1 from "./ViewPatientStep1";
import ViewPatientStep2 from "./ViewPatientStep2";
import MedicalHistory from "../MedicalHistory/MedicalHistory";
import TestRecords from "../../testrecord/TestRecords";
import { toast } from "react-hot-toast";

const ViewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [step, setStep] = useState(1); // 1 for Step 1, 2 for Step 2
  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [age, setAge] = useState(0);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false); // Flag to prevent duplicate toasts
  const patientId = id;

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    setLoading(true);
    setHasShownToast(false); // Reset toast flag on new effect run

    const fetchPatientData = async () => {
      try {
        const response = await api.get(`/patients/${patientId}`);
        if (response.status === 200 && isMounted) {
          const patientData = response.data.data;
          setPatient(patientData);
          setStep1Data({
            fullName: patientData.fullName || "",
            nic: patientData.nic || "",
            birthDate: patientData.birthDate ? patientData.birthDate.split("T")[0] : "",
            gender: patientData.gender || "",
            contactNumber: patientData.contactNumber || "",
            email: patientData.email || "",
            address: patientData.address || "",
          });
          setStep2Data({
            bloodType: patientData.bloodType || "",
            height: patientData.height || "",
            weight: patientData.weight || "",
            allergies: patientData.allergies || [],
            primaryPhysician: patientData.primaryPhysician || "",
            emergencyContact: patientData.emergencyContact || {
              name: "",
              relationship: "",
              phone: "",
            },
          });
          setAge(calculateAge(patientData.birthDate));
        }
      } catch (error) {
        if (isMounted && !hasShownToast) {
          if (error.response) {
            const { errorCode, message } = error.response.data || {};
            if (error.response.status === 404 || errorCode === "PATIENT_NOT_FOUND") {
              toast.error("Patient not found.");
              setError("Patient not found.");
            } else {
              toast.error(`Failed to fetch patient details: ${message || "Unknown error"}`);
              setError("Failed to load patient data. Please try again.");
            }
            setHasShownToast(true); // Mark toast as shown
          } else if (error.request) {
            toast.error("No response from the server. Please try again later.");
            setError("No response from the server. Please try again later.");
            setHasShownToast(true);
          } else {
            toast.error("An unexpected error occurred.");
            setError("An unexpected error occurred. Please try again.");
            setHasShownToast(true);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id && isMounted) fetchPatientData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [id]); // Dependency array ensures effect runs only when id changes

  const handleStep1Next = (data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep1Save = async (data) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        ...step2Data,
        height: step2Data?.height ? Number(step2Data.height) : undefined,
        weight: step2Data?.weight ? Number(step2Data.weight) : undefined,
        allergies: step2Data?.allergies?.length > 0 ? step2Data.allergies : undefined,
        emergencyContact: step2Data?.emergencyContact?.name ? step2Data.emergencyContact : undefined,
      };

      const responsePromise = api.put(`/patients/edit/${patientId}`, formattedData);
      await toast.promise(responsePromise, {
        loading: "Saving patient details...",
        success: "Patient details updated successfully!",
        error: (error) => {
          if (error.response) {
            const { errorCode, message } = error.response.data;
            if (errorCode === "PATIENT_NOT_FOUND") {
              return "Patient not found.";
            } else if (errorCode === "DUPLICATE_NIC") {
              return "A patient with this NIC already exists.";
            } else if (errorCode === "DUPLICATE_EMAIL") {
              return "A patient with this email already exists.";
            } else {
              return `Error: ${message}`;
            }
          } else if (error.request) {
            return "No response from the server. Please try again later.";
          } else {
            return "An unexpected error occurred.";
          }
        },
      });

      const response = await responsePromise;
      if (response.status === 200) {
        setPatient((prev) => ({ ...prev, ...formattedData }));
        setStep1Data({
          fullName: formattedData.fullName || "",
          nic: formattedData.nic || "",
          birthDate: formattedData.birthDate || "",
          gender: formattedData.gender || "",
          contactNumber: formattedData.contactNumber || "",
          email: formattedData.email || "",
          address: formattedData.address || "",
        });
        setStep2Data({
          bloodType: formattedData.bloodType || "",
          height: formattedData.height || "",
          weight: formattedData.weight || "",
          allergies: formattedData.allergies || [],
          primaryPhysician: formattedData.primaryPhysician || "",
          emergencyContact: formattedData.emergencyContact || {
            name: "",
            relationship: "",
            phone: "",
          },
        });
        setAge(calculateAge(formattedData.birthDate));
        setIsEditing(false);
        setStep(1);
      }
    } catch (error) {
      // Error is already handled by toast.promise
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Previous = (data) => {
    setStep2Data(data);
    setStep(1);
  };

  const handleSave = async (data) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...step1Data,
        ...data,
        height: data.height ? Number(data.height) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        allergies: data.allergies?.length > 0 ? data.allergies : undefined,
        emergencyContact: data.emergencyContact?.name ? data.emergencyContact : undefined,
      };

      const responsePromise = api.put(`/patients/edit/${patientId}`, formattedData);
      await toast.promise(responsePromise, {
        loading: "Saving patient details...",
        success: "Patient details updated successfully!",
        error: (error) => {
          if (error.response) {
            const { errorCode, message } = error.response.data;
            if (errorCode === "PATIENT_NOT_FOUND") {
              return "Patient not found.";
            } else if (errorCode === "DUPLICATE_NIC") {
              return "A patient with this NIC already exists.";
            } else if (errorCode === "DUPLICATE_EMAIL") {
              return "A patient with this email already exists.";
            } else {
              return `Error: ${message}`;
            }
          } else if (error.request) {
            return "No response from the server. Please try again later.";
          } else {
            return "An unexpected error occurred.";
          }
        },
      });

      const response = await responsePromise;
      if (response.status === 200) {
        setPatient((prev) => ({ ...prev, ...formattedData }));
        setStep1Data({
          fullName: formattedData.fullName || "",
          nic: formattedData.nic || "",
          birthDate: formattedData.birthDate || "",
          gender: formattedData.gender || "",
          contactNumber: formattedData.contactNumber || "",
          email: formattedData.email || "",
          address: formattedData.address || "",
        });
        setStep2Data({
          bloodType: formattedData.bloodType || "",
          height: formattedData.height || "",
          weight: formattedData.weight || "",
          allergies: formattedData.allergies || [],
          primaryPhysician: formattedData.primaryPhysician || "",
          emergencyContact: formattedData.emergencyContact || {
            name: "",
            relationship: "",
            phone: "",
          },
        });
        setAge(calculateAge(formattedData.birthDate));
        setIsEditing(false);
        setStep(1);
      }
    } catch (error) {
      // Error is already handled by toast.promise
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setStep(1);
  };

  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl rounded-2xl overflow-hidden border-0 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-8 px-6">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                  <UserCircle2Icon className="h-8 w-8" />
                  {patient ? `${patient.fullName}'s Profile` : "Loading..."}
                </CardTitle>
                <Button
                  onClick={() => navigate(-1)}
                  className="bg-white/20 hover:bg-white/30 rounded-full px-4 py-2"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
              </div>
              <div className="flex space-x-1 bg-white/10 rounded-full p-1">
                {["personal", "medical", "treatment"].map((tab) => (
                  <Button
                    key={tab}
                    variant="ghost"
                    onClick={() => {
                      setActiveTab(tab);
                      setStep(1);
                      setIsEditing(false);
                    }}
                    className={`flex-1 rounded-full py-2 text-sm font-medium capitalize ${
                      activeTab === tab
                        ? "bg-white text-teal-600 shadow-md"
                        : "text-white hover:bg-white/20"
                    } transition-all duration-200`}
                  >
                    {tab === "personal"
                      ? "Personal Details"
                      : tab === "medical"
                      ? "Medical Records"
                      : "Treatment Plans"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          {activeTab === "personal" && (
            <CardContent className="p-8 bg-white">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="p-6 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>
              ) : patient ? (
                <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-teal-50 rounded-xl shadow-lg">
                  <h2 className="text-3xl font-semibold text-teal-800 flex items-center gap-3">
                    <User2 className="h-7 w-7 text-teal-600" /> Patient Personal Details
                  </h2>
                  <div className="text-xl text-gray-500 mb-4">Patient ID: {patient.patientId}</div>
                  {!isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-2">
                          <User2 className="h-5 w-5 text-teal-500" />
                          <span className="text-gray-700 font-medium">Full Name:</span>
                          <span>{patient.fullName || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IdCardIcon className="h-5 w-5 text-teal-500" />
                          <span className="text-gray-700 font-medium">NIC Number:</span>
                          <span>{patient.nic || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-teal-500" />
                          <span className="text-gray-700 font-medium">Date of Birth:</span>
                          <span>
                            {patient.birthDate ? patient.birthDate.split("T")[0] : "N/A"} (Age: {age || 0})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Circle className="h-5 w-5 text-teal-500" />
                          <span className="text-gray-700 font-medium">Gender:</span>
                          <span>{patient.gender || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-teal-500" />
                          <span className="text-gray-700 font-medium">Phone Number:</span>
                          <span>{patient.contactNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-teal-500" />
                          <span className="text-gray-700 font-medium">Email Address:</span>
                          <span>{patient.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <Home className="h-5 w-5 text-teal-500" />
                          <span className="text-gray-700 font-medium">Full Address:</span>
                          <span>{patient.address || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-teal-500 hover:bg-teal-600 rounded-full px-6 py-2 text-white shadow-md transition-all duration-200"
                        >
                          <Pencil className="mr-2 h-5 w-5" /> Edit Profile
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {step === 1 && (
                        <ViewPatientStep1
                          initialData={step1Data}
                          step2Data={step2Data}
                          onNext={handleStep1Next}
                          onSave={handleStep1Save}
                          onCancel={handleCancel}
                          isSubmitting={isSubmitting}
                        />
                      )}
                      {step === 2 && (
                        <ViewPatientStep2
                          initialData={step2Data}
                          onPrevious={handleStep2Previous}
                          onSave={handleSave}
                          onCancel={handleCancel}
                          isSubmitting={isSubmitting}
                        />
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-red-50 text-red-600 rounded-lg text-center">
                  No patient data available.
                </div>
              )}
            </CardContent>
          )}

          {activeTab === "medical" && (
            <CardContent className="p-8 bg-white">
              {patient && <MedicalHistory patientId={patient.patientId} />}
            </CardContent>
          )}

          {activeTab === "treatment" && (
            <CardContent className="p-7 bg-white">
              {patient && <TestRecords patientId={patient.patientId} />}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ViewPatient;