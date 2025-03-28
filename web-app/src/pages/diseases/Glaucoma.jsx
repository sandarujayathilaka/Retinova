import ImageModal from "@/components/diagnose/ImageModal";
import { api } from "@/services/api.service";
import { useGetExplanations } from "@/services/diagnose.service";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Diagnose from "./Diagnose";
import { G } from "@react-pdf/renderer";

const Glaucoma = () => {
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
  const [xaiExplanations, setXaiExplanations] = useState(null);
  const [isLoadingExplanations, setIsLoadingExplanations] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Use the XAI mutation hook
  const xaiMutation = useGetExplanations();

  // Handle initial image submission for prediction
  const handleSubmission = async image => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setPrediction({ disease: null, type: null, confidence: null });
    setPatientData(null);
    setXaiExplanations(null);
    setShowExplanations(false);
    setImageFile(image);

    try {
      console.log("Uploading image for prediction:", image.name);

      const formData = new FormData();
      formData.append("file", image);
      formData.append("diseaseType", "glaucoma");
      const response = await api.post("patients/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Prediction response:", response.data);

      const { diagnosis, confidenceScores, patientData } = response.data;

      if (!patientData) {
        throw new Error("Patient data not returned from backend");
      }

      setPatientData(patientData);

      if (confidenceScores) {
        setPrediction({
          disease: "Glaucoma",
          type: diagnosis,
          confidence: confidenceScores,
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

  // Function to fetch XAI explanations on button click
  const getExplanations = async () => {
    if (!imageFile) {
      toast.error("No image available for explanation");
      return;
    }

    setIsLoadingExplanations(true);
    try {
      const result = await xaiMutation.mutateAsync(imageFile);
      setXaiExplanations(result.data);
      setShowExplanations(true);
      console.log("XAI explanations:", result.data);
    } catch (error) {
      console.error("Error fetching XAI explanations:", error);
      toast.error("Could not fetch AI explanations. Please try again.");
    } finally {
      setIsLoadingExplanations(false);
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
        formData.append("category", "Glaucoma");
  
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
    setXaiExplanations(null);
    setShowExplanations(false);
  };

  // Get confidence level text and color class
  const getConfidenceLevelInfo = () => {
    const confidence = xaiExplanations?.confidence || 0;
    if (confidence > 0.9) return { text: "High", colorClass: "text-emerald-600" };
    if (confidence > 0.7) return { text: "Medium", colorClass: "text-amber-600" };
    return { text: "Low", colorClass: "text-rose-600" };
  };

  // Get diagnosis-specific info and sign descriptions
  const getDiagnosisInfo = () => {
    switch (prediction.type) {
      case "normal":
        return {
          description:
            "The AI model has classified this fundus image as normal, suggesting no signs of glaucoma. The XAI visualizations show which areas of the retina contributed to this classification.",
          signs: [
            "Normal optic disc with healthy rim tissue",
            "Normal cup-to-disc ratio (typically less than 0.5)",
            "No visible nerve fiber layer defects",
            "Normal retinal vasculature",
          ],
        };
      case "early":
        return {
          description:
            "The AI model has classified this fundus image as showing signs of early glaucoma. The XAI visualizations highlight the areas that influenced this diagnosis.",
          signs: [
            "Slightly increased cup-to-disc ratio (0.5-0.7)",
            "Early thinning of the neuroretinal rim",
            "Possible localized nerve fiber layer defects",
            "Possible peripapillary atrophy",
          ],
          note: "Early detection is critical for preventing further progression.",
        };
      case "advanced":
        return {
          description:
            "The AI model has classified this fundus image as showing signs of advanced glaucoma. The XAI visualizations clearly show the areas that led to this diagnosis.",
          signs: [
            "Significantly increased cup-to-disc ratio (>0.7)",
            "Extensive thinning or notching of the neuroretinal rim",
            "Visible nerve fiber layer defects",
            "Possible optic disc hemorrhages",
            "Nasal shifting of vessels",
          ],
          note: "Advanced glaucoma requires immediate attention and treatment.",
        };
      default:
        return {
          description:
            "The AI model has provided a diagnosis, but the classification is not recognized.",
          signs: [],
        };
    }
  };

  // Prepare chart data from XAI explanation probabilities
  const getChartData = () => {
    if (
      !xaiExplanations ||
      !xaiExplanations.prediction ||
      !xaiExplanations.prediction.probabilities
    ) {
      return [];
    }

    return Object.entries(xaiExplanations.prediction.probabilities).map(
      ([className, probability]) => ({
        name: className.charAt(0).toUpperCase() + className.slice(1),
        probability: probability * 100,
        fill: className === xaiExplanations.prediction.class ? "#3b82f6" : "#9ca3af",
      }),
    );
  };

  return (
    <>
      <div className="font-sans bg-gray-50">
        <Diagnose
          disease="Glaucoma"
          handleSubmission={handleSubmission}
          handleSavePrescription={handleSavePrescription}
          isSubmitting={isSubmitting}
          isSaving={isSaving}
          prediction={prediction}
          patientData={patientData}
          errorMessage={errorMessage}
          resetState={resetState}
        />

        {patientData && prediction.type && !showExplanations && (
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">What is Explainable AI?</h3>
              <p className="text-gray-700">
                Explainable AI (XAI) refers to methods and techniques that make AI systems'
                decisions more understandable to humans. This application uses multiple XAI
                techniques to provide visual explanations for the AI's glaucoma diagnosis, helping
                healthcare professionals understand the reasoning behind the AI's predictions.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={getExplanations}
                  disabled={isLoadingExplanations}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 shadow-md flex items-center space-x-2"
                >
                  {isLoadingExplanations ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Generating Explainable AI Report...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Generate Explainable AI Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoadingExplanations && (
          <div className="mt-8 p-8 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-lg text-gray-700">Generating Explainable AI Report...</p>
              <p className="text-sm text-gray-500 mt-1">This may take up to few minutes</p>
            </div>
          </div>
        )}

        {showExplanations && xaiExplanations && (
          <div className="mt-8 mb-12 max-w-6xl px-4 mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-800 to-blue-600 text-white px-6 py-4 print:bg-indigo-800 print:text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Explainable AI Report: Glaucoma Analysis</h2>
                  <button
                    onClick={() => setShowExplanations(false)}
                    className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm transition-all"
                  >
                    Close Report
                  </button>
                </div>
                <p className="text-blue-100 mt-1">
                  Patient ID: {patientData?.patientId || "Unknown"}
                </p>
              </div>

              {/* Report Content */}
              <div className="p-6">
                {/* Section 1: Analysis Results */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-gray-200 mb-4">
                    Analysis Results
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Image */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">Original Image</h4>
                      <div className="bg-white border border-gray-200 p-2 rounded-lg flex justify-center shadow-sm">
                        {xaiExplanations.explanations.original ? (
                          <img
                            src={xaiExplanations.explanations.original}
                            alt="Original fundus image"
                            className="max-h-80 rounded shadow-sm cursor-pointer"
                            onClick={() => setSelectedImage(xaiExplanations.explanations.original)}
                          />
                        ) : (
                          <div className="h-64 w-full flex items-center justify-center text-gray-500">
                            Image not available
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Original fundus image used for AI analysis
                      </p>
                    </div>

                    {/* Prediction Result */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">
                        Prediction Result
                      </h4>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <div className="mb-4">
                          <p className="text-base text-gray-600">Predicted Class:</p>
                          <p className="text-xl font-bold text-gray-900">
                            {xaiExplanations.prediction?.class
                              ? xaiExplanations.prediction.class.charAt(0).toUpperCase() +
                                xaiExplanations.prediction.class.slice(1)
                              : prediction.type?.charAt(0).toUpperCase() +
                                  prediction.type?.slice(1) || "Unknown"}
                          </p>
                        </div>

                        <div className="mb-4">
                          <p className="text-base text-gray-600">Confidence:</p>
                          <div className="flex items-center">
                            <div className="flex-grow">
                              <div className="w-full bg-gray-300 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    (xaiExplanations.prediction?.confidence ||
                                      prediction.confidence) > 0.9
                                      ? "bg-emerald-500"
                                      : (xaiExplanations.prediction?.confidence ||
                                            prediction.confidence) > 0.7
                                        ? "bg-amber-500"
                                        : "bg-rose-600"
                                  }`}
                                  style={{
                                    width: `${(xaiExplanations.prediction?.confidence || prediction.confidence || 0) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-3">
                              <span
                                className={`font-semibold ${getConfidenceLevelInfo().colorClass}`}
                              >
                                {(
                                  (xaiExplanations.prediction?.confidence ||
                                    prediction.confidence ||
                                    0) * 100
                                ).toFixed(2)}
                                % ({getConfidenceLevelInfo().text})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Probability Chart */}
                        <div className="mt-6">
                          <p className="text-base text-gray-600 mb-2">Probability Distribution:</p>
                          <div className="h-60 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={getChartData()}
                                margin={{ top: 5, right: 10, left: 10, bottom: 25 }}
                                layout="vertical"
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  horizontal={true}
                                  vertical={false}
                                />
                                <XAxis
                                  type="number"
                                  label={{
                                    value: "Probability (%)",
                                    position: "bottom",
                                    offset: 0,
                                  }}
                                  domain={[0, 100]}
                                />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip
                                  formatter={value => [`${value.toFixed(2)}%`, "Probability"]}
                                />
                                <Bar
                                  dataKey="probability"
                                  fill="#4f46e5"
                                  name="Probability (%)"
                                  radius={[0, 4, 4, 0]}
                                  label={{
                                    position: "right",
                                    formatter: value => `${value.toFixed(1)}%`,
                                    fontSize: 12,
                                    fill: "#4B5563",
                                  }}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Explainable AI Visualizations */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-gray-200 mb-4">
                    Explainable AI Visualizations
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Grad-CAM */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800">Grad-CAM</h4>
                      </div>
                      <div className="p-3 flex justify-center bg-white">
                        {xaiExplanations.explanations.gradcam ? (
                          <img
                            src={xaiExplanations.explanations.gradcam}
                            alt="Grad-CAM Visualization"
                            className="h-52 object-contain cursor-pointer"
                            onClick={() => setSelectedImage(xaiExplanations.explanations.gradcam)}
                          />
                        ) : (
                          <div className="h-52 w-full flex items-center justify-center text-gray-500">
                            Visualization not available
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-3 bg-gray-50 text-sm">
                        <p>
                          Grad-CAM highlights the regions of the image that were most important for
                          the model's prediction. Red areas had the strongest influence.
                        </p>
                      </div>
                    </div>

                    {/* Occlusion Sensitivity */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800">Occlusion Sensitivity</h4>
                      </div>
                      <div className="p-3 flex justify-center bg-white">
                        {xaiExplanations.explanations.occlusion ? (
                          <img
                            src={xaiExplanations.explanations.occlusion}
                            alt="Occlusion Sensitivity"
                            className="h-52 object-contain cursor-pointer"
                            onClick={() => setSelectedImage(xaiExplanations.explanations.occlusion)}
                          />
                        ) : (
                          <div className="h-52 w-full flex items-center justify-center text-gray-500">
                            Visualization not available
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-3 bg-gray-50 text-sm">
                        <p>
                          Occlusion sensitivity shows how hiding different parts of the image
                          affects the prediction. Bright areas are most critical for diagnosis.
                        </p>
                      </div>
                    </div>

                    {/* Integrated Gradients */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800">Integrated Gradients</h4>
                      </div>
                      <div className="p-3 flex justify-center bg-white">
                        {xaiExplanations.explanations.integrated_gradients ? (
                          <img
                            src={xaiExplanations.explanations.integrated_gradients}
                            alt="Integrated Gradients"
                            className="h-52 object-contain cursor-pointer"
                            onClick={() =>
                              setSelectedImage(xaiExplanations.explanations.integrated_gradients)
                            }
                          />
                        ) : (
                          <div className="h-52 w-full flex items-center justify-center text-gray-500">
                            Visualization not available
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-3 bg-gray-50 text-sm">
                        <p>
                          Integrated Gradients attributes the prediction to input features by
                          integrating gradients along a straight path from baseline to input.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h5 className="text-indigo-800 font-medium mb-1">
                      About these visualizations:
                    </h5>
                    <p className="text-sm text-indigo-700">
                      These explainable AI techniques help understand how the AI model interprets
                      fundus images for glaucoma diagnosis. The colored regions in the
                      visualizations indicate areas that influenced the model's decision. Medical
                      professionals can use these insights to better understand the AI's reasoning
                      and validate its findings.
                    </p>
                  </div>
                </div>

                {/* Section 3: Clinical Interpretation */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-gray-200 mb-4">
                    Clinical Interpretation
                  </h3>

                  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <h4 className="text-lg font-semibold mb-3">
                      Glaucoma Classification:{" "}
                      <span className="text-indigo-600">
                        {xaiExplanations.prediction?.class
                          ? xaiExplanations.prediction.class.charAt(0).toUpperCase() +
                            xaiExplanations.prediction.class.slice(1)
                          : prediction.type?.charAt(0).toUpperCase() + prediction.type?.slice(1) ||
                            "Unknown"}
                      </span>
                    </h4>

                    <p className="mb-4">{getDiagnosisInfo().description}</p>

                    {getDiagnosisInfo().signs.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium mb-2">
                          Signs that typically indicate {prediction.type}{" "}
                          {prediction.type !== "normal" ? "glaucoma" : "fundus"}:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          {getDiagnosisInfo().signs.map((sign, index) => (
                            <li key={index} className="text-gray-700">
                              {sign}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {getDiagnosisInfo().note && (
                      <p className="font-medium text-indigo-700 mt-3">{getDiagnosisInfo().note}</p>
                    )}

                    <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-amber-800">
                        <strong>Disclaimer:</strong> This AI analysis is intended to assist
                        healthcare professionals and should not replace clinical judgment. Always
                        consult with an ophthalmologist for proper diagnosis and treatment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report Footer */}
                <div className="mt-8 pt-3 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
                  <div>Report generated on {new Date().toLocaleString()}</div>
                  <div className="flex space-x-3">
                    <span>Explainable AI Report v1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        rotation={rotation}
        setRotation={setRotation}
      />
    </>
  );
};

export default Glaucoma;
