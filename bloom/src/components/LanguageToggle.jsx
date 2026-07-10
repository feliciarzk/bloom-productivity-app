import { Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      style={{
        background: "transparent",
        border: "none",
        outline: "none",
        padding: "0 8px",
        height: "36px",
        borderRadius: "9999px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer",
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

export default LanguageToggle;