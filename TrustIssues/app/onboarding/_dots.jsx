import React from "react";
import { View } from "react-native";

export default function ProgressDots({ active, total }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? 22 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === active ? "#e94560" : "#2a2a3e",
            marginHorizontal: 4,
          }}
        />
      ))}
    </View>
  );
}