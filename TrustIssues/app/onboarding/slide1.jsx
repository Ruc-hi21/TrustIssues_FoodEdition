import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Button from "../../components/ui/Button";
import ProgressDots from "./_dots";
import { useTheme } from "../../hooks/useTheme";

export default function Slide1() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 24 }}
          />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", textAlign: "center" }}>
            Welcome to TrustIssues 🚩
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: 12, lineHeight: 20 }}>
            Know exactly what's in your food before you eat it.
          </Text>
        </View>
        <View>
          <ProgressDots active={0} total={4} />
          <Button label="Next" onPress={() => router.push("/onboarding/slide2")} />
        </View>
      </View>
    </SafeAreaView>
  );
}