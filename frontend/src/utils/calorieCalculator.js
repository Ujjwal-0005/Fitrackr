/**
 * Calculate calories burned during strength training
 * Based on MET values, body weight, duration, and volume
 * 
 * MET Values:
 * - Light lifting: 3.5
 * - Moderate: 5.0
 * - Heavy/Compound: 6.0
 */

export function calculateCaloriesBurned({
  sets,          // [{ weight, reps, restSec }]
  bodyWeightKg,  // user body weight
  met = 6        // default for heavy lifting
}) {
  if (!sets || sets.length === 0) return 0;
  if (!bodyWeightKg || bodyWeightKg <= 0) bodyWeightKg = 75; // Default fallback

  // Filter out sets with zero weight (no actual work done)
  const validSets = sets.filter(s => (s.weight || 0) > 0 && (s.reps || 0) > 0);

  if (validSets.length === 0) return 0; // No valid sets, no calories

  const totalReps = validSets.reduce((sum, s) => sum + (s.reps || 0), 0);
  const totalSets = validSets.length;
  const totalVolume = validSets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);

  // Estimate duration
  const avgSetTimeSec = 30; // Average time under tension per set
  const avgRestTimeSec = validSets.reduce((sum, s) => sum + (s.restSec || 120), 0) / totalSets || 120;

  const totalTimeSec = totalSets * (avgSetTimeSec + avgRestTimeSec);
  const durationHours = totalTimeSec / 3600;

  // MET-based calories formula: MET × bodyWeight(kg) × duration(hours)
  const metCalories = met * bodyWeightKg * durationHours;

  // Volume-based bonus (rewards heavy lifting)
  const volumeBonus = totalVolume * 0.002;

  const totalCalories = metCalories + volumeBonus;

  return Math.round(totalCalories);
}

/**
 * MET values for common cardio/time-based exercises
 */
const MET_VALUES = {
  // Cardio
  'brisk walk': 3.5,
  'walking': 3.5,
  'jogging': 7.0,
  'running': 8.0,
  'treadmill': 8.0,
  'cycling': 6.8,
  'rowing': 7.0,
  'rower': 7.0,

  // HIIT / High Intensity
  'burpees': 12.0,
  'burpee': 12.0,
  'hiit': 12.0,
  'battle rope': 10.0,
  'mountain climbers': 8.0,
  'mountain climber': 8.0,
  'jumping jacks': 8.0,
  'jumping jack': 8.0,
  'jump rope': 11.0,

  // Bodyweight
  'push up': 8.0,
  'push-up': 8.0,
  'pull up': 8.0,
  'pull-up': 8.0,
  'squat': 5.0,
  'lunge': 6.0,
  'plank': 4.0,

  // Default
  'default_cardio': 6.0,
  'default_strength': 6.0
};

/**
 * Get MET value for an exercise
 */
function getMETValue(exerciseName) {
  if (!exerciseName) return MET_VALUES.default_strength;

  const name = exerciseName.toLowerCase();

  // Check for exact or partial matches
  for (const [key, value] of Object.entries(MET_VALUES)) {
    if (name.includes(key)) {
      return value;
    }
  }

  // Default based on exercise type
  return MET_VALUES.default_strength;
}

/**
 * Calculate calories for a full workout session
 * Supports both time-based (duration) and weight-based exercises
 */
export function calculateSessionCalories(exercises, bodyWeightKg = 75) {
  let totalCalories = 0;

  exercises.forEach(exercise => {
    const completedSets = exercise.setsData?.filter(s => s.completed) || [];

    if (completedSets.length === 0) return;

    const exerciseName = exercise.exerciseId || '';
    const met = getMETValue(exerciseName);

    // Check if this is a time-based exercise (has duration instead of weight)
    const isTimeBased = completedSets.some(s => (s.duration || 0) > 0 && (s.weight || 0) === 0);

    if (isTimeBased) {
      // Time-based calculation: MET × bodyWeight × duration(hours)
      completedSets.forEach(set => {
        const durationSeconds = set.duration || 0;
        const durationHours = durationSeconds / 3600;
        const calories = met * bodyWeightKg * durationHours;
        totalCalories += calories;
      });
    } else {
      // Weight-based calculation (existing logic)
      const validSets = completedSets.filter(s => (s.weight || 0) > 0 && (s.reps || 0) > 0);

      if (validSets.length > 0) {
        const exerciseCalories = calculateCaloriesBurned({
          sets: validSets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            restSec: exercise.restSec || 120
          })),
          bodyWeightKg,
          met
        });

        totalCalories += exerciseCalories;
      }
    }
  });

  return Math.round(totalCalories);
}
