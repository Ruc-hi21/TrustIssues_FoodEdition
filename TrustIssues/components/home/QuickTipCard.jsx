import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import { QUICK_TIPS } from "../../constants/tips";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

export default function QuickTipCard() {
  const [index, setIndex] = useState(0);
  const { colors } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % QUICK_TIPS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Ionicons name="bulb" size={18} color={colors.accent} />
        <Text
          style={{
            color: colors.accent,
            fontWeight: "700",
            fontSize: 13,
            marginLeft: 6,
          }}
        >
          {t("home.quickTip")}
        </Text>
      </View>
      <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
        {QUICK_TIPS[index]}
      </Text>
    </Card>
  );
}