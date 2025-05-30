import { api } from "@/services/api.service";
import { Spin } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";
import MultiDiagnose from "../../../components/multiDiagnose/MultiDiagnose";

const MultiGlaucoma = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [missingPatientIds, setMissingPatientIds] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleSubmission = async (images, confirmed = false) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    setMissingPatientIds([]);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 95) progress = 95;
      setProcessingProgress(Math.min(Math.round(progress), 95));
    }, 300);

    try {
      const formData = new FormData();
      images.forEach(image => formData.append("files", image));
      formData.append("patientId", 12345); // Adjust if this needs to be dynamic
      formData.append("diseaseType", "glaucoma");

      const response = await api.post("predictions/multiImagePrediction", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (response.data.missingPatientIds?.length > 0 && !confirmed) {
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
          confidence: item.confidenceScores, // { advanced, early, normal }
        },
        patientDetails: item.patientDetails,
      }));

      setPredictions(formattedPredictions);
      setPatientData(response.data.results[0]?.patientDetails);
      toast.success(`Successfully analyzed ${formattedPredictions.length} images!`);
    } catch (error) {
      clearInterval(progressInterval);
      setProcessingProgress(0);
      setMissingPatientIds(error.response?.data?.missingPatientIds || []);
      if (error.response?.data?.missingPatientIds?.length > 0) {
        setShowConfirmation(true);
      } else {
        toast.error(error.response?.data?.message || "Error processing images");
      }
      console.error("Error uploading images:", error.response?.data);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
        setProcessingProgress(0);
      }, 500);
    }
  };

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
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            // Preserve the original filename structure for backend regex matching
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
    if (predictions.length === 0) {
      toast.error("No predictions to save");
      return;
    }

    setIsSaving(true);
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 90) progress = 90;
      setProcessingProgress(Math.min(Math.round(progress), 90));
    }, 200);

    try {
      const formData = new FormData();

      // Transform confidenceScores into an array of numbers
      const diagnosisData = predictions.map(pred => ({
        patientId: pred.patientId,
        diagnosis: pred.prediction.label,
        confidenceScores: [
          pred.prediction.confidence.advanced || 0,
          pred.prediction.confidence.early || 0,
          pred.prediction.confidence.normal || 0,
        ],
      }));

      console.log("Sending diagnosisData:", JSON.stringify(diagnosisData)); // Debug log

      formData.append("diagnosisData", JSON.stringify(diagnosisData));
      formData.append("category", "Glaucoma");

      // Resize images and ensure filenames match the prediction data
      const resizedImages = await Promise.all(images.map(image => resizeImage(image)));
      resizedImages.forEach(image => {
        const matchingPrediction = predictions.find(p => p.filename === image.name);
        if (matchingPrediction) {
          formData.append("files", image);
        }
      });

      const response = await api.post("predictions/multiDataSave", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);
      toast.success(`Successfully saved ${predictions.length} diagnosis records!`);
      setIsSaved(true);
    } catch (error) {
      clearInterval(progressInterval);
      setProcessingProgress(0);
      toast.error(error.response?.data?.error || "Failed to save diagnosis records");
      console.error("Error saving diagnosis records:", error.response?.data);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
        setProcessingProgress(0);
      }, 500);
    }
  };

  const handleReset = () => {
    setPredictions([]);
    setPatientData(null);
    setMissingPatientIds([]);
    setIsSaved(false);
    setProcessingProgress(0);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Spin spinning={isSaving} tip={`Saving... ${processingProgress}%`}>
        <MultiDiagnose
          disease="Glaucoma"
          handleSubmission={handleSubmission}
          isSubmitting={isSubmitting}
          predictions={predictions}
          patientData={patientData}
          missingPatientIds={missingPatientIds}
          showConfirmation={showConfirmation}
          setShowConfirmation={setShowConfirmation}
          handleSaveAll={handleSaveAll}
          isSaving={isSaving}
          isSaved={isSaved}
          handleReset={handleReset}
          processingProgress={processingProgress}
        />
      </Spin>
    </div>
  );
};

export default MultiGlaucoma;
