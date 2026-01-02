import apiClient from "./apiClient";

console.log('🔍 AUTH API Configuration:');
console.log('  VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('  Expected: http://localhost:8080/api/v1');

const API = apiClient;

// Auth endpoints
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me"); // No token needed, uses cookies
export const logout = () => API.post("/auth/logout");
export const refreshToken = () => API.post("/auth/refresh");
