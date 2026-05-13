import { Stack } from "expo-router";

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#0a0a0a" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[scanId]"
        options={{
          headerShown: true,
          title: "Scan Detail",
          headerStyle: { backgroundColor: "#1a1a2e" },
          headerTintColor: "#e94560",
          headerTitleStyle: { color: "#fff" },
        }}
      />
    </Stack>
  );
}