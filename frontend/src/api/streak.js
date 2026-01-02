import apiClient from "./apiClient";

// ✅ Use centralized API client with cookie-based auth
const API = apiClient;

export const getWorkoutStreak = () => API.get("/users/me/streak");
