import apiClient from "./apiClient";

// ✅ Use centralized API client with cookie-based auth
const API = apiClient;

export const getMyTemplates = () => API.get("/templates");
export const getTemplateById = (id) => API.get(`/templates/${id}`);
export const createTemplate = (data) => API.post("/templates", data);
export const updateTemplate = (id, data) => API.put(`/templates/${id}`, data);
export const deleteTemplate = (id) => API.delete(`/templates/${id}`);
export const useTemplate = (id) => API.post(`/templates/${id}/use`);
