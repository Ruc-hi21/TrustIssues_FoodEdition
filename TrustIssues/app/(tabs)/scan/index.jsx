import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ScanOptionCard from "../../../components/scan/ScanOptionCard";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

export default function ScanHub() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800", marginBottom: 4 }}>
          Scan a Product
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 20 }}>
          Choose how you'd like to analyse this item.
        </Text>

        <ScanOptionCard
          icon="camera"
          title={t("scan.cameraScan")}
          description={t("scan.cameraDesc")}
          onPress={() => router.push("/(tabs)/scan/camera")}
        />
        <ScanOptionCard
          icon="barcode"
          title={t("scan.barcodeScan")}
          description={t("scan.barcodeDesc")}
          onPress={() => router.push("/(tabs)/scan/barcode")}
        />
        <ScanOptionCard
          icon="pencil"
          title={t("scan.manualEntry")}
          description={t("scan.manualDesc")}
          onPress={() => router.push("/(tabs)/scan/manual")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}