import apiClient from "./apiClient";

// ✅ Use centralized API client with cookie-based auth
const API = apiClient;

// CalorieNinjas AI-powered nutrition tracking
export const logMealWithAI = async (mealData) => {
  return API.post("/nutrition/log-meal", mealData);
};

export const getDailySummary = async (date) => {
  return API.get(`/nutrition/daily-summary?date=${date}`);
};

export const getMyMeals = (date) => API.get(`/nutrition${date ? `?date=${date}` : ""}`);
export const logMeal = (data) => API.post("/nutrition", data);
export const updateMeal = (id, data) => API.put(`/nutrition/${id}`, data);
export const deleteMeal = (id) => API.delete(`/nutrition/${id}`);
