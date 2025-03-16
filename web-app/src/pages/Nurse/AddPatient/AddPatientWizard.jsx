// import { useState } from "react";
// import AddPatientStep1 from "./AddPatientStep1";
// import AddPatientStep2 from "./AddPatientStep2";
// import { api } from "../../../services/api.service";
// import { toast } from "react-hot-toast";

// export default function AddPatientWizard() {
//   const [step, setStep] = useState(1);
//   const [step1Data, setStep1Data] = useState(null);
//   const [step2Data, setStep2Data] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formErrors, setFormErrors] = useState({});
//   const [resetStep1Form, setResetStep1Form] = useState(null);
//   const [resetStep2Form, setResetStep2Form] = useState(null);

//   const handleStep1Next = (data) => {
//     setStep1Data(data);
//     setStep(2);
//   };

//   const handleStep1Submit = async (data) => {
//     setIsSubmitting(true);
//     setFormErrors({});
//     try {
//       const formattedData = {
//         ...data,
//         ...step2Data,
//         height: step2Data?.height ? Number(step2Data.height) : undefined,
//         weight: step2Data?.weight ? Number(step2Data.weight) : undefined,
//         allergies: step2Data?.allergies?.length > 0 ? step2Data.allergies : undefined,
//         emergencyContact: step2Data?.emergencyContact?.name ? step2Data.emergencyContact : undefined,
//       };

//       const response = await api.post("/patients/add", formattedData);
//       await toast.promise(Promise.resolve(response), {
//         loading: "Saving patient...",
//         success: "Patient registered successfully!",
//         error: (error) => handleError(error),
//       });

//       // Only reset on success
//       resetForm();
//       return response; // Return the response to indicate success
//     } catch (error) {
//       if (error.response) {
//         const { errorCode } = error.response.data;
//         if (errorCode === "DUPLICATE_NIC") {
//           setFormErrors({ nic: "A patient with this NIC already exists." });
//         } else if (errorCode === "DUPLICATE_EMAIL") {
//           setFormErrors({ email: "A patient with this email already exists." });
//         } else {
//           setFormErrors({ general: "An unexpected error occurred." });
//         }
//       } else {
//         setFormErrors({ general: "No response from the server. Please try again later." });
//       }
//       toast.error(formErrors.general || handleError(error)); // Show toast for errors
//       throw error; // Re-throw to indicate failure to the caller
//     } finally {
//       setIsSubmitting(false); // Ensure isSubmitting is reset in all cases
//     }
//   };

//   const handleStep2Previous = (data) => {
//     setStep2Data(data);
//     setStep(1);
//   };

//   const handleFinalSubmit = async (data) => {
//     setIsSubmitting(true);
//     setFormErrors({});
//     try {
//       const formattedData = {
//         ...step1Data,
//         ...data,
//         height: data.height ? Number(data.height) : undefined,
//         weight: data.weight ? Number(data.weight) : undefined,
//         allergies: data.allergies?.length > 0 ? data.allergies : undefined,
//         emergencyContact: data.emergencyContact?.name ? data.emergencyContact : undefined,
//       };

//       const response = await api.post("/patients/add", formattedData);
//       await toast.promise(Promise.resolve(response), {
//         loading: "Saving patient...",
//         success: "Patient registered successfully!",
//         error: (error) => handleError(error),
//       });

//       // Only reset on success
//       resetForm();
//       return response; // Return the response to indicate success
//     } catch (error) {
//       if (error.response) {
//         const { errorCode } = error.response.data;
//         if (errorCode === "DUPLICATE_NIC") {
//           setFormErrors({ nic: "A patient with this NIC already exists." });
//         } else if (errorCode === "DUPLICATE_EMAIL") {
//           setFormErrors({ email: "A patient with this email already exists." });
//         } else {
//           setFormErrors({ general: "An unexpected error occurred." });
//         }
//       } else {
//         setFormErrors({ general: "No response from the server. Please try again later." });
//       }
//       toast.error(formErrors.general || handleError(error)); // Show toast for errors
//       throw error; // Re-throw to indicate failure to the caller
//     } finally {
//       setIsSubmitting(false); // Ensure isSubmitting is reset in all cases
//     }
//   };

//   const resetForm = () => {
//     setStep(1);
//     setStep1Data(null);
//     setStep2Data(null);
//     setFormErrors({});
//     if (resetStep1Form) resetStep1Form(); // Trigger Step 1 reset
//     if (resetStep2Form) resetStep2Form(); // Trigger Step 2 reset
//   };

//   const handleError = (error) => {
//     if (error.response) {
//       const { errorCode, message } = error.response.data;
//       if (errorCode === "MISSING_FIELDS") {
//         return "Please fill in all required fields.";
//       } else if (errorCode === "DUPLICATE_NIC") {
//         return "A patient with this NIC already exists.";
//       } else if (errorCode === "DUPLICATE_EMAIL") {
//         return "A patient with this email already exists.";
//       } else {
//         return `Error: ${message}`;
//       }
//     } else if (error.request) {
//       return "No response from the server. Please try again later.";
//     } else {
//       return "An unexpected error occurred.";
//     }
//   };

