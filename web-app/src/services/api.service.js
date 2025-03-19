import axios from "axios";
import useUserStore from "../stores/auth";

const apiURL = import.meta.env.VITE_API_URI
  ? `${import.meta.env.VITE_API_URI}`
  : "http://localhost:4000/api/";

const createAxiosInstance = baseURL => {
  const instance = axios.create({ baseURL });

  // Request interceptor to attach the token
  instance.interceptors.request.use(
    config => {
      const { token } = useUserStore.getState();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error),
  );

  // Response interceptor to handle token refresh
  instance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      const { refreshToken, setToken, setRefreshToken, logout } = useUserStore.getState();

      console.log("Token error:", error);

      // If unauthorized (401) and request is not already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Request new access token
          const { data } = await axios.get(`${apiURL}auth/refresh-token`, {
            headers: { refresh_token: refreshToken },
          });

          console.log("Token refreshed:", data);

          // Update the token in Zustand store
          setToken(data.token);
          setRefreshToken(data.refreshToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return instance(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed", refreshError);

          // If refresh token is invalid or expired, log out the user
          if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
            logout();
            window.location.href = "/"; // Redirect to login page
          }

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

const api = createAxiosInstance(apiURL);

export { api };
