import React, { useState } from "react";
import { View, TextInput, Text } from "react-native";
import Button from "../ui/Button";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

export default function ManualInput({ onSubmit, busy }) {
  const [text, setText] = useState("");
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 12,
          minHeight: 200,
          marginBottom: 8,
        }}
      >
        <TextInput
          multiline
          value={text}
          onChangeText={setText}
          placeholder={t("scan.placeholder")}
          placeholderTextColor={colors.textSecondary}
          style={{
            color: colors.text,
            fontSize: 14,
            minHeight: 180,
            textAlignVertical: "top",
          }}
        />
      </View>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 11,
          textAlign: "right",
          marginBottom: 12,
        }}
      >
        {text.length} chars
      </Text>
      <Button
        label={t("scan.analyse")}
        onPress={() => onSubmit && onSubmit(text)}
        disabled={!text.trim()}
        loading={busy}
      />
    </View>
  );
}