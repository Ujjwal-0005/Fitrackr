import { Meal } from "../models/Meal.js";
import { getNutritionData, validateMealDescription } from "../services/calorieNinjasService.js";
import { triggerGoalRecalculation } from "../utils/goalRecalculation.js";
// @desc  Get all meals for current user (with date filter)
// @route GET /api/v1/nutrition?date=YYYY-MM-DD
// @access Private
export const getMyMeals = async (req, res) => {
  try {
    const { date } = req.query;
    const query = { userId: req.user._id };

    if (date) {
      // FIX: Ensure consistent timezone handling (UTC)
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      query.date = { $gte: start, $lte: end };
    }

    const meals = await Meal.find(query).sort({ date: -1 });

    // Calculate daily totals
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({ meals, totals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Log a meal with AI-powered nutrition analysis (CalorieNinjas)
// @route POST /api/v1/nutrition/log-meal
// @access Private
export const logMealWithAI = async (req, res) => {
  try {
    const { meal, date, mealType } = req.body;

    // Validate meal description
    if (!validateMealDescription(meal)) {
      return res.status(400).json({
        message: "Please enter a valid meal description (2-500 characters)"
      });
    }

    console.log('🔵 logMealWithAI called:', { meal, date, mealType, userId: req.user._id });

    // Get nutrition data from CalorieNinjas API
    let nutritionData;
    try {
      nutritionData = await getNutritionData(meal);
      console.log('🟢 Nutrition data from CalorieNinjas:', nutritionData);
    } catch (apiError) {
      console.error('❌ CalorieNinjas API failed:', apiError.message);

      // Return error to user - don't use fallback for accuracy
      return res.status(503).json({
        message: apiError.message || "Nutrition service unavailable. Please try again later."
      });
    }

    // Parse date or use today
    const mealDate = date ? new Date(date) : new Date();

    // Create meal with CalorieNinjas nutrition data
    const newMeal = await Meal.create({
      userId: req.user._id,
      mealType: mealType || "snack", // Use provided mealType or default to snack
      name: meal,
      calories: nutritionData.calories,
      protein: nutritionData.protein,
      carbs: nutritionData.carbs,
      fat: nutritionData.fat,
      date: mealDate,
    });

    console.log('🟢 Meal logged successfully:', newMeal._id);

    // Get daily totals for the date
    const dateStr = mealDate.toISOString().split('T')[0];
    const dailyTotals = await calculateDailyTotals(req.user._id, dateStr);

    // Trigger goal recalculation
    console.log('🔄 Triggering goal recalculation after meal logging...');
    try {
      const recalcResult = await triggerGoalRecalculation(req.user._id);
      if (recalcResult) {
        console.log('✅ Goal recalculation completed:', {
          score: recalcResult.goalAlignmentScore,
          status: recalcResult.status,
          avgCalories: recalcResult.nutritionContribution?.avgDailyCalories,
          avgProtein: recalcResult.nutritionContribution?.avgDailyProtein
        });
      } else {
        console.log('ℹ️  No active goal to recalculate');
      }
    } catch (recalcErr) {
      console.error('❌ Goal recalculation failed:', recalcErr.message);
      // Don't fail the meal logging if recalculation fails
    }

    res.status(201).json({
      message: "Meal logged successfully",
      meal: newMeal,
      dailyTotals,
      itemsAnalyzed: nutritionData.itemsFound,
      rateLimit: req.rateLimitInfo || { limit: 4, used: 1, remaining: 3 }
    });
  } catch (err) {
    console.error('❌ logMealWithAI error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc  Get daily nutrition summary
// @route GET /api/v1/nutrition/daily-summary?date=YYYY-MM-DD
// @access Private
export const getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required (YYYY-MM-DD)" });
    }

    const totals = await calculateDailyTotals(req.user._id, date);

    res.json({
      date,
      ...totals
    });
  } catch (err) {
    console.error('❌ getDailySummary error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to calculate daily totals
async function calculateDailyTotals(userId, dateStr) {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);

  const meals = await Meal.find({
    userId,
    date: { $gte: start, $lte: end }
  });

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Round to 1 decimal
  return {
    calories: Math.round(totals.calories * 10) / 10,
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    mealCount: meals.length
  };
}

// @desc  Log a meal (original function - kept for backward compatibility)
// @route POST /api/v1/nutrition
// @access Private
export const logMeal = async (req, res) => {
  try {
    const { mealType, name, date, calories, protein, carbs, fat } = req.body;

    // Validate required fields
    if (!mealType || !name) {
      return res.status(400).json({
        message: "mealType and name are required"
      });
    }

    // Require explicit nutrition values - no fallback estimates
    if (calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
      return res.status(400).json({
        message: "Please provide calories, protein, carbs, and fat values. Use /log-meal endpoint for AI-powered analysis."
      });
    }

    const meal = await Meal.create({
      userId: req.user._id,
      mealType,
      name,
      calories,
      protein,
      carbs,
      fat,
      date: date || new Date(),
    });

    console.log('✅ Manual meal logged:', meal._id);

    // Trigger goal recalculation
    try {
      await triggerGoalRecalculation(req.user._id);
    } catch (recalcErr) {
      console.error('❌ Goal recalculation failed:', recalcErr.message);
      // Don't fail the meal logging if recalculation fails
    }

    res.status(201).json({
      message: "Meal logged",
      meal
    });
  } catch (err) {
    console.error('❌ logMeal error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc  Update a meal
// @route PUT /api/v1/nutrition/:id
// @access Private
export const updateMeal = async (req, res) => {
  try {
    // FIX: Prevent mass assignment vulnerability
    // Only allow specific fields to be updated
    const { name, mealType, date, calories, protein, carbs, fat } = req.body;

    const updateData = {
      name,
      mealType,
      date,
      calories,
      protein,
      carbs,
      fat
    };

    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData, // Use sanitized object, not req.body
      { new: true, runValidators: true }
    );

    if (!meal) return res.status(404).json({ message: "Meal not found" });

    // Trigger goal recalculation after meal update
    try {
      await triggerGoalRecalculation(req.user._id);
    } catch (recalcErr) {
      console.error('❌ Goal recalculation failed:', recalcErr.message);
    }

    res.json({ message: "Meal updated", meal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Delete a meal
// @route DELETE /api/v1/nutrition/:id
// @access Private
export const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!meal) return res.status(404).json({ message: "Meal not found" });

    // Trigger goal recalculation after meal deletion
    try {
      await triggerGoalRecalculation(req.user._id);
    } catch (recalcErr) {
      console.error('❌ Goal recalculation failed:', recalcErr.message);
    }

    res.json({ message: "Meal deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
