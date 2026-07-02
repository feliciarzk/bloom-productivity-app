import { supabaseAdmin } from "../config/supabase.js";

const DAILY_GOAL = 6;

/**
 * GET /api/progress/summary
 *
 * Aggregates the last 7 days of completed tasks + habit logs for the
 * authenticated user and returns per-day totals, current streak,
 * best day, and today's completion percentage.
 *
 * This mirrors the logic that used to live entirely in Progress.jsx —
 * moved here so the frontend just renders numbers instead of computing
 * them, and so the same calculation can be reused by other clients
 * (e.g. a future mobile app) without duplicating logic.
 */
export async function getProgressSummary(req, res) {
  try {
    const userId = req.user.id;

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const [tasksResult, logsResult] = await Promise.all([
      supabaseAdmin
        .from("tasks")
        .select("id, completed_at")
        .eq("user_id", userId)
        .eq("is_completed", true)
        .gte("completed_at", start.toISOString()),

      supabaseAdmin
        .from("habit_logs")
        .select("id, completed_date")
        .eq("user_id", userId)
        .gte("completed_date", start.toISOString().split("T")[0]),
    ]);

    if (tasksResult.error) throw tasksResult.error;
    if (logsResult.error) throw logsResult.error;

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
      const habitCount = logs.filter(
        (l) => l.completed_date === dateStr
      ).length;

      days.push({
        date: dateStr,
        dayLabel: d.toLocaleDateString("id-ID", { weekday: "short" }),
        dateLabel: d.getDate(),
        total: taskCount + habitCount,
        isToday: i === 0,
      });
    }

    const totalWeek = days.reduce((sum, d) => sum + d.total, 0);
    const bestDay = days.reduce(
      (best, d) => (d.total > best.total ? d : best),
      { total: -1 }
    );

    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].total > 0) streak++;
      else break;
    }

    const todayData = days[days.length - 1];
    const todayPct = todayData
      ? Math.min(100, Math.round((todayData.total / DAILY_GOAL) * 100))
      : 0;

    res.json({
      days,
      totalWeek,
      bestDay: bestDay.total > 0 ? bestDay : null,
      streak,
      today: todayData,
      todayPct,
      dailyGoal: DAILY_GOAL,
    });
  } catch (err) {
    console.error("getProgressSummary error:", err.message);
    res.status(500).json({ error: "Failed to load progress summary" });
  }
}
