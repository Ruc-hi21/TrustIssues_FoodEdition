import React from "react";
import { View, Text } from "react-native";
import Card from "../ui/Card";
import { useTheme } from "../../hooks/useTheme";

export default function ProfileCard({ name, email }) {
  const { colors } = useTheme();
  const initial = (name || "?").charAt(0).toUpperCase();
  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>{initial}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
            {name || "User"}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{email}</Text>
        </View>
      </View>
    </Card>
  );
}