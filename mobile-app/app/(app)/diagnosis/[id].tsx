import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  AntDesign,
} from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useGetDiagnosisById } from "../../../services/diagnosis.service";
import useAuthStore from "../../../stores/auth";
import { WebView } from "react-native-webview";

interface Test {
  testName: string;
  status: "Pending" | "In Progress" | "Completed" | "Reviewed";
  attachmentURL: string;
  addedAt: string;
  _id: string;
}

interface ReviewInfo {
  recommendedMedicine: string;
  notes: string;
  updatedAt: string;
  _id: string;
}

interface Diagnosis {
  _id: string;
  imageUrl: string;
  diagnosis: string;
  doctorDiagnosis: string;
  eye: "LEFT" | "RIGHT";
  status: "Unchecked" | "Completed" | "Checked" | "Test Completed";
  confidenceScores: number[];
  recommend: {
    medicine: string;
    tests: Test[];
    note: string;
  };
  revisitTimeFrame: "Monthly" | "Quarterly" | "Bi-annually" | "Annually" | "As needed";
  uploadedAt: string;
  reviewInfo: ReviewInfo[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const calculateNextVisitDate = (uploadDate: string, timeFrame: string): string => {
  const date = new Date(uploadDate);
  
  switch(timeFrame) {
    case "Monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "Quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "Bi-annually":
      date.setMonth(date.getMonth() + 6);
      break;
    case "Annually":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return "Schedule as required";
  }
  
  return formatDate(date.toString());
};

const getFileType = (url: string): "pdf" | "image" | "unknown" => {
  const extension = url.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) return "image";
  return "unknown";
};

const diagnosisInfo: {
  [key: string]: { description: string; severity: "Low" | "Medium" | "High" };
} = {
  PDR: {
    description:
      "Proliferative Diabetic Retinopathy - An advanced stage of diabetic eye disease characterized by abnormal blood vessel growth in the retina, which can lead to severe vision loss if untreated.",
    severity: "High",
  },
  NPDR: {
    description:
      "Non-Proliferative Diabetic Retinopathy - Early stage of diabetic retinopathy with mild to moderate changes in the retina, such as microaneurysms, hemorrhages, or exudates.",
    severity: "Medium",
  },
  NODR: {
    description:
      "No Diabetic Retinopathy - The retina shows no signs of diabetic retinopathy, indicating healthy retinal blood vessels and no diabetes-related damage.",
    severity: "Low",
  },
  "Early Glaucoma": {
    description:
      "Early Glaucoma - An early stage of glaucoma characterized by mild optic nerve damage and minimal visual field loss, often manageable with treatment.",
    severity: "Medium",
  },
  "Advanced Glaucoma": {
    description:
      "Advanced Glaucoma - A severe stage of glaucoma with significant optic nerve damage and substantial visual field loss, potentially leading to blindness if not controlled.",
    severity: "High",
  },
  "No Glaucoma": {
    description:
      "No Glaucoma - The optic nerve and intraocular pressure are within normal limits, with no signs of glaucomatous damage or visual field defects.",
    severity: "Low",
  },
  "Dry AMD": {
    description:
      "Dry Age-Related Macular Degeneration - A progressive condition characterized by drusen deposits and degeneration of the macula, leading to gradual central vision loss.",
    severity: "Medium",
  },
  "Wet AMD": {
    description:
      "Wet Age-Related Macular Degeneration - An advanced form of AMD involving abnormal blood vessel growth under the macula, causing leakage, scarring, and rapid central vision loss.",
    severity: "High",
  },
  "Normal (No AMD)": {
    description:
      "Normal (No AMD) - No signs of age-related macular degeneration, with a healthy macula and no drusen or abnormal blood vessel growth.",
    severity: "Low",
  },
  CRVO: {
    description:
      "Central Retinal Vein Occlusion - A blockage of the central retinal vein leading to swelling (edema) in the retina, often causing significant vision loss.",
    severity: "High",
  },
  BRVO: {
    description:
      "Branch Retinal Vein Occlusion - A blockage in a branch of the retinal vein, causing localized swelling and hemorrhages in the retina, which may affect vision depending on the location.",
    severity: "Medium",
  },
  "Healthy (No RVO)": {
    description:
      "Healthy (No RVO) - No signs of retinal vein occlusion, with normal retinal blood flow and no swelling or hemorrhages.",
    severity: "Low",
  },
  DME: {
    description:
      "Diabetic Macular Edema - Swelling in the macula (central part of the retina) due to leaking blood vessels caused by diabetes, potentially impacting central vision.",
    severity: "Medium",
  },
  Normal: {
    description: "No signs of retinal abnormalities detected, indicating a healthy retina.",
    severity: "Low",
  },
};

export default function DiagnosisDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const patientId = user?.id?.toString() || "P2";

