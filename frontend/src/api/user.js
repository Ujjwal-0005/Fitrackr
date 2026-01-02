// src/api/user.js
import apiClient from "./apiClient";

const API = apiClient;

/* -------- Me -------- */
export const getMe = () => API.get("/users/me");

/* -------- Onboarding (basic info) -------- */
export const updateOnboarding = (payload) =>
  API.put("/users/me/onboarding", payload);   // <-- FIXED path

/* -------- Goals -------- */
export const getGoalProgress = () =>
  API.get("/users/me/goals/progress");        // <-- FIXED path

export const upsertGoal = (payload) =>
  API.post("/users/me/goals", payload);       // <-- FIXED path

/* -------- Stats -------- */
export const fetchOverview = () =>
  API.get("/users/me/overview");              // <-- FIXED path

export const fetchWeekly = () =>
  API.get("/users/me/weekly");                // <-- FIXED path

/* -------- Password -------- */
export const changePassword = (payload) =>
  API.put("/users/me/password", payload);     // <-- FIXED path