//   return (
//     <>
//       {step === 1 && (
//         <AddPatientStep1
//           onNext={handleStep1Next}
//           onSubmit={handleStep1Submit}
//           initialData={step1Data}
//           step2Data={step2Data}
//           isSubmitting={isSubmitting}
//           formErrors={formErrors}
//           setResetForm={(resetFn) => setResetStep1Form(() => resetFn)}
//         />
//       )}
//       {step === 2 && (
//         <AddPatientStep2
//           step1Data={step1Data}
//           initialData={step2Data}
//           onPrevious={handleStep2Previous}
//           onSubmit={handleFinalSubmit}
//           isSubmitting={isSubmitting}
//           formErrors={formErrors}
//           setResetForm={(resetFn) => setResetStep2Form(() => resetFn)}
//         />
//       )}
//     </>
//   );
// }

import { useState, useCallback } from "react";
import AddPatientStep1 from "./AddPatientStep1";
import AddPatientStep2 from "./AddPatientStep2";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";

export default function AddPatientWizard() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [resetStep1Form, setResetStep1Form] = useState(null);
  const [resetStep2Form, setResetStep2Form] = useState(null);

  const handleError = useCallback((error) => {
    if (error.response) {
      const { errorCode, message } = error.response.data;
      if (errorCode === "MISSING_FIELDS") return "Please fill in all required fields.";
      if (errorCode === "DUPLICATE_NIC") return "A patient with this NIC already exists.";
      if (errorCode === "DUPLICATE_EMAIL") return "A patient with this email already exists.";
      return `Error: ${message}`;
    }
    if (error.request) return "No response from the server. Please try again later.";
    return "An unexpected error occurred.";
  }, []);

  const resetForm = useCallback(() => {
    setStep(1);
    setStep1Data(null);
    setStep2Data(null);
    setFormErrors({});
    if (resetStep1Form) resetStep1Form();
    if (resetStep2Form) resetStep2Form();
  }, [resetStep1Form, resetStep2Form]);

  const handleStep1Next = useCallback((data) => {
    setStep1Data(data);
    setStep(2);
  }, []);

  const handleStep1Submit = async (data) => {
    setIsSubmitting(true);
    setFormErrors({});
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
      await toast.promise(Promise.resolve(response), {
        loading: "Saving patient...",
        success: "Patient registered successfully!",
        error: (error) => handleError(error),
      });

      resetForm();
      return response;
    } catch (error) {
      if (error.response) {
        const { errorCode } = error.response.data;
        if (error.response?.status === 400 && error.response?.data?.errorCode === "VALIDATION_ERROR") {
          const validationErrors = error.response.data.errors;
          validationErrors.forEach((err) => {
            form.setError(err.path, { type: "manual", message: err.message });
          });
          toast.error("Please correct the validation errors.");
        }
        if (errorCode === "DUPLICATE_NIC") {
          setFormErrors({ nic: "A patient with this NIC already exists." });
        } else if (errorCode === "DUPLICATE_EMAIL") {
          setFormErrors({ email: "A patient with this email already exists." });
        } else {
          setFormErrors({ general: "An unexpected error occurred." });
        }
      } else {
        setFormErrors({ general: "No response from the server. Please try again later." });
      }
      toast.error(formErrors.general || handleError(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Previous = useCallback((data) => {
    setStep2Data(data);
    setStep(1);
  }, []);

  const handleFinalSubmit = async (data) => {
    setIsSubmitting(true);
    setFormErrors({});
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
      await toast.promise(Promise.resolve(response), {
        loading: "Saving patient...",
        success: "Patient registered successfully!",
        error: (error) => handleError(error),
      });

      resetForm();
      return response;
    } catch (error) {
      if (error.response) {
        const { errorCode } = error.response.data;
        if (errorCode === "DUPLICATE_NIC") {
          setFormErrors({ nic: "A patient with this NIC already exists." });
        } else if (errorCode === "DUPLICATE_EMAIL") {
          setFormErrors({ email: "A patient with this email already exists." });
        } else {
          setFormErrors({ general: "An unexpected error occurred." });
        }
      } else {
        setFormErrors({ general: "No response from the server. Please try again later." });
      }
      toast.error(formErrors.general || handleError(error));
      throw error;
    } finally {
      setIsSubmitting(false);
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
          isSubmitting={isSubmitting}
          formErrors={formErrors}
          setResetForm={(resetFn) => setResetStep1Form(() => resetFn)}
        />
      )}
      {step === 2 && (
        <AddPatientStep2
          step1Data={step1Data}
          initialData={step2Data}
          onPrevious={handleStep2Previous}
          onSubmit={handleFinalSubmit}
          isSubmitting={isSubmitting}
          formErrors={formErrors}
          setResetForm={(resetFn) => setResetStep2Form(() => resetFn)}
        />
      )}
    </>
  );
}

AddPatientWizard.propTypes = {
  // Add props if any are passed in the future
};