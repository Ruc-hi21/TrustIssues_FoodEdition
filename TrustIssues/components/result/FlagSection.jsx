import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FlagCard from "../ui/FlagCard";
import IngredientRow from "../ui/IngredientRow";
import { FLAG_TYPES } from "../../constants/flags";

const TITLES = {
  red: "Red Flags",
  green: "Green Flags",
  neutral: "Neutral Ingredients",
  allergen: "Allergen Matches",
};

export default function FlagSection({ type, flags }) {
  if (!flags || flags.length === 0) return null;
  const meta = FLAG_TYPES[type] || FLAG_TYPES.neutral;

  return (
    <View style={{ marginBottom: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Ionicons name={meta.icon} size={18} color={meta.color} />
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginLeft: 6 }}>
          {TITLES[type]} ({flags.length})
        </Text>
      </View>
      <FlagCard type={type}>
        {flags.map((f, i) => (
          <IngredientRow
            key={i}
            name={f.ingredient || f.ruleName || f.raw || f.normName}
            description={f.description || f.recommendation}
            flag={type}
          />
        ))}
      </FlagCard>
    </View>
  );
}