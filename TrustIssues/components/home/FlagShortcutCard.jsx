import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Card from "../ui/Card";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

export default function FlagShortcutCard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/(tabs)/learn")}>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="book" size={24} color={colors.accent} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
              {t("home.foodFlagsExplained")}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 12, marginTop: 2 }}>
              {t("home.learnMore")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}