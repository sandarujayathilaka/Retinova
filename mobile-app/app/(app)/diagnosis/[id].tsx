import React, { useState, useEffect } from "react";
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

// Define types based on your MongoDB schema
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
  revisitTimeFrame:
    | "Monthly"
    | "Quarterly"
    | "Bi-annually"
    | "Annually"
    | "As needed";
  uploadedAt: string;
  reviewInfo: ReviewInfo[];
}

// Sample diagnosis data - in a real app you would fetch this from an API
const sampleDiagnosis: Diagnosis = {
  _id: "67d71ac3ebc0d8488ede7e17",
  imageUrl:
    "https://retinova.s3.amazonaws.com/diagnosis_images/1d6d4f96-c3d3-4e8f-a34b-eea849e5433a_P2_left_20251008.png",
  diagnosis: "PDR",
  doctorDiagnosis: "N/A",
  eye: "LEFT",
  status: "Checked",
  confidenceScores: [0.5779826641082764],
  recommend: {
    medicine: "Antibiotic eye drops",
    tests: [
      {
        testName: "AWS",
        status: "Reviewed",
        attachmentURL:
          "https://patient-test-record-attachments.s3.ap-south-1.amazonaws.com/84ca92e0-d877-43d7-9871-9a1be0159c01-Rubric-PP-2.pdf",
        _id: "67d71ac3ebc0d8488ede7e18",
        addedAt: "2025-03-16T18:38:59.210Z",
      },
      {
        testName: "AQW",
        status: "Reviewed",
        attachmentURL:
          "https://patient-test-record-attachments.s3.ap-south-1.amazonaws.com/cff6dd95-2d45-4dad-809e-3074683510e6-WhatsApp%20Image%202025-03-05%20at%2010.18.32.jpeg",
        addedAt: "2025-03-16T18:50:14.461Z",
        _id: "67d71d66b25aa4663f414278",
      },
    ],
    note: "Patient shows signs of proliferative diabetic retinopathy. Follow-up required.",
  },
  revisitTimeFrame: "Monthly",
  uploadedAt: "2025-03-16T18:38:59.216Z",
  reviewInfo: [
    {
      recommendedMedicine: "",
      notes:
        "Patient should maintain glucose levels and return for follow-up scan in one month.",
      updatedAt: "2025-03-16T18:50:14.449Z",
      _id: "67d71d66b25aa4663f414277",
    },
    {
      recommendedMedicine: "",
      notes: "Doctor review: Condition appears stable, continue monitoring.",
      updatedAt: "2025-03-16T18:52:28.814Z",
      _id: "67d71decb25aa4663f414291",
    },
  ],
};

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
      "Proliferative Diabetic Retinopathy - An advanced stage of diabetic eye disease characterized by abnormal blood vessel growth in the retina.",
    severity: "High",
  },
  NPDR: {
    description:
      "Non-Proliferative Diabetic Retinopathy - Early stage of diabetic retinopathy with mild to moderate changes in the retina.",
    severity: "Medium",
  },
  DME: {
    description:
      "Diabetic Macular Edema - Swelling in the macula (central part of the retina) due to leaking blood vessels.",
    severity: "Medium",
  },
  Normal: {
    description: "No signs of retinal abnormalities detected.",
    severity: "Low",
  },
};

export default function DiagnosisDetailScreen() {
  const { id } = useLocalSearchParams();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setDiagnosis(sampleDiagnosis);
      setLoading(false);
    }, 1000);

    // In a real app you'd do something like:
    // async function fetchDiagnosisData() {
    //   try {
    //     const response = await fetch(`your-api-endpoint/diagnosis/${id}`);
    //     const data = await response.json();
    //     setDiagnosis(data);
    //   } catch (error) {
    //     console.error('Error fetching diagnosis data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchDiagnosisData();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!diagnosis) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-800 mb-2">Diagnosis Not Found</Text>
        <Text className="text-gray-600 text-center mb-4">
          The diagnosis you're looking for could not be found or may have been
          removed.
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
  const diagInfo = diagnosisInfo[diagnosis.diagnosis] || {
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

      {/* Header */}
      {/* <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity className="mr-4" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4b5563" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            Diagnosis Details
          </Text>
        </View>
      </View> */}

      <ScrollView className="flex-1 px-4 py-4">
        {/* Diagnosis Header */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">
                {diagnosis.diagnosis}
              </Text>
              <Text className="text-gray-500">
                {diagnosis.eye} Eye • {formatDate(diagnosis.uploadedAt)}
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded ${
                severityColors[diagInfo.severity]
              }`}
            >
              <Text
                className={`font-medium ${
                  severityColors[diagInfo.severity].split(" ")[1]
                }`}
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
                  style={{ width: `${diagnosis.confidenceScores[0] * 100}%` }}
                />
              </View>
              <Text className="text-gray-800 font-medium">
                {(diagnosis.confidenceScores[0] * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Retina Image */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Retina Scan
          </Text>
          <Image
            source={{ uri: diagnosis.imageUrl }}
            className="w-full h-64 rounded-lg"
            resizeMode="contain"
          />
          <Text className="text-gray-500 text-xs text-center mt-2">
            Scan taken on {formatDate(diagnosis.uploadedAt)} at{" "}
            {formatTime(diagnosis.uploadedAt)}
          </Text>
        </View>

        {/* Doctor's Notes */}
        {diagnosis.reviewInfo && diagnosis.reviewInfo.length > 0 && (
          <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Doctor's Notes
            </Text>

            {diagnosis.reviewInfo.map((review, index) => (
              <View
                key={review._id}
                className={`pb-3 ${
                  index < diagnosis.reviewInfo.length - 1
                    ? "mb-3 border-b border-gray-100"
                    : ""
                }`}
              >
                <Text className="text-gray-700">{review.notes}</Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {formatDate(review.updatedAt)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Treatment & Recommendations */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Treatment & Recommendations
          </Text>

          {diagnosis.recommend.medicine && (
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">
                Prescribed Medication
              </Text>
              <View className="bg-blue-50 p-3 rounded-lg">
                <Text className="text-gray-800">
                  {diagnosis.recommend.medicine}
                </Text>
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
            <Text className="text-gray-700 font-medium mb-1">
              Follow-up Schedule
            </Text>
            <Text className="text-gray-800">
              {diagnosis.revisitTimeFrame} check-ups recommended
            </Text>
          </View>
        </View>

        {/* Recommended Tests */}
        {diagnosis.recommend.tests && diagnosis.recommend.tests.length > 0 && (
          <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Recommended Tests
            </Text>

            {diagnosis.recommend.tests.map((test, index) => (
              <View
                key={test._id}
                className={`${
                  index < diagnosis.recommend.tests.length - 1
                    ? "border-b border-gray-100 pb-3 mb-3"
                    : ""
                }`}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-800 font-medium">
                    {test.testName}
                  </Text>
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

                <Text className="text-gray-500 text-xs mb-2">
                  Added on {formatDate(test.addedAt)}
                </Text>

                {test.attachmentURL && (
                  <TouchableOpacity
                    className="flex-row items-center bg-gray-50 p-2 rounded-lg"
                    onPress={() => {
                      /* View attachment */
                    }}
                  >
                    <FontAwesome5 name="file-pdf" size={16} color="#f87171" />
                    <Text className="text-gray-700 ml-2">
                      View Test Results
                    </Text>
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