  const { data: diagnosis = null, isLoading, isError, error } = useGetDiagnosisById(patientId, id as string) as {
    data: Diagnosis | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedAttachmentUrl, setSelectedAttachmentUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"pdf" | "image" | "unknown">("unknown");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const openAttachment = (url: string) => {
    const type = getFileType(url);
    setFileType(type);
    setSelectedAttachmentUrl(url);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAttachmentUrl(null);
    setFileType("unknown");
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (isError || !diagnosis) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <MaterialCommunityIcons name="eye-off-outline" size={64} color="#94a3b8" />
        <Text className="text-lg text-gray-800 font-medium mb-2 mt-4">Diagnosis Not Found</Text>
        <Text className="text-gray-600 text-center mb-4">
          The diagnosis you're looking for could not be found or may have been removed.
        </Text>
        <TouchableOpacity
          className="bg-sky-500 px-6 py-3 rounded-lg shadow-sm"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const diagInfo = diagnosisInfo[diagnosis.diagnosis] || {
    description: "Detailed information not available for this diagnosis type.",
    severity: "Medium",
  };

  const nextVisitDate = calculateNextVisitDate(diagnosis.uploadedAt, diagnosis.revisitTimeFrame);

  const severityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-amber-100 text-amber-800",
    High: "bg-red-100 text-red-800",
  };

  const eyeIcon = diagnosis.eye === "LEFT" ? "eye-outline" : "eye-outline";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView className="flex-1">
        {/* Header Section */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="mb-2">
            <View className="flex-row items-center">
              <Ionicons name="arrow-back" size={22} color="#0284c7" />
              <Text className="text-sky-700 ml-1">Back</Text>
            </View>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">{diagnosis.diagnosis}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name={eyeIcon} size={16} color="#64748b" />
            <Text className="text-gray-600 ml-1">{diagnosis.eye} Eye</Text>
          </View>
        </View>

        {/* Main Diagnosis Information */}
        <View className="mx-4 mt-4">
          {/* Overview */}
          <Text className="text-gray-700 mb-4">{diagInfo.description}</Text>
          
          {/* Confidence Score */}
          <View className="mb-4">
            <Text className="text-gray-600 mb-1">Confidence Score</Text>
            <View className="flex-row items-center">
              <View className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden mr-3">
                <View
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${(diagnosis.confidenceScores[0] || 0) * 100}%` }}
                />
              </View>
              <Text className="text-gray-800 font-medium">
                {((diagnosis.confidenceScores[0] || 0) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Diagnosis Date */}
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="calendar-clock" size={18} color="#64748b" />
            <Text className="text-gray-500 ml-2">
              Diagnosed on {formatDate(diagnosis.uploadedAt)}
            </Text>
          </View>

          {/* Risk Level */}
          <View className="mb-4">
            <Text className="text-gray-600 mb-1">Risk Level</Text>
            <View className={`px-3 py-1 rounded-full w-24 ${severityColors[diagInfo.severity]}`}>
              <Text className={`font-medium ${severityColors[diagInfo.severity].split(" ")[1]}`}>
                {diagInfo.severity} Risk
              </Text>
            </View>
          </View>

            {/* Next Visit */}
                <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name="calendar-check" size={20} color="#0284c7" />
                      <Text className="text-gray-800 font-medium ml-2">Next Visit</Text>
                    </View>
                    <View className="bg-sky-100 px-2 py-1 rounded-full">
                      <Text className="text-sky-800 text-xs font-medium">{diagnosis.revisitTimeFrame}</Text>
                    </View>
                  </View>
                  <View className="mt-3 flex-row items-center">
                    <Text className="text-gray-700">Recommended date:</Text>
                    <Text className="text-sky-700 font-medium ml-2">{nextVisitDate}</Text>
                  </View>
                </View>          

          {/* Retina Scan */}
          <View className="mb-6">
            <Text className="text-gray-600 mb-2">Retina Scan</Text>
            <Image
              source={{ uri: diagnosis.imageUrl }}
              className="w-full h-64 rounded-lg"
              resizeMode="contain"
            />
            <Text className="text-gray-500 text-xs text-center mt-2">
              Scan taken on {formatDate(diagnosis.uploadedAt)} at {formatTime(diagnosis.uploadedAt)}
            </Text>
          </View>

          {/* Doctor's Treatment Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4">
            <TouchableOpacity 
              className="p-4 flex-row justify-between items-center border-b border-gray-100"
              onPress={() => toggleSection("treatment")}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="pill" size={20} color="#0284c7" />
                <Text className="text-lg font-semibold text-gray-800 ml-2">Treatment Plan</Text>
              </View>
              <AntDesign 
                name={expandedSection === "treatment" ? "caretup" : "caretdown"} 
                size={16} 
                color="#0284c7" 
              />
            </TouchableOpacity>
            
            {expandedSection === "treatment" && (
              <View className="p-4">
                {/* Recommended Medication */}
                {(diagnosis.recommend.medicine || (diagnosis.reviewInfo && diagnosis.reviewInfo[0]?.recommendedMedicine)) && (
                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">Recommended Medication</Text>
                    <View className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Text className="text-gray-800">
                        {diagnosis.reviewInfo?.[0]?.recommendedMedicine || diagnosis.recommend.medicine}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Doctor's Notes */}
                {(diagnosis.recommend.note || (diagnosis.reviewInfo && diagnosis.reviewInfo[0]?.notes)) && (
                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">Doctor's Notes</Text>
                    <View className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Text className="text-gray-800">
                        {diagnosis.reviewInfo?.[0]?.notes || diagnosis.recommend.note || "No additional notes provided."}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Next Visit */}
                <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name="calendar-check" size={20} color="#0284c7" />
                      <Text className="text-gray-800 font-medium ml-2">Next Visit</Text>
                    </View>
                    <View className="bg-sky-100 px-2 py-1 rounded-full">
                      <Text className="text-sky-800 text-xs font-medium">{diagnosis.revisitTimeFrame}</Text>
                    </View>
                  </View>
                  <View className="mt-3 flex-row items-center">
                    <Text className="text-gray-700">Recommended date:</Text>
                    <Text className="text-sky-700 font-medium ml-2">{nextVisitDate}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Doctor's Review Section */}
          {diagnosis.reviewInfo && diagnosis.reviewInfo.length > 0 && (
            <View className="bg-white rounded-xl shadow-sm mb-4">
              <TouchableOpacity 
                className="p-4 flex-row justify-between items-center border-b border-gray-100"
                onPress={() => toggleSection("reviews")}
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="doctor" size={20} color="#0284c7" />
                  <Text className="text-lg font-semibold text-gray-800 ml-2">Doctor's Reviews</Text>
                </View>
                <AntDesign 
                  name={expandedSection === "reviews" ? "caretup" : "caretdown"} 
                  size={16} 
                  color="#0284c7" 
                />
              </TouchableOpacity>
              
              {expandedSection === "reviews" && (
                <View className="p-4">
                  {diagnosis.reviewInfo.map((review: ReviewInfo, index: number) => (
                    <View
                      key={review._id}
                      className={`pb-3 ${index < diagnosis.reviewInfo.length - 1 ? "mb-3 border-b border-gray-100" : ""}`}
                    >
                      {review.recommendedMedicine && (
                        <View className="mb-3">
                          <Text className="text-gray-700 font-medium mb-1">Recommended Medication</Text>
                          <Text className="text-gray-800">{review.recommendedMedicine}</Text>
                        </View>
                      )}
                      <View className="mb-2">
                        <Text className="text-gray-700 font-medium mb-1">Notes</Text>
                        <Text className="text-gray-700">{review.notes || "No additional notes provided."}</Text>
                      </View>
                      <Text className="text-sky-600 text-xs mt-2">
                        Updated on {formatDate(review.updatedAt)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Recommended Tests Section */}
          {diagnosis.recommend.tests && diagnosis.recommend.tests.length > 0 && (
            <View className="bg-white rounded-xl shadow-sm mb-4">
              <TouchableOpacity 
                className="p-4 flex-row justify-between items-center border-b border-gray-100"
                onPress={() => toggleSection("tests")}
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="test-tube" size={20} color="#0284c7" />
                  <Text className="text-lg font-semibold text-gray-800 ml-2">
                    Recommended Tests ({diagnosis.recommend.tests.length})
                  </Text>
                </View>
                <AntDesign 
                  name={expandedSection === "tests" ? "caretup" : "caretdown"} 
                  size={16} 
                  color="#0284c7" 
                />
              </TouchableOpacity>
              
              {expandedSection === "tests" && (
                <View className="p-4">
                  {diagnosis.recommend.tests.map((test: Test, index: number) => (
                    <View
                      key={test._id}
                      className={`${index < diagnosis.recommend.tests.length - 1 ? "border-b border-gray-100 pb-4 mb-4" : ""}`}
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-800 font-medium">{test.testName}</Text>
                        <View
                          className={`px-2 py-1 rounded-full ${
                            test.status === "Reviewed"
                              ? "bg-green-100"
                              : test.status === "Completed"
                              ? "bg-sky-100"
                              : test.status === "In Progress"
                              ? "bg-amber-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              test.status === "Reviewed"
                                ? "text-green-800"
                                : test.status === "Completed"
                                ? "text-sky-800"
                                : test.status === "In Progress"
                                ? "text-amber-800"
                                : "text-gray-800"
                            }`}
                          >
                            {test.status}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-500 text-xs mb-2">Added on {formatDate(test.addedAt)}</Text>
                      {test.attachmentURL && (
                        <TouchableOpacity
                          className="flex-row items-center bg-gray-50 p-3 rounded-lg mt-2 border border-gray-200"
                          onPress={() => openAttachment(test.attachmentURL)}
                        >
                          <FontAwesome5 name="file-pdf" size={16} color="#0284c7" />
                          <Text className="text-sky-700 font-medium ml-2">View Test Results</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between m-4 mt-6 mb-8">
          <TouchableOpacity
            className="bg-sky-500 rounded-xl py-3 px-5 flex-1 mr-2 items-center shadow-sm"
            onPress={() => {/* Book follow-up */}}
          >
            <Text className="text-white font-semibold">Book Follow-up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white border border-sky-500 rounded-xl py-3 px-5 flex-1 ml-2 items-center"
            onPress={() => {/* Export or share */}}
          >
            <Text className="text-sky-600 font-semibold">Share Results</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-800">Test Result</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>
          {selectedAttachmentUrl ? (
            fileType === "pdf" ? (
              <WebView
                source={{
                  uri: `https://docs.google.com/viewer?url=${encodeURIComponent(selectedAttachmentUrl)}&embedded=true`,
                }}
                style={{ flex: 1 }}
                startInLoadingState={true}
                renderLoading={() => (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0284c7" />
                  </View>
                )}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error("WebView error:", nativeEvent);
                }}
              />
            ) : fileType === "image" ? (
              <Image
                source={{ uri: selectedAttachmentUrl }}
                style={{ flex: 1, width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            ) : (
              <View className="flex-1 justify-center items-center p-4">
                <Text className="text-center text-gray-700">
                  Unsupported file type or invalid URL. Please contact support.
                </Text>
                <TouchableOpacity
                  className="bg-sky-500 px-4 py-2 rounded-lg mt-4"
                  onPress={closeModal}
                >
                  <Text className="text-white font-semibold">Close</Text>
                </TouchableOpacity>
              </View>
            )
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}