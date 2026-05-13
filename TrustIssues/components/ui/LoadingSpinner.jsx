import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

export default function LoadingSpinner({ message }) {
  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.7)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <ActivityIndicator size="large" color="#e94560" />
      {message ? (
        <Text style={{ color: "#fff", marginTop: 12, fontSize: 14 }}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}