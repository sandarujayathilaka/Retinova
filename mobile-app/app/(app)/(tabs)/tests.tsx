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
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Link } from "expo-router";

// Define interfaces for our test data model
interface Test {
  _id: string;
  testName: string;
  status: "Pending" | "In Progress" | "Completed" | "Reviewed";
  attachmentURL: string;
  addedAt: string;
  diagnosisId: string;
  eyeSide: "LEFT" | "RIGHT";
  diagnosisType: string;
}

// Sample data
const sampleTests: Test[] = [
  {
    _id: "67d71ac3ebc0d8488ede7e18",
    testName: "AWS - Advanced Ophthalmic Screening",
    status: "Reviewed",
    attachmentURL:
      "https://patient-test-record-attachments.s3.ap-south-1.amazonaws.com/84ca92e0-d877-43d7-9871-9a1be0159c01-Rubric-PP-2.pdf",
    addedAt: "2025-03-16T18:38:59.210Z",
    diagnosisId: "67d71ac3ebc0d8488ede7e17",
    eyeSide: "LEFT",
    diagnosisType: "PDR",
  },
  {
    _id: "67d71d66b25aa4663f414278",
    testName: "AQW - Aqueous Fluid Analysis",
    status: "Reviewed",
    attachmentURL:
      "https://patient-test-record-attachments.s3.ap-south-1.amazonaws.com/cff6dd95-2d45-4dad-809e-3074683510e6-WhatsApp%20Image%202025-03-05%20at%2010.18.32.jpeg",
    addedAt: "2025-03-16T18:50:14.461Z",
    diagnosisId: "67d71ac3ebc0d8488ede7e17",
    eyeSide: "LEFT",
    diagnosisType: "PDR",
  },
  {
    _id: "67d72038b25aa4663f414304",
    testName: "Visual Field Test",
    status: "Pending",
    attachmentURL: "",
    addedAt: "2025-03-16T19:02:16.039Z",
    diagnosisId: "67d72038b25aa4663f414303",
    eyeSide: "LEFT",
    diagnosisType: "PDR",
  },
  {
    _id: "67d7214b8ab961e6d283669a",
    testName: "Intraocular Pressure Test",
    status: "In Progress",
    attachmentURL: "",
    addedAt: "2025-03-16T19:06:51.689Z",
    diagnosisId: "67d7214b8ab961e6d2836699",
    eyeSide: "RIGHT",
    diagnosisType: "NPDR",
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

export default function TestsScreen() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Pending" | "Completed"
  >("All");

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = () => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      setTests(sampleTests);
      setLoading(false);
    }, 1000);

    // In a real app you'd do something like:
    // async function fetchTests() {
    //   try {
    //     const response = await fetch('your-api-endpoint/tests');
    //     const data = await response.json();
    //     setTests(data);
    //   } catch (error) {
    //     console.error('Error fetching tests data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchTests();
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Reload tests
    setTimeout(() => {
      loadTests();
      setRefreshing(false);
    }, 1000);
  };

  const filteredTests = () => {
    if (activeFilter === "All") return tests;
    if (activeFilter === "Pending")
      return tests.filter(
        (test) => test.status === "Pending" || test.status === "In Progress"
      );
    return tests.filter(
      (test) => test.status === "Completed" || test.status === "Reviewed"
    );
  };

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reviewed":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get icon for test result
  const getTestIcon = (testName: string, status: string) => {
    if (status === "Pending" || status === "In Progress") {
      return <FontAwesome5 name="clock" size={18} color="#9CA3AF" />;
    }

    if (testName.includes("Field")) {
      return <Ionicons name="eye-outline" size={20} color="#3B82F6" />;
    } else if (testName.includes("Pressure")) {
      return <FontAwesome5 name="tachometer-alt" size={18} color="#3B82F6" />;
    } else if (testName.includes("AWS") || testName.includes("Screening")) {
      return <FontAwesome5 name="chart-line" size={18} color="#3B82F6" />;
    } else if (testName.includes("Aqueous") || testName.includes("AQW")) {
      return <FontAwesome5 name="vial" size={18} color="#3B82F6" />;
    } else {
      return (
        <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-xl font-bold text-gray-800">My Tests</Text>
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
            All Tests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-4 py-1 px-3 rounded-full ${
            activeFilter === "Pending" ? "bg-blue-100" : "bg-transparent"
          }`}
          onPress={() => setActiveFilter("Pending")}
        >
          <Text
            className={`${
              activeFilter === "Pending"
                ? "text-blue-700 font-medium"
                : "text-gray-600"
            }`}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-1 px-3 rounded-full ${
            activeFilter === "Completed" ? "bg-blue-100" : "bg-transparent"
          }`}
          onPress={() => setActiveFilter("Completed")}
        >
          <Text
            className={`${
              activeFilter === "Completed"
                ? "text-blue-700 font-medium"
                : "text-gray-600"
            }`}
          >
            Completed
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
          {filteredTests().length === 0 ? (
            <View className="flex-1 justify-center items-center p-8">
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#CBD5E1"
              />
              <Text className="text-lg font-medium text-gray-700 mt-4 mb-2">
                No Tests Found
              </Text>
              <Text className="text-gray-500 text-center">
                {activeFilter === "All"
                  ? "You don't have any tests yet."
                  : `You don't have any ${activeFilter.toLowerCase()} tests.`}
              </Text>
            </View>
          ) : (
            <View className="p-4">
              {filteredTests().map((test) => (
                <Link key={test._id} href={`/tests/${test._id}`} asChild>
                  <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center mr-3">
                        {getTestIcon(test.testName, test.status)}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-medium">
                          {test.testName}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {test.eyeSide} Eye • {test.diagnosisType}
                        </Text>
                      </View>
                      <View
                        className={`px-2 py-1 rounded ${getStatusColor(
                          test.status
                        )}`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            getStatusColor(test.status).split(" ")[1]
                          }`}
                        >
                          {test.status}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-500 text-xs">
                        Added on {formatDate(test.addedAt)}
                      </Text>
                      <View className="flex-row items-center">
                        {test.attachmentURL && (
                          <FontAwesome5
                            name="file-pdf"
                            size={12}
                            color="#f87171"
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text className="text-blue-600 text-xs">
                          {test.attachmentURL ? "View Results" : "Check Status"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
