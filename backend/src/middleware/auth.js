import { supabaseAdmin } from "../config/supabase.js";

/**
 * Verifies the Supabase access token sent by the frontend
 * (Authorization: Bearer <token>) and attaches the authenticated
 * user to req.user. Rejects the request if the token is missing
 * or invalid.
 *
 * The frontend gets this token from:
 *   const { data } = await supabase.auth.getSession();
 *   const token = data.session?.access_token;
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing access token" });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  next();
}
