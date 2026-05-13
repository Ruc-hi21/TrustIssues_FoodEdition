import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

export default function IngredientRawCard({ raw }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  if (!raw) return null;
  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Ionicons name="document-text-outline" size={18} color={colors.accent} />
        <Text style={{ color: colors.text, fontWeight: "700", marginLeft: 6 }}>
          {t("result.rawIngredients")}
        </Text>
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
        {raw}
      </Text>
    </Card>
  );
}