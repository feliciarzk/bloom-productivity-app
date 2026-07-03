import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { Menu, X } from "lucide-react";

import supabase from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

import shapeLogo from "../assets/logo-shape.png";
import textLogo from "../assets/logo-text.png";

function Navbar() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/todo", label: t("nav.todo") },
    { to: "/habit", label: t("nav.habit") },
    { to: "/progress", label: t("nav.progress") },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;

          background: var(--nav-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);

          border-bottom: 1px solid var(--nav-border);
          box-shadow: 0 1px 0 rgba(0,0,0,0.02), 0 8px 24px -18px rgba(0,0,0,0.15);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 20px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          transition: transform 0.2s ease;
        }

        .navbar-logo:hover {
          transform: translateY(-1px);
        }

        .navbar-logo-shape {
          height: 44px;
        }

        .navbar-logo-text {
          height: 28px;
        }

        /* DESKTOP MENU */
        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 2px;

          padding: 4px;
          border-radius: 999px;

          background: var(--nav-pill-bg);
          border: 1px solid var(--nav-pill-border);
        }

        .navbar-link {
          text-decoration: none;
          position: relative;

          padding: 9px 16px;
          border-radius: 999px;

          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;

          transition: color 0.2s ease, background 0.2s ease;
        }

        .navbar-link:hover {
          background: var(--nav-link-hover-bg);
          color: var(--text-primary);
        }

        .navbar-link.active {
          background: linear-gradient(135deg, var(--accent-green-light, var(--accent-green)) 0%, var(--accent-green) 100%);
          color: #0f172a;
          font-weight: 600;
          box-shadow: 0 4px 10px -4px rgba(0,0,0,0.25);
        }

        /* TOGGLE GROUP — dibuat jadi satu pill utuh, elemen di dalamnya
           dipaksa transparan supaya ThemeToggle & LanguageToggle
           tidak tampil sebagai kotak putih terpisah */
        .navbar-toggle-group {
          display: flex;
          align-items: center;
          gap: 2px;

          padding: 4px;
          border-radius: 999px;

          background: var(--nav-pill-bg);
          border: 1px solid var(--nav-pill-border);
        }

        .navbar-toggle-group > * {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .navbar-toggle-group button,
        .navbar-toggle-group [role="button"],
        .navbar-toggle-group a {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          height: 32px !important;
          min-width: 32px !important;
          padding: 0 10px !important;

          border-radius: 999px !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;

          color: var(--text-secondary) !important;
          font-size: 13px !important;
          font-weight: 500 !important;

          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease !important;
        }

        .navbar-toggle-group button:hover,
        .navbar-toggle-group [role="button"]:hover,
        .navbar-toggle-group a:hover {
          background: var(--nav-link-hover-bg) !important;
          color: var(--text-primary) !important;
        }

        .navbar-divider {
          width: 1px;
          height: 16px;
          background: var(--nav-divider);
          margin: 0 2px;
        }

        .navbar-logout {
          display: flex;
          align-items: center;
          gap: 8px;

          padding: 10px 16px;
          border-radius: 999px;

          border: 1px solid var(--nav-pill-border);
          background: var(--nav-pill-bg);

          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;

          transition: 0.2s ease;
        }

        .navbar-logout:hover {
          color: #c0604a;
          border-color: rgba(192, 96, 74, 0.35);
          background: rgba(192, 96, 74, 0.06);
        }

        /* MOBILE */
        .hamburger-btn {
          display: none;
          align-items: center;
          justify-content: center;

          width: 40px;
          height: 40px;
          border-radius: 999px;

          background: var(--nav-pill-bg);
          border: 1px solid var(--nav-pill-border);
          color: var(--text-primary);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .hamburger-btn:hover {
          background: var(--nav-link-hover-bg);
        }

        .mobile-menu {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }

          .hamburger-btn {
            display: flex;
          }

          .navbar-logo-text {
            display: none;
          }

          .mobile-menu {
            display: flex;
            flex-direction: column;
            gap: 8px;

            padding: 14px 16px 18px;

            border-top: 1px solid var(--nav-border);
            background: var(--nav-bg);
          }

          .mobile-link {
            text-decoration: none;

            padding: 12px 14px;
            border-radius: 14px;

            font-size: 14px;
            color: var(--text-primary);

            background: var(--nav-pill-bg);
            border: 1px solid var(--nav-pill-border);
          }

          .mobile-link.active {
            background: linear-gradient(135deg, var(--accent-green-light, var(--accent-green)) 0%, var(--accent-green) 100%);
            color: #0f172a;
            font-weight: 600;
          }

          .mobile-actions {
            display: flex;
            align-items: center;
            gap: 8px;

            padding: 4px;
            border-radius: 999px;

            background: var(--nav-pill-bg);
            border: 1px solid var(--nav-pill-border);
          }

          .mobile-actions > * {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }

          .mobile-actions button,
          .mobile-actions [role="button"],
          .mobile-actions a {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex: 1;

            height: 36px !important;
            padding: 0 10px !important;
            border-radius: 999px !important;

            background: transparent !important;
            border: none !important;
            color: var(--text-secondary) !important;
            font-size: 13px !important;
          }

          .mobile-actions button:hover,
          .mobile-actions [role="button"]:hover,
          .mobile-actions a:hover {
            background: var(--nav-link-hover-bg) !important;
            color: var(--text-primary) !important;
          }

          .mobile-logout {
            display: flex;
            align-items: center;
            justify-content: center;

            gap: 8px;

            padding: 12px;
            border-radius: 14px;

            border: 1px solid var(--nav-pill-border);
            background: var(--nav-pill-bg);
            color: var(--text-secondary);
            font-size: 14px;

            cursor: pointer;
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-container">

          {/* LOGO */}
          <NavLink to="/dashboard" className="navbar-logo">
            <img src={shapeLogo} className="navbar-logo-shape" alt="logo" />
            <img src={textLogo} className="navbar-logo-text" alt="Bloom" />
          </NavLink>

          {/* DESKTOP */}
          <div className="desktop-menu">

            <div className="navbar-links">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? "navbar-link active" : "navbar-link"
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="navbar-toggle-group">
              <ThemeToggle />
              <div className="navbar-divider" />
              <LanguageToggle />
            </div>

            <button onClick={handleLogout} className="navbar-logout">
              <FiLogOut size={15} />
              <span>{t("nav.logout")}</span>
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="mobile-menu">

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? "mobile-link active" : "mobile-link"
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mobile-actions">
              <ThemeToggle />
              <LanguageToggle />
            </div>

            <button onClick={handleLogout} className="mobile-logout">
              <FiLogOut size={15} />
              <span>{t("nav.logout")}</span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;