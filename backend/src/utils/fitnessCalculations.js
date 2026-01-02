/**
 * Fitness Calculations Utility
 * Core calculation engine for Smart Goal system
 * Uses scientifically-backed formulas for BMR, TDEE, and calorie targets
 */

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in kcal/day
 */
export const calculateBMR = (weight, height, age, gender) => {
    if (!weight || !height || !age || !gender) {
        throw new Error('Missing required parameters for BMR calculation');
    }

    // Mifflin-St Jeor Equation
    const baseBMR = 10 * weight + 6.25 * height - 5 * age;

    if (gender === 'male') {
        return Math.round(baseBMR + 5);
    } else if (gender === 'female') {
        return Math.round(baseBMR - 161);
    } else {
        throw new Error('Gender must be "male" or "female"');
    }
};

/**
 * Calculate Total Daily Energy Expenditure
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - 'sedentary', 'light', 'moderate', or 'high'
 * @returns {number} TDEE in kcal/day
 */
export const calculateTDEE = (bmr, activityLevel) => {
    const activityFactors = {
        sedentary: 1.2,    // Little or no exercise
        light: 1.375,      // Light exercise 1-3 days/week
        moderate: 1.55,    // Moderate exercise 3-5 days/week
        high: 1.725        // Heavy exercise 6-7 days/week
    };

    const factor = activityFactors[activityLevel];
    if (!factor) {
        throw new Error('Invalid activity level. Must be: sedentary, light, moderate, or high');
    }

    return Math.round(bmr * factor);
};

/**
 * Calculate daily calorie target based on goal type
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goalType - 'fat_loss', 'muscle_gain', 'strength', or 'endurance'
 * @param {number} currentWeight - Current weight in kg
 * @param {number} targetWeight - Target weight in kg
 * @param {number} durationWeeks - Goal duration in weeks
 * @returns {object} { dailyCalories, dailyDeficitOrSurplus, expectedWeeklyChange }
 */
export const calculateDailyCalories = (tdee, goalType, currentWeight, targetWeight, durationWeeks) => {
    const CALORIES_PER_KG = 7700; // Approximate calories in 1kg of body weight

    switch (goalType) {
        case 'fat_loss': {
            const totalWeightToLose = currentWeight - targetWeight;
            if (totalWeightToLose <= 0) {
                throw new Error('Target weight must be less than current weight for fat loss');
            }

            const totalCaloriesToBurn = totalWeightToLose * CALORIES_PER_KG;
            const dailyDeficit = Math.round(totalCaloriesToBurn / (durationWeeks * 7));
            const dailyCalories = Math.round(tdee - dailyDeficit);
            const expectedWeeklyChange = -Math.round((dailyDeficit * 7) / CALORIES_PER_KG * 100) / 100;

            // Safety check: don't go below 1200 kcal/day (minimum safe intake)
            const safeDailyCalories = Math.max(dailyCalories, 1200);

            return {
                dailyCalories: safeDailyCalories,
                dailyDeficit,
                expectedWeeklyChange, // negative value (weight loss)
                adjustedForSafety: safeDailyCalories !== dailyCalories
            };
        }

        case 'muscle_gain': {
            const totalWeightToGain = targetWeight - currentWeight;
            if (totalWeightToGain <= 0) {
                throw new Error('Target weight must be greater than current weight for muscle gain');
            }

            // Moderate surplus: 250-400 kcal/day for lean muscle gain
            const dailySurplus = 300; // Middle ground
            const dailyCalories = Math.round(tdee + dailySurplus);
            const expectedWeeklyChange = Math.round((dailySurplus * 7) / CALORIES_PER_KG * 100) / 100;

            return {
                dailyCalories,
                dailySurplus,
                expectedWeeklyChange, // positive value (weight gain)
                adjustedForSafety: false
            };
        }

        case 'strength':
        case 'endurance': {
            // Maintenance calories with emphasis on protein and workout intensity
            return {
                dailyCalories: tdee,
                dailyDeficit: 0,
                dailySurplus: 0,
                expectedWeeklyChange: 0,
                adjustedForSafety: false
            };
        }

        default:
            throw new Error('Invalid goal type. Must be: fat_loss, muscle_gain, strength, or endurance');
    }
};

