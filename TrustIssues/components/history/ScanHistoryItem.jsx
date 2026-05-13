import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { useRouter } from "expo-router";
import Card from "../ui/Card";
import ScoreCircle from "../ui/ScoreCircle";
import { useTheme } from "../../hooks/useTheme";

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ScanHistoryItem({ scan, onLongPress }) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/history/${scan.scanId || scan.id}`)}
      onLongPress={onLongPress}
    >
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "700" }} numberOfLines={1}>
              {scan.productName || scan.productNameGuess || "Unknown product"}
            </Text>
            {scan.brand ? (
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{scan.brand}</Text>
            ) : null}
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>
              {formatDate(scan.createdAt || scan.analysedAt)}
            </Text>
          </View>
          <ScoreCircle score={scan.score || 0} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}