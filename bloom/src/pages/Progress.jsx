import { useEffect, useState } from "react";
import { FiTrendingUp, FiAward, FiZap } from "react-icons/fi";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

const DAILY_GOAL = 6; // completions that count as a "fully bloomed" day

function Progress() {
  const [loading, setLoading] = useState(true);
  const [garden, setGarden] = useState([]);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    setLoading(true);

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const [tasksResult, logsResult] = await Promise.all([
      supabase
        .from("tasks")
        .select("id, completed_at")
        .eq("is_completed", true)
        .gte("completed_at", start.toISOString()),

      supabase
        .from("habit_logs")
        .select("id, completed_date")
        .gte("completed_date", start.toISOString().split("T")[0]),
    ]);

    const tasks = tasksResult.data || [];
    const logs = logsResult.data || [];

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const taskCount = tasks.filter(
        (t) => t.completed_at && t.completed_at.split("T")[0] === dateStr
      ).length;
      const habitCount = logs.filter((l) => l.completed_date === dateStr).length;

      days.push({
        date: dateStr,
        dayLabel: d.toLocaleDateString("id-ID", { weekday: "short" }),
        dateLabel: d.getDate(),
        total: taskCount + habitCount,
        isToday: i === 0,
      });
    }

    setGarden(days);
    setLoading(false);
  }

  function getStage(total) {
    if (total === 0) return 0;
    if (total <= 2) return 1;
    if (total <= 4) return 2;
    return 3;
  }

  const totalWeek = garden.reduce((sum, d) => sum + d.total, 0);
  const bestDay = garden.reduce(
    (best, d) => (d.total > best.total ? d : best),
    { total: -1 }
  );

  let streak = 0;
  for (let i = garden.length - 1; i >= 0; i--) {
    if (garden[i].total > 0) streak++;
    else break;
  }

  const today = garden[garden.length - 1];
  const todayPct = today
    ? Math.min(100, Math.round((today.total / DAILY_GOAL) * 100))
    : 0;

  if (loading) {
    return (
      <div style={styles.loadingShell}>
        <style>{globalStyle}</style>
        <div style={styles.loadingRing} />
        <p style={styles.loadingText}>Menumbuhkan taman progres kamu</p>
      </div>
    );
  }

  const RADIUS = 58;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC - (todayPct / 100) * CIRC;

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
            <span style={styles.eyebrow}>PROGRESS</span>
            <h1 style={styles.heading}>Taman Progres 🌸</h1>
            <p style={styles.subheading}>
              Tiap tugas dan habit yang kamu selesaikan menumbuhkan satu bunga
              di taman ini.
            </p>
          </div>

          {/* Hero: today ring + flower */}
          <div className="bloom-card" style={styles.heroCard}>
            <div style={styles.heroLeft}>
              <div style={styles.ringWrap}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    fill="none"
                    stroke="var(--ring-track)"
                    strokeWidth="11"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    fill="none"
                    stroke="url(#ringGradient)"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 70 70)"
                    style={{ transition: "stroke-dashoffset .6s ease" }}
                  />
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E7B65C" />
                      <stop offset="100%" stopColor="#4B7B5B" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={styles.ringCenter}>
                  <Flower stage={getStage(today?.total || 0)} size={56} />
                </div>
              </div>
            </div>

            <div style={styles.heroRight}>
              <span style={styles.cardEyebrow}>HARI INI</span>
              <p style={styles.heroNumber}>
                {today?.total || 0}{" "}
                <span style={styles.heroUnit}>aktivitas selesai</span>
              </p>
              <p style={styles.heroHint}>
                {todayPct >= 100
                  ? "Bunga hari ini mekar penuh. Kerja bagus!"
                  : todayPct === 0
                  ? "Selesaikan satu tugas atau habit untuk mulai menanam."
                  : "Terus rawat, sedikit lagi mekar sempurna."}
              </p>

              <div style={styles.heroStats}>
                <HeroStat
                  icon={<FiTrendingUp size={14} />}
                  label="Total minggu ini"
                  value={totalWeek}
                />
                <HeroStat
                  icon={<FiZap size={14} />}
                  label="Streak aktif"
                  value={`${streak} hari`}
                />
                <HeroStat
                  icon={<FiAward size={14} />}
                  label="Hari terbaik"
                  value={
                    bestDay.total > 0
                      ? `${bestDay.dayLabel} (${bestDay.total})`
                      : "—"
                  }
                />
              </div>
            </div>
          </div>

          {/* Garden row */}
          <div className="bloom-card" style={styles.gardenCard}>
            <span style={styles.cardEyebrow}>7 HARI TERAKHIR</span>

            <div style={styles.gardenRow}>
              {garden.map((day) => (
                <div key={day.date} style={styles.gardenPlot}>
                  <div style={styles.flowerSlot}>
                    <Flower stage={getStage(day.total)} size={44} />
                  </div>
                  <div style={styles.groundLine} />
                  <span
                    style={{
                      ...styles.dayLabel,
                      color: day.isToday ? "var(--accent-green-dark)" : "var(--text-tertiary)",
                      fontWeight: day.isToday ? 700 : 600,
                    }}
                  >
                    {day.dayLabel}
                  </span>
                  <span style={styles.dayCount}>{day.total}</span>
                </div>
              ))}
            </div>

            <div style={styles.legend}>
              <LegendItem stage={0} label="Belum ada" />
              <LegendItem stage={1} label="Mulai tumbuh" />
              <LegendItem stage={2} label="Berkuncup" />
              <LegendItem stage={3} label="Mekar penuh" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function HeroStat({ icon, label, value }) {
  return (
    <div style={styles.heroStatItem}>
      <div style={styles.heroStatIcon}>{icon}</div>
      <div>
        <p style={styles.heroStatValue}>{value}</p>
        <p style={styles.heroStatLabel}>{label}</p>
      </div>
    </div>
  );
}

