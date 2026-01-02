import express from "express";
import { cookieAuth } from "../middleware/authmiddleware.js";
import {
    generateMealPlan,
    getMealPlanHistory,
    getMealPlanById,
    deleteMealPlan,
    getMealPlanPdf
} from "../controllers/mealPlannerController.js";

const router = express.Router();

// All routes require authentication
router.use(cookieAuth);

// Generate new meal plan
router.post("/generate", generateMealPlan);

// Get meal plan history
router.get("/history", getMealPlanHistory);

// Get specific meal plan
router.get("/:planId", getMealPlanById);

// Delete meal plan
router.delete("/:planId", deleteMealPlan);

// Get meal plan as PDF
router.get("/:planId/pdf", getMealPlanPdf);

export default router;
