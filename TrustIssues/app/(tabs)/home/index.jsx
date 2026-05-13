import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeroBanner from "../../../components/home/HeroBanner";
import StatsRow from "../../../components/home/StatsRow";
import ScanNowButton from "../../../components/home/ScanNowButton";
import QuickTipCard from "../../../components/home/QuickTipCard";
import FlagShortcutCard from "../../../components/home/FlagShortcutCard";
import RecentScansList from "../../../components/home/RecentScansList";
import { useTheme } from "../../../hooks/useTheme";

export default function Home() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <HeroBanner />
        <StatsRow />
        <ScanNowButton />
        <QuickTipCard />
        <FlagShortcutCard />
        <RecentScansList />
      </ScrollView>
    </SafeAreaView>
  );
}