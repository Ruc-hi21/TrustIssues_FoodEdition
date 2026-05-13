import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import { petService } from "../../../services/petService";
import { useTheme } from "../../../hooks/useTheme";

export default function PetHazards() {
  const { petId } = useLocalSearchParams();
  const { colors } = useTheme();
  const [hazards, setHazards] = useState([]);
  const [ingredient, setIngredient] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    petService
      .getPetHazards(petId)
      .then((res) => setHazards(res.hazards || []))
      .catch(() => {});
  }, [petId]);

  const handleAdd = async () => {
    if (!ingredient.trim()) return;
    setLoading(true);
    try {
      const res = await petService.addPetHazard(petId, ingredient.trim(), notes || undefined);
      setHazards((prev) => [...prev, res.hazard || { id: Date.now(), ingredient, notes }]);
      setIngredient("");
      setNotes("");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await petService.deletePetHazard(petId, id);
      setHazards((prev) => prev.filter((h) => h.id !== id));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 10 }}>
          Custom Hazard Ingredients
        </Text>

        {hazards.length === 0 ? (
          <EmptyState icon="paw-outline" message="No custom hazards added yet." />
        ) : (
          hazards.map((h) => (
            <Card key={h.id}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{h.ingredient}</Text>
                  {h.notes ? (
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                      {h.notes}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => handleRemove(h.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <Text style={{ color: colors.text, fontWeight: "700", marginTop: 16, marginBottom: 8 }}>
          Add new
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 10,
          }}
        >
          <TextInput
            value={ingredient}
            onChangeText={setIngredient}
            placeholder="Ingredient name"
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.text, padding: 14, fontSize: 14 }}
          />
        </View>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 12,
          }}
        >
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes (optional)"
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.text, padding: 14, fontSize: 14 }}
          />
        </View>
        <Button label="Add Hazard" onPress={handleAdd} loading={loading} disabled={!ingredient.trim()} />
      </ScrollView>
    </SafeAreaView>
  );
}