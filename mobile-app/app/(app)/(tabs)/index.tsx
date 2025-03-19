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
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { Link, router } from "expo-router";
import useAuthStore from "@/stores/auth";
import { api } from "@/services/api.service";

// Helper functions
const formatDate = (dateString: string | Date) => {
  if (!dateString) return "Not scheduled";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatTime = (dateString: string | Date) => {
  if (!dateString) return "";
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

const DiagnosisCard = ({ diagnosis }: { diagnosis: Diagnose }) => {
  // Map diagnosis types to severity levels
  const getSeverity = (diagnosisType: string | undefined) => {
    if (!diagnosisType) return "Low";

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
          {diagnosis.diagnosis || "Undiagnosed"} - {diagnosis.eye} Eye
        </Text>
        <Text className="text-gray-500 text-xs">
          {diagnosis.uploadedAt
            ? new Date(diagnosis.uploadedAt).toLocaleDateString()
            : "N/A"}
        </Text>
      </View>

      {diagnosis.recommend?.note ? (
        <Text className="text-gray-600 mb-3">{diagnosis.recommend.note}</Text>
      ) : (
        <Text className="text-gray-600 mb-3">
          AI-assisted diagnosis completed.{" "}
          {diagnosis.recommend?.tests && diagnosis.recommend.tests.length > 0
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
        <TouchableOpacity
          className="px-3 py-1 bg-blue-50 rounded"
          onPress={() =>
            router.push(
              `/diagnosis/${diagnosis.imageUrl.split("/").pop()?.split("_")[0]}`
            )
          }
        >
          <Text className="text-blue-500 font-medium">View Details</Text>
        </TouchableOpacity>
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
      <Image source={image} className="w-full h-24" resizeMode="cover" />
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { profile, refreshProfile, isLoggedIn } = useAuthStore();

  // useEffect(() => {
  //   async function loadProfileData() {
  //     if (!isLoggedIn()) {
  //       router.replace("/login");
  //       return;
  //     }

  //     try {
  //       setLoading(true);
  //       await refreshProfile();
  //       setLoading(false);
  //     } catch (err) {
  //       setError("Failed to load profile data. Please try again.");
  //       setLoading(false);
  //     }
  //   }

  //   loadProfileData();
  // }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading your profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 px-4">
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color="#ef4444"
        />
        <Text className="mt-4 text-gray-800 text-center font-semibold">
          {error || "No profile data found"}
        </Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => refreshProfile()}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get the latest diagnosis by uploadedAt date
  const latestDiagnosis =
    profile.diagnoseHistory && profile.diagnoseHistory.length > 0
      ? [...profile.diagnoseHistory].sort((a, b) => {
          const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          return dateB - dateA; // Sort in descending order (newest first)
        })[0]
      : null;

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
        <TouchableOpacity
          className="p-2 bg-blue-50 rounded-full"
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="notifications-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Welcome Section */}
        <View className="bg-blue-500 p-5 rounded-2xl mb-6">
          <Text className="text-white capitalize text-lg font-semibold mb-1">
            Hello {profile.fullName},
          </Text>
          <Text className="text-white text-opacity-90 mb-4">
            {profile.nextVisit
              ? "Your next visit is scheduled for:"
              : "No visit scheduled yet"}
          </Text>
          <View className="bg-white/20 p-4 rounded-xl flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={24} color="white" />
              <View className="ml-3">
                {profile.nextVisit ? (
                  <>
                    <Text className="text-white font-bold">
                      {formatDate(profile.nextVisit)}
                    </Text>
                    <Text className="text-white text-opacity-90">
                      {formatTime(profile.nextVisit)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-bold">No appointment</Text>
                    <Text className="text-white text-opacity-90">
                      Contact your doctor to schedule
                    </Text>
                  </>
                )}
              </View>
            </View>
            {!profile.nextVisit && (
              <TouchableOpacity
                className="bg-white px-3 py-2 rounded-lg"
                onPress={() => router.push("/appointment/new")}
              >
                <Text className="text-blue-500 font-semibold">Schedule</Text>
              </TouchableOpacity>
            )}
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
            onPress={() => router.push("/records")}
          />
          <QuickActionButton
            icon="eye"
            iconProvider={Ionicons}
            title="Self Test"
            color="#f472b6"
            onPress={() => router.push("/self-test")}
          />
          <QuickActionButton
            icon="calendar-plus"
            iconProvider={FontAwesome5}
            title="Book Appt"
            color="#60a5fa"
            onPress={() => router.push("/appointment/new")}
          />
          <QuickActionButton
            icon="chatbubble"
            iconProvider={Ionicons}
            title="Message"
            color="#fbbf24"
            onPress={() => router.push("/messages")}
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
            {/* Eyes Side by Side */}
            <View className="flex-row justify-between">
              {/* Left Eye */}
              <View className="flex-1 items-center mr-4">
                <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-2">
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={32}
                    color="#3b82f6"
                  />
                  <View className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full items-center justify-center">
                    <Text className="text-xs font-bold text-blue-500">L</Text>
                  </View>
                </View>
                <Text className="text-gray-800 font-medium text-center">
                  Left Eye (OS)
                </Text>
                <Text className="text-blue-500 font-bold text-center mt-1">
                  {profile.diagnoseHistory?.find((d) => d.eye === "LEFT")
                    ?.diagnosis || "Not tested"}
                </Text>
                {profile.diagnoseHistory?.find((d) => d.eye === "LEFT")
                  ?.uploadedAt && (
                  <Text className="text-xs text-gray-500 mt-1 text-center">
                    Last:{" "}
                    {formatDate(
                      profile.diagnoseHistory?.find((d) => d.eye === "LEFT")
                        ?.uploadedAt || ""
                    )}
                  </Text>
                )}
              </View>

              {/* Right Eye */}
              <View className="flex-1 items-center ml-4">
                <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-2">
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={32}
                    color="#3b82f6"
                  />
                  <View className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full items-center justify-center">
                    <Text className="text-xs font-bold text-blue-500">R</Text>
                  </View>
                </View>
                <Text className="text-gray-800 font-medium text-center">
                  Right Eye (OD)
                </Text>
                <Text className="text-blue-500 font-bold text-center mt-1">
                  {profile.diagnoseHistory?.find((d) => d.eye === "RIGHT")
                    ?.diagnosis || "Not tested"}
                </Text>
                {profile.diagnoseHistory?.find((d) => d.eye === "RIGHT")
                  ?.uploadedAt && (
                  <Text className="text-xs text-gray-500 mt-1 text-center">
                    Last:{" "}
                    {formatDate(
                      profile.diagnoseHistory?.find((d) => d.eye === "RIGHT")
                        ?.uploadedAt || ""
                    )}
                  </Text>
                )}
              </View>
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
        {latestDiagnosis &&
          latestDiagnosis.recommend?.tests &&
          latestDiagnosis.recommend.tests.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold text-lg mb-3">
                Recommended Tests
              </Text>
              <View className="bg-white p-4 rounded-xl shadow-sm">
                {latestDiagnosis.recommend.tests.map((test, index) => (
                  <View
                    key={index}
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
                        {test.addedAt
                          ? new Date(test.addedAt).toLocaleDateString()
                          : "N/A"}
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
                        {test.status || "Pending"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Medical Category Section */}
        {profile.category && profile.category.length > 0 && (
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold text-lg mb-3">
              Your Condition Categories
            </Text>
            <View className="bg-white p-4 rounded-xl shadow-sm">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {profile.category.map((category, index) => (
                  <View
                    key={index}
                    className="mr-2 bg-blue-100 px-3 py-1 rounded-lg"
                  >
                    <Text className="text-blue-800 font-medium">
                      {category}
                    </Text>
                  </View>
                ))}
              </ScrollView>
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
            {profile.category?.includes("DR") && (
              <TipCard
                image={require("@/assets/images/icon.png")}
                title="Diabetic Care"
                description="Regular blood sugar monitoring is crucial for diabetic retinopathy management."
              />
            )}
            {profile.category?.includes("Glaucoma") && (
              <TipCard
                image={require("@/assets/images/icon.png")}
                title="Glaucoma Tips"
                description="Take your eye drops as prescribed and maintain regular follow-up appointments."
              />
            )}
          </ScrollView>
        </View>

        {/* Patient Status */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold text-lg mb-3">
            Your Care Status
          </Text>
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800">Current Status:</Text>
              <View
                className={`px-3 py-1 rounded ${
                  profile.patientStatus === "Monitoring"
                    ? "bg-blue-100"
                    : profile.patientStatus === "Completed"
                    ? "bg-green-100"
                    : profile.patientStatus === "Review"
                    ? "bg-yellow-100"
                    : profile.patientStatus === "Pre-Monitoring"
                    ? "bg-purple-100"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-medium ${
                    profile.patientStatus === "Monitoring"
                      ? "text-blue-800"
                      : profile.patientStatus === "Completed"
                      ? "text-green-800"
                      : profile.patientStatus === "Review"
                      ? "text-yellow-800"
                      : profile.patientStatus === "Pre-Monitoring"
                      ? "text-purple-800"
                      : "text-gray-800"
                  }`}
                >
                  {profile.patientStatus || "Not Determined"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
