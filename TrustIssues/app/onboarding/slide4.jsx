import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/ui/Button";
import ProgressDots from "./_dots";
import { useTheme } from "../../hooks/useTheme";
import { petService } from "../../services/petService";

export default function Slide4() {
  const router = useRouter();
  const { colors } = useTheme();
  const [species, setSpecies] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!species || !name.trim()) {
      router.push("/onboarding/done");
      return;
    }
    setLoading(true);
    try {
      await petService.addPet({ name: name.trim(), species });
      router.push("/onboarding/done");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const Box = ({ value, label, icon }) => {
    const active = species === value;
    return (
      <TouchableOpacity
        onPress={() => setSpecies(value)}
        activeOpacity={0.85}
        style={{
          flex: 1,
          padding: 24,
          margin: 6,
          borderRadius: 16,
          alignItems: "center",
          backgroundColor: active ? colors.accent : colors.surface,
          borderWidth: 2,
          borderColor: active ? colors.accent : "transparent",
        }}
      >
        <Ionicons name={icon} size={42} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", marginTop: 8 }}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "space-between" }}>
        <View style={{ marginTop: 40 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>
            Do you have a pet?
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 8, marginBottom: 24 }}>
            We'll check food safety for them too.
          </Text>

          <View style={{ flexDirection: "row" }}>
            <Box value="dog" label="Dog 🐶" icon="paw" />
            <Box value="cat" label="Cat 🐱" icon="logo-octocat" />
          </View>

          {species ? (
            <View
              style={{
                backgroundColor: colors.surface,
                marginTop: 18,
                borderRadius: 12,
                paddingHorizontal: 14,
              }}
            >
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Pet name"
                placeholderTextColor={colors.textSecondary}
                style={{ color: colors.text, padding: 14, fontSize: 14 }}
              />
            </View>
          ) : null}
        </View>
        <View>
          <ProgressDots active={3} total={4} />
          <Button label="Add Pet" onPress={handleAdd} loading={loading} disabled={species && !name.trim()} />
          <Button label="Skip" variant="ghost" onPress={() => router.push("/onboarding/done")} />
        </View>
      </View>
    </SafeAreaView>
  );
}