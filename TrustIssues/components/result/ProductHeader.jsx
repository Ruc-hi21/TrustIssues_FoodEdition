import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

export default function ProductHeader({ imageUrl, productName, brand }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: "center",
      }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 140, height: 140, borderRadius: 12, marginBottom: 12 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 12,
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
        </View>
      )}
      <Text
        style={{ color: colors.text, fontSize: 18, fontWeight: "700", textAlign: "center" }}
      >
        {productName || "Unknown Product"}
      </Text>
      {brand ? (
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{brand}</Text>
      ) : null}
    </View>
  );
}