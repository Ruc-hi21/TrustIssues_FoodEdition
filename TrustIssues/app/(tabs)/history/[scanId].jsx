import React, { useEffect, useState } from "react";
import { ScrollView, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import ProductHeader from "../../../components/result/ProductHeader";
import HealthScoreCard from "../../../components/result/HealthScoreCard";
import FlagSection from "../../../components/result/FlagSection";
import IngredientRawCard from "../../../components/result/IngredientRawCard";
import NutriNovaCard from "../../../components/result/NutriNovaCard";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { scanService } from "../../../services/scanService";
import { useTheme } from "../../../hooks/useTheme";

export default function ScanDetail() {
  const { scanId } = useLocalSearchParams();
  const { colors } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await scanService.getScan(scanId);
        setData(res);
      } catch (e) {
        Alert.alert("Error", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [scanId]);

  if (loading) return <LoadingSpinner />;
  if (!data?.analysis) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>Not found.</Text>
      </SafeAreaView>
    );
  }

  const analysis = data.analysis;
  const classified = analysis.classifiedIngredients || [];
  const reds = classified.filter((i) => i.classification?.flag === "red");
  const greens = classified.filter((i) => i.classification?.flag === "green");
  const neutrals = classified.filter((i) => i.classification?.flag === "neutral");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ProductHeader imageUrl={analysis.imageUrl} productName={analysis.productNameGuess} />
        <HealthScoreCard
          score={analysis.score}
          rating={analysis.rating}
          ratingColor={analysis.ratingColor}
          isDangerous={analysis.isDangerous}
        />
        <FlagSection
          type="allergen"
          flags={(analysis.humanFlags || []).map((f) => ({
            ingredient: f.ingredient || f.ruleName,
            description: f.description,
          }))}
        />
        <FlagSection
          type="red"
          flags={reds.map((i) => ({
            ingredient: i.raw || i.normName,
            description: i.classification?.description,
          }))}
        />
        <FlagSection
          type="green"
          flags={greens.map((i) => ({
            ingredient: i.raw || i.normName,
            description: i.classification?.description,
          }))}
        />
        <FlagSection
          type="neutral"
          flags={neutrals.slice(0, 8).map((i) => ({
            ingredient: i.raw || i.normName,
            description: i.classification?.description,
          }))}
        />
        <IngredientRawCard raw={analysis.ingredientsRaw} />
        <NutriNovaCard nutriscoreGrade={analysis.nutriscoreGrade} novaGroup={analysis.novaGroup} />
      </ScrollView>
    </SafeAreaView>
  );
}