import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../hooks/useTheme";

export default function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[{ opacity: isDisabled ? 0.5 : 1 }, style]}
      >
        <LinearGradient
          colors={["#e94560", "#f5a623"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === "ghost") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[{ opacity: isDisabled ? 0.5 : 1, paddingVertical: 14, alignItems: "center" }, style]}
      >
        <Text style={{ color: colors.accent, fontWeight: "600" }}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // outline
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        {
          opacity: isDisabled ? 0.5 : 1,
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: colors.accent,
          alignItems: "center",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <Text style={{ color: colors.accent, fontWeight: "600" }}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}