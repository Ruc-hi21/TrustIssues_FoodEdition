import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../components/ui/Button";
import { usePets } from "../../../hooks/usePets";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

export default function AddPet() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { addPet } = usePets();
  const [species, setSpecies] = useState(null);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [weight, setWeight] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);

  const Box = ({ value, label, icon }) => {
    const active = species === value;
    return (
      <TouchableOpacity
        onPress={() => setSpecies(value)}
        activeOpacity={0.85}
        style={{
          flex: 1,
          padding: 20,
          margin: 6,
          borderRadius: 14,
          alignItems: "center",
          backgroundColor: active ? colors.accent : colors.surface,
        }}
      >
        <Ionicons name={icon} size={36} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", marginTop: 6 }}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const Field = ({ label, value, onChangeText, ...rest }) => (
    <>
      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>{label}</Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          paddingHorizontal: 12,
          marginBottom: 12,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.textSecondary}
          style={{ color: colors.text, padding: 14, fontSize: 14 }}
          {...rest}
        />
      </View>
    </>
  );

  const handleAdd = async () => {
    if (!species || !name.trim()) return;
    setLoading(true);
    try {
      await addPet({
        name: name.trim(),
        species,
        breed: breed || undefined,
        weightKg: weight ? parseFloat(weight) : undefined,
        birthYear: year ? parseInt(year, 10) : undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>{t("settings.species")}</Text>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <Box value="dog" label="Dog 🐶" icon="paw" />
          <Box value="cat" label="Cat 🐱" icon="logo-octocat" />
        </View>

        <Field label={t("settings.name")} value={name} onChangeText={setName} placeholder="Pet name" />
        <Field label={t("settings.breed")} value={breed} onChangeText={setBreed} placeholder="Optional" />
        <Field label={t("settings.weight")} value={weight} onChangeText={setWeight} placeholder="Optional" keyboardType="numeric" />
        <Field label={t("settings.birthYear")} value={year} onChangeText={setYear} placeholder="Optional" keyboardType="numeric" />

        <Button
          label={t("settings.addPet")}
          onPress={handleAdd}
          loading={loading}
          disabled={!species || !name.trim()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}