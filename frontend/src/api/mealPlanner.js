import apiClient from "./apiClient";

// ✅ Use centralized API client with cookie-based auth
const API = apiClient;

// Generate new meal plan
export const generateMealPlan = (preferences) =>
    API.post("/meal-planner/generate", preferences);

// Get meal plan history
export const getMealPlanHistory = (params = {}) =>
    API.get("/meal-planner/history", { params });

// Get specific meal plan
export const getMealPlan = (planId) =>
    API.get(`/meal-planner/${planId}`);

// Delete meal plan
export const deleteMealPlan = (planId) =>
    API.delete(`/meal-planner/${planId}`);

// Download meal plan as PDF (future)
export const downloadMealPlanPdf = (planId) =>
    API.get(`/meal-planner/${planId}/pdf`, { responseType: "blob" });
