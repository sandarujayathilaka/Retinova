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
import { Link, useRouter } from "expo-router";
import { useLogin } from "@/services/auth.service";
import { z } from "zod";

// Define a validation schema with Zod
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Type for validation errors
type ValidationErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  // Use the login mutation from auth service
  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  // Function to validate a specific field
  const validateField = (field: "email" | "password", value: string) => {
    try {
      // Validate just this field using the schema
      loginSchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0]?.message;
        setErrors((prev) => ({ ...prev, [field]: fieldError }));
        return false;
      }
      return false;
    }
  };

  // Function to handle field blur
  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      validateField("email", email);
    } else {
      validateField("password", password);
    }
  };

  // Function to handle input changes and clear API errors
  const handleInputChange = (field: "email" | "password", value: string) => {
    setApiError(null);

    if (field === "email") {
      setEmail(value);
      if (touched.email) validateField("email", value);
    } else {
      setPassword(value);
      if (touched.password) validateField("password", value);
    }
  };

  // Function to validate the entire form
  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as "email" | "password";
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleLogin = async (): Promise<void> => {
    // Clear any previous API errors
    setApiError(null);

    // First validate the form
    if (!validateForm()) {
      // Show a validation error alert
      Alert.alert("Validation Error", "Please correct the errors in the form.");
      return;
    }

    loginMutation.mutate(
      {
        email,
        password,
      },
      {
        onSuccess: (data) => {
          // Handle successful login
          if (data) {
            console.log(data);
            // You might want to store the token/user data before navigating
            // Example: store token in secure storage
            // await SecureStore.setItemAsync('userToken', response.data.token);

            // Navigate to main app after successful login
            // router.replace("/(app)/(tabs)");
          }
        },
        onError: (error: any) => {
          console.error(error);
          console.error(JSON.stringify(error, null, 2));

          // Get error message from API response
          const errorMessage =
            error.response?.data?.error?.message ||
            "Login failed. Please try again.";

          // Handle specific error cases with nice UI
          if (errorMessage === "Invalid credentials") {
            setApiError("The email or password you entered is incorrect.");
          } else {
            // For other errors, use Alert
            Alert.alert("Login Error", errorMessage);
          }
        },
      }
    );
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
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
            className="flex-1"
            contentContainerStyle={{
              paddingVertical: 40,
              flexGrow: 1,
              justifyContent: "center",
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-center px-5">
              {/* Logo and App Name */}
              <View className="items-center mb-8">
                <Image
                  source={require("../../assets/images/icon.png")}
                  className="w-20 h-20"
                  resizeMode="contain"
                />
                <Text className="text-2xl font-bold text-gray-800 mt-2">
                  Retinova
                </Text>
                <Text className="text-sm text-gray-500">
                  Advanced retinal analysis tools
                </Text>
              </View>

              {/* Login Form */}
              <View className="bg-white rounded-2xl p-6 shadow-md">
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome Back
                </Text>
                <Text className="text-sm text-gray-500 mb-6">
                  Log in to your account
                </Text>

                {/* API Error Message */}
                {apiError && (
                  <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <View className="flex-row items-center">
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text className="text-red-600 font-medium ml-2">
                        Invalid Credentials
                      </Text>
                    </View>
                  </View>
                )}

                {/* Email Input */}
                <View className="mb-4">
                  <View
                    className={`flex-row items-center border ${
                      (errors.email && touched.email) || apiError
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-xl mb-1 bg-gray-50`}
                  >
                    <View className="p-3">
                      <Ionicons
                        name="mail-outline"
                        size={22}
                        color={
                          (errors.email && touched.email) || apiError
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
                      onChangeText={(text) => handleInputChange("email", text)}
                      onBlur={() => handleBlur("email")}
                    />
                  </View>
                  {errors.email && touched.email && !apiError && (
                    <Text className="text-red-500 text-xs ml-2 mb-2">
                      {errors.email}
                    </Text>
                  )}
                </View>

                {/* Password Input */}
                <View className="mb-4">
                  <View
                    className={`flex-row items-center border ${
                      (errors.password && touched.password) || apiError
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-xl mb-1 bg-gray-50`}
                  >
                    <View className="p-3">
                      <Ionicons
                        name="lock-closed-outline"
                        size={22}
                        color={
                          (errors.password && touched.password) || apiError
                            ? "#EF4444"
                            : "#4A5568"
                        }
                      />
                    </View>
                    <TextInput
                      className="flex-1 py-3 text-base text-gray-800"
                      placeholder="Password"
                      placeholderTextColor="#A0AEC0"
                      secureTextEntry={secureTextEntry}
                      value={password}
                      onChangeText={(text) =>
                        handleInputChange("password", text)
                      }
                      onBlur={() => handleBlur("password")}
                    />
                    <TouchableOpacity
                      onPress={toggleSecureEntry}
                      className="p-3"
                    >
                      <Ionicons
                        name={
                          secureTextEntry ? "eye-outline" : "eye-off-outline"
                        }
                        size={22}
                        color="#4A5568"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && touched.password && !apiError && (
                    <Text className="text-red-500 text-xs ml-2 mb-2">
                      {errors.password}
                    </Text>
                  )}
                </View>

                {/* Forgot Password */}
                {!apiError && (
                  <Link href="/forgot-password" asChild>
                    <TouchableOpacity className="items-end mb-6 mt-2">
                      <Text className="text-blue-500 text-sm">
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </Link>
                )}

                {/* Login Button */}
                <TouchableOpacity
                  className={`rounded-xl py-4 items-center ${
                    !email || !password || Object.keys(errors).length > 0
                      ? "bg-gray-400"
                      : "bg-blue-600"
                  }`}
                  onPress={handleLogin}
                  disabled={
                    !email ||
                    !password ||
                    isLoading ||
                    Object.keys(errors).some(
                      (key) => !!errors[key as keyof ValidationErrors]
                    )
                  }
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Log In
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
