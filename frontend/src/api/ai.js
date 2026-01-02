import apiClient from "./apiClient";

const API = apiClient;

export const generatePlan = (params) => API.post("/ai/generate-plan", params);
export const getPlans = () => API.get("/ai/plans");
export const deletePlan = (planId) => API.delete(`/ai/plans/${planId}`);
