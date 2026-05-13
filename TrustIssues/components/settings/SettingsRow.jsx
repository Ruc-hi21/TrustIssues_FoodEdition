import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

export default function SettingsRow({ label, value, onPress, showChevron = true, rightElement }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{label}</Text>
      {rightElement ? (
        rightElement
      ) : value !== undefined && value !== null ? (
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginRight: 6 }}>
          {value}
        </Text>
      ) : null}
      {showChevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      ) : null}
    </TouchableOpacity>
  );
}