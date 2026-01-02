import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import {
  generateWorkoutPlan,
  getUserPlans,
  deleteUserPlan,
} from "../controllers/aiController.js";

const router = express.Router();

// AI routes - protected with cookie-based authentication
router.post("/generate-plan", cookieAuth, generateWorkoutPlan);
router.get("/plans", cookieAuth, getUserPlans);
router.delete("/plans/:planId", cookieAuth, deleteUserPlan);

export default router;
