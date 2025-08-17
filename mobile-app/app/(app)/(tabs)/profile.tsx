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
  Alert,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useGetDoctors } from "@/services/doctor.service";
import useAuthStore from "@/stores/auth";

// Helper functions
const formatDate = (dateString: string | Date) => {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const calculateAge = (birthDate: string | Date) => {
  if (!birthDate) return "N/A";
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { profile, refreshProfile, logout, isLoggedIn } = useAuthStore();
  const { data: doctors, isLoading: isLoadingDoctors } = useGetDoctors();

  // Find the doctor's name if doctorId exists in profile
  const doctorName =
    profile?.doctorId && doctors?.length
      ? doctors.find((doc: any) => doc._id === profile.doctorId)?.name
      : undefined;
  console.log("profile:", profile);

  // useEffect(() => {
  //   async function loadProfileData() {
  //     if (!isLoggedIn()) {
  //       router.replace("/(auth)");
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

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-slate-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading your profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="items-center justify-center flex-1 p-4 bg-slate-50">
        <Text className="mb-2 text-lg text-gray-800">Profile Not Found</Text>
        <Text className="mb-4 text-center text-gray-600">
          There was an error loading your profile information.
        </Text>
        <TouchableOpacity
          className="px-4 py-2 bg-blue-500 rounded-lg"
          onPress={() => refreshProfile()}
        >
          <Text className="font-semibold text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="p-6 mb-6 bg-white shadow-sm">
          <View className="flex-row items-center">
            <View className="items-center justify-center w-20 h-20 rounded-full shadow-sm bg-blue-50">
              <FontAwesome5 name="user-alt" size={32} color="#3b82f6" />
            </View>
            <View className="justify-center flex-1 ml-4">
              <Text className="text-xl font-bold text-gray-800 capitalize">
                {profile.fullName}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-gray-600">
                  {calculateAge(profile.birthDate)} years • {profile.gender}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                {profile.patientStatus && (
                  <View
                    className={`ml-3 px-2 py-0.5 rounded-full ${
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
                      className={`text-xs font-medium ${
                        profile.patientStatus === "Monitoring"
                          ? "text-blue-700"
                          : profile.patientStatus === "Completed"
                          ? "text-green-700"
                          : profile.patientStatus === "Review"
                          ? "text-yellow-700"
                          : profile.patientStatus === "Pre-Monitoring"
                          ? "text-purple-700"
                          : "text-gray-700"
                      }`}
                    >
                      {profile.patientStatus}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        <View className="p-5 mx-4 mb-4 bg-white shadow-sm rounded-xl">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Medical Information
            </Text>
          </View>

          <View className="flex-row flex-wrap mb-2">
            <View className="w-1/2 mb-3">
              <Text className="text-xs text-gray-500">Blood Type</Text>
              <Text className="text-gray-800">
                {profile.bloodType || "Not specified"}
              </Text>
            </View>

            <View className="w-1/2 mb-3">
              <Text className="text-xs text-gray-500">Height</Text>
              <Text className="text-gray-800">
                {profile.height ? `${profile.height} cm` : "Not specified"}
              </Text>
            </View>

            <View className="w-1/2 mb-3">
              <Text className="text-xs text-gray-500">Weight</Text>
              <Text className="text-gray-800">
                {profile.weight ? `${profile.weight} kg` : "Not specified"}
              </Text>
            </View>

            <View className="w-1/2 mb-3">
              <Text className="text-xs text-gray-500">Birth Date</Text>
              <Text className="text-gray-800">
                {formatDate(profile.birthDate)}
              </Text>
            </View>
          </View>

          <View className="mb-3">
            <Text className="mb-1 text-xs text-gray-500">Allergies</Text>
            {profile.allergies &&
            profile.allergies.length > 0 &&
            profile.allergies.some((allergy) => allergy && allergy.trim()) ? (
              <View className="flex-row flex-wrap">
                {profile.allergies.map(
                  (allergy, index) =>
                    allergy &&
                    allergy.trim() && (
                      <View
                        key={index}
                        className="px-2 py-1 mb-2 mr-2 rounded-md bg-red-50"
                      >
                        <Text className="text-red-700">{allergy}</Text>
                      </View>
                    )
                )}
              </View>
            ) : (
              <Text className="text-gray-800">Not specified</Text>
            )}
          </View>

          {profile.category && profile.category.length > 0 && (
            <View className="mb-3">
              <Text className="mb-1 text-xs text-gray-500">Conditions</Text>
              <View className="flex-row flex-wrap">
                {profile.category.map(
                  (condition, index) =>
                    condition && (
                      <View
                        key={index}
                        className="px-2 py-1 mb-2 mr-2 rounded-md bg-blue-50"
                      >
                        <Text className="text-blue-700">{condition}</Text>
                      </View>
                    )
                )}
              </View>
            </View>
          )}

          {doctorName && (
            <View className="mt-2">
              <Text className="text-xs text-gray-500">Primary Physician</Text>
              <Text className="text-gray-800">{doctorName}</Text>
            </View>
          )}
        </View>

        {/* Medical History */}
        {profile.medicalHistory && profile.medicalHistory.length > 0 && (
          <View className="p-5 mx-4 mb-4 bg-white shadow-sm rounded-xl">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                Medical History
              </Text>
            </View>

            {profile.medicalHistory.slice(0, 2).map((history, index) => (
              <View
                key={index}
                className={`pb-3 ${
                  index < Math.min(profile.medicalHistory!.length, 2) - 1
                    ? "mb-3 border-b border-gray-100"
                    : ""
                }`}
              >
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base font-bold text-gray-800">
                    {history.condition}
                  </Text>
                  <View
                    className={`px-2 py-1 rounded ${
                      history.isChronicCondition
                        ? "bg-purple-100"
                        : "bg-green-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        history.isChronicCondition
                          ? "text-purple-800"
                          : "text-green-800"
                      }`}
                    >
                      {history.isChronicCondition ? "Chronic" : "Acute"}
                    </Text>
                  </View>
                </View>
                {history.diagnosedAt && (
                  <Text className="text-base font-medium text-gray-500">
                    Diagnosed: {formatDate(history.diagnosedAt)}
                  </Text>
                )}

                {history.medications && history.medications.length > 0 && (
                  <View className="mt-1">
                    <Text className="text-base font-medium text-gray-500">
                      Current Medications
                    </Text>
                    {history.medications.map((med, medIndex) => (
                      <Text key={medIndex} className="text-gray-800 font-small">
                        • {med}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Emergency Contact */}
        {profile.emergencyContact && (
          <View className="p-5 mx-4 mb-4 bg-white shadow-sm rounded-xl">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                Emergency Contact
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-xs text-gray-500">Name</Text>
              <Text className="text-gray-800">
                {profile.emergencyContact!.name}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-xs text-gray-500">Relationship</Text>
              <Text className="text-gray-800">
                {profile.emergencyContact!.relationship}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-gray-500">Phone</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-800">
                  {profile.emergencyContact!.phone}
                </Text>
                <TouchableOpacity
                  className="p-1 ml-2"
                  onPress={() => handleCall(profile.emergencyContact!.phone)}
                >
                  <Ionicons name="call-outline" size={18} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Contact & Personal Information */}
        <View className="p-5 mx-4 mb-4 bg-white shadow-sm rounded-xl">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Contact Information
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-xs text-gray-500">Phone</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-800">{profile.contactNumber}</Text>
              <TouchableOpacity
                className="p-1 ml-2"
                onPress={() => handleCall(profile.contactNumber)}
              >
                <Ionicons name="call-outline" size={18} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-xs text-gray-500">Email</Text>
            <Text className="text-gray-800">{profile.email}</Text>
          </View>

          <View>
            <Text className="text-xs text-gray-500">Address</Text>
            <Text className="text-gray-800">
              {profile.address || "Not specified"}
            </Text>
          </View>
        </View>

        <View className="mx-4 mb-6 bg-white shadow-sm rounded-xl">
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#EF4444"
              className="mr-3"
            />
            <Text className="text-red-500">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
