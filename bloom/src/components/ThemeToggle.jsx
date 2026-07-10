import { useEffect, useState } from "react";
import { Moon, Sun, Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const btnStyle = {
  background: "transparent",
  border: "none",
  outline: "none",
  padding: 0,
  width: "36px",
  height: "36px",
  borderRadius: "9999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button onClick={() => setDarkMode((prev) => !prev)} style={btnStyle}>
      {darkMode ? (
        <Sun size={18} color="#facc15" />
      ) : (
        <Moon size={18} color="#475569" />
      )}
    </button>
  );
}

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      style={{
        ...btnStyle,
        width: "auto",
        padding: "0 8px",
        gap: "4px",
      }}
    >
      <Languages size={16} color="#475569" />
      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          textTransform: "uppercase",
          color: "#475569",
        }}
      >
        {lang}
      </span>
    </button>
  );
}

export default ThemeToggle;