function LegendItem({ stage, label }) {
  return (
    <div style={styles.legendItem}>
      <Flower stage={stage} size={22} />
      <span style={styles.legendText}>{label}</span>
    </div>
  );
}

// A single stemmed flower with 4 growth stages: seed, sprout, budding, bloom.
function Flower({ stage, size = 48 }) {
  const stemHeight = [4, 22, 38, 54][stage];
  const leafCount = stage;
  const bloomColor =
    stage === 3 ? "#E7B65C" : stage === 2 ? "#C9DBC0" : "#A8C3A0";

  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 60 82"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* soil */}
      <ellipse cx="30" cy="78" rx="16" ry="3" fill="#DCD5BF" opacity="0.6" />

      {stage === 0 ? (
        <circle cx="30" cy="75" r="3" fill="#8A8266" />
      ) : (
        <>
          <path
            d={`M30 78V${78 - stemHeight}`}
            stroke="#4B7B5B"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {Array.from({ length: leafCount }).map((_, i) => {
            const y = 74 - i * 14;
            const left = i % 2 === 0;
            const x2 = left ? 30 - 12 : 30 + 12;
            return (
              <path
                key={i}
                d={`M30 ${y} Q${(30 + x2) / 2} ${y - 6} ${x2} ${y - 3}`}
                stroke="#5C8A63"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {stage === 1 && (
            <circle cx="30" cy={78 - stemHeight} r="4" fill="#8FB587" />
          )}

          {stage === 2 && (
            <ellipse
              cx="30"
              cy={78 - stemHeight}
              rx="5"
              ry="7"
              fill={bloomColor}
            />
          )}

          {stage === 3 && (
            <g transform={`translate(30 ${78 - stemHeight})`}>
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <ellipse
                  key={angle}
                  cx="0"
                  cy="-8"
                  rx="5"
                  ry="8"
                  fill={bloomColor}
                  transform={`rotate(${angle})`}
                  opacity="0.95"
                />
              ))}
              <circle cx="0" cy="0" r="4.5" fill="#8A5A2B" />
            </g>
          )}
        </>
      )}
    </svg>
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
    box-shadow: 0 12px 28px var(--shadow-card-hover);
  }

  @keyframes bloom-spin {
    to { transform: rotate(360deg); }
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
    background: "var(--bg-app)",
    fontFamily: "'Inter', sans-serif",
  },
  loadingRing: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "3px solid var(--loading-track)",
    borderTopColor: "var(--accent-green)",
    animation: "bloom-spin 0.9s linear infinite",
  },
  loadingText: {
    fontSize: 14,
    color: "var(--text-secondary)",
  },

  page: {
    position: "relative",
    minHeight: "100vh",
    background: `
      radial-gradient(ellipse 900px 600px at 12% -6%, var(--bg-overlay-1), transparent 62%),
      radial-gradient(ellipse 750px 550px at 100% 0%, var(--bg-overlay-2), transparent 55%),
      radial-gradient(ellipse 850px 750px at 88% 100%, var(--bg-overlay-3), transparent 58%),
      radial-gradient(ellipse 750px 550px at 0% 100%, var(--bg-overlay-4), transparent 60%),
      var(--bg-app)
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
    maxWidth: 900,
    margin: "0 auto",
  },

  header: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.16em",
    color: "var(--text-eyebrow)",
    fontWeight: 600,
  },
  heading: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 32,
    color: "var(--text-primary)",
    margin: "8px 0 0",
    letterSpacing: "-0.01em",
  },
  subheading: {
    fontSize: 14,
    color: "var(--text-secondary)",
    marginTop: 8,
    maxWidth: 480,
  },

  cardEyebrow: {
    fontSize: 11,
    letterSpacing: "0.14em",
    color: "var(--text-secondary)",
    fontWeight: 600,
  },

  heroCard: {
    display: "flex",
    alignItems: "center",
    gap: 32,
    flexWrap: "wrap",
    background: "var(--bg-card)",
    border: "1px solid var(--border-card)",
    borderRadius: 20,
    padding: "28px 30px",
    marginBottom: 16,
    boxShadow: "0 2px 10px var(--shadow-card)",
  },
  heroLeft: {
    flexShrink: 0,
  },
  ringWrap: {
    position: "relative",
    width: 140,
    height: 140,
  },
  ringCenter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroRight: {
    flex: 1,
    minWidth: 220,
  },
  heroNumber: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 30,
    color: "var(--text-primary)",
    margin: "8px 0 0",
  },
  heroUnit: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  heroHint: {
    fontSize: 13,
    color: "var(--text-secondary)",
    marginTop: 8,
    lineHeight: 1.6,
  },
  heroStats: {
    display: "flex",
    gap: 20,
    marginTop: 20,
    flexWrap: "wrap",
  },
  heroStatItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  heroStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "var(--tint-sage-bg)",
    color: "var(--accent-green)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroStatValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: 0,
  },
  heroStatLabel: {
    fontSize: 11.5,
    color: "var(--text-tertiary)",
    marginTop: 1,
  },

  gardenCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border-card)",
    borderRadius: 20,
    padding: "26px 28px",
    boxShadow: "0 2px 10px var(--shadow-card)",
  },
  gardenRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 18,
    paddingBottom: 16,
    borderBottom: "1px solid var(--border-card)",
  },
  gardenPlot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  flowerSlot: {
    height: 76,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  groundLine: {
    width: "70%",
    height: 1,
    background: "var(--border-card)",
    marginTop: 2,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 8,
    textTransform: "capitalize",
  },
  dayCount: {
    fontSize: 11,
    color: "var(--text-faint)",
    marginTop: 2,
  },

  legend: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    marginTop: 16,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: "var(--text-secondary)",
  },
};

export default Progress;