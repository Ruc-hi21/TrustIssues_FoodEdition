import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AllergenChip({ label, onRemove, severity }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e94560",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        margin: 4,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
        {label}
        {severity ? ` · ${severity}` : ""}
      </Text>
      {onRemove ? (
        <TouchableOpacity onPress={onRemove} style={{ marginLeft: 6 }}>
          <Ionicons name="close-circle" size={16} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}