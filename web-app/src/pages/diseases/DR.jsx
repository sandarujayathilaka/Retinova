import React, { useState } from "react";
import Diagnose from "./Diagnose";
import toast from "react-hot-toast";
import axios from "axios";

const DR = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Separate state for saving
  const [prediction, setPrediction] = useState({
    disease: null,
    type: null,
    confidence: null,
  });
  const [patientData, setPatientData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Handle initial image submission for prediction
  const handleSubmission = async image => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setPrediction({ disease: null, type: null, confidence: null });
    setPatientData(null);
    setImageFile(image);

    try {
      console.log("Uploading image for prediction:", image.name);

      const formData = new FormData();
      formData.append("file", image);

      const response = await axios.post("http://localhost:4000/api/patients/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Prediction response:", response.data);

      const { diagnosis, confidenceScores, patientData } = response.data;

      if (!patientData) {
        throw new Error("Patient data not returned from backend");
      }

      setPatientData(patientData);

      if (confidenceScores && confidenceScores.length > 0) {
        const highestConfidence = Math.max(...confidenceScores);
        setPrediction({
          disease: "Diabetic Retinopathy",
          type: diagnosis,
          confidence: highestConfidence,
        });
      } else {
        toast.error("No confidence scores returned");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMsg = error.response?.data?.error || "Error uploading image. Please try again.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving prescription with image and form data
  const handleSavePrescription = async formValues => {
    if (!imageFile || !prediction.type || !patientData?.patientId) {
      toast.error("Missing required data to save prescription.");
      return;
    }

    setIsSaving(true); // Start saving state

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("diagnosis", prediction.type);
      formData.append("confidenceScores", JSON.stringify([prediction.confidence])); // Array as string
      formData.append("category", JSON.stringify(["DR"])); // Fixed as ["DR"]
      formData.append(
        "recommend",
        JSON.stringify({
          medicine: formValues.medicine ? formValues.medicine.split(",").map(m => m.trim()) : [],
          tests: formValues.tests ? formValues.tests.split(",").map(t => t.trim()) : [],
          note: formValues.note || "",
        }),
      );

      const response = await axios.post(
        "http://localhost:4000/api/patients/onedatasave",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      console.log("Save response:", response.data);
      toast.success("Prescription saved successfully!");
      resetState();
    } catch (error) {
      console.error("Error saving prescription:", error);
      const errorMsg = error.response?.data?.error || "Failed to save prescription.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false); // End saving state
    }
  };

  // Reset all states
  const resetState = () => {
    setPrediction({ disease: null, type: null, confidence: null });
    setPatientData(null);
    setErrorMessage(null);
    setIsSubmitting(false);
    setIsSaving(false);
    setImageFile(null);
  };

  return (
    <div>
      <Diagnose
        disease="Diabetic Retinopathy"
        handleSubmission={handleSubmission}
        handleSavePrescription={handleSavePrescription}
        isSubmitting={isSubmitting}
        isSaving={isSaving} // Pass saving state
        prediction={prediction}
        patientData={patientData}
        errorMessage={errorMessage}
        resetState={resetState}
      />
    </div>
  );
};

export default DR;
