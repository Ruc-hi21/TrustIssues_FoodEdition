import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#0a0a0a" },
        headerStyle: { backgroundColor: "#1a1a2e" },
        headerTintColor: "#e94560",
        headerTitleStyle: { color: "#fff" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ title: "Edit Profile" }} />
      <Stack.Screen name="allergens" options={{ title: "My Allergens" }} />
      <Stack.Screen name="add-pet" options={{ title: "Add Pet" }} />
      <Stack.Screen name="pet-detail" options={{ title: "Pet Details" }} />
      <Stack.Screen name="pet-hazards" options={{ title: "Hazard Ingredients" }} />
    </Stack>
  );
}