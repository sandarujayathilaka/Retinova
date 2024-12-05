import React, { useState } from "react";
import Diagnose from "./Diagnose";
import { api } from "@/services/api.service";
import toast from "react-hot-toast";

const DR = () => {
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
      const response = await api.post("/api/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure content-type is set correctly
        },
      });

      console.log("Response data:", response.data);

      // Extract confidence array and find the highest value
      const confidenceArray = response?.data?.confidence || [];
      console.log("Confidence array:", confidenceArray);

      if (confidenceArray.length > 0) {
        const highestConfidence = Math.max(...confidenceArray); // Find the highest confidence value
        console.log("Highest confidence value:", highestConfidence);

        setPrediction({
          disease: "Diabetic Retinopathy",
          type: response.data.label,
          confidence: highestConfidence, // Set the highest confidence value
        });
      } else {
        console.warn("Confidence array is empty or invalid");
        toast.error("Invalid response: No confidence values found");
      }
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Error uploading image:", error);
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  return (
    <div>
      <Diagnose
        disease={"Diabetic Retinopathy"}
        handleSubmission={handleSubmission}
        isSubmitting={isSubmitting}
        prediction={prediction}
      />
    </div>
  );
};

export default DR;
