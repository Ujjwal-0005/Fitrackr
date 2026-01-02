import { SmartGoal } from "../models/SmartGoal.js";
import { Meal } from "../models/Meal.js";
import { Session } from "../models/Session.js";

/**
 * Trigger Smart Goal recalculation after meal/workout logging
 * This updates the goal's progress fields with real data
 */
export const triggerGoalRecalculation = async (userId) => {
    try {
        // Find active goal
        const goal = await SmartGoal.findOne({
            userId,
            status: 'active'
        });

        if (!goal) {
            console.log(`ℹ️  No active goal for user ${userId}`);
            return null;
        }

        console.log(`🔄 Recalculating goal ${goal._id} for user ${userId}`);

        // Calculate expected progress
        const now = new Date();
        const goalStart = new Date(goal.timeline.goalStartDate);
        const goalEnd = new Date(goal.timeline.goalEndDate);
        const totalDuration = goalEnd - goalStart;
        const elapsed = now - goalStart;
        const daysElapsed = Math.max(1, Math.floor(elapsed / (1000 * 60 * 60 * 24)));
        const percentElapsed = Math.min(100, Math.round((elapsed / totalDuration) * 100));

        // ========== FILTER MEALS & WORKOUTS (Time-Based) ==========
        const meals = await Meal.find({
            userId,
            date: { $gte: goal.timeline.goalStartDate }
        });

        const sessions = await Session.find({
            userId,
            date: { $gte: goal.timeline.goalStartDate },
            status: 'completed'
        });

        console.log(`📊 Found ${meals.length} meals and ${sessions.length} sessions since goal start`);

        // ========== CALCULATE NUTRITION CONTRIBUTION ==========
        const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

        const avgDailyCalories = Math.round(totalCalories / daysElapsed);
        const avgDailyProtein = Math.round(totalProtein / daysElapsed);

        const targetCalories = goal.calculations.dailyCalorieTarget;
        const targetProtein = goal.calculations.dailyProteinTarget;

        console.log(`📊 Nutrition Stats:`, {
            totalCalories,
            totalProtein,
            daysElapsed,
            avgDailyCalories,
            avgDailyProtein,
            targetCalories,
            targetProtein
        });

        const calorieCompliance = targetCalories > 0
            ? Math.min(100, Math.max(0, 100 - Math.abs(avgDailyCalories - targetCalories) / targetCalories * 100))
            : 0;
        const proteinCompliance = targetProtein > 0
            ? Math.min(100, (avgDailyProtein / targetProtein) * 100)
            : 0;

        console.log(`✅ Nutrition Compliance: Calories ${Math.round(calorieCompliance)}%, Protein ${Math.round(proteinCompliance)}%`);

        // ========== CALCULATE WORKOUT CONTRIBUTION ==========
        const weeksElapsed = Math.max(1, Math.floor(daysElapsed / 7));
        const sessionsCompleted = sessions.length;
        const sessionsPlanned = goal.workoutsPerWeek * weeksElapsed;
        const adherencePercent = Math.min(100, (sessionsCompleted / sessionsPlanned) * 100);

        // ========== CALCULATE GOAL ALIGNMENT SCORE ==========
        let goalAlignmentScore = 0;
        if (goal.type === 'fat_loss') {
            goalAlignmentScore = (
                0.40 * calorieCompliance +
                0.30 * adherencePercent +
                0.20 * proteinCompliance +
                0.10 * 50 // Placeholder for progressive overload
            );
        } else if (goal.type === 'muscle_gain') {
            goalAlignmentScore = (
                0.35 * proteinCompliance +
                0.30 * adherencePercent +
                0.25 * calorieCompliance +
                0.10 * 50
            );
        } else {
            goalAlignmentScore = (
                0.50 * adherencePercent +
                0.30 * proteinCompliance +
                0.20 * calorieCompliance
            );
        }

        goalAlignmentScore = Math.round(Math.max(0, Math.min(100, goalAlignmentScore)));

        // ========== EVALUATE STATUS ==========
        let status = 'on_track';
        if (goalAlignmentScore >= 85) status = 'ahead';
        else if (goalAlignmentScore >= 70) status = 'on_track';
        else if (goalAlignmentScore >= 50) status = 'behind';
        else status = 'stalled';

        // ========== UPDATE GOAL PROGRESS ==========
        goal.progress = {
            nutritionContribution: {
                avgDailyCalories,
                avgDailyProtein,
                targetCalories,
                targetProtein,
                calorieCompliance: Math.round(calorieCompliance),
                proteinCompliance: Math.round(proteinCompliance)
            },
            workoutContribution: {
                sessionsCompleted,
                sessionsPlanned,
                adherencePercent: Math.round(adherencePercent),
                volumeScore: Math.min(100, adherencePercent),
                progressiveOverloadTrend: 0
            },
            goalAlignmentScore,
            currentStatus: status,
            lastCalculated: new Date()
        };

        await goal.save();

        console.log(`✅ Goal recalculated: Score ${goalAlignmentScore}, Status ${status}`);

        return {
            goalAlignmentScore,
            status,
            nutritionContribution: goal.progress.nutritionContribution,
            workoutContribution: goal.progress.workoutContribution
        };

    } catch (err) {
        console.error(`❌ Goal recalculation failed for user ${userId}:`, err.message);
        return null;
    }
};
