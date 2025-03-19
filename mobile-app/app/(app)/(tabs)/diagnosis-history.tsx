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
import useAuthStore from "../../../stores/auth";

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

// Diagnosis severity mapping
const diagnosisSeverity: { [key: string]: "Low" | "Medium" | "High" } = {
  PDR: "High",
  NPDR: "Medium",
  NODR: "Low",
  "Early Glaucoma": "Medium",
  "Advanced Glaucoma": "High",
  "No Glaucoma": "Low",
  "Dry AMD": "Medium",
  "Wet AMD": "High",
  "Normal (No AMD)": "Low",
  CRVO: "High",
  BRVO: "Medium",
  "Healthy (No RVO)": "Low",
  DME: "Medium",
  Normal: "Low",
};

export default function DiagnosisHistoryScreen() {
  const { user } = useAuthStore(); 
  const patientId = user?.id?.toString() || "P2"; 

  const { data: diagnoses = [], isLoading, isError, error, refetch } = useGetDiagnoses(patientId) as {
    data: Diagnosis[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
  
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
    return diagnosisSeverity[diagnosisType] || "Medium"; // Default to Medium if not found
  };

  // Get color classes based on severity
  const getSeverityColor = (severity: "Low" | "Medium" | "High") => {
    switch (severity) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-amber-100 text-amber-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-sky-50">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-sky-50">
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-lg font-medium text-gray-700 mt-4 mb-2">Failed to Load Diagnoses</Text>
        <Text className="text-gray-500 text-center mb-4">
          {error?.message.includes("404")
            ? "No diagnoses found for this patient. Please check the patient ID or contact support."
            : "An error occurred while fetching diagnoses. Please try again later."}
        </Text>
        <TouchableOpacity
          className="bg-sky-500 px-6 py-3 rounded-lg shadow-sm"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f0f9ff" />

      {/* Header with subtle gradient */}
      <View className="bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-5">
        <Text className="text-xl font-bold text-white">Your Eye Health History</Text>
        <Text className="text-sky-100 text-sm mt-1">Track your eye condition progress over time</Text>
      </View>

      {/* Filter tabs */}
      <View className="flex-row px-4 py-4 bg-white shadow-sm">
        <TouchableOpacity
          className={`mr-3 py-2 px-4 rounded-full ${
            activeFilter === "All" ? "bg-sky-500" : "bg-sky-100"
          }`}
          onPress={() => setActiveFilter("All")}
        >
          <Text className={`${
            activeFilter === "All" ? "text-white font-medium" : "text-sky-600"
          }`}>
            All Eyes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-3 py-2 px-4 rounded-full ${
            activeFilter === "LEFT" ? "bg-sky-500" : "bg-sky-100"
          }`}
          onPress={() => setActiveFilter("LEFT")}
        >
          <Text className={`${
            activeFilter === "LEFT" ? "text-white font-medium" : "text-sky-600"
          }`}>
            Left Eye
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-2 px-4 rounded-full ${
            activeFilter === "RIGHT" ? "bg-sky-500" : "bg-sky-100"
          }`}
          onPress={() => setActiveFilter("RIGHT")}
        >
          <Text className={`${
            activeFilter === "RIGHT" ? "text-white font-medium" : "text-sky-600"
          }`}>
            Right Eye
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredDiagnoses().length === 0 ? (
          <View className="flex-1 justify-center items-center p-8 mt-12">
            <MaterialCommunityIcons name="eye-off-outline" size={70} color="#93c5fd" />
            <Text className="text-lg font-medium text-gray-700 mt-6 mb-2">No Diagnoses Found</Text>
            <Text className="text-gray-500 text-center">
              {activeFilter === "All"
                ? "You don't have any diagnoses yet."
                : `You don't have any diagnoses for your ${activeFilter.toLowerCase()} eye.`}
            </Text>
            <TouchableOpacity
              className="mt-6 bg-sky-500 px-6 py-3 rounded-lg shadow-sm"
              onPress={() => refetch()}
            >
              <Text className="text-white font-semibold">Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-4">
            {filteredDiagnoses().map((diagnosis: Diagnosis) => {
              const severity = getSeverity(diagnosis.diagnosis);
              const severityColor = getSeverityColor(severity);

              return (
                <Link key={diagnosis._id} href={`/diagnosis/${diagnosis._id}`} asChild>
                  <TouchableOpacity className="bg-white rounded-xl mb-4 shadow-md overflow-hidden border border-sky-100">
                    {/* Eye icon badge to indicate left/right */}
                    <View className="absolute top-3 right-3 z-10 bg-black bg-opacity-50 rounded-full p-2">
                      <Ionicons 
                        name={diagnosis.eye === "LEFT" ? "eye-outline" : "eye-outline"} 
                        size={16} 
                        color="#FFFFFF" 
                      />
                    </View>

                    {/* Preview image with gradient overlay */}
                    <View>
                      <Image
                        source={{ uri: diagnosis.imageUrl }}
                        className="w-full h-40"
                        resizeMode="cover"
                      />
                      <View className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent" />
                      <View className="absolute bottom-2 left-3">
                        <Text className="text-white font-bold">{diagnosis.eye} Eye</Text>
                      </View>
                    </View>

                    {/* Diagnosis info */}
                    <View className="p-4">
                      <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center">
                          <Text className="text-gray-800 font-bold text-lg mr-3">{diagnosis.diagnosis}</Text>
                          <View className={`px-3 py-1 rounded-full ${severityColor}`}>
                            <Text className={`text-xs font-medium ${severityColor.split(" ")[1]}`}>
                              {severity} Risk
                            </Text>
                          </View>
                        </View>
                        <View className="bg-sky-50 px-3 py-1 rounded-full">
                          <Text className="text-sky-600 text-xs font-medium">{formatDate(diagnosis.uploadedAt)}</Text>
                        </View>
                      </View>

                      {diagnosis.recommend.note ? (
                        <View className="mb-3 bg-sky-50 p-3 rounded-lg">
                          <Text className="text-gray-700 text-sm font-medium mb-1">Doctor's Note:</Text>
                          <Text className="text-gray-600 text-sm" numberOfLines={2}>
                            {diagnosis.recommend.note}
                          </Text>
                        </View>
                      ) : null}

                      <View className="flex-row justify-between items-center mt-2">
                        <View className="flex-row items-center">
                          {diagnosis.recommend.tests.length > 0 && (
                            <View className="flex-row items-center mr-4 bg-sky-100 px-2 py-1 rounded-full">
                              <Ionicons name="medical-outline" size={14} color="#0284c7" />
                              <Text className="text-sky-700 text-xs ml-1 font-medium">
                                {diagnosis.recommend.tests.length} Tests
                              </Text>
                            </View>
                          )}

                          <View className="flex-row items-center bg-sky-100 px-2 py-1 rounded-full">
                            <Ionicons name="time-outline" size={14} color="#0284c7" />
                            <Text className="text-sky-700 text-xs ml-1 font-medium">
                              {diagnosis.revisitTimeFrame}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center">
                          <Text className="text-sky-600 font-medium text-sm mr-1">View Details</Text>
                          <Ionicons name="chevron-forward" size={16} color="#0284c7" />
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