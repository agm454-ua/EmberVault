import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from "axios";
import ENV from '../core/config/env'


interface ApiErrorPayload {
  code: string;
  message: string;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}


export const client: AxiosInstance = axios.create({
  baseURL: ENV.VITE_BASE_API_URL,
  withCredentials: true, // sends cookies (ideal for refresh token)
});

// Attach access token to every request
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 / 403 / 404 responses
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status   = error.response?.status;

    //  404: just let it bubble up normally 
    if (status === 404) {
		// TODO add notification
      return Promise.reject(error);
    }

    //  403: user lacks privilege, do NOT refresh 
    if (status === 403) {
		// TODO add notification
      // Optionally show a toast/notification here
      return Promise.reject(error);
    }

    //  401: attempt refresh 
    if ((status === 401) && !original._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post("/auth/refresh", {}, { withCredentials: true });
        const newToken = data.access_token;

        sessionStorage.setItem("access_token", newToken);
        client.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original); // retry original request

      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem("access_token");
        window.location.href = "/login"; // or use your router's navigate()
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);