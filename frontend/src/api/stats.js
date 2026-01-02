import apiClient from "./apiClient";

// ✅ Use centralized API client with cookie-based auth
export const fetchOverview = () => apiClient.get("/stats/overview");
export const fetchWeekly = () => apiClient.get("/stats/weekly");
export const fetchMuscleBreakdown = () => apiClient.get("/stats/muscles");
export const fetchSessionsByDate = (date) =>
  apiClient.get(`/stats/sessions-by-date?date=${date}`);
