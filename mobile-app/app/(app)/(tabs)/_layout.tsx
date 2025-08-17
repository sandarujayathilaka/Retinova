// app/(app)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Platform,
  Dimensions,
  StatusBar,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);

  // Calculate proper tab bar height based on device
  const bottomInset = Platform.OS === "ios" ? insets.bottom : 0;
  const tabBarHeight = bottomInset + 60; // Base height + bottom inset

  // useEffect(() => {
  //   // Ensure the component is fully mounted before showing
  //   const timer = setTimeout(() => {
  //     setIsReady(true);
  //   }, 150);

  //   return () => clearTimeout(timer);
  // }, []);

  // if (!isReady) {
  //   // Return empty view while initializing
  //   return <View style={styles.container} />;
  // }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: bottomInset,
          // Ensure the tab bar doesn't animate in unexpectedly
          opacity: 1,
          transform: [{ translateY: 0 }],
          // Set a z-index to ensure it stays on top
          zIndex: 1000,
          // Remove position absolute which can cause layout issues
          position: undefined,
        },
        // Force tab bar to be visible
        tabBarHideOnKeyboard: false,
        // tabBarVisible: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diagnosis-history"
        options={{
          title: "Diagnosis",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="tests"
        options={{
          title: "Tests",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "eye" : "eye-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
});
