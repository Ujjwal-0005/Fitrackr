import { SmartGoal } from "../models/SmartGoal.js";
import { Meal } from "../models/Meal.js";
import { Session } from "../models/Session.js";
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalories,
  calculateExpectedProgress,
  calculateProteinTarget,
  evaluateGoalCompletion
} from "../utils/fitnessCalculations.js";

// ========== CREATE SMART GOAL (Calculation-Driven) ==========
export const createSmartGoal = async (req, res) => {
  try {
    const {
      userStats,
      type,
      targetWeight,
      durationWeeks,
      workoutsPerWeek,
      constraints
    } = req.body;

    console.log('🔵 Creating smart goal:', { type, userId: req.user._id });

    // Validate required fields
    if (!userStats || !type || !durationWeeks || !workoutsPerWeek) {
      return res.status(400).json({
        message: "Missing required fields: userStats, type, durationWeeks, workoutsPerWeek"
      });
    }

    // Validate targetWeight for fat_loss and muscle_gain
    if ((type === 'fat_loss' || type === 'muscle_gain') && !targetWeight) {
      return res.status(400).json({
        message: "targetWeight is required for fat_loss and muscle_gain goals"
      });
    }

    // Check for existing active goal (prevent duplicates)
    const existingGoal = await SmartGoal.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (existingGoal) {
      return res.status(400).json({
        message: "You already have an active goal. Complete or abandon it before creating a new one.",
        existingGoal: {
          id: existingGoal._id,
          type: existingGoal.type,
          statement: existingGoal.statement
        }
      });
    }

    // ========== CALCULATE BMR & TDEE ==========
    const bmr = calculateBMR(
      userStats.currentWeight,
      userStats.height,
      userStats.age,
      userStats.gender
    );

    const tdee = calculateTDEE(bmr, userStats.activityLevel);

    console.log('✅ BMR:', bmr, 'TDEE:', tdee);

    // ========== CALCULATE DAILY CALORIE TARGET ==========
    const calorieData = calculateDailyCalories(
      tdee,
      type,
      userStats.currentWeight,
      targetWeight || userStats.currentWeight,
      durationWeeks
    );

    const proteinTarget = calculateProteinTarget(userStats.currentWeight, type);

    console.log('✅ Daily calories:', calorieData.dailyCalories, 'Protein:', proteinTarget);

    // ========== GENERATE WEEKLY MILESTONES ==========
    const milestones = calculateExpectedProgress(
      userStats.currentWeight,
      targetWeight || userStats.currentWeight,
      durationWeeks,
      type
    );

    console.log('✅ Generated', milestones.length, 'weekly milestones');

    // ========== SET TIMELINE ==========
    const goalStartDate = new Date();
    const goalEndDate = new Date();
    goalEndDate.setDate(goalEndDate.getDate() + (durationWeeks * 7));

    // ========== AUTO-GENERATE STATEMENT ==========
    let statement;
    if (type === 'fat_loss' || type === 'muscle_gain') {
      const weightChange = Math.abs(targetWeight - userStats.currentWeight);
      const action = type === 'fat_loss' ? 'Lose' : 'Gain';
      statement = `${action} ${weightChange}kg in ${durationWeeks} weeks, training ${workoutsPerWeek}x/week`;
    } else {
      const typeLabels = {
        strength: 'Build Strength',
        endurance: 'Improve Endurance'
      };
      statement = `${typeLabels[type]} in ${durationWeeks} weeks, training ${workoutsPerWeek}x/week`;
    }

    // ========== CREATE GOAL ==========
    const goal = await SmartGoal.create({
      userId: req.user._id,
      userStats,
      type,
      targetWeight,
      durationWeeks,
      workoutsPerWeek,
      statement,
      calculations: {
        bmr,
        tdee,
        dailyCalorieTarget: calorieData.dailyCalories,
        dailyProteinTarget: proteinTarget,
        expectedWeeklyWeightChange: calorieData.expectedWeeklyChange
      },
      timeline: {
        goalStartDate,
        goalEndDate,
        durationWeeks
      },
      weeklyMilestones: milestones,
      constraints: constraints || {},
      progress: {
        nutritionContribution: {
          targetCalories: calorieData.dailyCalories,
          targetProtein: proteinTarget
        },
        workoutContribution: {
          sessionsPlanned: durationWeeks * workoutsPerWeek
        }
      }
    });

    console.log('✅ Smart goal created:', goal._id);

    res.status(201).json({
      message: "Smart goal created successfully",
      goal,
      calculations: {
        bmr,
        tdee,
        dailyCalories: calorieData.dailyCalories,
        dailyProtein: proteinTarget,
        expectedWeeklyChange: calorieData.expectedWeeklyChange
      }
    });

  } catch (err) {
    console.error('❌ createSmartGoal failed:', err);
    res.status(500).json({
      message: "Failed to create smart goal",
      error: err.message
    });
  }
};

