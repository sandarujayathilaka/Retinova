import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useGetDiagnosisById } from "../../../services/diagnosis.service";

// Define interfaces locally
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

// Helper functions
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

// Diagnosis mapping information
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
  dry: {
    description:
      "Dry Age-Related Macular Degeneration - A progressive condition characterized by drusen deposits and degeneration of the macula, leading to gradual central vision loss.",
    severity: "Medium",
  },
  wet: {
    description:
      "Wet Age-Related Macular Degeneration - An advanced form of AMD involving abnormal blood vessel growth under the macula, causing leakage, scarring, and rapid central vision loss.",
    severity: "High",
  },
  No_AMD: {
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
  }
};

export default function DiagnosisDetailScreen() {
  const { id } = useLocalSearchParams();
  const patientId = "P1"; // Replace with dynamic patient ID from auth context
  const { data: diagnosis = null, isLoading, isError, error } = useGetDiagnosisById(patientId, id as string) as {
    data: Diagnosis | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (isError || !diagnosis) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-800 mb-2">Diagnosis Not Found</Text>
        <Text className="text-gray-600 text-center mb-4">
          The diagnosis you're looking for could not be found or may have been removed.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get diagnosis info from our mapping, or provide defaults
  const diagInfo = diagnosisInfo[diagnosis.diagnosis || ""] || {
    description: "Detailed information not available for this diagnosis type.",
    severity: "Medium",
  };

  // Severity colors
  const severityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Diagnosis Header */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">{diagnosis.diagnosis}</Text>
              <Text className="text-gray-500">{diagnosis.eye} Eye • {formatDate(diagnosis.uploadedAt)}</Text>
            </View>
            <View
              className={`px-3 py-1 rounded ${severityColors[diagInfo.severity]}`}
            >
              <Text
                className={`font-medium ${severityColors[diagInfo.severity].split(" ")[1]}`}
              >
                {diagInfo.severity}
              </Text>
            </View>
          </View>

          <Text className="text-gray-700 mb-4">{diagInfo.description}</Text>

          <View className="border-t border-gray-100 pt-3">
            <Text className="text-gray-600 mb-1">Confidence Score</Text>
            <View className="flex-row items-center">
              <View className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden mr-3">
                <View
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(diagnosis.confidenceScores[0] || 0) * 100}%` }}
                />
              </View>
              <Text className="text-gray-800 font-medium">
                {((diagnosis.confidenceScores[0] || 0) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Retina Image */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Retina Scan</Text>
          <Image
            source={{ uri: diagnosis.imageUrl }}
            className="w-full h-64 rounded-lg"
            resizeMode="contain"
          />
          <Text className="text-gray-500 text-xs text-center mt-2">
            Scan taken on {formatDate(diagnosis.uploadedAt)} at {formatTime(diagnosis.uploadedAt)}
          </Text>
        </View>

        {/* Doctor's Notes */}
        {diagnosis.reviewInfo && diagnosis.reviewInfo.length > 0 && (
          <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Doctor's Notes</Text>
            {diagnosis.reviewInfo.map((review: ReviewInfo, index: number) => (
              <View
                key={review._id}
                className={`pb-3 ${index < diagnosis.reviewInfo.length - 1 ? "mb-3 border-b border-gray-100" : ""}`}
              >
                <Text className="text-gray-700">{review.notes}</Text>
                <Text className="text-gray-500 text-xs mt-1">{formatDate(review.updatedAt)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Treatment & Recommendations */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Treatment & Recommendations</Text>

          {diagnosis.recommend.medicine && (
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Prescribed Medication</Text>
              <View className="bg-blue-50 p-3 rounded-lg">
                <Text className="text-gray-800">{diagnosis.recommend.medicine}</Text>
              </View>
            </View>
          )}

          {diagnosis.recommend.note && (
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Notes</Text>
              <Text className="text-gray-800">{diagnosis.recommend.note}</Text>
            </View>
          )}

          <View className="mb-2">
            <Text className="text-gray-700 font-medium mb-1">Follow-up Schedule</Text>
            <Text className="text-gray-800">{diagnosis.revisitTimeFrame} check-ups recommended</Text>
          </View>
        </View>

        {/* Recommended Tests */}
        {diagnosis.recommend.tests && diagnosis.recommend.tests.length > 0 && (
          <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Recommended Tests</Text>
            {diagnosis.recommend.tests.map((test: Test, index: number) => (
              <View
                key={test._id}
                className={`${index < diagnosis.recommend.tests.length - 1 ? "border-b border-gray-100 pb-3 mb-3" : ""}`}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-800 font-medium">{test.testName}</Text>
                  <View
                    className={`px-2 py-1 rounded ${
                      test.status === "Reviewed"
                        ? "bg-green-100"
                        : test.status === "Completed"
                        ? "bg-blue-100"
                        : test.status === "In Progress"
                        ? "bg-yellow-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        test.status === "Reviewed"
                          ? "text-green-800"
                          : test.status === "Completed"
                          ? "text-blue-800"
                          : test.status === "In Progress"
                          ? "text-yellow-800"
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
                    className="flex-row items-center bg-gray-50 p-2 rounded-lg"
                    onPress={() => {
                      /* View attachment */
                    }}
                  >
                    <FontAwesome5 name="file-pdf" size={16} color="#f87171" />
                    <Text className="text-gray-700 ml-2">View Test Results</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-3 px-5 flex-1 mr-2 items-center"
            onPress={() => {
              /* Book follow-up */
            }}
          >
            <Text className="text-white font-semibold">Book Follow-up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-blue-500 rounded-xl py-3 px-5 flex-1 ml-2 items-center"
            onPress={() => {
              /* Export or share */
            }}
          >
            <Text className="text-blue-500 font-semibold">Share Results</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}