/**
 * Calculate calories burned from exercises
 * @param {Array} exercises - Array of exercises (each with sets, weight, reps, and optional met)
 * @param {Number} weightKg - User body weight in kilograms
 * @param {Number} durationMin - Optional duration in minutes
 * @returns {Number} totalCalories
 */
export const calculateCalories = (exercises = [], weightKg = 70, durationMin = null) => {
  try {
    if (!exercises.length) return 0;

    // Default average MET for moderate weight training
    const defaultMet = 6;

    // Estimate total duration if not passed
    const totalDuration = durationMin || exercises.length * 5; // 5 minutes per exercise average

    let totalCalories = 0;

    for (const ex of exercises) {
      const met = ex.met || defaultMet;

      // Estimate effort: average across sets (reps * weight)
      let setEffort = 0;
      if (Array.isArray(ex.sets)) {
        for (const s of ex.sets) {
          setEffort += (s.reps || 0) * (s.weightKg || 0);
        }
      }

      // Normalize to MET-based calorie estimate
      const exDuration = Math.max(3, (ex.sets?.length || 1) * 2); // min per exercise
      const kcal = (met * 3.5 * weightKg / 200) * exDuration;

      totalCalories += kcal + setEffort * 0.05; // add effort bonus
    }

    // Adjust if overall duration provided
    if (durationMin && totalDuration > 0) {
      totalCalories = (totalCalories / (exercises.length * 5)) * totalDuration;
    }

    return Math.round(totalCalories);
  } catch (err) {
    logger.error("⚠️ calculateCalories failed:", err);
    return 0;
  }
};
