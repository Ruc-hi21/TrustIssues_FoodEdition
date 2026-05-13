import React, { useState } from "react";
import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import BarcodeScanner from "../../../components/scan/BarcodeScanner";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useScan } from "../../../hooks/useScan";

export default function BarcodeScreen() {
  const router = useRouter();
  const { scanWithBarcode } = useScan();
  const [busy, setBusy] = useState(false);

  const onScan = async (result) => {
    setBusy(true);
    try {
      const res = await scanWithBarcode(result.data);
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
    <View style={{ flex: 1 }}>
      <BarcodeScanner onScan={onScan} />
      {busy && <LoadingSpinner message="Looking up product..." />}
    </View>
  );
}