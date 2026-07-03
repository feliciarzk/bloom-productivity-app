import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiArrowRight, FiArrowLeft, FiCheck } from "react-icons/fi";
import supabase from "../lib/supabase";
import BloomShape from "../assets/logo-shape.png";
import BloomText from "../assets/logo-text.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!email) {
      alert("Masukkan email kamu terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) {
        alert(error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      alert(err?.message || "Terjadi kesalahan, coba lagi.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap');

        .bloom-input { transition: border-color .2s ease, background .2s ease; }
        .bloom-input:focus {
          border-bottom-color: #4B7B5B !important;
          background: #F2EEE1 !important;
        }
        .bloom-input::placeholder { color: #A3AEA3; }
        .bloom-link { transition: opacity .2s ease; }
        .bloom-link:hover { opacity: .7; }
        .bloom-submit { transition: background .2s ease, transform .15s ease; }
        .bloom-submit:hover:not(:disabled) { background: #3A6248; }
        .bloom-submit:active:not(:disabled) { transform: scale(0.99); }
        @media (max-width: 880px) {
          .bloom-visual { display: none; }
          .bloom-form-col {
            padding: 48px 32px !important;
            align-items: center !important;
          }
        }
      `}</style>

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
            Kadang perlu berhenti
            <br />
            sejenak sebelum lanjut tumbuh.
          </p>
          <span style={styles.visualEyebrow}>DAY BY DAY · GROWTH LOG</span>
        </div>
      </div>

      <div className="bloom-form-col" style={styles.formCol}>
        <div style={styles.formWrap}>
          <Link to="/login" className="bloom-link" style={styles.backLink}>
            <FiArrowLeft size={15} />
            <span>Kembali ke masuk</span>
          </Link>

          {!sent && (
            <div>
              <span style={styles.eyebrow}>RESET PASSWORD</span>
              <h1 style={styles.heading}>Lupa password?</h1>
              <p style={styles.subheading}>
                Masukkan email akun kamu, kami akan kirim link untuk atur
                ulang password.
              </p>

              <form onSubmit={handleReset} style={{ marginTop: 40 }}>
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
                  <span>{loading ? "Mengirim..." : "Kirim link reset"}</span>
                  {!loading && <FiArrowRight size={17} />}
                </button>
              </form>
            </div>
          )}

          {sent && (
            <div>
              <div style={styles.successIcon}>
                <FiCheck size={22} />
              </div>
              <span style={styles.eyebrow}>EMAIL TERKIRIM</span>
              <h1 style={styles.heading}>Cek inbox kamu</h1>
              <p style={styles.subheading}>
                Kami sudah kirim link reset password ke{" "}
                <strong style={{ color: "#1C2A20" }}>{email}</strong>. Buka
                email tersebut untuk lanjut atur ulang password.
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="bloom-link"
                style={styles.resendLink}
              >
                Tidak menerima email? Kirim ulang
              </button>
            </div>
          )}
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
    maxWidth: 340,
  },
  visualEyebrow: {
    display: "block",
    marginTop: 20,
    fontSize: 11,
    letterSpacing: "0.16em",
    color: "#5C7A63",
    fontWeight: 600,
  },
  formCol: {
    flex: 1,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "150px 48px 48px",
  },
  formWrap: {
    width: "100%",
    maxWidth: 380,
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "#7C8A7E",
    textDecoration: "none",
    marginBottom: 32,
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
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#E7EFE2",
    color: "#3A6248",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  resendLink: {
    marginTop: 28,
    border: "none",
    background: "transparent",
    padding: 0,
    fontSize: 13,
    fontWeight: 600,
    color: "#4B7B5B",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
};

export default ForgotPassword;