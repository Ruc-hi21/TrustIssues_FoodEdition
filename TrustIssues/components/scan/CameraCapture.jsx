import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Button from "../ui/Button";
import { useTranslation } from "../../hooks/useTranslation";

export default function CameraCapture({ onCapture, busy }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { t } = useTranslation();

  if (!permission) return <View style={{ flex: 1, backgroundColor: "#000" }} />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0a0a", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Ionicons name="camera-outline" size={64} color="#9ca3af" />
        <Text style={{ color: "#fff", marginVertical: 16, textAlign: "center" }}>
          {t("scan.permissionRequired")}
        </Text>
        <Button label={t("scan.grantPermission")} onPress={requestPermission} />
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || busy) return;
    const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
    onCapture && onCapture(photo);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <View
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={handleCapture}
          disabled={busy}
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            backgroundColor: "#fff",
            borderWidth: 4,
            borderColor: "rgba(255,255,255,0.4)",
            opacity: busy ? 0.5 : 1,
          }}
        />
      </View>
    </View>
  );
}