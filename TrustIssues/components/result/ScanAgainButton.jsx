import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "../../hooks/useTranslation";

export default function ScanAgainButton() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.replace("/(tabs)/scan")}
      style={{ marginTop: 8, marginBottom: 24 }}
    >
      <LinearGradient
        colors={["#e94560", "#f5a623"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingVertical: 16,
          borderRadius: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="camera" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 8 }}>
          {t("result.scanAgain")}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}