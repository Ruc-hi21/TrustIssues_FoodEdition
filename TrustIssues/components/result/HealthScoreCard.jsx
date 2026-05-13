import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Badge from "../ui/Badge";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

export default function HealthScoreCard({ score, rating, ratingColor, isDangerous }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const color = ratingColor || (score >= 80 ? "#2e7d32" : score >= 55 ? "#f57f17" : "#c62828");
  const finalRating = isDangerous ? "Danger" : rating;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
      }}
    >
      {isDangerous ? (
        <View
          style={{
            backgroundColor: "#2e0d0d",
            borderRadius: 10,
            padding: 10,
            marginBottom: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="warning" size={18} color="#ef5350" />
          <Text style={{ color: "#ef5350", marginLeft: 8, fontWeight: "700", fontSize: 12 }}>
            {t("result.dangerous")}
          </Text>
        </View>
      ) : null}
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
        {t("result.healthScore")}
      </Text>
      <Text style={{ color, fontSize: 44, fontWeight: "800", marginVertical: 6 }}>
        {Math.round(score)}/100
      </Text>
      <Badge rating={finalRating} />
    </View>
  );
}