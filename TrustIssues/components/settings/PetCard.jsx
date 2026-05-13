import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import { useTheme } from "../../hooks/useTheme";

export default function PetCard({ pet, onPress }) {
  const { colors } = useTheme();
  const icon = pet.species === "cat" ? "logo-octocat" : "paw";
  const allergenCount = pet.allergens?.length || 0;
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={icon} size={22} color={colors.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
              {pet.name}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {pet.species} · {allergenCount} allergen{allergenCount !== 1 ? "s" : ""}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}