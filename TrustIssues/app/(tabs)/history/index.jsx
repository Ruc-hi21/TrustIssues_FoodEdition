import React, { useEffect, useState, useCallback } from "react";
import { FlatList, Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import ScanHistoryItem from "../../../components/history/ScanHistoryItem";
import EmptyHistory from "../../../components/history/EmptyHistory";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { scanService } from "../../../services/scanService";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchScans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await scanService.getHistory(1, 10);
      setScans(res.scans || res.history || []);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchScans();
    }, [fetchScans])
  );

  const handleDelete = (scanId) => {
    Alert.alert("Delete scan?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await scanService.deleteScan(scanId);
            setScans((prev) => prev.filter((s) => (s.scanId || s.id) !== scanId));
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>
          {t("history.title")}
        </Text>
      </View>
      {loading && scans.length === 0 ? (
        <LoadingSpinner />
      ) : scans.length === 0 ? (
        <EmptyHistory />
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => String(item.scanId || item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          renderItem={({ item }) => (
            <ScanHistoryItem
              scan={item}
              onLongPress={() => handleDelete(item.scanId || item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}