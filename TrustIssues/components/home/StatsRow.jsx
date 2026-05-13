import React from "react";
import { View, Text } from "react-native";
import { useScanStore } from "../../store/scanStore";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

export default function StatsRow() {
  const { recentScans } = useScanStore();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const total = recentScans.length;
  const good = recentScans.filter((s) => s.score >= 80).length;
  const bad = recentScans.filter((s) => s.score < 55).length;

  const Cell = ({ value, label, color }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 14,
        alignItems: "center",
        marginHorizontal: 4,
      }}
    >
      <Text style={{ color, fontSize: 22, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={{ flexDirection: "row", marginBottom: 16, marginHorizontal: -4 }}>
      <Cell value={total} label={t("home.scans")} color={colors.text} />
      <Cell value={good} label={t("home.good")} color={colors.safeLight} />
      <Cell value={bad} label={t("home.bad")} color={colors.dangerLight} />
    </View>
  );
}