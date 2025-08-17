import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import useAuthStore from "@/stores/auth";

const Home = () => {
  const { token, isLoggedIn } = useAuthStore();

  if (!isLoggedIn()) {
    return <Redirect href="/(auth)" />;
  }

  return <Redirect href="/(app)/(tabs)" />;
};

export default Home;
