import React, { useState } from "react";
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
import { useGetDiagnoses } from "../../../services/diagnosis.service";

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
    month: "short",
    day: "numeric",
  }).format(date);
};

export default function DiagnosisHistoryScreen() {
  const patientId = "P1"; // Replace with dynamic patient ID from auth context

  const { data: diagnoses = [], isLoading, isError, error, refetch } = useGetDiagnoses(patientId) as {
    data: Diagnosis[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
  console.log(diagnoses);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | "LEFT" | "RIGHT">("All");

  const onRefresh = () => {
    setRefreshing(true);
    Promise.resolve(refetch()).finally(() => setRefreshing(false));
  };

  const filteredDiagnoses = () => {
    if (activeFilter === "All") return diagnoses || [];
    return (diagnoses || []).filter((diagnosis: Diagnosis) => diagnosis.eye === activeFilter);
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

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error: {error?.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-xl font-bold text-gray-800">Diagnosis History</Text>
      </View>

      {/* Filter tabs */}
      <View className="flex-row px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          className={`mr-4 py-1 px-3 rounded-full ${activeFilter === "All" ? "bg-blue-100" : "bg-transparent"}`}
          onPress={() => setActiveFilter("All")}
        >
          <Text className={`${activeFilter === "All" ? "text-blue-700 font-medium" : "text-gray-600"}`}>
            All Eyes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-4 py-1 px-3 rounded-full ${activeFilter === "LEFT" ? "bg-blue-100" : "bg-transparent"}`}
          onPress={() => setActiveFilter("LEFT")}
        >
          <Text className={`${activeFilter === "LEFT" ? "text-blue-700 font-medium" : "text-gray-600"}`}>
            Left Eye
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-1 px-3 rounded-full ${activeFilter === "RIGHT" ? "bg-blue-100" : "bg-transparent"}`}
          onPress={() => setActiveFilter("RIGHT")}
        >
          <Text className={`${activeFilter === "RIGHT" ? "text-blue-700 font-medium" : "text-gray-600"}`}>
            Right Eye
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredDiagnoses().length === 0 ? (
          <View className="flex-1 justify-center items-center p-8">
            <MaterialCommunityIcons name="eye-off-outline" size={64} color="#CBD5E1" />
            <Text className="text-lg font-medium text-gray-700 mt-4 mb-2">No Diagnoses Found</Text>
            <Text className="text-gray-500 text-center">
              {activeFilter === "All"
                ? "You don't have any diagnoses yet."
                : `You don't have any diagnoses for your ${activeFilter.toLowerCase()} eye.`}
            </Text>
          </View>
        ) : (
          <View className="p-4">
            {filteredDiagnoses().map((diagnosis: Diagnosis) => {
              const severity = getSeverity(diagnosis.diagnosis);
              const severityColor = getSeverityColor(severity);

              return (
                <Link key={diagnosis._id} href={`/diagnosis/${diagnosis._id}`} asChild>
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
                          <Text className="text-gray-800 font-semibold mr-2">{diagnosis.diagnosis}</Text>
                          <View className={`px-2 py-1 rounded ${severityColor}`}>
                            <Text className={`text-xs font-medium ${severityColor.split(" ")[1]}`}>{severity}</Text>
                          </View>
                        </View>
                        <Text className="text-gray-500 text-xs">{formatDate(diagnosis.uploadedAt)}</Text>
                      </View>

                      <Text className="text-gray-700 mb-2">{diagnosis.eye} Eye</Text>

                      {diagnosis.recommend.note ? (
                        <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                          {diagnosis.recommend.note}
                        </Text>
                      ) : null}

                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          {diagnosis.recommend.tests.length > 0 && (
                            <View className="flex-row items-center mr-4">
                              <Ionicons name="medical-outline" size={14} color="#6B7280" />
                              <Text className="text-gray-500 text-xs ml-1">{diagnosis.recommend.tests.length} Tests</Text>
                            </View>
                          )}

                          <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                            <Text className="text-gray-500 text-xs ml-1">{diagnosis.revisitTimeFrame}</Text>
                          </View>
                        </View>

                        <View className="flex-row items-center">
                          <Text className="text-blue-600 text-xs mr-1">View Details</Text>
                          <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
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
    </SafeAreaView>
  );
}