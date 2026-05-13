import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useAuthStore } from "../store/authStore";

export default function Index() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { isOnboarded } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in");
    } else if (!isOnboarded) {
      router.replace("/onboarding/slide1");
    } else {
      router.replace("/(tabs)/home");
    }
  }, [isLoaded, isSignedIn, isOnboarded]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#e94560" size="large" />
    </View>
  );
}