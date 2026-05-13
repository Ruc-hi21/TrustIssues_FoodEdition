import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "../../hooks/useTranslation";

export default function HeroBanner() {
  const { t } = useTranslation();
  return (
    <LinearGradient
      colors={["#e94560", "#1a1a2e"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, padding: 20, marginBottom: 16 }}
    >
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
        {t("home.welcome")}
      </Text>
      <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 4 }}>
        {t("home.title")}
      </Text>
      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 6 }}>
        {t("home.tagline")}
      </Text>
    </LinearGradient>
  );
}