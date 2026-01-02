import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import { Session } from "../models/Session.js";
const router = express.Router();

// ✅ Get analytics summary (weekly/monthly)
router.get("/summary", cookieAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all sessions for current user
    const sessions = await Session.find({ userId }).lean();

    if (!sessions.length) {
      return res.json({
        totalSessions: 0,
        totalCalories: 0,
        avgCalories: 0,
        totalMinutes: 0,
        weeklyData: [],
      });
    }

    // Compute totals
    const totalCalories = sessions.reduce((sum, s) => sum + (s.calories || 0), 0);
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgCalories = Math.round(totalCalories / totalSessions);

    // Group sessions by week (for chart)
    const weeklyMap = {};
    sessions.forEach((s) => {
      const week = new Date(s.date).toLocaleString("en-US", { month: "short", week: "numeric" });
      weeklyMap[week] = (weeklyMap[week] || 0) + (s.calories || 0);
    });

    const weeklyData = Object.keys(weeklyMap).map((w) => ({
      week: w,
      calories: weeklyMap[w],
    }));

    res.json({
      totalSessions,
      totalCalories,
      avgCalories,
      totalMinutes,
      weeklyData,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;
