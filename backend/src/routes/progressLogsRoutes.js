// backend/src/routes/progressLogsRoutes.js
import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
// WeighIn import removed
import { PersonalRecord } from "../models/PersonalRecord.js";

const router = express.Router();

// Health check
router.get("/ping", (req, res) => res.json({ ok: true, where: "progress" }));

// Add/update a weigh-in
router.post("/weigh-ins", cookieAuth, async (req, res) => {
  const { weightKg, date } = req.body;
  if (!weightKg) return res.status(400).json({ message: "weightKg required" });
  // WeighIn create removed
  res.status(201).json(wi);
});

// List weigh-ins
router.get("/weigh-ins", cookieAuth, async (req, res) => {
  const list = []; // WeighIn find removed
  res.json(list);
});

// Add a personal record (strength/endurance)
router.post("/prs", cookieAuth, async (req, res) => {
  const { kind, name, value, unit, date } = req.body;
  if (!kind || !name || value == null || !unit) {
    return res.status(400).json({ message: "kind, name, value, unit required" });
  }
  const pr = await PersonalRecord.create({
    userId: req.user._id,
    kind,
    name,
    value,
    unit,
    date,
  });
  res.status(201).json(pr);
});

// List PRs
router.get("/prs", cookieAuth, async (req, res) => {
  const list = await PersonalRecord.find({ userId: req.user._id }).sort({ date: -1 });
  res.json(list);
});

export default router;
