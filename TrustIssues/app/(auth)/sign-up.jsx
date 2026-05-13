import React, { useState } from "react";
import { View, Text, TextInput, Image, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [code, setCode] = useState("");
  const [pendingVerify, setPendingVerify] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerify(true);
    } catch (e) {
      Alert.alert("Sign Up Failed", e.errors?.[0]?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/onboarding/slide1");
      } else {
        Alert.alert("Verification incomplete");
      }
    } catch (e) {
      Alert.alert("Verification Failed", e.errors?.[0]?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: "center" }}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 12 }}
            />
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>
              {t("auth.joinTrustIssues")}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              {t("auth.startVerifying")}
            </Text>
          </View>

          <Card>
            {!pendingVerify ? (
              <>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 4 }}>
                  {t("auth.createAccount")} ✨
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 16 }}>
                  {t("auth.fillDetails")}
                </Text>
                <Field icon="person" placeholder={t("auth.fullName")} value={name} onChangeText={setName} />
                <Field icon="mail" placeholder={t("auth.email")} value={email} onChangeText={setEmail} keyboardType="email-address" />
                <Field
                  icon="lock-closed"
                  placeholder={t("auth.password")}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  right={
                    <TouchableOpacity onPress={() => setShowPwd((s) => !s)}>
                      <Ionicons name={showPwd ? "eye-off" : "eye"} size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  }
                />
                <Field
                  icon="shield-checkmark"
                  placeholder={t("auth.confirmPassword")}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPwd}
                />
                <Button label={t("auth.createAccount")} onPress={handleSignUp} loading={loading} />
              </>
            ) : (
              <>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 4 }}>
                  Verify your email
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 16 }}>
                  Enter the code sent to {email}
                </Text>
                <Field icon="key" placeholder="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" />
                <Button label="Verify" onPress={handleVerify} loading={loading} />
              </>
            )}
          </Card>

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16 }}>
            <Text style={{ color: colors.textSecondary }}>{t("auth.haveAccount")} </Text>
            <TouchableOpacity onPress={() => router.replace("/sign-in")}>
              <Text style={{ color: colors.accent, fontWeight: "700" }}>{t("auth.signIn")}</Text>
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