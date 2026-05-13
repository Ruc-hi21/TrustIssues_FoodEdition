import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Button from "../../../components/ui/Button";
import LanguagePicker from "../../../components/settings/LanguagePicker";
import { useAuthStore } from "../../../store/authStore";
import { useLanguageStore } from "../../../store/languageStore";
import { userService } from "../../../services/userService";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

export default function EditProfile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { dbUser, setDbUser } = useAuthStore();
  const { language } = useLanguageStore();

  const [name, setName] = useState(dbUser?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await userService.updateProfile({ name, preferredLanguage: language });
      if (res?.user) setDbUser(res.user);
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
        <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>{t("settings.name")}</Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 16,
          }}
        >
          <TextInput
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.text, padding: 14, fontSize: 14 }}
          />
        </View>

        <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>{t("settings.language")}</Text>
        <LanguagePicker />

        <View style={{ height: 24 }} />
        <Button label={t("settings.saveChanges")} onPress={handleSave} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}