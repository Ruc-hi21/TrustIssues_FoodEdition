import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import { useTheme } from "../../hooks/useTheme";

export default function Done() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useUser();
  const { setOnboarded, setDbUser } = useAuthStore();
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

    (async () => {
      try {
        if (user) {
          const name = user.fullName || user.firstName || "User";
          const email = user.primaryEmailAddress?.emailAddress || "";
          const res = await authService.syncUser(name, email);
          if (res?.user) setDbUser(res.user);
        }
      } catch {}
      setOnboarded(true);
      setTimeout(() => router.replace("/(tabs)/home"), 1100);
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="checkmark" size={72} color="#fff" />
        </View>
      </Animated.View>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 24 }}>
        You're all set! ✅
      </Text>
    </SafeAreaView>
  );
}