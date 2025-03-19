// app/(app)/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="diagnosis/[id]"
        options={{
          headerShown: true,
          headerTitle: "Diagnosis Details",
          presentation: "card",
        }}
      />
      {/* Add other non-tab screens here */}
    </Stack>
  );
}
