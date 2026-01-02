import axios from "axios";

/**
 * Centralized Axios instance with automatic token refresh
 * All API clients should use this instance
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Enable cookie-based authentication
});

/**
 * Request interceptor - Log auth status
 */
apiClient.interceptors.request.use(
    (config) => {
        // Log token presence for debugging
        const cookies = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
        console.log(`🔐 ${config.method?.toUpperCase()} ${config.url}:`, {
            hasAccessTokenCookie: !!cookies,
            withCredentials: config.withCredentials
        });
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle token expiration and auto-refresh
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Log 401 errors for debugging
        if (error.response?.status === 401) {
            console.warn('⚠️ 401 Unauthorized - Cookies may not be set. Check backend auth configuration.');
        }

        // If access token expired, try to refresh
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === "TOKEN_EXPIRED" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                await apiClient.post("/auth/refresh");

                // Retry the original request with new token
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                console.error("Token refresh failed, redirecting to login");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
