import React, { useState } from "react";
import Diagnose from "./Diagnose";
import toast from "react-hot-toast";
import axios from "axios";

const Glaucoma = () => {
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
      formData.append("diseaseType", "glaucoma");
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
      setPrediction({
        disease: "Glaucoma",
        type: diagnosis,
        confidence: confidenceScores,
      });
      // if (confidenceScores && confidenceScores.length > 0) {
      //   const highestConfidence = Math.max(...confidenceScores);
      //   setPrediction({
      //     disease: "Glaucoma",
      //     type: diagnosis,
      //     confidence: highestConfidence,
      //   });
      // } else {
      //   toast.error("No confidence scores returned");
      // }
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
        disease="Glaucoma"
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

export default Glaucoma;
