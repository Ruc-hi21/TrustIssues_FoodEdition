import React from "react";
import { useRouter } from "expo-router";
import EmptyState from "../ui/EmptyState";
import { useTranslation } from "../../hooks/useTranslation";

export default function EmptyHistory() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <EmptyState
      icon="time-outline"
      message={t("history.empty")}
      ctaLabel={t("home.scanNow")}
      onCta={() => router.push("/(tabs)/scan")}
    />
  );
}