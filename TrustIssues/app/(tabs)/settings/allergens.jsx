import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AllergenChip from "../../../components/ui/AllergenChip";
import Button from "../../../components/ui/Button";
import { useAllergens } from "../../../hooks/useAllergens";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

const SEVERITIES = ["mild", "moderate", "severe"];

export default function AllergensScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { allergens, addAllergen, removeAllergen } = useAllergens();
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState("mild");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await addAllergen(name.trim(), severity);
      setName("");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeAllergen(id);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 10 }}>
          Your Allergens
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
          {allergens.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>None yet.</Text>
          ) : (
            allergens.map((a) => (
              <AllergenChip
                key={a.id}
                label={a.allergen}
                severity={a.severity}
                onRemove={() => handleRemove(a.id)}
              />
            ))
          )}
        </View>

        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 6 }}>
          Add allergen
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 12,
          }}
        >
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Peanuts"
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.text, padding: 14, fontSize: 14 }}
          />
        </View>

        <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>{t("settings.severity")}</Text>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          {SEVERITIES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSeverity(s)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                marginRight: 8,
                backgroundColor: severity === s ? colors.accent : colors.surface,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, textTransform: "capitalize" }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button label={t("common.add")} onPress={handleAdd} loading={loading} disabled={!name.trim()} />
      </ScrollView>
    </SafeAreaView>
  );
}