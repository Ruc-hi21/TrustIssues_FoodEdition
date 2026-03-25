import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Animated, Easing, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// FIX PATH if needed
import { ThemeProvider, useTheme } from '../Components/theme-context';

function LayoutInner() {
  const { theme } = useTheme();

  const prevBgRef = React.useRef(theme.colors.background);
  const [overlayBg, setOverlayBg] = React.useState(theme.colors.background);
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const newBg = theme.colors.background;
    const oldBg = prevBgRef.current;

    if (oldBg !== newBg) {
      setOverlayBg(oldBg);
      overlayOpacity.setValue(1);

      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 380,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();

      prevBgRef.current = newBg;
    }
  }, [theme.colors.background]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      
      <StatusBar
        style={theme.name === 'dark' ? 'light' : 'dark'}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />

      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: overlayBg,
          opacity: overlayOpacity,
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <LayoutInner />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}