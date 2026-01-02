// frontend/src/api/exercises.js
import apiClient from "./apiClient";

const API = apiClient;

export const getExercises = async () => {
  return API.get("/exercises");
};

// Admin-only exercise CRUD endpoints
export const createExercise = (data) =>
  API.post("/exercises", data);

export const updateExercise = (id, data) =>
  API.put(`/exercises/${id}`, data);

export const deleteExercise = (id) =>
  API.delete(`/exercises/${id}`);
