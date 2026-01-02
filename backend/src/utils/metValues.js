/**
 * MET (Metabolic Equivalent of Task) values for common exercises
 * Used for time-based calorie calculation
 */

export const BODYWEIGHT_EXERCISES_MET = {
    // Cardio/Walking
    'brisk walk': 3.5,
    'walking': 3.5,
    'brisk walking': 4.0,

    // Bodyweight Cardio
    'jumping jacks': 8.0,
    'burpees': 8.0,
    'mountain climbers': 8.0,
    'high knees': 8.0,
    'jump rope': 12.0,
    'skipping': 12.0,

    // Bodyweight Strength
    'bodyweight squat': 5.0,
    'squats': 5.0,
    'air squats': 5.0,
    'lunges': 4.0,
    'push up': 8.0,
    'pushups': 8.0,
    'push-ups': 8.0,
    'pull up': 8.0,
    'pullups': 8.0,
    'pull-ups': 8.0,

    // Core
    'plank': 4.0,
    'planks': 4.0,
    'bicycle crunch': 5.0,
    'crunches': 5.0,
    'sit ups': 5.0,
    'sit-ups': 5.0,
    'leg raises': 5.0,

    // Stretching/Recovery
    'stretching': 2.5,
    'yoga': 3.0,
    'pilates': 3.0,

    // Resistance Band
    'band row': 3.5,
    'resistance band': 3.5,
    'band exercises': 3.5
};

/**
 * Check if an exercise is bodyweight/time-based
 * @param {string} exerciseName - Name of the exercise
 * @returns {boolean} True if exercise is bodyweight
 */
export const isBodyweightExercise = (exerciseName) => {
    if (!exerciseName) return false;

    const nameLower = exerciseName.toLowerCase().trim();
    return Object.keys(BODYWEIGHT_EXERCISES_MET).some(key =>
        nameLower.includes(key) || key.includes(nameLower)
    );
};

/**
 * Get MET value for an exercise
 * @param {string} exerciseName - Name of the exercise
 * @returns {number|null} MET value or null if not found
 */
export const getMETValue = (exerciseName) => {
    if (!exerciseName) return null;

    const nameLower = exerciseName.toLowerCase().trim();

    // Direct match
    if (BODYWEIGHT_EXERCISES_MET[nameLower]) {
        return BODYWEIGHT_EXERCISES_MET[nameLower];
    }

    // Partial match
    for (const [key, met] of Object.entries(BODYWEIGHT_EXERCISES_MET)) {
        if (nameLower.includes(key) || key.includes(nameLower)) {
            return met;
        }
    }

    return null;
};

/**
 * Calculate calories for bodyweight exercise
 * @param {string} exerciseName - Name of the exercise
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} weight - User's body weight in kg
 * @returns {number} Calories burned
 */
export const calculateBodyweightCalories = (exerciseName, durationMinutes, weight) => {
    const met = getMETValue(exerciseName);
    if (!met) return 0;

    // Formula: Calories = MET × weight (kg) × duration (hours)
    const durationHours = durationMinutes / 60;
    return Math.round(met * weight * durationHours);
};

export default {
    BODYWEIGHT_EXERCISES_MET,
    isBodyweightExercise,
    getMETValue,
    calculateBodyweightCalories
};
