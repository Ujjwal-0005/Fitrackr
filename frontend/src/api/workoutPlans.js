import apiClient from "./apiClient";

// ✅ Use centralized API client
const API = apiClient;

// No auth required for workout plans - they're public
export const getWorkoutPlans = (goal, level) => {
    const params = {};
    if (goal) params.goal = goal;
    if (level) params.level = level;

    return API.get("/workout-plans", { params });
};
