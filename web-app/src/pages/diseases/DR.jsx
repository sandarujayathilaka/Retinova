import React, { useState } from "react";
import Diagnose from "./Diagnose";
import toast from "react-hot-toast";
import axios from "axios";
import { api } from "@/services/api.service";

const DR = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      formData.append("diseaseType", "dr");
      const response = await api.post("patients/predict", formData, {
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

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("diagnosis", prediction.type);
      formData.append("confidenceScores", JSON.stringify([prediction.confidence]));
      formData.append("category", "DR");

      // Format recommend according to the backend schema
      const recommend = {
        medicine: formValues.medicine || "",
        tests: formValues.tests.map(test => ({
          testName: test.testName,
          status: "Pending",
          attachmentURL: "",
        })),
        note: formValues.note || "",
      };
      formData.append("recommend", JSON.stringify(recommend));

      const response = await api.post(
        "patients/onedatasave",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
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
      setIsSaving(false);
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
        isSaving={isSaving}
        prediction={prediction}
        patientData={patientData}
        errorMessage={errorMessage}
        resetState={resetState}
      />
    </div>
  );
};

export default DR;
