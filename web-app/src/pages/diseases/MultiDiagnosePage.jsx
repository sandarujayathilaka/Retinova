import React, { useState } from "react";
import MultiDiagnose from "./MultiDiagnose";
import toast from "react-hot-toast";
import axios from "axios";

const MultiDiagnosePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [missingPatientIds, setMissingPatientIds] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmission = async (images, confirmed = false) => {
    setIsSubmitting(true);
    setMissingPatientIds([]);

    try {
      const formData = new FormData();
      images.forEach(image => {
        formData.append(`files`, image);
      });
      formData.append("patientId", 12345);

      const response = await axios.post("http://localhost:4000/api/patients/multisave", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Backend Response multi:", response);

      if (
        response.data.missingPatientIds &&
        response.data.missingPatientIds.length > 0 &&
        !confirmed
      ) {
        setMissingPatientIds(response.data.missingPatientIds);
        setShowConfirmation(true);
        setIsSubmitting(false);
        return;
      }

      const formattedPredictions = response.data.results.map(item => ({
        filename: item.filename,
        patientId: item.patientId,
        prediction: {
          label: item.diagnosis,
          confidence: item.confidenceScores,
        },
        patientDetails: item.patientDetails,
      }));

      setPredictions(formattedPredictions);
      setPatientData(response.data.results[0]?.patientDetails);
      toast.success("Analysis complete!");
    } catch (error) {
      const missingIds = error.response?.data?.missingPatientIds || [];
      setMissingPatientIds(missingIds);
      if (missingIds.length > 0) {
        setShowConfirmation(true);
      } else {
        toast.error("Error uploading images");
      }
      console.error("Error uploading images:", error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmation = (confirmed, images) => {
    setShowConfirmation(false);
    if (confirmed) {
      const validImages = images.filter(
        image => !missingPatientIds.includes(image.name.split(".")[0]),
      );
      if (validImages.length > 0) {
        handleSubmission(validImages, true);
      } else {
        toast.error("No valid images to submit.");
      }
    }
  };

  // Function to resize image while maintaining quality
  const resizeImage = (file, maxSize = 1024) => {
    return new Promise(resolve => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = e => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = height * (maxSize / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = width * (maxSize / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });
            resolve(resizedFile);
          },
          file.type === "image/png" ? "image/png" : "image/jpeg",
          file.type === "image/png" ? undefined : 0.9,
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSaveAll = async images => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      // Prepare diagnosis data array and stringify it
      const diagnosisData = predictions.map(pred => ({
        patientId: pred.patientId,
        diagnosis: pred.prediction.label,
        confidenceScores: pred.prediction.confidence,
      }));

      // Append diagnosisData as a single JSON string
      formData.append("diagnosisData", JSON.stringify(diagnosisData));
      formData.append("category", "DR");

      // Resize and append images in the same order
      const resizedImages = await Promise.all(images.map(image => resizeImage(image)));
      resizedImages.forEach(image => {
        formData.append("files", image);
      });

      const response = await axios.post(
        "http://localhost:4000/api/patients/multiDataSave",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Save All Response:", response.data);
      toast.success("All diagnosis records saved successfully!");
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving diagnosis records:", error.response?.data);
      toast.error(error.response?.data?.error || "Failed to save diagnosis records");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <MultiDiagnose
        disease={"Diabetic Retinopathy"}
        handleSubmission={handleSubmission}
        isSubmitting={isSubmitting}
        predictions={predictions}
        patientData={patientData}
        missingPatientIds={missingPatientIds}
        showConfirmation={showConfirmation}
        handleConfirmation={handleConfirmation}
        handleSaveAll={handleSaveAll}
        isSaving={isSaving}
        isSaved={isSaved}
      />
    </div>
  );
};

export default MultiDiagnosePage;
