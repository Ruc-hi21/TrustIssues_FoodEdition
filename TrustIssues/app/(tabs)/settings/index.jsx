import React from "react";
import { ScrollView, Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import ProfileCard from "../../../components/settings/ProfileCard";
import SettingsRow from "../../../components/settings/SettingsRow";
import PetCard from "../../../components/settings/PetCard";
import ThemeToggle from "../../../components/settings/ThemeToggle";
import LanguagePicker from "../../../components/settings/LanguagePicker";
import Button from "../../../components/ui/Button";
import Divider from "../../../components/ui/Divider";
import { useAuthStore } from "../../../store/authStore";
import { useAllergens } from "../../../hooks/useAllergens";
import { usePets } from "../../../hooks/usePets";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

export default function Settings() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { dbUser, setDbUser, setOnboarded } = useAuthStore();
  const { allergens } = useAllergens();
  const { pets } = usePets();

  const handleSignOut = async () => {
    try {
      await signOut();
      setDbUser(null);
      router.replace("/sign-in");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800", marginBottom: 14 }}>
          {t("settings.title")}
        </Text>

        <ProfileCard name={dbUser?.name} email={dbUser?.email} />

        <SettingsRow
          label={t("settings.editProfile")}
          onPress={() => router.push("/(tabs)/settings/edit-profile")}
        />
        <Divider />

        <SettingsRow
          label={t("settings.myAllergens")}
          value={String(allergens.length)}
          onPress={() => router.push("/(tabs)/settings/allergens")}
        />
        <Divider />

        <Text style={{ color: colors.text, fontWeight: "700", marginTop: 8, marginBottom: 8 }}>
          {t("settings.myPets")}
        </Text>
        {pets.length > 0 ? (
          pets.map((p) => (
            <PetCard
              key={p.id}
              pet={p}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/settings/pet-detail",
                  params: { petId: String(p.id) },
                })
              }
            />
          ))
        ) : (
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>
            No pets added yet.
          </Text>
        )}
        <Button
          label={t("settings.addPet")}
          variant="ghost"
          onPress={() => router.push("/(tabs)/settings/add-pet")}
        />
        <Divider />

        <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
          <Text style={{ color: colors.text, flex: 1 }}>{t("settings.theme")}</Text>
          <ThemeToggle />
        </View>
        <Divider />

        <View style={{ paddingVertical: 8 }}>
          <Text style={{ color: colors.text, marginBottom: 8 }}>{t("settings.language")}</Text>
          <LanguagePicker />
        </View>
        <Divider />

        <Button label={t("settings.signOut")} variant="outline" onPress={handleSignOut} />
      </ScrollView>
    </SafeAreaView>
  );
}