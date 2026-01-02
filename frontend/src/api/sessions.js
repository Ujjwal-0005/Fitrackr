// frontend/src/api/sessions.js
import apiClient from "./apiClient";

const API = apiClient;

// ✅ Start a new session
export const startSession = async () => {
  return API.post("/sessions");
};

// ✅ Add an exercise to current session
export const addExercise = async (data) => {
  if (!data.sessionId) {
    console.error('❌ addExercise - sessionId is required');
    throw new Error("sessionId is required for addExercise");
  }
  console.log('🔵 addExercise API call:', data);
  return API.post("/sessions/add-exercise", data);
};

// ✅ Add a new set
export const addSet = async (data) => {
  if (!data.sessionId) {
    console.error('❌ addSet - sessionId is required');
    throw new Error("sessionId is required for addSet");
  }
  console.log('🔵 addSet API call:', data);
  return API.post("/sessions/add-set", data);
};

// ✅ Mark a set as completed
export const markSetCompleted = async (data) => {
  if (!data.sessionId) {
    console.error('❌ markSetCompleted - sessionId is required');
    throw new Error("sessionId is required for markSetCompleted");
  }
  return API.post("/sessions/mark-complete", data);
};

// ✅ Conclude a session
export const concludeSession = async (sessionId, data) => {
  if (!sessionId) {
    console.error('❌ concludeSession - sessionId is required');
    throw new Error("sessionId is required for concludeSession");
  }
  console.log('🔵 concludeSession API call:', { sessionId, data });
  return API.put(`/sessions/${sessionId}/conclude`, data);
};


// ✅ Get all user sessions
export const getUserSessions = async () => {
  return API.get("/sessions/my-sessions");
};

// ✅ Get completed days for a specific workout plan
export const getCompletedDays = async (planGoal, planLevel) => {
  return API.get(`/sessions/completed-days?planGoal=${planGoal}&planLevel=${planLevel}`);
};

