import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiCheckCircle } from "react-icons/fi";
import supabase from "../lib/supabase";
import Navbar from "../components/Navbar";

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function getTasks() {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    setTasks(data || []);
    setLoading(false);
  }

  async function addTask() {
    if (!title.trim()) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("tasks").insert([
      {
        title,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    setTitle("");
    await getTasks();
    setSaving(false);
  }

  async function toggleTask(task) {
    await supabase
      .from("tasks")
      .update({
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : null,
      })
      .eq("id", task.id);

    getTasks();
  }

  async function deleteTask(id) {
    await supabase.from("tasks").delete().eq("id", id);
    getTasks();
  }

  useEffect(() => {
    getTasks();
  }, []);

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const activeTasks = tasks.filter((t) => !t.is_completed);
  const doneTasks = tasks.filter((t) => t.is_completed);

  if (loading) {
    return (
      <div style={styles.loadingShell}>
        <style>{globalStyle}</style>
        <div style={styles.loadingRing} />
        <p style={styles.loadingText}>Menyiapkan daftar tugas kamu</p>
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
            <span style={styles.eyebrow}>TODO</span>
            <h1 style={styles.heading}>Daftar Tugas 🌱</h1>
            <p style={styles.subheading}>
              {tasks.length === 0
                ? "Belum ada tugas. Tambahkan yang pertama di bawah."
                : `${completedCount} dari ${tasks.length} tugas selesai hari ini.`}
            </p>
          </div>

          {/* Add task */}
          <div className="bloom-card" style={styles.addCard}>
            <input
              type="text"
              placeholder="Tulis tugas baru..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              style={styles.input}
            />
            <button
              onClick={addTask}
              disabled={saving || !title.trim()}
              className="bloom-add-btn"
              style={{
                opacity: saving || !title.trim() ? 0.6 : 1,
                cursor: saving || !title.trim() ? "not-allowed" : "pointer",
              }}
            >
              <FiPlus size={16} />
              Tambah
            </button>
          </div>

          {/* Task list */}
          {tasks.length === 0 ? (
            <div className="bloom-card" style={styles.emptyCard}>
              <span style={styles.emptyEmoji}>🌱</span>
              <p style={styles.emptyTitle}>Belum ada tugas</p>
              <p style={styles.emptyText}>
                Tulis tugas pertamamu di kotak atas untuk mulai menumbuhkan
                progresmu hari ini.
              </p>
            </div>
          ) : (
            <div style={styles.listWrap}>
              {activeTasks.length > 0 && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>
                    BERJALAN · {activeTasks.length}
                  </span>
                  <div style={styles.taskList}>
                    {activeTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                      />
                    ))}
                  </div>
                </div>
              )}

              {doneTasks.length > 0 && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>
                    SELESAI · {doneTasks.length}
                  </span>
                  <div style={styles.taskList}>
                    {doneTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <div className="bloom-task-row" style={styles.taskRow}>
      <button
        onClick={() => onToggle(task)}
        className="bloom-checkbox"
        style={{
          ...styles.checkbox,
          background: task.is_completed ? "#4B7B5B" : "#FFFFFF",
          borderColor: task.is_completed ? "#4B7B5B" : "#D9D2BC",
        }}
        aria-label="Toggle task"
      >
        {task.is_completed && <FiCheckCircle size={13} color="#F8F5EC" />}
      </button>

      <span
        style={{
          ...styles.taskTitle,
          color: task.is_completed ? "#A3AEA3" : "#1C2A20",
          textDecoration: task.is_completed ? "line-through" : "none",
        }}
      >
        {task.title}
      </span>

      <button
        onClick={() => onDelete(task.id)}
        className="bloom-delete-btn"
        aria-label="Hapus tugas"
      >
        <FiTrash2 size={15} />
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

  .bloom-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 22px;
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

  .bloom-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    min-width: 22px;
    border-radius: 7px;
    border: 1.6px solid;
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease, transform .15s ease;
  }
  .bloom-checkbox:hover {
    transform: scale(1.08);
  }

  .bloom-delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #C4BEA9;
    cursor: pointer;
    opacity: 0;
    transition: opacity .2s ease, background .2s ease, color .2s ease;
  }
  .bloom-task-row:hover .bloom-delete-btn {
    opacity: 1;
  }
  .bloom-delete-btn:hover {
    background: #FBF1EE;
    color: #C0604A;
  }

  input::placeholder {
    color: #A9A48F;
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
    gap: 10,
    background: "#FFFFFF",
    border: "1px solid #E9E3D2",
    borderRadius: 16,
    padding: 10,
    marginBottom: 28,
    boxShadow: "0 2px 10px rgba(30, 50, 34, 0.04)",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: "#1C2A20",
    padding: "0 12px",
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
    padding: "13px 14px",
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
  },
};

export default Todo;