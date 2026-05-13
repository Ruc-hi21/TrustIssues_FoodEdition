import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Button from "../../components/ui/Button";
import ProgressDots from "./_dots";
import { useTheme } from "../../hooks/useTheme";
import { userService } from "../../services/userService";

const COMMON = [
  "Milk", "Eggs", "Fish", "Shellfish", "Peanuts", "Tree Nuts",
  "Wheat/Gluten", "Soy", "Sesame", "Mustard", "Celery", "Sulphites",
];

export default function Slide3() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = (item) => {
    setSelected((s) =>
      s.includes(item) ? s.filter((x) => x !== item) : [...s, item]
    );
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      for (const a of selected) {
        try {
          await userService.addAllergen(a, "unknown");
        } catch {}
      }
      router.push("/onboarding/slide4");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "space-between" }}>
        <View style={{ marginTop: 40 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>
            What are you allergic to?
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 8, marginBottom: 24 }}>
            We'll flag these in every scan. You can change this later.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {COMMON.map((item) => {
              const active = selected.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggle(item)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: active ? colors.accent : colors.surface,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 999,
                    margin: 4,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View>
          <ProgressDots active={2} total={4} />
          <Button label="Continue" onPress={handleContinue} loading={loading} />
          <Button label="Skip" variant="ghost" onPress={() => router.push("/onboarding/slide4")} />
        </View>
      </View>
    </SafeAreaView>
  );
}