import axios from "axios";
import { MealPlan } from "../models/MealPlan.js";

/**
 * POST /api/v1/meal-planner/generate
 * Generates a daily or weekly meal plan using Spoonacular
 */
export const generateMealPlan = async (req, res) => {
    try {
        const {
            duration,          // "day" | "week"
            targetCalories,    // number
            diet,              // optional
            exclude,           // optional array
            cuisine            // optional
        } = req.body;

        const userId = req.user._id;

        // 🔒 Basic validation
        if (!duration || !["day", "week"].includes(duration)) {
            return res.status(400).json({ message: "Invalid duration. Must be 'day' or 'week'" });
        }

        if (!targetCalories || typeof targetCalories !== "number") {
            return res.status(400).json({ message: "targetCalories must be a number" });
        }

        if (targetCalories < 1000 || targetCalories > 5000) {
            return res.status(400).json({ message: "targetCalories must be between 1000 and 5000" });
        }

        if (!process.env.SPOONACULAR_API_KEY) {
            return res.status(500).json({
                message: "Server misconfiguration: Spoonacular API key missing"
            });
        }

        // 🧹 Clean exclude list
        const excludeString =
            Array.isArray(exclude) && exclude.length > 0
                ? exclude.join(",")
                : undefined;

        console.log("📤 Calling Spoonacular API:", {
            timeFrame: duration,
            targetCalories,
            diet,
            exclude: excludeString,
            cuisine
        });

        // 🔗 Spoonacular API request
        const response = await axios.get(
            "https://api.spoonacular.com/mealplanner/generate",
            {
                params: {
                    apiKey: process.env.SPOONACULAR_API_KEY,
                    timeFrame: duration,
                    targetCalories,
                    diet,
                    exclude: excludeString,
                    cuisine
                },
                timeout: 15000
            }
        );

        // 🧠 Normalize response
        const data = response.data;

        let normalized = {
            planId: `sp_${Date.now()}_${userId.toString().slice(-6)}`,
            duration,
            days: [],
            nutrition: {}
        };

        // WEEKLY PLAN
        if (duration === "week" && data.week) {
            normalized.days = Object.entries(data.week).map(
                ([dayName, dayData], index) => ({
                    day: index + 1,
                    name: dayName,
                    meals: dayData.meals.map(meal => ({
                        id: meal.id,
                        title: meal.title,
                        image: `https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`,
                        readyInMinutes: meal.readyInMinutes,
                        servings: meal.servings,
                        sourceUrl: meal.sourceUrl
                    }))
                })
            );

            // Use nutrients from first day as summary
            normalized.nutrition = data.week.monday?.nutrients || {};
        }

        // DAILY PLAN
        if (duration === "day" && data.meals) {
            normalized.days = [
                {
                    day: 1,
                    meals: data.meals.map(meal => ({
                        id: meal.id,
                        title: meal.title,
                        image: `https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`,
                        readyInMinutes: meal.readyInMinutes,
                        servings: meal.servings,
                        sourceUrl: meal.sourceUrl
                    }))
                }
            ];

            normalized.nutrition = data.nutrients || {};
        }

        // Save to database
        const mealPlan = new MealPlan({
            userId,
            planId: normalized.planId,
            duration,
            preferences: {
                targetCalories,
                diet,
                exclude: exclude || [],
                cuisine
            },
            days: normalized.days,
            nutrition: normalized.nutrition
        });

        await mealPlan.save();

        console.log("✅ Meal plan saved:", normalized.planId);

        return res.status(201).json({
            message: "Meal plan generated successfully",
            mealPlan: normalized
        });

    } catch (err) {
        console.error("🔥 Spoonacular error");

        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        } else {
            console.error("Message:", err.message);
        }

        return res.status(500).json({
            message: "Failed to generate meal plan",
            error: err.response?.data?.message || err.message
        });
    }
};

/**
 * GET /api/v1/meal-planner/history
 * Get user's meal plan history
 */
export const getMealPlanHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 10, skip = 0 } = req.query;

        const mealPlans = await MealPlan.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .select("-days"); // Exclude detailed days for list view

        const total = await MealPlan.countDocuments({ userId });

        res.json({
            mealPlans,
            total,
            hasMore: parseInt(skip) + mealPlans.length < total
        });
    } catch (error) {
        console.error("Get meal plan history error:", error);
        res.status(500).json({ message: "Failed to fetch meal plan history" });
    }
};

/**
 * GET /api/v1/meal-planner/:planId
 * Get specific meal plan by ID
 */
export const getMealPlanById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { planId } = req.params;

        const mealPlan = await MealPlan.findOne({ planId, userId });

        if (!mealPlan) {
            return res.status(404).json({ message: "Meal plan not found" });
        }

        res.json(mealPlan);
    } catch (error) {
        console.error("Get meal plan error:", error);
        res.status(500).json({ message: "Failed to fetch meal plan" });
    }
};

/**
 * DELETE /api/v1/meal-planner/:planId
 * Delete meal plan
 */
export const deleteMealPlan = async (req, res) => {
    try {
        const userId = req.user._id;
        const { planId } = req.params;

        const result = await MealPlan.deleteOne({ planId, userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Meal plan not found" });
        }

        res.json({ message: "Meal plan deleted successfully" });
    } catch (error) {
        console.error("Delete meal plan error:", error);
        res.status(500).json({ message: "Failed to delete meal plan" });
    }
};

/**
 * GET /api/v1/meal-planner/:planId/pdf
 * Get meal plan as PDF (placeholder for future implementation)
 */
export const getMealPlanPdf = async (req, res) => {
    try {
        // TODO: Implement PDF generation using Puppeteer or PDFKit
        res.status(501).json({ message: "PDF export coming soon" });
    } catch (error) {
        console.error("PDF generation error:", error);
        res.status(500).json({ message: "Failed to generate PDF" });
    }
};
