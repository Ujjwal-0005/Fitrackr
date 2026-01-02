import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import {
  getOverviewStats,
  getSessionsByDate,
  getWeeklyStats,
  getMuscleBreakdown,
} from "../controllers/statsController.js";

const router = express.Router();

// Overview — summary cards
router.get("/overview", cookieAuth, getOverviewStats);

// Calendar — sessions for a particular date
router.get("/sessions-by-date", cookieAuth, getSessionsByDate);

// Weekly — for chart data
router.get("/weekly", cookieAuth, getWeeklyStats);

// Muscle breakdown (optional pie chart)
router.get("/muscles", cookieAuth, getMuscleBreakdown);

export default router;