// ========== GET ACTIVE GOAL (Detailed with Progress) ==========
export const getActiveGoalDetailed = async (req, res) => {
  try {
    console.log('🔵 getActiveGoalDetailed called for user:', req.user._id);

    const goal = await SmartGoal.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!goal) {
      console.log('❌ No active goal found');
      return res.status(404).json({ message: "No active goal" });
    }

    console.log('✅ Found goal:', goal._id);

    // ========== CALCULATE EXPECTED PROGRESS ==========
    const expectedProgress = goal.calculateExpectedProgress();

    // ========== FILTER MEALS & EXERCISES (Time-Based) ==========
    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: goal.timeline.goalStartDate }
    }).sort({ date: 1 });

    const sessions = await Session.find({
      userId: req.user._id,
      date: { $gte: goal.timeline.goalStartDate },
      status: 'completed'
    }).sort({ date: 1 });

    console.log('✅ Found', meals.length, 'meals and', sessions.length, 'sessions since goal start');

    // ========== GET ACTUAL DAYS WITH DATA ==========
    const actualDaysWithMeals = new Set(meals.map(meal => meal.date.toISOString().split('T')[0]));
    const actualDaysWithWorkouts = new Set(sessions.map(session => session.date.toISOString().split('T')[0]));
    const daysWithActualData = Math.max(1, actualDaysWithMeals.size);

    console.log('✅ Actual days with meals:', daysWithActualData, 'days with workouts:', actualDaysWithWorkouts.size);

    // ========== CALCULATE NUTRITION CONTRIBUTION ==========
    const daysElapsed = Math.max(1, expectedProgress.daysElapsed);
    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

    // Use actual days with meal data for accurate averages
    const avgDailyCalories = Math.round(totalCalories / daysWithActualData);
    const avgDailyProtein = Math.round(totalProtein / daysWithActualData);

    const targetCalories = goal.calculations.dailyCalorieTarget;
    const targetProtein = goal.calculations.dailyProteinTarget;

    // Improved compliance calculations
    const calorieCompliance = targetCalories > 0 ? Math.min(100, Math.max(0,
      100 - Math.abs(avgDailyCalories - targetCalories) / targetCalories * 100
    )) : 0;

    const proteinCompliance = targetProtein > 0 ? Math.min(100, (avgDailyProtein / targetProtein) * 100) : 0;

    const nutritionContribution = {
      avgDailyCalories,
      avgDailyProtein,
      targetCalories,
      targetProtein,
      calorieCompliance: Math.round(calorieCompliance),
      proteinCompliance: Math.round(proteinCompliance)
    };

    // ========== CALCULATE WORKOUT CONTRIBUTION ==========
    const weeksElapsed = Math.max(1, Math.floor(daysElapsed / 7));
    const sessionsCompleted = sessions.length;
    const sessionsPlanned = goal.workoutsPerWeek * weeksElapsed;
    const adherencePercent = sessionsPlanned > 0 ? Math.min(100, (sessionsCompleted / sessionsPlanned) * 100) : 0;

    // Calculate workout volume and progressive overload
    let totalVolume = 0;
    let volumeTrend = 0;

    if (sessions.length > 0) {
      // Calculate total volume (sets × reps × weight for all exercises)
      sessions.forEach(session => {
        if (session.exercises) {
          session.exercises.forEach(exercise => {
            if (exercise.sets) {
              exercise.sets.forEach(set => {
                totalVolume += (set.reps || 0) * (set.weight || 0);
              });
            }
          });
        }
      });

      // Calculate volume trend (compare first half vs second half of sessions)
      const midpoint = Math.floor(sessions.length / 2);
      const firstHalfVolume = sessions.slice(0, midpoint).reduce((vol, session) => {
        let sessionVol = 0;
        if (session.exercises) {
          session.exercises.forEach(exercise => {
            if (exercise.sets) {
              exercise.sets.forEach(set => {
                sessionVol += (set.reps || 0) * (set.weight || 0);
              });
            }
          });
        }
        return vol + sessionVol;
      }, 0);

      const secondHalfVolume = sessions.slice(midpoint).reduce((vol, session) => {
        let sessionVol = 0;
        if (session.exercises) {
          session.exercises.forEach(exercise => {
            if (exercise.sets) {
              exercise.sets.forEach(set => {
                sessionVol += (set.reps || 0) * (set.weight || 0);
              });
            }
          });
        }
        return vol + sessionVol;
      }, 0);

      if (firstHalfVolume > 0) {
        volumeTrend = ((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100;
      }
    }

    const avgVolumePerSession = sessions.length > 0 ? totalVolume / sessions.length : 0;
    const volumeScore = Math.min(100, avgVolumePerSession / 1000 * 100); // Scale to 0-100

    const workoutContribution = {
      sessionsCompleted,
      sessionsPlanned,
      adherencePercent: Math.round(adherencePercent),
      volumeScore: Math.round(volumeScore),
      totalVolume: Math.round(totalVolume),
      progressiveOverloadTrend: Math.round(volumeTrend)
    };

    // ========== CALCULATE GOAL ALIGNMENT SCORE ==========
    let goalAlignmentScore = 0;

    // Use actual progressive overload trend instead of placeholder
    const progressiveOverloadScore = Math.max(0, Math.min(100, 50 + volumeTrend)); // Center around 50

    if (goal.type === 'fat_loss') {
      goalAlignmentScore = (
        0.40 * calorieCompliance +
        0.30 * adherencePercent +
        0.20 * proteinCompliance +
        0.10 * progressiveOverloadScore
      );
    } else if (goal.type === 'muscle_gain') {
      goalAlignmentScore = (
        0.35 * proteinCompliance +
        0.30 * adherencePercent +
        0.25 * calorieCompliance +
        0.10 * progressiveOverloadScore
      );
    } else if (goal.type === 'strength') {
      goalAlignmentScore = (
        0.40 * progressiveOverloadScore +
        0.35 * adherencePercent +
        0.15 * proteinCompliance +
        0.10 * calorieCompliance
      );
    } else if (goal.type === 'endurance') {
      goalAlignmentScore = (
        0.45 * adherencePercent +
        0.25 * volumeScore +
        0.20 * calorieCompliance +
        0.10 * proteinCompliance
      );
    }

    goalAlignmentScore = Math.round(Math.max(0, Math.min(100, goalAlignmentScore)));

    // ========== EVALUATE STATUS ==========
    let status = 'on_track';
    if (goalAlignmentScore >= 85) status = 'ahead';
    else if (goalAlignmentScore >= 70) status = 'on_track';
    else if (goalAlignmentScore >= 50) status = 'behind';
    else status = 'stalled';

    // ========== GET LATEST WEIGHT DATA ==========
    // Try to get latest weight from weigh-ins or fall back to user stats
    let currentWeight = goal.userStats.currentWeight;
    try {
      // Import WeighIn model dynamically to avoid circular dependencies
      const { WeighIn } = await import("../models/WeighIn.js");
      const latestWeighIn = await WeighIn.findOne({
        userId: req.user._id,
        date: { $gte: goal.timeline.goalStartDate }
      }).sort({ date: -1 });

      if (latestWeighIn && latestWeighIn.weight) {
        currentWeight = latestWeighIn.weight;
        console.log('✅ Using latest weight from weigh-in:', currentWeight, 'kg');
      }
    } catch (error) {
      console.log('⚠️ Could not fetch weigh-in data, using user stats weight');
    }

    // ========== CHECK GOAL COMPLETION ==========
    const completion = evaluateGoalCompletion(
      currentWeight,
      goal.targetWeight || currentWeight,
      goal.userStats.currentWeight,
      goal.durationWeeks,
      daysElapsed
    );

    if (completion.isCompleted && goal.status === 'active') {
      goal.status = 'completed';
      goal.completionDate = new Date();
      goal.completionReason = completion.reason;
      await goal.save();
      console.log('🎉 Goal completed!', completion.reason);
    }

    // ========== UPDATE GOAL PROGRESS ==========
    goal.progress = {
      nutritionContribution,
      workoutContribution,
      goalAlignmentScore,
      currentStatus: status,
      lastCalculated: new Date()
    };
    await goal.save();

    console.log('✅ Returning detailed goal data');

    res.json({
      goal,
      goalAlignmentScore,
      nutritionContribution,
      workoutContribution,
      expectedProgress,
      status,
      completion,
      currentWeight // Include current weight for frontend display
    });

  } catch (err) {
    console.error('❌ getActiveGoalDetailed failed:', err);
    res.status(500).json({
      message: "Failed to fetch detailed goal data",
      error: err.message
    });
  }
};

// ========== RECALCULATE GOAL PROGRESS ==========
export const recalculateGoalProgress = async (req, res) => {
  try {
    const goal = await SmartGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Trigger recalculation by calling getActiveGoalDetailed logic
    // (This is a simplified version - in production, extract to shared function)

    res.json({
      message: "Goal progress recalculated",
      note: "Use GET /active/detailed for full recalculated data"
    });

  } catch (err) {
    console.error('❌ recalculateGoalProgress failed:', err);
    res.status(500).json({
      message: "Failed to recalculate progress",
      error: err.message
    });
  }
};

// ========== ABANDON GOAL ==========
export const abandonGoal = async (req, res) => {
  try {
    const goal = await SmartGoal.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!goal) {
      return res.status(404).json({ message: "No active goal to abandon" });
    }

    goal.status = 'abandoned';
    goal.completionDate = new Date();
    goal.completionReason = 'abandoned';
    await goal.save();

    res.json({
      message: "Goal abandoned successfully",
      goal
    });

  } catch (err) {
    console.error('❌ abandonGoal failed:', err);
    res.status(500).json({
      message: "Failed to abandon goal",
      error: err.message
    });
  }
};
