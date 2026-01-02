import apiClient from "./apiClient";

const API = apiClient;

export const createCustomSession = async (sessionData) => {
    const response = await API.post("/custom-sessions", sessionData);
    return response.data;
};

export const getCustomSessions = async (goalId = null) => {
    const url = goalId ? `/custom-sessions?goalId=${goalId}` : "/custom-sessions";
    const response = await API.get(url);
    return response.data;
};

export const getCustomSession = async (id) => {
    const response = await API.get(`/custom-sessions/${id}`);
    return response.data;
};

export const updateCustomSession = async (id, sessionData) => {
    const response = await API.put(`/custom-sessions/${id}`, sessionData);
    return response.data;
};

export const deleteCustomSession = async (id) => {
    const response = await API.delete(`/custom-sessions/${id}`);
    return response.data;
};

export const startCustomSession = async (id, forceStart = false) => {
    console.log('🔵 Frontend: Starting custom session', { id, forceStart });
    const response = await API.post(`/custom-sessions/${id}/start`, { forceStart });
    console.log('✅ Frontend: Session started successfully', response.data);
    return response.data;
};

export const getGoalDefaults = async (goalId = null) => {
    const url = goalId ? `/custom-sessions/defaults?goalId=${goalId}` : `/custom-sessions/defaults`;
    const response = await API.get(url);
    return response.data;
};
