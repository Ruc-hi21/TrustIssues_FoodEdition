import React from "react";
import { View, Text } from "react-native";

const COLORS = {
  Safe: "#2e7d32",
  Caution: "#f57f17",
  Danger: "#c62828",
  Deadly: "#7b0000",
};

export default function Badge({ rating }) {
  const bg = COLORS[rating] || "#6b7280";
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
        {rating}
      </Text>
    </View>
  );
}