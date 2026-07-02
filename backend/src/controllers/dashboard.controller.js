import { supabaseAdmin } from "../config/supabase.js";

/**
 * GET /api/dashboard/summary
 *
 * Returns task totals + recent completed-task activity for the
 * authenticated user in one call, instead of the frontend running
 * two separate Supabase queries and computing progress client-side.
 */
export async function getDashboardSummary(req, res) {
  try {
    const userId = req.user.id;

    const { data: tasks, error } = await supabaseAdmin
      .from("tasks")
      .select("id, title, is_completed, completed_at")
      .eq("user_id", userId);

    if (error) throw error;

    const allTasks = tasks || [];
    const completedTasks = allTasks.filter((t) => t.is_completed);

    const progress =
      allTasks.length === 0
        ? 0
        : Math.round((completedTasks.length / allTasks.length) * 100);

    const recentActivities = completedTasks
      .sort(
        (a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0)
      )
      .slice(0, 5)
      .map((task) => ({
        id: task.id,
        type: "task",
        title: task.title,
        description: "Task completed",
        completedAt: task.completed_at,
      }));

    res.json({
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      progress,
      activities: recentActivities,
    });
  } catch (err) {
    console.error("getDashboardSummary error:", err.message);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
}
