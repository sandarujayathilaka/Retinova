import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AddPatientStep1 from "./AddPatientStep1";
import AddPatientStep2 from "./AddPatientStep2";
import { api } from "../../../services/api.service";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";
import { showErrorToast, showSuccessToast, showNoChangesToast } from "../../utils/toastUtils"; 

export default function AddPatientWizard() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [resetStep1Form, setResetStep1Form] = useState(null);
  const [resetStep2Form, setResetStep2Form] = useState(null);
  const [shouldRender, setShouldRender] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // This is the most aggressive solution - forcibly check the URL on every render
  // and hide this component if we're not on add-patient
  useEffect(() => {
    const checkPath = () => {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('add-patient')) {
        setShouldRender(false);
        
        // EMERGENCY FIX: Try to force the application to show the correct components
        // by directly manipulating the DOM after a short delay
        setTimeout(() => {
          // Try to find and remove any hidden add-patient components
          const possibleAddPatientElements = document.querySelectorAll('.bg-white.min-h-screen.p-10, .bg-white.min-h-screen.p-6');
          possibleAddPatientElements.forEach(el => {
            // Only remove elements that appear to be the add patient form
            if (el.textContent.includes('Register New Patient') || 
                el.innerHTML.includes('Register New Patient')) {
              el.style.display = 'none';
            }
          });
          
          // Force a window resize event to trigger any responsive layouts to update
          window.dispatchEvent(new Event('resize'));
        }, 50);
      } else {
        setShouldRender(true);
      }
    };
    
    // Check immediately
    checkPath();
    
    // Also set up a periodic check while we're mounted
    const intervalId = setInterval(checkPath, 100);
    
    // Listen for navigation events
    const handleNavigation = () => {
      checkPath();
    };
    
    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [location]);

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
        await toast.promise(response, {
          loading: "Saving patient...",
          success: (response) => {
            showSuccessToast("Patient registered successfully!"); // Use utility
            return null; // Prevent default success toast
          },
          error: (error) => {
            const errorMessage = handleError(error);
            showErrorToast(errorMessage); // Use utility
            return null; // Prevent default error toast
          },
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
            showErrorToast("Please correct the validation errors.");
          }
          if (errorCode === "DUPLICATE_NIC") {
            setFormErrors({ nic: "A patient with this NIC already exists." });
            showErrorToast("A patient with this NIC already exists.");
          } else if (errorCode === "DUPLICATE_EMAIL") {
            setFormErrors({ email: "A patient with this email already exists." });
            showErrorToast("A patient with this email already exists.");
          } else {
            setFormErrors({ general: "An unexpected error occurred." });
            showErrorToast("An unexpected error occurred.");
          }
        } else {
          setFormErrors({ general: "No response from the server. Please try again later." });
          showErrorToast("No response from the server. Please try again later.");
        }
        
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
      await toast.promise(response, {
        loading: "Saving patient...",
        success: (response) => {
          showSuccessToast("Patient registered successfully!"); // Use utility
          return null; // Prevent default success toast
        },
        error: (error) => {
          const errorMessage = handleError(error);
          showErrorToast(errorMessage); // Use utility
          return null; // Prevent default error toast
        },
      });

      resetForm();
      return response;
    } catch (error) {
      if (error.response) {
        const { errorCode } = error.response.data;
        if (errorCode === "DUPLICATE_NIC") {
          setFormErrors({ nic: "A patient with this NIC already exists." });
          showErrorToast("A patient with this NIC already exists.");
        } else if (errorCode === "DUPLICATE_EMAIL") {
          setFormErrors({ email: "A patient with this email already exists." });
          showErrorToast("A patient with this email already exists.");
        } else if (error.response?.status === 400 && errorCode === "VALIDATION_ERROR") {
          const validationErrors = errors;
          validationErrors.forEach((err) => {
            setFormErrors((prev) => ({ ...prev, [err.path]: err.message }));
          });
          showErrorToast("Please correct the validation errors.");
        } else {
          setFormErrors({ general: "An unexpected error occurred." });
          showErrorToast("An unexpected error occurred.");
        }
      } else {
        setFormErrors({ general: "No response from the server. Please try again later." });
        showErrorToast("No response from the server. Please try again later.");
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we're not supposed to render, return null
  if (!shouldRender) {
    return null;
  }

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