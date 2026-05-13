import { useThemeStore } from "../store/themeStore";
import { Colors } from "../constants/colors";

export function useTheme() {
  const { theme, toggleTheme, isDark } = useThemeStore();
  return { colors: Colors[theme], theme, toggleTheme, isDark };
}