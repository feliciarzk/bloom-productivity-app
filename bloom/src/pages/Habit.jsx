import { useEffect, useState } from "react";
import { FiPlus, FiCheck, FiFeather, FiZap } from "react-icons/fi";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

function Habit() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("good");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getHabits();
  }, []);

  async function getHabits() {
    const { data } = await supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: false });

    setHabits(data || []);
    setLoading(false);
  }

  async function addHabit() {
    if (!name.trim()) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("habits").insert([
      {
        user_id: user.id,
        name,
        type,
      },
    ]);

    setName("");
    await getHabits();
    setSaving(false);
  }

  async function checkHabit(habitId) {
    await supabase.from("habit_logs").insert([
      {
        habit_id: habitId,
        completed_date: new Date().toISOString().split("T")[0],
      },
    ]);

    showToast("Habit tercatat 🌱");
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  const goodHabits = habits.filter((h) => h.type === "good");
  const badHabits = habits.filter((h) => h.type === "bad");

  if (loading) {
    return (
      <div style={styles.loadingShell}>
        <style>{globalStyle}</style>
        <div style={styles.loadingRing} />
        <p style={styles.loadingText}>Menyiapkan habit tracker kamu</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main style={styles.page}>
        <style>{globalStyle}</style>

        <div style={styles.grain} />
        <BotanicalMotif style={styles.botanicalTop} />
        <BotanicalMotif style={styles.botanicalBottom} flip />

        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.eyebrow}>HABIT</span>
            <h1 style={styles.heading}>Habit Tracker 🌿</h1>
            <p style={styles.subheading}>
              {habits.length === 0
                ? "Belum ada habit. Tambahkan kebiasaan pertamamu di bawah."
                : `${goodHabits.length} kebiasaan baik · ${badHabits.length} yang ingin dikurangi.`}
            </p>
          </div>

          {/* Add habit */}
          <div className="bloom-card" style={styles.addCard}>
            <div style={styles.addRow}>
              <input
                type="text"
                placeholder="Nama habit... misal: minum air putih"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                style={styles.input}
              />

              <div style={styles.typeToggle}>
                <button
                  type="button"
                  onClick={() => setType("good")}
                  className={`bloom-type-btn${type === "good" ? " active-good" : ""}`}
                >
                  <FiFeather size={14} />
                  Baik
                </button>
                <button
                  type="button"
                  onClick={() => setType("bad")}
                  className={`bloom-type-btn${type === "bad" ? " active-bad" : ""}`}
                >
                  <FiZap size={14} />
                  Kurangi
                </button>
              </div>
            </div>

            <button
              onClick={addHabit}
              disabled={saving || !name.trim()}
              className="bloom-add-btn"
              style={{
                opacity: saving || !name.trim() ? 0.6 : 1,
                cursor: saving || !name.trim() ? "not-allowed" : "pointer",
              }}
            >
              <FiPlus size={16} />
              Tambah Habit
            </button>
          </div>

          {/* Habit list */}
          {habits.length === 0 ? (
            <div className="bloom-card" style={styles.emptyCard}>
              <span style={styles.emptyEmoji}>🌿</span>
              <p style={styles.emptyTitle}>Belum ada habit</p>
              <p style={styles.emptyText}>
                Mulai dari satu kebiasaan kecil yang ingin kamu bangun atau
                kurangi.
              </p>
            </div>
          ) : (
            <div style={styles.listWrap}>
              {goodHabits.length > 0 && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>
                    KEBIASAAN BAIK · {goodHabits.length}
                  </span>
                  <div style={styles.taskList}>
                    {goodHabits.map((habit) => (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        onCheck={checkHabit}
                      />
                    ))}
                  </div>
                </div>
              )}

              {badHabits.length > 0 && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>
                    INGIN DIKURANGI · {badHabits.length}
                  </span>
                  <div style={styles.taskList}>
                    {badHabits.map((habit) => (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        onCheck={checkHabit}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {toast && <div style={styles.toast}>{toast}</div>}
      </main>
    </>
  );
}

function HabitRow({ habit, onCheck }) {
  const isGood = habit.type === "good";

  return (
    <div className="bloom-task-row" style={styles.taskRow}>
      <div
        style={{
          ...styles.badge,
          background: isGood ? "#E7EFE2" : "#F5EAE0",
          color: isGood ? "#3A6248" : "#B06A3B",
        }}
      >
        {isGood ? <FiFeather size={15} /> : <FiZap size={15} />}
      </div>

      <span style={styles.taskTitle}>{habit.name}</span>

      <button
        onClick={() => onCheck(habit.id)}
        className="bloom-check-btn"
      >
        <FiCheck size={14} />
        Selesai Hari Ini
      </button>
    </div>
  );
}

function BotanicalMotif({ style, flip }) {
  return (
    <svg
      viewBox="0 0 420 420"
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      transform={flip ? "scale(-1,-1)" : undefined}
    >
      <path
        d="M20 400C90 340 110 260 90 190C74 136 30 100 10 40"
        stroke="#3A5C3E"
        strokeWidth="2.2"
      />
      <path d="M90 190C140 200 180 180 205 130" stroke="#3A5C3E" strokeWidth="2.2" />
      <path d="M74 136C120 128 150 100 160 55" stroke="#3A5C3E" strokeWidth="2.2" />
      <path d="M40 260C90 268 125 250 150 210" stroke="#3A5C3E" strokeWidth="2.2" />
      {[
        [90, 190, 34, -18],
        [205, 130, 26, -12],
        [160, 55, 22, -10],
        [150, 210, 28, -14],
        [74, 136, 20, 10],
        [40, 260, 24, 14],
      ].map(([x, y, w, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={w}
          ry={w * 0.42}
          transform={`rotate(${r} ${x} ${y})`}
          stroke="#3A5C3E"
          strokeWidth="1.8"
        />
      ))}
      <circle cx="10" cy="40" r="5" fill="#C9A227" />
    </svg>
  );
}

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

  .bloom-card {
    transition: box-shadow .25s ease, transform .25s ease, border-color .25s ease;
  }
  .bloom-card:hover {
    box-shadow: 0 12px 28px rgba(30, 50, 34, 0.10);
  }

  .bloom-type-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 16px;
    height: 46px;
    border: 1px solid #E9E3D2;
    background: #FFFFFF;
    color: #7C8A7E;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: background .2s ease, color .2s ease, border-color .2s ease;
  }
  .bloom-type-btn:first-child {
    border-radius: 12px 0 0 12px;
    border-right: none;
  }
  .bloom-type-btn:last-child {
    border-radius: 0 12px 12px 0;
  }
  .bloom-type-btn.active-good {
    background: #E7EFE2;
    color: #3A6248;
    border-color: #C9DBC0;
  }
  .bloom-type-btn.active-bad {
    background: #F5EAE0;
    color: #B06A3B;
    border-color: #E6CBB4;
  }

  .bloom-add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 46px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #4B7B5B, #2F5233);
    color: #F8F5EC;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 14px;
    transition: transform .15s ease, box-shadow .2s ease;
    box-shadow: 0 6px 16px rgba(47, 82, 51, 0.25);
  }
  .bloom-add-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(47, 82, 51, 0.32);
  }
  .bloom-add-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .bloom-task-row {
    transition: background .2s ease, border-color .2s ease;
  }
  .bloom-task-row:hover {
    background: #FBF8EF;
    border-color: #E9E3D2;
  }

  .bloom-check-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid #D9E4D3;
    background: #FFFFFF;
    color: #3A6248;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 12.5px;
    cursor: pointer;
    white-space: nowrap;
    transition: background .2s ease, transform .15s ease, box-shadow .2s ease;
  }
  .bloom-check-btn:hover {
    background: #4B7B5B;
    color: #F8F5EC;
    border-color: #4B7B5B;
    box-shadow: 0 4px 12px rgba(47, 82, 51, 0.25);
  }
  .bloom-check-btn:active {
    transform: scale(0.96);
  }

  input::placeholder {
    color: #A9A48F;
  }

  @keyframes bloom-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes bloom-toast-in {
    from { opacity: 0; transform: translate(-50%, 8px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
`;

const styles = {
  loadingShell: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    background: "#F5EFE0",
    fontFamily: "'Inter', sans-serif",
  },
  loadingRing: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "3px solid #E4DFCF",
    borderTopColor: "#4B7B5B",
    animation: "bloom-spin 0.9s linear infinite",
  },
  loadingText: {
    fontSize: 14,
    color: "#7C8A7E",
  },

  page: {
    position: "relative",
    minHeight: "100vh",
    background: `
      radial-gradient(ellipse 900px 600px at 12% -6%, rgba(232,220,188,0.55), transparent 62%),
      radial-gradient(ellipse 750px 550px at 100% 0%, rgba(201,162,39,0.10), transparent 55%),
      radial-gradient(ellipse 850px 750px at 88% 100%, rgba(111,163,110,0.10), transparent 58%),
      radial-gradient(ellipse 750px 550px at 0% 100%, rgba(232,220,188,0.60), transparent 60%),
      #F5EFE0
    `,
    fontFamily: "'Inter', sans-serif",
    padding: "40px 24px 100px",
    overflow: "hidden",
  },
  grain: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    opacity: 0.045,
    mixBlendMode: "multiply",
    pointerEvents: "none",
  },
  botanicalTop: {
    position: "absolute",
    top: -30,
    right: -50,
    width: 360,
    height: 360,
    opacity: 0.22,
    pointerEvents: "none",
  },
  botanicalBottom: {
    position: "absolute",
    bottom: -30,
    left: -50,
    width: 360,
    height: 360,
    opacity: 0.2,
    pointerEvents: "none",
  },

  container: {
    position: "relative",
    maxWidth: 720,
    margin: "0 auto",
  },

  header: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.16em",
    color: "#6E8A70",
    fontWeight: 600,
  },
  heading: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 32,
    color: "#1C2A20",
    margin: "8px 0 0",
    letterSpacing: "-0.01em",
  },
  subheading: {
    fontSize: 14,
    color: "#7C8A7E",
    marginTop: 8,
  },

  addCard: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "#FFFFFF",
    border: "1px solid #E9E3D2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    boxShadow: "0 2px 10px rgba(30, 50, 34, 0.04)",
  },
  addRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 180,
    border: "1px solid #E9E3D2",
    outline: "none",
    background: "#FDFBF5",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: "#1C2A20",
    padding: "0 14px",
    height: 46,
  },
  typeToggle: {
    display: "flex",
  },

  emptyCard: {
    background: "#FFFFFF",
    border: "1px dashed #DCD5BF",
    borderRadius: 18,
    padding: "48px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  emptyTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 18,
    color: "#1C2A20",
    margin: 0,
  },
  emptyText: {
    fontSize: 13,
    color: "#7C8A7E",
    maxWidth: 320,
    lineHeight: 1.6,
  },

  listWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: "0.12em",
    fontWeight: 600,
    color: "#9AA69B",
    paddingLeft: 4,
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  taskRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#FFFFFF",
    border: "1px solid #EFE9D9",
    borderRadius: 14,
    padding: "12px 14px",
  },
  badge: {
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: "#1C2A20",
  },

  toast: {
    position: "fixed",
    bottom: 32,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1C2A20",
    color: "#F8F5EC",
    padding: "12px 20px",
    borderRadius: 999,
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    animation: "bloom-toast-in .25s ease",
    zIndex: 100,
  },
};

export default Habit;