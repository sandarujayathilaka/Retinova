import { z } from "zod";

export const step1Schema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  birthDate: z.string().min(1, { message: "Date of birth is required." }),
  nic: z.string().min(10, { message: "NIC must be at least 10 characters." }),
  gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required." }),
  contactNumber: z
    .string()
    .min(1, { message: "Number is required." })
    .regex(/^\d{10}$/, { message: "Number is invalid." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email address." }),
});

export const step2Schema = z.object({
  bloodType: z.string().optional(),
  height: z.number().min(0, { message: "Height cannot be negative" }).optional().or(z.literal("")),
  weight: z.number().min(0, { message: "Weight cannot be negative" }).optional().or(z.literal("")),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^\d{10}$/.test(val),
          { message: "Phone number must be a valid 10-digit number if provided." }
        ),
    })
    .optional()
    .superRefine((data, ctx) => {
      const { name, relationship, phone } = data || {};
      const hasAnyField = name || (relationship && relationship !== "None") || phone;

      if (hasAnyField && !(name && relationship && relationship !== "None" && phone)) {
        if (!name) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["name"],
            message: "Name is required if any emergency contact field is provided.",
          });
        }
        if (!relationship || relationship === "None") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["relationship"],
            message: "Relationship is required if any emergency contact field is provided.",
          });
        }
        if (!phone) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phone"],
            message: "Phone is required if any emergency contact field is provided.",
          });
        }
      }
    }),
});

