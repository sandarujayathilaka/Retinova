import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import useAuthStore from "@/stores/auth";
import { useGetUserProfile } from "@/services/auth.service";
import { useGetDiagnoses } from "@/services/diagnosis.service";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define types
interface Diagnosis {
  _id: string;
  imageUrl: string;
  diagnosis: string;
  eye: "LEFT" | "RIGHT";
  uploadedAt: string;
  recommend?: {
    note?: string;
    tests?: Array<{
      testName: string;
      status: string;
      addedAt?: string;
    }>;
  };
}

interface Profile {
  fullName: string;
  patientStatus?: string;
  nextVisit?: string | Date;
  
}

// Helper functions
const formatDate = (dateInput?: string | Date): string => {
  if (!dateInput) return "Not scheduled";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatTime = (dateInput?: string | Date): string => {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

// Progress Ring Component (Note: Requires react-native-svg)
interface ProgressRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ progress, size, strokeWidth, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <View style={{ transform: [{ rotate: "-90deg" }], position: "absolute" }}>
        {/* Placeholder for SVG - Add react-native-svg dependency */}
        <Text style={{ color: "#1e3a8a" }}>Progress Ring Placeholder</Text>
      </View>
    </View>
  );
};

// Diagnosis Card Component
interface DiagnosisCardProps {
  diagnosis: Diagnosis;
}

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ diagnosis }) => {
  const getSeverity = (diagnosisType?: string): "Low" | "Medium" | "High" => {
    const severityMap: Record<string, "Low" | "Medium" | "High"> = {
      PDR: "High",
      NPDR: "Medium",
      DME: "Medium",
      Normal: "Low",
    };
    return severityMap[diagnosisType || ""] || "Medium";
  };

  const severity = getSeverity(diagnosis.diagnosis);
  const severityStyles: Record<string, any> = {
    Low: { bg: "bg-green-100", text: "text-green-800", color: "#16a34a" },
    Medium: { bg: "bg-yellow-100", text: "text-yellow-800", color: "#ca8a04" },
    High: { bg: "bg-red-100", text: "text-red-800", color: "#dc2626" },
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: "hidden",
      }}
    >
      <View 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 4, 
          backgroundColor: severityStyles[severity].color 
        }} 
      />
      
      <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
        {diagnosis.imageUrl ? (
          <Image
            source={{ uri: diagnosis.imageUrl }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 8,
              marginRight: 12,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 8,
              backgroundColor: "#f3f4f6",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons name="eye-outline" size={32} color="#94a3b8" />
          </View>
        )}
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#1e3a8a" }}>
              {diagnosis.diagnosis || "Undiagnosed"}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              {diagnosis.uploadedAt
                ? new Date(diagnosis.uploadedAt).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
          
          <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>
            {diagnosis.eye} Eye
          </Text>
          
          <Text style={{ fontSize: 14, color: "#4b5563", lineHeight: 20 }}>
            {diagnosis.recommend?.note || "AI-assisted diagnosis completed."}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: severityStyles[severity].bg.replace("bg-", ""),
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View 
              style={{ 
                width: 8, 
                height: 8, 
                borderRadius: 4, 
                backgroundColor: severityStyles[severity].color,
                marginRight: 6 
              }} 
            />
            <Text style={{ 
              fontSize: 12, 
              fontWeight: "500",
              color: severityStyles[severity].color 
            }}>
              {severity} Risk
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={{
            backgroundColor: "#dbeafe",
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => router.push(`/diagnosis/${diagnosis._id}` as const)}
        >
          <Text style={{ fontSize: 14, color: "#1e3a8a", fontWeight: "500", marginRight: 4 }}>
            View Details
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={12} color="#1e3a8a" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Status Indicator Component
interface StatusIndicatorProps {
  status: string | undefined;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusInfo = (statusText?: string) => {
    const statusMap: Record<string, { color: string, icon: string }> = {
      "High Risk": { color: "#ef4444", icon: "alert-circle" },
      "Medium Risk": { color: "#f59e0b", icon: "alert" },
      "Low Risk": { color: "#10b981", icon: "check-circle" },
      "Normal": { color: "#10b981", icon: "check-circle" },
      "Scheduled": { color: "#3b82f6", icon: "calendar" },
    };
    
    return statusMap[statusText || ""] || { color: "#6b7280", icon: "information" };
  };
  
  const statusInfo = getStatusInfo(status);
  
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <MaterialCommunityIcons name={statusInfo.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={18} color={statusInfo.color} />
      <Text style={{ fontSize: 14, color: "#4b5563", marginLeft: 6 }}>
        Status: <Text style={{ color: statusInfo.color, fontWeight: "500" }}>{status || "Not Determined"}</Text>
      </Text>
    </View>
  );
};

// Test Status Component
interface TestStatusProps {
  test: {
    testName: string;
    status: string;
    addedAt?: string;
  };
  index: number;
  totalTests: number;
}

const TestStatus: React.FC<TestStatusProps> = ({ test, index, totalTests }) => {
  const statusStyles: Record<string, { bg: string, text: string, icon: string }> = {
    "Reviewed": { 
      bg: "bg-green-50", 
      text: "text-green-700",
      icon: "check-circle" 
    },
    "Scheduled": { 
      bg: "bg-blue-50", 
      text: "text-blue-700",
      icon: "calendar-check" 
    },
    "Pending": { 
      bg: "bg-gray-50", 
      text: "text-gray-700",
      icon: "clock-outline" 
    },
  };
  
  const style = statusStyles[test.status] || statusStyles["Pending"];
  
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        ...(index < totalTests - 1
          ? { borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }
          : {}),
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 15, fontWeight: "500", color: "#334155", marginBottom: 2 }}
        >
          {test.testName}
        </Text>
        <Text style={{ fontSize: 13, color: "#64748b" }}>
          {test.addedAt
            ? new Date(test.addedAt).toLocaleDateString()
            : "Not scheduled"}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: style.bg.replace("bg-", ""),
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 12,
        }}
      >
        {/* <MaterialCommunityIcons 
          name={style.icon as const} 
          size={16} 
          color={style.text.replace("text-", "")} 
          style={{ marginRight: 4 }}
        /> */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: style.text.replace("text-", ""),
          }}
        >
          {test.status || "Pending"}
        </Text>
      </View>
    </View>
  );
};

