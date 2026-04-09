import { createContext, useContext, useState, type ReactNode } from "react";
import { en, es, type Translations } from "@/i18n/translations";

export type Language = "en" | "es";

type LangState = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof Translations) => string;
};

const LanguageContext = createContext<LangState | undefined>(undefined);

const LS_KEY = "intex.lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored === "es" ? "es" : "en";
    } catch {
      return "en";
    }
  });

  const setLang = (l: Language) => {
    try {
      localStorage.setItem(LS_KEY, l);
    } catch {
      /* ignore */
    }
    setLangState(l);
  };

  const dict = lang === "es" ? es : en;
  const t = (key: keyof Translations): string => dict[key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
