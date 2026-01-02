import apiClient from "./apiClient";

const API = apiClient;

export const createSmartGoal = async (goalData) => {
  const response = await API.post("/smart-goals", goalData);
  return response.data;
};

export const getActiveGoal = async () => {
  const response = await API.get("/smart-goals/active");
  return response.data;
};

export const adaptGoal = async (goalId, adaptations) => {
  const response = await API.put(`/smart-goals/${goalId}/adapt`, adaptations);
  return response.data;
};

export const getGoalInsights = async (goalId) => {
  const response = await API.get(`/smart-goals/${goalId}/insights`);
  return response.data;
};

// NEW V2 API Functions
export const getActiveGoalDetailed = async () => {
  const response = await API.get("/smart-goals/active/detailed");
  return response.data;
};

export const recalculateGoalProgress = async (goalId) => {
  const response = await API.post(`/smart-goals/${goalId}/recalculate`, {});
  return response.data;
};
