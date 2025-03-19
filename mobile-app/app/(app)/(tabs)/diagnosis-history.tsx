import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";

// Define interfaces for our data model
interface ReviewInfo {
  recommendedMedicine: string;
  notes: string;
  updatedAt: string;
  _id: string;
}

interface Test {
  testName: string;
  status: "Pending" | "In Progress" | "Completed" | "Reviewed";
  attachmentURL: string;
  addedAt: string;
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

// Sample data for diagnosis history
const sampleDiagnoses: Diagnosis[] = [
  {
    _id: "67d71ac3ebc0d8488ede7e17",
    imageUrl:
      "https://retinova.s3.amazonaws.com/diagnosis_images/1d6d4f96-c3d3-4e8f-a34b-eea849e5433a_P2_left_20251008.png",
    diagnosis: "PDR",
    doctorDiagnosis: "N/A",
    eye: "LEFT",
    status: "Checked",
    confidenceScores: [0.5779826641082764],
    recommend: {
      medicine: "",
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
      note: "Patient shows signs of proliferative diabetic retinopathy.",
    },
    revisitTimeFrame: "Monthly",
    uploadedAt: "2025-03-16T18:38:59.216Z",
    reviewInfo: [
      {
        recommendedMedicine: "",
        notes: "check",
        updatedAt: "2025-03-16T18:50:14.449Z",
        _id: "67d71d66b25aa4663f414277",
      },
    ],
  },
  {
    _id: "67d72038b25aa4663f414303",
    imageUrl:
      "https://retinova.s3.amazonaws.com/diagnosis_images/db831b36-ae20-4c08-96bc-e2bee0ac052c_P2_left_20251008.png",
    diagnosis: "PDR",
    doctorDiagnosis: "N/A",
    eye: "LEFT",
    status: "Checked",
    confidenceScores: [0.5779826641082764],
    recommend: {
      medicine: "d",
      tests: [
        {
          testName: "d",
          status: "Pending",
          attachmentURL: "",
          _id: "67d72038b25aa4663f414304",
          addedAt: "2025-03-16T19:02:16.039Z",
        },
      ],
      note: "d",
    },
    revisitTimeFrame: "Monthly",
    uploadedAt: "2025-03-16T19:02:16.047Z",
    reviewInfo: [],
  },
  {
    _id: "67d7214b8ab961e6d2836699",
    imageUrl:
      "https://retinova.s3.amazonaws.com/diagnosis_images/afec4223-3fbe-42cc-9d60-e84f878dfe92_P2_left_20251008.png",
    diagnosis: "PDR",
    doctorDiagnosis: "N/A",
    eye: "LEFT",
    status: "Checked",
    confidenceScores: [0.5779826641082764],
    recommend: {
      medicine: "ok",
      tests: [
        {
          testName: "s",
          status: "Pending",
          attachmentURL: "",
          _id: "67d7214b8ab961e6d283669a",
          addedAt: "2025-03-16T19:06:51.689Z",
        },
      ],
      note: "",
    },
    revisitTimeFrame: "Monthly",
    uploadedAt: "2025-03-16T19:06:51.691Z",
    reviewInfo: [],
  },
  {
    _id: "67d7214b8ab961e6d2836700",
    imageUrl:
      "https://retinova.s3.amazonaws.com/diagnosis_images/afec4223-3fbe-42cc-9d60-e84f878dfe92_P2_right_20251008.png",
    diagnosis: "NPDR",
    doctorDiagnosis: "N/A",
    eye: "RIGHT",
    status: "Checked",
    confidenceScores: [0.6779826641082764],
    recommend: {
      medicine: "Eye drops",
      tests: [],
      note: "Mild non-proliferative diabetic retinopathy detected.",
    },
    revisitTimeFrame: "Quarterly",
    uploadedAt: "2025-03-10T15:06:51.691Z",
    reviewInfo: [],
  },
];

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export default function DiagnosisHistoryScreen() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | "LEFT" | "RIGHT">(
    "All"
  );

  useEffect(() => {
    loadDiagnoses();
  }, []);

