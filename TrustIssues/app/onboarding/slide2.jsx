import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/ui/Button";
import ProgressDots from "./_dots";
import { useTheme } from "../../hooks/useTheme";

const FLAGS = [
  { color: "#2e7d32", icon: "checkmark-circle", label: "Green Flag", desc: "Beneficial or clean ingredients" },
  { color: "#9ca3af", icon: "ellipse-outline", label: "White Flag", desc: "Neutral, okay in moderation" },
  { color: "#c62828", icon: "flag", label: "Red Flag", desc: "Harmful or suspect, avoid where possible" },
  { color: "#e94560", icon: "warning", label: "Allergen", desc: "Matches YOUR allergen list — dangerous" },
];

export default function Slide2() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "space-between" }}>
        <View style={{ marginTop: 40 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>
            Understand Your Food
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 8, marginBottom: 28 }}>
            We use a simple flag system so you know at a glance.
          </Text>
          {FLAGS.map((f) => (
            <View
              key={f.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                padding: 14,
                borderRadius: 12,
                marginBottom: 10,
              }}
            >
              <Ionicons name={f.icon} size={26} color={f.color} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>{f.label}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <View>
          <ProgressDots active={1} total={4} />
          <Button label="Next" onPress={() => router.push("/onboarding/slide3")} />
        </View>
      </View>
    </SafeAreaView>
  );
}