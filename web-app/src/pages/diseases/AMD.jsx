import React, { useState } from "react";
import Diagnose from "./Diagnose";
import { api } from "@/services/api.service";
import toast from "react-hot-toast";

const AMD = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState({
    disease: null,
    type: null,
    confidence: null,
  });

  const handleSubmission = async image => {
    setIsSubmitting(true); // Start loading

    try {
      console.log("Uploading image...");
      console.log("image:", image);

      // Create a FormData object
      const formData = new FormData();
      formData.append("file", image); // Append the image to the form data

      // Send the FormData to the backend
      const response = await api.post("/api/predict/amd", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure content-type is set correctly
        },
      });

      console.log("added:", response.data);
      setPrediction({
        disease: response.data?.disease,
        type: response.data?.label,
        confidence: response?.data.confidence,
      }); // Set the prediction data
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Error uploading image:", error);
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  return (
    <div >
      <Diagnose
        disease={"AMD"}
        handleSubmission={handleSubmission}
        isSubmitting={isSubmitting}
        prediction={prediction}
      />
    </div>
  );
};

export default AMD;