  const loadDiagnoses = () => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      setDiagnoses(sampleDiagnoses);
      setLoading(false);
    }, 1000);

    // In a real app you'd do something like:
    // async function fetchDiagnoses() {
    //   try {
    //     const response = await fetch('your-api-endpoint/diagnoses');
    //     const data = await response.json();
    //     setDiagnoses(data);
    //   } catch (error) {
    //     console.error('Error fetching diagnoses data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchDiagnoses();
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Reload diagnoses
    setTimeout(() => {
      loadDiagnoses();
      setRefreshing(false);
    }, 1000);
  };

  const filteredDiagnoses = () => {
    if (activeFilter === "All") return diagnoses;
    return diagnoses.filter((diagnosis) => diagnosis.eye === activeFilter);
  };

  // Get severity based on diagnosis type
  const getSeverity = (diagnosisType: string) => {
    const severityMap: { [key: string]: "Low" | "Medium" | "High" } = {
      PDR: "High",
      NPDR: "Medium",
      DME: "Medium",
      Normal: "Low",
    };
    return severityMap[diagnosisType] || "Medium";
  };

  // Get color classes based on severity
  const getSeverityColor = (severity: "Low" | "Medium" | "High") => {
    switch (severity) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-xl font-bold text-gray-800">
          Diagnosis History
        </Text>
      </View>

      {/* Filter tabs */}
      <View className="flex-row px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          className={`mr-4 py-1 px-3 rounded-full ${
            activeFilter === "All" ? "bg-blue-100" : "bg-transparent"
          }`}
          onPress={() => setActiveFilter("All")}
        >
          <Text
            className={`${
              activeFilter === "All"
                ? "text-blue-700 font-medium"
                : "text-gray-600"
            }`}
          >
            All Eyes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-4 py-1 px-3 rounded-full ${
            activeFilter === "LEFT" ? "bg-blue-100" : "bg-transparent"
          }`}
          onPress={() => setActiveFilter("LEFT")}
        >
          <Text
            className={`${
              activeFilter === "LEFT"
                ? "text-blue-700 font-medium"
                : "text-gray-600"
            }`}
          >
            Left Eye
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-1 px-3 rounded-full ${
            activeFilter === "RIGHT" ? "bg-blue-100" : "bg-transparent"
          }`}
          onPress={() => setActiveFilter("RIGHT")}
        >
          <Text
            className={`${
              activeFilter === "RIGHT"
                ? "text-blue-700 font-medium"
                : "text-gray-600"
            }`}
          >
            Right Eye
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredDiagnoses().length === 0 ? (
            <View className="flex-1 justify-center items-center p-8">
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={64}
                color="#CBD5E1"
              />
              <Text className="text-lg font-medium text-gray-700 mt-4 mb-2">
                No Diagnoses Found
              </Text>
              <Text className="text-gray-500 text-center">
                {activeFilter === "All"
                  ? "You don't have any diagnoses yet."
                  : `You don't have any diagnoses for your ${activeFilter.toLowerCase()} eye.`}
              </Text>
            </View>
          ) : (
            <View className="p-4">
              {filteredDiagnoses().map((diagnosis) => {
                const severity = getSeverity(diagnosis.diagnosis);
                const severityColor = getSeverityColor(severity);

                return (
                  <Link
                    key={diagnosis._id}
                    href={`/diagnosis/${diagnosis._id}`}
                    asChild
                  >
                    <TouchableOpacity className="bg-white rounded-xl mb-3 shadow-sm overflow-hidden">
                      {/* Preview image */}
                      <Image
                        source={{ uri: diagnosis.imageUrl }}
                        className="w-full h-32"
                        resizeMode="cover"
                      />

                      {/* Diagnosis info */}
                      <View className="p-4">
                        <View className="flex-row justify-between items-center mb-2">
                          <View className="flex-row items-center">
                            <Text className="text-gray-800 font-semibold mr-2">
                              {diagnosis.diagnosis}
                            </Text>
                            <View
                              className={`px-2 py-1 rounded ${severityColor}`}
                            >
                              <Text
                                className={`text-xs font-medium ${
                                  severityColor.split(" ")[1]
                                }`}
                              >
                                {severity}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-gray-500 text-xs">
                            {formatDate(diagnosis.uploadedAt)}
                          </Text>
                        </View>

                        <Text className="text-gray-700 mb-2">
                          {diagnosis.eye} Eye
                        </Text>

                        {diagnosis.recommend.note ? (
                          <Text
                            className="text-gray-600 text-sm mb-3"
                            numberOfLines={2}
                          >
                            {diagnosis.recommend.note}
                          </Text>
                        ) : null}

                        <View className="flex-row justify-between items-center">
                          <View className="flex-row items-center">
                            {diagnosis.recommend.tests.length > 0 && (
                              <View className="flex-row items-center mr-4">
                                <Ionicons
                                  name="medical-outline"
                                  size={14}
                                  color="#6B7280"
                                />
                                <Text className="text-gray-500 text-xs ml-1">
                                  {diagnosis.recommend.tests.length} Tests
                                </Text>
                              </View>
                            )}

                            <View className="flex-row items-center">
                              <Ionicons
                                name="time-outline"
                                size={14}
                                color="#6B7280"
                              />
                              <Text className="text-gray-500 text-xs ml-1">
                                {diagnosis.revisitTimeFrame}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center">
                            <Text className="text-blue-600 text-xs mr-1">
                              View Details
                            </Text>
                            <Ionicons
                              name="chevron-forward"
                              size={14}
                              color="#3B82F6"
                            />
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Link>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
