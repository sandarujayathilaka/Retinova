import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { Link } from "expo-router";

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

interface PatientData {
  _id: string;
  patientId: string;
  fullName: string;
  category: string[];
  birthDate: string;
  gender: "Male" | "Female" | "Other";
  nic: string;
  contactNumber: string;
  email: string;
  patientStatus: string;
  nextVisit: string;
  diagnoseHistory: Diagnosis[];
}

// Sample data - in a real app you would fetch this from an API
const samplePatient: PatientData = {
  _id: "67d7150cf61eb9b9649e7d9a",
  patientId: "P2",
  fullName: "John",
  category: [],
  birthDate: "2025-03-05T00:00:00.000Z",
  gender: "Male",
  nic: "2345677654345",
  contactNumber: "0772321233",
  email: "em@gmail.com",
  patientStatus: "Completed",
  nextVisit: "2025-04-04T00:00:00.000Z",
  diagnoseHistory: [
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
        note: "",
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
        {
          recommendedMedicine: "",
          notes: "ok",
          updatedAt: "2025-03-16T18:52:28.814Z",
          _id: "67d71decb25aa4663f414291",
        },
      ],
    },
  ],
};

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
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

// Helper Components
const QuickActionButton = ({
  icon,
  iconProvider,
  title,
  color,
  onPress,
}: {
  icon: string;
  iconProvider: any;
  title: string;
  color: string;
  onPress?: () => void;
}) => {
  const IconProvider = iconProvider;
  return (
    <TouchableOpacity className="items-center" onPress={onPress}>
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mb-1"
        style={{ backgroundColor: `${color}20` }}
      >
        <IconProvider name={icon} size={24} color={color} />
      </View>
      <Text className="text-gray-700 text-xs">{title}</Text>
    </TouchableOpacity>
  );
};

