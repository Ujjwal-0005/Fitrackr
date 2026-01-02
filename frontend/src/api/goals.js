import apiClient from "./apiClient";

const API = apiClient;

export const getGoalProgress = async () => {
  return API.get("/goals/progress");
};
