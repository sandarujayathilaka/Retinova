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
import { LinearGradient } from "expo-linear-gradient"; // Added import

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

  const { data: diagnosis = null, isLoading, isError, error } = useGetDiagnosisById(id as string) as {
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
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  if (isError || !diagnosis) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <MaterialCommunityIcons name="eye-off-outline" size={64} color="#1e40af" />
        <Text className="text-lg text-gray-800 font-medium mb-2 mt-4">Diagnosis Not Found</Text>
        <Text className="text-gray-600 text-center mb-4">
          The diagnosis you're looking for could not be found or may have been removed.
        </Text>
        <TouchableOpacity
          className="bg-blue-900 px-6 py-3 rounded-xl shadow-md"
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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

      {/* Updated Header Section with LinearGradient */}
      <LinearGradient
        colors={["#1e3a8a", "#3b82f6"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
       
        <Text className="text-2xl font-bold text-white mt-2">{diagnosis.diagnosis}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name={eyeIcon} size={16} color="#e0e7ff" />
          <Text className="text-white ml-1 font-medium">{diagnosis.eye} Eye</Text>
        </View>
        
        {/* Enhanced Quick info pill cards with better visibility */}
        <View className="flex-row mt-4 mb-1">
          <View className="bg-white/30 rounded-xl px-3 py-2 mr-2">
            <Text className="text-white text-xs">Diagnosed</Text>
            <Text className="text-white font-medium">{formatDate(diagnosis.uploadedAt).split(',')[0]}</Text>
          </View>
          <View className="bg-white/30 rounded-xl px-3 py-2 mr-2">
            <Text className="text-white text-xs">Next Visit</Text>
            <Text className="text-white font-medium">{diagnosis.revisitTimeFrame}</Text>
          </View>
          <View className={`rounded-xl px-3 py-2 ${
            diagInfo.severity === "High" ? "bg-red-500/60" : 
            diagInfo.severity === "Medium" ? "bg-amber-500/60" : 
            "bg-green-500/60"}`}>
            <Text className="text-white text-xs">Risk Level</Text>
            <Text className="text-white font-bold">{diagInfo.severity}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Spacer remains unchanged */}
      <View className="h-44" />

      <ScrollView className="flex-1 bg-white z-0">
        {/* Main content with refined card appearance */}
        <View className="mx-4 mt-4">
          {/* Overview Card with improved spacing and contrast */}
          <View className="bg-white rounded-2xl shadow p-5 mb-5 border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-2">Overview</Text>
            <Text className="text-gray-700 mb-4 leading-relaxed">{diagInfo.description}</Text>
            
            {/* Confidence Score with cleaner design and updated colors */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-medium">Confidence Score</Text>
                <Text className="text-blue-900 font-bold">
                  {((Math.max(...(diagnosis.confidenceScores || [0])) || 0) * 100).toFixed(1)}%
                </Text>
              </View>
              <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-blue-900 rounded-full"
                  style={{ width: `${(Math.max(...(diagnosis.confidenceScores || [0])) || 0) * 100}%` }}
                />
              </View>
            </View>

            {/* Retina Scan with better container styling */}
            <Text className="text-gray-700 font-medium mb-3 mt-2">Retina Scan</Text>
            <View className="bg-gray-50 rounded-xl overflow-hidden mb-2 border border-gray-100">
              <Image
                source={{ uri: diagnosis.imageUrl }}
                className="w-full h-72 rounded-xl"
                resizeMode="contain"
              />
            </View>
            <Text className="text-gray-500 text-xs text-center">
              Scan taken on {formatDate(diagnosis.uploadedAt)} at {formatTime(diagnosis.uploadedAt)}
            </Text>
          </View>

          {/* Doctor's Treatment Section with improved visual hierarchy and updated colors */}
          <View className="bg-white rounded-2xl shadow mb-5 border border-gray-100">
            <TouchableOpacity 
              className="p-5 flex-row justify-between items-center border-b border-gray-100"
              onPress={() => toggleSection("treatment")}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="pill" size={22} color="#1e3a8a" />
                <Text className="text-lg font-bold text-gray-900 ml-3">Initial Checkup Details</Text>
              </View>
              <View className="bg-blue-100 rounded-full p-1">
                <AntDesign 
                  name={expandedSection === "treatment" ? "up" : "down"} 
                  size={16} 
                  color="#1e3a8a" 
                />
              </View>
            </TouchableOpacity>
            
            {expandedSection === "treatment" && (
              <View className="p-5">
                {/* Recommended Medication */}
                {diagnosis.recommend.medicine && (
                  <View className="mb-4">
                    <Text className="text-gray-800 font-medium mb-2">Recommended Medication</Text>
                    <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <Text className="text-gray-800">{diagnosis.recommend.medicine}</Text>
                    </View>
                  </View>
                )}

                {/* Doctor's Notes */}
                {diagnosis.recommend.note && (
                  <View className="mb-4">
                    <Text className="text-gray-800 font-medium mb-2">Doctor's Notes</Text>
                    <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <Text className="text-gray-800 leading-relaxed">{diagnosis.recommend.note}</Text>
                    </View>
                  </View>
                )}

                {/* Next Visit */}
                <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name="calendar-check" size={20} color="#1e3a8a" />
                      <Text className="text-gray-800 font-bold ml-2">Next Visit</Text>
                    </View>
                    <View className="bg-blue-900 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-medium">{diagnosis.revisitTimeFrame}</Text>
                    </View>
                  </View>
                  <View className="mt-2 flex-row items-center">
                    <Text className="text-gray-700">Recommended date:</Text>
                    <Text className="text-blue-900 font-bold ml-2">{nextVisitDate}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Doctor's Review Section with better visual hierarchy and updated colors */}
          {diagnosis.reviewInfo && diagnosis.reviewInfo.length > 0 && (
            <View className="bg-white rounded-2xl shadow mb-5 border border-gray-100">
              <TouchableOpacity 
                className="p-5 flex-row justify-between items-center border-b border-gray-100"
                onPress={() => toggleSection("reviews")}
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="doctor" size={22} color="#1e3a8a" />
                  <Text className="text-lg font-bold text-gray-900 ml-3">Doctor's Reviews</Text>
                </View>
                <View className="bg-blue-100 rounded-full p-1">
                  <AntDesign 
                    name={expandedSection === "reviews" ? "up" : "down"} 
                    size={16} 
                    color="#1e3a8a" 
                  />
                </View>
              </TouchableOpacity>
              
              {expandedSection === "reviews" && (
                <View className="p-5">
                  {diagnosis.reviewInfo.map((review: ReviewInfo, index: number) => (
                    <View
                      key={review._id}
                      className={`pb-4 ${index < diagnosis.reviewInfo.length - 1 ? "mb-4 border-b border-gray-100" : ""}`}
                    >
                      {review.recommendedMedicine && (
                        <View className="mb-3">
                          <Text className="text-gray-800 font-medium mb-2">Recommended Medication</Text>
                          <View className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <Text className="text-gray-800">{review.recommendedMedicine}</Text>
                          </View>
                        </View>
                      )}
                      <View className="mb-2">
                        <Text className="text-gray-800 font-medium mb-2">Notes</Text>
                        <View className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <Text className="text-gray-700 leading-relaxed">{review.notes || "No additional notes provided."}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mt-3">
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#1e3a8a" />
                        <Text className="text-blue-800 text-xs ml-1">
                          Updated on {formatDate(review.updatedAt)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Recommended Tests Section with better visual hierarchy and updated colors */}
          {diagnosis.recommend.tests && diagnosis.recommend.tests.length > 0 && (
            <View className="bg-white rounded-2xl shadow mb-5 border border-gray-100">
              <TouchableOpacity 
                className="p-5 flex-row justify-between items-center border-b border-gray-100"
                onPress={() => toggleSection("tests")}
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="test-tube" size={22} color="#1e3a8a" />
                  <Text className="text-lg font-bold text-gray-900 ml-3">
                    Recommended Tests ({diagnosis.recommend.tests.length})
                  </Text>
                </View>
                <View className="bg-blue-100 rounded-full p-1">
                  <AntDesign 
                    name={expandedSection === "tests" ? "up" : "down"} 
                    size={16} 
                    color="#1e3a8a" 
                  />
                </View>
              </TouchableOpacity>
              
              {expandedSection === "tests" && (
                <View className="p-5">
                  {diagnosis.recommend.tests.map((test: Test, index: number) => (
                    <View
                      key={test._id}
                      className={`${index < diagnosis.recommend.tests.length - 1 ? "border-b border-gray-100 pb-5 mb-5" : ""}`}
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-800 font-semibold">{test.testName}</Text>
                        <View
                          className={`px-3 py-1 rounded-full ${
                            test.status === "Reviewed"
                              ? "bg-green-100"
                              : test.status === "Completed"
                              ? "bg-blue-100"
                              : test.status === "In Progress"
                              ? "bg-amber-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              test.status === "Reviewed"
                                ? "text-green-800"
                                : test.status === "Completed"
                                ? "text-blue-800"
                                : test.status === "In Progress"
                                ? "text-amber-800"
                                : "text-gray-800"
                            }`}
                          >
                            {test.status}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mb-3">
                        <MaterialCommunityIcons name="calendar" size={14} color="#1e3a8a" />
                        <Text className="text-gray-500 text-xs ml-1">Added on {formatDate(test.addedAt)}</Text>
                      </View>
                      {test.attachmentURL && (
                        <TouchableOpacity
                          className="flex-row items-center bg-blue-900 p-3 rounded-xl mt-2 shadow-sm"
                          onPress={() => openAttachment(test.attachmentURL)}
                        >
                          <FontAwesome5 name="file-pdf" size={16} color="#ffffff" />
                          <Text className="text-white font-medium ml-2">View Test Results</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

       
      </ScrollView>

      {/* Improved Modal for attachments with updated colors */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 bg-blue-900 shadow">
            <Text className="text-lg font-bold text-white">Test Result</Text>
            <TouchableOpacity onPress={closeModal} className="bg-white/20 rounded-full p-2">
              <Ionicons name="close" size={22} color="#ffffff" />
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
                    <ActivityIndicator size="large" color="#1e3a8a" />
                  </View>
                )}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error("WebView error:", nativeEvent);
                }}
              />
            ) : fileType === "image" ? (
              <View className="flex-1 bg-gray-50 p-2">
                <Image
                  source={{ uri: selectedAttachmentUrl }}
                  style={{ flex: 1, width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View className="flex-1 justify-center items-center p-4">
                <MaterialCommunityIcons name="file-alert-outline" size={64} color="#1e3a8a" />
                <Text className="text-center text-gray-700 mt-4 text-lg font-medium">
                  Unsupported file type or invalid URL
                </Text>
                <Text className="text-center text-gray-500 mt-2 mb-6">
                  Please contact support for assistance with this document.
                </Text>
                <TouchableOpacity
                  className="bg-blue-900 px-6 py-3 rounded-xl shadow-md"
                  onPress={closeModal}
                >
                  <Text className="text-white font-bold">Close</Text>
                </TouchableOpacity>
              </View>
            )
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}