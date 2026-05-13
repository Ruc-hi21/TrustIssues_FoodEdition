import React, { useState } from "react";
import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import CameraCapture from "../../../components/scan/CameraCapture";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useScan } from "../../../hooks/useScan";

export default function CameraScreen() {
  const router = useRouter();
  const { scanWithCamera, loading } = useScan();
  const [busy, setBusy] = useState(false);

  const onCapture = async (photo) => {
    setBusy(true);
    try {
      const result = await scanWithCamera(photo.base64);
      router.replace({
        pathname: "/(tabs)/scan/result",
        params: { data: JSON.stringify(result) },
      });
    } catch (e) {
      Alert.alert("Scan Failed", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraCapture onCapture={onCapture} busy={busy || loading} />
      {(busy || loading) && <LoadingSpinner message="Analysing..." />}
    </View>
  );
}