// Eye Status Component
interface EyeStatusProps {
  diagnoses: Diagnosis[] | undefined;
  eye: "LEFT" | "RIGHT";
  label: string;
  abbreviation: string;
}

const EyeStatus: React.FC<EyeStatusProps> = ({ diagnoses, eye, label, abbreviation }) => {
  const diagnosis = diagnoses?.find((d: Diagnosis) => d.eye === eye);
  
  const getStatusColor = (diagnosisType?: string) => {
    const colorMap: Record<string, string> = {
      PDR: "#ef4444",  // red
      NPDR: "#f59e0b", // amber
      DME: "#f59e0b",  // amber
      Normal: "#10b981", // green
    };
    return colorMap[diagnosisType || ""] || "#6b7280"; // gray default
  };
  
  const statusColor = getStatusColor(diagnosis?.diagnosis);
  
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View
        style={{
          width: 80,
          height: 80,
          backgroundColor: "#f8fafc",
          borderRadius: 40,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
          position: "relative",
          borderWidth: 2,
          borderColor: diagnosis ? statusColor : "#e2e8f0",
        }}
      >
        <MaterialCommunityIcons
          name="eye-outline" 
          size={36} 
          color={diagnosis ? statusColor : "#94a3b8"} 
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 24,
            height: 24,
            backgroundColor: "#fff",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Text
            style={{ fontSize: 12, fontWeight: "bold", color: "#1e3a8a" }}
          >
            {abbreviation}
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: "#334155",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: statusColor,
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {diagnosis?.diagnosis || "Not tested"}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "#64748b",
          marginTop: 4,
          textAlign: "center",
        }}
      >
        Last: {diagnosis?.uploadedAt ? formatDate(diagnosis.uploadedAt) : "N/A"}
      </Text>
    </View>
  );
};

