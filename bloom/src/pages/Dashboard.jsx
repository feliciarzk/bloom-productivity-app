import { useEffect, useState } from "react";
import {
  FiCheckSquare,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

function Dashboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadDashboard();

    // Realtime subscription: setiap ada perubahan di tasks / habit_logs,
    // dashboard akan otomatis reload sehingga Recent Activity ikut ke-upgrade.
    const channel = supabase
      .channel("dashboard-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => loadDashboard()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "habit_logs" },
        () => loadDashboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const [tasksResult, habitsResult] = await Promise.all([
      supabase.from("tasks").select("*"),

      supabase
        .from("habit_logs")
        .select(`
          id,
          created_at,
          habits(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const tasks = tasksResult.data || [];
    const habitLogs = habitsResult.data || [];

    const completed = tasks.filter((task) => task.is_completed).length;

    setTotalTasks(tasks.length);
    setCompletedTasks(completed);

    // Gabungkan task selesai + habit log jadi satu list,
    // lalu urutkan berdasarkan waktu asli (bukan urutan array biasa).
    const taskActivities = tasks
      .filter((task) => task.is_completed)
      .map((task) => ({
        id: `task-${task.id}`,
        type: "task",
        title: task.title,
        descriptionKey: "dashboard.taskCompleted",
        // Sesuaikan nama kolom jika tabel tasks-mu tidak punya updated_at
        timestamp: task.updated_at || task.created_at,
      }));

    const habitActivities = habitLogs.map((log) => ({
      id: `habit-${log.id}`,
      type: "habit",
      title: log.habits?.name || t("dashboard.habitUnknown"),
      descriptionKey: "dashboard.habitLogged",
      timestamp: log.created_at,
    }));

    const merged = [...taskActivities, ...habitActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map((activity) => ({ ...activity, time: timeAgo(activity.timestamp) }));

    setActivities(merged);

    setLoading(false);
  }

  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  if (loading) {
    return (
      <div style={styles.loadingShell}>
        <style>{globalStyle}</style>
        <div style={styles.loadingRing}>
          <div style={styles.loadingRingInner} />
        </div>
        <p style={styles.loadingText}>{t("dashboard.loading")}</p>
      </div>
    );
  }

  const leafCount = Math.min(completedTasks, 6);

  // circular progress ring math
  const RADIUS = 62;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC - (progress / 100) * CIRC;

  return (
    <>
      <Navbar />

      <main style={styles.page}>
        <style>{globalStyle}</style>

        {/* ambient mesh + grain + botanical texture */}
        <div style={styles.grain} />
        <BotanicalMotif style={styles.botanicalTop} flip={false} />
        <BotanicalMotif style={styles.botanicalBottom} flip={true} />

        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.eyebrow}>{t("dashboard.eyebrow")}</span>
            <h1 style={styles.heading}>{t("dashboard.heading")}</h1>
            <p style={styles.subheading}>
              {t("dashboard.subheading")}
            </p>
          </div>

          {/* Stat cards */}
          <div style={styles.statRow}>
            <StatCard
              icon={<FiCheckSquare size={18} />}
              label={t("dashboard.totalTasks")}
              value={totalTasks}
              tint="sage"
            />
            <StatCard
              icon={<FiCheckCircle size={18} />}
              label={t("dashboard.completed")}
              value={completedTasks}
              tint="green"
            />
          </div>

          {/* Progress + Plant */}
          <div style={styles.midGrid}>
            <div className="bloom-card" style={styles.card}>
              <span style={styles.cardEyebrow}>{t("dashboard.progressToday")}</span>

              <div style={styles.progressLayout}>
                <div style={styles.ringWrap}>
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle
                      cx="75"
                      cy="75"
                      r={RADIUS}
                      fill="none"
                      stroke="var(--ring-track)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="75"
                      cy="75"
                      r={RADIUS}
                      fill="none"
                      stroke="url(#ringGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 75 75)"
                      style={{ transition: "stroke-dashoffset .6s ease" }}
                    />
                    <defs>
                      <linearGradient
                        id="ringGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="var(--accent-green-light)" />
                        <stop offset="100%" stopColor="var(--accent-green-dark)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={styles.ringCenter}>
                    <span style={styles.ringNumber}>{progress}%</span>
                  </div>
                </div>

                <div style={styles.progressMeta}>
                  <p style={styles.progressCaption}>
                    {t("dashboard.progressCaption")(completedTasks, totalTasks)}
                  </p>
                  <p style={styles.progressHint}>
                    {progress >= 100
                      ? t("dashboard.hintDone")
                      : progress === 0
                      ? t("dashboard.hintZero")
                      : t("dashboard.hintPartial")}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bloom-card"
              style={{ ...styles.card, alignItems: "center" }}
            >
              <span style={styles.cardEyebrow}>{t("dashboard.bloomProgress")}</span>
              <svg
                viewBox="0 0 160 180"
                style={styles.plantSvg}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M80 170V60"
                  stroke="#4B7B5B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {Array.from({ length: leafCount }).map((_, i) => {
                  const y = 150 - i * 18;
                  const left = i % 2 === 0;
                  const x1 = 80;
                  const x2 = left ? 80 - 26 : 80 + 26;
                  return (
                    <path
                      key={i}
                      d={`M${x1} ${y} Q${(x1 + x2) / 2} ${y - 12} ${x2} ${
                        y - 6
                      }`}
                      stroke="#5C8A63"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  );
                })}
                <circle
                  cx="80"
                  cy={leafCount >= 6 ? 46 : 60 - leafCount * 2}
                  r={leafCount >= 6 ? 10 : 5}
                  fill={leafCount >= 6 ? "#C9A227" : "#3A6248"}
                  opacity={leafCount >= 6 ? 1 : 0.7}
                />
              </svg>
              <p style={styles.plantCaption}>
                {completedTasks === 0
                  ? t("dashboard.plantZero")
                  : progress >= 100
                  ? t("dashboard.plantDone")
                  : t("dashboard.plantPartial")}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={styles.bottomGrid}>
            <div className="bloom-card" style={styles.card}>
              <span style={styles.cardEyebrow}>{t("dashboard.recentActivity")}</span>
              {activities.length > 0 ? (
                <div style={styles.activityList}>
                  {activities.map((activity) => (
                    <div key={activity.id} style={styles.activityRow}>
                      <span style={styles.activityDot} />
                      <div>
                        <p style={styles.activityTitle}>{activity.title}</p>
                        <p style={styles.activityMeta}>
                          {t(activity.descriptionKey)} · {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <FiClock size={18} color="var(--text-muted)" />
                  <p style={styles.emptyText}>
                    {t("dashboard.noActivity")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
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
      <path
        d="M90 190C140 200 180 180 205 130"
        stroke="#3A5C3E"
        strokeWidth="2.2"
      />
      <path
        d="M74 136C120 128 150 100 160 55"
        stroke="#3A5C3E"
        strokeWidth="2.2"
      />
      <path
        d="M40 260C90 268 125 250 150 210"
        stroke="#3A5C3E"
        strokeWidth="2.2"
      />
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

function StatCard({ icon, label, value, tint = "green" }) {
  const tintMap = {
    green: { bg: "var(--tint-green-bg)", fg: "var(--tint-green-fg)" },
    sage: { bg: "var(--tint-sage-bg)", fg: "var(--tint-sage-fg)" },
    gold: { bg: "var(--tint-gold-bg)", fg: "var(--tint-gold-fg)" },
  };
  const t = tintMap[tint] || tintMap.green;

  return (
    <div className="bloom-card" style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: t.bg, color: t.fg }}>
        {icon}
      </div>
      <div>
        <p style={styles.statValue}>{value}</p>
        <p style={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

// Mengubah timestamp jadi teks relatif, mis. "5 menit lalu"
function timeAgo(dateString) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateString).toLocaleDateString();
}

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

  .bloom-card {
    transition: box-shadow .25s ease, transform .25s ease, border-color .25s ease;
  }
  .bloom-card:hover {
    box-shadow: 0 12px 28px var(--shadow-card-hover);
    transform: translateY(-2px);
    border-color: var(--border-card-hover);
  }
  .bloom-link {
    position: relative;
  }
  .bloom-link:after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 1px;
    background: var(--accent-green);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .2s ease;
  }
  .bloom-link:hover:after {
    transform: scaleX(1);
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
    background:
      "radial-gradient(circle at 30% 20%, #EEF3E5 0%, #F8F5EC 55%)",
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
  loadingRingInner: {},
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
    padding: "40px 24px 80px",
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
    opacity: 0.20,
    pointerEvents: "none",
  },
  container: {
    position: "relative",
    maxWidth: 1100,
    margin: "0 auto",
  },

  header: {
    marginBottom: 36,
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
    fontSize: 34,
    color: "var(--text-primary)",
    margin: "8px 0 0",
    letterSpacing: "-0.01em",
  },
  subheading: {
    fontSize: 15,
    color: "var(--text-secondary)",
    marginTop: 8,
  },

  statRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "var(--bg-card)",
    border: "1px solid var(--border-card)",
    borderRadius: 16,
    padding: "20px 22px",
    boxShadow: "0 2px 10px var(--shadow-card)",
  },
  statIcon: {
    width: 40,
    height: 40,
    minWidth: 40,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 24,
    color: "var(--text-primary)",
    margin: 0,
    textTransform: "capitalize",
  },
  statLabel: {
    fontSize: 13,
    color: "var(--text-secondary)",
    marginTop: 2,
  },

  midGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
  },

  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border-card)",
    borderRadius: 18,
    padding: "26px 28px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 10px var(--shadow-card)",
  },
  cardEyebrow: {
    fontSize: 11,
    letterSpacing: "0.14em",
    color: "var(--text-secondary)",
    fontWeight: 600,
    marginBottom: 20,
  },

  progressLayout: {
    display: "flex",
    alignItems: "center",
    gap: 28,
    flexWrap: "wrap",
  },
  ringWrap: {
    position: "relative",
    width: 150,
    height: 150,
    flexShrink: 0,
  },
  ringCenter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ringNumber: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 30,
    color: "var(--text-primary)",
  },
  progressMeta: {
    flex: 1,
    minWidth: 160,
  },
  progressCaption: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-primary)",
    margin: 0,
  },
  progressHint: {
    fontSize: 13,
    color: "var(--text-secondary)",
    marginTop: 8,
    lineHeight: 1.6,
  },

  plantSvg: {
    width: 120,
    height: 130,
  },
  plantCaption: {
    fontSize: 13,
    color: "var(--text-secondary)",
    textAlign: "center",
    marginTop: 10,
  },

  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.6,
  },
  emptyLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--accent-green)",
    textDecoration: "none",
  },

  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  activityRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--accent-green)",
    marginTop: 6,
    boxShadow: "0 0 0 4px rgba(75,123,91,0.12)",
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-primary)",
    margin: 0,
  },
  activityMeta: {
    fontSize: 12,
    color: "var(--text-muted)",
    marginTop: 2,
  },
};

export default Dashboard;