import { useState } from "react";
import AddPatientStep1 from "./AddPatientStep1";
import AddPatientStep2 from "./AddPatientStep2";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";

export default function AddPatientWizard() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);

  const handleStep1Next = (data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep1Submit = async (data) => {
    try {
      const formattedData = {
        ...data,
        ...step2Data,
        height: step2Data?.height ? Number(step2Data.height) : undefined,
        weight: step2Data?.weight ? Number(step2Data.weight) : undefined,
        allergies: step2Data?.allergies?.length > 0 ? step2Data.allergies : undefined,
        emergencyContact: step2Data?.emergencyContact?.name ? step2Data.emergencyContact : undefined,
      };
      const response = await api.post("/patients/add", formattedData);
      if (response) {
        toast.success("Patient registered successfully");
        resetForm();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleStep2Previous = (data) => {
    setStep2Data(data);
    setStep(1);
  };

  const handleFinalSubmit = async (data) => {
    try {
      const formattedData = {
        ...step1Data,
        ...data,
        height: data.height ? Number(data.height) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        allergies: data.allergies?.length > 0 ? data.allergies : undefined,
        emergencyContact: data.emergencyContact?.name ? data.emergencyContact : undefined,
      };
      const response = await api.post("/patients/add", formattedData);
      if (response) {
        toast.success("Patient registered successfully");
        resetForm();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const resetForm = () => {
    setStep(1);
    setStep1Data(null);
    setStep2Data(null);
  };

  const handleError = (error) => {
    if (error.response) {
      const { errorCode, message } = error.response.data;
      if (errorCode === "MISSING_FIELDS") {
        toast.error("Please fill in all required fields.");
      } else if (errorCode === "DUPLICATE_NIC") {
        toast.error("A patient with this NIC already exists.");
      } else if (errorCode === "DUPLICATE_EMAIL") {
        toast.error("A patient with this email already exists.");
      } else {
        toast.error(`Error: ${message}`);
      }
    } else if (error.request) {
      toast.error("No response from the server. Please try again later.");
    } else {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <>
      {step === 1 && (
        <AddPatientStep1
          onNext={handleStep1Next}
          onSubmit={handleStep1Submit}
          initialData={step1Data}
          step2Data={step2Data}
        />
      )}
      {step === 2 && (
        <AddPatientStep2
          step1Data={step1Data}
          initialData={step2Data}
          onPrevious={handleStep2Previous}
          onSubmit={handleFinalSubmit}
        />
      )}
    </>
  );
}