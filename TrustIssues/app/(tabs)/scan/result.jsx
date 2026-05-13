import React, { useEffect } from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import ProductHeader from "../../../components/result/ProductHeader";
import HealthScoreCard from "../../../components/result/HealthScoreCard";
import FlagSection from "../../../components/result/FlagSection";
import IngredientRawCard from "../../../components/result/IngredientRawCard";
import NutriNovaCard from "../../../components/result/NutriNovaCard";
import ScanAgainButton from "../../../components/result/ScanAgainButton";
import FlagCard from "../../../components/ui/FlagCard";
import IngredientRow from "../../../components/ui/IngredientRow";
import { useScanStore } from "../../../store/scanStore";
import { useTheme } from "../../../hooks/useTheme";

export default function ResultScreen() {
  const { data } = useLocalSearchParams();
  const { colors } = useTheme();
  const { addScan } = useScanStore();

  let result;
  try {
    result = JSON.parse(data);
  } catch {
    result = null;
  }

  const analysis = result?.analysis;

  useEffect(() => {
    if (!analysis) return;
    addScan({
      scanId: result.scanId,
      productName: analysis.productNameGuess,
      score: analysis.score,
      rating: analysis.rating,
      createdAt: analysis.analysedAt || new Date().toISOString(),
    });
  }, []);

  if (!analysis) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>No result data</Text>
      </SafeAreaView>
    );
  }

  const classified = analysis.classifiedIngredients || [];
  const reds = classified.filter((i) => i.classification?.flag === "red");
  const greens = classified.filter((i) => i.classification?.flag === "green");
  const neutrals = classified.filter((i) => i.classification?.flag === "neutral");

  const allergenFlags = (analysis.humanFlags || []).map((f) => ({
    ingredient: f.ingredient || f.ruleName,
    description: f.description,
    recommendation: f.recommendation,
  }));

  const redFlags = reds.map((i) => ({
    ingredient: i.raw || i.normName,
    description: i.classification?.description,
  }));
  const greenFlags = greens.map((i) => ({
    ingredient: i.raw || i.normName,
    description: i.classification?.description,
  }));
  const neutralFlags = neutrals.map((i) => ({
    ingredient: i.raw || i.normName,
    description: i.classification?.description,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ProductHeader
          imageUrl={analysis.imageUrl}
          productName={analysis.productNameGuess}
          brand={analysis.brand}
        />
        <HealthScoreCard
          score={analysis.score}
          rating={analysis.rating}
          ratingColor={analysis.ratingColor}
          isDangerous={analysis.isDangerous}
        />

        <FlagSection type="allergen" flags={allergenFlags} />
        <FlagSection type="red" flags={redFlags} />
        <FlagSection type="green" flags={greenFlags} />
        <FlagSection type="neutral" flags={neutralFlags.slice(0, 8)} />

        {(analysis.petResults || []).map((p) => (
          <FlagCard
            key={p.petId}
            type={p.isSafe ? "green" : "red"}
            title={`🐾 ${p.petName} (${p.species}) — ${p.severity || (p.isSafe ? "safe" : "danger")}`}
          >
            {(p.flags || []).map((f, i) => (
              <IngredientRow
                key={i}
                name={f.ingredient || f.ruleName}
                description={f.description}
                flag={p.isSafe ? "green" : "red"}
              />
            ))}
          </FlagCard>
        ))}

        <IngredientRawCard raw={analysis.ingredientsRaw} />
        <NutriNovaCard
          nutriscoreGrade={analysis.nutriscoreGrade}
          novaGroup={analysis.novaGroup}
        />
        <ScanAgainButton />
      </ScrollView>
    </SafeAreaView>
  );
}