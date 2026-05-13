import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Button from "../ui/Button";
import { useTranslation } from "../../hooks/useTranslation";

export default function BarcodeScanner({ onScan }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { t } = useTranslation();

  if (!permission) return <View style={{ flex: 1, backgroundColor: "#000" }} />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0a", padding: 24 }}>
        <Ionicons name="barcode-outline" size={64} color="#9ca3af" />
        <Text style={{ color: "#fff", marginVertical: 16 }}>
          {t("scan.permissionRequired")}
        </Text>
        <Button label={t("scan.grantPermission")} onPress={requestPermission} />
      </View>
    );
  }

  const handle = (result) => {
    if (scanned) return;
    setScanned(true);
    onScan && onScan(result);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr", "code128"],
        }}
        onBarcodeScanned={scanned ? undefined : handle}
      />
      <View style={{ ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: 260,
            height: 160,
            borderWidth: 2,
            borderColor: "#fff",
            borderRadius: 12,
          }}
        />
        <Text style={{ color: "#fff", marginTop: 14 }}>Align barcode within frame</Text>
      </View>
    </View>
  );
}