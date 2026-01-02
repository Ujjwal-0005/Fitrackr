import apiClient from "./apiClient";

// ✅ Use centralized API client with cookie-based auth
const API = apiClient;

export const getMyPRs = () => API.get("/prs");
export const upsertPR = (data) => API.post("/prs", data);
export const deletePR = (id) => API.delete(`/prs/${id}`);
export const autoDetectPRs = () => API.post("/prs/auto-detect");
