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
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useGetDiagnoses } from "@/services/diagnosis.service";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

// Create AnimatedLinearGradient for animation support
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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
  revisitTimeFrame:
    | "Monthly"
    | "Quarterly"
    | "Bi-annually"
    | "Annually"
    | "As needed";
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
  No_DR: "Low",
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

const DiagnosisCard = ({ diagnosis }: { diagnosis: Diagnosis }) => {
  const severity = diagnosisSeverity[diagnosis.diagnosis] || "Medium";

  const getSeverityColor = (severity: "Low" | "Medium" | "High") => {
    switch (severity) {
      case "Low":
        return "bg-emerald-100 text-emerald-800";
      case "Medium":
        return "bg-amber-100 text-amber-800";
      case "High":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const severityColor = getSeverityColor(severity);

  return (
    <Link key={diagnosis._id} href={`/diagnosis/${diagnosis._id}`} asChild>
      <TouchableOpacity
        className="mb-5 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl"
        style={{ elevation: 1 }}
      >
        <View className="relative">
          <Image
            source={{ uri: diagnosis.imageUrl }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            className="absolute inset-x-0 bottom-0 h-24"
          />
          <View className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black bg-opacity-60 flex-row items-center">
            <Ionicons
              name={diagnosis.eye === "LEFT" ? "eye-outline" : "eye-outline"}
              size={14}
              color="#FFFFFF"
            />
            <Text className="ml-1 text-xs font-medium text-white">
              {diagnosis.eye === "LEFT" ? "Left" : "Right"} Eye
            </Text>
          </View>
          <View className="absolute flex-row items-center justify-between bottom-3 left-3 right-3">
            <View className={`px-3 py-1.5 rounded-full ${severityColor}`}>
              <Text
                className={`text-xs font-bold ${severityColor.split(" ")[1]}`}
              >
                {severity} Risk
              </Text>
            </View>
            <View className="bg-white bg-opacity-90 px-3 py-1.5 rounded-full">
              <Text className="text-xs font-medium text-gray-800">
                {formatDate(diagnosis.uploadedAt)}
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          <Text className="mb-2 text-lg font-bold text-gray-900">
            {diagnosis.diagnosis}
          </Text>

          {diagnosis.recommend.note ? (
            <View className="p-3 mb-4 border border-gray-100 bg-gray-50 rounded-xl">
              <Text className="mb-1 text-sm font-semibold text-gray-700">
                Doctor's Note:
              </Text>
              <Text className="text-sm text-gray-600" numberOfLines={2}>
                {diagnosis.recommend.note}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row flex-wrap items-center gap-2">
              {diagnosis.recommend.tests.length > 0 && (
                <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                  <Ionicons name="medical-outline" size={14} color="#1e40af" />
                  <Text className="text-blue-700 text-xs ml-1.5 font-medium">
                    {diagnosis.recommend.tests.length} Tests
                  </Text>
                </View>
              )}
              <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                <Ionicons name="time-outline" size={14} color="#1e40af" />
                <Text className="text-blue-700 text-xs ml-1.5 font-medium">
                  {diagnosis.revisitTimeFrame}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center px-3 py-2 bg-blue-600 rounded-lg">
              <Text className="mr-1 text-xs font-semibold text-white">
                Details
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default function DiagnosisHistoryScreen() {
  const insets = useSafeAreaInsets();
  const {
    data: diagnoses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDiagnoses() as {
    data: Diagnosis[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | "LEFT" | "RIGHT">(
    "All"
  );
  const scrollY = new Animated.Value(0);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.resolve(refetch()).finally(() => setRefreshing(false));
  };

  const filteredDiagnoses = () => {
    if (activeFilter === "All") return diagnoses || [];
    return (diagnoses || []).filter(
      (diagnosis: Diagnosis) => diagnosis.eye === activeFilter
    );
  };

  // Header animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, paddingTop: insets.top }}
        className="bg-white"
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 font-medium text-blue-700">
            Loading your eye health data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        style={{ flex: 1, paddingTop: insets.top }}
        className="bg-white"
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View className="items-center justify-center flex-1 p-6">
          <View className="p-4 mb-4 rounded-full bg-red-50">
            <MaterialCommunityIcons
              name="alert-circle"
              size={48}
              color="#ef4444"
            />
          </View>
          <Text className="mb-2 text-xl font-bold text-gray-800">
            Failed to Load Diagnoses
          </Text>
          <Text className="mb-8 text-center text-gray-600">
            {error?.message.includes("404")
              ? "No diagnoses found. Please check your account or contact support."
              : "An error occurred while fetching diagnoses. Please try again later."}
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-8 py-3.5 rounded-xl shadow"
            onPress={() => refetch()}
          >
            <Text className="font-bold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: insets.top }}
      className="bg-white"
    >
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Updated Animated Header with LinearGradient */}
      <AnimatedLinearGradient
        colors={["#1e3a8a", "#3b82f6"]}
        style={{
          height: headerHeight,
          paddingHorizontal: 20,
          paddingVertical: 16,
          justifyContent: "flex-end",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text className="text-2xl font-bold text-white">
          Eye Health History
        </Text>
        <Animated.Text
          style={{ opacity: headerOpacity }}
          className="mt-1 text-sm text-indigo-100"
        >
          Track your eye condition progress over time
        </Animated.Text>
      </AnimatedLinearGradient>

      {/* Filter Tabs */}
      <View className="z-10 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          <TouchableOpacity
            className={`mr-3 py-2 px-5 rounded-lg ${
              activeFilter === "All" ? "bg-sky-600" : "bg-sky-50"
            }`}
            onPress={() => setActiveFilter("All")}
          >
            <Text
              className={`${
                activeFilter === "All"
                  ? "text-white font-bold"
                  : "text-sky-500 font-medium"
              }`}
            >
              All Eyes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`mr-3 py-2 px-5 rounded-lg ${
              activeFilter === "LEFT" ? "bg-cyan-600" : "bg-cyan-50"
            }`}
            onPress={() => setActiveFilter("LEFT")}
          >
            <Text
              className={`${
                activeFilter === "LEFT"
                  ? "text-white font-bold"
                  : "text-cyan-700 font-medium"
              }`}
            >
              Left Eye
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`py-2 px-5 rounded-lg ${
              activeFilter === "RIGHT" ? "bg-teal-600" : "bg-teal-50"
            }`}
            onPress={() => setActiveFilter("RIGHT")}
          >
            <Text
              className={`${
                activeFilter === "RIGHT"
                  ? "text-white font-bold"
                  : "text-teal-700 font-medium"
              }`}
            >
              Right Eye
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <Animated.ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={
          filteredDiagnoses().length === 0
            ? { flex: 1 }
            : { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {filteredDiagnoses().length === 0 ? (
          <View className="items-center justify-center flex-1 p-8 bg-white">
            <View className="p-4 mb-6 rounded-full bg-indigo-50">
              <MaterialCommunityIcons
                name="eye-off"
                size={50}
                color="#3b82f6"
              />
            </View>
            <Text className="mb-3 text-xl font-bold text-gray-800">
              No Diagnoses Found
            </Text>
            <Text className="mb-8 text-center text-gray-500">
              {activeFilter === "All"
                ? "You don't have any diagnoses yet. Schedule an eye exam to get started."
                : `You don't have any diagnoses for your ${activeFilter.toLowerCase()} eye.`}
            </Text>
            <TouchableOpacity
              className="bg-[#3b82f6] px-8 py-3.5 rounded-xl shadow"
              onPress={() => refetch()}
            >
              <Text className="font-bold text-white">Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDiagnoses().map((diagnosis: Diagnosis) => (
            <DiagnosisCard key={diagnosis._id} diagnosis={diagnosis} />
          ))
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
