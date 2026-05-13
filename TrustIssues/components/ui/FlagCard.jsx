import React from "react";
import { View, Text } from "react-native";

const STYLES = {
  red: { borderColor: "#c62828", bg: "#2e0d0d" },
  green: { borderColor: "#2e7d32", bg: "#0d2e10" },
  neutral: { borderColor: "#6b7280", bg: "#1f2937" },
  allergen: { borderColor: "#e94560", bg: "#2e0a1a" },
};

export default function FlagCard({ type = "neutral", title, children }) {
  const style = STYLES[type] || STYLES.neutral;
  return (
    <View
      style={{
        borderLeftWidth: 4,
        borderLeftColor: style.borderColor,
        backgroundColor: style.bg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
      }}
    >
      {title ? (
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginBottom: 6 }}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}