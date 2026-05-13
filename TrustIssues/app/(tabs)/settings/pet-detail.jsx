import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../components/ui/Button";
import AllergenChip from "../../../components/ui/AllergenChip";
import SettingsRow from "../../../components/settings/SettingsRow";
import Divider from "../../../components/ui/Divider";
import { useAllergenStore } from "../../../store/allergenStore";
import { petService } from "../../../services/petService";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

export default function PetDetail() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { pets, updatePet, removePet } = useAllergenStore();

  const pet = pets.find((p) => String(p.id) === String(petId));

  const [name, setName] = useState(pet?.name || "");
  const [breed, setBreed] = useState(pet?.breed || "");
  const [weight, setWeight] = useState(pet?.weightKg ? String(pet.weightKg) : "");
  const [year, setYear] = useState(pet?.birthYear ? String(pet.birthYear) : "");

  const [petAllergens, setPetAllergens] = useState(pet?.allergens || []);
  const [newAllergen, setNewAllergen] = useState("");
  const [severity, setSeverity] = useState("mild");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pet) return;
    petService.getPetAllergens(pet.id).then((res) => {
      setPetAllergens(res.allergens || []);
    }).catch(() => {});
  }, [petId]);

  if (!pet) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>Pet not found</Text>
      </SafeAreaView>
    );
  }

  const age = pet.birthYear ? new Date().getFullYear() - pet.birthYear : null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await petService.updatePet(pet.id, {
        name,
        breed: breed || undefined,
        weightKg: weight ? parseFloat(weight) : undefined,
        birthYear: year ? parseInt(year, 10) : undefined,
      });
      updatePet(pet.id, res?.pet || { name, breed, weightKg: weight, birthYear: year });
      Alert.alert("Saved");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllergen = async () => {
    if (!newAllergen.trim()) return;
    try {
      const res = await petService.addPetAllergen(pet.id, newAllergen.trim(), severity);
      setPetAllergens((prev) => [...prev, res.allergen || { id: Date.now(), allergen: newAllergen, severity }]);
      setNewAllergen("");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleRemoveAllergen = async (id) => {
    try {
      await petService.deletePetAllergen(pet.id, id);
      setPetAllergens((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDeletePet = () => {
    Alert.alert("Delete pet?", `This will remove ${pet.name}.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await petService.deletePet(pet.id);
            removePet(pet.id);
            router.back();
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Ionicons
            name={pet.species === "cat" ? "logo-octocat" : "paw"}
            size={56}
            color={colors.accent}
          />
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 8 }}>
            {pet.name}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            {pet.species}{age != null ? ` · ${age} yr` : ""}
          </Text>
        </View>

        <Field label={t("settings.name")} value={name} onChangeText={setName} />
        <Field label={t("settings.breed")} value={breed} onChangeText={setBreed} />
        <Field label={t("settings.weight")} value={weight} onChangeText={setWeight} keyboardType="numeric" />
        <Field label={t("settings.birthYear")} value={year} onChangeText={setYear} keyboardType="numeric" />

        <Button label={t("settings.saveChanges")} onPress={handleSave} loading={loading} />

        <Divider />

        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 10 }}>Pet Allergens</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
          {petAllergens.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>None.</Text>
          ) : (
            petAllergens.map((a) => (
              <AllergenChip
                key={a.id}
                label={a.allergen}
                severity={a.severity}
                onRemove={() => handleRemoveAllergen(a.id)}
              />
            ))
          )}
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 8,
          }}
        >
          <TextInput
            value={newAllergen}
            onChangeText={setNewAllergen}
            placeholder="Add allergen"
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.text, padding: 14, fontSize: 14 }}
          />
        </View>
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          {["mild", "moderate", "severe"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSeverity(s)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                marginRight: 6,
                backgroundColor: severity === s ? colors.accent : colors.surface,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, textTransform: "capitalize" }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button label="Add Allergen" onPress={handleAddAllergen} disabled={!newAllergen.trim()} />

        <Divider />

        <SettingsRow
          label={t("settings.manageHazards")}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/settings/pet-hazards",
              params: { petId: String(pet.id) },
            })
          }
        />

        <Divider />
        <Button label={t("settings.deletePet")} variant="outline" onPress={handleDeletePet} />
      </ScrollView>
    </SafeAreaView>
  );
}