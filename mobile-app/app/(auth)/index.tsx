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
import { Link } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate login request
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to main app after successful login
      // navigation.navigate('Home');
    }, 1500);
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
            contentContainerClassName="py-10 flex-grow justify-center"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-center px-5">
              {/* Logo and App Name */}
              <View className="items-center mb-8">
                <Image
                  // source={require("../assets/eye-logo.png")}
                  source={require("../../assets/images/icon.png")}
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

              {/* Login Form */}
              <View className="bg-white rounded-2xl p-6 shadow-md">
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome Back
                </Text>
                <Text className="text-sm text-gray-500 mb-6">
                  Log in to your account
                </Text>

                {/* Email Input */}
                <View className="flex-row items-center border border-gray-200 rounded-xl mb-4 bg-gray-50">
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

                {/* Password Input */}
                <View className="flex-row items-center border border-gray-200 rounded-xl mb-4 bg-gray-50">
                  <View className="p-3">
                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color="#4A5568"
                    />
                  </View>
                  <TextInput
                    className="flex-1 py-3 text-base text-gray-800"
                    placeholder="Password"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry={secureTextEntry}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={toggleSecureEntry} className="p-3">
                    <Ionicons
                      name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
                      size={22}
                      color="#4A5568"
                    />
                  </TouchableOpacity>
                </View>

                {/* Forgot Password */}
                <Link href="/forgot-password" asChild>
                  <TouchableOpacity className="items-end mb-6">
                    <Text className="text-blue-500 text-sm">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </Link>

                {/* Login Button */}
                <TouchableOpacity
                  className={`rounded-xl py-4 items-center ${
                    !email || !password ? "bg-gray-400" : "bg-blue-600"
                  }`}
                  onPress={handleLogin}
                  disabled={!email || !password || isLoading}
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
