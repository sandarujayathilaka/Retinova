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
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useGetDoctors } from "@/services/doctor.service";

// Define interfaces for our data model
interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface MedicalHistory {
  condition: string;
  diagnosedAt: string;
  medications: string[];
  date: string;
  isChronicCondition: boolean;
  notes: string;
}

interface PatientProfile {
  _id: string;
  patientId: string;
  fullName: string;
  birthDate: string;
  gender: "Male" | "Female" | "Other";
  nic: string;
  contactNumber: string;
  email: string;
  bloodType: string;
  height?: number;
  weight?: number;
  allergies: string[];
  address: string;
  medicalHistory: MedicalHistory[];
  emergencyContact?: EmergencyContact;
  nextVisit?: string;
  doctorName?: string;
}

// Sample profile data
const sampleProfile: PatientProfile = {
  _id: "67d7150cf61eb9b9649e7d9a",
  patientId: "P2",
  fullName: "John Smith",
  birthDate: "1985-03-05T00:00:00.000Z",
  gender: "Male",
  nic: "2345677654345",
  contactNumber: "0772321233",
  email: "john.smith@gmail.com",
  bloodType: "O+",
  height: 175,
  weight: 70,
  allergies: ["Penicillin", "Dust mites"],
  address: "123 Main Street, Colombo, Sri Lanka",
  medicalHistory: [
    {
      condition: "Type 2 Diabetes",
      diagnosedAt: "2020-01-15T00:00:00.000Z",
      medications: ["Metformin 500mg", "Glipizide 10mg"],
      date: "2020-01-15T00:00:00.000Z",
      isChronicCondition: true,
      notes:
        "Diagnosed with Type 2 Diabetes. Managing with medication and diet.",
    },
    {
      condition: "Hypertension",
      diagnosedAt: "2021-06-10T00:00:00.000Z",
      medications: ["Lisinopril 10mg"],
      date: "2021-06-10T00:00:00.000Z",
      isChronicCondition: true,
      notes: "Blood pressure consistently above 140/90.",
    },
  ],
  emergencyContact: {
    name: "Jane Smith",
    relationship: "Spouse",
    phone: "0771234567",
  },
  nextVisit: "2025-04-04T00:00:00.000Z",
  doctorName: "Dr. Sarah Miller",
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

const calculateAge = (birthDate: string) => {
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
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: doctors, isLoading, isError, error } = useGetDoctors();

  console.log(doctors);

  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      setProfile(sampleProfile);
      setLoading(false);
    }, 1000);

    // In a real app you'd do something like:
    // async function fetchProfile() {
    //   try {
    //     const response = await fetch('your-api-endpoint/profile');
    //     const data = await response.json();
    //     setProfile(data);
    //   } catch (error) {
    //     console.error('Error fetching profile data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          // In a real app, you would clear auth tokens and redirect to login
          router.replace("/(auth)");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-800 mb-2">Profile Not Found</Text>
        <Text className="text-gray-600 text-center mb-4">
          There was an error loading your profile information.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.replace("/(auth)")}
        >
          <Text className="text-white font-semibold">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-xl font-bold text-gray-800">My Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-white p-5 mb-6">
          <View className="flex-row">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center">
              <Text className="text-blue-800 text-2xl font-bold">
                {profile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
            <View className="ml-4 flex-1 justify-center">
              <Text className="text-2xl font-bold text-gray-800">
                {profile.fullName}
              </Text>
              <Text className="text-gray-500">
                {calculateAge(profile.birthDate)} years • {profile.gender}
              </Text>
              <Text className="text-gray-500">ID: {profile.patientId}</Text>
            </View>
          </View>

          <TouchableOpacity
            className="mt-4 bg-blue-500 py-2 rounded-lg items-center"
            onPress={() => {
              /* Navigate to edit profile */
            }}
          >
            <Text className="text-white font-medium">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Medical Information */}
        <View className="bg-white rounded-xl p-5 mx-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Medical Information
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-500 text-sm">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap mb-2">
            <View className="w-1/2 mb-3">
              <Text className="text-gray-500 text-xs">Blood Type</Text>
              <Text className="text-gray-800">
                {profile.bloodType || "Not specified"}
              </Text>
            </View>

            <View className="w-1/2 mb-3">
              <Text className="text-gray-500 text-xs">Height</Text>
              <Text className="text-gray-800">
                {profile.height ? `${profile.height} cm` : "Not specified"}
              </Text>
            </View>

            <View className="w-1/2 mb-3">
              <Text className="text-gray-500 text-xs">Weight</Text>
              <Text className="text-gray-800">
                {profile.weight ? `${profile.weight} kg` : "Not specified"}
              </Text>
            </View>

            <View className="w-1/2 mb-3">
              <Text className="text-gray-500 text-xs">Birth Date</Text>
              <Text className="text-gray-800">
                {formatDate(profile.birthDate)}
              </Text>
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-gray-500 text-xs mb-1">Allergies</Text>
            {profile.allergies && profile.allergies.length > 0 ? (
              <View className="flex-row flex-wrap">
                {profile.allergies.map(
                  (allergy, index) =>
                    allergy.trim() && (
                      <View
                        key={index}
                        className="bg-red-50 px-2 py-1 rounded-md mr-2 mb-2"
                      >
                        <Text className="text-red-700">{allergy}</Text>
                      </View>
                    )
                )}
              </View>
            ) : (
              <Text className="text-gray-800">No known allergies</Text>
            )}
          </View>
        </View>

        {/* Medical History */}
        <View className="bg-white rounded-xl p-5 mx-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Medical History
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-500 text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          {profile.medicalHistory && profile.medicalHistory.length > 0 ? (
            profile.medicalHistory.slice(0, 2).map((history, index) => (
              <View
                key={index}
                className={`pb-3 ${
                  index < profile.medicalHistory.length - 1
                    ? "mb-3 border-b border-gray-100"
                    : ""
                }`}
              >
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-800 font-medium">
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
                <Text className="text-gray-500 text-xs mb-1">
                  Diagnosed: {formatDate(history.diagnosedAt)}
                </Text>

                {history.medications && history.medications.length > 0 && (
                  <View className="mt-1">
                    <Text className="text-gray-700 text-xs">
                      Current Medications:
                    </Text>
                    {history.medications.map((med, medIndex) => (
                      <Text key={medIndex} className="text-gray-800">
                        • {med}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text className="text-gray-500">No medical history records.</Text>
          )}
        </View>

        {/* Emergency Contact */}
        {profile.emergencyContact && (
          <View className="bg-white rounded-xl p-5 mx-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                Emergency Contact
              </Text>
              <TouchableOpacity>
                <Text className="text-blue-500 text-sm">Edit</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-2">
              <Text className="text-gray-500 text-xs">Name</Text>
              <Text className="text-gray-800">
                {profile.emergencyContact.name}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-gray-500 text-xs">Relationship</Text>
              <Text className="text-gray-800">
                {profile.emergencyContact.relationship}
              </Text>
            </View>

            <View>
              <Text className="text-gray-500 text-xs">Phone</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-800">
                  {profile.emergencyContact.phone}
                </Text>
                <TouchableOpacity className="ml-2 p-1">
                  <Ionicons name="call-outline" size={18} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Contact & Personal Information */}
        <View className="bg-white rounded-xl p-5 mx-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Contact Information
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-500 text-sm">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-3">
            <Text className="text-gray-500 text-xs">Phone</Text>
            <Text className="text-gray-800">{profile.contactNumber}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-gray-500 text-xs">Email</Text>
            <Text className="text-gray-800">{profile.email}</Text>
          </View>

          <View>
            <Text className="text-gray-500 text-xs">Address</Text>
            <Text className="text-gray-800">{profile.address}</Text>
          </View>
        </View>

        {/* Settings & More */}
        <View className="bg-white rounded-xl mx-4 mb-6 shadow-sm">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#4B5563"
              className="mr-3"
            />
            <Text className="flex-1 text-gray-800">Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color="#4B5563"
              className="mr-3"
            />
            <Text className="flex-1 text-gray-800">Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons
              name="help-circle-outline"
              size={22}
              color="#4B5563"
              className="mr-3"
            />
            <Text className="flex-1 text-gray-800">Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#4B5563"
              className="mr-3"
            />
            <Text className="flex-1 text-gray-800">Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

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
