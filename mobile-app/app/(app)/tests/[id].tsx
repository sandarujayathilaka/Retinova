import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  Linking,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, router, Link } from "expo-router";

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
  description?: string;
  results?: {
    date?: string;
    doctor?: string;
    findings?: string;
    recommendations?: string;
    attachments?: {
      url: string;
      type: string;
      name: string;
    }[];
  };
}

// Sample test data with more details
const sampleTestDetails: Test = {
  _id: "67d71ac3ebc0d8488ede7e18",
  testName: "AWS - Advanced Ophthalmic Screening",
  status: "Reviewed",
  attachmentURL:
    "https://patient-test-record-attachments.s3.ap-south-1.amazonaws.com/84ca92e0-d877-43d7-9871-9a1be0159c01-Rubric-PP-2.pdf",
  addedAt: "2025-03-16T18:38:59.210Z",
  diagnosisId: "67d71ac3ebc0d8488ede7e17",
  eyeSide: "LEFT",
  diagnosisType: "PDR",
  description:
    "Advanced Ophthalmic Screening evaluates the entire eye structure including the retina, cornea, optic nerve, and intraocular pressure. This comprehensive exam helps detect early signs of diabetic retinopathy and other eye conditions.",
  results: {
    date: "2025-03-18T14:30:00.000Z",
    doctor: "Dr. Sarah Johnson",
    findings:
      "The test detected moderate vascular abnormalities consistent with proliferative diabetic retinopathy. Early signs of neovascularization are present, requiring close monitoring and possible treatment in the near future.",
    recommendations:
      "Continue current medication. Schedule a follow-up exam in 1 month. Maintain strict blood sugar control to slow progression.",
    attachments: [
      {
        url: "https://patient-test-record-attachments.s3.ap-south-1.amazonaws.com/84ca92e0-d877-43d7-9871-9a1be0159c01-Rubric-PP-2.pdf",
        type: "pdf",
        name: "Detailed AWS Report",
      },
      {
        url: "https://patient-test-record-attachments.s3.ap-south-1.amazonaws.com/cff6dd95-2d45-4dad-809e-3074683510e6-WhatsApp%20Image%202025-03-05%20at%2010.18.32.jpeg",
        type: "image",
        name: "Retinal Scan",
      },
    ],
  },
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
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

// Status mapping for more descriptive status text
const statusDescriptions = {
  Pending: "This test has been requested but hasn't been scheduled yet.",
  "In Progress": "This test has been scheduled and is awaiting completion.",
  Completed:
    "Test has been completed and results are being reviewed by your doctor.",
  Reviewed: "Your doctor has reviewed the results and provided feedback.",
};

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [activeImageUrl, setActiveImageUrl] = useState("");

  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      setTest(sampleTestDetails);
      setLoading(false);
    }, 1000);

    // In a real app you'd do something like:
    // async function fetchTestData() {
    //   try {
    //     const response = await fetch(`your-api-endpoint/tests/${id}`);
    //     const data = await response.json();
    //     setTest(data);
    //   } catch (error) {
    //     console.error('Error fetching test data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchTestData();
  }, [id]);

  const openAttachment = (url: string, type: string) => {
    if (type === "image") {
      setActiveImageUrl(url);
      setImageViewerVisible(true);
    } else {
      // Open PDFs and other files
      Linking.openURL(url).catch((err) =>
        console.error("Error opening attachment:", err)
      );
    }
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

  // Get appropriate icon for the test type
  const getTestIconName = (testName: string) => {
    if (testName.includes("Field")) {
      return "eye";
    } else if (testName.includes("Pressure")) {
      return "gauge";
    } else if (testName.includes("AWS") || testName.includes("Screening")) {
      return "microscope";
    } else if (testName.includes("Aqueous") || testName.includes("AQW")) {
      return "test-tube";
    } else {
      return "clipboard-list";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!test) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-800 mb-2">Test Not Found</Text>
        <Text className="text-gray-600 text-center mb-4">
          The test you're looking for could not be found or may have been
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

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity className="mr-4" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4b5563" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Test Details</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Test Header Card */}
        <View className="bg-white rounded-xl p-5 mb-5 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
              <FontAwesome5
                name={getTestIconName(test.testName)}
                size={20}
                color="#3b82f6"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-800">
                {test.testName}
              </Text>
              <Text className="text-gray-500">
                {test.eyeSide} Eye • {test.diagnosisType}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
            <View>
              <Text className="text-gray-500 text-xs">Test Date</Text>
              <Text className="text-gray-800">{formatDate(test.addedAt)}</Text>
            </View>
            <View
              className={`px-3 py-1 rounded ${getStatusColor(test.status)}`}
            >
              <Text
                className={`font-medium ${
                  getStatusColor(test.status).split(" ")[1]
                }`}
              >
                {test.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Test Description */}
        <View className="bg-white rounded-xl p-5 mb-5 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            About This Test
          </Text>
          <Text className="text-gray-700 leading-5">
            {test.description || "No description available for this test."}
          </Text>
        </View>

        {/* Status Information */}
        <View className="bg-white rounded-xl p-5 mb-5 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Status Information
          </Text>

          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-gray-700">
              {statusDescriptions[test.status] ||
                "Status information unavailable."}
            </Text>
          </View>

          {test.status === "Pending" && (
            <TouchableOpacity
              className="mt-4 bg-blue-500 py-3 rounded-lg items-center"
              onPress={() => {
                /* Schedule test */
              }}
            >
              <Text className="text-white font-semibold">
                Schedule This Test
              </Text>
            </TouchableOpacity>
          )}

          {test.status === "In Progress" && (
            <View className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                <Text className="ml-2 text-yellow-700 font-medium">
                  Upcoming Appointment
                </Text>
              </View>
              <Text className="text-gray-700">
                Your test is scheduled for Friday, March 22 at 2:30 PM with Dr.
                Miller.
              </Text>
              <View className="flex-row mt-3">
                <TouchableOpacity
                  className="bg-white border border-yellow-500 py-2 px-3 rounded mr-3"
                  onPress={() => {
                    /* View details */
                  }}
                >
                  <Text className="text-yellow-600">View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-white border border-red-500 py-2 px-3 rounded"
                  onPress={() => {
                    /* Reschedule */
                  }}
                >
                  <Text className="text-red-600">Reschedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Test Results Section */}
        {(test.status === "Completed" || test.status === "Reviewed") &&
          test.results && (
            <View className="bg-white rounded-xl p-5 mb-5 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Test Results
              </Text>

              <View className="mb-4">
                <Text className="text-gray-500 text-xs mb-1">
                  Examination Date
                </Text>
                <Text className="text-gray-800">
                  {test.results.date
                    ? formatDate(test.results.date)
                    : "Not available"}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-gray-500 text-xs mb-1">
                  Examining Doctor
                </Text>
                <Text className="text-gray-800">
                  {test.results.doctor || "Not specified"}
                </Text>
              </View>

              {test.results.findings && (
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs mb-1">Findings</Text>
                  <Text className="text-gray-800 leading-5">
                    {test.results.findings}
                  </Text>
                </View>
              )}

              {test.results.recommendations && (
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs mb-1">
                    Recommendations
                  </Text>
                  <Text className="text-gray-800 leading-5">
                    {test.results.recommendations}
                  </Text>
                </View>
              )}

              {/* Attachments */}
              {test.results.attachments &&
                test.results.attachments.length > 0 && (
                  <View className="mt-2">
                    <Text className="text-gray-500 text-xs mb-2">
                      Attachments
                    </Text>

                    {test.results.attachments.map((attachment, index) => (
                      <TouchableOpacity
                        key={index}
                        className="flex-row items-center bg-gray-50 p-3 rounded-lg mb-2"
                        onPress={() =>
                          openAttachment(attachment.url, attachment.type)
                        }
                      >
                        <View className="w-8 h-8 rounded bg-blue-100 items-center justify-center mr-3">
                          <FontAwesome5
                            name={
                              attachment.type === "pdf"
                                ? "file-pdf"
                                : "file-image"
                            }
                            size={16}
                            color={
                              attachment.type === "pdf" ? "#f87171" : "#60a5fa"
                            }
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-800 font-medium">
                            {attachment.name}
                          </Text>
                          <Text className="text-gray-500 text-xs">
                            {attachment.type.toUpperCase()} • Tap to view
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              {/* View Original PDF button */}
              {test.attachmentURL && (
                <TouchableOpacity
                  className="mt-4 flex-row items-center justify-center bg-gray-100 py-3 rounded-lg"
                  onPress={() => Linking.openURL(test.attachmentURL)}
                >
                  <FontAwesome5 name="file-pdf" size={16} color="#f87171" />
                  <Text className="ml-2 text-gray-700 font-medium">
                    View Original Report
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        {/* Related Diagnosis */}
        <View className="bg-white rounded-xl p-5 mb-5 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Related Diagnosis
          </Text>

          <TouchableOpacity
            className="flex-row items-center border border-gray-200 rounded-lg p-4"
            onPress={() => router.push(`/diagnosis/${test.diagnosisId}`)}
          >
            <MaterialCommunityIcons
              name="eye-check-outline"
              size={24}
              color="#3b82f6"
            />
            <View className="flex-1 ml-3">
              <Text className="text-gray-800 font-medium">
                {test.diagnosisType} - {test.eyeSide} Eye
              </Text>
              <Text className="text-gray-500 text-xs">
                View the full diagnosis that prompted this test
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-10">
          <TouchableOpacity
            className="bg-white border border-blue-500 rounded-xl py-3 px-5 flex-1 mr-2 items-center"
            onPress={() => {
              /* Share results */
            }}
          >
            <Text className="text-blue-500 font-semibold">Share Results</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-3 px-5 flex-1 ml-2 items-center"
            onPress={() => {
              /* Message doctor */
            }}
          >
            <Text className="text-white font-semibold">Message Doctor</Text>
          </TouchableOpacity>
        </View>

        {/* Image viewer modal would go here in a real app */}
      </ScrollView>
    </SafeAreaView>
  );
}
