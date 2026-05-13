import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import { useTheme } from "../../hooks/useTheme";

const NUTRI_COLORS = {
  a: "#2e7d32", b: "#7cb342", c: "#fbc02d", d: "#f57f17", e: "#c62828",
};
const NOVA_LABELS = {
  1: "Unprocessed",
  2: "Processed ingredients",
  3: "Processed food",
  4: "Ultra-processed",
};

export default function NutriNovaCard({ nutriscoreGrade, novaGroup }) {
  const { colors } = useTheme();
  const grade = (nutriscoreGrade || "").toLowerCase();
  const nutriColor = NUTRI_COLORS[grade] || "#6b7280";
  const novaLabel = NOVA_LABELS[novaGroup] || "Unknown";

  return (
    <Card>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Nutri-Score</Text>
          <View
            style={{
              backgroundColor: nutriColor,
              width: 60,
              height: 60,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800" }}>
              {grade ? grade.toUpperCase() : "?"}
            </Text>
          </View>
        </View>
        <View style={{ width: 1, backgroundColor: colors.border }} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>NOVA Group</Text>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 6 }}>
            {novaGroup || "?"}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: "center" }}>
            {novaLabel}
          </Text>
          {novaGroup === 4 ? (
            <Ionicons name="warning" size={16} color={colors.caution} style={{ marginTop: 4 }} />
          ) : null}
        </View>
      </View>
    </Card>
  );
}