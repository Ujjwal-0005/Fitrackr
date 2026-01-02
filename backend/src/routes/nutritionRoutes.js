import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import { nutritionRateLimiter } from "../middleware/nutritionRateLimiter.js";
import {
  getMyMeals,
  logMeal,
  logMealWithAI,
  getDailySummary,
  updateMeal,
  deleteMeal,
} from "../controllers/nutritionController.js";

const router = express.Router();

// CalorieNinjas AI-powered nutrition tracking (with rate limiting)
router.post("/log-meal", cookieAuth, nutritionRateLimiter, logMealWithAI);
router.get("/daily-summary", cookieAuth, getDailySummary);

// Original meal CRUD operations
router.get("/", cookieAuth, getMyMeals);
router.post("/", cookieAuth, logMeal);
router.put("/:id", cookieAuth, updateMeal);
router.delete("/:id", cookieAuth, deleteMeal);

export default router;
