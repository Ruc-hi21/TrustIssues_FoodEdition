import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        backgroundColor: colors.card,
        padding: 4,
        borderRadius: 999,
      }}
    >
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: !isDark ? colors.accent : "transparent",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12 }}>☀️ Light</Text>
      </View>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: isDark ? colors.accent : "transparent",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12 }}>🌙 Dark</Text>
      </View>
    </TouchableOpacity>
  );
}