import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";

export default function EmptyState({ icon = "information-circle-outline", message, ctaLabel, onCta }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", padding: 40 }}>
      <Ionicons name={icon} size={64} color="#6b7280" />
      <Text
        style={{
          color: "#9ca3af",
          textAlign: "center",
          fontSize: 14,
          marginTop: 16,
          marginBottom: 20,
        }}
      >
        {message}
      </Text>
      {ctaLabel && onCta ? (
        <Button label={ctaLabel} onPress={onCta} style={{ minWidth: 180 }} />
      ) : null}
    </View>
  );
}