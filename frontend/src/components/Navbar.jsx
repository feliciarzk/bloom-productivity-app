import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { Menu, X } from "lucide-react";

import supabase from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

import shapeLogo from "../assets/Bloom Logo (shape).png";
import textLogo from "../assets/Bloom Logo (text).png";

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
          border-bottom: 1px solid var(--nav-border);
          backdrop-filter: blur(12px);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 20px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .navbar-logo-shape {
          height: 46px;
          width: auto;
        }

        .navbar-logo-text {
          height: 30px;
          width: auto;
        }

        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 4px;

          padding: 4px;

          border-radius: 999px;

          background: var(--nav-pill-bg);
          border: 1px solid var(--nav-pill-border);
        }

        .navbar-link {
          text-decoration: none;

          padding: 10px 16px;

          border-radius: 999px;

          color: var(--text-secondary);

          font-size: 14px;
          font-weight: 500;

          transition: .2s;
        }

        .navbar-link:hover {
          background: var(--nav-link-hover-bg);
        }

        .navbar-link.active {
          background: linear-gradient(
            135deg,
            var(--accent-green),
            var(--accent-green-dark)
          );

          color: white;
        }

        .navbar-toggle-group {
          display: flex;
          align-items: center;
          gap: 4px;

          padding: 4px 8px;

          border-radius: 999px;

          background: var(--nav-pill-bg);
          border: 1px solid var(--nav-pill-border);
        }

        .navbar-divider {
          width: 1px;
          height: 18px;
          background: var(--nav-divider);
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

          cursor: pointer;

          transition: .2s;
        }

        .navbar-logout:hover {
          color: #C0604A;
        }

        .hamburger-btn {
          display: none;

          border: none;
          background: transparent;

          cursor: pointer;

          color: var(--text-primary);
        }

        .mobile-menu {
          display: none;
        }

        @media (max-width: 768px) {

          .navbar-container {
            padding: 14px 16px;
          }

          .desktop-menu {
            display: none;
          }

          .hamburger-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .navbar-logo-text {
            display: none;
          }

          .mobile-menu {
            display: flex;

            flex-direction: column;

            gap: 10px;

            padding: 16px;

            border-top: 1px solid var(--nav-border);

            background: var(--nav-bg);
          }

          .mobile-link {
            text-decoration: none;

            padding: 12px 14px;

            border-radius: 14px;

            color: var(--text-primary);

            background: var(--nav-pill-bg);

            border: 1px solid var(--nav-pill-border);
          }

          .mobile-link.active {
            background: linear-gradient(
              135deg,
              var(--accent-green),
              var(--accent-green-dark)
            );

            color: white;
          }

          .mobile-actions {
            display: flex;
            align-items: center;
            gap: 10px;
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

            cursor: pointer;
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-container">

          <NavLink
            to="/dashboard"
            className="navbar-logo"
          >
            <img
              src={shapeLogo}
              alt=""
              className="navbar-logo-shape"
            />

            <img
              src={textLogo}
              alt="Bloom"
              className="navbar-logo-text"
            />
          </NavLink>

          <div className="desktop-menu">

            <div className="navbar-links">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? "navbar-link active"
                      : "navbar-link"
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

            <button
              onClick={handleLogout}
              className="navbar-logout"
            >
              <FiLogOut />
              <span>{t("nav.logout")}</span>
            </button>
          </div>

          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "mobile-link active"
                    : "mobile-link"
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mobile-actions">
              <ThemeToggle />
              <LanguageToggle />
            </div>

            <button
              onClick={handleLogout}
              className="mobile-logout"
            >
              <FiLogOut />
              <span>{t("nav.logout")}</span>
            </button>

          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;