export const validateEmergencyContact = (emergencyContact) => {
  if (!emergencyContact || emergencyContact.relationship === "None") return { valid: true, errors: {} };

  const { name, relationship, phone } = emergencyContact;
  const hasAnyField = name || (relationship && relationship !== "None") || phone;

  if (!hasAnyField) return { valid: true, errors: {} };

  const errors = {};
  if (!name) errors.name = "Name is required if any emergency contact field is provided.";
  if (!relationship || relationship === "None") errors.relationship = "Relationship is required if any emergency contact field is provided.";
  if (!phone) errors.phone = "Phone is required if any emergency contact field is provided.";
  else if (!/^\d{10}$/.test(phone)) errors.phone = "Phone must be a valid 10-digit number";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api.service";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  AlertCircle,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import ViewPatientStep1 from "./ViewPatientStep1";
import ViewPatientStep2 from "./ViewPatientStep2";
import MedicalHistory from "../MedicalHistory/MedicalHistory";
import TestRecords from "../../testrecord/TestRecords";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";
import { showErrorToast, showSuccessToast, showNoChangesToast } from "../../utils/toastUtils"; 

const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const ViewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [age, setAge] = useState(0);

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const response = await api.get(`/patients/${id}`);
      return response.data.data;
    },
    onSuccess: (patientData) => {
      const step1 = {
        fullName: patientData.fullName || "",
        nic: patientData.nic || "",
        birthDate: patientData.birthDate ? patientData.birthDate.split("T")[0] : "",
        gender: patientData.gender || "",
        contactNumber: patientData.contactNumber || "",
        email: patientData.email || "",
        address: patientData.address || "",
      };
      const step2 = {
        bloodType: patientData.bloodType || "",
        height: patientData.height || "",
        weight: patientData.weight || "",
        allergies: patientData.allergies || [],
        emergencyContact: patientData.emergencyContact || { name: "", relationship: "None", phone: "" },
      };
      setStep1Data(step1);
      setStep2Data(step2);
      setAge(calculateAge(patientData.birthDate));
    },
    onError: (err) => {
      const message = err.response?.data?.message || "Failed to fetch patient details.";
      showErrorToast(message);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (patient && (!step1Data || !step2Data)) {
      const step1 = {
        fullName: patient.fullName || "",
        nic: patient.nic || "",
        birthDate: patient.birthDate ? patient.birthDate.split("T")[0] : "",
        gender: patient.gender || "",
        contactNumber: patient.contactNumber || "",
        email: patient.email || "",
        address: patient.address || "",
      };
      const step2 = {
        bloodType: patient.bloodType || "",
        height: patient.height || "",
        weight: patient.weight || "",
        allergies: patient.allergies || [],
        emergencyContact: patient.emergencyContact || { name: "", relationship: "None", phone: "" },
      };
      setStep1Data(step1);
      setStep2Data(step2);
      setAge(calculateAge(patient.birthDate));
    }
  }, [patient, step1Data, step2Data]);

  const handleStep1Next = useCallback((data) => {
    setStep1Data(data);
    setStep(2);
  }, []);

  // Improved normalizeData function
  const normalizeData = (data) => {
    // Handle emergency contact consistently
    let normalizedEmergencyContact = null;
    
    if (data.emergencyContact) {
      const { name, relationship, phone } = data.emergencyContact;
      
      // If all fields have values and relationship is not "None", create a valid contact
      if (name && relationship && relationship !== "None" && phone) {
        normalizedEmergencyContact = {
          name,
          relationship,
          phone,
        };
      }
    }
  
    return {
      fullName: data.fullName || "",
      nic: data.nic || "",
      birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
      gender: data.gender || "",
      contactNumber: data.contactNumber || "",
      email: data.email || "",
      address: data.address || "",
      bloodType: data.bloodType || "",
      height: data.height !== undefined ? Number(data.height) || "" : "",
      weight: data.weight !== undefined ? Number(data.weight) || "" : "",
      allergies: data.allergies?.length > 0 ? data.allergies.filter(Boolean) : [],
      emergencyContact: normalizedEmergencyContact,
    };
  };

  // Improved comparison between objects
  const hasDataChanged = (newData, originalData) => {
    const normalizedNew = normalizeData(newData);
    const normalizedOriginal = normalizeData(originalData);
    
    // Compare each field
    for (const key of Object.keys(normalizedNew)) {
      const newValue = normalizedNew[key];
      const origValue = normalizedOriginal[key];
      
      // Special handling for objects like emergencyContact
      if (typeof newValue === 'object' && newValue !== null) {
        if (!origValue) return true;
        if (JSON.stringify(newValue) !== JSON.stringify(origValue)) return true;
      } 
      // Special handling for arrays like allergies
      else if (Array.isArray(newValue)) {
        if (!Array.isArray(origValue)) return true;
        if (newValue.length !== origValue.length) return true;
        for (let i = 0; i < newValue.length; i++) {
          if (newValue[i] !== origValue[i]) return true;
        }
      }
      // Simple value comparison
      else if (newValue !== origValue) {
        return true;
      }
    }
    
    return false;
  };

  const handleSave = useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        const formattedData = {
          ...step1Data,
          ...data,
          height: data.height ? Number(data.height) : undefined,
          weight: data.weight ? Number(data.weight) : undefined,
          allergies: data.allergies?.filter(Boolean),
        };
  
        if (!hasDataChanged(formattedData, patient)) {
          showNoChangesToast("No changes have been made");
          setIsEditing(false);
          setStep(1);
          setIsSubmitting(false);
          return;
        }
  
        const normalizedData = normalizeData(formattedData);
        
     
        try {
          const response = await api.put(`/patients/edit/${id}`, normalizedData);
          
          // Handle success
          queryClient.invalidateQueries(["patient", id]);
          setIsEditing(false);
          setStep(1);
          showSuccessToast("Patient details updated successfully!");
          
          setStep2Data(data);
        } catch (error) {
          // Extract the specific error message from the response
          const errorResponse = error.response?.data;
          const errorMessage = errorResponse?.message || 
                               "Failed to update patient details.";
          
          // Map error codes to user-friendly messages if needed
          let displayMessage = errorMessage;
          if (errorResponse?.errorCode) {
            switch (errorResponse.errorCode) {
              case "PATIENT_NOT_FOUND":
                displayMessage = "Patient not found.";
                break;
              case "DUPLICATE_NIC":
                displayMessage = "A patient with this NIC already exists.";
                break;
              case "DUPLICATE_EMAIL":
                displayMessage = "A patient with this email already exists.";
                break;
              case "INVALID_EMERGENCY_CONTACT":
                displayMessage = "All emergency contact fields (name, relationship, phone) are required if any are provided.";
                break;
              case "INVALID_EMERGENCY_PHONE":
                displayMessage = "Emergency contact phone must be a valid 10-digit number.";
                break;
            }
          }
          
          // Show the error toast with the proper message
          showErrorToast(displayMessage);
          throw error; // Re-throw to maintain the error flow
        }
      } catch (error) {
        console.error("Caught error in handleSave:", error);
        // Error toast is shown in the inner try/catch
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, patient, step1Data, queryClient]
  );

  const handleStep1Save = useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        const formattedData = {
          ...data,
          ...step2Data,
        };
  
        if (!hasDataChanged(formattedData, patient)) {
          showNoChangesToast("No changes have been made.");
          setIsEditing(false);
          setStep(1);
          setIsSubmitting(false);
          return;
        }
  
        const normalizedData = normalizeData(formattedData);
        
        
        try {
          const response = await api.put(`/patients/edit/${id}`, normalizedData);
          
          // Handle success
          queryClient.invalidateQueries(["patient", id]);
          setIsEditing(false);
          setStep(1);
          showSuccessToast("Patient details updated successfully!");
          
          setStep1Data(data);
        } catch (error) {
          // Extract the specific error message from the response
          const errorResponse = error.response?.data;
          const errorMessage = errorResponse?.message || 
                               "Failed to update patient details.";
          
          // Map error codes to user-friendly messages if needed
          let displayMessage = errorMessage;
          if (errorResponse?.errorCode) {
            switch (errorResponse.errorCode) {
              case "PATIENT_NOT_FOUND":
                displayMessage = "Patient not found.";
                break;
              case "DUPLICATE_NIC":
                displayMessage = "A patient with this NIC already exists.";
                break;
              case "DUPLICATE_EMAIL":
                displayMessage = "A patient with this email already exists.";
                break;
              case "INVALID_EMERGENCY_CONTACT":
                displayMessage = "All emergency contact fields (name, relationship, phone) are required if any are provided.";
                break;
              case "INVALID_EMERGENCY_PHONE":
                displayMessage = "Emergency contact phone must be a valid 10-digit number.";
                break;
            }
          }
          
          // Show the error toast with the proper message
          showErrorToast(displayMessage);
          throw error; // Re-throw to maintain the error flow
        }
      } catch (error) {
        console.error("Caught error in handleStep1Save:", error);
      
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, patient, step2Data, queryClient]
  );

  const handleStep2Previous = useCallback((data) => {
    setStep2Data(data);
    setStep(1);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setStep(1);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-indigo-700 font-medium">Loading patient information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-600 rounded-xl border border-red-200 flex flex-col items-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-lg font-medium">{error.message || "Failed to load patient data."}</p>
      </div>
    );
  }

  const isDataLoaded = step1Data && step2Data;

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="mx-auto">
        <Card className="rounded-3xl overflow-hidden border-0 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-8 px-6">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                    <UserCircle2Icon className="h-7 w-7 text-white" />
                  </div>
                  {patient ? `${patient.fullName}'s Profile` : "Loading Patient Profile..."}
                </CardTitle>
                <Button
                  onClick={() => navigate(-1)}
                  className="bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 text-white font-medium transition-all duration-200"
                  aria-label="Go back"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
              </div>
              <div className="flex flex-wrap space-x-1 bg-white/10 rounded-full p-1 backdrop-blur-sm">
                {[
                  { id: "personal", label: "Personal Details", icon: <User2 className="h-4 w-4 mr-2" /> },
                  { id: "medical", label: "Medical Records", icon: <FileText className="h-4 w-4 mr-2" /> },
                  { id: "tests", label: "Test Records", icon: <ClipboardCheck className="h-4 w-4 mr-2" /> },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setStep(1);
                      setIsEditing(false);
                    }}
                    className={`flex-1 rounded-full py-2 text-sm font-medium capitalize ${
                      activeTab === tab.id ? "bg-white text-indigo-700" : "text-white hover:bg-white/20"
                    } transition-all duration-200`}
                    aria-label={`Switch to ${tab.label}`}
                  >
                    <div className="flex items-center justify-center">
                      {tab.icon}
                      {tab.label}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          {activeTab === "personal" && (
            <CardContent className="p-8 bg-white">
              {patient ? (
                <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User2 className="h-6 w-6 text-indigo-700" />
                      </div>
                      Patient Personal Details
                    </h2>
                    <div className="bg-blue-100 px-4 py-2 rounded-lg">
                      <span className="text-blue-900 font-medium">ID: {patient.patientId}</span>
                    </div>
                    <div className="bg-blue-100 px-4 py-2 rounded-lg">
                      <span className="text-blue-900 font-medium">Last Diagnosed: {patient.diagnosisDate || "N/A"}</span>
                    </div>
                  </div>
                  {!isEditing ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User2 className="h-4 w-4 text-blue-700" />
                            </div>
                            <span className="text-blue-900 font-semibold">Full Name</span>
                          </div>
                          <p className="ml-10 text-gray-700">{patient.fullName || "N/A"}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <IdCardIcon className="h-4 w-4 text-blue-700" />
                            </div>
                            <span className="text-blue-900 font-semibold">NIC Number</span>
                          </div>
                          <p className="ml-10 text-gray-700">{patient.nic || "N/A"}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <CalendarIcon className="h-4 w-4 text-blue-700" />
                            </div>
                            <span className="text-blue-900 font-semibold">Date of Birth</span>
                          </div>
                          <p className="ml-10 text-gray-700">
                            {patient.birthDate ? patient.birthDate.split("T")[0] : "N/A"}
                            <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                              Age: {age || 0}
                            </span>
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Circle className="h-4 w-4 text-blue-700" />
                            </div>
                            <span className="text-blue-900 font-semibold">Gender</span>
                          </div>
                          <p className="ml-10 text-gray-700">{patient.gender || "N/A"}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Smartphone className="h-4 w-4 text-blue-700" />
                            </div>
                            <span className="text-blue-900 font-semibold">Phone Number</span>
                          </div>
                          <p className="ml-10 text-gray-700">{patient.contactNumber || "N/A"}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Mail className="h-4 w-4 text-blue-700" />
                            </div>
                            <span className="text-blue-900 font-semibold">Email Address</span>
                          </div>
                          <p className="ml-10 text-gray-700">{patient.email || "N/A"}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl md:col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Home className="h-4 w-4 text-blue-700" />
                            </div>
                            <span className="text-blue-900 font-semibold">Full Address</span>
                          </div>
                          <p className="ml-10 text-gray-700">{patient.address || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={() => setIsEditing(true)}
                          disabled={!isDataLoaded}
                          className="h-12 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          aria-label="Edit patient profile"
                        >
                          {isDataLoaded ? (
                            <>
                              <Pencil className="mr-2 h-5 w-5" /> Edit Profile
                            </>
                          ) : (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
                            </>
                          )}
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
                          patient={patient}
                          onPrevious={handleStep2Previous}
                          onSave={handleSave}
                          onCancel={handleCancel}
                          isSubmitting={isSubmitting}
                          normalizeData={normalizeData}
                        />
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="p-8 bg-red-50 text-red-600 rounded-xl border border-red-200 flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                  <p className="text-lg font-medium">No patient data available.</p>
                </div>
              )}
            </CardContent>
          )}

          {activeTab === "medical" && (
            <CardContent className="p-8 bg-white">
              {patient ? (
                <MedicalHistory patientId={patient.patientId} />
              ) : (
                <div className="p-8 bg-red-50 text-red-600 rounded-xl border border-red-200 flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                  <p className="text-lg font-medium">No patient data available.</p>
                </div>
              )}
            </CardContent>
          )}

          {activeTab === "tests" && (
            <CardContent className="p-8 bg-white">
              {patient ? (
                <>
                  {/* <div className="bg-blue-50 p-4 rounded-xl mb-6 flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ClipboardCheck className="h-6 w-6 text-indigo-700" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-blue-900">Test Records</h2>
                      <p className="text-sm text-blue-700">Manage test records for {patient.fullName}</p>
                    </div>
                  </div> */}
                  <TestRecords patientId={patient.patientId} />
                </>
              ) : (
                <div className="p-8 bg-red-50 text-red-600 rounded-xl border border-red-200 flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                  <p className="text-lg font-medium">No patient data available.</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

ViewPatient.propTypes = {

};

export default ViewPatient;