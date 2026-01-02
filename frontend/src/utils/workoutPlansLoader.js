import fatLossPlans from "../../../backend/dataset/fat_loss.json";
import muscleGainPlans from "../../../backend/dataset/muscle_gain.json";
import strengthPlans from "../../../backend/dataset/strength.json";
import endurancePlans from "../../../backend/dataset/endurance.json";

// Combine all plans into one array
const allPlans = [
    ...fatLossPlans,
    ...muscleGainPlans,
    ...strengthPlans,
    ...endurancePlans
];

/**
 * Get a single plan by goal and difficulty level
 * Returns exactly ONE plan (not an array)
 */
export const getPlanByGoalAndLevel = (goal, level) => {
    return allPlans.find(plan => plan.goal === goal && plan.level === level);
};

/**
 * Get all plans for a specific goal (3 difficulty levels)
 */
export const getPlansByGoal = (goal) => {
    return allPlans.filter(plan => plan.goal === goal);
};

/**
 * Get all available plans
 */
export const getAllPlans = () => {
    return allPlans;
};

export default {
    getPlanByGoalAndLevel,
    getPlansByGoal,
    getAllPlans
};
