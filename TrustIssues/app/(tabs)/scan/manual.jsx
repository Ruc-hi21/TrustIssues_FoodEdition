import React, { useState } from "react";
import { ScrollView, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ManualInput from "../../../components/scan/ManualInput";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useScan } from "../../../hooks/useScan";
import { useTheme } from "../../../hooks/useTheme";

export default function ManualScreen() {
  const router = useRouter();
  const { scanManually } = useScan();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);

  const onSubmit = async (text) => {
    setBusy(true);
    try {
      const res = await scanManually(text);
      router.replace({
        pathname: "/(tabs)/scan/result",
        params: { data: JSON.stringify(res) },
      });
    } catch (e) {
      Alert.alert("Scan Failed", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", marginBottom: 4 }}>
          Manual Entry
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 20 }}>
          Type or paste the ingredients list below.
        </Text>
        <ManualInput onSubmit={onSubmit} busy={busy} />
      </ScrollView>
      {busy && <LoadingSpinner message="Analysing..." />}
    </SafeAreaView>
  );
}