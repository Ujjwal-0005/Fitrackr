import apiClient from "./apiClient";

const API = apiClient;

export const startSession = async (planId, sessionIndex) => {
  const response = await API.post("/smart-sessions/start", { planId, sessionIndex });
  return response.data;
};

export const logSet = async (sessionId, exerciseIndex, setData) => {
  const response = await API.post("/smart-sessions/log-set", { sessionId, exerciseIndex, setData });
  return response.data;
};

export const completeSession = async (sessionId, data) => {
  const response = await API.post("/smart-sessions/complete", { sessionId, ...data });
  return response.data;
};

export const getSessionHistory = async () => {
  const response = await API.get("/smart-sessions/history");
  return response.data;
};

export const getExerciseProgression = async (exerciseId) => {
  const response = await API.get(`/smart-sessions/progression/${exerciseId}`);
  return response.data;
};
