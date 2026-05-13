import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import { useTheme } from "../../hooks/useTheme";

export default function HazardSearchResult({ result }) {
  const { colors } = useTheme();
  const isPet = result.type === "pet_toxin";
  const color = isPet ? "#f57f17" : "#e94560";
  const icon = isPet ? "paw" : "warning";

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={{ color: colors.text, fontWeight: "700", marginLeft: 6 }}>
          {result.name}
        </Text>
        <View
          style={{
            marginLeft: "auto",
            backgroundColor: color,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>
            {isPet ? "PET TOXIN" : "ALLERGEN"}
          </Text>
        </View>
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 19 }}>
        {result.description}
      </Text>
      {result.keywords?.length > 0 ? (
        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6, fontStyle: "italic" }}>
          Also: {result.keywords.slice(0, 5).join(", ")}
        </Text>
      ) : null}
    </Card>
  );
}