const DiagnosisCard = ({ diagnosis }: { diagnosis: Diagnosis }) => {
  // Map diagnosis types to severity levels
  const getSeverity = (diagnosisType: string) => {
    const severityMap: { [key: string]: "Low" | "Medium" | "High" } = {
      PDR: "High",
      NPDR: "Medium",
      DME: "Medium",
      Normal: "Low",
    };
    return severityMap[diagnosisType] || "Medium";
  };

  const severity = getSeverity(diagnosis.diagnosis);

  const severityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  };

  return (
    <View className="bg-white p-4 rounded-xl shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-800 font-semibold text-base">
          {diagnosis.diagnosis} - {diagnosis.eye} Eye
        </Text>
        <Text className="text-gray-500 text-xs">
          {new Date(diagnosis.uploadedAt).toLocaleDateString()}
        </Text>
      </View>

      {diagnosis.recommend.note ? (
        <Text className="text-gray-600 mb-3">{diagnosis.recommend.note}</Text>
      ) : (
        <Text className="text-gray-600 mb-3">
          AI-assisted diagnosis completed.{" "}
          {diagnosis.recommend.tests.length > 0
            ? `${diagnosis.recommend.tests.length} follow-up tests recommended.`
            : "No additional tests recommended at this time."}
        </Text>
      )}

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-gray-600 mr-2">Status:</Text>
          <View className={`px-2 py-1 rounded ${severityColors[severity]}`}>
            <Text
              className={`text-xs font-medium ${
                severityColors[severity].split(" ")[1]
              }`}
            >
              {severity}
            </Text>
          </View>
        </View>
        <Link href={`/diagnosis/${diagnosis._id}`} asChild>
          <TouchableOpacity className="px-3 py-1 bg-blue-50 rounded">
            <Text className="text-blue-500 font-medium">View Details</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const TipCard = ({
  image,
  title,
  description,
}: {
  image: any;
  title: string;
  description: string;
}) => {
  return (
    <TouchableOpacity
      className="bg-white mr-3 rounded-xl overflow-hidden shadow-sm"
      style={{ width: 200 }}
    >
      <Image source={image} className="w-full h-24" />
      <View className="p-3">
        <Text className="text-gray-800 font-medium mb-1">{title}</Text>
        <Text className="text-gray-600 text-xs" numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  // In a real app, you would fetch data here
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setPatient(samplePatient);
      setLoading(false);
    }, 1000);

    // In a real app you'd do something like:
    // async function fetchPatientData() {
    //   try {
    //     const response = await fetch('your-api-endpoint');
    //     const data = await response.json();
    //     setPatient(data);
    //   } catch (error) {
    //     console.error('Error fetching patient data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchPatientData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No patient data found</Text>
      </View>
    );
  }

  // Get the latest diagnosis
  const latestDiagnosis =
    patient.diagnoseHistory.length > 0 ? patient.diagnoseHistory[0] : null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="eye-check-outline"
            size={28}
            color="#3b82f6"
          />
          <Text className="text-xl font-bold ml-2 text-gray-800">
            EyeDiagnosis
          </Text>
        </View>
        <TouchableOpacity className="p-2 bg-blue-50 rounded-full">
          <Ionicons name="notifications-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Welcome Section */}
        <View className="bg-blue-500 p-5 rounded-2xl mb-6">
          <Text className="text-white text-lg font-semibold mb-1">
            Hello {patient.fullName},
          </Text>
          <Text className="text-white text-opacity-90 mb-4">
            Your next visit is scheduled for:
          </Text>
          <View className="bg-white bg-opacity-20 p-4 rounded-xl flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={24} color="white" />
              <View className="ml-3">
                <Text className="text-white font-bold">
                  {formatDate(patient.nextVisit)}
                </Text>
                <Text className="text-white text-opacity-90">
                  {formatTime(patient.nextVisit)}
                </Text>
              </View>
            </View>
            <Link href="/appointments" asChild>
              <TouchableOpacity className="bg-white px-3 py-2 rounded-lg">
                <Text className="text-blue-500 font-semibold">View</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-gray-700 font-semibold text-lg mb-3">
          Quick Actions
        </Text>
        <View className="flex-row justify-between mb-6">
          <QuickActionButton
            icon="file-medical"
            iconProvider={FontAwesome5}
            title="My Records"
            color="#4ade80"
            onPress={() => {
              /* Navigate to records */
            }}
          />
          <QuickActionButton
            icon="eye"
            iconProvider={Ionicons}
            title="Self Test"
            color="#f472b6"
            onPress={() => {
              /* Navigate to self test */
            }}
          />
          <QuickActionButton
            icon="calendar-plus"
            iconProvider={FontAwesome5}
            title="Book Appt"
            color="#60a5fa"
            onPress={() => {
              /* Navigate to appointment booking */
            }}
          />
          <QuickActionButton
            icon="chatbubble"
            iconProvider={Ionicons}
            title="Message"
            color="#fbbf24"
            onPress={() => {
              /* Navigate to messaging */
            }}
          />
        </View>

        {/* Eye Status */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-700 font-semibold text-lg">
              Eye Status
            </Text>
            <Link href="/tests" asChild>
              <TouchableOpacity>
                <Text className="text-blue-500">See All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-800 font-medium">Left Eye (OS)</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-600 mr-2">Status:</Text>
                <Text className="text-blue-500 font-bold">
                  {patient.diagnoseHistory.find((d) => d.eye === "LEFT")
                    ?.diagnosis || "Not tested"}
                </Text>
              </View>
            </View>
            <View className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: "70%" }}
              />
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-800 font-medium">Right Eye (OD)</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-600 mr-2">Status:</Text>
                <Text className="text-blue-500 font-bold">
                  {patient.diagnoseHistory.find((d) => d.eye === "RIGHT")
                    ?.diagnosis || "Not tested"}
                </Text>
              </View>
            </View>
            <View className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: "85%" }}
              />
            </View>
          </View>
        </View>

        {/* Recent Diagnosis */}
        {latestDiagnosis && (
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold text-lg mb-3">
              Recent Diagnosis
            </Text>
            <DiagnosisCard diagnosis={latestDiagnosis} />
          </View>
        )}

        {/* Recommended Tests */}
        {latestDiagnosis && latestDiagnosis.recommend.tests.length > 0 && (
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold text-lg mb-3">
              Recommended Tests
            </Text>
            <View className="bg-white p-4 rounded-xl shadow-sm">
              {latestDiagnosis.recommend.tests.map((test, index) => (
                <View
                  key={test._id}
                  className={`flex-row justify-between items-center ${
                    index < latestDiagnosis.recommend.tests.length - 1
                      ? "border-b border-gray-100 pb-3 mb-3"
                      : ""
                  }`}
                >
                  <View>
                    <Text className="text-gray-800 font-medium">
                      {test.testName}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {new Date(test.addedAt).toLocaleDateString()}
                    </Text>
                  </View>
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
              ))}
            </View>
          </View>
        )}

        {/* Eye Care Tips */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold text-lg mb-3">
            Eye Care Tips
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          >
            <TipCard
              image={require("@/assets/images/icon.png")}
              title="20-20-20 Rule"
              description="Every 20 minutes, look at something 20 feet away for 20 seconds."
            />
            <TipCard
              image={require("@/assets/images/icon.png")}
              title="Proper Lighting"
              description="Ensure adequate lighting when reading to reduce eye strain."
            />
            <TipCard
              image={require("@/assets/images/icon.png")}
              title="Healthy Diet"
              description="Foods rich in vitamins A, C, and E promote eye health."
            />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
