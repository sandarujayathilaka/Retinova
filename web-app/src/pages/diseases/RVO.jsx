import React, { useState } from "react";
import Diagnose from "./Diagnose";
import { api } from "@/services/api.service";
import toast from "react-hot-toast";

const RVO = () => {
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
      const response = await api.post("api/predict/rvo", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure content-type is set correctly
        },
      });

      console.log("added:", response.data);

      const label = response.data.label;
      const confidenceArray = response.data.confidence;

      // Map the label to the index in the confidence array
      const classLabels = ["CRVO", "BRVO", "Healthy"];
      const predictedIndex = classLabels.indexOf(label);

      // Ensure the index is valid
      const confidence = predictedIndex !== -1 ? confidenceArray[predictedIndex] * 100 : 0;


      setPrediction({
        disease: "Retinal Vein Occlusion",
        type: label,
        confidence,
      }); // Set the prediction data
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
        disease={"Retinal Vein Occlusion"}
        handleSubmission={handleSubmission}
        isSubmitting={isSubmitting}
        prediction={prediction}
      />
    </div>
  );
};

export default RVO;
