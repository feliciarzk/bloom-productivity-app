import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import supabase from "../lib/supabase";
import BloomShape from "../assets/logo-shape.png";
import BloomText from "../assets/logo-text.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      alert("Semua field harus diisi.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap');

        .bloom-input {
          transition: border-color .2s ease, background .2s ease;
        }
        .bloom-input:focus {
          border-bottom-color: #4B7B5B !important;
          background: #F2EEE1 !important;
        }
        .bloom-input::placeholder {
          color: #A3AEA3;
        }
        .bloom-link {
          transition: opacity .2s ease;
        }
        .bloom-link:hover {
          opacity: .7;
        }
        .bloom-submit {
          transition: background .2s ease, transform .15s ease;
        }
        .bloom-submit:hover:not(:disabled) {
          background: #3A6248;
        }
        .bloom-submit:active:not(:disabled) {
          transform: scale(0.99);
        }
        .bloom-toggle {
          transition: color .2s ease;
        }
        .bloom-toggle:hover {
          color: #1C2A20 !important;
        }
        @media (max-width: 880px) {
          .bloom-visual { display: none; }
          .bloom-form-col { padding: 48px 32px !important; }
        }
      `}</style>

      {/* Left — editorial visual panel */}
      <div className="bloom-visual" style={styles.visual}>
        <div style={styles.visualTop}>
          <img src={BloomShape} alt="" style={styles.logoShape} />
          <img src={BloomText} alt="Bloom" style={styles.logoText} />
        </div>

        <svg
          viewBox="0 0 360 520"
          style={styles.vine}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M60 500C60 420 220 400 200 320C185 258 90 260 95 190C99 132 200 130 190 60C184 24 150 8 130 4"
            stroke="#5C7A63"
            strokeWidth="1.5"
          />
          <circle cx="60" cy="500" r="4" fill="#3A6248" />
          <circle cx="95" cy="360" r="3" fill="#7C9A82" opacity="0.6" />
          <circle cx="95" cy="190" r="4" fill="#3A6248" />
          <circle cx="130" cy="4" r="4" fill="#F8F5EC" />
          <path
            d="M95 190C95 190 130 178 132 155"
            stroke="#4B7B5B"
            strokeWidth="1.5"
          />
          <path
            d="M60 500C60 500 24 486 20 462"
            stroke="#4B7B5B"
            strokeWidth="1.5"
          />
        </svg>

        <div style={styles.visualCaption}>
          <p style={styles.visualQuote}>
            Sedikit demi sedikit,
            <br />
            jadi versi terbaikmu.
          </p>
          <span style={styles.visualEyebrow}>DAY BY DAY · GROWTH LOG</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="bloom-form-col" style={styles.formCol}>
        <div style={styles.formWrap}>
          <span style={styles.eyebrow}>SIGN IN</span>
          <h1 style={styles.heading}>Welcome back</h1>
          <p style={styles.subheading}>
            Masuk untuk melanjutkan progres dan kebiasaan baikmu.
          </p>

          <form onSubmit={handleLogin} style={{ marginTop: 40 }}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputRow}>
              <FiMail size={17} style={styles.inputIcon} />
              <input
                className="bloom-input"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <label style={{ ...styles.label, marginTop: 26 }}>Password</label>
            <div style={styles.inputRow}>
              <FiLock size={17} style={styles.inputIcon} />
              <input
                className="bloom-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <button
                type="button"
                className="bloom-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleBtn}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
              </button>
            </div>

            <div style={styles.forgotRow}>
              <Link to="/forgot-password" className="bloom-link" style={styles.forgotLink}>
                Lupa password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bloom-submit"
              style={{
                ...styles.submit,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "default" : "pointer",
              }}
            >
              {loading ? "Memproses..." : "Masuk"}
              {!loading && <FiArrowRight size={17} />}
            </button>

            <div style={styles.dividerRow}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>Baru di Bloom?</span>
              <span style={styles.dividerLine} />
            </div>

            <div style={{ textAlign: "center" }}>
              <Link to="/register" className="bloom-link" style={styles.registerLink}>
                Buat akun baru
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Inter', sans-serif",
    background: "#F8F5EC",
  },

  /* Left panel */
  visual: {
    width: "42%",
    minWidth: 360,
    background: "linear-gradient(160deg, #E7EFE2 0%, #D6E3CE 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 48px 56px",
    position: "relative",
    overflow: "hidden",
  },
  visualTop: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    zIndex: 2,
  },
  logoShape: {
    width: 64,
    height: 64,
    objectFit: "contain",
  },
  logoText: {
    height: 36,
    objectFit: "contain",
  },
  vine: {
    position: "absolute",
    right: -20,
    top: 130,
    height: "56%",
    width: "auto",
  },
  visualCaption: {
    zIndex: 2,
  },
  visualQuote: {
    fontFamily: "'Fraunces', serif",
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: 32,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
    color: "#1E3327",
    margin: 0,
    maxWidth: 290,
  },
  visualEyebrow: {
    display: "block",
    marginTop: 20,
    fontSize: 11,
    letterSpacing: "0.16em",
    color: "#5C7A63",
    fontWeight: 600,
  },

  /* Right panel */
  formCol: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
  },
  formWrap: {
    width: "100%",
    maxWidth: 380,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.16em",
    color: "#7C8A7E",
    fontWeight: 600,
  },
  heading: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 38,
    color: "#1C2A20",
    margin: "10px 0 0",
    letterSpacing: "-0.01em",
  },
  subheading: {
    fontSize: 15,
    color: "#7C8A7E",
    marginTop: 10,
    lineHeight: 1.6,
  },

  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#4A554C",
    marginBottom: 8,
  },
  inputRow: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 2,
    color: "#A3AEA3",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 32px 10px 28px",
    border: "none",
    borderBottom: "1.5px solid #D8D2C0",
    background: "transparent",
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    color: "#1C2A20",
    outline: "none",
    boxSizing: "border-box",
  },
  toggleBtn: {
    position: "absolute",
    right: 2,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#A3AEA3",
    display: "flex",
    padding: 0,
  },

  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  forgotLink: {
    fontSize: 13,
    color: "#4B7B5B",
    fontWeight: 500,
    textDecoration: "none",
  },

  submit: {
    width: "100%",
    marginTop: 32,
    padding: "13px 0",
    border: "none",
    borderRadius: 6,
    background: "#4B7B5B",
    color: "#F8F5EC",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    margin: "32px 0 22px",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#E4DFCF",
  },
  dividerText: {
    fontSize: 13,
    color: "#A3AEA3",
    whiteSpace: "nowrap",
  },

  registerLink: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1C2A20",
    textDecoration: "none",
    borderBottom: "1.5px solid #4B7B5B",
    paddingBottom: 2,
  },
};

export default Login;