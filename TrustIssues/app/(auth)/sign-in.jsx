import React, { useState } from "react";
import { View, Text, TextInput, Image, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Sign in incomplete", "Please verify your account.");
      }
    } catch (e) {
      Alert.alert("Sign In Failed", e.errors?.[0]?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: "center" }}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 12 }}
            />
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>
              {t("auth.welcomeBack")}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              {t("auth.startVerifying")}
            </Text>
          </View>

          <Card>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 4 }}>
              {t("auth.signIn")} ✨
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 16 }}>
              {t("auth.fillDetails")}
            </Text>

            <Field icon="mail" placeholder={t("auth.email")} value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Field
              icon="lock-closed"
              placeholder={t("auth.password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              right={
                <TouchableOpacity onPress={() => setShowPwd((s) => !s)}>
                  <Ionicons name={showPwd ? "eye-off" : "eye"} size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              }
            />

            <Button label={t("auth.signIn")} onPress={handleSignIn} loading={loading} />
          </Card>

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16 }}>
            <Text style={{ color: colors.textSecondary }}>{t("auth.noAccount")} </Text>
            <TouchableOpacity onPress={() => router.replace("/sign-up")}>
              <Text style={{ color: colors.accent, fontWeight: "700" }}>{t("auth.signUp")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ icon, right, ...props }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#16213e",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
      }}
    >
      <Ionicons name={icon} size={18} color="#9ca3af" />
      <TextInput
        {...props}
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
        style={{ flex: 1, color: "#fff", padding: 14, fontSize: 14 }}
      />
      {right}
    </View>
  );
}