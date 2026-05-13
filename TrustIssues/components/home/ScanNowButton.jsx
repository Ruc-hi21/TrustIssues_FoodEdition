import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "../../hooks/useTranslation";

export default function ScanNowButton() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/(tabs)/scan")}
      style={{ marginBottom: 16 }}
    >
      <LinearGradient
        colors={["#e94560", "#f5a623"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingVertical: 18,
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="camera" size={22} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 8 }}>
          {t("home.scanNow")}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}