/**
 * Calculate expected progress milestones
 * @param {number} currentWeight - Current weight in kg
 * @param {number} targetWeight - Target weight in kg
 * @param {number} durationWeeks - Goal duration in weeks
 * @param {string} goalType - Goal type
 * @returns {array} Array of weekly milestones
 */
export const calculateExpectedProgress = (currentWeight, targetWeight, durationWeeks, goalType) => {
    const milestones = [];
    const totalWeightChange = targetWeight - currentWeight;
    const weeklyChange = totalWeightChange / durationWeeks;

    for (let week = 1; week <= durationWeeks; week++) {
        const expectedWeight = Math.round((currentWeight + (weeklyChange * week)) * 10) / 10;
        milestones.push({
            week,
            expectedWeight,
            actualWeight: null, // To be filled as user progresses
            caloriesConsumed: 0,
            caloriesBurned: 0
        });
    }

    return milestones;
};

/**
 * Calculate calories burned using MET (Metabolic Equivalent of Task)
 * @param {number} met - MET value of the exercise
 * @param {number} weight - Body weight in kg
 * @param {number} durationMinutes - Duration in minutes
 * @returns {number} Calories burned
 */
export const calculateMETCalories = (met, weight, durationMinutes) => {
    if (!met || !weight || !durationMinutes) {
        throw new Error('Missing required parameters for MET calculation');
    }

    // Formula: Calories = MET × weight (kg) × duration (hours)
    const durationHours = durationMinutes / 60;
    return Math.round(met * weight * durationHours);
};

/**
 * Evaluate if goal should be marked as completed
 * @param {number} currentWeight - Current weight in kg
 * @param {number} targetWeight - Target weight in kg
 * @param {number} startWeight - Starting weight in kg
 * @param {number} durationWeeks - Total goal duration in weeks
 * @param {number} daysElapsed - Days since goal started
 * @returns {object} { isCompleted, reason, progressPercentage }
 */
export const evaluateGoalCompletion = (currentWeight, targetWeight, startWeight, durationWeeks, daysElapsed) => {
    const totalWeightChange = targetWeight - startWeight;
    const actualWeightChange = currentWeight - startWeight;

    // Calculate progress percentage
    const progressPercentage = totalWeightChange !== 0
        ? Math.round((actualWeightChange / totalWeightChange) * 100)
        : 0;

    // Check if target weight reached
    const targetReached = Math.abs(currentWeight - targetWeight) <= 0.5; // Within 0.5kg

    // Check if duration ended
    const durationEnded = daysElapsed >= (durationWeeks * 7);

    // Completion criteria
    if (targetReached) {
        return {
            isCompleted: true,
            reason: 'target_reached',
            progressPercentage: 100
        };
    }

    if (durationEnded && progressPercentage >= 90) {
        return {
            isCompleted: true,
            reason: 'duration_ended_success',
            progressPercentage
        };
    }

    if (durationEnded && progressPercentage < 90) {
        return {
            isCompleted: true,
            reason: 'duration_ended_incomplete',
            progressPercentage
        };
    }

    return {
        isCompleted: false,
        reason: 'in_progress',
        progressPercentage
    };
};

/**
 * Calculate recommended protein intake based on goal type
 * @param {number} weight - Body weight in kg
 * @param {string} goalType - Goal type
 * @returns {number} Daily protein in grams
 */
export const calculateProteinTarget = (weight, goalType) => {
    const proteinMultipliers = {
        fat_loss: 2.2,      // Higher protein to preserve muscle during deficit
        muscle_gain: 2.0,   // High protein for muscle synthesis
        strength: 1.8,      // Moderate-high for strength gains
        endurance: 1.4      // Moderate for endurance athletes
    };

    const multiplier = proteinMultipliers[goalType] || 1.6;
    return Math.round(weight * multiplier);
};

export default {
    calculateBMR,
    calculateTDEE,
    calculateDailyCalories,
    calculateExpectedProgress,
    calculateMETCalories,
    evaluateGoalCompletion,
    calculateProteinTarget
};
