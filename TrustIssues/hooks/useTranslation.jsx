import { useLanguageStore } from "../store/languageStore";
import en from "../locales/en";
import hi from "../locales/hi";
import kn from "../locales/kn";
import es from "../locales/es";

const LOCALES = { en, hi, kn, es };

export function useTranslation() {
  const { language } = useLanguageStore();
  const dict = LOCALES[language] || en;

  const t = (keyPath) => {
    const keys = keyPath.split(".");
    let val = dict;
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) return keyPath;
    }
    return val;
  };

  return { t, language };
}