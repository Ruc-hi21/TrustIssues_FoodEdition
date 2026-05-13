import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Card from "../ui/Card";
import ScoreCircle from "../ui/ScoreCircle";
import { useScanStore } from "../../store/scanStore";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

export default function RecentScansList() {
  const { recentScans } = useScanStore();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const items = recentScans.slice(0, 3);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
          {t("home.recentScans")}
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
          <Text style={{ color: colors.accent, fontSize: 13 }}>
            {t("home.viewAll")}
          </Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
            {t("home.noScans")}
          </Text>
        </Card>
      ) : (
        items.map((s) => (
          <TouchableOpacity
            key={s.scanId}
            activeOpacity={0.85}
            onPress={() => router.push(`/history/${s.scanId}`)}
          >
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }} numberOfLines={1}>
                    {s.productName || "Unknown product"}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {s.rating}
                  </Text>
                </View>
                <ScoreCircle score={s.score} />
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}