// SectionHeader Component
interface SectionHeaderProps {
  title: string;
  hasAction?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  hasAction = false, 
  actionLabel = "View All", 
  onAction 
}) => {
  return (
    <View style={{ 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: 12 
    }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: "#1e3a8a" }}>
        {title}
      </Text>
      {hasAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontSize: 14, color: "#3b82f6", fontWeight: "500" }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const { profile, refreshProfile, isLoggedIn } = useAuthStore();
  const insets = useSafeAreaInsets();

  const { mutate: fetchProfile, isPending: profileLoading } = useGetUserProfile();
  const { data: diagnoses, isLoading: diagnosesLoading } = useGetDiagnoses();

  React.useEffect(() => {
    if (!isLoggedIn()) {
      // router.replace("/(tabs)/login" as const);
      return;
    }

    fetchProfile(undefined, {
      onSuccess: () => {
        refreshProfile();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
        // router.replace("/(tabs)/login" as const);
      },
    });
  }, [isLoggedIn, fetchProfile, refreshProfile]);

  if (loading || profileLoading || diagnosesLoading) {
    return (
      <LinearGradient
        colors={["#f0f9ff", "#bfdbfe", "#3b82f6"]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#1e3a8a", fontWeight: "500" }}>
          Loading your health data...
        </Text>
      </LinearGradient>
    );
  }

  if (!profile) {
    return (
      <LinearGradient
        colors={["#f0f9ff", "#bfdbfe", "#3b82f6"]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
      >
        <MaterialCommunityIcons
          name="alert-circle-outline" 
          size={60} 
          color="#ef4444" 
        />
        <Text
          style={{
            marginTop: 16,
            fontSize: 18,
            color: "#1e3a8a",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          Unable to load profile
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 15,
            color: "#475569",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          We couldn't retrieve your profile information. Please check your connection and try again.
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 16,
            backgroundColor: "#1e3a8a",
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() => fetchProfile()}
        >
          <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, color: "#fff", fontWeight: "600" }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const latestDiagnosis =
    diagnoses && diagnoses.length > 0
      ? diagnoses.sort(
          (a: Diagnosis, b: Diagnosis) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )[0]
      : null;

  const getDaysToNextVisit = () => {
    if (!profile.nextVisit) return null;
    const nextVisit = new Date(profile.nextVisit);
    const today = new Date();
    const diffTime = nextVisit.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysToNextVisit = getDaysToNextVisit();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={["#1e3a8a", "#3b82f6"]}
        style={{
          paddingTop: insets.top + 10,
          paddingBottom: 60,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingBottom: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
                  source={require("@/assets/images/retinova_logo_white.png")}
                  className="w-10 h-10"
                  resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#f2f2f2",
                marginLeft: 8,
              }}
            >
              RETINOVA
            </Text>
          </View>
          
          
        </View>
        
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#fff",
              marginBottom: 2,
            }}
          >
            Hello, {profile.fullName.split(" ")[0]}
          </Text>
          <Text style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.8)" }}>
            Let's monitor your eye health today
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom: 20,
          paddingTop: 0,
        }}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: -40 }}
      >
        {profile.nextVisit && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#eff6ff",
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="calendar" size={28} color="#3b82f6" />
            </View>
            
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1e3a8a", marginBottom: 4 }}
                >
                  Next Appointment
                </Text>
                {daysToNextVisit !== null && (
                  <View
                    style={{
                      backgroundColor: daysToNextVisit <= 3 ? "#fee2e2" : "#dbeafe",
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: daysToNextVisit <= 3 ? "#dc2626" : "#1e3a8a",
                      }}
                    >
                      {daysToNextVisit <= 0 ? "Today" : `${daysToNextVisit} day${daysToNextVisit !== 1 ? "s" : ""}`}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={{ fontSize: 15, color: "#334155", marginBottom: 2 }}>
                {formatDate(profile.nextVisit)}
              </Text>
              <Text style={{ fontSize: 14, color: "#64748b" }}>
                {formatTime(profile.nextVisit)}
              </Text>
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <View
            style={{
              flex: 2,
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
              marginRight: 8,
            }}
          >
            <StatusIndicator status={profile.patientStatus} />
            {/* <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#0f172a",
                marginTop: 12,
                marginBottom: 4,
              }}
            >
              {profile.fullName}
            </Text> */}
            {/* <Text style={{ fontSize: 14, color: "#64748b" }}>
              Patient ID: {Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
            </Text> */}
          </View>

          {/* <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#f0f9ff",
                borderRadius: 12,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
              // onPress={() => router.push("/(tabs)/scan" as const)}
            >
              <MaterialCommunityIcons name="camera-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: "#f0f9ff",
                borderRadius: 12,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
              }}
              // onPress={() => router.push("/(tabs)/schedule" as const)}
            >
              <MaterialCommunityIcons name="calendar-plus" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View> */}
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <SectionHeader title="Eye Health Status" />
          
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <EyeStatus 
              diagnoses={diagnoses} 
              eye="LEFT" 
              label="Left Eye" 
              abbreviation="L" 
            />
            <EyeStatus 
              diagnoses={diagnoses} 
              eye="RIGHT" 
              label="Right Eye" 
              abbreviation="R" 
            />
          </View>
        </View>

        {latestDiagnosis && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <SectionHeader 
              title="Recent Diagnosis" 
              hasAction 
              actionLabel="All History"
              onAction={() => router.push("../../(tabs)/diagnosis-history" as const)} 
            />
            <DiagnosisCard diagnosis={latestDiagnosis} />
          </View>
        )}

        {latestDiagnosis?.recommend?.tests?.length > 0 && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <SectionHeader title="Recommended Tests" />
            
            {latestDiagnosis.recommend.tests.map(
              (
                test: { testName: string; status: string; addedAt?: string },
                index: number
              ) => (
                <TestStatus 
                  key={index}
                  test={test}
                  index={index}
                  totalTests={latestDiagnosis.recommend?.tests?.length || 0}
                />
              )
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}