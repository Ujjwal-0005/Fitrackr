/**
 * Helper functions for identifying and handling bodyweight exercises
 */

// List of bodyweight exercises that use time-based tracking
export const BODYWEIGHT_EXERCISES = [
    'brisk walk',
    'walking',
    'brisk walking',
    'jumping jacks',
    'burpees',
    'mountain climbers',
    'bodyweight squat',
    'squats',
    'air squats',
    'lunges',
    'plank',
    'planks',
    'bicycle crunch',
    'crunches',
    'push up',
    'pushups',
    'push-ups',
    'stretching',
    'yoga',
    'band row',
    'resistance band',
    'high knees',
    'jump rope',
    'skipping',
    'pull up',
    'pullups',
    'pull-ups',
    'sit ups',
    'sit-ups',
    'leg raises'
];

/**
 * Check if an exercise is bodyweight/time-based
 * @param {string} exerciseName - Name of the exercise
 * @returns {boolean} True if exercise is bodyweight
 */
export const isBodyweightExercise = (exerciseName) => {
    if (!exerciseName) return false;

    const nameLower = exerciseName.toLowerCase().trim();
    return BODYWEIGHT_EXERCISES.some(bw =>
        nameLower.includes(bw) || bw.includes(nameLower)
    );
};

export default {
    BODYWEIGHT_EXERCISES,
    isBodyweightExercise
};
