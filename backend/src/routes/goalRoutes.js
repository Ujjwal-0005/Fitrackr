import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
// WeighIn import removed
import { PersonalRecord } from "../models/PersonalRecord.js";
const router = express.Router();

// Health check
router.get("/ping", (req, res) => res.json({ ok: true, where: "goals" }));

// Progress (place before any dynamic routes)
router.get("/progress", cookieAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user?.goals?.length) return res.json([]);

    const sessions = await Session.find({ userId: req.user._id }).lean();
    const sessionCount = sessions.length;

    // helpers
    const latestWeighIn = null; // WeighIn removed
    const firstWeighIn = null; // WeighIn removed

    const strengthPRs = await PersonalRecord.find({ userId: req.user._id, kind: "strength" }).sort({ date: 1 });
    const endurPRs = await PersonalRecord.find({ userId: req.user._id, kind: "endurance" }).sort({ date: 1 });

    const activeGoals = user.goals.filter(g => g.isActive);

    const enriched = activeGoals.map((goal) => {
      let progress = 0;

      if (goal.type === "fat_loss") {
        const match = /(-?\d+(\.\d+)?)\s*kg/i.exec(goal.target || "");
        const targetKg = match ? Math.abs(parseFloat(match[1])) : 0;

        if (targetKg > 0) {
          const lost = 0; // WeighIn removed
          progress = Math.max(0, Math.min(100, (lost / targetKg) * 100));
        } else {
          progress = Math.min(100, sessionCount * 5);
        }
      } else if (goal.type === "muscle_gain") {
        let volume = 0;
        sessions.forEach(s => s.exercises?.forEach(ex => {
          ex.sets?.forEach(set => {
            const reps = set.reps || 0;
            const w = set.weight || 0;
            volume += reps * w;
          });
        }));
        progress = Math.min(100, (volume / 100000) * 100) || Math.min(100, sessionCount * 4);
      } else if (goal.type === "strength") {
        const benchPRs = strengthPRs.filter(p => /bench/i.test(p.name) && /rm/i.test(p.name));
        if (benchPRs.length >= 2) {
          const start = benchPRs[0].value;
          const latest = benchPRs[benchPRs.length - 1].value;
          const targetMatch = /(\d+(\.\d+)?)\s*kg/i.exec(goal.target || "");
          const target = targetMatch ? parseFloat(targetMatch[1]) : null;
          if (target && start < target) {
            progress = Math.max(0, Math.min(100, ((latest - start) / (target - start)) * 100));
          } else {
            progress = Math.min(100, sessionCount * 6);
          }
        } else {
          progress = Math.min(100, sessionCount * 6);
        }
      } else if (goal.type === "endurance") {
        const fiveK = endurPRs.filter(p => /5k/i.test(p.name));
        if (fiveK.length >= 2) {
          const start = fiveK[0].value; // minutes
          const latest = fiveK[fiveK.length - 1].value;
          const targetMatch = /(\d+(\.\d+)?)\s*(min|mins|minutes)/i.exec(goal.target || "");
          const target = targetMatch ? parseFloat(targetMatch[1]) : null;
          if (target && start > target) {
            progress = Math.max(0, Math.min(100, ((start - latest) / (start - target)) * 100));
          } else {
            progress = Math.min(100, sessionCount * 3);
          }
        } else {
          progress = Math.min(100, sessionCount * 3);
        }
      } else {
        progress = Math.min(100, sessionCount * 4);
      }

      return { ...goal, progress: Math.round(progress) };
    });

    res.json(enriched);
  } catch (err) {
    console.error("[goals] progress error:", err);
    res.status(500).json({ message: "Failed to load goal progress" });
  }
});

// Create goal
router.post("/", cookieAuth, async (req, res) => {
  try {
    const { type, target, startDate, targetDate, isActive = true } = req.body;
    const user = await User.findById(req.user._id);
    user.goals.push({ type, target, startDate, targetDate, isActive });
    await user.save();
    res.status(201).json({ message: "Goal created", goals: user.goals });
  } catch (e) {
    console.error("[goals] create error:", e);
    res.status(500).json({ message: "Failed to create goal" });
  }
});

// List goals
router.get("/", cookieAuth, async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  res.json(user?.goals || []);
});

// Activate goal
router.patch("/:goalId/activate", cookieAuth, async (req, res) => {
  const { goalId } = req.params;
  const user = await User.findById(req.user._id);
  const goal = user.goals.id(goalId);
  if (!goal) return res.status(404).json({ message: "Goal not found" });
  goal.isActive = true;
  await user.save();
  res.json({ message: "Goal activated", goal });
});

export default router; // ✅ default export
