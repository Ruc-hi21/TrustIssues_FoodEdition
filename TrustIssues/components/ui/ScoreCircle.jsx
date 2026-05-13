import React from "react";
import { View, Text } from "react-native";

export default function ScoreCircle({ score = 0, size = 48 }) {
  let bg = "#c62828";
  if (score >= 80) bg = "#2e7d32";
  else if (score >= 55) bg = "#f57f17";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.36 }}>
        {Math.round(score)}
      </Text>
    </View>
  );
}