import React from "react";
import { View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function Divider({ style }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { height: 1, backgroundColor: colors.border, marginVertical: 12 },
        style,
      ]}
    />
  );
}