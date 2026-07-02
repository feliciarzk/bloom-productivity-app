import { Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      title={
        lang === "id"
          ? "Switch to English"
          : "Ganti ke Bahasa Indonesia"
      }
      className="
        flex items-center gap-1
        px-2 h-9
        rounded-full
        transition-all duration-200
        hover:bg-black/5
        dark:hover:bg-white/10
      "
    >
      <Languages
        size={16}
        className="text-slate-600 dark:text-slate-300"
      />

      <span
        className="
          text-xs
          font-semibold
          uppercase
          text-slate-600
          dark:text-slate-300
        "
      >
        {lang}
      </span>
    </button>
  );
}

export default LanguageToggle;