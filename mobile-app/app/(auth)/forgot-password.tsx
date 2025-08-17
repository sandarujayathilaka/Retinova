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
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useRequestPasswordResetLink } from "@/services/auth.service";
import { z } from "zod";

// Define a validation schema with Zod
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ValidationError = {
  email?: string;
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<ValidationError>({});
  const [touched, setTouched] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Use the password reset link request mutation
  const resetLinkMutation = useRequestPasswordResetLink();
  const isLoading = resetLinkMutation.isPending;

  // Validate email function
  const validateEmail = (value: string): boolean => {
    try {
      emailSchema.parse({ email: value });
      setError({});
      return true;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessage = validationError.errors[0]?.message;
        setError({ email: errorMessage });
      }
      return false;
    }
  };

  // Handle email field blur
  const handleBlur = () => {
    setTouched(true);
    validateEmail(email);
  };

  // Clear any API errors when email changes
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setApiError(null);
    if (touched) validateEmail(text);
  };

  const handleResetPassword = () => {
    if (!email) return;

    // Clear any previous API errors
    setApiError(null);

    // Validate email before submitting
    if (!validateEmail(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }

    resetLinkMutation.mutate(email, {
      onSuccess: (response) => {
        // Set reset sent to true on successful API call
        setResetSent(true);
      },
      onError: (error: any) => {
        console.log(error);
        // Get error message from API response
        const errorMessage =
          error.response?.data?.error ||
          "Failed to send reset link. Please try again.";

        // Handle specific error cases with nice UI
        if (errorMessage === "Email not found") {
          setApiError(errorMessage);
        } else {
          // For other errors, use Alert
          Alert.alert("Error", errorMessage);
        }
      },
    });
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
            contentContainerStyle={{
              paddingVertical: 40,
              flexGrow: 1,
              justifyContent: "center",
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo and App Name */}
            <View className="items-center mb-8">
              <Image
                source={require("@/assets/images/retinova_logo.png")}
                className="w-40 h-40"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-gray-800 mt-2">
                RETINOVA
              </Text>
              <Text className="text-sm text-gray-500">
                Know Your Vision, Anytime, Anywhere
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
                  <TouchableOpacity
                    onPress={() => {
                      setResetSent(false);
                      setEmail("");
                      setTouched(false);
                      setApiError(null);
                    }}
                  >
                    <Text className="text-blue-500 text-sm">
                      Try another email
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* API Error Message */}
                  {apiError && (
                    <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="alert-circle"
                          size={20}
                          color="#EF4444"
                        />
                        <Text className="text-red-600 font-medium ml-2">
                          Email Not Found
                        </Text>
                      </View>
                      <Text className="text-gray-600 text-sm mt-2">
                        Please try another email.
                      </Text>
                    </View>
                  )}

                  {/* Email Input with Validation */}
                  <View>
                    <View
                      className={`flex-row items-center border ${
                        (error.email && touched) || apiError
                          ? "border-red-500"
                          : "border-gray-200"
                      } rounded-xl mb-1 bg-gray-50`}
                    >
                      <View className="p-3">
                        <Ionicons
                          name="mail-outline"
                          size={22}
                          color={
                            (error.email && touched) || apiError
                              ? "#EF4444"
                              : "#4A5568"
                          }
                        />
                      </View>
                      <TextInput
                        className="flex-1 py-3 text-base text-gray-800"
                        placeholder="Email Address"
                        placeholderTextColor="#A0AEC0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={handleEmailChange}
                        onBlur={handleBlur}
                      />
                    </View>
                    {error.email && touched && !apiError && (
                      <Text className="text-red-500 text-xs ml-2 mb-4">
                        {error.email}
                      </Text>
                    )}
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    className={`rounded-xl py-4 items-center mt-4 ${
                      !email || (touched && error.email)
                        ? "bg-gray-400"
                        : "bg-blue-600"
                    }`}
                    onPress={handleResetPassword}
                    disabled={!email || isLoading || (touched && !!error.email)}
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
