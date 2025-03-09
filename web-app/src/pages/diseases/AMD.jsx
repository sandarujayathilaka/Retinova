import React, { useState } from "react";
import Diagnose from "./Diagnose";
import toast from "react-hot-toast";
import axios from "axios";

const AMD = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState({
    disease: null,
    type: null,
    confidence: null,
  });
  const [patientData, setPatientData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmission = async image => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setPrediction({ disease: null, type: null, confidence: null }); // Reset prediction
    setPatientData(null); // Reset patient data

    try {
      console.log("Uploading image:", image.name);

      const formData = new FormData();
      formData.append("file", image); // Matches backend's expected field
      formData.append("diseaseType", "amd");
      const response = await axios.post("http://localhost:4000/api/patients/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response data:", response.data);

      const { diagnosis, confidenceScores, patientData } = response.data;

      if (!patientData) {
        throw new Error("Patient data not returned from backend");
      }

      setPatientData(patientData);
      // setPrediction({
      //   disease: "Age Related Macular Degeneration",
      //   type: diagnosis,
      //   confidence: confidenceScores,
      // });

        // const highestConfidence = confidenceScores;
        setPrediction({
          disease: "Age Related Macular Degeneration",
          type: diagnosis,
          confidence: confidenceScores,
        });
      
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMsg = error.response?.data?.error || "Error uploading image. Please try again.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setPrediction({ disease: null, type: null, confidence: null });
    setPatientData(null);
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  return (
    <div>
      <Diagnose
        disease="Age Related Macular Degeneration"
        handleSubmission={handleSubmission}
        isSubmitting={isSubmitting}
        prediction={prediction}
        patientData={patientData}
        errorMessage={errorMessage}
        resetState={resetState}
      />
    </div>
  );
};

export default AMD;
