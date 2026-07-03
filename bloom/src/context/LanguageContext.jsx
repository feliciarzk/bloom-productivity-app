import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../lib/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("id");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "id") {
      setLang(saved);
    }
  }, []);

  function toggleLang() {
    const next = lang === "id" ? "en" : "id";
    setLang(next);
    localStorage.setItem("lang", next);
  }

  // t("dashboard.heading") -> looks up translations[lang].dashboard.heading
  // falls back to the key itself if missing, so a missing translation
  // is obvious in the UI instead of silently blank.
  function t(path) {
    const parts = path.split(".");
    let node = translations[lang];
    for (const part of parts) {
      node = node?.[part];
    }
    return node ?? path;
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
