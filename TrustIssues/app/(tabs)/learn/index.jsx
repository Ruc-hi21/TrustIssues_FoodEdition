import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FlagExplainCard from "../../../components/learn/FlagExplainCard";
import HazardSearchResult from "../../../components/learn/HazardSearchResult";
import EmptyState from "../../../components/ui/EmptyState";
import { FLAG_TYPES } from "../../../constants/flags";
import { hazardService } from "../../../services/hazardService";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

export default function Learn() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const id = setTimeout(async () => {
      try {
        const res = await hazardService.search(query);
        setResults(res.results || []);
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800", marginBottom: 4 }}>
          {t("learn.title")}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 18 }}>
          Understand the flags and dig deeper.
        </Text>

        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 10 }}>
          {t("learn.flagExplainers")}
        </Text>
        {Object.keys(FLAG_TYPES).map((key) => {
          const f = FLAG_TYPES[key];
          return (
            <FlagExplainCard
              key={key}
              type={key}
              label={f.label}
              color={f.color}
              icon={f.icon}
              description={f.description}
              simplyPut={f.simplyPut}
              examples={f.examples}
            />
          );
        })}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginTop: 18,
            marginBottom: 12,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            placeholder={t("learn.searchPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, color: colors.text, padding: 12, fontSize: 14 }}
            autoCapitalize="none"
          />
        </View>

        {results.map((r, i) => (
          <HazardSearchResult key={i} result={r} />
        ))}

        {searched && results.length === 0 && query.trim() ? (
          <EmptyState icon="search" message={`${t("learn.noResults")} "${query}"`} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}