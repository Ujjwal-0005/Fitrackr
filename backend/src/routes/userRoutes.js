import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import {
  getMe,
  updateOnboarding,
  getOnboarding,
  getOverview,
  getWeeklyStats,
  getGoalProgress,
  upsertGoal,
  changePassword,
  uploadAvatar,
} from "../controllers/userController.js";
import { getWorkoutStreak } from "../controllers/streakController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* ------------------ PROFILE ------------------ */
// fetch current user profile
router.get("/me", cookieAuth, getMe);
router.get("/profile", cookieAuth, getMe); // Alias for /me

// upload avatar
router.post("/me/avatar", cookieAuth, upload.single("avatar"), uploadAvatar);

// update onboarding info
router.route("/me/onboarding")
  .get(cookieAuth, getOnboarding)
  .put(cookieAuth, updateOnboarding);

// change password
router.put("/me/password", cookieAuth, changePassword);

/* ------------------ ANALYTICS ------------------ */
// overall stats (for profile cards)
router.get("/me/overview", cookieAuth, getOverview);

// weekly chart data
router.get("/me/weekly", cookieAuth, getWeeklyStats);

// workout streak
router.get("/me/streak", cookieAuth, getWorkoutStreak);

/* ------------------ GOALS ------------------ */
// create or update goal
router.post("/me/goals", cookieAuth, upsertGoal);

// get progress (for GoalProgress component)
router.get("/me/goals/progress", cookieAuth, getGoalProgress);

export default router;
