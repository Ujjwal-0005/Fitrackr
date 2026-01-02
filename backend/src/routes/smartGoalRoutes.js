import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import {
  createSmartGoal,
  getActiveGoalDetailed,
  recalculateGoalProgress,
  abandonGoal
} from "../controllers/smartGoalController.js";

const router = express.Router();

// Create new smart goal
router.post("/", cookieAuth, createSmartGoal);

// Get active goal with detailed progress
router.get("/active/detailed", cookieAuth, getActiveGoalDetailed);

// Recalculate goal progress
router.post("/:id/recalculate", cookieAuth, recalculateGoalProgress);

// Abandon active goal
router.post("/abandon", cookieAuth, abandonGoal);

export default router;
