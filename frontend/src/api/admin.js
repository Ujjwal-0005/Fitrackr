// frontend/src/api/admin.js
import apiClient from "./apiClient";

const API = apiClient;

/* -------------------- USERS -------------------- */
export const getAllUsers = () => API.get("/users");

// ✅ FIX: this is the missing function
export const getUsersProgress = () => API.get("/users-progress");

/* -------------------- EXERCISES -------------------- */
export const getAllExercises = () => API.get("/exercises");
export const addExercise = (data) => API.post("/exercises", data);
export const updateExercise = (id, data) => API.put(`/exercises/${id}`, data);
export const deleteExercise = (id) => API.delete(`/exercises/${id}`);

/* -------------------- ADMIN -------------------- */
export const adminGetExercises = () => API.get("/exercises");
export const adminDeleteExercise = async (id) => {
    try {
        return await API.delete(`/exercises/${id}`);
    } catch (err) {
        console.error("DELETE /exercises/:id failed", {
            status: err.response?.status,
            data: err.response?.data,
            url: err.config?.url,
            headers: err.config?.headers,
        });
        throw err;
    }
};
