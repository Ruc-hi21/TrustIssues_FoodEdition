import React from "react";
import { View, Text } from "react-native";

const FLAG_COLORS = {
  red: "#ef5350",
  green: "#4caf50",
  neutral: "#d1d5db",
  allergen: "#ff6b85",
  unknown: "#9ca3af",
};

export default function IngredientRow({ name, description, flag }) {
  const color = FLAG_COLORS[flag] || "#fff";
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color, fontWeight: "600", fontSize: 14 }}>
        • {String(name || "").toUpperCase()}
      </Text>
      {description ? (
        <Text style={{ color: "#9ca3af", fontSize: 12, marginLeft: 12, marginTop: 2 }}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}