import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getProgressSummary } from "../controllers/progress.controller.js";

const router = Router();

router.get("/summary", requireAuth, getProgressSummary);

export default router;
