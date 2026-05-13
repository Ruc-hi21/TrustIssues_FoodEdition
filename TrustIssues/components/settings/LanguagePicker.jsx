import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LANGUAGES } from "../../constants/languages";
import { useLanguageStore } from "../../store/languageStore";
import { useTheme } from "../../hooks/useTheme";

export default function LanguagePicker() {
  const { language, setLanguage } = useLanguageStore();
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {LANGUAGES.map((l) => {
        const active = language === l.code;
        return (
          <TouchableOpacity
            key={l.code}
            onPress={() => setLanguage(l.code)}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: active ? colors.accent : colors.card,
              margin: 3,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>
              {l.code.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}