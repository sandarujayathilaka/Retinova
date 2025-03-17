import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = () => {
    if (!email) return;

    setIsLoading(true);
    // Simulate password reset request
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 1500);
  };

  const goBack = () => {
    // Navigate back to login screen
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1 px-5"
            contentContainerClassName="py-10 flex-grow justify-center"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity
              onPress={goBack}
              className="absolute top-0 left-0 p-4 z-10"
            >
              <Ionicons name="arrow-back" size={24} color="#4A5568" />
            </TouchableOpacity>

            {/* Logo and App Name */}
            <View className="items-center mb-8">
              <Image
                source={require("@/assets/images/icon.png")}
                className="w-20 h-20"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-gray-800 mt-2">
                EyeDiagnosis
              </Text>
              <Text className="text-sm text-gray-500">
                Advanced retinal analysis tools
              </Text>
            </View>

            {/* Reset Password Form */}
            <View className="bg-white rounded-2xl p-6 shadow-md">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                Reset Password
              </Text>
              <Text className="text-sm text-gray-500 mb-6">
                Enter your email address and we'll send you a link to reset your
                password.
              </Text>

              {resetSent ? (
                <View className="items-center py-4">
                  <View className="bg-green-100 rounded-full p-4 mb-4">
                    <Ionicons
                      name="checkmark-circle"
                      size={40}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-lg font-medium text-gray-800 mb-2">
                    Check Your Email
                  </Text>
                  <Text className="text-gray-500 text-center mb-6">
                    We've sent a password reset link to {email}
                  </Text>
                  <Link href="/" asChild>
                    <TouchableOpacity className="rounded-xl py-4 px-6 items-center bg-blue-600 mb-4">
                      <Text className="text-white font-bold text-base">
                        Back to Login
                      </Text>
                    </TouchableOpacity>
                  </Link>
                  <TouchableOpacity onPress={() => setResetSent(false)}>
                    <Text className="text-blue-500 text-sm">
                      Try another email
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* Email Input */}
                  <View className="flex-row items-center border border-gray-200 rounded-xl mb-6 bg-gray-50">
                    <View className="p-3">
                      <Ionicons name="mail-outline" size={22} color="#4A5568" />
                    </View>
                    <TextInput
                      className="flex-1 py-3 text-base text-gray-800"
                      placeholder="Email Address"
                      placeholderTextColor="#A0AEC0"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    className={`rounded-xl py-4 items-center ${
                      !email ? "bg-gray-400" : "bg-blue-600"
                    }`}
                    onPress={handleResetPassword}
                    disabled={!email || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="text-white font-bold text-base">
                        Reset Password
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Back to Login */}
              {!resetSent && (
                <View className="flex-row justify-center mt-6">
                  <Text className="text-gray-500 text-sm">
                    Remember your password?{" "}
                  </Text>
                  <Link href="/" asChild>
                    <TouchableOpacity>
                      <Text className="text-blue-500 font-bold text-sm">
                        Log In
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
