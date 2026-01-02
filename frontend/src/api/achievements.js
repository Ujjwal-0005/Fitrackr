import apiClient from "./apiClient";

// ✅ Use centralized API client with cookie-based auth
const API = apiClient;

export const getMyAchievements = () => API.get("/achievements");
export const checkAchievements = () => API.post("/achievements/check");
