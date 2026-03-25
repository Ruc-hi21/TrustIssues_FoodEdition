import React, { createContext, useContext, useMemo, useState } from 'react';

const ORANGE = '#f8ab74';
const ORANGE_DARK = '#fb8225';

const LightTheme = {
  name: 'light',
  colors: {
    background: '#f2e7e0',
    card: '#ffffff',
    text: '#333333',
    textMuted: '#666666',
    primary: ORANGE,
    primaryText: '#070707',
    border: '#cccccc',
    shadow: '#3f3c39',
    orange: ORANGE,
    glass: 'rgba(255, 255, 255, 0.55)',
  },
  radius: { md: 14, xl: 24, pill: 999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: { h1: 30, h2: 20, body: 16, small: 12 },
};

const DarkTheme = {
  name: 'dark',
  colors: {
    background: '#1e1e1e',
    card: '#2c2c2c',
    text: '#ffffff',
    textMuted: '#aaaaaa',
    primary: ORANGE_DARK,
    primaryText: '#ffffff',
    border: '#444444',
    shadow: '#000000',
    orange: ORANGE_DARK,
    glass: 'rgba(0, 0, 0, 0.55)',
  },
  radius: { md: 14, xl: 24, pill: 999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: { h1: 30, h2: 20, body: 16, small: 12 },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState('dark');

  const theme = useMemo(
    () => (preference === 'dark' ? DarkTheme : LightTheme),
    [preference]
  );

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);