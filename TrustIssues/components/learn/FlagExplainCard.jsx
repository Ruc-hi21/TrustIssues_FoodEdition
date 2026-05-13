import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FlagExplainCard({ type, label, color, icon, description, simplyPut, examples = [] }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };

  return (
    <View
      style={{
        borderLeftWidth: 4,
        borderLeftColor: color,
        backgroundColor: "#1a1a2e",
        borderRadius: 12,
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.8}
        style={{ padding: 14, flexDirection: "row", alignItems: "center" }}
      >
        <Ionicons name={icon} size={22} color={color} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{label}</Text>
          <Text style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }}>{description}</Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
      </TouchableOpacity>
      {open ? (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
          <Text style={{ color: "#d1d5db", fontSize: 13, lineHeight: 19, marginBottom: 8 }}>
            {simplyPut}
          </Text>
          {examples.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {examples.map((e, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: "#2a2a3e",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    margin: 3,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11 }}>{e}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}